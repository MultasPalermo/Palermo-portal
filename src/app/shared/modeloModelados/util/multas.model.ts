export interface Multas {
  numero: string;
  descripcion: string;
  fecha: string;
  estado: 'ABIERTO' | 'PENDIENTE' | 'CERRADO';
  ubicacion: string;
}