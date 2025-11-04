import { Component, OnInit, ChangeDetectorRef, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Subscription } from 'rxjs';

import Swal from 'sweetalert2';
import { CardMultasComponent } from '../../contenido/card-multas/card-multas.component';
import { ServiceGenericService } from '../../../../../../../../core/services/utils/generic/service-generic.service';
import { UserInfractionSelectDto } from '../../../../../../../../shared/modeloModelados/Entities/select/UserInfractionSelectDto';

@Component({
  selector: 'app-notification-multas',
  standalone: true,
  imports: [CommonModule, CardMultasComponent],
  templateUrl: './notification-multas.component.html',
  styleUrls: ['./notification-multas.component.scss']
})
export class NotificationMultasComponent implements OnInit, OnDestroy {

  multas: UserInfractionSelectDto[] = [];
  cargando = false;

  private wsSub?: Subscription;

  constructor(
    private serviceGeneric: ServiceGenericService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.cargarMultas();

    // 👇 Suscribirse al evento que lanza el backend cuando aplica descuento
    // SignalR functionality commented out due to missing service
    // this.wsSub = this.signalrService.on<UserInfractionSelectDto>('ReceiveDiscount')
    //   .subscribe((infractionActualizada: any) => {
    //     console.log('📩 Multa actualizada con descuento:', infractionActualizada);

    //     // Reemplazar en la lista la infracción actualizada
    //     const index = this.multas.findIndex(m => m.id === infractionActualizada.id);
    //     if (index !== -1) {
    //       this.multas[index] = infractionActualizada;
    //     } else {
    //       this.multas.unshift(infractionActualizada); // si es nueva, agregar
    //     }

    //     this.cdr.detectChanges();

    //     Swal.fire({
    //       icon: 'info',
    //       title: 'Descuento aplicado',
    //       text: `Se actualizó el monto de la multa de ${infractionActualizada.firstName} ${infractionActualizada.lastName}`,
    //       timer: 4000,
    //       showConfirmButton: false
    //     });
    //   });
  }

  cargarMultas(): void {
    this.cargando = true;

    this.serviceGeneric.getAll<UserInfractionSelectDto>('UserInfraction')
      .subscribe({
        next: (data) => {
          this.multas = data;
          this.cargando = false;
          this.cdr.detectChanges();
          console.log('✅ Multas cargadas:', this.multas);
        },
        error: (err) => {
          this.cargando = false;
          console.error('❌ Error al cargar multas:', err);
          Swal.fire({
            icon: 'error',
            title: 'Error',
            text: 'No se pudieron cargar las notificaciones de multas.',
            confirmButtonColor: '#d33'
          });
        }
      });
  }

  ngOnDestroy(): void {
    this.wsSub?.unsubscribe();
  }
}
