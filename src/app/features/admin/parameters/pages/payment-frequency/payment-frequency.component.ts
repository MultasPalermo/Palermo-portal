import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { finalize } from 'rxjs/operators';
import { Router } from '@angular/router';
import { GenericMultasTableComponent } from '../../../../../shared/components/generic-multas-table/generic-multas-table.component';
import { CardHeaderComponent } from '../../../../../shared/components/card-header/card-header.component';
import { ButtonComponent } from '../../../../../shared/components/button/button.component';
import { PaymentFrequency } from '../../../../../shared/modeloModelados/parameters/payment-frequency.models';
import { PaymentFrequencyService } from '../../../../../core/services/parameters/payment-frequency.service';
import { ColumnDef } from '../../../../../shared/modeloModelados/util/table.Generic';




@Component({
  selector: 'app-payment-frequency',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule, MatCardModule, CardHeaderComponent, ButtonComponent],
  templateUrl: './payment-frequency.component.html',
  styleUrls: ['./payment-frequency.component.scss']
})
export class PaymentFrequencyComponent implements OnInit {
  private router = inject(Router);
  private service = inject(PaymentFrequencyService);
  private fb = inject(FormBuilder);

  frecuencias: PaymentFrequency[] = [];
  loading = false;
  errorMsg = '';
  successMsg = '';

  // Variables para modales
  showForm = false;
  showUpdateForm = false;
  showConfirm = false;
  paymentFrequencyAEliminar: PaymentFrequency | null = null;
  paymentFrequencySeleccionado: PaymentFrequency | null = null;

  // Formularios reactivos
  paymentFrequencyForm: FormGroup;
  updateForm: FormGroup;

  columns: ColumnDef[] = [
    { key: 'name',          header: 'Nombre',         type: 'text' },
    { key: 'daysInterval',  header: 'Intervalo días', type: 'text' },
    { key: 'actions',       header: 'Acciones',       type: 'actions' }
  ];

  constructor() {
    // Inicializar formularios reactivos
    this.paymentFrequencyForm = this.fb.group({
      name: ['', [Validators.required, Validators.minLength(2), Validators.maxLength(50)]],
      daysInterval: ['', [Validators.required, Validators.min(1), Validators.max(365)]],
      code: ['', [Validators.required, Validators.minLength(1), Validators.maxLength(50)]]
    });

    this.updateForm = this.fb.group({
      name: ['', [Validators.required, Validators.minLength(2), Validators.maxLength(50)]],
      daysInterval: ['', [Validators.required, Validators.min(1), Validators.max(365)]],
      code: ['', [Validators.required, Validators.minLength(1), Validators.maxLength(50)]]
    });
  }

  ngOnInit(): void {
    this.cargarAcuerdosFrecuencia();
  }

  private cargarAcuerdosFrecuencia(): void {
    this.loading = true;
    this.errorMsg = '';

    this.service.genericService.getAll<PaymentFrequency>(this.service.endpoint, 'GetAll')
      .pipe(finalize(() => this.loading = false))
      .subscribe({
        next: (r: any[]) => {
          // El backend puede devolver un DTO diferente (p.e. intervalPage/dueDayOfMonth).
          // Normalizamos los objetos para que la UI maneje name/daysInterval/code.
          this.frecuencias = (r || []).map(item => ({
            id: item.id,
            name: item.name ?? item.intervalPage ?? item.code ?? '',
            code: item.code ?? item.intervalPage ?? '',
            description: item.description,
            daysInterval: item.daysInterval ?? item.dueDayOfMonth ?? 0
          } as PaymentFrequency));
        },
        error: (e: any) => { this.errorMsg = 'No fue posible cargar las frecuencias de pago.'; }
      });
  }

  // Métodos para manejar formularios
  abrirFormulario(): void {
    this.showForm = true;
    this.paymentFrequencyForm.reset();
    this.errorMsg = '';
    this.successMsg = '';
  }

  cerrarFormulario(): void {
    this.showForm = false;
    this.paymentFrequencyForm.reset();
  }

  // Método para crear frecuencia de pago
  crearPaymentFrequency(): void {
    if (this.paymentFrequencyForm.valid) {
      this.loading = true;
      this.errorMsg = '';
      this.successMsg = '';

      const paymentFrequencyData = this.paymentFrequencyForm.value;

      // Construir payload compatible con el backend: algunos controladores esperan
      // intervalPage (ej. 'MENSUAL') y dueDayOfMonth (número) en lugar de name/daysInterval.
      const payload = {
        ...paymentFrequencyData,
        intervalPage: paymentFrequencyData.code ?? paymentFrequencyData.name,
        dueDayOfMonth: paymentFrequencyData.daysInterval
      };

      console.debug('Crear PaymentFrequency payload:', payload);

      this.service.genericService.create<PaymentFrequency>(this.service.endpoint, payload)
        .pipe(finalize(() => this.loading = false))
        .subscribe({
          next: (nuevoPaymentFrequency: PaymentFrequency) => {
            this.successMsg = 'Frecuencia de pago creada exitosamente.';
            this.cargarAcuerdosFrecuencia(); // Recargar la lista
            this.cerrarFormulario();
            setTimeout(() => this.successMsg = '', 3000);
          },
          error: (error: any) => {
            console.error('Error al crear frecuencia de pago:', error);
            this.errorMsg = error?.error?.message || 'Error al crear la frecuencia de pago.';
            setTimeout(() => this.errorMsg = '', 3000);
          }
        });
    } else {
      this.errorMsg = 'Por favor complete todos los campos requeridos.';
    }
  }

  // Métodos para editar frecuencia de pago
  abrirFormularioActualizar(paymentFrequency: PaymentFrequency): void {
    this.paymentFrequencySeleccionado = { ...paymentFrequency };
    this.updateForm.patchValue({
      name: paymentFrequency.name,
      daysInterval: paymentFrequency.daysInterval,
      code: paymentFrequency.code
    });
    this.showUpdateForm = true;
    this.errorMsg = '';
    this.successMsg = '';
  }

  cerrarFormularioActualizar(): void {
    this.showUpdateForm = false;
    this.paymentFrequencySeleccionado = null;
    this.updateForm.reset();
  }

  actualizarPaymentFrequency(): void {
    if (this.updateForm.valid && this.paymentFrequencySeleccionado && this.paymentFrequencySeleccionado.id) {
      this.loading = true;
      this.errorMsg = '';
      this.successMsg = '';

      const paymentFrequencyActualizado = {
        ...this.paymentFrequencySeleccionado,
        ...this.updateForm.value
      };

      const updatePayload = {
        ...paymentFrequencyActualizado,
        intervalPage: (this.updateForm.value.code ?? this.updateForm.value.name ?? paymentFrequencyActualizado.code ?? paymentFrequencyActualizado.name),
        dueDayOfMonth: this.updateForm.value.daysInterval ?? paymentFrequencyActualizado.daysInterval
      };

      console.debug('Update PaymentFrequency payload:', updatePayload);

      this.service.genericService.update<PaymentFrequency>(this.service.endpoint, this.paymentFrequencySeleccionado.id, paymentFrequencyActualizado)
        .pipe(finalize(() => this.loading = false))
        .subscribe({
          next: (paymentFrequencyActualizado: PaymentFrequency) => {
            this.successMsg = 'Frecuencia de pago actualizada exitosamente.';
            this.cargarAcuerdosFrecuencia(); // Recargar la lista
            this.cerrarFormularioActualizar();
            setTimeout(() => this.successMsg = '', 3000);
          },
          error: (error: any) => {
            console.error('Error al actualizar frecuencia de pago:', error);
            this.errorMsg = error?.error?.message || 'Error al actualizar la frecuencia de pago.';
            setTimeout(() => this.errorMsg = '', 3000);
          }
        });
    } else {
      this.errorMsg = 'Por favor complete todos los campos requeridos.';
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
      this.errorMsg = '';
      this.successMsg = '';

      this.service.genericService.delete(this.service.endpoint, this.paymentFrequencyAEliminar.id)
        .pipe(finalize(() => this.loading = false))
        .subscribe({
          next: () => {
            this.successMsg = 'Frecuencia de pago eliminada exitosamente.';
            this.cargarAcuerdosFrecuencia(); // Recargar la lista
            this.cancelarEliminacion();
            setTimeout(() => this.successMsg = '', 3000);
          },
          error: (error: any) => {
            console.error('Error al eliminar frecuencia de pago:', error);
            this.errorMsg = error?.error?.message || 'Error al eliminar la frecuencia de pago.';
            setTimeout(() => this.errorMsg = '', 3000);
          }
        });
    }
  }

  // Métodos auxiliares para validaciones
  isFieldInvalid(fieldName: string, form: FormGroup = this.paymentFrequencyForm): boolean {
    const field = form.get(fieldName);
    return field ? field.invalid && (field.dirty || field.touched) : false;
  }

  getFieldError(fieldName: string, form: FormGroup = this.paymentFrequencyForm): string {
    const field = form.get(fieldName);
    if (field && field.errors) {
      if (field.errors['required']) return `El campo ${fieldName} es requerido.`;
      if (field.errors['minlength']) return `El campo ${fieldName} debe tener al menos ${field.errors['minlength'].requiredLength} caracteres.`;
      if (field.errors['maxlength']) return `El campo ${fieldName} no puede exceder ${field.errors['maxlength'].requiredLength} caracteres.`;
      if (field.errors['min']) return `El valor mínimo es ${field.errors['min'].min}.`;
      if (field.errors['max']) return `El valor máximo es ${field.errors['max'].max}.`;
      if (field.errors['pattern']) return `El formato del ${fieldName} no es válido.`;
    }
    return '';
  }

  onClickGenerar() {
    this.router.navigate(['/acuerdo-pago/formulario']);
  }
}
