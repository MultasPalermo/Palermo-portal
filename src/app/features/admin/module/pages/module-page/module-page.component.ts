import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { PaginationComponent } from '../../../../../shared/components/pagination/pagination.component';
import { ModuleService } from '../../../../../core/services/ModelSecurity/module.service';
import { PaginationConfig, PaginationService } from '../../../../../shared/services/pagination.service';
import { Module } from '../../../../../shared/modeloModelados/modelSecurity/module';
import { validateModuleName, validateModuleDescription } from '../../../../../shared/utils/validator/validator-form/module';


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
  filteredModules: Module[] = [];

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
        this.filteredModules = this.modules;
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
    const validationResult = this.validateNewModule();

    if (!validationResult.isValid) {
      this.mostrarAlerta(validationResult.error!, 'error');
      return;
    }

    const moduleToCreate = {
      name: this.nuevoModule.name.trim(),
      description: this.nuevoModule.description.trim()
    };

    console.log('Creando módulo:', moduleToCreate); // Para depuración

    this.moduleService.genericService.create<Module>(this.moduleService.endpoint, moduleToCreate).subscribe({
      next: (moduleCreado: Module) => {
        console.log('Módulo creado exitosamente:', moduleCreado); // Para depuración
        this.cerrarModal();
        this.mostrarAlerta('Módulo creado exitosamente.', 'creado');
        // Recargar la lista completa desde la API para asegurar sincronización
        this.cargarModules(true);
      },
      error: (error: any) => {
        console.error('Error al crear módulo:', error);
        const errorMessage = error.error?.message || error.message || 'Error desconocido';
        this.mostrarAlerta(`Error al crear el módulo: ${errorMessage}`, 'error');
      }
    });
  }

  /**
   * Valida los datos del nuevo módulo
   */
  private validateNewModule(): { isValid: boolean; error?: string } {
    const nameError = validateModuleName(this.nuevoModule.name);
    const descError = validateModuleDescription(this.nuevoModule.description);

    if (nameError) {
      return { isValid: false, error: nameError };
    }

    if (descError) {
      return { isValid: false, error: descError };
    }

    return { isValid: true };
  }

  actualizarModule() {
    if (!this.moduleSeleccionado?.id) {
      this.mostrarAlerta('Error: No se puede actualizar el módulo', 'error');
      return;
    }

    const validationResult = this.validateUpdateModule();

    if (!validationResult.isValid) {
      this.mostrarAlerta(validationResult.error!, validationResult.type!);
      return;
    }

    const moduleToUpdate = {
      ...this.moduleSeleccionado,
      name: this.moduleSeleccionado.name.trim(),
      description: this.moduleSeleccionado.description.trim()
    };

    console.log('Actualizando módulo:', moduleToUpdate);

    this.moduleService.genericService.update<Module>(
      this.moduleService.endpoint,
      this.moduleSeleccionado.id,
      moduleToUpdate
    ).subscribe({
      next: (moduleActualizado: Module) => {
        console.log('Módulo actualizado exitosamente:', moduleActualizado);
        this.cerrarModalActualizar();
        this.mostrarAlerta('Módulo actualizado exitosamente.', 'creado');
        this.cargarModules(true);
      },
      error: (error: any) => {
        console.error('Error al actualizar módulo:', error);
        const errorMessage = error.error?.message || error.message || 'Error desconocido';
        this.mostrarAlerta(`No se pudo actualizar el módulo: ${errorMessage}`, 'error');
      }
    });
  }

  /**
   * Valida los datos del módulo a actualizar
   */
  private validateUpdateModule(): { isValid: boolean; error?: string; type?: 'error' | 'info' } {
    if (!this.moduleSeleccionado) {
      return { isValid: false, error: 'No hay módulo seleccionado', type: 'error' };
    }

    const nameError = validateModuleName(this.moduleSeleccionado.name);
    const descError = validateModuleDescription(this.moduleSeleccionado.description);

    if (nameError) {
      return { isValid: false, error: nameError, type: 'error' };
    }

    if (descError) {
      return { isValid: false, error: descError, type: 'error' };
    }

    // Verificar si hay cambios
    const original = this.modules.find(m => m.id === this.moduleSeleccionado!.id);
    if (original) {
      const nombreNuevo = this.moduleSeleccionado.name.trim();
      const descripcionNueva = this.moduleSeleccionado.description.trim();
      const nombreOriginal = original.name?.trim() || '';
      const descripcionOriginal = original.description?.trim() || '';

      if (nombreNuevo === nombreOriginal && descripcionNueva === descripcionOriginal) {
        return {
          isValid: false,
          error: 'No se detectaron cambios en el módulo.',
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
    this.paginationConfig = this.paginationService.updatePagination(this.paginationConfig, this.filteredModules.length);
    this.updatePaginatedItems();
  }

  updatePaginatedItems(): void {
    this.paginatedModules = this.paginationService.getPaginatedItems(this.filteredModules, this.paginationConfig);
  }

  onPageChange(page: number): void {
    this.paginationConfig = this.paginationService.goToPage(this.paginationConfig, page);
    this.updatePaginatedItems();
  }

  // Método de búsqueda
  filterModules(): void {
    if (!this.searchTerm.trim()) {
      this.filteredModules = [...this.modules];
    } else {
      const term = this.searchTerm.toLowerCase().trim();
      this.filteredModules = this.modules.filter(module =>
        module.name?.toLowerCase().includes(term) ||
        module.description?.toLowerCase().includes(term)
      );
    }
    this.paginationConfig.currentPage = 1;
    this.updatePagination();
  }

  clearSearch(): void {
    this.searchTerm = '';
    this.filterModules();
  }
}