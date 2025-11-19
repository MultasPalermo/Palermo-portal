import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { DashboardService, DashboardStats } from '../../../core/services/dashboard/dashboard.service';
import { StatCardComponent } from '../../../shared/modeloModelados/bashboard/stat-card.component';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, StatCardComponent, RouterModule],
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss']
})
export class DashboardComponent implements OnInit {
  
  stats = signal<DashboardStats>({
    totalMultas: 0,
    multasPendientes: 0,
    multasPagadas: 0,
    totalUsuarios: 0,
    multasDelMes: 0,
    montoTotal: 0,
    multasVencidas: 0
  });

  multasPorEstado = signal<any[]>([]);
  multasPorMes = signal<any[]>([]);
  loading = signal<boolean>(false);
  error = signal<string | null>(null);
  usandoDatosReales = signal<boolean>(false);

  constructor(private dashboardService: DashboardService) {}

  ngOnInit(): void {
    // Intentar cargar datos reales del backend primero
    this.loading.set(true);
    this.cargarDatosBackend();
  }

  cargarDatos(): void {
    this.loading.set(true);
    this.error.set(null);
    this.cargarDatosBackend();
  }

  private cargarDatosBackend(): void {
    // Cargar estadísticas generales
    this.dashboardService.getEstadisticasGenerales().subscribe({
      next: (data) => {
        console.log('✅ Datos del backend recibidos:', data);
        this.stats.set(data);
        this.loading.set(false);
        this.error.set(null);
        this.usandoDatosReales.set(true);
      },
      error: (err) => {
        console.error('❌ Error al cargar datos del backend:', err);
        console.warn('⚠️ Cargando datos de ejemplo como respaldo');
        // Si falla el backend, cargar datos de ejemplo
        this.cargarDatosEjemplo();
        this.loading.set(false);
        this.usandoDatosReales.set(false);
      }
    });

    // Cargar multas por estado
    this.dashboardService.getMultasPorEstado().subscribe({
      next: (data) => {
        console.log('✅ Multas por estado recibidas:', data);
        this.multasPorEstado.set(data);
      },
      error: (err) => {
        console.warn('⚠️ Backend no disponible para multas por estado, usando datos de ejemplo');
        this.multasPorEstado.set([
          { estado: 'Pendiente', cantidad: 87, porcentaje: 35.5 },
          { estado: 'Pagada', cantidad: 142, porcentaje: 58.0 },
          { estado: 'Vencida', cantidad: 16, porcentaje: 6.5 }
        ]);
      }
    });

    // Cargar multas por mes
    this.dashboardService.getMultasPorMes().subscribe({
      next: (data) => {
        console.log('✅ Multas por mes recibidas:', data);
        this.multasPorMes.set(data);
      },
      error: (err) => {
        console.warn('⚠️ Backend no disponible para multas por mes, usando datos de ejemplo');
        this.multasPorMes.set([
          { mes: 'Junio', cantidad: 4 },
          { mes: 'Julio', cantidad: 38 },
          { mes: 'Agosto', cantidad: 51 },
          { mes: 'Septiembre', cantidad: 45 },
          { mes: 'Octubre', cantidad: 35 },
          { mes: 'Noviembre', cantidad: 34 }
        ]);
      }
    });
  }

  /**
   * Carga datos de ejemplo para desarrollo/pruebas
   */
  private cargarDatosEjemplo(): void {
    this.stats.set({
      totalMultas: 245,
      multasPendientes: 87,
      multasPagadas: 142,
      totalUsuarios: 1523,
      multasDelMes: 34,
      montoTotal: 1250000,
      multasVencidas: 16
    });

    this.multasPorEstado.set([
      { estado: 'Pendiente', cantidad: 87, porcentaje: 35.5 },
      { estado: 'Pagada', cantidad: 142, porcentaje: 58.0 },
      { estado: 'Vencida', cantidad: 16, porcentaje: 6.5 }
    ]);

    this.multasPorMes.set([
      { mes: 'Junio', cantidad: 42 },
      { mes: 'Julio', cantidad: 38 },
      { mes: 'Agosto', cantidad: 51 },
      { mes: 'Septiembre', cantidad: 45 },
      { mes: 'Octubre', cantidad: 35 },
      { mes: 'Noviembre', cantidad: 34 }
    ]);
  }

  calcularPorcentajePendientes(): number {
    if (this.stats().totalMultas === 0) return 0;
    return (this.stats().multasPendientes / this.stats().totalMultas) * 100;
  }

  calcularPorcentajePagadas(): number {
    if (this.stats().totalMultas === 0) return 0;
    return (this.stats().multasPagadas / this.stats().totalMultas) * 100;
  }

  refrescarDatos(): void {
    this.cargarDatos();
  }
}
