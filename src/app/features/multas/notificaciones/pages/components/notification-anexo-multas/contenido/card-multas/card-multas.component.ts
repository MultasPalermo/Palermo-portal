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

  get estadoClass(): string {
    return this.multa.stateInfraction === 3 ? 'estado-abierto' : 'estado-pendiente';
  }

  get estadoTexto(): string {
    switch (this.multa.stateInfraction) {
      case 0: return 'PENDIENTE';
      case 1: return 'EN PROCESO';
      case 2: return 'PAGADA';
      case 3: return 'ABIERTA';
      default: return 'DESCONOCIDO';
    }
  }
}
