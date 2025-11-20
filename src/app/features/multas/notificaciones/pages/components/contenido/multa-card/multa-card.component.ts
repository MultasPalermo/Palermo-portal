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
    if (this.multa.isPaid) return 'estado-pagado';
    if (this.multa.isCoactive) return 'estado-coactivo';
    return 'estado-pendiente';
  }

  get estadoTexto(): string {
    if (this.multa.isPaid) return 'PAGADO';
    if (this.multa.isCoactive) return 'COACTIVO';
    return 'PENDIENTE';
  }
}