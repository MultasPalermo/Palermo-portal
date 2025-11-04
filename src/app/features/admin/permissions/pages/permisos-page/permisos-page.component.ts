import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';

import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';
import { PaginationComponent } from '../../../../../shared/components/pagination/pagination.component';
import { PaginationConfig, PaginationService } from '../../../../../shared/services/pagination.service';
import { PermissionService } from '../../../../../core/services/ModelSecurity/permission.service';
import { Permission } from '../../../../../shared/modeloModelados/modelSecurity/permission';

@Component({
  selector: 'app-permisos-page',
  templateUrl: './permisos-page.component.html',
  styleUrls: ['./permisos-page.component.scss'],
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, PaginationComponent],
})
export class PermisosPageComponent implements OnInit {
  permisos: Permission[] = [];
  paginatedPermisos: Permission[] = [];
  showForm = false;
  permisoForm: FormGroup;
  loading = false;
  errorMsg = '';
  successMsg = '';

  // Paginación
  paginationConfig: PaginationConfig = {
    currentPage: 1,
    itemsPerPage: 5,
    totalItems: 0,
    totalPages: 0
  };

  // Variables para modales
  showUpdateConfirm = false;
  showDeleteConfirm = false;
  permisoEditando: Permission | null = null;
  permisoAActualizar: Permission | null = null;
  permisoAEliminar: Permission | null = null;

  // Propiedades para alertas estandarizadas
  showAlert = false;
  alertType: 'bienvenida' | 'creado' | 'eliminado' | 'error' | 'info' = 'creado';
  alertMsg = '';
  showConfirm = false;
  permisoAEliminarConfirm: Permission | null = null;

  constructor(
    private permissionService: PermissionService,
    private fb: FormBuilder,
    private paginationService: PaginationService
  ) {
    this.permisoForm = this.fb.group({
      name: ['', [Validators.required, Validators.minLength(2), Validators.maxLength(50)]],
      description: ['', [Validators.required, Validators.minLength(5), Validators.maxLength(200)]]
    });
  }

  ngOnInit(): void {
    // Obtener permisos primero
    this.obtenerPermisos();
  }

  obtenerPermisos() {
    this.permissionService.genericService.getAll<Permission>(this.permissionService.endpoint).subscribe((data: Permission[]) => {
      this.permisos = data;
      this.updatePagination();
    });
  }

  // Métodos de paginación
  updatePagination(): void {
    this.paginationConfig = this.paginationService.updatePagination(this.paginationConfig, this.permisos.length);
    this.updatePaginatedItems();
  }

  updatePaginatedItems(): void {
    this.paginatedPermisos = this.paginationService.getPaginatedItems(this.permisos, this.paginationConfig);
  }

  onPageChange(page: number): void {
    this.paginationConfig = this.paginationService.goToPage(this.paginationConfig, page);
    this.updatePaginatedItems();
  }

  abrirFormulario() {
    this.showForm = true;
  }

  cerrarFormulario() {
    this.showForm = false;
  }

 crearPermiso() {
  if (this.permisoForm.invalid) {
    this.permisoForm.markAllAsTouched();
    return;
  }

  this.loading = true;
  const permisoData = {
    name: this.permisoForm.value.name.trim(),
    description: this.permisoForm.value.description.trim()
  };

  if (this.permisoEditando) {
    // ✅ Validar si hay cambios reales (ignorando espacios)
    const nameChanged = this.permisoEditando.name.trim() !== permisoData.name;
    const descChanged = this.permisoEditando.description.trim() !== permisoData.description;

    if (!nameChanged && !descChanged) {
      this.mostrarAlerta('error', 'Debes realizar alguna modificación antes de actualizar.');
      this.loading = false;
      return;
    }

    // ✅ Actualizar en el backend
    const permisoActualizado = { ...this.permisoEditando, ...permisoData };
    this.permissionService.genericService.update<Permission>(
      this.permissionService.endpoint,
      permisoActualizado.id,
      permisoActualizado
    ).subscribe({
      next: () => {
        this.mostrarAlerta('creado', 'Permiso actualizado correctamente');
        this.obtenerPermisos();
        this.permisoForm.reset();
        this.cerrarFormulario();
        this.permisoEditando = null;
        this.loading = false;
      },
      error: () => {
        this.mostrarAlerta('error', 'Error al actualizar el permiso');
        this.loading = false;
      }
    });

  } else {
    // ✅ Crear nuevo permiso
    this.permissionService.genericService.create<Permission>(
      this.permissionService.endpoint,
      permisoData
    ).subscribe({
      next: () => {
        this.mostrarAlerta('creado', 'Permiso creado correctamente');
        this.obtenerPermisos();
        this.permisoForm.reset();
        this.cerrarFormulario();
        this.loading = false;
      },
      error: () => {
        this.mostrarAlerta('error', 'Error al crear el permiso');
        this.loading = false;
      }
    });
  }
}


  confirmarActualizacion(permiso: Permission) {
    this.permisoAActualizar = permiso;
    this.showUpdateConfirm = true;
  }

  cancelarActualizacion() {
    this.permisoAActualizar = null;
    this.showUpdateConfirm = false;
  }

  editarPermiso() {
    if (this.permisoAActualizar) {
      this.permisoEditando = this.permisoAActualizar;
      this.showForm = true;
      this.permisoForm.patchValue({
        name: this.permisoAActualizar.name,
        description: this.permisoAActualizar.description
      });
      this.showUpdateConfirm = false;
      this.permisoAActualizar = null;
    }
  }

  confirmarEliminacion(permiso: Permission) {
    this.permisoAEliminar = permiso;
    this.showConfirm = true;
  }

  cancelarEliminacion() {
    this.permisoAEliminar = null;
    this.showConfirm = false;
  }

  eliminarPermiso() {
    if (this.permisoAEliminar) {
      this.permissionService.genericService.delete(this.permissionService.endpoint, this.permisoAEliminar.id).subscribe({
        next: () => {
          this.mostrarAlerta('eliminado', 'Permiso eliminado correctamente');
          this.obtenerPermisos();
          this.cancelarEliminacion();
        },
        error: () => {
          this.mostrarAlerta('error', 'Error al eliminar el permiso');
          this.cancelarEliminacion();
        }
      });
    }
  }

  mostrarAlerta(tipo: 'bienvenida' | 'creado' | 'eliminado' | 'error' | 'info', mensaje: string) {
    console.log('Mostrando alerta:', tipo, mensaje); // Debug log
    this.alertType = tipo;
    this.alertMsg = mensaje;
    this.showAlert = true;
    console.log('showAlert:', this.showAlert); // Debug log
    setTimeout(() => {
      this.showAlert = false;
      console.log('Ocultando alerta'); // Debug log
    }, 5000); // Aumenté el tiempo para que puedas verlo mejor
  }
}
