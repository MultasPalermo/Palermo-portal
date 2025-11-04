// ===============================
import { Injectable } from '@angular/core';
import { ApiService } from '../base/api.service';

@Injectable({ providedIn: 'root' })
export class FilterService extends ApiService {

  // ===============================
  // 📌 Filtros
  // ===============================
  filterMultas(body: { userId?: number; searchTerm?: string }) {
    return this.http.post<{ count: number; data: any[] }>(
      this.url('UserInfraction', 'filter'),
      body,
      this.optsJwt()
    );
  }

  getInfractionsByType(typeInfractionId: number) {
    return this.http.get<any>(
      this.url('UserInfraction', 'by-type'),
      {
        ...this.optsJwt(),
        params: this.buildParams({ typeInfractionId })
      }
    );
  }
}