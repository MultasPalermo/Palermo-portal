import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DialogModule } from 'primeng/dialog';
import { ButtonModule } from 'primeng/button';
import { UserInfractionService } from '../../../core/services/ModelSecurity/user-infraction.service';
import { UserInfractionDto } from '../../../shared/modeloModelados/Entities/user-infraction';
import { GenericCardComponent } from '../../../shared/components/generic-card/generic-card.component';
import { SignalRService } from '../../../core/services/signalr/signalr.service';
import { environment } from '../../../../environments/environment';

@Component({
  selector: 'app-seguimiento',
  imports: [CommonModule, DialogModule, ButtonModule, GenericCardComponent],
  templateUrl: './seguimiento.component.html',
  styleUrl: './seguimiento.component.scss'
})
export class SeguimientoComponent implements OnInit, OnDestroy {
  // Data for each stage
  prejudicialVeryRecent: UserInfractionDto[] = []; // Menos de 3 días completos
  prejudicial0to3: UserInfractionDto[] = [];
  prejudicial3to15: UserInfractionDto[] = [];
  prejudicial15to25: UserInfractionDto[] = [];
  juridico: UserInfractionDto[] = [];
  coactivo: UserInfractionDto[] = [];

  loading = false;
  visible = false;
  selectedItem: UserInfractionDto | null = null;

  constructor(
    private userInfractionService: UserInfractionService,
    private signalRService: SignalRService
  ) {}

  ngOnInit() {
    this.loadData();

    // Suscribirse a actualizaciones en tiempo real via SignalR
    this.signalRService.multaUpdated$.subscribe((update: any) => {
      if (update) {
        console.log('Actualización recibida via SignalR:', update);

        if (update.type === 'statusUpdate') {
          // Actualización de estado específica
          console.log(`Multa ${update.multaId} cambió estado a: ${update.newStatus}`);
        } else if (update.type === 'fullUpdate') {
          // Actualización completa de multa
          console.log('Multa actualizada completamente:', update.data);
        }

        // Recargar datos cuando se detecte cualquier cambio
        this.loadData();
      }
    });
  }

  ngOnDestroy() {
    // SignalR se desconectará automáticamente
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
    // Filtrar multas que tienen acuerdo de pago (stateInfraction = 3)
    data = data.filter(item => item.stateInfraction !== 3);

    // Reset arrays
    this.prejudicialVeryRecent = [];
    this.prejudicial0to3 = [];
    this.prejudicial3to15 = [];
    this.prejudicial15to25 = [];
    this.juridico = [];
    this.coactivo = [];

    const now = new Date();

    data.forEach((item) => {
      // VERIFICAR PRIMERO SI TIENE MORA - Si tiene días de mora, va directo a cobro coactivo
      if (item.daysOfDelay && item.daysOfDelay > 0) {
        console.log(`🚨 Multa ${item.id} tiene mora de ${item.daysOfDelay} días -> va a cobro coactivo`);
        this.coactivo.push(item);
        return;
      }

      // Si no tiene mora, categorizar por estado normal
      const status = String(item.statusCollection).toLowerCase();

      switch (status) {
        case 'cobroprejuridico':
          // Estado inicial: va a la columna "Multas Recientes"
          this.prejudicialVeryRecent.push(item);
          break;
        case 'prejuridico3dias':
          // Después del primer recordatorio: va a "Prejuridico 3 días"
          this.prejudicial0to3.push(item);
          break;
        case 'prejuridico15dias':
          // Después del segundo recordatorio: va a "Prejuridico 15 días"
          this.prejudicial3to15.push(item);
          break;
        case 'prejuridico25dias':
          // Después del tercer recordatorio: va a "Prejuridico 25 días"
          this.prejudicial15to25.push(item);
          break;
        case 'prejuridico30dias':
          // Después del cuarto recordatorio: pasa automáticamente a Jurídico
          this.juridico.push(item);
          break;
        case 'prejuridico40dias':
          // Después del quinto recordatorio: pasa automáticamente a Coactivo
          this.coactivo.push(item);
          break;
        case 'cobrojuridico':
          this.juridico.push(item);
          break;
        case 'cobrocoactivo':
          this.coactivo.push(item);
          break;
        default:
          // Si no tiene estado definido, usar lógica de tiempo como fallback
          this.categorizePrejurídico(item, now);
          break;
      }
    });
  }

  private categorizePrejurídico(item: UserInfractionDto, now: Date) {
    if (!item.paymentDue3Days || !item.paymentDue15Days || !item.paymentDue25Days) {
      // If dates are missing, put in first stage
      this.prejudicialVeryRecent.push(item);
      return;
    }

    const due3Days = new Date(item.paymentDue3Days);
    const due15Days = new Date(item.paymentDue15Days);
    const due25Days = new Date(item.paymentDue25Days);

    // Calcular días transcurridos desde la infracción
    const infractionDate = new Date(item.dateInfraction!);
    const daysSinceInfraction = Math.floor((now.getTime() - infractionDate.getTime()) / (1000 * 60 * 60 * 24));

    if (daysSinceInfraction < 2) {
      // Menos de 2 días: muy reciente
      this.prejudicialVeryRecent.push(item);
    } else if (now <= due3Days) {
      // Entre 2-3 días: período normal de 3 días
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

  openModal(item: UserInfractionDto) {
    this.selectedItem = item;
    this.visible = true;
  }

  closeModal() {
    this.visible = false;
    this.selectedItem = null;
  }

  downloadPdf() {
    if (!this.selectedItem?.id) {
      console.error('❌ No hay multa seleccionada para descargar PDF');
      return;
    }

    // Debug: mostrar información completa de la multa seleccionada
    console.log('📄 Intentando descargar PDF para multa:', {
      id: this.selectedItem.id,
      statusCollection: this.selectedItem.statusCollection,
      firstName: this.selectedItem.firstName,
      lastName: this.selectedItem.lastName,
      typeInfractionName: this.selectedItem.typeInfractionName
    });

    // Determinar qué PDF descargar basado en el estado actual de la multa
    const status = String(this.selectedItem.statusCollection).toLowerCase();
    const multaId = this.selectedItem.id;

    console.log(`🎯 Estado detectado: "${status}" para multa ID: ${multaId}`);

    let downloadObservable;
    let fileName: string;
    let endpointUrl: string;

    switch (status) {
      case 'cobroprejuridico':
        // Estado inicial: descargar PDF de contrato
        downloadObservable = this.userInfractionService.downloadContractPdf(multaId);
        endpointUrl = `${environment.apiURL}/UserInfraction/${multaId}/pdf`;
        fileName = `Contrato_${this.selectedItem.firstName || 'Multa'}_${multaId}.pdf`;
        console.log(`📋 Descargando PDF de contrato: ${endpointUrl}`);
        break;

      case 'prejuridico3dias':
        // Después del primer recordatorio: PDF de recordatorio 3 días
        downloadObservable = this.userInfractionService.downloadReminder3DaysPdf(multaId);
        endpointUrl = `${environment.apiURL}/UserInfraction/${multaId}/pdf/3dias`;
        fileName = `Recordatorio_3dias_${multaId}.pdf`;
        console.log(`📋 Descargando PDF de 3 días: ${endpointUrl}`);
        break;

      case 'prejuridico15dias':
        // Después del segundo recordatorio: PDF de recordatorio 15 días
        downloadObservable = this.userInfractionService.downloadReminder15DaysPdf(multaId);
        endpointUrl = `${environment.apiURL}/UserInfraction/${multaId}/pdf/15dias`;
        fileName = `Recordatorio_15dias_${multaId}.pdf`;
        console.log(`📋 Descargando PDF de 15 días: ${endpointUrl}`);
        break;

      case 'prejuridico25dias':
        // Después del tercer recordatorio: PDF de recordatorio 25 días
        downloadObservable = this.userInfractionService.downloadReminder25DaysPdf(multaId);
        endpointUrl = `${environment.apiURL}/UserInfraction/${multaId}/pdf/25dias`;
        fileName = `Recordatorio_25dias_${multaId}.pdf`;
        console.log(`📋 Descargando PDF de 25 días: ${endpointUrl}`);
        break;

      case 'prejuridico30dias':
        // Después del cuarto recordatorio: PDF de cobro jurídico (30 días)
        downloadObservable = this.userInfractionService.downloadReminder30DaysPdf(multaId);
        endpointUrl = `${environment.apiURL}/UserInfraction/${multaId}/pdf/cobroJuridico`;
        fileName = `CobroJuridico_${multaId}.pdf`;
        console.log(`📋 Descargando PDF jurídico: ${endpointUrl}`);
        break;

      case 'prejuridico40dias':
        // Después del quinto recordatorio: usar PDF de 25 días como fallback
        downloadObservable = this.userInfractionService.downloadReminder25DaysPdf(multaId);
        endpointUrl = `${environment.apiURL}/UserInfraction/${multaId}/pdf/25dias`;
        fileName = `Recordatorio_40dias_${multaId}.pdf`;
        console.log(`📋 Descargando PDF fallback 40 días: ${endpointUrl}`);
        break;

      case 'cobrojuridico':
        // Estado jurídico: PDF específico de cobro jurídico
        downloadObservable = this.userInfractionService.downloadReminder30DaysPdf(multaId);
        endpointUrl = `${environment.apiURL}/UserInfraction/${multaId}/pdf/cobroJuridico`;
        fileName = `CobroJuridico_${multaId}.pdf`;
        console.log(`📋 Descargando PDF jurídico: ${endpointUrl}`);
        break;

      case 'cobrocoactivo':
        // Estado coactivo: podría tener un PDF específico
        downloadObservable = this.userInfractionService.downloadReminder25DaysPdf(multaId);
        endpointUrl = `${environment.apiURL}/UserInfraction/${multaId}/pdf/25dias`;
        fileName = `Notificacion_Coactiva_${multaId}.pdf`;
        console.log(`📋 Descargando PDF coactivo: ${endpointUrl}`);
        break;

      default:
        // Fallback: usar el PDF de recordatorio 25 días
        console.warn(`⚠️ Estado desconocido "${status}", usando PDF por defecto`);
        downloadObservable = this.userInfractionService.downloadReminder25DaysPdf(multaId);
        endpointUrl = `${environment.apiURL}/UserInfraction/${multaId}/pdf/25dias`;
        fileName = `Notificacion_${multaId}.pdf`;
        break;
    }

    console.log(`🔗 Endpoint final: ${endpointUrl}`);
    console.log(`📁 Nombre del archivo: ${fileName}`);

    downloadObservable.subscribe({
      next: (blob: Blob) => {
        console.log(`✅ PDF descargado exitosamente: ${fileName} (Estado: ${status})`);
        console.log(`📊 Tamaño del blob: ${blob.size} bytes`);

        // Crear enlace de descarga
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = fileName;
        document.body.appendChild(link);
        link.click();

        // Limpiar
        document.body.removeChild(link);
        window.URL.revokeObjectURL(url);
      },
      error: (error: any) => {
        console.error('❌ Error descargando PDF:', error);
        console.error('🔍 Detalles del error:', {
          status: error.status,
          statusText: error.statusText,
          url: error.url,
          message: error.message
        });

        // Mostrar alerta al usuario
        alert(`Error al descargar el PDF. Estado: ${status}, ID: ${multaId}\n\nDetalles: ${error.status} - ${error.statusText}`);
      }
    });
  }

  getStatusString(status: any): string {
    return String(status).toLowerCase();
  }

  getStatusColor(status: any): string {
    const statusStr = String(status).toLowerCase();
    switch (statusStr) {
      case 'cobroprejuridico':
        return 'bg-green-100 text-green-800';
      case 'prejuridico3dias':
        return 'bg-yellow-100 text-yellow-800';
      case 'prejuridico15dias':
        return 'bg-orange-100 text-orange-800';
      case 'prejuridico25dias':
        return 'bg-red-100 text-red-800';
      case 'prejuridico30dias':
        return 'bg-blue-100 text-blue-800'; // Pasa a Jurídico
      case 'prejuridico40dias':
        return 'bg-indigo-100 text-indigo-800'; // Pasa a Coactivo
      case 'cobrojuridico':
        return 'bg-blue-100 text-blue-800';
      case 'cobrocoactivo':
        return 'bg-indigo-100 text-indigo-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  }
}
