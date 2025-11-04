// ===============================
import { Injectable, inject } from '@angular/core';
import { Observable, BehaviorSubject, catchError, throwError, map, switchMap } from 'rxjs';
import { ApiService } from '../base/api.service';
import { ProfileDto } from '../../../shared/modeloModelados/profile/profile.model';

// ===============================
// 👤 Servicio de Perfil
// ===============================
@Injectable({ providedIn: 'root' })
export class ProfileService extends ApiService {
  private readonly personEndpoint = 'Person';

  // Store para el perfil del usuario actual
  private profileSubject = new BehaviorSubject<ProfileDto | null>(null);
  public profile$ = this.profileSubject.asObservable();

  // ===============================
  // 📌 Métodos de consulta
  // ===============================

  /**
   * Obtiene el perfil del usuario autenticado actual
   * Usa Auth/me y luego Person/{id}
   */
  getMyProfile(): Observable<ProfileDto> {
    return this.http.get<any>(
      this.url('Auth', 'me'),
      this.optsCookie()
    ).pipe(
      switchMap(user => {
        console.log('✅ Usuario obtenido:', user);

        // Si tiene personId, obtener datos completos de la persona
        if (user.personId) {
          return this.http.get<any>(
            this.url(this.personEndpoint, user.personId),
            this.optsCookie()
          ).pipe(
            map(person => {
              console.log('✅ Persona obtenida:', person);

              const profile: ProfileDto = {
                id: person.id,
                firstName: person.firstName || '',
                lastName: person.lastName || '',
                email: user.email,
                phoneNumber: person.phoneNumber || '',
                address: person.address || '',
                documentTypeId: person.documentTypeId,
                documentNumber: person.documentNumber || '',
              };

              console.log('📋 Perfil mapeado:', profile);
              this.profileSubject.next(profile);
              return profile;
            })
          );
        }

        // Si no hay personId, crear perfil básico con datos del user
        const profile: ProfileDto = {
          firstName: user.fullName?.split(' ')[0] || '',
          lastName: user.fullName?.split(' ').slice(1).join(' ') || '',
          email: user.email,
        };

        this.profileSubject.next(profile);
        return new Observable<ProfileDto>(observer => {
          observer.next(profile);
          observer.complete();
        });
      }),
      catchError(error => {
        console.error('❌ Error al cargar perfil:', error);
        return throwError(() => error);
      })
    );
  }

  /**
   * Obtiene un perfil por ID (requiere permisos)
   */
  getProfileById(id: number): Observable<ProfileDto> {
    return this.http.get<ProfileDto>(
      this.url(this.personEndpoint, id),
      this.optsCookie()
    );
  }

  
  /**
   * Limpia el perfil del store
   */
  clearProfile(): void {
    this.profileSubject.next(null);
  }

  /**
   * Obtiene el perfil actual del store (síncrono)
   */
  getCurrentProfile(): ProfileDto | null {
    return this.profileSubject.value;
  }

  /**
   * Refresca el perfil desde el servidor
   */
  refreshProfile(): void {
    this.getMyProfile().subscribe();
  }
}
