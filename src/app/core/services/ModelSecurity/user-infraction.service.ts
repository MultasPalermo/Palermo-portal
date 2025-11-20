import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { HttpClient, HttpParams } from '@angular/common/http';
import { catchError, map, switchMap } from 'rxjs/operators';
import { ServiceGenericService } from '../utils/generic/service-generic.service';
import { UserInfractionDto } from '../../../shared/modeloModelados/Entities/user-infraction';
import { environment } from '../../../../environments/environment';

@Injectable({ providedIn: 'root' })
export class UserInfractionService {
  readonly endpoint = 'UserInfraction';

  constructor(private http: HttpClient) {}

  /**
   * Obtiene todas las infracciones de usuarios para seguimiento
   */
  getAllForSeguimiento(): Observable<UserInfractionDto[]> {
    const url = `${environment.apiURL}/${this.endpoint}`;
    return this.http.get<UserInfractionDto[]>(url);
  }

  /**
   * Consulta las infracciones por tipo y número de documento.
   * Endpoint: GET /api/UserInfraction/by-document?documentTypeId=1&documentNumber=123
   * Respuesta: { isSuccess: boolean, count: number, data: UserInfractionDto[] }
   */
  getByDocument(documentTypeId: number | string, documentNumber: string | number): Observable<UserInfractionDto[]> {
    const url = `${environment.apiURL}/${this.endpoint}/by-document`;
    const params = new HttpParams()
      .set('documentTypeId', String(documentTypeId))
      .set('documentNumber', String(documentNumber));

    return this.http.get<{ isSuccess: boolean; count: number; data: UserInfractionDto[] }>(url, { params })
      .pipe(
        map(response => response.data || [])
      );
  }

  /**
   * Descarga PDF de recordatorio de 3 días
   */
  downloadReminder3DaysPdf(id: number): Observable<Blob> {
    const url = `${environment.apiURL}/${this.endpoint}/${id}/pdf/3dias`;
    return this.http.get(url, {
      responseType: 'blob'
    });
  }

  /**
   * Descarga PDF de recordatorio de 15 días
   */
  downloadReminder15DaysPdf(id: number): Observable<Blob> {
    const url = `${environment.apiURL}/${this.endpoint}/${id}/pdf/15dias`;
    return this.http.get(url, {
      responseType: 'blob'
    });
  }

  /**
   * Descarga PDF de recordatorio de 25 días
   */
  downloadReminder25DaysPdf(id: number): Observable<Blob> {
    const url = `${environment.apiURL}/${this.endpoint}/${id}/pdf/25dias`;
    return this.http.get(url, {
      responseType: 'blob'
    });
  }

  /**
   * Descarga PDF de contrato (para multas muy recientes)
   */
  downloadContractPdf(id: number): Observable<Blob> {
    const url = `${environment.apiURL}/${this.endpoint}/${id}/pdf`;
    return this.http.get(url, {
      responseType: 'blob'
    });
  }

  /**
   * Descarga PDF de cobro jurídico (30 días)
   */
  downloadReminder30DaysPdf(id: number): Observable<Blob> {
    const url = `${environment.apiURL}/${this.endpoint}/${id}/pdf/cobroJuridico`;
    return this.http.get(url, {
      responseType: 'blob'
    });
  }

  /**
   * Filtrar multas por tipo de documento, tipo de infracción y estado
   */
  filterMultas(documentTypeId?: number, typeInfractionId?: number, stateInfraction?: number): Observable<UserInfractionDto[]> {
    const url = `${environment.apiURL}/${this.endpoint}/filter`;
    let params = new HttpParams();
    if (documentTypeId !== undefined) params = params.set('documentTypeId', documentTypeId.toString());
    if (typeInfractionId !== undefined) params = params.set('typeInfractionId', typeInfractionId.toString());
    if (stateInfraction !== undefined) params = params.set('stateInfraction', stateInfraction.toString());

    return this.http.get<UserInfractionDto[]>(url, { params });
  }
}
