import { Pool, PoolClient } from "pg";
import { mapRowToMeeting, MeetingRow } from "../types/database";
import { Meeting } from "../types/meeting";

class MeetingRepository{
  constructor(private pool: Pool) {
  }

  /**
   * Creates a meeting using provided database client
   * Can be called with pool (standalone) or client (within transaction)
   */
  async createMeeting(
    title: string, 
    startTime: Date, 
    endTime: Date, 
    location: string, 
    notes: string | null, 
    ownerId: string,
    client?: PoolClient
  ): Promise<Meeting> {
        const dbClient = client || this.pool;
        const createMeetingQuery = `INSERT INTO meetings (title, start_time, end_time, location, notes, owner_id)
                                    VALUES ($1, $2, $3, $4, $5, $6)
                                    RETURNING *`;
        const result = await dbClient.query<MeetingRow>(createMeetingQuery, [title, startTime, endTime, location, notes || null, ownerId]);
    
        if(result.rows.length === 0) {
            throw new Error('Failed to create meeting');
        }
        const meeting = result.rows[0];
        
        return {
        id: meeting.id,
        title: meeting.title,
        startTime: meeting.start_time,
        endTime: meeting.end_time,
        location: meeting.location,
        notes: meeting.notes || undefined,
        ownerId: meeting.owner_id,
        createdAt: meeting.created_at,
        updatedAt: meeting.updated_at,
        };
    }

    async findMeetingById(id: string): Promise<Meeting | null> {
        const findMeetingQuery = 'SELECT * FROM meetings WHERE id =$1';

        const result = await this.pool.query<MeetingRow>(findMeetingQuery, [id]);

        if(result.rows.length === 0) {
            return null;
        }
        const meeting = result.rows[0];

        return {
        id: meeting.id,
        title: meeting.title,
        startTime: meeting.start_time,
        endTime: meeting.end_time,
        location: meeting.location,
        notes: meeting.notes || null,
        ownerId: meeting.owner_id,
        createdAt: meeting.created_at,
        updatedAt: meeting.updated_at,
        };
    }

    async findMeetingsByOwner(ownerId: string): Promise<Meeting[] | null> {
        const query = `
          SELECT id, title, start_time, end_time, location, notes, owner_id, created_at, updated_at
          FROM meetings
          WHERE owner_id = $1
          ORDER BY start_time ASC
        `;

        const result = await this.pool.query<MeetingRow>(query, [ownerId]);

        if(result.rows.length === 0){
            return null;
        }

        return result.rows.map(row => ({
            id: row.id,
            title: row.title,
            startTime: row.start_time,
            endTime: row.end_time,
            location: row.location,
            notes: row.notes || null,
            ownerId: row.owner_id,
            createdAt: row.created_at,
            updatedAt: row.updated_at,
        }));
    }

    /**
     * Finds ALL meetings where the user is involved (as owner OR participant)
     * This is used for the user's home page/dashboard after login
     */
    async findAllUserMeetings(userId: string): Promise<Meeting[]> {
        const query = `
          SELECT DISTINCT m.id, m.title, m.start_time, m.end_time, m.location, 
                 m.notes, m.owner_id, m.created_at, m.updated_at
          FROM meetings m
          LEFT JOIN meeting_users mu ON mu.meeting_id = m.id
          WHERE m.owner_id = $1           -- Meetings user owns
             OR mu.user_id = $1           -- Meetings user is invited to
          ORDER BY m.start_time ASC
        `;

        const result = await this.pool.query<MeetingRow>(query, [userId]);

        return result.rows.map(row => ({
            id: row.id,
            title: row.title,
            startTime: row.start_time,
            endTime: row.end_time,
            location: row.location,
            notes: row.notes || null,
            ownerId: row.owner_id,
            createdAt: row.created_at,
            updatedAt: row.updated_at,
        }));
    }

    async findMeetingsInRange(startDate: Date, endDate: Date): Promise<Meeting[] | null> {
        const findMeetingQuery = `SELECT id, title, start_time, end_time, location, notes, owner_id, created_at, updated_at
                                  FROM meetings
                                  WHERE start_time >= $1 AND end_time <= $2
                                  ORDER BY start_time ASC`;
        const result = await this.pool.query<MeetingRow>(findMeetingQuery, [startDate, endDate]);

        if(result.rows.length === 0){
          return null;
        }

        return result.rows.map(row => ({
          id: row.id,
          title: row.title,
          startTime: row.start_time,
          endTime: row.end_time,
          location: row.location,
          notes: row.notes || null,
          ownerId: row.owner_id,
          createdAt: row.created_at,
          updatedAt: row.updated_at
        }));
    }


   async updateMeeting(id: string,
        updates: Partial<Pick<Meeting, 'title' | 'startTime' | 'endTime' | 'location' | 'notes'>>
       ): Promise<Meeting> {

           const fields: string[] = [];
           const values: any[] = [];
           let paramIndex = 1;

           if(updates.title !== undefined) {
               fields.push(`title = $${paramIndex++}`);
               values.push(updates.title);
           }
           
           if(updates.startTime !== undefined) {
               fields.push(`start_time = $${paramIndex++}`);
               values.push(updates.startTime);
           }

           if(updates.endTime !== undefined) {
               fields.push(`end_time = $${paramIndex++}`);
               values.push(updates.endTime);
           }

           if(updates.location !== undefined) {
               fields.push(`location = $${paramIndex++}`);
               values.push(updates.location);
           }

           if(updates.notes !== undefined) {
               fields.push(`notes = $${paramIndex++}`);
               values.push(updates.notes);
           }

           // If no fields to update, this shouldn't happen
           // Service layer should handle this case
           if(fields.length === 0) {
               throw new Error('No fields provided to update');
           }

           values.push(id);

           const updateMeetingQuery = 
           `UPDATE meetings
               SET ${fields.join(', ')}, updated_at = NOW()
               WHERE id = $${paramIndex}
               RETURNING *`;

           const result = await this.pool.query<MeetingRow>(updateMeetingQuery, values);

           // If UPDATE affected 0 rows, the meeting doesn't exist
           if(result.rows.length === 0) {
               throw new Error(`Meeting with ID ${id} not found`);
           }

           const meeting = result.rows[0];
           return {
               id: meeting.id,
               title: meeting.title,
               startTime: meeting.start_time,
               endTime: meeting.end_time,
               location: meeting.location,
               notes: meeting.notes || null,
               ownerId: meeting.owner_id,
               createdAt: meeting.created_at,
               updatedAt: meeting.updated_at,
           }
       }

        async deleteMeeting(id: string): Promise<boolean> {
            const deleteMeetingQuery = 'DELETE FROM meetings WHERE id = $1';
            const result = await this.pool.query(deleteMeetingQuery, [id]);

            if(result.rowCount === undefined || result.rowCount === null) { 
                throw new Error('DB error: undefined || null delete meeting result');
            }

            return result.rowCount > 0;
        }
        
       async findMeetingsByDate(date: Date): Promise<Meeting[]> {
            const query = `
              SELECT id, title, start_time, end_time, location, notes, owner_id, created_at, updated_at
              FROM meetings
              WHERE start_time::DATE = $1::DATE
              ORDER BY start_time ASC
            `;
        
            const result = await this.pool.query<MeetingRow>(query, [date]);
        
            return result.rows.map(row => mapRowToMeeting(row));
          }

          async hasConflict(
            userId: string, 
            startTime: Date, 
            endTime: Date,
            excludeMeetingId?: string,
            client?: PoolClient
          ): Promise<boolean> {
            const dbClient = client || this.pool;
            // Check for conflicts in meetings where user is either:
            // 1. The owner (owner_id), OR
            // 2. A participant (in meeting_users table)
            const query = `
              SELECT EXISTS (
                SELECT 1 FROM meetings m
                WHERE (
                  m.owner_id = $1                    -- User is the owner
                  OR EXISTS (                         -- OR user is a participant
                    SELECT 1 FROM meeting_users mu
                    WHERE mu.meeting_id = m.id
                      AND mu.user_id = $1
                  )
                )
                AND m.id != COALESCE($4, '00000000-0000-0000-0000-000000000000'::UUID)
                AND tstzrange(m.start_time, m.end_time) && tstzrange($2, $3)
              ) AS has_conflict
            `;
        
            const result = await dbClient.query<{ has_conflict: boolean }>(query, [
              userId,
              startTime,
              endTime,
              excludeMeetingId || null,
            ]);
        
            return result.rows[0].has_conflict;
          }

        async isMeetingExistsAtDateTime(
            meetingDate: string, 
            meetingTime: string, 
            exludeMeetingId?: string
        ): Promise<boolean> {
            let query = `EXSISTS(SELECT 1 FROM meetings WHERE meeting_date = $1 AND meeting_time = $2`;
            const values: any[] = [meetingDate, meetingTime];

            if(exludeMeetingId) {
                query += ` AND id != $3`;
                values.push(exludeMeetingId);
            }

            query += `) as exists`;
            const result = await this.pool.query<{ exists: boolean }>(query, values);

            return result.rows.length > 0 && result.rows[0].exists;
        }
    }

export default MeetingRepository;