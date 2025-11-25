import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { finalize } from 'rxjs/operators';
import { MunicipalityService } from '../../../../../core/services/parameters/municipality.service';
import { Municipality } from '../../../../../shared/modeloModelados/parameters/municipality.models';
import { PaginationComponent } from '../../../../../shared/components/pagination/pagination.component';
import { PaginationConfig, PaginationService } from '../../../../../shared/services/pagination.service';

@Component({
  selector: 'app-municipality',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    PaginationComponent
  ],
  templateUrl: './municipality.component.html',
  styleUrls: ['./municipality.component.scss']
})
export class MunicipalityComponent implements OnInit {
  private service = inject(MunicipalityService);
  private fb = inject(FormBuilder);
  private paginationService = inject(PaginationService);

  municipios: Municipality[] = [];
  filteredMunicipios: Municipality[] = [];
  paginatedMunicipios: Municipality[] = [];
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
  municipalityAEliminar: Municipality | null = null;
  municipalitySeleccionado: Municipality | null = null;
  municipalityAActualizar: Municipality | null = null;

  // Formularios reactivos
  municipalityForm: FormGroup;
  updateForm: FormGroup;

  // Alertas estandarizadas
  showAlert = false;
  alertType: 'creado' | 'eliminado' | 'error' | 'info' = 'creado';
  alertMsg = '';

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
    this.service.genericService.getAll<Municipality>(this.service.endpoint, 'GetAll')
      .pipe(finalize(() => this.loading = false))
        .subscribe({
          next: (r: Municipality[]) => {
            this.municipios = r;
            this.filteredMunicipios = r;
            this.updatePagination();
          },
          error: (e: any) => {
            console.error('Error cargando municipios', e);
            this.mostrarAlerta('error', 'No fue posible cargar los municipios.');
          }
        });
  }

  // Métodos para manejar formularios
  abrirFormulario(): void {
    this.showForm = true;
    this.municipalityForm.reset();
  }

  cerrarFormulario(): void {
    this.showForm = false;
    this.municipalityForm.reset();
  }

  // Método para crear municipio
  crearMunicipio(): void {
    if (this.municipalityForm.valid) {
      this.loading = true;

      const municipalityData = this.municipalityForm.value;

      this.service.genericService.create<Municipality>(this.service.endpoint, municipalityData)
        .pipe(finalize(() => this.loading = false))
        .subscribe({
          next: (nuevoMunicipio: Municipality) => {
            this.mostrarAlerta('creado', 'Municipio creado exitosamente.');
            this.cargarMunicipios();
            this.cerrarFormulario();
          },
          error: (error: any) => {
            console.error('Error al crear municipio:', error);
            this.mostrarAlerta('error', error.error?.message || 'Error al crear el municipio.');
          }
        });
    } else {
      this.mostrarAlerta('error', 'Por favor complete todos los campos requeridos.');
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

      const municipalityActualizado = {
        ...this.municipalitySeleccionado,
        ...this.updateForm.value
      };

      this.service.genericService.update<Municipality>(this.service.endpoint, this.municipalitySeleccionado.id, municipalityActualizado)
        .pipe(finalize(() => this.loading = false))
        .subscribe({
          next: (municipalityActualizado: Municipality) => {
            this.mostrarAlerta('creado', 'Municipio actualizado exitosamente.');
            this.cargarMunicipios();
            this.cerrarFormularioActualizar();
          },
          error: (error: any) => {
            console.error('Error al actualizar municipio:', error);
            this.mostrarAlerta('error', error.error?.message || 'Error al actualizar el municipio.');
          }
        });
    } else {
      this.mostrarAlerta('error', 'Por favor complete todos los campos requeridos.');
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

  eliminarMunicipio(): void {
    if (this.municipalityAEliminar && this.municipalityAEliminar.id) {
      this.loading = true;

      this.service.genericService.delete(this.service.endpoint, this.municipalityAEliminar.id)
        .pipe(finalize(() => this.loading = false))
        .subscribe({
          next: () => {
            this.mostrarAlerta('eliminado', 'Municipio eliminado exitosamente.');
            this.cargarMunicipios();
            this.cancelarEliminacion();
          },
          error: (error: any) => {
            console.error('Error al eliminar municipio:', error);
            this.mostrarAlerta('error', error.error?.message || 'Error al eliminar el municipio.');
          }
        });
    }
  }

  // Métodos de paginación
  updatePagination(): void {
    this.paginationConfig = this.paginationService.updatePagination(this.paginationConfig, this.filteredMunicipios.length);
    this.updatePaginatedItems();
  }

  updatePaginatedItems(): void {
    this.paginatedMunicipios = this.paginationService.getPaginatedItems(this.filteredMunicipios, this.paginationConfig);
  }

  onPageChange(page: number): void {
    this.paginationConfig = this.paginationService.goToPage(this.paginationConfig, page);
    this.updatePaginatedItems();
  }

  // Método de búsqueda
  filterMunicipios(): void {
    if (!this.searchTerm.trim()) {
      this.filteredMunicipios = [...this.municipios];
    } else {
      const term = this.searchTerm.toLowerCase().trim();
      this.filteredMunicipios = this.municipios.filter(municipio =>
        municipio.name?.toLowerCase().includes(term) ||
        municipio.daneCode?.toString().includes(term) ||
        municipio.departmentName?.toLowerCase().includes(term)
      );
    }
    this.paginationConfig.currentPage = 1;
    this.updatePagination();
  }

  clearSearch(): void {
    this.searchTerm = '';
    this.filterMunicipios();
  }

  // Método de alerta estandarizado
  mostrarAlerta(tipo: 'creado' | 'eliminado' | 'error' | 'info', mensaje: string): void {
    this.alertType = tipo;
    this.alertMsg = mensaje;
    this.showAlert = true;
    setTimeout(() => this.showAlert = false, 2500);
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
}
