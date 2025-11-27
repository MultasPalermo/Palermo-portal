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

    // Validación base
    if (!this.multaId && !this.agreementId) {
      this.error = 'No se encontró información de pago.';
      return;
    }

    this.loading = true;

    // =========================================================
    // 🔵 1. PAGO DE MULTA
    // =========================================================
    if (this.multaId) {
      this.http.post<{ url: string }>(
        `${environment.apiURL}/payments/infraction/${this.multaId}/checkout`, {}
      )
      .subscribe({
        next: resp => {
          this.paid.emit();
          window.location.href = resp.url;
        },
        error: () => this.error = 'No se pudo iniciar el pago de la multa.'
      })
      .add(() => this.loading = false);

      return;
    }

    // =========================================================
    // 🟡 3. (Opcional) Pago por cuota si el día de mañana regresa
    // =========================================================
    if (this.agreementId && this.cuotaId) {
      this.paymentService.generateAgreementPayment(this.agreementId, this.cuotaId)
        .subscribe({
          next: (resp: any) => {
            if (resp?.url) {
              this.paid.emit();
              window.location.href = resp.url;
            } else {
              this.error = 'No se pudo generar el pago del acuerdo.';
            }
          },
          error: () => this.error = 'No se pudo iniciar el pago del acuerdo.'
        })
        .add(() => this.loading = false);

      return;
    }

 if (this.agreementId && !this.cuotaId) {
    this.error = 'Debe seleccionar una cuota para pagar.';
  }
  }
}
