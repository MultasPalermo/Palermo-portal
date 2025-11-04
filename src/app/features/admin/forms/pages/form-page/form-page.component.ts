import { Component, OnInit, ChangeDetectorRef, ViewEncapsulation } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { PaginationComponent } from '../../../../../shared/components/pagination/pagination.component';
import { PaginationConfig, PaginationService } from '../../../../../shared/services/pagination.service';
import { validateFormDescription, validateFormName } from '../../../../../shared/utils/validator/validator-form/form';
import { Form } from '../../../../../shared/modeloModelados/modelSecurity/form';
import { FormService } from '../../../../../core/services/ModelSecurity/form.service';

@Component({
  selector: 'app-form-page',
  templateUrl: './form-page.component.html',
  styleUrls: ['./form-page.component.scss'],
  encapsulation: ViewEncapsulation.None,
  standalone: true,
  imports: [CommonModule, FormsModule, PaginationComponent],
  providers: [FormService]
})
export class FormPageComponent implements OnInit {
  // Datos principales
  forms: Form[] = [];
  paginatedForms: Form[] = [];

  // Configuración de paginación
  paginationConfig: PaginationConfig = {
    currentPage: 1,
    itemsPerPage: 5,
    totalItems: 0,
    totalPages: 0
  };

  // Estados de modales
  showModal = false;
  showUpdateModal = false;
  showUpdateConfirm = false;
  showAlert = false;
  showConfirm = false;

  // Formularios y objetos temporales
  formSeleccionado: Form | null = null;
  formAActualizar: Form | null = null;
  formAEliminar: Form | null = null;
  
  nuevoForm: { name: string; description: string } = {
    name: '',
    description: ''
  };

  // Mensajes y alertas
  alertMsg = '';
  alertType: 'error' | 'creado' | 'eliminado' | 'bienvenida' | 'info' = 'creado';

  constructor(
    private formService: FormService,
    private cdr: ChangeDetectorRef,
    private paginationService: PaginationService
  ) { }

  ngOnInit(): void {
    this.cargarForms();
  }

  /**
   * Carga formularios desde la API
   */
  private cargarForms(esDespuesDeOperacion = false): void {
    this.formService.genericService.getAll<Form>(this.formService.endpoint).subscribe({
      next: (forms: Form[]) => {
        this.forms = Array.isArray(forms) ? forms : [];
        this.updatePagination();
        this.cdr.detectChanges();
      },
      error: (error: any) => {
        console.error('Error al cargar formularios:', error);
        const errorMessage = error.error?.message || error.message || 'Error desconocido';
        this.mostrarAlerta(`Error al cargar los formularios: ${errorMessage}`, 'error');

        // Solo agregar datos de prueba si no es después de una operación
        if (!esDespuesDeOperacion && this.forms.length === 0) {
          this.cargarDatosPrueba();
        }
      }
    });
  }

  /**
   * Carga datos de prueba cuando la API no está disponible
   */
  private cargarDatosPrueba(): void {
    this.forms = [
      {
        id: 1,
        name: 'Formulario de acuerdo de pago',
        description: 'Formulario de creación de acuerdo de pago'
      },
      {
        id: 2,
        name: 'Formulario de registro de multas',
        description: 'Formulario para registrar nuevas multas'
      }
    ];
    this.updatePagination();
  }

  /**
   * Abre el modal para crear un nuevo formulario
   */
  abrirModal(): void {
    this.showModal = true;
    this.limpiarNuevoForm();
  }

  /**
   * Cierra el modal de creación
   */
  cerrarModal(): void {
    this.showModal = false;
    this.limpiarNuevoForm();
  }

  /**
   * Limpia los datos del formulario nuevo
   */
  private limpiarNuevoForm(): void {
    this.nuevoForm = { name: '', description: '' };
  }

  confirmarActualizacion(form: Form) {
    this.formAActualizar = form;
    this.showUpdateConfirm = true;
  }

  cancelarActualizacion() {
    this.formAActualizar = null;
    this.showUpdateConfirm = false;
  }

  abrirModalActualizar() {
    if (this.formAActualizar) {
      this.formSeleccionado = {
        ...this.formAActualizar,
        // Asegurar que los campos tengan valores válidos
        name: this.formAActualizar.name || '',
        description: this.formAActualizar.description || ''
      };
      this.showUpdateModal = true;
      this.showUpdateConfirm = false;
      this.formAActualizar = null;
    }
  }

  cerrarModalActualizar() {
    this.showUpdateModal = false;
    this.formSeleccionado = null;
  }

  /**
   * Crea un nuevo formulario después de validar los datos
   */
  crearForm(): void {
    const validationResult = this.validateNewForm();
    
    if (!validationResult.isValid) {
      this.mostrarAlerta(validationResult.error!, 'error');
      return;
    }

    const formToCreate = {
      name: this.nuevoForm.name.trim(),
      description: this.nuevoForm.description.trim()
    };

    this.formService.genericService.create<Form>(this.formService.endpoint, formToCreate).subscribe({
      next: (formCreado: Form) => {
        this.cerrarModal();
        this.mostrarAlerta('Formulario creado exitosamente.', 'creado');
        this.cargarForms(true);
      },
      error: (error: any) => {
        console.error('Error al crear formulario:', error);
        const errorMessage = error.error?.message || error.message || 'Error desconocido';
        this.mostrarAlerta(`Error al crear el formulario: ${errorMessage}`, 'error');
      }
    });
  }

  /**
   * Valida los datos del nuevo formulario
   */
  private validateNewForm(): { isValid: boolean; error?: string } {
    const nameError = validateFormName(this.nuevoForm.name);
    const descError = validateFormDescription(this.nuevoForm.description);

    if (nameError) {
      return { isValid: false, error: nameError };
    }
    
    if (descError) {
      return { isValid: false, error: descError };
    }

    return { isValid: true };
  }

  /**
   * Actualiza un formulario existente después de validar los datos
   */
  actualizarForm(): void {
    if (!this.formSeleccionado?.id) {
      this.mostrarAlerta('Error: No se puede actualizar el formulario', 'error');
      return;
    }

    const validationResult = this.validateUpdateForm();
    
    if (!validationResult.isValid) {
      this.mostrarAlerta(validationResult.error!, validationResult.type!);
      return;
    }

    const formToUpdate = {
      ...this.formSeleccionado,
      name: this.formSeleccionado.name.trim(),
      description: this.formSeleccionado.description.trim()
    };

    this.formService.genericService.update<Form>(
      this.formService.endpoint,
      this.formSeleccionado.id,
      formToUpdate
    ).subscribe({
      next: (formActualizado: Form) => {
        this.cerrarModalActualizar();
        this.mostrarAlerta('Formulario actualizado exitosamente.', 'creado');
        this.cargarForms(true);
      },
      error: (error: any) => {
        console.error('Error al actualizar formulario:', error);
        const errorMessage = error.error?.message || error.message || 'Error desconocido';
        this.mostrarAlerta(`No se pudo actualizar el formulario: ${errorMessage}`, 'error');
      }
    });
  }

  /**
   * Valida los datos del formulario a actualizar
   */
  private validateUpdateForm(): { isValid: boolean; error?: string; type?: 'error' | 'info' } {
    if (!this.formSeleccionado) {
      return { isValid: false, error: 'No hay formulario seleccionado', type: 'error' };
    }

    const nameError = validateFormName(this.formSeleccionado.name);
    const descError = validateFormDescription(this.formSeleccionado.description);

    if (nameError) {
      return { isValid: false, error: nameError, type: 'error' };
    }
    
    if (descError) {
      return { isValid: false, error: descError, type: 'error' };
    }

    // Verificar si hay cambios
    const originalName = this.formAActualizar?.name?.trim() || '';
    const originalDesc = this.formAActualizar?.description?.trim() || '';
    const newName = this.formSeleccionado.name.trim();
    const newDesc = this.formSeleccionado.description.trim();

    if (originalName === newName && originalDesc === newDesc) {
      return { 
        isValid: false, 
        error: 'No se detectaron cambios en el formulario.', 
        type: 'info' 
      };
    }

    return { isValid: true };
  }


  mostrarAlerta(msg: string, tipo: 'error' | 'creado' | 'eliminado' | 'bienvenida' | 'info') {
  this.alertMsg = msg;
  this.alertType = tipo;
  this.showAlert = true;
  setTimeout(() => this.showAlert = false, 2500);
}


  pedirConfirmacionEliminar(form: Form) {
    this.formAEliminar = form;
    this.showConfirm = true;
  }

  /**
   * Confirma y procede con la eliminación del formulario
   */
  confirmarEliminar(): void {
    if (!this.formAEliminar?.id) {
      this.mostrarAlerta('Error: No se puede eliminar el formulario', 'error');
      this.cancelarEliminar();
      return;
    }

    this.formService.genericService.delete(this.formService.endpoint, this.formAEliminar.id).subscribe({
      next: () => {
        this.mostrarAlerta('Formulario eliminado correctamente.', 'eliminado');
        this.cancelarEliminar();
        this.cargarForms(true);
      },
      error: (error: any) => {
        console.error('Error al eliminar formulario:', error);
        const errorMessage = error.error?.message || error.message || 'Error desconocido';
        this.mostrarAlerta(`Error al eliminar el formulario: ${errorMessage}`, 'error');
        this.cancelarEliminar();
      }
    });
  }

  cancelarEliminar() {
    this.showConfirm = false;
    this.formAEliminar = null;
  }

  // Métodos de paginación
  updatePagination(): void {
    this.paginationConfig = this.paginationService.updatePagination(this.paginationConfig, this.forms.length);
    this.updatePaginatedItems();
  }

  updatePaginatedItems(): void {
    this.paginatedForms = this.paginationService.getPaginatedItems(this.forms, this.paginationConfig);
  }

  onPageChange(page: number): void {
    this.paginationConfig = this.paginationService.goToPage(this.paginationConfig, page);
    this.updatePaginatedItems();
  }

  /**
   * TrackBy function para mejorar performance del *ngFor
   */
  trackByFormId(index: number, form: Form): number {
    return form.id || index;
  }
}