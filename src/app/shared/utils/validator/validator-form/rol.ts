/**
 * Valida el nombre de un rol
 * @param name - Nombre del rol a validar
 * @returns mensaje de error o null si es válido
 */
export function validateRolName(name: string): string | null {
  // Validar que no esté vacío
  if (!name || name.trim() === '') {
    return 'El nombre es obligatorio.';
  }

  // Validar longitud mínima
  if (name.trim().length < 2) {
    return 'El nombre debe tener al menos 2 caracteres.';
  }

  // Validar longitud máxima
  if (name.length > 50) {
    return 'El nombre no puede superar los 50 caracteres.';
  }

  // Validar que solo contenga caracteres permitidos
  const allowedPattern = /^[a-zA-ZáéíóúÁÉÍÓÚñÑüÜ0-9\s\-_.,()]+$/;
  if (!allowedPattern.test(name)) {
    return 'El nombre contiene caracteres no permitidos. Solo se permiten letras, números, espacios y los caracteres: - _ . , ( )';
  }

  // Validar que no contenga múltiples espacios consecutivos
  if (/\s{2,}/.test(name)) {
    return 'El nombre no puede contener múltiples espacios consecutivos.';
  }

  // Validar que no empiece ni termine con espacios
  if (name !== name.trim()) {
    return 'El nombre no puede comenzar ni terminar con espacios.';
  }

  // Prevenir caracteres peligrosos
  const dangerousChars = /<|>|&lt;|&gt;|<script|javascript:|onerror=|onclick=/i;
  if (dangerousChars.test(name)) {
    return 'El nombre contiene caracteres potencialmente peligrosos.';
  }

  return null;
}

/**
 * Valida la descripción de un rol
 * @param description - Descripción del rol a validar
 * @returns mensaje de error o null si es válido
 */
export function validateRolDescription(description: string): string | null {
  // Validar que no esté vacío
  if (!description || description.trim() === '') {
    return 'La descripción es obligatoria.';
  }

  // Validar longitud mínima
  if (description.trim().length < 5) {
    return 'La descripción debe tener al menos 5 caracteres.';
  }

  // Validar longitud máxima
  if (description.length > 200) {
    return 'La descripción no puede superar los 200 caracteres.';
  }

  // Validar que solo contenga caracteres permitidos
  const allowedPattern = /^[a-zA-ZáéíóúÁÉÍÓÚñÑüÜ0-9\s\-_.,;:()\n\r¿?¡!'"]+$/;
  if (!allowedPattern.test(description)) {
    return 'La descripción contiene caracteres no permitidos. Solo se permiten letras, números, espacios y signos de puntuación básicos.';
  }

  // Validar que no contenga múltiples espacios consecutivos
  if (/[^\S\r\n]{2,}/.test(description)) {
    return 'La descripción no puede contener múltiples espacios consecutivos.';
  }

  // Validar que no empiece ni termine con espacios
  if (description !== description.trim()) {
    return 'La descripción no puede comenzar ni terminar con espacios.';
  }

  // Prevenir caracteres peligrosos
  const dangerousChars = /<|>|&lt;|&gt;|<script|javascript:|onerror=|onclick=|<iframe|eval\(|expression\(/i;
  if (dangerousChars.test(description)) {
    return 'La descripción contiene caracteres potencialmente peligrosos.';
  }

  return null;
}
