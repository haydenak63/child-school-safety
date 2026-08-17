export type NotificationChannel = "WHATSAPP";

export type ArrivalNotificationInput = {
  studentName: string;
  schoolName: string;
  time: string;
  gate: string;
  recipient: string;
};

export type DepartureNotificationInput = ArrivalNotificationInput;

export type NotificationDraft = {
  channel: NotificationChannel;
  recipient: string;
  message: string;
  status: "MOCKED" | "SENT" | "FAILED";
};

export interface NotificationProvider {
  sendArrivalNotification(input: ArrivalNotificationInput): Promise<NotificationDraft>;
  sendDepartureNotification(input: DepartureNotificationInput): Promise<NotificationDraft>;
}

export interface NotificationService {
  sendArrivalNotification(input: ArrivalNotificationInput): Promise<NotificationDraft>;
  sendDepartureNotification(input: DepartureNotificationInput): Promise<NotificationDraft>;
}
