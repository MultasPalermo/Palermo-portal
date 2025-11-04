// ===============================
// 👤 Modelos de Perfil de Usuario
// ===============================

export interface ProfileDto {
  id?: number;
  firstName: string;
  lastName: string;
  email: string;
  phoneNumber?: string;
  address?: string; // Se usa para mostrar ciudad
  documentTypeId?: number;
  documentNumber?: string;
}


