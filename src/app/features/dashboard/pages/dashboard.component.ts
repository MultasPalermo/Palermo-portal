import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { DashboardService, DashboardStats, FrecuenciaPago, MetodoPago } from '../../../core/services/dashboard/dashboard.service';
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
    multasVencidas: 0,
    totalAcuerdosPago: 0,
    montoTotalAcuerdos: 0,
    frecuenciasPago: [],
    metodosPago: []
  });

  loading = signal<boolean>(false);
  error = signal<string | null>(null);
  usandoDatosReales = signal<boolean>(false);

  constructor(private dashboardService: DashboardService) {}

  ngOnInit(): void {
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
        console.log('✅ Estadísticas generales cargadas:', data);
        this.stats.set(data);
        this.loading.set(false);
        this.error.set(null);
        this.usandoDatosReales.set(true);
      },
      error: (err) => {
        console.error('❌ Error al cargar estadísticas generales:', err);
        this.error.set('Error al cargar las estadísticas del dashboard');
        this.loading.set(false);
        this.usandoDatosReales.set(false);
      }
    });
  }

  refrescarDatos(): void {
    this.cargarDatos();
  }

  calcularPorcentaje(valor: number, total: number): number {
    return total > 0 ? (valor / total) * 100 : 0;
  }
}
