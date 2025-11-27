import { CommonModule } from '@angular/common';
import { Component, Input } from '@angular/core';
import { UserInfractionSelectDto } from '../../../../../../../../shared/modeloModelados/Entities/select/UserInfractionSelectDto';

@Component({
  selector: 'app-card-multas',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './card-multas.component.html',
  styleUrls: ['./card-multas.component.scss']
})
export class CardMultasComponent {
  @Input() multa!: UserInfractionSelectDto;

  /** 🔥 CLASE CSS SEGÚN EL ESTADO */
  get estadoClass(): string {
    switch (this.multa.stateInfraction) {
      case 0: return 'estado-pendiente';
      case 1: return 'estado-proceso';
      case 2: return 'estado-pagada';
      case 3: return 'estado-acuerdo';
      default: return 'estado-desconocido';
    }
  }

  /** 🔥 TEXTO QUE SE MOSTRARÁ */
  get estadoTexto(): string {
    switch (this.multa.stateInfraction) {
      case 0: return 'PENDIENTE';
      case 1: return 'EN PROCESO';
      case 2: return 'PAGADA';
      case 3: return 'CON ACUERDO';
      default: return 'DESCONOCIDO';
    }
  }
}
