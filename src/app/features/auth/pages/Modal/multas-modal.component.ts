import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DialogModule } from 'primeng/dialog';
import { ButtonModule } from 'primeng/button';
import { CardModule } from 'primeng/card';
import { ChipModule } from 'primeng/chip';
import { TabViewModule } from 'primeng/tabview';
import { PaymentService } from '../../../../core/services/payments/payment.service';
import { ServiceGenericService } from '../../../../core/services/utils/generic/service-generic.service';
import Swal from 'sweetalert2';

import { InputNumberModule } from 'primeng/inputnumber';
import { FormsModule } from '@angular/forms';


import { PaymentAgreementSelectDto } from '../../../../shared/modeloModelados/Entities/select/PaymentAgreementSelectDto';
import { AcuerdoCardComponent } from '../../../multas/notificaciones/pages/components/contenido/acuerdo-card/acuerdo-card.component';
import { ButtonPayComponent } from '../../../../shared/components/button-pay/button-pay.component';

interface MultaTableRow {
  id?: number;
  tipo: string;
  fecha: string;
  descripcion: string;
  estado: 'Pendiente' | 'Pagada' | 'Vencida' | 'Con acuerdo';
  pdfUrl?: string;
  documentNumber?: string;
}

@Component({
  selector: 'app-multas-modal',
  standalone: true,
  imports: [CommonModule, DialogModule, ButtonModule, CardModule, ChipModule, TabViewModule, ButtonPayComponent, AcuerdoCardComponent, InputNumberModule, FormsModule ],
  templateUrl: './multas-modal.component.html',
  styleUrls: ['./multas-modal.component.scss']
})
export class MultasModalComponent {
  @Input() visible = false;
  @Input() multas: MultaTableRow[] = [];
  @Input() acuerdosPago: PaymentAgreementSelectDto[] = [];
  @Input() ciudadano = '';
  @Input() multaId!: number;
  @Output() paid = new EventEmitter<void>();
  @Output() visibleChange = new EventEmitter<boolean>();

    modalCuotasVisible = false;
  cuotasMaximas = 1;
  cuotasSeleccionadas: number | null = null;
  acuerdoActual: any = null;

  constructor(
    private paymentService: PaymentService,
    private serviceGeneric: ServiceGenericService
  ) {}

  onClose() {
    this.visible = false;
    this.visibleChange.emit(false);
  }
  emitPaid() {
  this.paid.emit();
}

recargarAcuerdos() {
  this.serviceGeneric.getAll<any>('PaymentAgreement').subscribe({
    next: (resp: any) => {
      const respArray = Array.isArray(resp) ? resp : [];

      this.acuerdosPago = respArray.map((acuerdo: any) => {
        // El backend retorna installmentSchedule (minúscula) con el array de cuotas
        const cuotasArray = Array.isArray(acuerdo.installmentSchedule)
          ? acuerdo.installmentSchedule
          : [];

        return {
          ...acuerdo,
          cuotas: cuotasArray.map((c: any) => ({
            id: c.id,
            numero: c.number,
            monto: c.amount,
            fechaPago: c.paymentDate,
            pagada: c.isPaid
          }))
        };
      });

      console.log("✅ Acuerdos cargados:", this.acuerdosPago);
    },
    error: (err) => {
      console.error("❌ Error al cargar acuerdos:", err);
      this.showErrorAlert('No se pudieron cargar los acuerdos de pago.');
    }
  });
}

getCuotas(acuerdo: any) {
  if (!acuerdo || !acuerdo.cuotas) {
    return [];
  }

  return Array.isArray(acuerdo.cuotas) ? acuerdo.cuotas : [];
}

abrirSelectorCuotas(acuerdo: any) {
  console.log("=== ABRIENDO SELECTOR DE CUOTAS ===");
  console.log("Acuerdo completo:", acuerdo);
  console.log("Acuerdo ID:", acuerdo.id);
  console.log("Acuerdo.installments (total):", acuerdo.installments);

  this.acuerdoActual = acuerdo;

  // Usar el número total de cuotas del acuerdo (no las cuotas guardadas)
  const totalCuotas = acuerdo.installments || 0;

  if (!totalCuotas || totalCuotas <= 0) {
    this.showErrorAlert(`Este acuerdo no tiene cuotas configuradas.`);
    return;
  }

  // El usuario puede pagar de 1 hasta el total de cuotas del acuerdo
  this.cuotasMaximas = totalCuotas;
  this.cuotasSeleccionadas = 1;
  this.modalCuotasVisible = true;
  console.log("✅ Modal abierto. Cuotas disponibles:", totalCuotas);
}

confirmarPagoCuotas() {
  if (!this.cuotasSeleccionadas || this.cuotasSeleccionadas <= 0) {
    this.showErrorAlert("Por favor, selecciona al menos 1 cuota para pagar.");
    return;
  }

  if (!this.acuerdoActual) {
    this.showErrorAlert("Error: No se encontró el acuerdo de pago.");
    return;
  }

  console.log("Procesando pago de cuotas:");
  console.log("- Acuerdo ID:", this.acuerdoActual.id);
  console.log("- Cantidad de cuotas a pagar:", this.cuotasSeleccionadas);

  // Enviar la cantidad de cuotas como cuotaId al endpoint
  // El backend lo interpretará como "cantidad de cuotas a pagar"
  this.paymentService.generateAgreementPayment(
    this.acuerdoActual.id,
    this.cuotasSeleccionadas  // Enviar la cantidad seleccionada
  ).subscribe({
    next: (resp) => {
      this.modalCuotasVisible = false;

      if (resp.url) {
        console.log("Redirigiendo a MercadoPago:", resp.url);
        window.location.href = resp.url;
      } else {
        this.showErrorAlert("Error: No se recibió la URL de pago.");
      }
    },
    error: (err) => {
      console.error("Error al procesar el pago:", err);
      this.modalCuotasVisible = false;
      this.showErrorAlert(`Error al procesar el pago: ${err.error?.message || err.message || 'Error desconocido'}`);
    }
  });
}





pagarCuota(acuerdoId: number, cuotaId: number) {
  this.paymentService.generateAgreementPayment(acuerdoId, cuotaId)
    .subscribe({
      next: (resp) => {

        // Manejo si debe abrir checkout del backend
        if (resp.url) {
          window.location.href = resp.url;  // redirigir al checkout
        }

        this.recargarAcuerdos();
      },
      error: () => {
        this.showErrorAlert('Error al procesar el pago de la cuota');
      }
    });
}









  recargarMultas() {
  this.serviceGeneric.getAll<any>('UserInfraction').subscribe({
    next: (resp: any[]) => {
      this.multas = resp.map(m => ({
        id: m.id,
        tipo: m.typeInfractionName,
        fecha: m.dateInfraction,
        descripcion: m.observations,
        estado: this.mapEstado(m.stateInfraction),
        pdfUrl: m.pdfUrl,
        documentNumber: m.documentNumber
      }));
    },
    error: () => {
      this.showErrorAlert('No se pudo actualizar el estado de las multas.');
    }
  });
}

mapEstado(value: number): 'Pendiente' | 'Pagada' | 'Con acuerdo' | 'Vencida' {
  switch (value) {
    case 0: return 'Pendiente';
    case 1: return 'Pagada';
    case 2: return 'Con acuerdo';
    default: return 'Pendiente';
  }
}



  onMultaClick(multa: MultaTableRow) {
    console.log('Clic en multa:', multa);
    if (multa.estado === 'Pendiente') {
      this.downloadMultaPdf(multa);
    } else if (multa.estado === 'Con acuerdo') {
      this.downloadAcuerdoPdf(multa);
    }
  }

  onAcuerdoClick(acuerdo: PaymentAgreementSelectDto) {
    console.log('Clic en acuerdo:', acuerdo);
    this.downloadAcuerdoPdfById(acuerdo);
  }

  private downloadMultaPdf(multa: MultaTableRow) {
    console.log('Descargando PDF de multa pendiente:', multa);
    if (!multa.id) return;

    // Usar el servicio genérico para descargar PDF de multa
    this.serviceGeneric.downloadPdf('UserInfraction', multa.id).subscribe({
      next: (blob: any) => {
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `Multa_${multa.id}.pdf`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        window.URL.revokeObjectURL(url);
      },
      error: (err: any) => {
        console.error('Error descargando PDF de multa:', err);
        this.showErrorAlert('Error al descargar el PDF de la multa');
      }
    });
  }

  private downloadAcuerdoPdf(multa: MultaTableRow) {
    if (!multa.id) return;

    console.log('Buscando acuerdo de pago para multa ID:', multa.id);

    // Buscar el acuerdo de pago para esta multa
    this.serviceGeneric.getAll<any>('PaymentAgreement').subscribe({
      next: (acuerdos: any[]) => {
        console.log('Acuerdos encontrados:', acuerdos);

        // Buscar por userInfractionId primero
        let acuerdo = acuerdos.find((a: any) => a.userInfractionId === multa.id);

        // Si no se encuentra por userInfractionId, buscar por documento y descripción
        // pero ordenar por fecha más reciente para obtener el último acuerdo
        if (!acuerdo) {
          console.log('No encontrado por userInfractionId, buscando por documento y descripción...');

          // Filtrar acuerdos que coincidan con documento y descripción
          const acuerdosCoincidentes = acuerdos.filter((a: any) =>
            a.documentNumber === multa.documentNumber &&
            a.infringement === multa.descripcion
          );

          console.log('Acuerdos coincidentes encontrados:', acuerdosCoincidentes.length);

          // Mostrar acuerdos coincidentes para debug
          acuerdosCoincidentes.forEach((a, index) => {
            console.log(`Acuerdo coincidente ${index}:`, {
              id: a.id,
              agreementStart: a.agreementStart,
              installments: a.installments,
              baseAmount: a.baseAmount
            });
          });

          if (acuerdosCoincidentes.length > 0) {
            // Si hay múltiples acuerdos, tomar el más reciente (por fecha de inicio)
            acuerdo = acuerdosCoincidentes.sort((a, b) =>
              new Date(b.agreementStart).getTime() - new Date(a.agreementStart).getTime()
            )[0];

            console.log('Seleccionando acuerdo más reciente:', acuerdo.id);
          }
        }

        console.log('Acuerdo encontrado:', acuerdo);

        if (acuerdo && acuerdo.id) {
          // Usar el servicio de pagos para descargar PDF de acuerdo
          this.paymentService.downloadPaymentAgreementPdf(acuerdo.id).subscribe({
            next: (blob: any) => {
              const url = window.URL.createObjectURL(blob);
              const link = document.createElement('a');
              link.href = url;
              link.download = `AcuerdoPago_${acuerdo.id}.pdf`;
              document.body.appendChild(link);
              link.click();
              document.body.removeChild(link);
              window.URL.revokeObjectURL(url);
            },
            error: (err: any) => {
              console.error('Error descargando PDF de acuerdo:', err);
              this.showErrorAlert('Error al descargar el PDF del acuerdo de pago');
            }
          });
        } else {
          console.log('No se encontró acuerdo válido para la multa');
          this.showErrorAlert('No se encontró el acuerdo de pago para esta multa');
        }
      },
      error: (err: any) => {
        console.error('Error buscando acuerdo de pago:', err);
        this.showErrorAlert('Error al buscar el acuerdo de pago');
      }
    });
  }

  private downloadAcuerdoPdfById(acuerdo: PaymentAgreementSelectDto) {
    if (!acuerdo.id) return;

    console.log('Descargando PDF de acuerdo de pago ID:', acuerdo.id);

    // Usar el servicio de pagos para descargar PDF de acuerdo directamente por ID
    this.paymentService.downloadPaymentAgreementPdf(acuerdo.id).subscribe({
      next: (blob: any) => {
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `AcuerdoPago_${acuerdo.id}.pdf`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        window.URL.revokeObjectURL(url);
      },
      error: (err: any) => {
        console.error('Error descargando PDF de acuerdo:', err);
        this.showErrorAlert('Error al descargar el PDF del acuerdo de pago');
      }
    });
  }

  private showErrorAlert(message: string) {
    // Usar setTimeout para asegurar que se muestre encima del modal
    setTimeout(() => {
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: message,
        confirmButtonText: 'Entendido'
      });
    }, 100);
  }

  getEstadoSeverity(estado: string): 'success' | 'info' | 'warning' | 'danger' {
    switch (estado) {
      case 'Pagada': return 'success';
      case 'Pendiente': return 'warning';
      case 'Vencida': return 'danger';
      case 'Con acuerdo': return 'info';
      default: return 'info';
    }
  }

  trackByFn(index: number, item: MultaTableRow): any {
    return item.id || index;
  }

  trackByAcuerdoFn(index: number, item: PaymentAgreementSelectDto): any {
    return item.id || index;
  }

  maskCitizenName(name: string): string {
    if (!name) return '';

    // Dividir el nombre completo en partes
    const parts = name.trim().split(' ');

    // Si solo hay una parte (solo nombre o apellido)
    if (parts.length === 1) {
      const part = parts[0];
      if (part.length <= 2) return part;
      return part.charAt(0) + '*'.repeat(part.length - 2) + part.charAt(part.length - 1);
    }

    // Si hay múltiples partes, enmascarar todas menos la primera letra de cada una
    return parts.map(part => {
      if (part.length <= 2) return part;
      return part.charAt(0) + '*'.repeat(part.length - 2) + part.charAt(part.length - 1);
    }).join(' ');
  }
}
