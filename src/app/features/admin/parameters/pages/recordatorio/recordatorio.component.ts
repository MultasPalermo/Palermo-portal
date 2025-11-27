import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { finalize } from 'rxjs/operators';
import { NotificationSettingService } from '../../../../../core/services/parameters/notification-setting.service';
import { NotificationSetting } from '../../../../../shared/modeloModelados/parameters/notification-setting.models';
import { PaginationComponent } from '../../../../../shared/components/pagination/pagination.component';
import { PaginationConfig, PaginationService } from '../../../../../shared/services/pagination.service';

@Component({
  selector: 'app-recordatorio',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    PaginationComponent
  ],
  templateUrl: './recordatorio.component.html',
  styleUrls: ['./recordatorio.component.scss']
})
export class RecordatorioComponent implements OnInit {
  private service = inject(NotificationSettingService);
  private fb = inject(FormBuilder);
  private paginationService = inject(PaginationService);

  recordatorios: NotificationSetting[] = [];
  filteredRecordatorios: NotificationSetting[] = [];
  paginatedRecordatorios: NotificationSetting[] = [];
  loading = false;

  // Búsqueda
  searchTerm: string = '';

  // Paginación
  paginationConfig: PaginationConfig = {
    currentPage: 1,
    itemsPerPage: 5,
    totalItems: 0,
    totalPages: 0
  };

  // Variables para modales
  showUpdateForm = false;
  showUpdateConfirm = false;
  recordatorioSeleccionado: NotificationSetting | null = null;
  recordatorioAActualizar: NotificationSetting | null = null;

  // Formularios reactivos
  updateForm: FormGroup;

  // Alertas estandarizadas
  showAlert = false;
  alertType: 'creado' | 'eliminado' | 'error' | 'info' = 'creado';
  alertMsg = '';

  // Opciones para el selector de unidad de tiempo
  timeUnitOptions = [
    { value: 'DAYS', label: 'Días' },
    { value: 'SECONDS', label: 'Segundos' }
  ];

  constructor() {
    // Inicializar formularios reactivos
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
    this.service.genericService.getAll<NotificationSetting>(this.service.endpoint, 'GetAll')
      .pipe(finalize(() => this.loading = false))
      .subscribe({
        next: (r: NotificationSetting[]) => {
          this.recordatorios = r;
          this.filteredRecordatorios = r;
          this.updatePagination();
        },
        error: (e: any) => {
          console.error('Error cargando recordatorios', e);
          this.mostrarAlerta('error', 'No fue posible cargar los recordatorios.');
        }
      });
  }

  // Búsqueda
  filterRecordatorios(): void {
    if (!this.searchTerm.trim()) {
      this.filteredRecordatorios = [...this.recordatorios];
    } else {
      const term = this.searchTerm.toLowerCase().trim();
      this.filteredRecordatorios = this.recordatorios.filter(rec =>
        rec.name?.toLowerCase().includes(term) ||
        rec.description?.toLowerCase().includes(term) ||
        rec.timeUnit?.toLowerCase().includes(term) ||
        rec.days?.toString().includes(term)
      );
    }
    this.paginationConfig.currentPage = 1;
    this.updatePagination();
  }

  clearSearch(): void {
    this.searchTerm = '';
    this.filterRecordatorios();
  }

  // Alertas estandarizadas
  mostrarAlerta(tipo: 'creado' | 'eliminado' | 'error' | 'info', mensaje: string): void {
    this.alertType = tipo;
    this.alertMsg = mensaje;
    this.showAlert = true;
    setTimeout(() => this.showAlert = false, 2500);
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

      const recordatorioActualizado = {
        ...this.recordatorioSeleccionado,
        ...this.updateForm.value
      };

      this.service.genericService.update<NotificationSetting>(this.service.endpoint, this.recordatorioSeleccionado.id, recordatorioActualizado)
        .pipe(finalize(() => this.loading = false))
        .subscribe({
          next: () => {
            this.mostrarAlerta('creado', 'Recordatorio actualizado exitosamente.');
            this.cargarRecordatorios();
            this.cerrarFormularioActualizar();
          },
          error: (e: any) => {
            console.error('Error al actualizar recordatorio:', e);
            this.mostrarAlerta('error', e.error?.message || 'Error al actualizar el recordatorio.');
          }
        });
    } else {
      this.mostrarAlerta('error', 'Por favor complete todos los campos requeridos.');
    }
  }


  // Métodos de paginación
  updatePagination(): void {
    this.paginationConfig = this.paginationService.updatePagination(
      this.paginationConfig,
      this.filteredRecordatorios.length
    );
    this.updatePaginatedItems();
  }

  updatePaginatedItems(): void {
    const { currentPage, itemsPerPage } = this.paginationConfig;
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    this.paginatedRecordatorios = this.filteredRecordatorios.slice(startIndex, endIndex);
  }

  onPageChange(page: number): void {
    this.paginationConfig.currentPage = page;
    this.updatePaginatedItems();
  }

  // Métodos auxiliares para validaciones
  isFieldInvalid(fieldName: string, form: FormGroup = this.updateForm): boolean {
    const field = form.get(fieldName);
    return field ? field.invalid && (field.dirty || field.touched) : false;
  }

  getFieldError(fieldName: string, form: FormGroup = this.updateForm): string {
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

  // Métodos auxiliares
  getTimeUnitLabel(timeUnit: string): string {
    const option = this.timeUnitOptions.find(opt => opt.value === timeUnit);
    return option ? option.label : timeUnit;
  }

  getActiveLabel(active: boolean): string {
    return active ? 'Activo' : 'Inactivo';
  }

}
