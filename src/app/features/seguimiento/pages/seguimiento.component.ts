import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { UserInfractionService } from '../../../core/services/ModelSecurity/user-infraction.service';
import { UserInfractionDto } from '../../../shared/modeloModelados/Entities/user-infraction';

@Component({
  selector: 'app-seguimiento',
  imports: [CommonModule],
  templateUrl: './seguimiento.component.html',
  styleUrl: './seguimiento.component.scss'
})
export class SeguimientoComponent implements OnInit {
  // Data for each stage
  prejudicial0to3: UserInfractionDto[] = [];
  prejudicial3to15: UserInfractionDto[] = [];
  prejudicial15to25: UserInfractionDto[] = [];
  juridico: UserInfractionDto[] = [];
  coactivo: UserInfractionDto[] = [];

  loading = false;

  constructor(private userInfractionService: UserInfractionService) {}

  ngOnInit() {
    this.loadData();
  }

  loadData() {
    this.loading = true;
    this.userInfractionService.getAllForSeguimiento().subscribe({
      next: (data) => {
        this.categorizeData(data);
        this.loading = false;
      },
      error: (error) => {
        console.error('Error loading seguimiento data', error);
        this.loading = false;
      }
    });
  }

  private categorizeData(data: UserInfractionDto[]) {
    // Reset arrays
    this.prejudicial0to3 = [];
    this.prejudicial3to15 = [];
    this.prejudicial15to25 = [];
    this.juridico = [];
    this.coactivo = [];

    const now = new Date();

    data.forEach(item => {
      switch (item.statusCollection) {
        case 0: // Prejurídico
          this.categorizePrejurídico(item, now);
          break;
        case 1: // Jurídico
          this.juridico.push(item);
          break;
        case 2: // Coactivo
          this.coactivo.push(item);
          break;
      }
    });
  }

  private categorizePrejurídico(item: UserInfractionDto, now: Date) {
    if (!item.paymentDue3Days || !item.paymentDue15Days || !item.paymentDue25Days) {
      // If dates are missing, put in first stage
      this.prejudicial0to3.push(item);
      return;
    }

    const due3Days = new Date(item.paymentDue3Days);
    const due15Days = new Date(item.paymentDue15Days);
    const due25Days = new Date(item.paymentDue25Days);

    if (now <= due3Days) {
      this.prejudicial0to3.push(item);
    } else if (now <= due15Days) {
      this.prejudicial3to15.push(item);
    } else if (now <= due25Days) {
      this.prejudicial15to25.push(item);
    } else {
      // Past due, could go to next stage, but for now keep in last prejurídico
      this.prejudicial15to25.push(item);
    }
  }

  // Helper methods for template
  getFullName(item: UserInfractionDto): string {
    return `${item.firstName || ''} ${item.lastName || ''}`.trim();
  }

  formatCurrency(amount: number): string {
    return new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency: 'COP'
    }).format(amount);
  }

  formatDate(dateString: string): string {
    if (!dateString) return '';
    return new Date(dateString).toLocaleDateString('es-CO');
  }

  calculateDaysMora(item: UserInfractionDto): number {
    if (!item.dateInfraction) return 0;
    const infractionDate = new Date(item.dateInfraction);
    const now = new Date();
    const diffTime = now.getTime() - infractionDate.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return Math.max(0, diffDays);
  }

  calculateMoraValue(item: UserInfractionDto): number {
    const days = this.calculateDaysMora(item);
    const dailyRate = 0.02 / 30; // 2% monthly / 30 days
    return Math.round(item.amountToPay! * dailyRate * days);
  }
}
