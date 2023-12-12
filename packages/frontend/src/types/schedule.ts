export interface ScheduleType {
    scheduleId?: string;
    employeeName: string;
    workType: string;
    workTime: string;
    paymentMethod: string;
    paymentAmount: number;
    tipMethod: string;
    tipAmount: number;
    createdAt?: string;
    attachment?: string;
    attachmentURL?: string;
  }