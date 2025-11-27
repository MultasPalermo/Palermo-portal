import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterModule, ActivatedRoute } from '@angular/router';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { PasswordModule } from 'primeng/password';
import { RippleModule } from 'primeng/ripple';
import Swal from 'sweetalert2';

import { AuthService } from '../../../../core/services/auth/auth.service';
import { validatePassword } from '../../../../shared/utils/validator/login-register';

@Component({
  selector: 'app-reset-password',
  standalone: true,
  imports: [
    CommonModule,
    ButtonModule,
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
      <h2>Nueva Contraseña</h2>

      <div class="input-group">
        <label class="input-label">
          <i class="pi pi-lock input-icon"></i>
          <input
            type="password"
            pInputText
            [(ngModel)]="newPassword"
            placeholder="Nueva Contraseña"
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
            [(ngModel)]="confirmPassword"
            placeholder="Confirmar Contraseña"
            class="styled-input"
          />
        </label>
      </div>

      <button
        pButton label="Cambiar Contraseña"
        class="p-button-success w-full mt-3 login-btn pulse"
        (click)="onResetPassword()"
        [disabled]="!newPassword || !confirmPassword || loading">
      </button>

      <div class="login-links">
        <a (click)="goToLogin($event)">Volver al inicio de sesión</a>
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

export class ResetPassword implements OnInit {
  email = '';
  newPassword = '';
  confirmPassword = '';
  loading = false;
  navigatingHome = false;

  constructor(
    private router: Router,
    private route: ActivatedRoute,
    private authService: AuthService
  ) {}

  ngOnInit(): void {
    this.route.queryParams.subscribe(params => {
      this.email = params['email'] || '';
    });
  }

  onResetPassword(): void {
    if (this.newPassword !== this.confirmPassword) {
      Swal.fire('Error', 'Las contraseñas no coinciden', 'error');
      return;
    }

    const passError = validatePassword(this.newPassword);

    if (passError) {
      Swal.fire('Error', passError!, 'error');
      return;
    }

    this.loading = true;

    this.authService.ResetPasswordAsync({ email: this.email, newPassword: this.newPassword })
      .subscribe({
        next: (response: any) => {
          console.log("✅ Contraseña cambiada:", response);
          Swal.fire('Éxito', 'Contraseña cambiada correctamente', 'success');
          this.router.navigate(['/auth/login']);
          this.loading = false;
        },
        error: (err: any) => {
          console.error("❌ Error cambiando contraseña:", err);
          const msg = err?.error?.message || err?.message || 'Error cambiando contraseña';
          Swal.fire({
            icon: 'error',
            title: 'Error',
            text: msg
          });
          this.loading = false;
        }
      });
  }

  goToLogin(e?: Event) {
    e?.preventDefault();
    this.router.navigate(['/auth/login']);
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