import { Component, Input, Output, EventEmitter } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../../environments/environment';
import { CommonModule } from '@angular/common';
import { PaymentService } from '../../../core/services/payments/payment.service';

@Component({
  standalone: true,
  selector: 'app-button-pay',
  imports: [CommonModule],
  templateUrl: './button-pay.component.html',
  styleUrls: ['./button-pay.component.scss']
})
export class ButtonPayComponent {

  @Input() multaId?: number;
  @Input() agreementId?: number;
  @Input() cuotaId?: number;

  @Output() paid = new EventEmitter<void>();

  loading = false;
  error: string | null = null;

  constructor(
    private http: HttpClient,
    private paymentService: PaymentService
  ) {}

  pay() {
  this.error = null;

  if (!this.multaId && !this.agreementId) {
    this.error = 'No se encontró información de pago.';
    return;
  }

  this.loading = true;

  const navigateTo = (url?: string) => {
    if (!url) {
      this.error = 'URL de pago inválida.';
      this.loading = false;
      return;
    }
    console.log('Navegando a:', url);
    try {
      // Preferimos location.assign (más explícito)
      window.location.assign(url);
    } catch (e) {
      console.warn('location.assign falló, intentando window.open', e);
      window.open(url, '_self');
    }
  };

  // PAGO DE MULTA
  if (this.multaId) {
    this.http.post<any>(
      `${environment.apiURL}/payments/infraction/${this.multaId}/checkout`, {}
    ).subscribe({
      next: resp => {
        console.log('Resp checkout infraction:', resp);
        // Intentamos varios nombres posibles por si el backend cambia
        const url = resp?.initPoint ?? resp?.init_point ?? resp?.url ?? resp?.InitPoint;
        if (!url) {
          this.error = 'No se recibió initPoint del servidor.';
        } else {
          this.paid.emit();
          navigateTo(url);
        }
      },
      error: (err) => {
        console.error('Error al iniciar pago de multa:', err);
        this.error = 'No se pudo iniciar el pago de la multa.';
      },
      complete: () => this.loading = false
    });
    return;
  }

  // PAGO DE CUOTA (acuerdo)
  if (this.agreementId && this.cuotaId) {
    this.paymentService.generateAgreementPayment(this.agreementId, this.cuotaId)
      .subscribe({
        next: (resp: any) => {
          console.log('Resp checkout agreement:', resp);
          const url = resp?.initPoint ?? resp?.init_point ?? resp?.url ?? resp?.InitPoint;
          if (!url) {
            this.error = 'No se recibió initPoint del servidor (acuerdo).';
          } else {
            this.paid.emit();
            navigateTo(url);
          }
        },
        error: (err) => {
          console.error('Error al iniciar pago de acuerdo:', err);
          this.error = 'No se pudo iniciar el pago del acuerdo.';
        },
        complete: () => this.loading = false
      });
    return;
  }

  if (this.agreementId && !this.cuotaId) {
    this.error = 'Debe seleccionar una cuota para pagar.';
    this.loading = false;
  }
}
}
