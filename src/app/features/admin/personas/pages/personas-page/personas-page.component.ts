import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { PaginationComponent } from '../../../../../shared/components/pagination/pagination.component';
import { PaginationConfig, PaginationService } from '../../../../../shared/services/pagination.service';
import { Municipio } from '../../../../../shared/modeloModelados/parameters/municipality.models';
import { DocumentTypeDto } from '../../../../../shared/modeloModelados/parameters/document-type.models';
import { MunicipalityService } from '../../../../../core/services/parameters/municipality.service';
import { DocumentTypeService } from '../../../../../core/services/parameters/document-type.service';
import { PersonaService } from '../../../../../core/services/ModelSecurity/persona.service';


@Component({
  selector: 'app-personas-page',
  templateUrl: './personas-page.component.html',
  styleUrls: ['./personas-page.component.scss'],
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule, PaginationComponent]
})
export class PersonasPageComponent implements OnInit {
  // El backend devuelve/consume un DTO con campos adicionales (phoneNumber, municipalityId, documentTypeId)
  // que no existen en la interfaz `Persona` original. Definimos un tipo local que representa el DTO usado
  // por este componente para evitar conflictos de tipos con `Persona` existente.
  personas: PersonaDto[] = [];
  filteredPersonas: PersonaDto[] = [];
  paginatedPersonas: PersonaDto[] = [];

  // Paginación
  paginationConfig: PaginationConfig = {
    currentPage: 1,
    itemsPerPage: 5,
    totalItems: 0,
    totalPages: 0
  };
  municipios: Municipio[] = [];
  // documentTypes: DocumentTypeDto[] = []; // Ya no se usa
  showForm: boolean = false;
  showInfoModal: boolean = false;
  showUpdateModal: boolean = false;
  showUpdateConfirm: boolean = false;
  personaSeleccionada: PersonaDto | null = null;
  personaAActualizar: PersonaDto | null = null;

  // Formularios reactivos
  personaForm: FormGroup;
  updateForm: FormGroup;


  // Modales de alerta y confirmación
  showAlert = false;
  alertMsg = '';
  alertType: string = 'creado';
  showConfirm = false;
  personaAEliminar: PersonaDto | null = null;

  constructor(
    private personaService: PersonaService,
    private municipioService: MunicipalityService,
    // private documentTypeService: DocumentTypeService, // Ya no se usa
    private fb: FormBuilder,
    private paginationService: PaginationService
  ) {
    this.personaForm = this.fb.group({
      firstName: ['', [Validators.required, Validators.minLength(2), Validators.maxLength(50)]],
      lastName: ['', [Validators.required, Validators.minLength(2), Validators.maxLength(50)]],
      phoneNumber: ['', [Validators.required, Validators.pattern(/^[0-9]{7,15}$/), Validators.maxLength(15)]],
      address: ['', [Validators.required, Validators.minLength(5), Validators.maxLength(100)]],
      municipalityId: [null, [Validators.required, Validators.min(1)]]
    });

    this.updateForm = this.fb.group({
      firstName: ['', [Validators.required, Validators.minLength(2), Validators.maxLength(50)]],
      lastName: ['', [Validators.required, Validators.minLength(2), Validators.maxLength(50)]],
      phoneNumber: ['', [Validators.required, Validators.pattern(/^[0-9]{7,15}$/), Validators.maxLength(15)]],
      address: ['', [Validators.required, Validators.minLength(5), Validators.maxLength(100)]],
      municipalityId: [null, [Validators.required, Validators.min(1)]]
    });
  }

  ngOnInit() {
    // Cargar personas (la petición ahora la lanza el componente, no el constructor del servicio)
    this.personaService.personas$.subscribe((personas: any) => {
      this.personas = personas;
      this.filteredPersonas = personas;
      this.updatePagination();
    });
    // Solicitar la carga explícita de personas
    this.personaService.refreshPersonas();

    // Cargar municipios
    this.municipioService.municipalities$.subscribe((municipios: any) => {
      this.municipios = municipios;
    });

    // Cargar tipos de documento (ya no se usa, pero se mantiene por si acaso)
    // this.documentTypeService.genericService.getAll<any>(this.documentTypeService.endpoint).subscribe((documentTypes: any) => {
    //   this.documentTypes = documentTypes;
    // });
  }

  onSearch(term: string) {
    this.filteredPersonas = this.personas.filter(p =>
      (p.firstName + ' ' + p.lastName).toLowerCase().includes(term.toLowerCase())
    );
    this.updatePagination();
  }

  abrirFormulario() {
    this.showForm = true;
  }

  cerrarFormulario() {
    this.showForm = false;
    this.personaForm.reset();
  }

  crearPersona() {
    if (this.personaForm.valid) {
      const formValue = this.personaForm.value;

      // Asegurar que los IDs sean números válidos
      const nuevaPersona: PersonaDto = {
        firstName: formValue.firstName,
        lastName: formValue.lastName,
        phoneNumber: formValue.phoneNumber,
        address: formValue.address,
        municipalityId: Number(formValue.municipalityId)
      };

      // Validación adicional
      if (!nuevaPersona.municipalityId || nuevaPersona.municipalityId <= 0) {
        this.mostrarAlerta('Debe seleccionar un municipio válido.', 'eliminado');
        return;
      }

      // Log para debugging
      console.log('Datos a enviar:', nuevaPersona);

      this.personaService.genericService.create<any>(this.personaService.endpoint, nuevaPersona).subscribe({
        next: (persona: any) => {
          this.mostrarAlerta('Persona creada exitosamente.', 'creado');
          this.cerrarFormulario();
          this.personaService.refreshPersonas(); // Refrescar la lista
        },
        error: (error: any) => {
          console.error('Error al crear persona:', error);

          // Intentar extraer mensaje específico del error
          let errorMessage = 'Error al crear la persona.';
          if (error?.error) {
            if (typeof error.error === 'string') {
              errorMessage = error.error;
            } else if (error.error.message) {
              errorMessage = error.error.message;
            } else if (error.error.errors) {
              // Errores de validación del backend
              const validationErrors = Object.keys(error.error.errors).map(key =>
                `${key}: ${error.error.errors[key].join(', ')}`
              ).join('; ');
              errorMessage = `Errores de validación: ${validationErrors}`;
            }
          }

          console.log('Mensaje de error procesado:', errorMessage);
          this.mostrarAlerta(errorMessage, 'eliminado');
        }
      });
    } else {
      this.mostrarAlerta('Por favor completa todos los campos requeridos.', 'eliminado');
    }
  }

  abrirInfoModal(persona: PersonaDto) {
    this.personaSeleccionada = persona;
    this.showInfoModal = true;
  }

  cerrarInfoModal() {
    this.showInfoModal = false;
    this.personaSeleccionada = null;
  }

  mostrarAlerta(msg: string, tipo: string) {
    this.alertMsg = msg;
    this.alertType = tipo;
    this.showAlert = true;
    setTimeout(() => this.showAlert = false, 2500);
  }

  pedirConfirmacionEliminar(persona: PersonaDto) {
    this.personaAEliminar = persona;
    this.showConfirm = true;
  }

  confirmarEliminar() {
    if (this.personaAEliminar && this.personaAEliminar.id) {
      this.personaService.genericService.delete(this.personaService.endpoint, this.personaAEliminar.id).subscribe({
        next: () => {
          this.mostrarAlerta('Persona eliminada correctamente.', 'eliminado');
          this.personaService.refreshPersonas(); // Refrescar la lista
        },
        error: (error: any) => {
          console.error('Error al eliminar persona:', error);
          this.mostrarAlerta('Error al eliminar la persona.', 'eliminado');
        }
      });
    } else {
      this.mostrarAlerta('No se puede eliminar: ID de persona no encontrado.', 'eliminado');
    }
    this.showConfirm = false;
    this.personaAEliminar = null;
  }

  cancelarEliminar() {
    this.showConfirm = false;
    this.personaAEliminar = null;
  }

  confirmarActualizacion(persona: PersonaDto) {
    this.personaAActualizar = persona;
    this.showUpdateConfirm = true;
  }

  cancelarActualizacion() {
    this.personaAActualizar = null;
    this.showUpdateConfirm = false;
  }

  abrirModalActualizar() {
    if (this.personaAActualizar) {
      this.personaSeleccionada = { ...this.personaAActualizar }; // Crear una copia para editar
      this.updateForm.patchValue(this.personaAActualizar); // Cargar datos en el formulario
      this.showUpdateModal = true;
      this.showUpdateConfirm = false;
      this.personaAActualizar = null;
    }
  }

  cerrarModalActualizar() {
    this.showUpdateModal = false;
    this.updateForm.reset();
    this.personaSeleccionada = null;
  }

  actualizarPersona() {
    if (this.updateForm.valid && this.personaSeleccionada) {
      const formValue = this.updateForm.value;

      // Asegurar que los IDs sean números válidos
      const personaActualizada: PersonaDto = {
        id: this.personaSeleccionada.id,
        firstName: formValue.firstName,
        lastName: formValue.lastName,
        phoneNumber: formValue.phoneNumber,
        address: formValue.address,
        municipalityId: Number(formValue.municipalityId)
      };

      // Validación adicional
      if (!personaActualizada.municipalityId || personaActualizada.municipalityId <= 0) {
        this.mostrarAlerta('Debe seleccionar un municipio válido.', 'eliminado');
        return;
      }

      // Log para debugging
      console.log('Datos a actualizar:', personaActualizada);

      if (personaActualizada.id) {
        this.personaService.genericService.update<any>(this.personaService.endpoint, personaActualizada.id, personaActualizada).subscribe({
          next: (persona: any) => {
            this.mostrarAlerta('Persona actualizada exitosamente.', 'creado');
            this.cerrarModalActualizar();
            this.personaService.refreshPersonas(); // Refrescar la lista
          },
          error: (error: any) => {
            console.error('Error al actualizar persona:', error);

            // Intentar extraer mensaje específico del error
            let errorMessage = 'Error al actualizar la persona.';
            if (error?.error) {
              if (typeof error.error === 'string') {
                errorMessage = error.error;
              } else if (error.error.message) {
                errorMessage = error.error.message;
              } else if (error.error.errors) {
                // Errores de validación del backend
                const validationErrors = Object.keys(error.error.errors).map(key =>
                  `${key}: ${error.error.errors[key].join(', ')}`
                ).join('; ');
                errorMessage = `Errores de validación: ${validationErrors}`;
              }
            }

            console.log('Mensaje de error procesado:', errorMessage);
            this.mostrarAlerta(errorMessage, 'eliminado');
          }
        });
      } else {
        this.mostrarAlerta('ID de persona no encontrado.', 'eliminado');
      }
    } else {
      this.mostrarAlerta('Por favor completa todos los campos requeridos.', 'eliminado');
    }
  }

  // Método helper para obtener el nombre del municipio por ID
  getMunicipioNombre(municipioId: number): string {
    if (this.municipios.length === 0) {
      return 'No se encuentran municipios';
    }
    const municipio = this.municipios.find(m => m.id === municipioId);
    return municipio ? municipio.name : `Municipio ID: ${municipioId}`;
  }

  // Método helper para obtener el nombre del tipo de documento por ID (ya no se usa)
  // getDocumentTypeNombre(documentTypeId: number): string {
  //   if (this.documentTypes.length === 0) {
  //     return 'No se encuentran tipos de documento';
  //   }
  //   const documentType = this.documentTypes.find(dt => dt.id === documentTypeId);
  //   return documentType ? documentType.name : `Tipo de documento ID: ${documentTypeId}`;
  // }

  // Métodos de paginación
  updatePagination(): void {
    this.paginationConfig = this.paginationService.updatePagination(this.paginationConfig, this.filteredPersonas.length);
    this.updatePaginatedItems();
  }

  updatePaginatedItems(): void {
    this.paginatedPersonas = this.paginationService.getPaginatedItems(this.filteredPersonas, this.paginationConfig);
  }

  onPageChange(page: number): void {
    this.paginationConfig = this.paginationService.goToPage(this.paginationConfig, page);
    this.updatePaginatedItems();
  }
}

// DTO local que contiene los campos que este componente espera del backend
interface PersonaDto {
  id?: number;
  firstName: string;
  lastName: string;
  phoneNumber?: string;
  address?: string;
  municipalityId?: number;
  documentTypeId?: number;
  // campos opcionales/mapeos con la interfaz Persona existente
  email?: string;
  documentType?: string;
  documentNumber?: string;
}
