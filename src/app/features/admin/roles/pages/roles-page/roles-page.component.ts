// Eliminado ngOnInit duplicado fuera de la clase
import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClientModule } from '@angular/common/http';
import { PaginationComponent } from '../../../../../shared/components/pagination/pagination.component';
import { RolesService } from '../../../../../core/services/ModelSecurity/roles.service';
import { PaginationConfig, PaginationService } from '../../../../../shared/services/pagination.service';
import { Rol } from '../../../../../shared/modeloModelados/modelSecurity/rol';
import { validateRolName, validateRolDescription } from '../../../../../shared/utils/validator/validator-form/rol';

@Component({
  selector: 'app-roles-page',
  templateUrl: './roles-page.component.html',
  styleUrls: ['./roles-page.component.scss'],
  standalone: true,
  imports: [CommonModule, FormsModule, HttpClientModule, PaginationComponent]
})
export class RolesPageComponent implements OnInit {
  
  constructor(
    private rolesService: RolesService,
    private cdr: ChangeDetectorRef,
    private paginationService: PaginationService
  ) {}

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
  
  nuevoRol: Omit<Rol, 'id'> = {
    name: '',
    description: ''
  };

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
    this.nuevoRol = {
      name: '',
      description: ''
    };
  }

  cerrarModal() {
    this.showModal = false;
    // Limpiar el formulario al cerrar
    this.nuevoRol = {
      name: '',
      description: ''
    };
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
      this.showUpdateModal = true;
      this.showUpdateConfirm = false;
      this.rolAActualizar = null;
    }
  }

  cerrarModalActualizar() {
    this.showUpdateModal = false;
    this.rolSeleccionado = null;
  }

  crearRol() {
    const validationResult = this.validateNewRol();

    if (!validationResult.isValid) {
      this.mostrarAlerta(validationResult.error!, 'error');
      return;
    }

    const rolToCreate = {
      name: this.nuevoRol.name.trim(),
      description: this.nuevoRol.description.trim()
    };

    console.log('Creando rol:', rolToCreate); // Para depuración

    this.rolesService.genericService.create<Rol>(this.rolesService.endpoint, rolToCreate).subscribe({
      next: (rolCreado: Rol) => {
        console.log('Rol creado exitosamente:', rolCreado); // Para depuración
        this.cerrarModal();
        this.mostrarAlerta('Rol creado exitosamente.', 'creado');
        // Recargar la lista completa desde la API para asegurar sincronización
        this.cargarRoles(true);
      },
      error: (error: any) => {
        console.error('Error al crear rol:', error);
        const errorMessage = error.error?.message || error.message || 'Error desconocido';
        this.mostrarAlerta(`Error al crear el rol: ${errorMessage}`, 'error');
      }
    });
  }

  /**
   * Valida los datos del nuevo rol
   */
  private validateNewRol(): { isValid: boolean; error?: string } {
    const nameError = validateRolName(this.nuevoRol.name);
    const descError = validateRolDescription(this.nuevoRol.description);

    if (nameError) {
      return { isValid: false, error: nameError };
    }

    if (descError) {
      return { isValid: false, error: descError };
    }

    return { isValid: true };
  }

  actualizarRol() {
    if (!this.rolSeleccionado?.id) {
      this.mostrarAlerta('Error: No se puede actualizar el rol', 'error');
      return;
    }

    const validationResult = this.validateUpdateRol();

    if (!validationResult.isValid) {
      this.mostrarAlerta(validationResult.error!, validationResult.type!);
      return;
    }

    const rolToUpdate = {
      ...this.rolSeleccionado,
      name: this.rolSeleccionado.name.trim(),
      description: this.rolSeleccionado.description.trim()
    };

    console.log('Actualizando rol:', rolToUpdate);

    this.rolesService.genericService.update<Rol>(
      this.rolesService.endpoint,
      this.rolSeleccionado.id,
      rolToUpdate
    ).subscribe({
      next: (rolActualizado: Rol) => {
        console.log('Rol actualizado exitosamente:', rolActualizado);
        this.cerrarModalActualizar();
        this.mostrarAlerta('Rol actualizado exitosamente.', 'creado');
        this.cargarRoles(true);
      },
      error: (error: any) => {
        console.error('Error al actualizar rol:', error);
        const errorMessage = error.error?.message || error.message || 'Error desconocido';
        this.mostrarAlerta(`No se pudo actualizar el rol: ${errorMessage}`, 'error');
      }
    });
  }

  /**
   * Valida los datos del rol a actualizar
   */
  private validateUpdateRol(): { isValid: boolean; error?: string; type?: 'error' | 'info' } {
    if (!this.rolSeleccionado) {
      return { isValid: false, error: 'No hay rol seleccionado', type: 'error' };
    }

    const nameError = validateRolName(this.rolSeleccionado.name);
    const descError = validateRolDescription(this.rolSeleccionado.description);

    if (nameError) {
      return { isValid: false, error: nameError, type: 'error' };
    }

    if (descError) {
      return { isValid: false, error: descError, type: 'error' };
    }

    // Verificar si hay cambios
    const original = this.roles.find(r => r.id === this.rolSeleccionado!.id);
    if (original) {
      const nombreNuevo = this.rolSeleccionado.name.trim();
      const descripcionNueva = this.rolSeleccionado.description.trim();
      const nombreOriginal = original.name?.trim() || '';
      const descripcionOriginal = original.description?.trim() || '';

      if (nombreNuevo === nombreOriginal && descripcionNueva === descripcionOriginal) {
        return {
          isValid: false,
          error: 'No se detectaron cambios en el rol.',
          type: 'info'
        };
      }
    }

    return { isValid: true };
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
