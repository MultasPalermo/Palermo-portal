import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { MessageService, ConfirmationService } from 'primeng/api';

// PrimeNG imports
import { TableModule } from 'primeng/table';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { DropdownModule } from 'primeng/dropdown';
import { DialogModule } from 'primeng/dialog';
import { ToastModule } from 'primeng/toast';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { ToolbarModule } from 'primeng/toolbar';
import { CardModule } from 'primeng/card';
import { ProgressSpinnerModule } from 'primeng/progressspinner';
import { RolFormPermission, RolFormPermissionDisplay } from '../../models/rol-form-permission.model';
import { ServiceGenericService } from '../../../../../core/services/utils/generic/service-generic.service';



@Component({
  selector: 'app-rol-form-permission',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    TableModule,
    ButtonModule,
    InputTextModule,
    DropdownModule,
    DialogModule,
    ToastModule,
    ConfirmDialogModule,
    ToolbarModule,
    CardModule,
    ProgressSpinnerModule
  ],
  providers: [MessageService, ConfirmationService],
  templateUrl: './rol-form-permission.component.html',
  styleUrls: ['./rol-form-permission.component.scss']
})
export class RolFormPermissionComponent implements OnInit, OnDestroy {
  private destroy$ = new Subject<void>();

  // Data
  rolFormPermissions: RolFormPermission[] = [];
  displayData: RolFormPermissionDisplay[] = [];
  filteredData: RolFormPermissionDisplay[] = [];
  
  // Dialog
  displayDialog = false;
  dialogTitle = '';
  isEditMode = false;
  selectedItemId: number | null = null;
  
  // Form
  rolFormPermissionForm!: FormGroup;
  
  // Loading
  loading = false;
  
  // Dropdown options
  roleOptions: { label: string; value: number }[] = [];
  formOptions: { label: string; value: number }[] = [];
  permissionOptions: { label: string; value: number }[] = [];
  
  // Search
  globalFilter = '';

  constructor(
    private serviceGeneric: ServiceGenericService,
    private fb: FormBuilder,
    private messageService: MessageService,
    private confirmationService: ConfirmationService
  ) {
    this.initForm();
  }

  ngOnInit(): void {
    // Cargar datos primero
    this.loadData();
    this.loadDropdownOptions();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  private initForm(): void {
    this.rolFormPermissionForm = this.fb.group({
      rolid: [null, [Validators.required]],
      formid: [null, [Validators.required]],
      permissionid: [null, [Validators.required]]
    });
  }

  private loadData(): void {
    this.loading = true;
    this.serviceGeneric.getAll<RolFormPermission>('RolFormPermission')
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (data) => {
          this.rolFormPermissions = data;
          this.displayData = data.map(item => ({
            permissionName: item.permissionName,
            rolName: item.rolName,
            formName: item.formName
          }));
          this.filteredData = [...this.displayData];
          this.loading = false;
        },
        error: (error) => {
          console.error('Error loading data:', error);
          this.messageService.add({
            severity: 'error',
            summary: 'Error',
            detail: 'Error al cargar los datos'
          });
          this.loading = false;
        }
      });
  }

  private loadDropdownOptions(): void {
    // Roles
    this.serviceGeneric.getAll<any>('Rol')
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: roles => {
          console.log('Roles loaded:', roles);
          this.roleOptions = roles.map((role: any) => ({ label: role.name || role.nombre, value: role.id }));
        },
        error: error => {
          console.error('Error loading roles:', error);
          this.messageService.add({
            severity: 'error',
            summary: 'Error',
            detail: 'Error al cargar roles'
          });
        }
      });

    // Forms
    this.serviceGeneric.getAll<any>('Form')
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: forms => {
          console.log('Forms loaded:', forms);
          this.formOptions = forms.map((form: any) => ({ label: form.name || form.nombre, value: form.id }));
        },
        error: error => {
          console.error('Error loading forms:', error);
          this.messageService.add({
            severity: 'error',
            summary: 'Error',
            detail: 'Error al cargar formularios'
          });
        }
      });

    // Permissions
    this.serviceGeneric.getAll<any>('Permission')
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: perms => {
          console.log('Permissions loaded:', perms);
          this.permissionOptions = perms.map((perm: any) => ({ label: perm.name || perm.nombre, value: perm.id }));
        },
        error: error => {
          console.error('Error loading permissions:', error);
          this.messageService.add({
            severity: 'error',
            summary: 'Error',
            detail: 'Error al cargar permisos'
          });
        }
      });
  }

  onGlobalFilter(event: Event): void {
    const target = event.target as HTMLInputElement;
    this.globalFilter = target.value;
    this.applyGlobalFilter();
  }

  private applyGlobalFilter(): void {
    if (!this.globalFilter) {
      this.filteredData = [...this.displayData];
      return;
    }

    const filterValue = this.globalFilter.toLowerCase();
    this.filteredData = this.displayData.filter(item =>
      item.rolName.toLowerCase().includes(filterValue) ||
      item.formName.toLowerCase().includes(filterValue) ||
      item.permissionName.toLowerCase().includes(filterValue)
    );
  }

  openNew(): void {
    this.isEditMode = false;
    this.selectedItemId = null;
    this.dialogTitle = 'Nuevo Rol-Formulario-Permiso';
    this.rolFormPermissionForm.reset();
    this.displayDialog = true;
  }

  editItem(rowData: RolFormPermissionDisplay): void {
    const originalItem = this.rolFormPermissions.find(item =>
      item.rolName === rowData.rolName &&
      item.formName === rowData.formName &&
      item.permissionName === rowData.permissionName
    );

    if (originalItem) {
      this.isEditMode = true;
      this.selectedItemId = originalItem.id;
      this.dialogTitle = 'Editar Rol-Formulario-Permiso';
      
      this.rolFormPermissionForm.patchValue({
        rolid: originalItem.rolid,
        formid: originalItem.formid,
        permissionid: originalItem.permissionid
      });
      
      this.displayDialog = true;
    }
  }

  deleteItem(rowData: RolFormPermissionDisplay): void {
    const originalItem = this.rolFormPermissions.find(item =>
      item.rolName === rowData.rolName &&
      item.formName === rowData.formName &&
      item.permissionName === rowData.permissionName
    );

    if (originalItem) {
      this.confirmationService.confirm({
        message: `¿Está seguro de eliminar el permiso "${rowData.permissionName}" para el rol "${rowData.rolName}" en el formulario "${rowData.formName}"?`,
        header: 'Confirmar Eliminación',
        icon: 'pi pi-exclamation-triangle',
        accept: () => {
          this.performDelete(originalItem.id);
        }
      });
    }
  }

  private performDelete(id: number): void {
    this.serviceGeneric.delete('RolFormPermission', id)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: () => {
          this.messageService.add({
            severity: 'success',
            summary: 'Éxito',
            detail: 'Registro eliminado correctamente'
          });
          this.loadData();
        },
        error: (error) => {
          console.error('Error deleting item:', error);
          this.messageService.add({
            severity: 'error',
            summary: 'Error',
            detail: 'Error al eliminar el registro'
          });
        }
      });
  }

  saveItem(): void {
    if (this.rolFormPermissionForm.valid) {
      const formValue = this.rolFormPermissionForm.value;

      // Check for duplicates in create mode
      if (!this.isEditMode) {
        const existingItem = this.rolFormPermissions.find(item =>
          item.rolid === formValue.rolid &&
          item.formid === formValue.formid &&
          item.permissionid === formValue.permissionid
        );

        if (existingItem) {
          this.messageService.add({
            severity: 'warn',
            summary: 'Advertencia',
            detail: 'Ya existe un registro con esta combinación de rol, formulario y permiso'
          });
          return;
        }
      }

      if (this.isEditMode && this.selectedItemId) {
        const updateData = {
          id: this.selectedItemId,
          rolid: formValue.rolid,
          formid: formValue.formid,
          permissionid: formValue.permissionid
        };

        this.serviceGeneric.update('RolFormPermission', this.selectedItemId, updateData)
          .pipe(takeUntil(this.destroy$))
          .subscribe({
            next: () => {
              this.messageService.add({
                severity: 'success',
                summary: 'Éxito',
                detail: 'Registro actualizado correctamente'
              });
              this.closeDialog();
              this.loadData();
            },
            error: (error: any) => {
              console.error('Error updating item:', error);
              this.messageService.add({
                severity: 'error',
                summary: 'Error',
                detail: 'Error al actualizar el registro'
              });
            }
          });
      } else {
        const createData = {
          rolid: formValue.rolid,
          formid: formValue.formid,
          permissionid: formValue.permissionid
        };

        this.serviceGeneric.create('RolFormPermission', createData)
          .pipe(takeUntil(this.destroy$))
          .subscribe({
            next: () => {
              this.messageService.add({
                severity: 'success',
                summary: 'Éxito',
                detail: 'Registro creado correctamente'
              });
              this.closeDialog();
              this.loadData();
            },
            error: (error: any) => {
              console.error('Error creating item:', error);
              let errorMessage = 'Error al crear el registro';
              if (error?.error?.message?.includes('duplicate') || error?.message?.includes('duplicate')) {
                errorMessage = 'Ya existe un registro con esta combinación';
              }
              this.messageService.add({
                severity: 'error',
                summary: 'Error',
                detail: errorMessage
              });
            }
          });
      }
    } else {
      this.markFormGroupTouched();
    }
  }

  private markFormGroupTouched(): void {
    Object.keys(this.rolFormPermissionForm.controls).forEach(key => {
      const control = this.rolFormPermissionForm.get(key);
      control?.markAsTouched();
    });
  }

  closeDialog(): void {
    this.displayDialog = false;
    this.rolFormPermissionForm.reset();
    this.isEditMode = false;
    this.selectedItemId = null;
  }

  isFieldInvalid(fieldName: string): boolean {
    const field = this.rolFormPermissionForm.get(fieldName);
    return !!(field && field.invalid && (field.dirty || field.touched));
  }

  getFieldError(fieldName: string): string {
    const field = this.rolFormPermissionForm.get(fieldName);
    if (field?.errors?.['required']) {
      return 'Este campo es requerido';
    }
    return '';
  }
}
