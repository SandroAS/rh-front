export default interface NotificationItem {
  uuid: string;
  time: string;
  description: string;
  link: string | null;
  viewed: boolean;
  icon: string;
  color: string;
}
