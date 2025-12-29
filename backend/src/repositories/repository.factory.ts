// import { Pool } from "pg";
// import { IMeetingRepository, IMeetingUsersRepository, IUserRepository } from "../types/repository-intefaces";
// import MeetingRepository from "./meeting.repository";
// import MeetingUsersRepository from "./meeting-users.repository";
// import UserRepository from "./user.repository";

// export class RepositoryFactory {
//     private userRepository: IUserRepository;
//     private meetingRepository: IMeetingRepository;
//     private meetingUsersRepository: IMeetingUsersRepository;

//     constructor(private pool: Pool) {
//         this.userRepository = new UserRepository(this.pool);
//         this.meetingRepository = new MeetingRepository(this.pool);
//         this.meetingUsersRepository = new MeetingUsersRepository(this.pool);
//     }
//     getUserRepository(): IUserRepository {
//         return this.userRepository;
//     }
//     getMeetingRepository(): IMeetingRepository {
//         return this.meetingRepository;
//     }
//     getMeetingUsersRepository(): IMeetingUsersRepository {
//         return this.meetingUsersRepository;
//     }
// }