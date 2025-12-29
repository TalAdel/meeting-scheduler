import { CustomError } from "../lib/custom-error";
import MeetingUsersRepository from "../repositories/meeting-users.repository";
import UserRepository from "../repositories/user.repository";
import { AttendingStatus } from "../types/enums";
import { MeetingUser } from "../types/meeting-user";
import MeetingService from "./meeting.service";
import { PoolClient } from "pg";
// import UserService from "./user.service";

class MeetingUserService{

    constructor(private meetingUsersRepository: MeetingUsersRepository, private meetingService: MeetingService, private userRepository: UserRepository){
    }


    async addUserToMeeting(meetingId: string, email: string, status?: AttendingStatus): Promise<MeetingUser> {

        const meeting = await this.meetingService.getMeetingById(meetingId);
        if(!meeting){
            throw new CustomError(404, 'Meeting not found');
        }

        const user = await this.userRepository.findUserByEmail(email);
        if(!user){
            throw new CustomError(404, 'User not found');
        }

        const existingMeetingUser = await this.meetingUsersRepository.findByMeetingIdAndUserId(meetingId, user.id);
        if(existingMeetingUser){
            throw new CustomError(400, 'User already added to meeting');
        }

        const meetingUser = await this.meetingUsersRepository.createMeetingUser(meetingId, user.id, status || AttendingStatus.PENDING);
        if(!meetingUser){
            throw new CustomError(500, 'Failed to add user to meeting');
        }
        return meetingUser;
    }

    async addUsersToMeeting(
        meetingId: string, 
        emails: string[], 
        status?: AttendingStatus,
        client?: PoolClient
    ): Promise<MeetingUser[]> {

        const users = await this.userRepository.findUsersByEmails(emails);
        if(users.length === 0){
            throw new CustomError(404, 'Users not found');
        }

        const meetingUsers = await this.meetingUsersRepository.createMany(
            meetingId,
            users.map(user => user.id),
            status || AttendingStatus.PENDING,
            client
        );
        if(meetingUsers.length === 0){
            throw new CustomError(400, 'emails is not valid');
        }
        return meetingUsers;
    }

    async getAllUserMeetingsByUserId(userId: string): Promise<MeetingUser[]> {

        if(!userId){
            throw new CustomError(400, 'User ID is required');
        }

        const meetings = await this.meetingUsersRepository.findUserMeetingsByUserId(userId);
        if(meetings.length === 0){
            throw new CustomError(404, 'Meetings not found');
        }
        return meetings;
    }

    async updateMeetingUserStatus(meetingId: string, userId: string, status: AttendingStatus): Promise<MeetingUser> {

        const existingMeetingUser = await this.meetingUsersRepository.findByMeetingIdAndUserId(meetingId, userId);
        if(!existingMeetingUser){
            throw new CustomError(404, 'Meeting user not found');
        }

        const updatedMeetingUser = await this.meetingUsersRepository.updateStatus(meetingId, userId, status);
        if(!updatedMeetingUser){
            throw new CustomError(500, 'Failed to update user status');
        }

        return updatedMeetingUser;
    }
}

export default MeetingUserService;
