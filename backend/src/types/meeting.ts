
export interface Meeting {
    id: string;
    title: string;
    startTime: Date;
    endTime: Date;
    location?: string | null;           // Optional address in any language
    locationCountry?: string | null;    // Optional ISO 3166-1 alpha-2 code (e.g., IL, US, FR)
    latitude?: number | null;           // Optional cached latitude
    longitude?: number | null;          // Optional cached longitude
    notes?: string | null;
    ownerId: string;
    createdAt: Date;
    updatedAt: Date;
}


export interface MeetingData {
    title: string;
    startTime: string;
    endTime: string;
    location?: string | null;           // Optional
    locationCountry?: string | null;    // Optional ISO country code
    latitude?: number | null;           // Optional
    longitude?: number | null;          // Optional
    notes?: string | null;
    ownerId: string | undefined;
}

export interface UpdateMeetingRequest {
    title?: string;
    startTime?: Date;
    endTime?: Date;
    location?: string | null;
    locationCountry?: string | null;
    latitude?: number | null;
    longitude?: number | null;
    notes?: string | null;
}

export interface GetMeetingByIdRequest {
    meetingId: string;
}

export interface GetUserMeetingsRequest {
    userId: string;
}