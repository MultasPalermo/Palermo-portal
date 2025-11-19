import { Injectable } from '@angular/core';
import { ApiService } from '../base/api.service';
import { Observable } from 'rxjs';

export interface DashboardStats {
  totalMultas: number;
  multasPendientes: number;
  multasPagadas: number;
  totalUsuarios: number;
  multasDelMes: number;
  montoTotal: number;
  multasVencidas: number;
}

export interface MultaPorEstado {
  estado: string;
  cantidad: number;
  porcentaje: number;
}

export interface MultaPorMes {
  mes: string;
  cantidad: number;
}

@Injectable({ providedIn: 'root' })
export class DashboardService extends ApiService {

  /**
   * Obtiene las estadísticas generales del dashboard
   */
  getEstadisticasGenerales(): Observable<DashboardStats> {
    return this.http.get<DashboardStats>(
      this.url('Dashboard', 'estadisticas-generales'),
      this.optsJwt()
    );
  }

  /**
   * Obtiene la cantidad de multas agrupadas por estado
   */
  getMultasPorEstado(): Observable<MultaPorEstado[]> {
    return this.http.get<MultaPorEstado[]>(
      this.url('Dashboard', 'multas-por-estado'),
      this.optsJwt()
    );
  }

  /**
   * Obtiene la cantidad de multas por mes (últimos 6 meses)
   */
  getMultasPorMes(): Observable<MultaPorMes[]> {
    return this.http.get<MultaPorMes[]>(
      this.url('Dashboard', 'multas-por-mes'),
      this.optsJwt()
    );
  }

  /**
   * Obtiene estadísticas de usuarios
   */
  getEstadisticasUsuarios(): Observable<any> {
    return this.http.get<any>(
      this.url('Dashboard', 'estadisticas-usuarios'),
      this.optsJwt()
    );
  }
}
