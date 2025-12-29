// import { AttendingStatus } from "./enums";
// import { Meeting } from "./meeting";
// import { User, UserWithoutPassword } from "./user";
// import { MeetingUser } from "./meeting-user";


// export interface IUserRepository{
//     createUser(email: string, fullName: string, password: string): Promise<UserWithoutPassword>;
//     findUserById(id: string): Promise<User | null>;
//     findUserByEmail(email: string): Promise<User | null>;
//     findUserWithoutPasswordByEmail(email: string): Promise<UserWithoutPassword | null>;
//     updateUser(id: string, updates: Partial<Pick<User, 'fullName' | 'email' >>): Promise<User | null>;
//     deleteUser(id: string): Promise<boolean>;
//     updatePassword(id: string, password: string): Promise<boolean>;
// }   

// export interface IMeetingRepository{
//     createMeeting(title: string, meetingDate: string, meetingTime: string, location: string, notes: string, ownerId: string): Promise<Meeting>;
//     findMeetingById(id: string): Promise<Meeting | null>;
//     findMeetingsByOwnerId(ownerId: string): Promise<Meeting[] | null>;
//     findMeetingsByDateRange(startDate: string, endDate: string): Promise<Meeting[] | null>;
//     updateMeeting(id: string, updates: Partial<Pick<Meeting, 'title' | 'meetingDate' | 'meetingTime' | 'location' | 'notes' >>): Promise<Meeting | null>;
//     deleteMeeting(id: string): Promise<boolean>;
//     isMeetingExistsAtDateTime(meetingDate: string, meetingTime: string, exludeMeetingId?: string): Promise<boolean>;
// }

// export interface IMeetingUsersRepository{
//     createMeetingUser(meetingId: string, userId: string, status: AttendingStatus): Promise<MeetingUser>;
//     createMany(meetingId: string, userIds: string[], status?: AttendingStatus): Promise<MeetingUser[]>;
//     findByMeetingId(meetingId: string): Promise<MeetingUser[] | null>;
//     findByUserId(userId: string): Promise<MeetingUser[] | null>;
//     findByMeetingIdAndUserId(meetingId: string, userId: string): Promise<MeetingUser | null>;
//     updateStatus(meetingId: string, userId: string, status: AttendingStatus): Promise<MeetingUser | null>;
//     delete(meetingId: string, userId: string): Promise<boolean>;
//     deleteAllByMeetingId(meetingId: string): Promise<boolean>;
// }