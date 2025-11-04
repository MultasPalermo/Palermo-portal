import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { finalize } from 'rxjs/operators';
import { Router } from '@angular/router';
import { CardHeaderComponent } from '../../../../../shared/components/card-header/card-header.component';
import { ButtonComponent } from '../../../../../shared/components/button/button.component';
import { DocumentTypeService } from '../../../../../core/services/parameters/document-type.service';
import { DocumentTypeDto } from '../../../../../shared/modeloModelados/parameters/document-type.models';
import { ColumnDef } from '../../../../../shared/modeloModelados/util/table.Generic';




@Component({
  selector: 'app-document-type',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule, MatCardModule, CardHeaderComponent, ButtonComponent],
  templateUrl: './document-type.component.html',
  styleUrls: ['./document-type.component.scss']
})
export class DocumentTypeComponent implements OnInit {
  private router = inject(Router);
  private service = inject(DocumentTypeService);
  private fb = inject(FormBuilder);

  tipos: DocumentTypeDto[] = [];
  loading = false;
  errorMsg = '';
  successMsg = '';

  // Variables para modales
  showForm = false;
  showUpdateForm = false;
  showConfirm = false;
  documentTypeAEliminar: DocumentTypeDto | null = null;
  documentTypeSeleccionado: DocumentTypeDto | null = null;

  // Formularios reactivos
  documentTypeForm: FormGroup;
  updateForm: FormGroup;

  columns: ColumnDef[] = [
    { key: 'name',         header: 'Tipo de documento', type: 'text' },
    { key: 'abbreviation', header: 'Abreviatura',       type: 'text' },
    { key: 'actions',      header: 'Acciones',          type: 'actions' }
  ];

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
    this.errorMsg = '';

    this.service.genericService.getAll<DocumentTypeDto>(this.service.endpoint, 'GetAll')
      .pipe(finalize(() => this.loading = false))
      .subscribe({
        next: (rows) => {
          this.tipos = rows;
        },
        error: (err) => {
          console.error('Error cargando tipos de documento', err);
          this.errorMsg = 'No fue posible cargar los tipos de documento.';
        }
      });
  }

  // Métodos para manejar formularios
  abrirFormulario(): void {
    this.showForm = true;
    this.documentTypeForm.reset();
    this.errorMsg = '';
    this.successMsg = '';
  }

  cerrarFormulario(): void {
    this.showForm = false;
    this.documentTypeForm.reset();
  }

  // Método para crear tipo de documento
  crearDocumentTypeDto(): void {
    if (this.documentTypeForm.valid) {
      this.loading = true;
      this.errorMsg = '';
      this.successMsg = '';

      const documentTypeData = this.documentTypeForm.value;

      this.service.genericService.create<DocumentTypeDto>(this.service.endpoint, documentTypeData)
        .pipe(finalize(() => this.loading = false))
        .subscribe({
          next: (nuevoDocumentTypeDto: DocumentTypeDto) => {
            this.successMsg = 'Tipo de documento creado exitosamente.';
            this.cargarDocumentTypeDtos(); // Recargar la lista
            this.cerrarFormulario();
            setTimeout(() => this.successMsg = '', 3000);
          },
          error: (error: any) => {
            console.error('Error al crear tipo de documento:', error);
            this.errorMsg = error.error?.message || 'Error al crear el tipo de documento.';
            setTimeout(() => this.errorMsg = '', 3000);
          }
        });
    } else {
      this.errorMsg = 'Por favor complete todos los campos requeridos.';
    }
  }

  // Métodos para editar tipo de documento
  abrirFormularioActualizar(documentType: DocumentTypeDto): void {
    this.documentTypeSeleccionado = { ...documentType };
    this.updateForm.patchValue({
      name: documentType.name,
      abbreviation: documentType.abbreviation
    });
    this.showUpdateForm = true;
    this.errorMsg = '';
    this.successMsg = '';
  }

  cerrarFormularioActualizar(): void {
    this.showUpdateForm = false;
    this.documentTypeSeleccionado = null;
    this.updateForm.reset();
  }

  actualizarDocumentTypeDto(): void {
    if (this.updateForm.valid && this.documentTypeSeleccionado && this.documentTypeSeleccionado.id) {
      this.loading = true;
      this.errorMsg = '';
      this.successMsg = '';

      const documentTypeActualizado = {
        ...this.documentTypeSeleccionado,
        ...this.updateForm.value
      };

      this.service.genericService.update<DocumentTypeDto>(this.service.endpoint, this.documentTypeSeleccionado.id, documentTypeActualizado)
        .pipe(finalize(() => this.loading = false))
        .subscribe({
          next: (documentTypeActualizado: DocumentTypeDto) => {
            this.successMsg = 'Tipo de documento actualizado exitosamente.';
            this.cargarDocumentTypeDtos(); // Recargar la lista
            this.cerrarFormularioActualizar();
            setTimeout(() => this.successMsg = '', 3000);
          },
          error: (error: any) => {
            console.error('Error al actualizar tipo de documento:', error);
            this.errorMsg = error.error?.message || 'Error al actualizar el tipo de documento.';
            setTimeout(() => this.errorMsg = '', 3000);
          }
        });
    } else {
      this.errorMsg = 'Por favor complete todos los campos requeridos.';
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
      this.errorMsg = '';
      this.successMsg = '';

      this.service.genericService.delete(this.service.endpoint, this.documentTypeAEliminar.id)
        .pipe(finalize(() => this.loading = false))
        .subscribe({
          next: () => {
            this.successMsg = 'Tipo de documento eliminado exitosamente.';
            this.cargarDocumentTypeDtos(); // Recargar la lista
            this.cancelarEliminacion();
            setTimeout(() => this.successMsg = '', 3000);
          },
          error: (error: any) => {
            console.error('Error al eliminar tipo de documento:', error);
            this.errorMsg = error.error?.message || 'Error al eliminar el tipo de documento.';
            setTimeout(() => this.errorMsg = '', 3000);
          }
        });
    }
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

  onClickGenerar() {
    this.router.navigate(['/acuerdo-pago/formulario']);
  }
}
