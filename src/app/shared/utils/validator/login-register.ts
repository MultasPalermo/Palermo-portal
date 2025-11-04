// shared/utils/validators.ts
export function validateEmail(email: string): string | null {
  const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!email.trim()) return 'El correo electrónico es obligatorio.';
  if (email.length > 150) return 'El correo electrónico no debe superar los 150 caracteres.';
  if (!regex.test(email)) return 'El correo electrónico no tiene un formato válido.';
  return null;
}

export function validatePassword(password: string): string | null {
  if (!password.trim()) return 'La contraseña es obligatoria.';
  if (password.length > 100) return 'La contraseña no debe superar los 100 caracteres.';
  return null;
}

export function validateRegisterFullName(fullName: string): string | null {
  if (!fullName.trim()) return 'El nombre completo es obligatorio.';
  if (fullName.length > 150) return 'El nombre completo no debe superar los 150 caracteres.';
  const parts = fullName.trim().split(/\s+/);
  if (parts.length < 2) return 'Debe ingresar al menos nombre y apellido.';
  if (parts[parts.length - 1].length < 2) return 'Debe ingresar un apellido válido al final.';
  return null;
}

export function validateRegisterPassword(password: string): string | null {
  if (!password.trim()) return 'La contraseña es obligatoria.';
  if (password.length < 8) return 'La contraseña debe tener al menos 8 caracteres.';
  if (password.length > 100) return 'La contraseña no debe superar los 100 caracteres.';
  if (!/[A-Z]/.test(password)) return 'La contraseña debe incluir al menos una letra mayúscula.';
  if (!/[a-z]/.test(password)) return 'La contraseña debe incluir al menos una letra minúscula.';
  if (!/[0-9]/.test(password)) return 'La contraseña debe incluir al menos un número.';
  if (!/[^a-zA-Z0-9]/.test(password)) return 'La contraseña debe incluir al menos un carácter especial.';
  return null;
}

export function validateRegisterEmail(email: string): string | null {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  if (!email.trim()) return 'El correo electrónico es obligatorio.';
  if (email.length > 150) return 'El correo electrónico no debe superar los 150 caracteres.';
  if (!emailRegex.test(email)) return 'El correo electrónico no tiene un formato válido.';

  return null;
}
