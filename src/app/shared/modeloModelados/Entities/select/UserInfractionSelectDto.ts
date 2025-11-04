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
  estado: 'Pendiente' | 'Pagada' | 'Vencida';  // <- mapeo desde bool
}
