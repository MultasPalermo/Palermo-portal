export interface Persona {
  id?: number;
  firstName: string;
  lastName: string;
  phoneNumber?: string;
  address?: string;
  municipalityId ?: number;
  createdAt?: Date;
  updatedAt?: Date;
}