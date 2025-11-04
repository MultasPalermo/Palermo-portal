import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { PaginationComponent } from '../../../../../shared/components/pagination/pagination.component';
import { FormModuleService } from '../../../../../core/services/ModelSecurity/formmodule.service';
import { PaginationConfig, PaginationService } from '../../../../../shared/services/pagination.service';
import { FormModule } from '../../../../../shared/modeloModelados/modelSecurity/form-module';


@Component({
  selector: 'app-form-module-page',
  templateUrl: './form-module-page.component.html',
  styleUrls: ['./form-module-page.component.scss'],
  standalone: true,
  imports: [CommonModule, FormsModule, PaginationComponent],
  providers: [FormModuleService]
})
export class FormModulePageComponent implements OnInit {
  formModules: FormModule[] = [];
  paginatedFormModules: FormModule[] = [];
  isLoading: boolean = false;
  forms: any[] = [];
  modules: any[] = [];
  formModuleOriginal: FormModule | null = null;

  // Paginación
  paginationConfig: PaginationConfig = {
    currentPage: 1,
    itemsPerPage: 5,
    totalItems: 0,
    totalPages: 0
  };

  // Modal y formulario
  showModal: boolean = false;
  isEditing: boolean = false;
  showUpdateConfirm: boolean = false;
  formModuleEditando: number | null = null;
  formModuleAActualizar: number | null = null;
  nuevoFormModule: FormModule = {
    formid: 0,
    moduleid: 0,
    formName: '',
    moduleName: ''
  };

  // Modales de alerta y confirmación
  showAlert: boolean = false;
  alertMsg: string = '';
  alertType: string = 'creado';
  showConfirm: boolean = false;
  formModuleAEliminar: number | null = null;



  constructor(
    private formModuleService: FormModuleService,
    private paginationService: PaginationService
  ) { }

  ngOnInit() {
    this.loadFormModules();
    this.loadForms();
    this.loadModules();
  }

  loadForms() {
    this.formModuleService.genericService.getAll<any>('Form').subscribe({
      next: (data) => this.forms = data,
      error: (err) => console.error('Error cargando forms', err)
    });
  }

  loadModules() {
    this.formModuleService.genericService.getAll<any>('Module').subscribe({
      next: (data) => this.modules = data,
      error: (err) => console.error('Error cargando modules', err)
    });
  }




  loadFormModules() {
    this.isLoading = true;
    this.formModuleService.genericService.getAll<FormModule>(this.formModuleService.endpoint).subscribe({
      next: (formModules: FormModule[]) => {
        this.formModules = formModules;
        this.updatePagination();
        this.isLoading = false;
      },
      error: (error: any) => {
        console.error('Error al cargar form-modules:', error);
        this.mostrarAlerta('Error al cargar los form-modules', 'error');
        this.isLoading = false;
      }
    });
  }

  abrirModal() {
    this.showModal = true;
    this.isEditing = false;
    this.formModuleEditando = null;
    this.nuevoFormModule = {
      formid: 0,
      moduleid: 0,
      formName: '',
      moduleName: ''
    };
  }

  confirmarActualizacion(idx: number) {
    this.formModuleAActualizar = idx;
    this.showUpdateConfirm = true;
  }

  cancelarActualizacion() {
    this.formModuleAActualizar = null;
    this.showUpdateConfirm = false;
  }

  abrirModalEditar() {
    if (this.formModuleAActualizar !== null) {
      const formModule = this.formModules[this.formModuleAActualizar];
      this.showModal = true;
      this.isEditing = true;
      this.formModuleEditando = this.formModuleAActualizar;

      this.nuevoFormModule = {
        id: formModule.id,
        formid: formModule.formid,
        moduleid: formModule.moduleid,
        formName: formModule.formName,
        moduleName: formModule.moduleName
      };

      // 🔹 Guardamos el estado original para comparación
      this.formModuleOriginal = { ...this.nuevoFormModule };

      this.showUpdateConfirm = false;
      this.formModuleAActualizar = null;
    }
  }

  mostrarAlerta(msg: string, tipo: string) {
    this.alertMsg = msg;
    this.alertType = tipo;
    this.showAlert = true;
    setTimeout(() => this.showAlert = false, 2500);
  }

  pedirConfirmacionEliminar(idx: number) {
    this.formModuleAEliminar = idx;
    this.showConfirm = true;
  }

  confirmarEliminar() {
    if (this.formModuleAEliminar !== null && this.formModules[this.formModuleAEliminar].id) {
      const formModuleId = this.formModules[this.formModuleAEliminar].id!;
      this.formModuleService.genericService.delete(this.formModuleService.endpoint, formModuleId).subscribe({
        next: () => {
          this.formModules.splice(this.formModuleAEliminar!, 1);
          this.updatePagination();
          this.mostrarAlerta('Form-Module eliminado correctamente.', 'eliminado');
          this.showConfirm = false;
          this.formModuleAEliminar = null;
        },
        error: (error: any) => {
          console.error('Error al eliminar form-module:', error);
          this.mostrarAlerta('Error al eliminar el form-module', 'error');
          this.showConfirm = false;
          this.formModuleAEliminar = null;
        }
      });
    }
  }

  cancelarEliminar() {
    this.showConfirm = false;
    this.formModuleAEliminar = null;
  }

  cerrarModal() {
    this.showModal = false;
    this.isEditing = false;
    this.formModuleEditando = null;
  }

  guardarFormModule() {
    if (!this.nuevoFormModule.formid || !this.nuevoFormModule.moduleid) {
      this.mostrarAlerta('Debe seleccionar un formulario y un módulo válidos', 'error');
      return;
    }

    if (this.isEditing && this.formModuleEditando !== null) {
      this.actualizarFormModule();
    } else {
      // 🚨 Solo enviar lo que el backend espera
      const formModuleData = {
        formid: this.nuevoFormModule.formid,
        moduleid: this.nuevoFormModule.moduleid
      };

      this.formModuleService.genericService.create<FormModule>(
        this.formModuleService.endpoint,
        formModuleData
      ).subscribe({
        next: () => {
          this.loadFormModules(); // recargar desde backend
          this.mostrarAlerta('Form-Module creado exitosamente.', 'creado');
          this.cerrarModal();
        },
        error: (error: any) => {
          console.error('Error al crear form-module:', error);
          this.mostrarAlerta('Error al crear el form-module', 'error');
        }
      });
    }
  }



  actualizarFormModule() {
    if (!this.nuevoFormModule.id) return;

    // 🔹 Validar que haya cambios
    if (
      this.formModuleOriginal &&
      this.nuevoFormModule.formid === this.formModuleOriginal.formid &&
      this.nuevoFormModule.moduleid === this.formModuleOriginal.moduleid
    ) {
      this.mostrarAlerta('No se detectaron cambios en el formulario.', 'error');
      return;
    }

    const formModuleData = {
      formid: this.nuevoFormModule.formid,
      moduleid: this.nuevoFormModule.moduleid
    };

    this.formModuleService.genericService.update<FormModule>(
      this.formModuleService.endpoint,
      this.nuevoFormModule.id,
      formModuleData
    ).subscribe({
      next: () => {
        this.loadFormModules(); // 🔹 Recargar desde backend
        this.mostrarAlerta('Form-Module actualizado exitosamente.', 'creado');
        this.cerrarModal();
      },
      error: (error: any) => {
        console.error('Error al actualizar form-module:', error);
        this.mostrarAlerta('Error al actualizar el form-module', 'error');
      }
    });
  }

  // Métodos de paginación
  updatePagination(): void {
    this.paginationConfig = this.paginationService.updatePagination(this.paginationConfig, this.formModules.length);
    this.updatePaginatedItems();
  }

  updatePaginatedItems(): void {
    this.paginatedFormModules = this.paginationService.getPaginatedItems(this.formModules, this.paginationConfig);
  }

  onPageChange(page: number): void {
    this.paginationConfig = this.paginationService.goToPage(this.paginationConfig, page);
    this.updatePaginatedItems();
  }
}