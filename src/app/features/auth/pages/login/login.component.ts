import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { ButtonModule } from 'primeng/button';
import { CheckboxModule } from 'primeng/checkbox';
import { InputTextModule } from 'primeng/inputtext';
import { PasswordModule } from 'primeng/password';
import { RippleModule } from 'primeng/ripple';
import Swal from 'sweetalert2';

import { AuthService } from '../../../../core/services/auth/auth.service';
import { User } from '../../../../shared/modeloModelados/modelSecurity/user.model';
import { validateEmail, validatePassword } from '../../../../shared/utils/validator/login-register';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [
    CommonModule,
    ButtonModule,
    CheckboxModule,
    InputTextModule,
    PasswordModule,
    FormsModule,
    RouterModule,
    RippleModule
  ],
  template: `
<div class="login-wrapper animate-fade-in">
  <div class="login-card">
    <div class="login-image">
      <img src="../../../assets/demo/login.png" alt="Imagen de fondo" />
    </div>

    <div class="login-form">
      <img src="../../../assets/demo/login_Arriba.png" class="corner corner-top-right" alt="" />
      <h2>Iniciar sesión</h2>

      <div class="input-group">
        <label class="input-label">
          <i class="pi pi-user input-icon"></i>
          <input
            type="text"
            pInputText
            [(ngModel)]="email"
            placeholder="Correo Electrónico"
            class="styled-input"
          />
        </label>
      </div>

      <div class="input-group">
        <label class="input-label">
          <i class="pi pi-lock input-icon"></i>
          <input
            type="password"
            pInputText
            [(ngModel)]="password"
            placeholder="Contraseña"
            class="styled-input"
          />
        </label>
      </div>

      <button
        pButton label="Iniciar Sesión"
        class="p-button-success w-full mt-3 login-btn pulse"
        (click)="onLogin()"
        [disabled]="!email || !password || loading">
      </button>

      <div class="login-links">
        <a (click)="goToRegister($event)">¿Deseas Registrarte?</a>
        <a (click)="goToHome($event)" [class.loading]="navigatingHome">
          <span *ngIf="!navigatingHome">Volver al inicio</span>
          <span *ngIf="navigatingHome">Cargando...</span>
        </a>
      </div>

      <img src="../../../assets/demo/login_Abajo.png" class="corner corner-bottom-left" alt="" />
    </div>
  </div>
</div>
  `
})

 //<a (click)="goToRecovery($event)">¿Olvidaste tu contraseña?</a>
export class Login {
  email = '';
  password = '';
  loading = false;
  navigatingHome = false;

  constructor(private router: Router, private authService: AuthService) {}

  // ===============================
  // 🔑 Iniciar sesión
  // ===============================
  onLogin(): void {
    const emailError = validateEmail(this.email);
    const passError = validatePassword(this.password);

    if (emailError || passError) {
      Swal.fire('Error', emailError || passError!, 'error');
      return;
    }

    this.loading = true;

    this.authService.Login({ email: this.email.trim(), password: this.password })
      .subscribe({
        next: (user: User) => {
          console.log("✅ Usuario autenticado:", user);

          // 🔍 Aquí más adelante podrías reactivar lógica de verificación mensual
          this.router.navigate(['/anexar-multas/multas']);

          this.loading = false;
        },
        error: (err) => {
          console.error("❌ Error en login:", err);
          const msg = err?.error?.message || err?.message || 'Error inesperado al iniciar sesión';
          Swal.fire({
            icon: 'error',
            title: 'Error en inicio de sesión',
            text: msg
          });
          this.loading = false;
        }
      });
  }

  // ===============================
  // 🔗 Navegaciones auxiliares
  // ===============================
  goToRecovery(e?: Event) {
    e?.preventDefault();
    this.router.navigate(['/auth/recovery-password']);
  }

  goToRegister(e?: Event) {
    e?.preventDefault();
    this.router.navigate(['/auth/registrar']);
  }

  goToHome(e?: Event) {
    e?.preventDefault();
    this.navigatingHome = true;

    setTimeout(() => {
      this.router.navigate(['/']).finally(() => {
        this.navigatingHome = false;
      });
    }, 500);
  }
}

