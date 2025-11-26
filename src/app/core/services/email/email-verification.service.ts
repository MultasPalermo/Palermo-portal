// ===============================
import { Injectable } from '@angular/core';
import { ApiService } from '../base/api.service';

@Injectable({ providedIn: 'root' })
export class EmailVerificationService extends ApiService {

  // ===============================
  // 📌 Verificación de correo
  // ===============================
  sendVerification(nombre: string, email: string) {
    return this.http.post<any>(
      this.url('verificacion', 'send'),
      { nombre, email },
      { headers: this.getHeaders() }
    );
  }

  validateCode(email: string, code: string) {
    return this.http.post<any>(
      this.url('verificacion', 'validate'),
      { email, code },
      { headers: this.getHeaders() }
    );
  }

  sendReactivation(email: string) {
    return this.http.post<any>(
      this.url('verificacion', 'send-reactivation'),
      { email },
      { headers: this.getHeaders() }
    );
  }

  reactivateAccount(email: string, code: string) {
    return this.http.post<any>(
      this.url('verificacion', 'reactivate'),
      { email, code },
      { headers: this.getHeaders() }
    );
  }

  sendMonthly(nombre: string, email: string) {
    return this.http.post<any>(
      this.url('verificacion', 'send-monthly'),
      { nombre, email },
      { headers: this.getHeaders() }
    );
  }

  // ===============================
// 📌 Recuperación de contraseña
// ===============================
SendVerificationPasswordAsync(dto: { Email: string }) {
  return this.http.post<any>(
    this.url('Auth', 'code'),
    dto,
    { headers: this.getHeaders() }
  );
}

ValidateCodePassword(dto: { Email: string; Code: string }) {
  return this.http.post<any>(
    this.url('Auth', 'validate'),
    dto,
    { headers: this.getHeaders() }
  );
}
}