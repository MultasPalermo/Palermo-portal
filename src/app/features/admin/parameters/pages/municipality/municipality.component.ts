import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { finalize } from 'rxjs/operators';
import { Router } from '@angular/router';
import { GenericMultasTableComponent } from '../../../../../shared/components/generic-multas-table/generic-multas-table.component';
import { CardHeaderComponent } from '../../../../../shared/components/card-header/card-header.component';
import { ButtonComponent } from '../../../../../shared/components/button/button.component';
import { MunicipalityService } from '../../../../../core/services/parameters/municipality.service';
import { Municipality } from '../../../../../shared/modeloModelados/parameters/municipality.models';
import { ColumnDef } from '../../../../../shared/modeloModelados/util/table.Generic';

@Component({
  selector: 'app-municipality',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule, MatCardModule, GenericMultasTableComponent, CardHeaderComponent, ButtonComponent],
  templateUrl: './municipality.component.html',
  styleUrls: ['./municipality.component.scss']
})
export class MunicipalityComponent implements OnInit {
  private router = inject(Router);
  private service = inject(MunicipalityService);
  private fb = inject(FormBuilder);

  municipios: Municipality[] = [];
  loading = false;
  errorMsg = '';
  successMsg = '';

  // Paginación
  currentPage: number = 1;
  itemsPerPage: number = 5;
  totalPages: number = 0;
  paginatedMunicipios: Municipality[] = [];

  // Variables para modales
  showForm = false;
  showUpdateForm = false;
  showConfirm = false;
  showUpdateConfirm = false;
  municipalityAEliminar: Municipality | null = null;
  municipalitySeleccionado: Municipality | null = null;
  municipalityAActualizar: Municipality | null = null;

  // Formularios reactivos
  municipalityForm: FormGroup;
  updateForm: FormGroup;

  columns: ColumnDef[] = [
    { key: 'name',           header: 'Municipio',      type: 'text' },
    { key: 'daneCode',       header: 'Código DANE',    type: 'text' },
    { key: 'departmentName', header: 'Departamento',   type: 'text' },
  ];

  constructor() {
    // Inicializar formularios reactivos
    this.municipalityForm = this.fb.group({
      name: ['', [Validators.required, Validators.minLength(2), Validators.maxLength(60)]],
      daneCode: ['', [Validators.required, Validators.pattern(/^\d{1,5}$/), Validators.maxLength(5)]],
      departmentId: ['', [Validators.required]]
    });

    this.updateForm = this.fb.group({
      name: ['', [Validators.required, Validators.minLength(2), Validators.maxLength(60)]],
      daneCode: ['', [Validators.required, Validators.pattern(/^\d{1,5}$/), Validators.maxLength(5)]],
      departmentId: ['', [Validators.required]]
    });
  }

  ngOnInit(): void {
    this.cargarMunicipios();
  }

  private cargarMunicipios(): void {
    this.loading = true;
    this.errorMsg = '';
    this.service.genericService.getAll<Municipality>(this.service.endpoint, 'GetAll')
      .pipe(finalize(() => this.loading = false))
        .subscribe({
          next: (r: Municipality[]) => {
            this.municipios = r;
            this.updatePagination();
          },
          error: (e: any) => this.errorMsg = 'No fue posible cargar los municipios.'
        });
  }

  // Métodos para manejar formularios
  abrirFormulario(): void {
    this.showForm = true;
    this.municipalityForm.reset();
    this.errorMsg = '';
    this.successMsg = '';
  }

  cerrarFormulario(): void {
    this.showForm = false;
    this.municipalityForm.reset();
  }

  // Método para crear municipio
  crearMunicipio(): void {
    if (this.municipalityForm.valid) {
      this.loading = true;
      this.errorMsg = '';
      this.successMsg = '';

      const municipalityData = this.municipalityForm.value;

      this.service.genericService.create<Municipality>(this.service.endpoint, municipalityData)
        .pipe(finalize(() => this.loading = false))
        .subscribe({
          next: (nuevoMunicipio: Municipality) => {
            this.successMsg = 'Municipio creado exitosamente.';
            this.cargarMunicipios(); // Recargar la lista
            this.cerrarFormulario();
            setTimeout(() => this.successMsg = '', 3000);
          },
          error: (error: any) => {
            console.error('Error al crear municipio:', error);
            this.errorMsg = error.error?.message || 'Error al crear el municipio.';
            setTimeout(() => this.errorMsg = '', 3000);
          }
        });
    } else {
      this.errorMsg = 'Por favor complete todos los campos requeridos.';
    }
  }

  // Métodos para editar municipio
  confirmarActualizacion(municipality: Municipality): void {
    this.municipalityAActualizar = municipality;
    this.showUpdateConfirm = true;
  }

  cancelarActualizacion(): void {
    this.municipalityAActualizar = null;
    this.showUpdateConfirm = false;
  }

  abrirFormularioActualizar(): void {
    if (this.municipalityAActualizar) {
      this.municipalitySeleccionado = { ...this.municipalityAActualizar };
      this.updateForm.patchValue({
        name: this.municipalityAActualizar.name,
        daneCode: this.municipalityAActualizar.daneCode,
        departmentId: this.municipalityAActualizar.departmentId
      });
      this.showUpdateForm = true;
      this.showUpdateConfirm = false;
      this.municipalityAActualizar = null;
      this.errorMsg = '';
      this.successMsg = '';
    }
  }

  cerrarFormularioActualizar(): void {
    this.showUpdateForm = false;
    this.municipalitySeleccionado = null;
    this.updateForm.reset();
  }

  actualizarMunicipio(): void {
    if (this.updateForm.valid && this.municipalitySeleccionado && this.municipalitySeleccionado.id) {
      this.loading = true;
      this.errorMsg = '';
      this.successMsg = '';

      const municipalityActualizado = {
        ...this.municipalitySeleccionado,
        ...this.updateForm.value
      };

      this.service.genericService.update<Municipality>(this.service.endpoint, this.municipalitySeleccionado.id, municipalityActualizado)
        .pipe(finalize(() => this.loading = false))
        .subscribe({
          next: (municipalityActualizado: Municipality) => {
            this.successMsg = 'Municipio actualizado exitosamente.';
            this.cargarMunicipios(); // Recargar la lista
            this.cerrarFormularioActualizar();
            setTimeout(() => this.successMsg = '', 3000);
          },
          error: (error: any) => {
            console.error('Error al actualizar municipio:', error);
            this.errorMsg = error.error?.message || 'Error al actualizar el municipio.';
            setTimeout(() => this.errorMsg = '', 3000);
          }
        });
    } else {
      this.errorMsg = 'Por favor complete todos los campos requeridos.';
    }
  }

  // Métodos para eliminar municipio
  confirmarEliminacion(municipality: Municipality): void {
    this.municipalityAEliminar = municipality;
    this.showConfirm = true;
  }

  cancelarEliminacion(): void {
    this.municipalityAEliminar = null;
    this.showConfirm = false;
  }

  // Métodos de paginación
  updatePagination(): void {
    this.totalPages = Math.ceil(this.municipios.length / this.itemsPerPage);
    this.updatePaginatedItems();
  }

  updatePaginatedItems(): void {
    const startIndex = (this.currentPage - 1) * this.itemsPerPage;
    const endIndex = startIndex + this.itemsPerPage;
    this.paginatedMunicipios = this.municipios.slice(startIndex, endIndex);
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

  eliminarMunicipio(): void {
    if (this.municipalityAEliminar && this.municipalityAEliminar.id) {
      this.loading = true;
      this.errorMsg = '';
      this.successMsg = '';

      this.service.genericService.delete(this.service.endpoint, this.municipalityAEliminar.id)
        .pipe(finalize(() => this.loading = false))
        .subscribe({
          next: () => {
            this.successMsg = 'Municipio eliminado exitosamente.';
            this.cargarMunicipios(); // Recargar la lista
            this.cancelarEliminacion();
            setTimeout(() => this.successMsg = '', 3000);
          },
          error: (error: any) => {
            console.error('Error al eliminar municipio:', error);
            this.errorMsg = error.error?.message || 'Error al eliminar el municipio.';
            setTimeout(() => this.errorMsg = '', 3000);
          }
        });
    }
  }

  // Métodos auxiliares para validaciones
  isFieldInvalid(fieldName: string, form: FormGroup = this.municipalityForm): boolean {
    const field = form.get(fieldName);
    return field ? field.invalid && (field.dirty || field.touched) : false;
  }

  getFieldError(fieldName: string, form: FormGroup = this.municipalityForm): string {
    const field = form.get(fieldName);
    if (field && field.errors) {
      if (field.errors['required']) return `El campo ${fieldName} es requerido.`;
      if (field.errors['minlength']) return `El campo ${fieldName} debe tener al menos ${field.errors['minlength'].requiredLength} caracteres.`;
      if (field.errors['maxlength']) return `El campo ${fieldName} no puede exceder ${field.errors['maxlength'].requiredLength} caracteres.`;
      if (field.errors['pattern']) return `El formato del ${fieldName} no es válido.`;
    }
    return '';
  }

  // Método comentado ya que no se necesita navegación
  // onClickGenerar() {
  //   this.router.navigate(['/acuerdo-pago/formulario']);
  // }
}
