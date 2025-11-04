export interface RolFormPermission {
  id: number;
  rolid: number;
  formid: number;
  permissionid: number;
  permissionName: string;
  rolName: string;
  formName: string;
}

export interface RolFormPermissionDisplay {
  permissionName: string;
  rolName: string;
  formName: string;
}

export interface CreateRolFormPermission {
  rolid: number;
  formid: number;
  permissionid: number;
}

export interface UpdateRolFormPermission {
  id: number;
  rolid: number;
  formid: number;
  permissionid: number;
}

// Interfaces auxiliares para dropdowns
export interface DropdownOption {
  id: number;
  name: string;
}

export interface RoleOption extends DropdownOption {}
export interface FormOption extends DropdownOption {}
export interface PermissionOption extends DropdownOption {}