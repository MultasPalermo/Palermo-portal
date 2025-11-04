import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { HttpClient, HttpClientModule } from '@angular/common/http';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import Swal from 'sweetalert2';
import { environment } from '../../../../../environments/environment';

@Component({
  selector: 'app-verify-email',
  standalone: true,
  imports: [FormsModule, RouterModule, HttpClientModule, ButtonModule, InputTextModule],
  template: `
    <div class="login-wrapper">
      <div class="login-card">
        <h2>Verificar correo</h2>
        <p class="subtitle">Ingresa tu correo electrónico para verificar tu cuenta</p>

        <div class="input-group mt-2">
          <label>
            <i class="pi pi-envelope"></i>
            <input
              pInputText
              type="email"
              placeholder="Correo electrónico"
              [(ngModel)]="email"
              class="styled-input"
            />
          </label>
        </div>

        <button
          pButton
          label="Verificar"
          class="p-button-success w-full mt-3"
          (click)="verifyEmail()"
        ></button>
      </div>
    </div>
  `,
  styles: [`
    .login-wrapper {
      display: flex;
      justify-content: center;
      align-items: center;
      min-height: 100vh;
    }
    .login-card {
      background: #fff;
      padding: 20px;
      border-radius: 10px;
      width: 100%;
      max-width: 400px;
      box-shadow: 0 4px 12px rgba(0,0,0,0.1);
      text-align: center;
    }
    .styled-input {
      width: 100%;
      padding: 8px;
      margin-top: 10px;
      border-radius: 6px;
      border: 1px solid #ccc;
    }
    .subtitle {
      color: #555;
      margin-bottom: 15px;
    }
  `]
})
export class VerifyEmailComponent {
  email: string = '';

  constructor(private http: HttpClient, private router: Router) {}

  verifyEmail() {
    if (!this.email?.trim()) {
      Swal.fire('Error', 'Debes ingresar tu correo electrónico.', 'error');
      return;
    }

    this.http.post<any>(`${environment.apiURL}/Login/verify-email`, {
      email: this.email.trim()
    }).subscribe({
      next: (res) => {
        if (res.isSuccess) {
          Swal.fire('¡Éxito!', 'Correo verificado correctamente.', 'success')
            .then(() => this.router.navigate(['auth/login']));
        } else {
          Swal.fire('Error', res.message || 'Correo incorrecto.', 'error');
        }
      },
      error: (err) => {
        Swal.fire('Error', err.error?.message || 'No se pudo verificar el correo.', 'error');
      }
    });
  }
}
