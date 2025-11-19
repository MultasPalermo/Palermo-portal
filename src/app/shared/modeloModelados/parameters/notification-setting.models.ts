export interface NotificationSetting {
  id?: number;
  name: string;
  days: number;
  description: string;
  timeUnit: 'SECONDS' | 'DAYS';
  active: boolean;
}
