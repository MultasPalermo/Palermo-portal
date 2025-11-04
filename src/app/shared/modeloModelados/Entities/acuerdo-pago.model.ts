export interface AcuerdoPago {
  id?: number;
  numeroAcuerdo?: string;
  descripcion?: string;
  monto?: number;
  fechaCreacion?: Date;
  fechaVencimiento?: Date;
  estado?: 'ACTIVO' | 'VENCIDO' | 'PAGADO' | 'CANCELADO';
  cuotas?: number;
  frecuenciaPago?: string;
  // Propiedades adicionales para el formulario
  agreementDescription?: string;
  isPaid?: boolean;
  neighborhood?: string;
  paymentFrequencyId?: number;
  typePaymentId?: number;
  agreementStart?: Date | string;
  agreementEnd?: Date | string;
  address?: string;
  userInfractionId?: number;
  baseAmount?: number;
  expeditionCedula?: string;
  phoneNumber?: string;
  email?: string;
}