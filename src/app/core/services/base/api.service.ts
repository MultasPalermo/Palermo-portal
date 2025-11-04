// ===============================
import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { environment } from '../../../../environments/environment';


@Injectable({ providedIn: 'root' })
export abstract class ApiService {
  protected readonly baseUrl = environment.apiURL;

  constructor(protected http: HttpClient) { }

  // ===============================
  // 🛠️ Helpers
  // ===============================

  /** Construcción de headers con Authorization */
  protected getHeaders(): HttpHeaders {
    const currentUser = localStorage.getItem('currentUser');
    const token = currentUser ? JSON.parse(currentUser)?.token : undefined;

    const headers: Record<string, string> = { 'Content-Type': 'application/json' };
    if (token) headers['Authorization'] = `Bearer ${token}`;
    return new HttpHeaders(headers);
  }

  /** Construcción de headers sin Authorization */
  protected getHeadersNoAuth(): HttpHeaders {
    return new HttpHeaders({ 'Content-Type': 'application/json' });
  }

  /** Opciones con JWT (Authorization Bearer) */
  protected optsJwt() {
    return { headers: this.getHeaders() };
  }

  /** Opciones con Cookie (withCredentials) */
  protected optsCookie() {
    return { headers: this.getHeadersNoAuth(), withCredentials: true };
  }

  /** Construye URL final */
  protected url(controller: string, ...segments: (string | number)[]) {
    const parts = [this.baseUrl, controller, ...segments].map(s =>
      String(s).replace(/^\/+|\/+$/g, '')
    );
    return parts.filter(Boolean).join('/');
  }

  /** Construye parámetros dinámicos */
  protected buildParams(obj?: Record<string, any>): HttpParams {
    let params = new HttpParams();
    if (!obj) return params;
    for (const [k, v] of Object.entries(obj)) {
      if (v === undefined || v === null) continue;
      if (Array.isArray(v)) for (const item of v) params = params.append(k, String(item));
      else if (v instanceof Date) params = params.set(k, v.toISOString());
      else params = params.set(k, String(v));
    }
    return params;
  }
}