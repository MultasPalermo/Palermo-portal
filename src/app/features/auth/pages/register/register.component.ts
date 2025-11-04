import { Component, ElementRef, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { PasswordModule } from 'primeng/password';
import { AuthService } from '../../../../core/services/auth/auth.service';
import { EmailVerificationService } from '../../../../core/services/email/email-verification.service';
import Swal from 'sweetalert2';
import { HttpErrorResponse } from '@angular/common/http';
import { validateRegisterEmail, validateRegisterFullName, validateRegisterPassword } from '../../../../shared/utils/validator/login-register';

@Component({
  selector: 'app-Registrar',
  standalone: true,
  imports: [CommonModule, ButtonModule, InputTextModule, PasswordModule, FormsModule, RouterModule],
  template: `
<div class="login-wrapper animate-fade-in">
  <div class="login-card">
    <div class="login-image">
      <img src="../../../assets/demo/login.png" alt="Imagen de fondo" />
    </div>

    <div class="login-form">
      <img src="../../../assets/demo/login_Arriba.png" class="corner corner-top-right" />
      <h2>Registrar</h2>

      <div class="input-group">
        <label class="input-label">
          <i class="pi pi-user input-icon"></i>
          <input #fullNameInput pInputText placeholder="Nombre completo" [(ngModel)]="fullName" class="styled-input" />
        </label>
      </div>

      <div class="input-group">
        <label class="input-label">
          <i class="pi pi-envelope input-icon"></i>
          <input #emailInput pInputText placeholder="Correo electrónico" [(ngModel)]="email" class="styled-input" />
        </label>
      </div>

      <div class="input-group">
        <label class="input-label">
          <i class="pi pi-lock input-icon"></i>
          <input #passwordInput pInputText type="password" placeholder="Contraseña" [(ngModel)]="password" class="styled-input" />
        </label>
      </div>

    <button
      pButton
      label="Registrarse"
      class="p-button-success w-full mt-3 login-btn pulse"
      [disabled]="loading"
      (click)="onRegister()">
    </button>


      <div class="login-links">
        <a [routerLink]="'/auth/login'">¿Ya tienes cuenta?</a>
        <a (click)="goToHome($event)" [class.loading]="navigatingHome">
          <span *ngIf="!navigatingHome">Volver al inicio</span>
          <span *ngIf="navigatingHome">Cargando...</span>
        </a>
      </div>

      <img src="../../../assets/demo/login_Abajo.png" class="corner corner-bottom-left" />
    </div>
  </div>
</div>
  `
})
export class Registrar {
  fullName = '';
  email = '';
  password = '';
  loading = false;
  navigatingHome = false;

  @ViewChild('fullNameInput') fullNameRef!: ElementRef<HTMLInputElement>;
  @ViewChild('emailInput') emailRef!: ElementRef<HTMLInputElement>;
  @ViewChild('passwordInput') passwordRef!: ElementRef<HTMLInputElement>;

  constructor(private authService: AuthService, private emailService: EmailVerificationService, private router: Router) { }

  canSubmit(): boolean {
    return !!(this.fullName.trim() && this.email.trim() && this.password.length >= 6);
  }

  onRegister(): void {
    const nameError = validateRegisterFullName(this.fullName);
    const emailError = validateRegisterEmail(this.email);
    const passError = validateRegisterPassword(this.password);

    if (nameError || emailError || passError) {
      Swal.fire('Error', nameError || emailError || passError!, 'error');
      return;
    }

    this.loading = true;

    const [firstName, ...rest] = this.fullName.trim().split(' ');
    const lastName = rest.join(' ');

    const payload = {
      email: this.email.trim(),
      password: this.password,
      firstName: firstName || '',
      lastName: lastName || ''
    };

    this.authService.registrar(payload).subscribe({
      next: () => {
        // ✅ Mandamos verificación en segundo plano
        this.emailService.sendVerification(firstName, this.email).subscribe();

        // ✅ Mostramos alerta y redirigimos
        Swal.fire({
          icon: 'success',
          title: '¡Registro exitoso!',
          text: 'Te enviamos un código de verificación a tu correo.'
        }).then(() => {
          this.router.navigate(['/auth/verify-code'], {
            queryParams: { email: this.email }
          });
        });
      },
      error: (err: HttpErrorResponse) => {
        const errorMsg =
          err?.error?.message ||
          err?.message ||
          'Ocurrió un error inesperado al registrar.';

        Swal.fire({
          icon: 'error',
          title: 'Error en el registro',
          text: errorMsg
        });
      },
      complete: () => (this.loading = false)
    });
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


