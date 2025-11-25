import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { finalize } from 'rxjs/operators';
import { DepartmentService } from '../../../../../core/services/parameters/department.service';
import { Department } from '../../../../../shared/modeloModelados/parameters/department.models';
import { PaginationComponent } from '../../../../../shared/components/pagination/pagination.component';
import { PaginationConfig, PaginationService } from '../../../../../shared/services/pagination.service';



@Component({
  selector: 'app-department',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    PaginationComponent
  ],
  templateUrl: './department.component.html',
  styleUrls: ['./department.component.scss']
})
export class DepartmentComponent implements OnInit {
  private service = inject(DepartmentService);
  private fb = inject(FormBuilder);
  private paginationService = inject(PaginationService);

  departamentos: Department[] = [];
  filteredDepartamentos: Department[] = [];
  paginatedDepartamentos: Department[] = [];
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
  departmentAEliminar: Department | null = null;
  departmentSeleccionado: Department | null = null;
  departmentAActualizar: Department | null = null;

  // Formularios reactivos
  departmentForm: FormGroup;
  updateForm: FormGroup;

  // Alertas estandarizadas
  showAlert = false;
  alertType: 'creado' | 'eliminado' | 'error' | 'info' = 'creado';
  alertMsg = '';

  constructor() {
    // Inicializar formularios reactivos
    this.departmentForm = this.fb.group({
      name: ['', [Validators.required, Validators.minLength(2), Validators.maxLength(50)]],
      daneCode: ['', [Validators.required, Validators.pattern(/^\d{1,5}$/), Validators.maxLength(5)]]
    });

    this.updateForm = this.fb.group({
      name: ['', [Validators.required, Validators.minLength(2), Validators.maxLength(50)]],
      daneCode: ['', [Validators.required, Validators.pattern(/^\d{1,5}$/), Validators.maxLength(5)]]
    });
  }


  ngOnInit(): void {
    this.cargarDepartamentos();
  }

  private cargarDepartamentos(): void {
    this.loading = true;

    this.service.genericService.getAll<Department>(this.service.endpoint, 'GetAll')
      .pipe(finalize(() => this.loading = false))
      .subscribe({
        next: (rows: Department[]) => {
          this.departamentos = rows;
          this.filteredDepartamentos = rows;
          this.updatePagination();
        },
        error: (err: any) => {
          console.error('Error cargando departamentos', err);
          this.mostrarAlerta('error', 'No fue posible cargar los departamentos.');
        }
      });
  }

  // Métodos para manejar formularios
  abrirFormulario(): void {
    this.showForm = true;
    this.departmentForm.reset();
  }

  cerrarFormulario(): void {
    this.showForm = false;
    this.departmentForm.reset();
  }

  // Método para crear departamento
  crearDepartamento(): void {
    if (this.departmentForm.valid) {
      this.loading = true;

      const departmentData = this.departmentForm.value;

      this.service.genericService.create<Department>(this.service.endpoint, departmentData)
        .pipe(finalize(() => this.loading = false))
        .subscribe({
          next: (nuevoDepartamento: Department) => {
            this.mostrarAlerta('creado', 'Departamento creado exitosamente.');
            this.cargarDepartamentos();
            this.cerrarFormulario();
          },
          error: (error: any) => {
            console.error('Error al crear departamento:', error);
            this.mostrarAlerta('error', error.error?.message || 'Error al crear el departamento.');
          }
        });
    } else {
      this.mostrarAlerta('error', 'Por favor complete todos los campos requeridos.');
    }
  }

  // Métodos para editar departamento
  confirmarActualizacion(department: Department): void {
    this.departmentAActualizar = department;
    this.showUpdateConfirm = true;
  }

  cancelarActualizacion(): void {
    this.departmentAActualizar = null;
    this.showUpdateConfirm = false;
  }

  abrirFormularioActualizar(): void {
    if (this.departmentAActualizar) {
      this.departmentSeleccionado = { ...this.departmentAActualizar };
      this.updateForm.patchValue({
        name: this.departmentAActualizar.name,
        daneCode: this.departmentAActualizar.daneCode
      });
      this.showUpdateForm = true;
      this.showUpdateConfirm = false;
      this.departmentAActualizar = null;
    }
  }

  cerrarFormularioActualizar(): void {
    this.showUpdateForm = false;
    this.departmentSeleccionado = null;
    this.updateForm.reset();
  }

  actualizarDepartamento(): void {
    if (this.updateForm.valid && this.departmentSeleccionado && this.departmentSeleccionado.id) {
      this.loading = true;

      const departmentActualizado = {
        ...this.departmentSeleccionado,
        ...this.updateForm.value
      };

      this.service.genericService.update<Department>(this.service.endpoint, this.departmentSeleccionado.id, departmentActualizado)
        .pipe(finalize(() => this.loading = false))
        .subscribe({
          next: (departmentActualizado: Department) => {
            this.mostrarAlerta('creado', 'Departamento actualizado exitosamente.');
            this.cargarDepartamentos();
            this.cerrarFormularioActualizar();
          },
          error: (error: any) => {
            console.error('Error al actualizar departamento:', error);
            this.mostrarAlerta('error', error.error?.message || 'Error al actualizar el departamento.');
          }
        });
    } else {
      this.mostrarAlerta('error', 'Por favor complete todos los campos requeridos.');
    }
  }

  // Métodos para eliminar departamento
  confirmarEliminacion(department: Department): void {
    this.departmentAEliminar = department;
    this.showConfirm = true;
  }

  cancelarEliminacion(): void {
    this.departmentAEliminar = null;
    this.showConfirm = false;
  }

  // Métodos de paginación
  updatePagination(): void {
    this.paginationConfig = this.paginationService.updatePagination(this.paginationConfig, this.filteredDepartamentos.length);
    this.updatePaginatedItems();
  }

  updatePaginatedItems(): void {
    this.paginatedDepartamentos = this.paginationService.getPaginatedItems(this.filteredDepartamentos, this.paginationConfig);
  }

  onPageChange(page: number): void {
    this.paginationConfig = this.paginationService.goToPage(this.paginationConfig, page);
    this.updatePaginatedItems();
  }

  // Método de búsqueda
  filterDepartamentos(): void {
    if (!this.searchTerm.trim()) {
      this.filteredDepartamentos = [...this.departamentos];
    } else {
      const term = this.searchTerm.toLowerCase().trim();
      this.filteredDepartamentos = this.departamentos.filter(dept =>
        dept.name?.toLowerCase().includes(term) ||
        dept.daneCode?.toString().includes(term)
      );
    }
    this.paginationConfig.currentPage = 1;
    this.updatePagination();
  }

  clearSearch(): void {
    this.searchTerm = '';
    this.filterDepartamentos();
  }

  // Método de alerta estandarizado
  mostrarAlerta(tipo: 'creado' | 'eliminado' | 'error' | 'info', mensaje: string): void {
    this.alertType = tipo;
    this.alertMsg = mensaje;
    this.showAlert = true;
    setTimeout(() => this.showAlert = false, 2500);
  }

  eliminarDepartamento(): void {
    if (this.departmentAEliminar && this.departmentAEliminar.id) {
      this.loading = true;

      this.service.genericService.delete(this.service.endpoint, this.departmentAEliminar.id)
        .pipe(finalize(() => this.loading = false))
        .subscribe({
          next: () => {
            this.mostrarAlerta('eliminado', 'Departamento eliminado exitosamente.');
            this.cargarDepartamentos();
            this.cancelarEliminacion();
          },
          error: (error: any) => {
            console.error('Error al eliminar departamento:', error);
            this.mostrarAlerta('error', error.error?.message || 'Error al eliminar el departamento.');
          }
        });
    }
  }

  // Métodos auxiliares para validaciones
  isFieldInvalid(fieldName: string, form: FormGroup = this.departmentForm): boolean {
    const field = form.get(fieldName);
    return field ? field.invalid && (field.dirty || field.touched) : false;
  }

  getFieldError(fieldName: string, form: FormGroup = this.departmentForm): string {
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
