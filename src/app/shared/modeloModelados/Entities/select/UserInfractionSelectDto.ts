export interface UserInfractionSelectDto {
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
  tipo: string;                  // <- typeInfractionName
  fecha: Date | string;          // <- dateInfraction
  descripcion: string;           // <- observations
  estado: 'Pendiente' | 'Pagada' | 'Vencida' | 'Con acuerdo';  // <- mapeo desde bool

  // Campos adicionales del UserInfractionDto
  userEmail?: string;
  totalToPay?: number;
  accruedInterest?: number;
  daysOfDelay?: number;
  paymentDue3Days?: string;
  paymentDue15Days?: string;
  paymentDue25Days?: string;
  paymentDue30Days?: string;
  paymentDue40Days?: string;
  isCoactive?: boolean;
  coactiveActivatedOn?: string;
  lastInterestAppliedOn?: string;
  statusCollection?: number;
  numer_smldv?: number;
  smldvValueAtCreation?: number;
  initialAmount?: number;
}
