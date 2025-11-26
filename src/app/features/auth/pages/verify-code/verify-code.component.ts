import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { RippleModule } from 'primeng/ripple';
import Swal from 'sweetalert2';
import { HttpClient, HttpClientModule } from '@angular/common/http';
import { environment } from '../../../../../environments/environment';
import { EmailVerificationService } from '../../../../core/services/email/email-verification.service';

@Component({
  selector: 'app-verify-code',
  standalone: true,
  imports: [FormsModule, RouterModule, ButtonModule, InputTextModule, RippleModule, HttpClientModule],
  template: `
    <div class="login-wrapper animate-fade-in">
      <div class="login-card">
        <div class="login-image">
          <img src="../../../assets/demo/login.png" alt="Imagen de fondo" />
        </div>

        <div class="login-form">
          <img src="../../../assets/demo/login_Arriba.png" class="corner corner-top-right" />
          <h2>{{ isPasswordReset ? 'Verificar Código' : 'Verificar correo' }}</h2>
          <p class="subtitle">Ingresa el código de verificación que enviamos a tu correo</p>

          <div class="input-group mt-2">
            <label class="input-label">
              <i class="pi pi-key input-icon"></i>
              <input
                pInputText
                placeholder="Código de verificación"
                [(ngModel)]="code"
                class="styled-input"
              />
            </label>
          </div>

          <button
            pButton
            label="Verificar"
            class="p-button-success w-full mt-3 login-btn pulse"
            (click)="verifyCode()"
          ></button>

          <div class="login-links">
            <a (click)="goToLogin($event)">Volver al inicio de sesión</a>
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
export class VerifyCodeComponent {
  code: string = '';
  email: string = '';
  type: string = '';
  isPasswordReset: boolean = false;
  navigatingHome = false;

  constructor(
    private http: HttpClient,
    private router: Router,
    private route: ActivatedRoute,
    private emailVerificationService: EmailVerificationService
  ) {
    this.email = this.route.snapshot.queryParamMap.get('email') ?? '';
    this.type = this.route.snapshot.queryParamMap.get('type') ?? '';
    this.isPasswordReset = this.type === 'passwordReset';
  }

  verifyCode() {
    if (!this.code?.trim()) {
      Swal.fire('Error', 'Debes ingresar el código de verificación.', 'error');
      return;
    }

    if (this.isPasswordReset) {
      // Validar código para reset password
      this.emailVerificationService.ValidateCodePassword({
        Email: this.email.trim(),
        Code: this.code.trim()
      }).subscribe({
        next: (res: any) => {
          if (!res.valid) {
            Swal.fire('Error', 'Código incorrecto o expirado.', 'error');
            return;
          }
          Swal.fire('Éxito', 'Código verificado correctamente.', 'success')
            .then(() => this.router.navigate(['/auth/reset-password'], { queryParams: { email: this.email } }));
        },
        error: (err: any) => {
          Swal.fire('Error', err.error?.message || 'No se pudo verificar el código.', 'error');
        }
      });
    } else {
      // Validar código para registro
      this.http.post<any>(`${environment.apiURL}/verificacion/validate`, {
        email: this.email.trim(),
        code: this.code.trim()
      }).subscribe({
        next: (res) => {
          if (!res.valid) {
            Swal.fire('Error', res.message || 'Código incorrecto o expirado.', 'error');
            return;
          }

          //obtener datos pasados desde el registro
          const firstName = this.route.snapshot.queryParamMap.get('firstName') ?? '';
          const lastName = this.route.snapshot.queryParamMap.get('lastName') ?? '';
          const password = this.route.snapshot.queryParamMap.get('password') ?? '';

          const dto = {
            firstName,
            lastName,
            email: this.email.trim(),
            password,
            verificationCode: this.code.trim()
          };

          // llamar al registro REAL
          this.http.post(`${environment.apiURL}/auth/register`, dto).subscribe({
            next: () => {
              Swal.fire('¡Éxito!', 'Registro completado correctamente.', 'success')
                .then(() => this.router.navigate(['auth/login']));
            },
            error: err => {
              Swal.fire('Error', err.error?.message || 'No se pudo crear el usuario.', 'error');
            }
          });
        },
        error: (err) => {
          Swal.fire('Error', err.error?.message || 'No se pudo verificar el código.', 'error');
        }
      });
    }
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
