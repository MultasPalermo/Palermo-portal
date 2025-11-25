import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { finalize } from 'rxjs/operators';
import { PaymentFrequencyService } from '../../../../../core/services/parameters/payment-frequency.service';
import { PaymentFrequency } from '../../../../../shared/modeloModelados/parameters/payment-frequency.models';
import { PaginationComponent } from '../../../../../shared/components/pagination/pagination.component';
import { PaginationConfig, PaginationService } from '../../../../../shared/services/pagination.service';

@Component({
  selector: 'app-payment-frequency',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    PaginationComponent
  ],
  templateUrl: './payment-frequency.component.html',
  styleUrls: ['./payment-frequency.component.scss']
})
export class PaymentFrequencyComponent implements OnInit {
  private service = inject(PaymentFrequencyService);
  private fb = inject(FormBuilder);
  private paginationService = inject(PaginationService);

  frecuencias: PaymentFrequency[] = [];
  filteredFrecuencias: PaymentFrequency[] = [];
  paginatedFrecuencias: PaymentFrequency[] = [];
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
  showForm = false;
  showUpdateForm = false;
  showConfirm = false;
  showUpdateConfirm = false;
  paymentFrequencyAEliminar: PaymentFrequency | null = null;
  paymentFrequencySeleccionado: PaymentFrequency | null = null;
  paymentFrequencyAActualizar: PaymentFrequency | null = null;

  // Opciones para IntervalType
  intervalTypeOptions = [
    { value: 'Days', label: 'Días' },
    { value: 'Months', label: 'Meses' },
    { value: 'Years', label: 'Años' }
  ];

  // Formularios reactivos
  paymentFrequencyForm: FormGroup;
  updateForm: FormGroup;

  // Alertas estandarizadas
  showAlert = false;
  alertType: 'creado' | 'eliminado' | 'error' | 'info' = 'creado';
  alertMsg = '';

  constructor() {
    // Inicializar formularios reactivos
    this.paymentFrequencyForm = this.fb.group({
      intervalPage: ['', [Validators.required, Validators.minLength(2), Validators.maxLength(50)]],
      IntervalType: ['Months', [Validators.required]],
      IntervalValue: ['', [Validators.required, Validators.min(1)]]
    });

    this.updateForm = this.fb.group({
      intervalPage: ['', [Validators.required, Validators.minLength(2), Validators.maxLength(50)]],
      IntervalType: ['Months', [Validators.required]],
      IntervalValue: ['', [Validators.required, Validators.min(1)]]
    });
  }

  ngOnInit(): void {
    this.cargarFrecuencias();
  }

  private cargarFrecuencias(): void {
    this.loading = true;
    this.service.genericService.getAll<PaymentFrequency>(this.service.endpoint, 'GetAll')
      .pipe(finalize(() => this.loading = false))
      .subscribe({
        next: (r: any[]) => {
          this.frecuencias = (r || []).map(item => ({
            id: item.id,
            intervalPage: item.intervalPage ?? '',
            IntervalType: item.IntervalType ?? 'Months',
            IntervalValue: item.IntervalValue ?? 1
          } as PaymentFrequency));
          this.filteredFrecuencias = this.frecuencias;
          this.updatePagination();
        },
        error: (e: any) => {
          console.error('Error cargando frecuencias de pago', e);
          this.mostrarAlerta('error', 'No fue posible cargar las frecuencias de pago.');
        }
      });
  }

  // Métodos para manejar formularios
  abrirFormulario(): void {
    this.showForm = true;
    this.paymentFrequencyForm.reset({ IntervalType: 'Months' });
  }

  cerrarFormulario(): void {
    this.showForm = false;
    this.paymentFrequencyForm.reset();
  }

  // Método para crear frecuencia de pago
  crearPaymentFrequency(): void {
    if (this.paymentFrequencyForm.valid) {
      this.loading = true;

      const paymentFrequencyData = this.paymentFrequencyForm.value;

      const payload = {
        intervalPage: paymentFrequencyData.intervalPage,
        IntervalType: paymentFrequencyData.IntervalType,
        IntervalValue: paymentFrequencyData.IntervalValue
      };

      this.service.genericService.create<PaymentFrequency>(this.service.endpoint, payload)
        .pipe(finalize(() => this.loading = false))
        .subscribe({
          next: (nuevoPaymentFrequency: PaymentFrequency) => {
            this.mostrarAlerta('creado', 'Frecuencia de pago creada exitosamente.');
            this.cargarFrecuencias();
            this.cerrarFormulario();
          },
          error: (error: any) => {
            console.error('Error al crear frecuencia de pago:', error);
            this.mostrarAlerta('error', error.error?.message || 'Error al crear la frecuencia de pago.');
          }
        });
    } else {
      this.mostrarAlerta('error', 'Por favor complete todos los campos requeridos.');
    }
  }

  // Métodos para editar frecuencia de pago
  confirmarActualizacion(paymentFrequency: PaymentFrequency): void {
    this.paymentFrequencyAActualizar = paymentFrequency;
    this.showUpdateConfirm = true;
  }

  cancelarActualizacion(): void {
    this.paymentFrequencyAActualizar = null;
    this.showUpdateConfirm = false;
  }

  abrirFormularioActualizar(): void {
    if (this.paymentFrequencyAActualizar) {
      this.paymentFrequencySeleccionado = { ...this.paymentFrequencyAActualizar };
      this.updateForm.patchValue({
        intervalPage: this.paymentFrequencyAActualizar.intervalPage,
        IntervalType: this.paymentFrequencyAActualizar.IntervalType,
        IntervalValue: this.paymentFrequencyAActualizar.IntervalValue
      });
      this.showUpdateForm = true;
      this.showUpdateConfirm = false;
      this.paymentFrequencyAActualizar = null;
    }
  }

  cerrarFormularioActualizar(): void {
    this.showUpdateForm = false;
    this.paymentFrequencySeleccionado = null;
    this.updateForm.reset();
  }

  actualizarPaymentFrequency(): void {
    if (this.updateForm.valid && this.paymentFrequencySeleccionado && this.paymentFrequencySeleccionado.id) {
      this.loading = true;

      const paymentFrequencyActualizado = {
        ...this.paymentFrequencySeleccionado,
        ...this.updateForm.value
      };

      this.service.genericService.update<PaymentFrequency>(this.service.endpoint, this.paymentFrequencySeleccionado.id, paymentFrequencyActualizado)
        .pipe(finalize(() => this.loading = false))
        .subscribe({
          next: (paymentFrequencyActualizado: PaymentFrequency) => {
            this.mostrarAlerta('creado', 'Frecuencia de pago actualizada exitosamente.');
            this.cargarFrecuencias();
            this.cerrarFormularioActualizar();
          },
          error: (error: any) => {
            console.error('Error al actualizar frecuencia de pago:', error);
            this.mostrarAlerta('error', error.error?.message || 'Error al actualizar la frecuencia de pago.');
          }
        });
    } else {
      this.mostrarAlerta('error', 'Por favor complete todos los campos requeridos.');
    }
  }

  // Métodos para eliminar frecuencia de pago
  confirmarEliminacion(paymentFrequency: PaymentFrequency): void {
    this.paymentFrequencyAEliminar = paymentFrequency;
    this.showConfirm = true;
  }

  cancelarEliminacion(): void {
    this.paymentFrequencyAEliminar = null;
    this.showConfirm = false;
  }

  eliminarPaymentFrequency(): void {
    if (this.paymentFrequencyAEliminar && this.paymentFrequencyAEliminar.id) {
      this.loading = true;

      this.service.genericService.delete(this.service.endpoint, this.paymentFrequencyAEliminar.id)
        .pipe(finalize(() => this.loading = false))
        .subscribe({
          next: () => {
            this.mostrarAlerta('eliminado', 'Frecuencia de pago eliminada exitosamente.');
            this.cargarFrecuencias();
            this.cancelarEliminacion();
          },
          error: (error: any) => {
            console.error('Error al eliminar frecuencia de pago:', error);
            this.mostrarAlerta('error', error.error?.message || 'Error al eliminar la frecuencia de pago.');
          }
        });
    }
  }

  // Métodos de paginación
  updatePagination(): void {
    this.paginationConfig = this.paginationService.updatePagination(this.paginationConfig, this.filteredFrecuencias.length);
    this.updatePaginatedItems();
  }

  updatePaginatedItems(): void {
    this.paginatedFrecuencias = this.paginationService.getPaginatedItems(this.filteredFrecuencias, this.paginationConfig);
  }

  onPageChange(page: number): void {
    this.paginationConfig = this.paginationService.goToPage(this.paginationConfig, page);
    this.updatePaginatedItems();
  }

  // Método de búsqueda
  filterFrecuencias(): void {
    if (!this.searchTerm.trim()) {
      this.filteredFrecuencias = [...this.frecuencias];
    } else {
      const term = this.searchTerm.toLowerCase().trim();
      this.filteredFrecuencias = this.frecuencias.filter(frec =>
        frec.intervalPage?.toLowerCase().includes(term) ||
        frec.IntervalType?.toLowerCase().includes(term) ||
        frec.IntervalValue?.toString().includes(term)
      );
    }
    this.paginationConfig.currentPage = 1;
    this.updatePagination();
  }

  clearSearch(): void {
    this.searchTerm = '';
    this.filterFrecuencias();
  }

  // Método de alerta estandarizado
  mostrarAlerta(tipo: 'creado' | 'eliminado' | 'error' | 'info', mensaje: string): void {
    this.alertType = tipo;
    this.alertMsg = mensaje;
    this.showAlert = true;
    setTimeout(() => this.showAlert = false, 2500);
  }

  // Métodos auxiliares para validaciones
  isFieldInvalid(fieldName: string, form: FormGroup = this.paymentFrequencyForm): boolean {
    const field = form.get(fieldName);
    return field ? field.invalid && (field.dirty || field.touched) : false;
  }

  getFieldError(fieldName: string, form: FormGroup = this.paymentFrequencyForm): string {
    const field = form.get(fieldName);
    if (field && field.errors) {
      if (field.errors['required']) {
        if (fieldName === 'intervalPage') return 'El campo frecuencia de pago es requerido.';
        if (fieldName === 'IntervalType') return 'El campo Tiempo es requerido.';
        if (fieldName === 'IntervalValue') return 'El campo Valor Intervalo es requerido.';
        return `El campo ${fieldName} es requerido.`;
      }
      if (field.errors['minlength']) return `El campo ${fieldName} debe tener al menos ${field.errors['minlength'].requiredLength} caracteres.`;
      if (field.errors['maxlength']) return `El campo ${fieldName} no puede exceder ${field.errors['maxlength'].requiredLength} caracteres.`;
      if (field.errors['min']) return `El valor mínimo es ${field.errors['min'].min}.`;
      if (field.errors['max']) return `El valor máximo es ${field.errors['max'].max}.`;
      if (field.errors['pattern']) return `El formato del ${fieldName} no es válido.`;
    }
    return '';
  }

  // Helper para obtener el label del tipo de intervalo
  getIntervalTypeLabel(value: string): string {
    const option = this.intervalTypeOptions.find(opt => opt.value === value);
    return option ? option.label : value;
  }
}
