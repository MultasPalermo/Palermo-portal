import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { Router, RouterModule } from '@angular/router';
import { finalize } from 'rxjs/operators';
import { CardHeaderComponent } from '../../../../../shared/components/card-header/card-header.component';
import { ButtonComponent } from '../../../../../shared/components/button/button.component';
import { NotificationSettingService } from '../../../../../core/services/parameters/notification-setting.service';
import { NotificationSetting } from '../../../../../shared/modeloModelados/parameters/notification-setting.models';
import { ColumnDef } from '../../../../../shared/modeloModelados/util/table.Generic';

@Component({
  selector: 'app-recordatorio',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    MatCardModule,
    MatButtonModule,
    RouterModule,
    CardHeaderComponent,
    ButtonComponent
  ],
  templateUrl: './recordatorio.component.html',
  styleUrls: ['./recordatorio.component.scss']
})
export class RecordatorioComponent implements OnInit {
  private router = inject(Router);
  private service = inject(NotificationSettingService);
  private fb = inject(FormBuilder);

  recordatorios: NotificationSetting[] = [];
  loading = false;
  errorMsg = '';
  successMsg = '';

  // Paginación
  currentPage: number = 1;
  itemsPerPage: number = 5;
  totalPages: number = 0;
  paginatedRecordatorios: NotificationSetting[] = [];

  // Variables para modales
  showForm = false;
  showUpdateForm = false;
  showConfirm = false;
  showUpdateConfirm = false;
  recordatorioAEliminar: NotificationSetting | null = null;
  recordatorioSeleccionado: NotificationSetting | null = null;
  recordatorioAActualizar: NotificationSetting | null = null;

  // Formularios reactivos
  recordatorioForm: FormGroup;
  updateForm: FormGroup;

  // Columnas fijas para la tabla genérica
  columns: ColumnDef[] = [
    { key: 'name',        header: 'Nombre',      type: 'text' },
    { key: 'days',        header: 'Días',        type: 'text' },
    { key: 'description', header: 'Descripción', type: 'text' },
    { key: 'timeUnit',    header: 'Unidad',      type: 'text' },
    { key: 'active',      header: 'Activo',      type: 'text' },
    { key: 'actions',     header: 'Acciones',    type: 'actions' }
  ];

  constructor() {
    // Inicializar formularios reactivos
    this.recordatorioForm = this.fb.group({
      name: ['', [Validators.required, Validators.minLength(2), Validators.maxLength(100)]],
      days: ['', [Validators.required, Validators.min(1)]],
      description: ['', [Validators.required, Validators.minLength(5), Validators.maxLength(500)]],
      timeUnit: ['DAYS', [Validators.required]],
      active: [true, [Validators.required]]
    });

    this.updateForm = this.fb.group({
      name: ['', [Validators.required, Validators.minLength(2), Validators.maxLength(100)]],
      days: ['', [Validators.required, Validators.min(1)]],
      description: ['', [Validators.required, Validators.minLength(5), Validators.maxLength(500)]],
      timeUnit: ['DAYS', [Validators.required]],
      active: [true, [Validators.required]]
    });
  }

  ngOnInit(): void {
    this.cargarRecordatorios();
  }

  private cargarRecordatorios(): void {
    this.loading = true;
    this.errorMsg = '';

    this.service.genericService.getAll<NotificationSetting>(this.service.endpoint, 'GetAll')
      .pipe(finalize(() => this.loading = false))
      .subscribe({
        next: (rows: NotificationSetting[]) => {
          this.recordatorios = rows;
          this.updatePagination();
        },
        error: (err: any) => {
          console.error('Error cargando recordatorios', err);
          this.errorMsg = 'No fue posible cargar los recordatorios.';
        }
      });
  }

  // Métodos para manejar formularios
  abrirFormulario(): void {
    // Validar que no haya más de 5 recordatorios
    if (this.recordatorios.length >= 5) {
      this.errorMsg = 'No se pueden crear más de 5 recordatorios. Elimine uno para poder crear otro.';
      setTimeout(() => this.errorMsg = '', 5000);
      return;
    }

    this.showForm = true;
    this.recordatorioForm.reset({
      timeUnit: 'DAYS',
      active: true
    });
    this.errorMsg = '';
    this.successMsg = '';
  }

  cerrarFormulario(): void {
    this.showForm = false;
    this.recordatorioForm.reset();
  }

  // Método para crear recordatorio
  crearRecordatorio(): void {
    if (this.recordatorioForm.valid) {
      // Validar nuevamente antes de crear
      if (this.recordatorios.length >= 5) {
        this.errorMsg = 'No se pueden crear más de 5 recordatorios.';
        setTimeout(() => this.errorMsg = '', 3000);
        return;
      }

      this.loading = true;
      this.errorMsg = '';
      this.successMsg = '';

      const recordatorioData = this.recordatorioForm.value;

      this.service.genericService.create<NotificationSetting>(this.service.endpoint, recordatorioData)
        .pipe(finalize(() => this.loading = false))
        .subscribe({
          next: (nuevoRecordatorio: NotificationSetting) => {
            this.successMsg = 'Recordatorio creado exitosamente.';
            this.cargarRecordatorios();
            this.cerrarFormulario();
            setTimeout(() => this.successMsg = '', 3000);
          },
          error: (error: any) => {
            console.error('Error al crear recordatorio:', error);
            this.errorMsg = error.error?.message || 'Error al crear el recordatorio.';
            setTimeout(() => this.errorMsg = '', 3000);
          }
        });
    } else {
      this.errorMsg = 'Por favor complete todos los campos requeridos.';
    }
  }

  // Métodos para editar recordatorio
  confirmarActualizacion(recordatorio: NotificationSetting): void {
    this.recordatorioAActualizar = recordatorio;
    this.showUpdateConfirm = true;
  }

  cancelarActualizacion(): void {
    this.recordatorioAActualizar = null;
    this.showUpdateConfirm = false;
  }

  abrirFormularioActualizar(): void {
    if (this.recordatorioAActualizar) {
      this.recordatorioSeleccionado = { ...this.recordatorioAActualizar };
      this.updateForm.patchValue({
        name: this.recordatorioAActualizar.name,
        days: this.recordatorioAActualizar.days,
        description: this.recordatorioAActualizar.description,
        timeUnit: this.recordatorioAActualizar.timeUnit,
        active: this.recordatorioAActualizar.active
      });
      this.showUpdateForm = true;
      this.showUpdateConfirm = false;
      this.recordatorioAActualizar = null;
      this.errorMsg = '';
      this.successMsg = '';
    }
  }

  cerrarFormularioActualizar(): void {
    this.showUpdateForm = false;
    this.recordatorioSeleccionado = null;
    this.updateForm.reset();
  }

  actualizarRecordatorio(): void {
    if (this.updateForm.valid && this.recordatorioSeleccionado && this.recordatorioSeleccionado.id) {
      this.loading = true;
      this.errorMsg = '';
      this.successMsg = '';

      const recordatorioActualizado = {
        ...this.recordatorioSeleccionado,
        ...this.updateForm.value
      };

      this.service.genericService.update<NotificationSetting>(this.service.endpoint, this.recordatorioSeleccionado.id, recordatorioActualizado)
        .pipe(finalize(() => this.loading = false))
        .subscribe({
          next: (recordatorioActualizado: NotificationSetting) => {
            this.successMsg = 'Recordatorio actualizado exitosamente.';
            this.cargarRecordatorios();
            this.cerrarFormularioActualizar();
            setTimeout(() => this.successMsg = '', 3000);
          },
          error: (error: any) => {
            console.error('Error al actualizar recordatorio:', error);
            this.errorMsg = error.error?.message || 'Error al actualizar el recordatorio.';
            setTimeout(() => this.errorMsg = '', 3000);
          }
        });
    } else {
      this.errorMsg = 'Por favor complete todos los campos requeridos.';
    }
  }

  // Métodos para eliminar recordatorio
  confirmarEliminacion(recordatorio: NotificationSetting): void {
    this.recordatorioAEliminar = recordatorio;
    this.showConfirm = true;
  }

  cancelarEliminacion(): void {
    this.recordatorioAEliminar = null;
    this.showConfirm = false;
  }

  eliminarRecordatorio(): void {
    if (this.recordatorioAEliminar && this.recordatorioAEliminar.id) {
      this.loading = true;
      this.errorMsg = '';
      this.successMsg = '';

      this.service.genericService.delete(this.service.endpoint, this.recordatorioAEliminar.id)
        .pipe(finalize(() => this.loading = false))
        .subscribe({
          next: () => {
            this.successMsg = 'Recordatorio eliminado exitosamente.';
            this.cargarRecordatorios();
            this.cancelarEliminacion();
            setTimeout(() => this.successMsg = '', 3000);
          },
          error: (error: any) => {
            console.error('Error al eliminar recordatorio:', error);
            this.errorMsg = error.error?.message || 'Error al eliminar el recordatorio.';
            setTimeout(() => this.errorMsg = '', 3000);
          }
        });
    }
  }

  // Métodos de paginación
  updatePagination(): void {
    this.totalPages = Math.ceil(this.recordatorios.length / this.itemsPerPage);
    this.updatePaginatedItems();
  }

  updatePaginatedItems(): void {
    const startIndex = (this.currentPage - 1) * this.itemsPerPage;
    const endIndex = startIndex + this.itemsPerPage;
    this.paginatedRecordatorios = this.recordatorios.slice(startIndex, endIndex);
  }

  goToPage(page: number): void {
    if (page >= 1 && page <= this.totalPages) {
      this.currentPage = page;
      this.updatePaginatedItems();
    }
  }

  nextPage(): void {
    this.goToPage(this.currentPage + 1);
  }

  prevPage(): void {
    this.goToPage(this.currentPage - 1);
  }

  getVisiblePages(): number[] {
    const visiblePages: number[] = [];
    const maxVisible = 5;
    let start = Math.max(1, this.currentPage - Math.floor(maxVisible / 2));
    let end = Math.min(this.totalPages, start + maxVisible - 1);

    if (end - start + 1 < maxVisible) {
      start = Math.max(1, end - maxVisible + 1);
    }

    for (let i = start; i <= end; i++) {
      visiblePages.push(i);
    }

    return visiblePages;
  }

  // Métodos auxiliares para validaciones
  isFieldInvalid(fieldName: string, form: FormGroup = this.recordatorioForm): boolean {
    const field = form.get(fieldName);
    return field ? field.invalid && (field.dirty || field.touched) : false;
  }

  getFieldError(fieldName: string, form: FormGroup = this.recordatorioForm): string {
    const field = form.get(fieldName);
    if (field && field.errors) {
      if (field.errors['required']) return `El campo ${fieldName} es requerido.`;
      if (field.errors['minlength']) return `El campo ${fieldName} debe tener al menos ${field.errors['minlength'].requiredLength} caracteres.`;
      if (field.errors['maxlength']) return `El campo ${fieldName} no puede exceder ${field.errors['maxlength'].requiredLength} caracteres.`;
      if (field.errors['min']) return `El valor mínimo es ${field.errors['min'].min}.`;
      if (field.errors['pattern']) return `El formato del ${fieldName} no es válido.`;
    }
    return '';
  }

  // Método auxiliar para mostrar el estado activo
  getActiveText(active: boolean): string {
    return active ? 'Sí' : 'No';
  }

  // Método auxiliar para mostrar la unidad de tiempo
  getTimeUnitText(timeUnit: string): string {
    return timeUnit === 'DAYS' ? 'Días' : 'Segundos';
  }

  // Verificar si se puede crear un nuevo recordatorio
  canCreateRecordatorio(): boolean {
    return this.recordatorios.length < 5;
  }
}
