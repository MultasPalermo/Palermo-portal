// ===============================
import { Component, OnInit, OnDestroy, ViewChild, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
// import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms'; // Ya no necesario
import { Router } from '@angular/router';
import { Subject, takeUntil } from 'rxjs';

// PrimeNG
import { ToastModule } from 'primeng/toast';

// Services
import { ProfileService } from '../../../core/services/profile/profile.service';
import { LayoutService } from '../../../layout/services/layout.service';
import { AuthService } from '../../../core/services/auth/auth.service';

// Models
import { ProfileDto } from '../../../shared/modeloModelados/profile/profile.model';

// ===============================
// 👤 Componente de Perfil
// ===============================
@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [
    CommonModule,
    ToastModule
  ],
  templateUrl: './profile.html',
  styleUrls: ['./profile.scss']
})
export class ProfileComponent implements OnInit, OnDestroy {
  @ViewChild('op') overlayPanel: any;

  // Services
  private profileService = inject(ProfileService);
  private authService = inject(AuthService);
  public layoutService = inject(LayoutService);
  private router = inject(Router);

  // Observables
  private destroy$ = new Subject<void>();

  // Datos
  profile: ProfileDto | null = null;
  isLoading = false;



  // ===============================
  // 📌 Ciclo de vida
  // ===============================

  ngOnInit(): void {
    console.log('🎯 ProfileComponent cargado exitosamente!');
    this.loadProfile();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  // ===============================
  // 📌 Inicialización
  // ===============================

  // Método eliminado - ya no necesitamos formulario
  // private initForm(): void { ... }

  private loadProfile(): void {
    this.isLoading = true;
    this.profileService.getMyProfile()
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (profile) => {
          console.log('✅ Perfil cargado exitosamente:', profile);
          this.profile = profile;
          this.isLoading = false;
        },
        error: (error) => {
          console.error('❌ Error al cargar perfil:', error);

          // Si falla, usar datos de prueba para que al menos se vea el formulario
          console.warn('⚠️ Usando datos de prueba...');
          const mockProfile: ProfileDto = {
            id: 1,
            firstName: 'Usuario',
            lastName: 'Demo',
            email: 'usuario@demo.com',
            phoneNumber: '3001234567',
            address: 'Bogotá, Colombia',
            documentTypeId: 1,
            documentNumber: '1234567890'
          };

          this.profile = mockProfile;
          console.warn('No se pudo cargar el perfil del servidor. Mostrando datos de ejemplo.');
          this.isLoading = false;
        }
      });
  }

  // Método eliminado - ya no necesitamos llenar formulario
  // private populateForm(profile: ProfileDto): void { ... }

  // ===============================
  // 📌 Métodos de formulario eliminados - Solo lectura
  // ===============================

  // onSubmit(): void { ... } - Eliminado
  // onDiscard(): void { ... } - Eliminado

  // ===============================
  // 📌 Manejo de imagen - YA NO NECESARIO
  // ===============================

  // onImageSelect(event: any): void {
  //   // Método comentado - ya no necesitamos manejar imágenes
  // }

  // private uploadImage(): void {
  //   // Método comentado - ya no necesitamos subir imágenes
  // }

  // ===============================
  // 📌 Navegación y acciones
  // ===============================

  toggleDarkMode(): void {
    this.layoutService.layoutConfig.update((state) => ({
      ...state,
      darkTheme: !state.darkTheme
    }));
  }

  goToProfile(): void {
    this.router.navigate(['/profile']);
    this.overlayPanel?.hide();
  }

  openSettings(): void {
    console.log('Funcionalidad de configuración próximamente');
    this.overlayPanel?.hide();
  }

  logout(): void {
    this.authService.logouts()
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: () => {
          this.profileService.clearProfile();
          this.overlayPanel?.hide();
        },
        error: (error) => {
          console.error('Error al cerrar sesión:', error);
          // Forzar logout local si falla el servidor
          localStorage.clear();
          this.router.navigate(['/auth/login']);
          this.overlayPanel?.hide();
        }
      });
  }

  // ===============================
  // 📌 Utilidades
  // ===============================

  // getProfileImage(): string {
  //   // Ya no necesitamos este método - ahora usamos iniciales
  //   return this.previewImageUrl || this.profile?.profileImage || this.defaultImage;
  // }

  getFullName(): string {
    if (this.profile) {
      return `${this.profile.firstName} ${this.profile.lastName}`;
    }
    return 'Usuario';
  }

  getInitials(): string {
    if (this.profile && this.profile.firstName && this.profile.lastName) {
      return `${this.profile.firstName.charAt(0).toUpperCase()}${this.profile.lastName.charAt(0).toUpperCase()}`;
    }
    return 'U';
  }

  getDocumentType(): string {
    if (this.profile?.documentTypeId) {
      // Mapeo de tipos de documento comunes
      const documentTypes: { [key: number]: string } = {
        1: 'Cédula de Ciudadanía',
        2: 'Cédula de Extranjería', 
        3: 'Pasaporte',
        4: 'Tarjeta de Identidad',
        5: 'NIT',
        6: 'RUT'
      };
      return documentTypes[this.profile.documentTypeId] || `Tipo ${this.profile.documentTypeId}`;
    }
    return 'No disponible';
  }

  // ===============================
  // 📌 Métodos de mensajes eliminados
  // ===============================

  // showSuccess, showError, showInfo eliminados - ya no necesarios
}
