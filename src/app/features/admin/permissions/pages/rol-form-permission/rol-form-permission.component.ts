import { Component, OnInit, OnDestroy, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Subject } from 'rxjs';
import { takeUntil, finalize } from 'rxjs/operators';
import { RolFormPermission, RolFormPermissionDisplay } from '../../models/rol-form-permission.model';
import { ServiceGenericService } from '../../../../../core/services/utils/generic/service-generic.service';
import { PaginationComponent } from '../../../../../shared/components/pagination/pagination.component';
import { PaginationConfig, PaginationService } from '../../../../../shared/services/pagination.service';

@Component({
  selector: 'app-rol-form-permission',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    PaginationComponent
  ],
  templateUrl: './rol-form-permission.component.html',
  styleUrls: ['./rol-form-permission.component.scss']
})
export class RolFormPermissionComponent implements OnInit, OnDestroy {
  private destroy$ = new Subject<void>();
  private paginationService = inject(PaginationService);

  // Data
  rolFormPermissions: RolFormPermission[] = [];
  displayData: RolFormPermissionDisplay[] = [];
  filteredData: RolFormPermissionDisplay[] = [];
  paginatedData: RolFormPermissionDisplay[] = [];

  // Loading
  loading = false;

  // Dropdown options
  roleOptions: { label: string; value: number }[] = [];
  formOptions: { label: string; value: number }[] = [];
  permissionOptions: { label: string; value: number }[] = [];

  // Search
  searchTerm: string = '';

  // Paginación
  paginationConfig: PaginationConfig = {
    currentPage: 1,
    itemsPerPage: 12,
    totalItems: 0,
    totalPages: 0
  };

  // Modales
  showForm = false;
  showUpdateForm = false;
  showConfirm = false;
  showUpdateConfirm = false;
  itemToDelete: RolFormPermissionDisplay | null = null;
  itemToUpdate: RolFormPermissionDisplay | null = null;

  // Form
  rolFormPermissionForm!: FormGroup;
  updateForm!: FormGroup;

  // Alertas estandarizadas
  showAlert = false;
  alertType: 'creado' | 'eliminado' | 'error' | 'info' = 'creado';
  alertMsg = '';

  constructor(
    private serviceGeneric: ServiceGenericService,
    private fb: FormBuilder
  ) {
    this.initForms();
  }

  ngOnInit(): void {
    this.loadData();
    this.loadDropdownOptions();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  private initForms(): void {
    this.rolFormPermissionForm = this.fb.group({
      rolid: [null, [Validators.required]],
      formid: [null, [Validators.required]],
      permissionid: [null, [Validators.required]]
    });

    this.updateForm = this.fb.group({
      rolid: [null, [Validators.required]],
      formid: [null, [Validators.required]],
      permissionid: [null, [Validators.required]]
    });
  }

  private loadData(): void {
    this.loading = true;
    this.serviceGeneric.getAll<RolFormPermission>('RolFormPermission')
      .pipe(
        finalize(() => this.loading = false),
        takeUntil(this.destroy$)
      )
      .subscribe({
        next: (data) => {
          this.rolFormPermissions = data;
          this.displayData = data.map(item => ({
            permissionName: item.permissionName,
            rolName: item.rolName,
            formName: item.formName
          }));
          this.filteredData = [...this.displayData];
          this.updatePagination();
        },
        error: (e) => {
          console.error('Error loading data:', e);
          this.mostrarAlerta('error', 'Error al cargar los datos');
        }
      });
  }

  private loadDropdownOptions(): void {
    // Roles
    this.serviceGeneric.getAll<any>('Rol')
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: roles => {
          this.roleOptions = roles.map((role: any) => ({
            label: role.name || role.nombre,
            value: role.id
          }));
        },
        error: e => {
          console.error('Error loading roles:', e);
          this.mostrarAlerta('error', 'Error al cargar roles');
        }
      });

    // Forms
    this.serviceGeneric.getAll<any>('Form')
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: forms => {
          this.formOptions = forms.map((form: any) => ({
            label: form.name || form.nombre,
            value: form.id
          }));
        },
        error: e => {
          console.error('Error loading forms:', e);
          this.mostrarAlerta('error', 'Error al cargar formularios');
        }
      });

    // Permissions
    this.serviceGeneric.getAll<any>('Permission')
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: perms => {
          this.permissionOptions = perms.map((perm: any) => ({
            label: perm.name || perm.nombre,
            value: perm.id
          }));
        },
        error: e => {
          console.error('Error loading permissions:', e);
          this.mostrarAlerta('error', 'Error al cargar permisos');
        }
      });
  }

  // Búsqueda
  filterData(): void {
    if (!this.searchTerm.trim()) {
      this.filteredData = [...this.displayData];
    } else {
      const term = this.searchTerm.toLowerCase().trim();
      this.filteredData = this.displayData.filter(item =>
        item.rolName.toLowerCase().includes(term) ||
        item.formName.toLowerCase().includes(term) ||
        item.permissionName.toLowerCase().includes(term)
      );
    }
    this.paginationConfig.currentPage = 1;
    this.updatePagination();
  }

  clearSearch(): void {
    this.searchTerm = '';
    this.filterData();
  }

  // Alertas estandarizadas
  mostrarAlerta(tipo: 'creado' | 'eliminado' | 'error' | 'info', mensaje: string): void {
    this.alertType = tipo;
    this.alertMsg = mensaje;
    this.showAlert = true;
    setTimeout(() => this.showAlert = false, 2500);
  }

  // Métodos para manejar formularios
  abrirFormulario(): void {
    this.showForm = true;
    this.rolFormPermissionForm.reset();
  }

  cerrarFormulario(): void {
    this.showForm = false;
    this.rolFormPermissionForm.reset();
  }

  crearItem(): void {
    if (this.rolFormPermissionForm.valid) {
      const formValue = this.rolFormPermissionForm.value;

      // Verificar duplicados
      const existingItem = this.rolFormPermissions.find(item =>
        item.rolid === formValue.rolid &&
        item.formid === formValue.formid &&
        item.permissionid === formValue.permissionid
      );

      if (existingItem) {
        this.mostrarAlerta('error', 'Ya existe un registro con esta combinación');
        return;
      }

      this.loading = true;
      this.serviceGeneric.create('RolFormPermission', formValue)
        .pipe(
          finalize(() => this.loading = false),
          takeUntil(this.destroy$)
        )
        .subscribe({
          next: () => {
            this.mostrarAlerta('creado', 'Registro creado correctamente');
            this.loadData();
            this.cerrarFormulario();
          },
          error: (e: any) => {
            console.error('Error creating item:', e);
            let errorMessage = 'Error al crear el registro';
            if (e?.error?.message?.includes('duplicate') || e?.message?.includes('duplicate')) {
              errorMessage = 'Ya existe un registro con esta combinación';
            }
            this.mostrarAlerta('error', errorMessage);
          }
        });
    } else {
      this.mostrarAlerta('error', 'Por favor complete todos los campos requeridos');
    }
  }

  // Métodos para editar
  confirmarActualizacion(rowData: RolFormPermissionDisplay): void {
    this.itemToUpdate = rowData;
    this.showUpdateConfirm = true;
  }

  cancelarActualizacion(): void {
    this.itemToUpdate = null;
    this.showUpdateConfirm = false;
  }

  abrirFormularioActualizar(): void {
    if (this.itemToUpdate) {
      const originalItem = this.rolFormPermissions.find(item =>
        item.rolName === this.itemToUpdate!.rolName &&
        item.formName === this.itemToUpdate!.formName &&
        item.permissionName === this.itemToUpdate!.permissionName
      );

      if (originalItem) {
        this.updateForm.patchValue({
          rolid: originalItem.rolid,
          formid: originalItem.formid,
          permissionid: originalItem.permissionid
        });
        this.showUpdateForm = true;
        this.showUpdateConfirm = false;
      }
    }
  }

  cerrarFormularioActualizar(): void {
    this.showUpdateForm = false;
    this.updateForm.reset();
    this.itemToUpdate = null;
  }

  actualizarItem(): void {
    if (this.updateForm.valid && this.itemToUpdate) {
      const originalItem = this.rolFormPermissions.find(item =>
        item.rolName === this.itemToUpdate!.rolName &&
        item.formName === this.itemToUpdate!.formName &&
        item.permissionName === this.itemToUpdate!.permissionName
      );

      if (!originalItem?.id) {
        this.mostrarAlerta('error', 'No se encontró el registro');
        return;
      }

      this.loading = true;
      const updateData = {
        id: originalItem.id,
        ...this.updateForm.value
      };

      this.serviceGeneric.update('RolFormPermission', originalItem.id, updateData)
        .pipe(
          finalize(() => this.loading = false),
          takeUntil(this.destroy$)
        )
        .subscribe({
          next: () => {
            this.mostrarAlerta('creado', 'Registro actualizado correctamente');
            this.loadData();
            this.cerrarFormularioActualizar();
          },
          error: (e: any) => {
            console.error('Error updating item:', e);
            this.mostrarAlerta('error', 'Error al actualizar el registro');
          }
        });
    } else {
      this.mostrarAlerta('error', 'Por favor complete todos los campos requeridos');
    }
  }

  // Métodos para eliminar
  confirmarEliminacion(rowData: RolFormPermissionDisplay): void {
    this.itemToDelete = rowData;
    this.showConfirm = true;
  }

  cancelarEliminacion(): void {
    this.itemToDelete = null;
    this.showConfirm = false;
  }

  eliminarItem(): void {
    if (this.itemToDelete) {
      const originalItem = this.rolFormPermissions.find(item =>
        item.rolName === this.itemToDelete!.rolName &&
        item.formName === this.itemToDelete!.formName &&
        item.permissionName === this.itemToDelete!.permissionName
      );

      if (!originalItem?.id) {
        this.mostrarAlerta('error', 'No se encontró el registro');
        return;
      }

      this.loading = true;
      this.serviceGeneric.delete('RolFormPermission', originalItem.id)
        .pipe(
          finalize(() => this.loading = false),
          takeUntil(this.destroy$)
        )
        .subscribe({
          next: () => {
            this.mostrarAlerta('eliminado', 'Registro eliminado correctamente');
            this.loadData();
            this.cancelarEliminacion();
          },
          error: (e: any) => {
            console.error('Error deleting item:', e);
            this.mostrarAlerta('error', 'Error al eliminar el registro');
          }
        });
    }
  }

  // Métodos de paginación
  updatePagination(): void {
    this.paginationConfig = this.paginationService.updatePagination(
      this.paginationConfig,
      this.filteredData.length
    );
    this.updatePaginatedItems();
  }

  updatePaginatedItems(): void {
    const { currentPage, itemsPerPage } = this.paginationConfig;
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    this.paginatedData = this.filteredData.slice(startIndex, endIndex);
  }

  onPageChange(page: number): void {
    this.paginationConfig.currentPage = page;
    this.updatePaginatedItems();
  }

  // Métodos auxiliares
  isFieldInvalid(fieldName: string, form: FormGroup = this.rolFormPermissionForm): boolean {
    const field = form.get(fieldName);
    return !!(field && field.invalid && (field.dirty || field.touched));
  }

  getFieldError(fieldName: string, form: FormGroup = this.rolFormPermissionForm): string {
    const field = form.get(fieldName);
    if (field?.errors?.['required']) {
      return 'Este campo es requerido';
    }
    return '';
  }

  getRolLabel(id: number): string {
    const option = this.roleOptions.find(opt => opt.value === id);
    return option ? option.label : '';
  }

  getFormLabel(id: number): string {
    const option = this.formOptions.find(opt => opt.value === id);
    return option ? option.label : '';
  }

  getPermissionLabel(id: number): string {
    const option = this.permissionOptions.find(opt => opt.value === id);
    return option ? option.label : '';
  }
}
