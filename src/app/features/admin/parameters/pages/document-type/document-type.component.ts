import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { finalize } from 'rxjs/operators';
import { DocumentTypeService } from '../../../../../core/services/parameters/document-type.service';
import { DocumentTypeDto } from '../../../../../shared/modeloModelados/parameters/document-type.models';
import { PaginationComponent } from '../../../../../shared/components/pagination/pagination.component';
import { PaginationConfig, PaginationService } from '../../../../../shared/services/pagination.service';




@Component({
  selector: 'app-document-type',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    PaginationComponent
  ],
  templateUrl: './document-type.component.html',
  styleUrls: ['./document-type.component.scss']
})
export class DocumentTypeComponent implements OnInit {
  private service = inject(DocumentTypeService);
  private fb = inject(FormBuilder);
  private paginationService = inject(PaginationService);

  tipos: DocumentTypeDto[] = [];
  filteredTipos: DocumentTypeDto[] = [];
  paginatedTipos: DocumentTypeDto[] = [];
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
  documentTypeAEliminar: DocumentTypeDto | null = null;
  documentTypeSeleccionado: DocumentTypeDto | null = null;
  documentTypeAActualizar: DocumentTypeDto | null = null;

  // Formularios reactivos
  documentTypeForm: FormGroup;
  updateForm: FormGroup;

  // Alertas estandarizadas
  showAlert = false;
  alertType: 'creado' | 'eliminado' | 'error' | 'info' = 'creado';
  alertMsg = '';

  constructor() {
    // Inicializar formularios reactivos
    this.documentTypeForm = this.fb.group({
      name: ['', [Validators.required, Validators.minLength(2), Validators.maxLength(100)]],
      abbreviation: ['', [Validators.required, Validators.minLength(1), Validators.maxLength(10)]]
    });

    this.updateForm = this.fb.group({
      name: ['', [Validators.required, Validators.minLength(2), Validators.maxLength(100)]],
      abbreviation: ['', [Validators.required, Validators.minLength(1), Validators.maxLength(10)]]
    });
  }

  ngOnInit(): void {
    this.cargarDocumentTypeDtos();
  }

  private cargarDocumentTypeDtos(): void {
    this.loading = true;

    this.service.genericService.getAll<DocumentTypeDto>(this.service.endpoint, 'GetAll')
      .pipe(finalize(() => this.loading = false))
      .subscribe({
        next: (rows) => {
          this.tipos = rows;
          this.filteredTipos = rows;
          this.updatePagination();
        },
        error: (err) => {
          console.error('Error cargando tipos de documento', err);
          this.mostrarAlerta('error', 'No fue posible cargar los tipos de documento.');
        }
      });
  }

  // Métodos para manejar formularios
  abrirFormulario(): void {
    this.showForm = true;
    this.documentTypeForm.reset();
  }

  cerrarFormulario(): void {
    this.showForm = false;
    this.documentTypeForm.reset();
  }

  // Método para crear tipo de documento
  crearDocumentTypeDto(): void {
    if (this.documentTypeForm.valid) {
      this.loading = true;

      const documentTypeData = this.documentTypeForm.value;

      this.service.genericService.create<DocumentTypeDto>(this.service.endpoint, documentTypeData)
        .pipe(finalize(() => this.loading = false))
        .subscribe({
          next: (nuevoDocumentTypeDto: DocumentTypeDto) => {
            this.mostrarAlerta('creado', 'Tipo de documento creado exitosamente.');
            this.cargarDocumentTypeDtos();
            this.cerrarFormulario();
          },
          error: (error: any) => {
            console.error('Error al crear tipo de documento:', error);
            this.mostrarAlerta('error', error.error?.message || 'Error al crear el tipo de documento.');
          }
        });
    } else {
      this.mostrarAlerta('error', 'Por favor complete todos los campos requeridos.');
    }
  }

  // Métodos para editar tipo de documento
  confirmarActualizacion(documentType: DocumentTypeDto): void {
    this.documentTypeAActualizar = documentType;
    this.showUpdateConfirm = true;
  }

  cancelarActualizacion(): void {
    this.documentTypeAActualizar = null;
    this.showUpdateConfirm = false;
  }

  abrirFormularioActualizar(): void {
    if (this.documentTypeAActualizar) {
      this.documentTypeSeleccionado = { ...this.documentTypeAActualizar };
      this.updateForm.patchValue({
        name: this.documentTypeAActualizar.name,
        abbreviation: this.documentTypeAActualizar.abbreviation
      });
      this.showUpdateForm = true;
      this.showUpdateConfirm = false;
      this.documentTypeAActualizar = null;
    }
  }

  cerrarFormularioActualizar(): void {
    this.showUpdateForm = false;
    this.documentTypeSeleccionado = null;
    this.updateForm.reset();
  }

  actualizarDocumentTypeDto(): void {
    if (this.updateForm.valid && this.documentTypeSeleccionado && this.documentTypeSeleccionado.id) {
      this.loading = true;

      const documentTypeActualizado = {
        ...this.documentTypeSeleccionado,
        ...this.updateForm.value
      };

      this.service.genericService.update<DocumentTypeDto>(this.service.endpoint, this.documentTypeSeleccionado.id, documentTypeActualizado)
        .pipe(finalize(() => this.loading = false))
        .subscribe({
          next: (documentTypeActualizado: DocumentTypeDto) => {
            this.mostrarAlerta('creado', 'Tipo de documento actualizado exitosamente.');
            this.cargarDocumentTypeDtos();
            this.cerrarFormularioActualizar();
          },
          error: (error: any) => {
            console.error('Error al actualizar tipo de documento:', error);
            this.mostrarAlerta('error', error.error?.message || 'Error al actualizar el tipo de documento.');
          }
        });
    } else {
      this.mostrarAlerta('error', 'Por favor complete todos los campos requeridos.');
    }
  }

  // Métodos para eliminar tipo de documento
  confirmarEliminacion(documentType: DocumentTypeDto): void {
    this.documentTypeAEliminar = documentType;
    this.showConfirm = true;
  }

  cancelarEliminacion(): void {
    this.documentTypeAEliminar = null;
    this.showConfirm = false;
  }

  eliminarDocumentTypeDto(): void {
    if (this.documentTypeAEliminar && this.documentTypeAEliminar.id) {
      this.loading = true;

      this.service.genericService.delete(this.service.endpoint, this.documentTypeAEliminar.id)
        .pipe(finalize(() => this.loading = false))
        .subscribe({
          next: () => {
            this.mostrarAlerta('eliminado', 'Tipo de documento eliminado exitosamente.');
            this.cargarDocumentTypeDtos();
            this.cancelarEliminacion();
          },
          error: (error: any) => {
            console.error('Error al eliminar tipo de documento:', error);
            this.mostrarAlerta('error', error.error?.message || 'Error al eliminar el tipo de documento.');
          }
        });
    }
  }

  // Métodos de paginación
  updatePagination(): void {
    this.paginationConfig = this.paginationService.updatePagination(this.paginationConfig, this.filteredTipos.length);
    this.updatePaginatedItems();
  }

  updatePaginatedItems(): void {
    this.paginatedTipos = this.paginationService.getPaginatedItems(this.filteredTipos, this.paginationConfig);
  }

  onPageChange(page: number): void {
    this.paginationConfig = this.paginationService.goToPage(this.paginationConfig, page);
    this.updatePaginatedItems();
  }

  // Método de búsqueda
  filterTipos(): void {
    if (!this.searchTerm.trim()) {
      this.filteredTipos = [...this.tipos];
    } else {
      const term = this.searchTerm.toLowerCase().trim();
      this.filteredTipos = this.tipos.filter(tipo =>
        tipo.name?.toLowerCase().includes(term) ||
        tipo.abbreviation?.toLowerCase().includes(term)
      );
    }
    this.paginationConfig.currentPage = 1;
    this.updatePagination();
  }

  clearSearch(): void {
    this.searchTerm = '';
    this.filterTipos();
  }

  // Método de alerta estandarizado
  mostrarAlerta(tipo: 'creado' | 'eliminado' | 'error' | 'info', mensaje: string): void {
    this.alertType = tipo;
    this.alertMsg = mensaje;
    this.showAlert = true;
    setTimeout(() => this.showAlert = false, 2500);
  }

  // Métodos auxiliares para validaciones
  isFieldInvalid(fieldName: string, form: FormGroup = this.documentTypeForm): boolean {
    const field = form.get(fieldName);
    return field ? field.invalid && (field.dirty || field.touched) : false;
  }

  getFieldError(fieldName: string, form: FormGroup = this.documentTypeForm): string {
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
