export interface PaymentFrequency {
  id?: number;
  name: string;
  code: string;
  description?: string;
  daysInterval: number;
}