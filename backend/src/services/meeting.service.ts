import { CustomError } from "../lib/custom-error";
import MeetingRepository from "../repositories/meeting.repository";
import { Meeting, UpdateMeetingRequest } from "../types/meeting";
import { Pool, PoolClient } from "pg";
import { withTransaction } from "../utils/transaction.utils";
import { AttendingStatus } from "../types/enums";
import { MeetingUser } from "../types/meeting-user";
// import { validateNotInPast } from "../utils/date-validation.utils";
// import { parseDate } from "../utils/date-validation.utils";

// Forward declaration to avoid circular dependency
interface IMeetingUserService {
    addUsersToMeeting(
        meetingId: string,
        emails: string[],
        status?: AttendingStatus,
        client?: PoolClient
    ): Promise<MeetingUser[]>;
}

class MeetingService{
    private meetingUserService?: IMeetingUserService;

    constructor(
        private meetingRepository: MeetingRepository,
        private pool: Pool
    ){
    }

    setMeetingUserService(service: IMeetingUserService): void {
        this.meetingUserService = service;
    }

    async createMeetingWithParticipants(
        title: string,
        startTime: Date,
        endTime: Date,
        location: string,
        notes: string | null,
        ownerId: string,
        emails: string[],
        status?: AttendingStatus
    ): Promise<{ meeting: Meeting; participants: MeetingUser[] }> {
        
        if (!this.meetingUserService) {
            throw new CustomError(500, 'MeetingUserService not initialized');
        }
        const meetingUserService = this.meetingUserService;

        return await withTransaction(this.pool, async (client) => {
            const meeting = await this.createMeeting(
                title,
                startTime,
                endTime,
                location,
                notes,
                ownerId,
                client
            );

            const participants = await meetingUserService.addUsersToMeeting(
                meeting.id,
                emails,
                status,
                client
            );

            return { meeting, participants };
        });
    }

    async createMeeting(
        title: string, 
        startTime: Date, 
        endTime: Date, 
        location: string, 
        notes: string | null, 
        ownerId: string,
        client?: PoolClient
    ): Promise<Meeting>{
        if(await this.meetingRepository.hasConflict(ownerId, startTime, endTime, undefined, client)){
            throw new CustomError(400, 'Meeting time conflicts with existing meetings');
        }
        
        const newMeeting = await this.meetingRepository.createMeeting(title, startTime, endTime, location, notes, ownerId, client);
        return newMeeting;
    }

    async getMeetingById(id: string): Promise<Meeting | null> {

        const meeting = await this.meetingRepository.findMeetingById(id);
        if(!meeting){
            throw new CustomError(404, 'Meeting not found');
        }
        return meeting;
    }


    /**
     * Gets meetings where user is ONLY the owner (not including meetings they're invited to)
     * Usually not needed - use getUserMeetings instead
     */
    async getAllOwnerMeetings(userId: string): Promise<Meeting[] | null> {
        const meetings = await this.meetingRepository.findMeetingsByOwner(userId);
        if(!meetings){
            throw new CustomError(404, 'No meetings found');
        }
        return meetings;
      }

    /**
     * Gets ALL meetings for a user (both owned AND invited to)
     * This is what you want for the home page after sign-in!
     */
    async getUserMeetings(userId: string): Promise<Meeting[]> {
        // This single method uses the JOIN query to get everything!
        const meetings = await this.meetingRepository.findAllUserMeetings(userId);
        
        // Return empty array if no meetings (better UX for new users)
        return meetings;
    }

    //   async getMeetingsInRange(startDate: string, endDate: string): Promise<Meeting[] | null> {
    //     const start = parseDate(startDate, 'startDate');
    //     const end = parseDate(endDate, 'endDate');
    
    //     if (end <= start) {
    //       throw new CustomError(400, 'End date must be after start date');
    //     }
    
    //     const meetings = await this.meetingRepository.findMeetingsInRange(start, end);
    //     if(!meetings){
    //         throw new CustomError(404, 'No meetings found');
    //     }
    //     return meetings;
    // } 

    async updateMeeting(
        meetingId: string,
        userId: string,
        userUpdates: UpdateMeetingRequest
      ): Promise<Meeting> {
        // 1. AUTHORIZE: Check if meeting exists and user owns it
        const existing = await this.meetingRepository.findMeetingById(meetingId);
    
        if (!existing) {
          throw new CustomError(404, 'Meeting not found');
        }
    
        if (existing.ownerId !== userId) {
          throw new CustomError(403, 'You are not authorized to update this meeting');
        }
    
        // 2. CLEAN: Remove undefined fields (keep only fields user wants to update)
        const validUserUpdates = MeetingService.removeUndefined<UpdateMeetingRequest>(userUpdates);
    
        // 3. EARLY RETURN: If no fields to update, return existing meeting
        if (Object.keys(validUserUpdates).length === 0) {
          return existing;
        }
    
        // // 3.5. VALIDATE: When updating times, both must be provided together
        // const isUpdatingStartTime = validUserUpdates.startTime !== undefined;
        // const isUpdatingEndTime = validUserUpdates.endTime !== undefined;
    
        // if (isUpdatingStartTime && !isUpdatingEndTime) {
        //   throw new CustomError(
        //     400,
        //     'When updating startTime, you must also provide endTime to ensure valid meeting duration'
        //   );
        // }
    
        // if (isUpdatingEndTime && !isUpdatingStartTime) {
        //   throw new CustomError(
        //     400,
        //     'When updating endTime, you must also provide startTime to ensure valid meeting duration'
        //   );
        // }
    
        // 4. VALIDATE: Check time constraints BEFORE sending to database
        const finalStartTime = validUserUpdates.startTime ?? existing.startTime;
        const finalEndTime = validUserUpdates.endTime ?? existing.endTime;
    
    
        if (finalEndTime <= finalStartTime) {
          throw new CustomError(
            400,
            'End time must be after start time change it too'
          );
        }
        if(finalStartTime < new Date() || finalEndTime < new Date()){
          throw new CustomError(400, 'Start and end time cannot be in the past');
        }
    
        // 5. CHECK CONFLICTS: Only if time is being updated
        const isTimeBeingUpdated = validUserUpdates.startTime !== undefined || validUserUpdates.endTime !== undefined;
        if (isTimeBeingUpdated) {
          const hasConflict = await this.meetingRepository.hasConflict(
            userId,
            finalStartTime,
            finalEndTime,
            meetingId  // Exclude current meeting from conflict check
          );
          
          if (hasConflict) {
            throw new CustomError(400, 'Updated meeting time conflicts with your existing meetings');
          }
        }
    
        // 6. UPDATE: Express 5 automatically catches async errors
        const updated = await this.meetingRepository.updateMeeting(meetingId, validUserUpdates);
        return updated;
      }

      async deleteMeeting(meetingId: string, userId: string): Promise<void> {
        const meeting = await this.meetingRepository.findMeetingById(meetingId);
    
        if (!meeting) {
          throw new CustomError(404, 'Meeting not found');
        }

        if (meeting.ownerId !== userId) {
          throw new CustomError(403, 'You are not authorized to delete this meeting');
        }
    
        await this.meetingRepository.deleteMeeting(meetingId);
      }

      private static removeUndefined<T>(userUpdates: T): Partial<T> {
        const result: Partial<T> = {};
        for (const currentField in userUpdates) {
          if (userUpdates[currentField as keyof T] !== undefined) {
            result[currentField as keyof T] = userUpdates[currentField as keyof T] as T[keyof T];
          }
        }
        return result;
      } 

    //   async getDailySchedule(userId: string, date: string) {
    //     const searchDate = parseDate(date, 'date');
    
    //     const meetings = await this.meetingRepository.findUserMeetingsByDate(
    //       userId, 
    //       searchDate
    //     );
    
    //     // Calculate total meeting time
    //     const totalMinutes = meetings.reduce((total, meeting) => {
    //       const duration = meeting.endTime.getTime() - meeting.startTime.getTime();
    //       return total + (duration / (1000 * 60));
    //     }, 0);
    
    //     return {
    //       date: searchDate,
    //       meetings,
    //       totalMeetings: meetings.length,
    //       totalHours: (totalMinutes / 60).toFixed(1),
    //       totalMinutes: Math.round(totalMinutes),
    //     };
    //   }
    
    
}

export default MeetingService;