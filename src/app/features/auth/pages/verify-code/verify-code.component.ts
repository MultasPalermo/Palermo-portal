import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { RippleModule } from 'primeng/ripple';
import Swal from 'sweetalert2';
import { HttpClient, HttpClientModule } from '@angular/common/http';
import { environment } from '../../../../../environments/environment';

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
          <button
            pButton
            label="Salir"
            class="p-button-secondary w-full mt-2 login-btn"
            (click)="exit()">
          </button>
          <img src="../../../assets/demo/login_Arriba.png" class="corner corner-top-right" />
          <h2>Verificar correo</h2>
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

          <img src="../../../assets/demo/login_Abajo.png" class="corner corner-bottom-left" />
        </div>
      </div>
    </div>
  `
})
export class VerifyCodeComponent {
  code: string = '';
  email: string = '';

  constructor(private http: HttpClient, private router: Router, private route: ActivatedRoute) {
    this.email = this.route.snapshot.queryParamMap.get('email') ?? '';
  }

  verifyCode() {
    if (!this.code?.trim()) {
      Swal.fire('Error', 'Debes ingresar el código de verificación.', 'error');
      return;
    }

    this.http.post<any>(`${environment.apiURL}/verificacion/validate`, {
      email: this.email.trim(),
      code: this.code.trim()
    }).subscribe({
      next: (res) => {
        if (res.valid) {
          Swal.fire('¡Éxito!', 'Correo verificado correctamente.', 'success')
            .then(() => this.router.navigate(['auth/login']));
        } else {
          Swal.fire('Error', res.message || 'Código incorrecto o expirado.', 'error');
        }
      },
      error: (err) => {
        Swal.fire('Error', err.error?.message || 'No se pudo verificar el código.', 'error');
      }
    });
  }

  exit() {
    Swal.fire({
      title: '¿Seguro que quieres salir?',
      text: 'Perderás la información ingresada.',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Sí, salir',
      cancelButtonText: 'Cancelar'
    }).then((result) => {
      if (result.isConfirmed) {
        this.router.navigate(['/']);
      }
    });
  }
}
