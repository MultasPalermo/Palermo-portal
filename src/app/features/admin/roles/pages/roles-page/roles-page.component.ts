// Eliminado ngOnInit duplicado fuera de la clase
import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { HttpClientModule } from '@angular/common/http';
import { PaginationComponent } from '../../../../../shared/components/pagination/pagination.component';
import { RolesService } from '../../../../../core/services/ModelSecurity/roles.service';
import { PaginationConfig, PaginationService } from '../../../../../shared/services/pagination.service';
import { Rol } from '../../../../../shared/modeloModelados/modelSecurity/rol';

@Component({
  selector: 'app-roles-page',
  templateUrl: './roles-page.component.html',
  styleUrls: ['./roles-page.component.scss'],
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule, HttpClientModule, PaginationComponent]
})
export class RolesPageComponent implements OnInit {
  
  // Formularios reactivos
  rolForm: FormGroup;
  updateForm: FormGroup;

  constructor(
    private rolesService: RolesService,
    private cdr: ChangeDetectorRef,
    private paginationService: PaginationService,
    private fb: FormBuilder
  ) {
    this.rolForm = this.fb.group({
      name: ['', [Validators.required, Validators.minLength(2), Validators.maxLength(50)]],
      description: ['', [Validators.required, Validators.minLength(5), Validators.maxLength(200)]]
    });

    this.updateForm = this.fb.group({
      name: ['', [Validators.required, Validators.minLength(2), Validators.maxLength(50)]],
      description: ['', [Validators.required, Validators.minLength(5), Validators.maxLength(200)]]
    });
  }

  ngOnInit(): void {
    // Agregar algunos datos de prueba si la API no está disponible
    this.cargarRoles();
    
    // Datos de prueba (comentar cuando la API funcione)
    setTimeout(() => {
      if (this.roles.length === 0) {
        console.log('No se cargaron roles de la API, agregando datos de prueba');
        this.roles = [
          { id: 1, name: 'Administrador', description: 'Rol con todos los permisos del sistema' },
          { id: 2, name: 'Usuario', description: 'Rol básico con permisos limitados' }
        ];
      }
    }, 2000);
  }

  roles: Rol[] = [];
  paginatedRoles: Rol[] = [];
  filteredRoles: Rol[] = [];

  // Búsqueda
  searchTerm: string = '';

  // Paginación
  paginationConfig: PaginationConfig = {
    currentPage: 1,
    itemsPerPage: 5,
    totalItems: 0,
    totalPages: 0
  };
  
  // Modal y formulario
  showModal: boolean = false;
  showUpdateModal: boolean = false;
  showUpdateConfirm: boolean = false;
  rolSeleccionado: Rol | null = null;
  rolAActualizar: Rol | null = null;

  showAlert = false;
  alertMsg = '';
  alertType: string = 'creado';
  showConfirm = false;
  rolAEliminar: Rol | null = null;
  
  // Cargar roles desde la API
  cargarRoles(esDespuesDeOperacion: boolean = false): void {
    console.log('Cargando roles desde la API...'); // Para depuración
    
    this.rolesService.genericService.getAll<Rol>(this.rolesService.endpoint).subscribe({
      next: (roles: Rol[]) => {
        console.log('Roles cargados:', roles); // Para depuración
        this.roles = roles || []; // Asegurar que roles sea un array
        this.filteredRoles = this.roles;
        this.updatePagination();
        // Forzar detección de cambios para asegurar que la vista se actualice
        this.cdr.detectChanges();
      },
      error: (error: any) => {
        console.error('Error al cargar roles:', error);
        this.mostrarAlerta('Error al cargar los roles: ' + (error.error?.message || error.message), 'error');
        
        // Solo agregar datos de prueba si no es después de una operación y no hay roles
        if (!esDespuesDeOperacion && this.roles.length === 0) {
          console.log('Agregando datos de prueba debido a error de API');
          this.roles = [
            { id: 1, name: 'Administrador', description: 'Rol con todos los permisos del sistema' },
            { id: 2, name: 'Usuario', description: 'Rol básico con permisos limitados' }
          ];
        }
      }
    });
  }

  abrirModal() {
    this.showModal = true;
    this.rolForm.reset();
  }

  cerrarModal() {
    this.showModal = false;
    this.rolForm.reset();
  }

  confirmarActualizacion(rol: Rol) {
    this.rolAActualizar = rol;
    this.showUpdateConfirm = true;
  }

  cancelarActualizacion() {
    this.rolAActualizar = null;
    this.showUpdateConfirm = false;
  }

  abrirModalActualizar() {
    if (this.rolAActualizar) {
      this.rolSeleccionado = { ...this.rolAActualizar };
      this.updateForm.patchValue(this.rolAActualizar);
      this.showUpdateModal = true;
      this.showUpdateConfirm = false;
      this.rolAActualizar = null;
    }
  }

  cerrarModalActualizar() {
    this.showUpdateModal = false;
    this.updateForm.reset();
    this.rolSeleccionado = null;
  }

  crearRol() {
    if (this.rolForm.valid) {
      const formValue = this.rolForm.value;

      const nuevoRol: Omit<Rol, 'id'> = {
        name: formValue.name,
        description: formValue.description
      };

      console.log('Creando rol:', nuevoRol);

      this.rolesService.genericService.create<Rol>(this.rolesService.endpoint, nuevoRol).subscribe({
        next: (rolCreado: Rol) => {
          console.log('Rol creado exitosamente:', rolCreado);
          this.cerrarModal();
          this.mostrarAlerta('Rol creado exitosamente.', 'creado');
          this.cargarRoles(true);
        },
        error: (error: any) => {
          console.error('Error al crear rol:', error);

          let errorMessage = 'Error al crear el rol.';
          if (error?.error) {
            if (typeof error.error === 'string') {
              errorMessage = error.error;
            } else if (error.error.message) {
              errorMessage = error.error.message;
            } else if (error.error.errors) {
              const validationErrors = Object.keys(error.error.errors).map(key =>
                `${key}: ${error.error.errors[key].join(', ')}`
              ).join('; ');
              errorMessage = `Errores de validación: ${validationErrors}`;
            }
          }

          console.log('Mensaje de error procesado:', errorMessage);
          this.mostrarAlerta(errorMessage, 'eliminado');
        }
      });
    } else {
      this.mostrarAlerta('Por favor completa todos los campos requeridos.', 'eliminado');
    }
  }

  actualizarRol() {
    if (this.updateForm.valid && this.rolSeleccionado) {
      const formValue = this.updateForm.value;

      const rolActualizado: Rol = {
        id: this.rolSeleccionado.id,
        name: formValue.name,
        description: formValue.description
      };

      console.log('Datos a actualizar:', rolActualizado);

      if (rolActualizado.id) {
        this.rolesService.genericService.update<Rol>(
          this.rolesService.endpoint,
          rolActualizado.id,
          rolActualizado
        ).subscribe({
          next: (rol: Rol) => {
            this.mostrarAlerta('Rol actualizado exitosamente.', 'creado');
            this.cerrarModalActualizar();
            this.cargarRoles(true);
          },
          error: (error: any) => {
            console.error('Error al actualizar rol:', error);

            let errorMessage = 'Error al actualizar el rol.';
            if (error?.error) {
              if (typeof error.error === 'string') {
                errorMessage = error.error;
              } else if (error.error.message) {
                errorMessage = error.error.message;
              } else if (error.error.errors) {
                const validationErrors = Object.keys(error.error.errors).map(key =>
                  `${key}: ${error.error.errors[key].join(', ')}`
                ).join('; ');
                errorMessage = `Errores de validación: ${validationErrors}`;
              }
            }

            console.log('Mensaje de error procesado:', errorMessage);
            this.mostrarAlerta(errorMessage, 'eliminado');
          }
        });
      } else {
        this.mostrarAlerta('ID de rol no encontrado.', 'eliminado');
      }
    } else {
      this.mostrarAlerta('Por favor completa todos los campos requeridos.', 'eliminado');
    }
  }

  mostrarAlerta(msg: string, tipo: string) {
    this.alertMsg = msg;
    this.alertType = tipo;
    this.showAlert = true;
    setTimeout(() => this.showAlert = false, 2500);
  }

  pedirConfirmacionEliminar(rol: Rol) {
    this.rolAEliminar = rol;
    this.showConfirm = true;
  }

  confirmarEliminar() {
    if (this.rolAEliminar && this.rolAEliminar.id) {
      console.log('Eliminando rol:', this.rolAEliminar); // Para depuración
      
      this.rolesService.genericService.delete(this.rolesService.endpoint, this.rolAEliminar.id).subscribe({
        next: () => {
          console.log('Rol eliminado exitosamente'); // Para depuración
          this.mostrarAlerta('Rol eliminado correctamente.', 'eliminado');
          this.showConfirm = false;
          this.rolAEliminar = null;
          // Recargar la lista completa desde la API para asegurar sincronización
          this.cargarRoles(true);
        },
        error: (error: any) => {
          console.error('Error al eliminar rol:', error);
          this.mostrarAlerta('Error al eliminar el rol: ' + (error.error?.message || error.message), 'error');
          this.showConfirm = false;
          this.rolAEliminar = null;
        }
      });
    } else {
      console.error('No se puede eliminar: rol sin ID válido');
      this.mostrarAlerta('Error: No se puede eliminar el rol', 'error');
      this.showConfirm = false;
      this.rolAEliminar = null;
    }
  }

  cancelarEliminar() {
    this.showConfirm = false;
    this.rolAEliminar = null;
  }

  // Métodos de paginación
  updatePagination(): void {
    this.paginationConfig = this.paginationService.updatePagination(this.paginationConfig, this.filteredRoles.length);
    this.updatePaginatedItems();
  }

  updatePaginatedItems(): void {
    this.paginatedRoles = this.paginationService.getPaginatedItems(this.filteredRoles, this.paginationConfig);
  }

  onPageChange(page: number): void {
    this.paginationConfig = this.paginationService.goToPage(this.paginationConfig, page);
    this.updatePaginatedItems();
  }

  // Método de búsqueda
  filterRoles(): void {
    if (!this.searchTerm.trim()) {
      this.filteredRoles = [...this.roles];
    } else {
      const term = this.searchTerm.toLowerCase().trim();
      this.filteredRoles = this.roles.filter(rol =>
        rol.name?.toLowerCase().includes(term) ||
        rol.description?.toLowerCase().includes(term)
      );
    }
    this.paginationConfig.currentPage = 1;
    this.updatePagination();
  }

  clearSearch(): void {
    this.searchTerm = '';
    this.filterRoles();
  }
}
