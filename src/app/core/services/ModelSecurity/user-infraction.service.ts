import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { HttpClient, HttpParams } from '@angular/common/http';
import { catchError, map, switchMap } from 'rxjs/operators';
import { ServiceGenericService } from '../utils/generic/service-generic.service';
import { UserInfractionDto } from '../../../shared/modeloModelados/Entities/user-infraction';

@Injectable({ providedIn: 'root' })
export class UserInfractionService {
  readonly endpoint = 'UserInfraction';

  constructor(private http: HttpClient) {}

  /**
   * Consulta las infracciones por tipo y número de documento.
   * Ejemplo: /api/UserInfraction/by-document?documentTypeId=1&documentNumber=123
   */
  getByDocument(documentTypeId: number | string, documentNumber: string | number): Observable<UserInfractionDto[]> {
    const url = `/api/${this.endpoint}/by-document`;

    // Normalizar documentTypeId: si viene una cadena no numérica (ej. 'cc') intentar mapearla.
    const normalizedTypeId = this.normalizeDocumentTypeId(documentTypeId);

    const httpParams = new HttpParams()
      .set('documentTypeId', String(normalizedTypeId))
      .set('documentNumber', String(documentNumber));

    // Pedimos la respuesta completa (headers + body) como texto para diagnosticar
    // por qué el backend puede devolver 200 pero con contenido que Angular no parsea como JSON.
    return this.http.get(url, { params: httpParams, responseType: 'text', observe: 'response' as const }).pipe(
      switchMap((resp) => {
        const text = resp.body ?? '';
        const contentType = resp.headers.get('content-type') ?? '';
        // Log para depuración en consola (puedes retirar en producción)
        console.debug('UserInfraction response headers:', resp.headers);
        console.debug('UserInfraction response content-type:', contentType);
        console.debug('UserInfraction response body (trim):', (text || '').slice(0, 500));

        if (!text) return of([] as UserInfractionDto[]);

        // Si la respuesta parece HTML (p. ej. el dev server devolvió index.html),
        // reintentar usando la URL absoluta del backend.
        const trimmed = (text || '').trim();
        if (trimmed.startsWith('<')) {
          console.warn('UserInfraction: la respuesta parece HTML. Reintentando con la URL absoluta del backend.');
          // Construir parámetros ya normalizados
          const absoluteUrl = `https://localhost:7286//api/${this.endpoint}/by-document`;
          return this.retryWithAbsoluteUrl(absoluteUrl, httpParams as HttpParams);
        }

        // Intentar parseo directo
        try {
          const parsed = JSON.parse(text);
          if (Array.isArray(parsed)) return of(parsed as UserInfractionDto[]);
          if (parsed && Array.isArray(parsed.data)) return of(parsed.data as UserInfractionDto[]);
          console.warn('UserInfraction: respuesta inesperada, se esperaba array', parsed);
          return of([] as UserInfractionDto[]);
        } catch (e) {
          // A veces el backend devuelve HTML que envuelve el JSON; intentar extraer el fragmento JSON
          const maybeJson = this.extractJsonFromString(text);
          if (maybeJson) {
            try {
              const parsed2 = JSON.parse(maybeJson);
              if (Array.isArray(parsed2)) return of(parsed2 as UserInfractionDto[]);
              if (parsed2 && Array.isArray(parsed2.data)) return of(parsed2.data as UserInfractionDto[]);
            } catch (e2) {
              console.error('UserInfraction: fallo al parsear JSON extraído', e2);
            }
          }
          console.error('UserInfraction: fallo al parsear JSON de la respuesta', e);
          return of([] as UserInfractionDto[]);
        }
      }),
      catchError(err => {
        // Si HttpClient generó HttpErrorResponse con status 200, aún cae aquí; registrar completo
        console.error('Error fetching UserInfraction by document', err);
        return of([]);
      })
    );
  }

  private retryWithAbsoluteUrl(absoluteUrl: string, httpParams: HttpParams) {
    return this.http.get(absoluteUrl, { params: httpParams, responseType: 'text', observe: 'response' as const }).pipe(
      map((resp) => {
        const text = resp.body ?? '';
        try {
          const parsed = JSON.parse(text);
          if (Array.isArray(parsed)) return parsed as UserInfractionDto[];
          if (parsed && Array.isArray(parsed.data)) return parsed.data as UserInfractionDto[];
          console.warn('UserInfraction retry: respuesta inesperada en absoluteUrl', parsed);
          return [] as UserInfractionDto[];
        } catch (e) {
          console.error('UserInfraction retry: fallo al parsear JSON desde absoluteUrl', e, text);
          return [] as UserInfractionDto[];
        }
      }),
      catchError(err => {
        console.error('UserInfraction retry error using absoluteUrl', err);
        return of([]);
      })
    );
  }

  /**
   * Intenta normalizar identificadores de tipo de documento.
   * Asume mapeo por convención: 'cc' => 1, 'ti' => 2, 'ce' => 3.
   * Si tu backend usa otros ids, actualiza este mapeo.
   */
  private normalizeDocumentTypeId(documentTypeId: number | string): number | string {
    if (typeof documentTypeId === 'number') return documentTypeId;
    const maybeNum = Number(documentTypeId);
    if (!isNaN(maybeNum)) return maybeNum;

    const map: Record<string, number> = { cc: 1, ti: 2, ce: 3 };
    const key = String(documentTypeId).toLowerCase();
    return map[key] ?? documentTypeId;
  }

  /** Extrae el primer fragmento JSON válido que encuentre dentro de un string (si existe) */
  private extractJsonFromString(s: string): string | null {
    const start = s.indexOf('{');
    const end = s.lastIndexOf('}');
    if (start === -1 || end === -1 || end <= start) return null;
    const candidate = s.substring(start, end + 1);
    // Básico: si contiene corchetes o llaves, devolver candidato
    if (candidate.trim().length > 2) return candidate;
    return null;
  }
}
