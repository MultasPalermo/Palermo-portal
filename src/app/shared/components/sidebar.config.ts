export interface User {
  id: number;
  fullName: string;
  firstName: string;
  lastName: string;
  email: string;
  roles: string[];
  permissions: string[];
  menu: BackendMenuItem[];   // <- lo que devuelve el backend
}

export interface BackendMenuItem {
  id: number;
  name: string;
  description: string;
  icon?: string | null;
  forms: BackendSubMenuItem[];
}

export interface BackendSubMenuItem {
  id: number;
  name: string;
  description: string;
  route: string;
  state: boolean;
  permissions: string[];
}

