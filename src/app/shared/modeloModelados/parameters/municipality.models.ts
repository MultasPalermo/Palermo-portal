export interface Municipality {
  id?: number;
  name: string;
  daneCode: string;
  departmentId: number;
  departmentName?: string;
}

export interface Municipio extends Municipality {}