export type NotificationType = "OVERDUE" | "REQUEST" | "INVENTORY" | "SYSTEM";

export type Notification = {
  id: string;
  type: NotificationType;
  title: string;
  message: string;
  createdAt: string;
  read: boolean;
};
