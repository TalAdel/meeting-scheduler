import { Pool, PoolClient } from "pg";
import { MeetingUserRow } from "../types/database";
import { AttendingStatus } from "../types/enums";
import { MeetingUser } from "../types/meeting-user";
import { CustomError } from "../lib/custom-error";


class MeetingUsersRepository{
      constructor(private pool: Pool) {
      }

      async createMeetingUser(meetingId: string, userId: string, status?: AttendingStatus): Promise<MeetingUser> {
        const createMeetingUserQuery = `INSERT INTO meeting_users (meeting_id, user_id, status)
                                        VALUES ($1, $2, $3)
                                        RETURNING *`;

        const values: any[] = [meetingId, userId, status || AttendingStatus.PENDING];
        const result = await this.pool.query<MeetingUserRow>(createMeetingUserQuery, values);

          if(result.rows.length === 0) {
              throw new Error('Failed to create meeting user');
          }

        const meetingUser = result.rows[0];
        return {
          id: meetingUser.id,
          meetingId: meetingUser.meeting_id,
          userId: meetingUser.user_id,
          status: meetingUser.status,
          respondedAt: meetingUser.responded_at,
          createdAt: meetingUser.created_at,
        };
      }

      async createMany(
        meetingId: string, 
        userIds: string[], 
        status?: AttendingStatus,
        client?: PoolClient
      ): Promise<MeetingUser[]> {
        const dbClient = client || this.pool;
        const valuesPlaceholders = userIds
          .map((_, index) => `($1, $${index + 2}, $${userIds.length + 2})`)
          .join(', ');
        
        const createManyQuery = `INSERT INTO meeting_users (meeting_id, user_id, status)
        VALUES ${valuesPlaceholders}
        RETURNING *`;

        const values = [meetingId, ...userIds, status || AttendingStatus.PENDING];
        const result = await dbClient.query<MeetingUserRow>(createManyQuery, values);

            if(result.rows.length === 0) {
                throw new CustomError(500, 'Failed to create many meeting users');
            }

        return result.rows.map(row => ({
          id: row.id,
          meetingId: row.meeting_id,
          userId: row.user_id,
          status: row.status,
          respondedAt: row.responded_at,
          createdAt: row.created_at,
        }));
      }

      async findByMeetingId(meetingId: string): Promise<MeetingUser[]> {
          const findByMeetingIdQuery = `SELECT * FROM meeting_users 
                                        WHERE meeting_id = $1
                                        ORDER BY created_at ASC`;
          const result = await this.pool.query<MeetingUserRow>(findByMeetingIdQuery, [meetingId]);

              if(result.rows.length === 0) {
                return [];
              }

          return result.rows.map(row => ({
            id: row.id,
            meetingId: row.meeting_id,
            userId: row.user_id,
            status: row.status,
            respondedAt: row.responded_at,
            createdAt: row.created_at,
          }));
      }

      async findUserMeetingsByUserId(userId: string): Promise<MeetingUser[]> {
          const findByUserIdQuery = `SELECT * FROM meeting_users 
          WHERE user_id = $1 
          ORDER BY start_time ASC`;

          const result = await this.pool.query<MeetingUserRow>(findByUserIdQuery, [userId]);
      
              if(result.rows.length === 0) {
                  return [];
              }

          return result.rows.map(row => ({
              id: row.id,
              meetingId: row.meeting_id,
              userId: row.user_id,
              status: row.status,
              respondedAt: row.responded_at,
              createdAt: row.created_at,
          }));
      }

      async findByMeetingIdAndUserId(meetingId: string, userId: string): Promise<MeetingUser | null> {
        const findByMeetingOfUserQuery = `SELECT * FROM meeting_users 
                                               WHERE meeting_id = $1 AND user_id = $2`;
        const result = await this.pool.query<MeetingUserRow>(findByMeetingOfUserQuery, [meetingId, userId]);

        if(result.rows.length === 0) {
          return null;
        }

        const meetingUser = result.rows[0];
        return {
          id: meetingUser.id,
          meetingId: meetingUser.meeting_id,
          userId: meetingUser.user_id,
          status: meetingUser.status,
          respondedAt: meetingUser.responded_at,
          createdAt: meetingUser.created_at,
        };
      }

      async updateStatus(meetingId: string, userId: string, status: AttendingStatus): Promise<MeetingUser | null> {
        const updateStatusQuery = 
        `UPDATE meeting_users 
        SET status = $1, responded_at = CURRENT_TIMESTAMP 
        WHERE meeting_id = $2 AND user_id = $3
        RETURNING *`;

        const result = await this.pool.query<MeetingUserRow>(updateStatusQuery, [status, meetingId, userId]);

        if(result.rows.length === 0) {
          return null;
        }

        const meetingUser = result.rows[0];
        return {
          id: meetingUser.id,
          meetingId: meetingUser.meeting_id,
          userId: meetingUser.user_id,
          status: meetingUser.status,
          respondedAt: meetingUser.responded_at,
          createdAt: meetingUser.created_at,
        };
      }

      async delete(meetingId: string, userId: string): Promise<boolean> {
        const deleteMeetingUserQuery = `DELETE FROM meeting_users 
        WHERE meeting_id = $1 AND user_id = $2`;

        const result = await this.pool .query(deleteMeetingUserQuery, [meetingId, userId]);
        if(result.rowCount === undefined || result.rowCount === null){
          throw new CustomError(500, 'DB error: undefined || null delete meeting user result');
        }

        return result.rowCount > 0;
      }

      async deleteAllByMeetingId(meetingId: string): Promise<boolean> {
        const deleteAllQuery = `DELETE FROM meeting_users WHERE meeting_id = $1`;

        const result = await this.pool.query(deleteAllQuery, [meetingId]);
             if( result.rowCount === undefined || result.rowCount === null){
              return false
             }
             return result.rowCount > 0;
      }
}

export default MeetingUsersRepository;