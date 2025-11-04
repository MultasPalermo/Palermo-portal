import { CommonModule } from '@angular/common';
import { Component, Input } from '@angular/core';
import { PaymentAgreementSelectDto } from '../../../../../../../shared/modeloModelados/Entities/select/PaymentAgreementSelectDto';

@Component({
  selector: 'app-multa-card',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './multa-card.component.html',
  styleUrls: ['./multa-card.component.scss']
})
export class MultaCardComponent {
  @Input() multa!: PaymentAgreementSelectDto;   // 👈 ahora recibe PaymentAgreementSelectDto

  get estadoClass(): string {
    return this.multa.isPaid ? 'estado-abierto' : 'estado-pendiente';
  }

  get estadoTexto(): string {
    return this.multa.isPaid ? 'PAGADO' : 'PENDIENTE';
  }
}