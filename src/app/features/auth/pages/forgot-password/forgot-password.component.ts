import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { RippleModule } from 'primeng/ripple';
import Swal from 'sweetalert2';

import { EmailVerificationService } from '../../../../core/services/email/email-verification.service';
import { validateEmail } from '../../../../shared/utils/validator/login-register';

@Component({
  selector: 'app-forgot-password',
  standalone: true,
  imports: [
    CommonModule,
    ButtonModule,
    InputTextModule,
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
      <h2>Recuperar Contraseña</h2>

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

      <button
        pButton label="Enviar Código"
        class="p-button-success w-full mt-3 login-btn pulse"
        (click)="onSendCode()"
        [disabled]="!email || loading">
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

export class ForgotPassword {
  email = '';
  loading = false;
  navigatingHome = false;

  constructor(private router: Router, private emailVerificationService: EmailVerificationService) {}

  onSendCode(): void {
    const emailError = validateEmail(this.email);

    if (emailError) {
      Swal.fire('Error', emailError!, 'error');
      return;
    }

    this.loading = true;

    this.emailVerificationService.SendVerificationPasswordAsync({ Email: this.email.trim() })
      .subscribe({
        next: (response: any) => {
          console.log("✅ Código enviado:", response);
          Swal.fire('Éxito', 'Código enviado al correo electrónico', 'success');
          this.router.navigate(['/auth/verify-code'], { queryParams: { email: this.email, type: 'passwordReset' } });
          this.loading = false;
        },
        error: (err: any) => {
          console.error("❌ Error enviando código:", err);
          const msg = err?.error?.message || err?.message || 'Error enviando código';
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