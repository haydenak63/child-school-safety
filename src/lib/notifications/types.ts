export type NotificationChannel = "WHATSAPP";

export type AttendanceEventType = "ARRIVAL" | "DEPARTURE";

export type NotificationRecipient = {
  name: string;
  phone: string;
};

/// At least one recipient, so a provider can build a payload without an
/// empty-array fallback and callers cannot dispatch a notification to nobody.
export type NotificationRecipients = [NotificationRecipient, ...NotificationRecipient[]];

export type ArrivalNotificationInput = {
  /** AttendanceEvent id. Stable and unique, so downstream retries stay idempotent. */
  eventId: string;
  studentName: string;
  /** School-assigned student number, shown to parents alongside the name. */
  studentReference: string;
  schoolName: string;
  schoolTimezone: string;
  occurredAt: Date;
  /** Wall-clock label already rendered in the school's timezone, e.g. "08:42 AM". */
  time: string;
  gate: string;
  recipients: NotificationRecipients;
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
