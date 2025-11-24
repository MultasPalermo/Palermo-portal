/**
 * @fileoverview Pruebas unitarias para el servicio de departamentos (DepartmentService)
 * 
 * Este archivo contiene las pruebas unitarias del DepartmentService, que maneja
 * las operaciones CRUD relacionadas con los departamentos (divisiones geográficas
 * o administrativas) en el sistema Palermo Portal.
 * 
 * @description
 * Las pruebas verifican:
 * - Creación correcta del servicio
 * - Configuración correcta del endpoint API
 * - Integración con el servicio genérico (ServiceGenericService)
 * 
 * @module tests/unit
 * @requires @angular/core/testing
 * @requires @angular/common/http/testing
 * 
 * @note
 * Este servicio extiende la funcionalidad genérica de ServiceGenericService,
 * por lo que hereda operaciones como: getAll(), getById(), create(), update(), delete()
 */

import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { DepartmentService } from '../../core/services/parameters/department.service';
import { ServiceGenericService } from '../../core/services/utils/generic/service-generic.service';

/**
 * Suite de pruebas para DepartmentService
 * 
 * @description
 * Conjunto de pruebas que verifican la correcta inicialización y configuración
 * del servicio de departamentos, incluyendo su endpoint y dependencias.
 */
describe('DepartmentService', () => {
  // Instancia del servicio de departamentos a probar
  let service: DepartmentService;
  
  // Instancia del servicio genérico que proporciona operaciones CRUD base
  let genericService: ServiceGenericService;

  /**
   * Configuración inicial antes de cada prueba
   * 
   * @description
   * Se ejecuta antes de cada test para:
   * - Configurar el módulo de testing con HttpClientTestingModule
   * - Proporcionar los servicios necesarios (DepartmentService y ServiceGenericService)
   * - Inyectar las instancias de los servicios para usar en las pruebas
   */
  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [DepartmentService, ServiceGenericService]
    });

    service = TestBed.inject(DepartmentService);
    genericService = TestBed.inject(ServiceGenericService);
  });

  /**
   * Test: Verificación de creación del servicio
   * 
   * @test
   * Verifica que el DepartmentService se pueda instanciar correctamente
   * y que la instancia no sea nula o undefined.
   * 
   * @importance
   * Esta es una prueba fundamental que asegura que todas las dependencias
   * del servicio están correctamente configuradas en el módulo de testing.
   */
  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  /**
   * Test: Verificación del endpoint correcto
   * 
   * @test
   * Verifica que el servicio esté configurado con el endpoint correcto ('department').
   * Este endpoint se usará en todas las peticiones HTTP del servicio.
   * 
   * @example
   * Si el endpoint es 'department', las peticiones serán:
   * - GET    /api/department       -> Obtener todos los departamentos
   * - GET    /api/department/:id   -> Obtener un departamento específico
   * - POST   /api/department       -> Crear nuevo departamento
   * - PUT    /api/department/:id   -> Actualizar departamento
   * - DELETE /api/department/:id   -> Eliminar departamento
   */
  it('should have correct endpoint', () => {
    expect(service.endpoint).toBe('department');
  });

  /**
   * Test: Verificación de acceso al servicio genérico
   * 
   * @test
   * Verifica que el DepartmentService tenga acceso correcto al ServiceGenericService.
   * El servicio genérico proporciona todas las operaciones CRUD base que el
   * DepartmentService hereda y utiliza.
   * 
   * @description
   * Se verifica que:
   * 1. La propiedad genericService exista y no sea null
   * 2. La instancia sea del tipo correcto (ServiceGenericService)
   * 
   * @note
   * Gracias a esta relación, el DepartmentService puede usar métodos como:
   * - getAll(), getById(), create(), update(), delete()
   * sin necesidad de reimplementarlos.
   */
  it('should have access to genericService', () => {
    expect(service.genericService).toBeTruthy();
    expect(service.genericService).toBeInstanceOf(ServiceGenericService);
  });
});
