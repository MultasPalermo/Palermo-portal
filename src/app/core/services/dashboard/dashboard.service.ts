import { Injectable, inject } from '@angular/core';
import { Observable, forkJoin, of } from 'rxjs';
import { map, catchError } from 'rxjs/operators';
import { ServiceGenericService } from '../utils/generic/service-generic.service';

export interface FrecuenciaPago {
  nombre: string;
  cantidad: number;
  porcentaje: number;
}

export interface MetodoPago {
  nombre: string;
  cantidad: number;
  porcentaje: number;
}

export interface DashboardStats {
  totalMultas: number;
  multasPendientes: number;
  multasPagadas: number;
  totalUsuarios: number;
  multasDelMes: number;
  montoTotal: number;
  multasVencidas: number;
  totalAcuerdosPago: number;
  montoTotalAcuerdos: number;
  frecuenciasPago: FrecuenciaPago[];
  metodosPago: MetodoPago[];
}

@Injectable({ providedIn: 'root' })
export class DashboardService {
  private genericService = inject(ServiceGenericService);

  /**
   * Obtiene las estadísticas generales del dashboard calculadas desde endpoints existentes
   */
  getEstadisticasGenerales(): Observable<DashboardStats> {
    return forkJoin({
      infracciones: this.genericService.getAll<any>('UserInfraction').pipe(
        catchError((error) => {
          console.error('❌ Error obteniendo infracciones:', error);
          return of([]);
        })
      ),
      personas: this.genericService.getAll<any>('Person').pipe(
        catchError((error) => {
          console.error('❌ Error obteniendo personas:', error);
          return of([]);
        })
      ),
      acuerdosPago: this.genericService.getAll<any>('PaymentAgreement').pipe(
        catchError((error) => {
          console.error('❌ Error obteniendo acuerdos de pago:', error);
          return of([]);
        })
      )
    }).pipe(
      map(({ infracciones, personas, acuerdosPago }) => {
        console.log('📊 Total de infracciones obtenidas:', infracciones.length);
        console.log('📊 Infracciones:', infracciones);
        console.log('📊 Total de acuerdos de pago obtenidos:', acuerdosPago.length);
        console.log('📊 Acuerdos de pago:', acuerdosPago);

        const ahora = new Date();
        const primerDiaMes = new Date(ahora.getFullYear(), ahora.getMonth(), 1);

        // Calcular estadísticas de infracciones
        const totalMultas = infracciones.length;
        const multasPendientes = infracciones.filter((i: any) =>
          i.stateInfraction === 1 || i.stateInfraction === 'Pendiente'
        ).length;
        const multasPagadas = infracciones.filter((i: any) =>
          i.stateInfraction === 2 || i.stateInfraction === 'Pagada'
        ).length;
        const multasVencidas = infracciones.filter((i: any) =>
          i.stateInfraction === 3 || i.stateInfraction === 'Vencida'
        ).length;

        // Multas del mes actual
        const multasDelMes = infracciones.filter((i: any) => {
          if (!i.infractionDate && !i.createdAt) return false;
          const fecha = new Date(i.infractionDate || i.createdAt);
          return fecha >= primerDiaMes;
        }).length;

        // Calcular monto total de multas
        const montoTotal = infracciones.reduce((sum: number, i: any) => {
          const monto = i.amount || i.valor || i.totalAmount || 0;
          return sum + Number(monto);
        }, 0);

        // Calcular estadísticas de acuerdos de pago
        const totalAcuerdosPago = acuerdosPago.length;
        const montoTotalAcuerdos = acuerdosPago.reduce((sum: number, a: any) => {
          // Usar los campos correctos: baseAmount (monto base), outstandingAmount (monto pendiente)
          const monto = a.outstandingAmount || a.baseAmount || a.monto || 0;
          return sum + Number(monto);
        }, 0);

        // Calcular métodos de pago más usados
        const metodosMap = new Map<string, number>();
        acuerdosPago.forEach((a: any) => {
          const metodo = a.paymentMethod || a.metodoPago || 'Sin definir';
          metodosMap.set(metodo, (metodosMap.get(metodo) || 0) + 1);
        });

        const metodosPago: MetodoPago[] = Array.from(metodosMap.entries()).map(([nombre, cantidad]) => ({
          nombre,
          cantidad,
          porcentaje: totalAcuerdosPago > 0 ? (cantidad / totalAcuerdosPago) * 100 : 0
        })).sort((a, b) => b.cantidad - a.cantidad);

        // Calcular frecuencias de pago
        const frecuenciasMap = new Map<string, number>();
        acuerdosPago.forEach((a: any) => {
          const frecuencia = a.frequencyPayment || a.frecuenciaPago || 'Sin definir';
          frecuenciasMap.set(frecuencia, (frecuenciasMap.get(frecuencia) || 0) + 1);
        });

        const frecuenciasPago: FrecuenciaPago[] = Array.from(frecuenciasMap.entries()).map(([nombre, cantidad]) => ({
          nombre,
          cantidad,
          porcentaje: totalAcuerdosPago > 0 ? (cantidad / totalAcuerdosPago) * 100 : 0
        })).sort((a, b) => b.cantidad - a.cantidad);

        console.log('📊 Estadísticas calculadas:', {
          totalMultas,
          multasPendientes,
          multasPagadas,
          multasVencidas,
          montoTotal,
          totalAcuerdosPago,
          montoTotalAcuerdos,
          frecuenciasPago,
          metodosPago
        });

        return {
          totalMultas,
          multasPendientes,
          multasPagadas,
          totalUsuarios: personas.length,
          multasDelMes,
          montoTotal,
          multasVencidas,
          totalAcuerdosPago,
          montoTotalAcuerdos,
          frecuenciasPago,
          metodosPago
        };
      }),
      catchError((error) => {
        console.error('❌ Error procesando estadísticas:', error);
        return of({
          totalMultas: 0,
          multasPendientes: 0,
          multasPagadas: 0,
          totalUsuarios: 0,
          multasDelMes: 0,
          montoTotal: 0,
          multasVencidas: 0,
          totalAcuerdosPago: 0,
          montoTotalAcuerdos: 0,
          frecuenciasPago: [],
          metodosPago: []
        });
      })
    );
  }

}
