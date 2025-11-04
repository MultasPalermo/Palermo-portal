// Eliminado ngOnInit duplicado fuera de la clase
import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
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
    // Validar que los campos no estén vacíos
    if (!this.nuevoRol["name"] || !this.nuevoRol["description"]) {
      this.mostrarAlerta('Por favor, complete todos los campos', 'error');
      return;
    }

    // Validar que no estén solo con espacios en blanco
    if (this.nuevoRol["name"].trim() === '' || this.nuevoRol["description"].trim() === '') {
      this.mostrarAlerta('Los campos no pueden estar vacíos', 'error');
      return;
    }

    // Validar límites de longitud
    if (this.nuevoRol["name"].length < 2 || this.nuevoRol["name"].length > 50) {
      this.mostrarAlerta('El nombre debe tener entre 2 y 50 caracteres', 'error');
      return;
    }

    if (this.nuevoRol["description"].length < 5 || this.nuevoRol["description"].length > 200) {
      this.mostrarAlerta('La descripción debe tener entre 5 y 200 caracteres', 'error');
      return;
    }

    console.log('Creando rol:', this.nuevoRol); // Para depuración

    this.rolesService.genericService.create<Rol>(this.rolesService.endpoint, this.nuevoRol).subscribe({
      next: (rolCreado: Rol) => {
        console.log('Rol creado exitosamente:', rolCreado); // Para depuración
        this.cerrarModal();
        this.mostrarAlerta('Rol creado exitosamente.', 'creado');
        // Recargar la lista completa desde la API para asegurar sincronización
        this.cargarRoles(true);
      },
      error: (error: any) => {
        console.error('Error al crear rol:', error);
        this.mostrarAlerta('Error al crear el rol: ' + (error.error?.message || error.message), 'error');
      }
    });
  }

  actualizarRol() {
    if (this.rolSeleccionado && this.rolSeleccionado.id) {
      // Validar límites de longitud para actualización
      if (this.rolSeleccionado.name.length < 2 || this.rolSeleccionado.name.length > 50) {
        this.mostrarAlerta('El nombre debe tener entre 2 y 50 caracteres', 'error');
        return;
      }

      if (this.rolSeleccionado.description.length < 5 || this.rolSeleccionado.description.length > 200) {
        this.mostrarAlerta('La descripción debe tener entre 5 y 200 caracteres', 'error');
        return;
      }
      this.rolesService.genericService.update<Rol>(this.rolesService.endpoint, this.rolSeleccionado.id, this.rolSeleccionado).subscribe({
        next: (rolActualizado: Rol) => {
          console.log('Rol actualizado exitosamente:', rolActualizado);
          this.cerrarModalActualizar();
          this.mostrarAlerta('Rol actualizado exitosamente.', 'creado');
          // Recargar la lista completa desde la API para asegurar sincronización
          this.cargarRoles(true);
        },
        error: (error: any) => {
          console.error('Error al actualizar rol:', error);
          this.mostrarAlerta('Error al actualizar el rol: ' + (error.error?.message || error.message), 'error');
        }
      });
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
    this.paginationConfig = this.paginationService.updatePagination(this.paginationConfig, this.roles.length);
    this.updatePaginatedItems();
  }

  updatePaginatedItems(): void {
    this.paginatedRoles = this.paginationService.getPaginatedItems(this.roles, this.paginationConfig);
  }

  onPageChange(page: number): void {
    this.paginationConfig = this.paginationService.goToPage(this.paginationConfig, page);
    this.updatePaginatedItems();
  }
}
