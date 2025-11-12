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
  amountToPay?: number;
  smldvValueAtCreation?: number;
  userEmail?: string;
  paymentDue3Days?: string;
  paymentDue15Days?: string;
  paymentDue25Days?: string;
  statusCollection?: number;
}
