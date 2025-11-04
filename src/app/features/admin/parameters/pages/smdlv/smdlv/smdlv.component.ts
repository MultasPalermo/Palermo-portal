import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { Router, RouterModule } from '@angular/router';
import { finalize } from 'rxjs/operators';
import { GenericMultasTableComponent } from '../../../../../../shared/components/generic-multas-table/generic-multas-table.component';
import { CardHeaderComponent } from '../../../../../../shared/components/card-header/card-header.component';
import { ButtonComponent } from '../../../../../../shared/components/button/button.component';
import { SmdlvService } from '../../../../../../core/services/parameters/smdlv.service';
import { Smdlv } from '../../../../../../shared/modeloModelados/parameters/smdlv.models';
import { ColumnDef } from '../../../../../../shared/modeloModelados/util/table.Generic';


@Component({
  selector: 'app-smdlv',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    MatCardModule,
    MatButtonModule,
    RouterModule,
    GenericMultasTableComponent,
    CardHeaderComponent,
    ButtonComponent
  ],
  templateUrl: './smdlv.component.html',
  styleUrls: ['./smdlv.component.scss']
})
export class SmdlvComponent implements OnInit {
  private router = inject(Router);
  private service = inject(SmdlvService);
  private fb = inject(FormBuilder);

  smdlvs: Smdlv[] = [];
  loading = false;
  errorMsg = '';
  successMsg = '';

  // Paginación
  currentPage: number = 1;
  itemsPerPage: number = 5;
  totalPages: number = 0;
  paginatedSmdlv: Smdlv[] = [];

  // Variables para modales
  showForm = false;
  showUpdateForm = false;
  showConfirm = false;
  showUpdateConfirm = false;
  smdlvAEliminar: Smdlv | null = null;
  smdlvSeleccionado: Smdlv | null = null;
  smdlvAActualizar: Smdlv | null = null;

  // Formularios reactivos
  smdlvForm: FormGroup;
  updateForm: FormGroup;

  // Columnas fijas para la tabla genérica
  columns: ColumnDef[] = [
    { key: 'value_smldv', header: 'Valor SMLDV', type: 'text' },
    { key: 'current_Year', header: 'Año Vigente', type: 'text' },
    { key: 'minimunWage', header: 'Salario Mínimo', type: 'text' },
    { key: 'actions', header: 'Acciones', type: 'actions' }
  ];

  constructor() {
    // Inicializar formularios reactivos
    this.smdlvForm = this.fb.group({
      value_smldv: ['', [Validators.required, Validators.min(0)]],
      current_Year: ['', [Validators.required, Validators.min(1900), Validators.max(2100)]],
      minimunWage: ['', [Validators.required, Validators.min(0)]]
    });

    this.updateForm = this.fb.group({
      value_smldv: ['', [Validators.required, Validators.min(0)]],
      current_Year: ['', [Validators.required, Validators.min(1900), Validators.max(2100)]],
      minimunWage: ['', [Validators.required, Validators.min(0)]]
    });
  }


  ngOnInit(): void {
    this.cargarSmdlv();
  }

  private cargarSmdlv(): void {
    this.loading = true;
    this.errorMsg = '';

    // 👇 Endpoint del backend: api/ValueSmldv (según tu controlador)
    this.service.genericService.getAll<Smdlv>(this.service.endpoint, 'GetAll')
      .pipe(finalize(() => this.loading = false))
      .subscribe({
        next: (rows: Smdlv[]) => {
          this.smdlvs = rows; // no hace falta mapear, ya coincide con la interfaz
          this.updatePagination();
        },
        error: (err: any) => {
          console.error('Error cargando SMLDV', err);
          this.errorMsg = 'No fue posible cargar los valores SMLDV.';
        }
      });
  }


  // Métodos para manejar formularios
  abrirFormulario(): void {
    // Solo permitir crear si no hay registros existentes
    if (this.smdlvs.length === 0) {
      this.showForm = true;
      this.smdlvForm.reset();
      this.errorMsg = '';
      this.successMsg = '';
    } else {
      this.errorMsg = 'Ya existe un valor SMLDV registrado. Solo puede actualizar el existente.';
      setTimeout(() => this.errorMsg = '', 5000);
    }
  }

  cerrarFormulario(): void {
    this.showForm = false;
    this.smdlvForm.reset();
  }

  // Método para crear SMLDV
  crearSmdlv(): void {
    if (this.smdlvForm.valid) {
      this.loading = true;
      this.errorMsg = '';
      this.successMsg = '';

      const formData = this.smdlvForm.value;
      // Calcular automáticamente el valor SMLDV como salario mínimo / 30
      const smdlvData = {
        ...formData,
        value_smldv: formData.minimunWage / 30
      };

      this.service.genericService.create<Smdlv>(this.service.endpoint, smdlvData)
        .pipe(finalize(() => this.loading = false))
        .subscribe({
          next: (nuevoSmdlv: Smdlv) => {
            this.successMsg = 'Valor SMLDV creado exitosamente.';
            this.cargarSmdlv(); // Recargar la lista
            this.cerrarFormulario();
            setTimeout(() => this.successMsg = '', 3000);
          },
          error: (error: any) => {
            console.error('Error al crear SMLDV:', error);
            this.errorMsg = error.error?.message || 'Error al crear el valor SMLDV.';
            setTimeout(() => this.errorMsg = '', 3000);
          }
        });
    } else {
      this.errorMsg = 'Por favor complete todos los campos requeridos.';
    }
  }

  // Métodos para editar SMLDV
  confirmarActualizacion(smdlv: Smdlv): void {
    this.smdlvAActualizar = smdlv;
    this.showUpdateConfirm = true;
  }

  cancelarActualizacion(): void {
    this.smdlvAActualizar = null;
    this.showUpdateConfirm = false;
  }

  abrirFormularioActualizar(): void {
    if (this.smdlvAActualizar) {
      this.smdlvSeleccionado = { ...this.smdlvAActualizar };
      // Solo cargar current_Year y minimunWage, value_smldv será calculado automáticamente
      this.updateForm.patchValue({
        current_Year: this.smdlvAActualizar.current_Year,
        minimunWage: this.smdlvAActualizar.minimunWage
      });
      this.showUpdateForm = true;
      this.showUpdateConfirm = false;
      this.smdlvAActualizar = null;
      this.errorMsg = '';
      this.successMsg = '';
    }
  }

  cerrarFormularioActualizar(): void {
    this.showUpdateForm = false;
    this.smdlvSeleccionado = null;
    this.updateForm.reset();
  }

  actualizarSmdlv(): void {
    if (this.smdlvSeleccionado && this.smdlvSeleccionado.id) {
      this.loading = true;
      this.errorMsg = '';
      this.successMsg = '';

      const formData = this.updateForm.value;
      // Calcular automáticamente el valor SMLDV como salario mínimo / 30
      const smdlvActualizado = {
        ...this.smdlvSeleccionado,
        ...formData,
        value_smldv: formData.minimunWage / 30
      };

      this.service.genericService.update<Smdlv>(this.service.endpoint, this.smdlvSeleccionado.id, smdlvActualizado)
        .pipe(finalize(() => this.loading = false))
        .subscribe({
          next: (smdlvActualizado: Smdlv) => {
            this.successMsg = 'Valor SMLDV actualizado exitosamente.';
            this.cargarSmdlv(); // Recargar la lista
            this.cerrarFormularioActualizar();
            setTimeout(() => this.successMsg = '', 3000);
          },
          error: (error: any) => {
            console.error('Error al actualizar SMLDV:', error);
            this.errorMsg = error.error?.message || 'Error al actualizar el valor SMLDV.';
            setTimeout(() => this.errorMsg = '', 3000);
          }
        });
    }
  }

  // Métodos para eliminar SMLDV
  confirmarEliminacion(smdlv: Smdlv): void {
    this.smdlvAEliminar = smdlv;
    this.showConfirm = true;
  }

  cancelarEliminacion(): void {
    this.smdlvAEliminar = null;
    this.showConfirm = false;
  }

  // Métodos de paginación
  updatePagination(): void {
    this.totalPages = Math.ceil(this.smdlvs.length / this.itemsPerPage);
    this.updatePaginatedItems();
  }

  updatePaginatedItems(): void {
    const startIndex = (this.currentPage - 1) * this.itemsPerPage;
    const endIndex = startIndex + this.itemsPerPage;
    this.paginatedSmdlv = this.smdlvs.slice(startIndex, endIndex);
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

  eliminarSmdlv(): void {
    if (this.smdlvAEliminar && this.smdlvAEliminar.id) {
      this.loading = true;
      this.errorMsg = '';
      this.successMsg = '';

      this.service.genericService.delete(this.service.endpoint, this.smdlvAEliminar.id)
        .pipe(finalize(() => this.loading = false))
        .subscribe({
          next: () => {
            this.successMsg = 'Valor SMLDV eliminado exitosamente.';
            this.cargarSmdlv(); // Recargar la lista
            this.cancelarEliminacion();
            setTimeout(() => this.successMsg = '', 3000);
          },
          error: (error: any) => {
            console.error('Error al eliminar SMLDV:', error);
            this.errorMsg = error.error?.message || 'Error al eliminar el valor SMLDV.';
            setTimeout(() => this.errorMsg = '', 3000);
          }
        });
    }
  }

  // Métodos auxiliares para validaciones
  isFieldInvalid(fieldName: string, form: FormGroup = this.updateForm): boolean {
    const field = form.get(fieldName);
    return field ? field.invalid && (field.dirty || field.touched) : false;
  }

  // Método para verificar si el formulario de actualización tiene cambios
  hasFormChanges(): boolean {
    if (!this.smdlvSeleccionado) return false;

    const currentValues = this.updateForm.value;
    return currentValues.current_Year !== this.smdlvSeleccionado.current_Year ||
           currentValues.minimunWage !== this.smdlvSeleccionado.minimunWage;
  }

  getFieldError(fieldName: string, form: FormGroup = this.updateForm): string {
    const field = form.get(fieldName);
    if (field && field.errors) {
      if (field.errors['required']) return `El campo ${fieldName} es requerido.`;
      if (field.errors['min']) return `El campo ${fieldName} debe ser mayor o igual a ${field.errors['min'].min}.`;
      if (field.errors['max']) return `El campo ${fieldName} debe ser menor o igual a ${field.errors['max'].max}.`;
    }
    return '';
  }

  // Método para determinar si mostrar el botón de crear
  mostrarBotonCrear(): boolean {
    return this.smdlvs.length === 0;
  }

  onClickGenerar() {
    this.router.navigate(['/acuerdo-pago/formulario']);
  }
}
