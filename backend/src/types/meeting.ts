
export interface Meeting {
    id: string;
    title: string;
    startTime: Date;
    endTime: Date;
    location: string;
    notes?: string | null;
    ownerId: string;
    createdAt: Date;
    updatedAt: Date;
}


export interface MeetingData {
    title: string;
    startTime: string;
    endTime: string;
    location: string;
    notes?: string | null;
    ownerId: string | undefined;
}

export interface UpdateMeetingRequest {
    title?: string;
    startTime?: Date;
    endTime?: Date;
    location?: string;
    notes?: string | null;
}

export interface GetMeetingByIdRequest {
    meetingId: string;
}

export interface GetUserMeetingsRequest {
    userId: string;
}