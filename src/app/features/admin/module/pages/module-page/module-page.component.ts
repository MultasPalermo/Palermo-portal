import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { PaginationComponent } from '../../../../../shared/components/pagination/pagination.component';
import { ModuleService } from '../../../../../core/services/ModelSecurity/module.service';
import { PaginationConfig, PaginationService } from '../../../../../shared/services/pagination.service';
import { Module } from '../../../../../shared/modeloModelados/modelSecurity/module';


@Component({
  selector: 'app-module-page',
  templateUrl: './module-page.component.html',
  styleUrls: ['./module-page.component.scss'],
  standalone: true,
  imports: [CommonModule, FormsModule, PaginationComponent],
  providers: [ModuleService]
})
export class ModulePageComponent implements OnInit {
  
  constructor(
    private moduleService: ModuleService,
    private cdr: ChangeDetectorRef,
    private paginationService: PaginationService
  ) {}

  modules: Module[] = [];
  paginatedModules: Module[] = [];

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
  moduleSeleccionado: Module | null = null;
  moduleAActualizar: Module | null = null;
  
  nuevoModule: {
    name: string;
    description: string;
  } = {
    name: '',
    description: ''
  };

  showAlert = false;
  alertMsg = '';
  alertType: string = 'creado';
  showConfirm = false;
  moduleAEliminar: Module | null = null;

  ngOnInit() {
    this.cargarModules();
  }

  // Cargar módulos desde la API
  cargarModules(esDespuesDeOperacion: boolean = false): void {
    console.log('Cargando módulos desde la API...'); // Para depuración
    
    this.moduleService.genericService.getAll<Module>(this.moduleService.endpoint).subscribe({
      next: (modules: Module[]) => {
        console.log('Módulos cargados:', modules); // Para depuración
        this.modules = modules || []; // Asegurar que modules sea un array
        this.updatePagination();
        // Forzar detección de cambios para asegurar que la vista se actualice
        this.cdr.detectChanges();
      },
      error: (error: any) => {
        console.error('Error al cargar módulos:', error);
        this.mostrarAlerta('Error al cargar los módulos: ' + (error.error?.message || error.message), 'error');
      }
    });
  }

  abrirModal() {
    this.showModal = true;
    this.nuevoModule = {
      name: '',
      description: ''
    };
  }

  cerrarModal() {
    this.showModal = false;
    // Limpiar el formulario al cerrar
    this.nuevoModule = {
      name: '',
      description: ''
    };
  }

  confirmarActualizacion(module: Module) {
    this.moduleAActualizar = module;
    this.showUpdateConfirm = true;
  }

  cancelarActualizacion() {
    this.moduleAActualizar = null;
    this.showUpdateConfirm = false;
  }

  abrirModalActualizar() {
    if (this.moduleAActualizar) {
      this.moduleSeleccionado = {
        ...this.moduleAActualizar,
        // Asegurar que los campos tengan valores válidos
        name: this.moduleAActualizar.name || '',
        description: this.moduleAActualizar.description || ''
      };
      this.showUpdateModal = true;
      this.showUpdateConfirm = false;
      this.moduleAActualizar = null;
    }
  }

  cerrarModalActualizar() {
    this.showUpdateModal = false;
    this.moduleSeleccionado = null;
  }

  crearModule() {
    // Validar que los campos no estén vacíos
    if (!this.nuevoModule.name || !this.nuevoModule.description) {
      this.mostrarAlerta('Por favor, complete todos los campos', 'error');
      return;
    }

    // Validar que no estén solo con espacios en blanco
    if (this.nuevoModule.name.trim() === '' || this.nuevoModule.description.trim() === '') {
      this.mostrarAlerta('Los campos no pueden estar vacíos', 'error');
      return;
    }

    // Validar límites de longitud
    if (this.nuevoModule.name.length < 3 || this.nuevoModule.name.length > 80) {
      this.mostrarAlerta('El nombre debe tener entre 3 y 80 caracteres', 'error');
      return;
    }

    if (this.nuevoModule.description.length < 5 || this.nuevoModule.description.length > 250) {
      this.mostrarAlerta('La descripción debe tener entre 5 y 250 caracteres', 'error');
      return;
    }

    console.log('Creando módulo:', this.nuevoModule); // Para depuración

    this.moduleService.genericService.create<Module>(this.moduleService.endpoint, this.nuevoModule).subscribe({
      next: (moduleCreado: Module) => {
        console.log('Módulo creado exitosamente:', moduleCreado); // Para depuración
        this.cerrarModal();
        this.mostrarAlerta('Módulo creado exitosamente.', 'creado');
        // Recargar la lista completa desde la API para asegurar sincronización
        this.cargarModules(true);
      },
      error: (error: any) => {
        console.error('Error al crear módulo:', error);
        this.mostrarAlerta('Error al crear el módulo: ' + (error.error?.message || error.message), 'error');
      }
    });
  }

 actualizarModule() {
  if (this.moduleSeleccionado && this.moduleSeleccionado.id) {
    const original = this.modules.find(m => m.id === this.moduleSeleccionado!.id);

    // Verificar si existe el módulo original
    if (!original) {
      this.mostrarAlerta('No se encontró el módulo original', 'error');
      return;
    }

    // Comparar valores ignorando espacios al inicio y fin
    const nombreNuevo = this.moduleSeleccionado.name.trim();
    const descripcionNueva = this.moduleSeleccionado.description.trim();

    const nombreIgual = nombreNuevo === original.name.trim();
    const descripcionIgual = descripcionNueva === original.description.trim();

    if (nombreIgual && descripcionIgual) {
      this.mostrarAlerta('Debe realizar al menos un cambio antes de actualizar.', 'error');
      return;
    }

    // Validar límites
    if (nombreNuevo.length < 3 || nombreNuevo.length > 80) {
      this.mostrarAlerta('El nombre debe tener entre 3 y 80 caracteres', 'error');
      return;
    }

    if (descripcionNueva.length < 10 || descripcionNueva.length > 250) {
      this.mostrarAlerta('La descripción debe tener entre 10 y 250 caracteres', 'error');
      return;
    }

    // Actualizar con los valores ya "limpios"
    this.moduleSeleccionado.name = nombreNuevo;
    this.moduleSeleccionado.description = descripcionNueva;

    console.log('Actualizando módulo:', this.moduleSeleccionado);

    this.moduleService.genericService.update<Module>(
      this.moduleService.endpoint,
      this.moduleSeleccionado.id,
      this.moduleSeleccionado
    ).subscribe({
      next: (moduleActualizado: Module) => {
        console.log('Módulo actualizado exitosamente:', moduleActualizado);
        this.cerrarModalActualizar();
        this.mostrarAlerta('Módulo actualizado exitosamente.', 'creado');
        this.cargarModules(true);
      },
      error: (error: any) => {
        console.error('Error al actualizar módulo:', error);
        this.mostrarAlerta('Error al actualizar el módulo: ' + (error.error?.message || error.message), 'error');
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

  pedirConfirmacionEliminar(module: Module) {
    this.moduleAEliminar = module;
    this.showConfirm = true;
  }

  confirmarEliminar() {
    if (this.moduleAEliminar && this.moduleAEliminar.id) {
      console.log('Eliminando módulo:', this.moduleAEliminar); // Para depuración
      
      this.moduleService.genericService.delete(this.moduleService.endpoint, this.moduleAEliminar.id).subscribe({
        next: () => {
          console.log('Módulo eliminado exitosamente'); // Para depuración
          this.mostrarAlerta('Módulo eliminado correctamente.', 'eliminado');
          this.showConfirm = false;
          this.moduleAEliminar = null;
          // Recargar la lista completa desde la API para asegurar sincronización
          this.cargarModules(true);
        },
        error: (error: any) => {
          console.error('Error al eliminar módulo:', error);
          this.mostrarAlerta('Error al eliminar el módulo: ' + (error.error?.message || error.message), 'error');
          this.showConfirm = false;
          this.moduleAEliminar = null;
        }
      });
    } else {
      console.error('No se puede eliminar: módulo sin ID válido');
      this.mostrarAlerta('Error: No se puede eliminar el módulo', 'error');
      this.showConfirm = false;
      this.moduleAEliminar = null;
    }
  }

  cancelarEliminar() {
    this.showConfirm = false;
    this.moduleAEliminar = null;
  }

  // Métodos de paginación
  updatePagination(): void {
    this.paginationConfig = this.paginationService.updatePagination(this.paginationConfig, this.modules.length);
    this.updatePaginatedItems();
  }

  updatePaginatedItems(): void {
    this.paginatedModules = this.paginationService.getPaginatedItems(this.modules, this.paginationConfig);
  }

  onPageChange(page: number): void {
    this.paginationConfig = this.paginationService.goToPage(this.paginationConfig, page);
    this.updatePaginatedItems();
  }
}