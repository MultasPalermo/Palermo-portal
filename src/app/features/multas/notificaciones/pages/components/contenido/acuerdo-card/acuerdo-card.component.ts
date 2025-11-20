import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PaymentAgreementSelectDto } from '../../../../../../../shared/modeloModelados/Entities/select/PaymentAgreementSelectDto';
import { ButtonPayComponent } from '../../../../../../../shared/components/button-pay/button-pay.component';

@Component({
  selector: 'app-acuerdo-card',
  standalone: true,
  imports: [CommonModule, ButtonPayComponent],
  templateUrl: './acuerdo-card.component.html',
  styleUrls: ['./acuerdo-card.component.scss']
})
export class AcuerdoCardComponent {
  @Input() acuerdo!: PaymentAgreementSelectDto;
  @Output() cardClick = new EventEmitter<PaymentAgreementSelectDto>();

  get estadoTexto(): string {
    if (this.acuerdo.isPaid) return 'Pagado';
    if (this.acuerdo.isCoactive) return 'En cobro coactivo';
    return 'Activo';
  }

  get estadoClass(): string {
    if (this.acuerdo.isPaid) return 'success';
    if (this.acuerdo.isCoactive) return 'danger';
    return 'info';
  }

  onCardClick() {
    this.cardClick.emit(this.acuerdo);
  }
}