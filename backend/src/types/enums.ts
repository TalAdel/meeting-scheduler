export enum AttendingStatus {
    PENDING = 'pending',
    CONFIRMED = 'confirmed',
    DECLINED = 'declined',
    ATTENDED = 'attended'
  }
  
  export function isValidAttendingStatus(status: string): status is AttendingStatus {
    return Object.values(AttendingStatus).includes(status as AttendingStatus);
  }