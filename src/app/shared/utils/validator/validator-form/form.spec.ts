import { validateFormName, validateFormDescription } from './form';

describe('Form Validators', () => {
  describe('validateFormName', () => {
    it('debe rechazar nombres vacíos', () => {
      expect(validateFormName('')).toBe('El nombre es obligatorio.');
      expect(validateFormName('   ')).toBe('El nombre es obligatorio.');
    });

    it('debe rechazar nombres menores a 3 caracteres', () => {
      expect(validateFormName('ab')).toBe('El nombre debe tener al menos 3 caracteres.');
      expect(validateFormName('a')).toBe('El nombre debe tener al menos 3 caracteres.');
    });

    it('debe rechazar nombres mayores a 100 caracteres', () => {
      const longName = 'a'.repeat(101);
      expect(validateFormName(longName)).toBe('El nombre no puede superar los 100 caracteres.');
    });

    it('debe aceptar nombres válidos', () => {
      expect(validateFormName('Formulario de acuerdo de pago')).toBeNull();
      expect(validateFormName('Formulario 123')).toBeNull();
      expect(validateFormName('Registro de multas (v2.0)')).toBeNull();
      expect(validateFormName('Acuerdo-pago_2024')).toBeNull();
    });

    it('debe rechazar caracteres especiales peligrosos', () => {
      expect(validateFormName('Formulario <script>')).toBe('El nombre contiene caracteres potencialmente peligrosos.');
      expect(validateFormName('Test javascript:')).toBe('El nombre contiene caracteres potencialmente peligrosos.');
      expect(validateFormName('Form onerror=')).toBe('El nombre contiene caracteres potencialmente peligrosos.');
    });

    it('debe rechazar caracteres no permitidos', () => {
      expect(validateFormName('Form@test')).toContain('caracteres no permitidos');
      expect(validateFormName('Form#123')).toContain('caracteres no permitidos');
      expect(validateFormName('Form$test')).toContain('caracteres no permitidos');
    });

    it('debe rechazar múltiples espacios consecutivos', () => {
      expect(validateFormName('Formulario  test')).toBe('El nombre no puede contener múltiples espacios consecutivos.');
    });

    it('debe aceptar caracteres con tildes y ñ', () => {
      expect(validateFormName('Formulario de evaluación')).toBeNull();
      expect(validateFormName('Año nuevo 2024')).toBeNull();
      expect(validateFormName('Niños felices')).toBeNull();
    });
  });

  describe('validateFormDescription', () => {
    it('debe rechazar descripciones vacías', () => {
      expect(validateFormDescription('')).toBe('La descripción es obligatoria.');
      expect(validateFormDescription('   ')).toBe('La descripción es obligatoria.');
    });

    it('debe rechazar descripciones menores a 10 caracteres', () => {
      expect(validateFormDescription('Corto')).toBe('La descripción debe tener al menos 10 caracteres.');
      expect(validateFormDescription('Test 123')).toBe('La descripción debe tener al menos 10 caracteres.');
    });

    it('debe rechazar descripciones mayores a 500 caracteres', () => {
      const longDesc = 'a'.repeat(501);
      expect(validateFormDescription(longDesc)).toBe('La descripción no puede superar los 500 caracteres.');
    });

    it('debe aceptar descripciones válidas', () => {
      expect(validateFormDescription('Esta es una descripción válida de formulario')).toBeNull();
      expect(validateFormDescription('Descripción con números 123 y símbolos: - _ . , ( )')).toBeNull();
      expect(validateFormDescription('¿Pregunta? ¡Respuesta! Descripción completa.')).toBeNull();
    });

    it('debe rechazar caracteres especiales peligrosos', () => {
      expect(validateFormDescription('Descripción con <script>alert("xss")</script>')).toBe('La descripción contiene caracteres potencialmente peligrosos.');
      expect(validateFormDescription('Test con <iframe>')).toBe('La descripción contiene caracteres potencialmente peligrosos.');
    });

    it('debe rechazar múltiples espacios consecutivos', () => {
      expect(validateFormDescription('Descripción  con  espacios  dobles')).toBe('La descripción no puede contener múltiples espacios consecutivos.');
    });

    it('debe aceptar signos de puntuación', () => {
      expect(validateFormDescription('Descripción con: punto, coma; dos puntos.')).toBeNull();
      expect(validateFormDescription('¿Cómo estás? ¡Muy bien!')).toBeNull();
    });

    it('debe aceptar saltos de línea', () => {
      expect(validateFormDescription('Primera línea\nSegunda línea\nTercera línea')).toBeNull();
    });
  });
});
