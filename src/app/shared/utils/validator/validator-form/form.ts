export function validateFormName(name: string): string | null {
  if (!name || name.trim() === '') return 'El nombre es obligatorio.';
  if (name.length > 100) return 'El nombre no puede superar los 100 caracteres.';
  if (!/^[a-zA-Z\s]+$/.test(name)) return 'El nombre solo puede contener letras y espacios.';
  return null;
}

export function validateFormDescription(description: string): string | null {
  if (!description || description.trim() === '') return 'La descripción es obligatoria.';
  if (description.length > 500) return 'La descripción no puede superar los 500 caracteres.';
  if (!/^[a-zA-Z\s]+$/.test(description)) return 'La descripción solo puede contener letras y espacios.';
  return null;
}
