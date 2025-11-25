export interface PaymentFrequency {
  id?: number;
  intervalPage: string;
  IntervalType: string; // "Days", "Months", "Years", "Hours", "Minutes"
  IntervalValue: number; // Cantidad del intervalo
}