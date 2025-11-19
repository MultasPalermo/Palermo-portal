export interface UserInfractionDto {
  id?: number;
  dateInfraction?: string;
  stateInfraction?: number;
  userId?: number;
  typeInfractionId?: number;
  userNotificationId?: number;
  firstName?: string;
  lastName?: string;
  typeInfractionName?: string;
  documentNumber?: string;
  observations?: string;

  // --- NUEVOS CAMPOS CORRECTOS ---
  smldvAtTheTime?: number;
  daysOfDelay?: number;
  lateFeesAmount?: number;
  totalToPay?: number;
  
  amountToPay?: number;
  smldvValueAtCreation?: number; 
  userEmail?: string;
  paymentDue3Days?: string;
  paymentDue15Days?: string;
  paymentDue25Days?: string;
  paymentDue30Days?: string;
  paymentDue40Days?: string;
  statusCollection?: number;
  isCoactive?: boolean;
  coactiveActivatedOn?: string;
  lastInterestAppliedOn?: string;
  accruedInterest?: number;
  initialAmount?: number;
}
