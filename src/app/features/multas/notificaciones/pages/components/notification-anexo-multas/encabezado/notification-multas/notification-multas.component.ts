import { Component, OnInit, ChangeDetectorRef, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Subscription } from 'rxjs';

import Swal from 'sweetalert2';
import { CardMultasComponent } from '../../contenido/card-multas/card-multas.component';
import { ServiceGenericService } from '../../../../../../../../core/services/utils/generic/service-generic.service';
import { UserInfractionSelectDto } from '../../../../../../../../shared/modeloModelados/Entities/select/UserInfractionSelectDto';
import { SignalrService } from '../../../../../../../../core/services/realtime/signalr.service';
import { UserInfractionService } from '../../../../../../../../core/services/ModelSecurity/user-infraction.service';
import { DocumentTypeService } from '../../../../../../../../core/services/parameters/document-type.service';
import { DocumentTypeDto } from '../../../../../../../../shared/modeloModelados/parameters/document-type.models';
import { TypeInfraction } from '../../../../../../../../shared/modeloModelados/Entities/TypeInfractionDto';
import { UserInfractionDto } from '../../../../../../../../shared/modeloModelados/Entities/user-infraction';


@Component({
  selector: 'app-notification-multas',
  standalone: true,
  imports: [CommonModule, FormsModule, CardMultasComponent],
  templateUrl: './notification-multas.component.html',
  styleUrls: ['./notification-multas.component.scss']
})
export class NotificationMultasComponent implements OnInit, OnDestroy {

  multas: UserInfractionSelectDto[] = [];
  cargando = false;

  // Filtros
  documentTypeId?: number;
  typeInfractionId?: number;
  stateInfraction?: number;

  // Opciones para dropdowns
  documentTypes: DocumentTypeDto[] = [];
  typeInfractions: TypeInfraction[] = [];
  estados = [
    { label: 'Pendiente', value: 0 },
    { label: 'Pagada', value: 1 },
    { label: 'Vencida', value: 2 },
    { label: 'Con acuerdo', value: 3 }
  ];

  private wsSub?: Subscription;

  constructor(
    private serviceGeneric: ServiceGenericService,
    private signalrService: SignalrService,
    private cdr: ChangeDetectorRef,
    private userInfractionService: UserInfractionService,
    private documentTypeService: DocumentTypeService
  ) {}

  ngOnInit(): void {
    this.cargarOpciones();
    this.cargarMultas();

  // 👇 Suscribirse al evento que lanza el backend cuando aplica descuento
    this.wsSub = this.signalrService.on<UserInfractionSelectDto>('ReceiveDiscount')
      .subscribe((infractionActualizada) => {
        console.log('📩 Multa actualizada con descuento:', infractionActualizada);

        // Reemplazar en la lista la infracción actualizada
        const index = this.multas.findIndex(m => m.id === infractionActualizada.id);
        if (index !== -1) {
          this.multas[index] = infractionActualizada;
        } else {
          this.multas.unshift(infractionActualizada); // si es nueva, agregar
        }

        this.cdr.detectChanges();

        Swal.fire({
          icon: 'info',
          title: 'Descuento aplicado',
          text: `Se actualizó el monto de la multa ${infractionActualizada.id}`,
          timer: 4000,
          showConfirmButton: false
        });
      });
  }

  cargarOpciones(): void {
    // Cargar tipos de documento
    this.documentTypeService.genericService.getAll<DocumentTypeDto>('documentType').subscribe({
      next: (data: DocumentTypeDto[]) => {
        this.documentTypes = data;
        console.log('Document types loaded:', data);
      },
      error: (err: any) => console.error('Error cargando tipos de documento:', err)
    });

    // Cargar tipos de infracción
    this.serviceGeneric.getAll<TypeInfraction>('TypeInfraction').subscribe({
      next: (data: TypeInfraction[]) => {
        this.typeInfractions = data;
        console.log('Type infractions loaded:', data);
      },
      error: (err: any) => console.error('Error cargando tipos de infracción:', err)
    });
  }

  cargarMultas(): void {
    this.cargando = true;

    if (this.documentTypeId || this.typeInfractionId || this.stateInfraction !== undefined) {
      // Usar filtro
      this.userInfractionService.filterMultas(this.documentTypeId, this.typeInfractionId, this.stateInfraction)
        .subscribe({
          next: (data: UserInfractionDto[]) => {
            this.multas = data.map(m => ({
              ...m,
              tipo: m.typeInfractionName || '',
              fecha: m.dateInfraction || '',
              descripcion: m.observations || '',
              estado: this.mapEstadoFromEnum(m.stateInfraction) as any
            }));
            this.cargando = false;
            this.cdr.detectChanges();
            console.log('✅ Multas filtradas:', this.multas);
          },
          error: (err) => {
            this.cargando = false;
            console.error('❌ Error al filtrar multas:', err);
            Swal.fire({
              icon: 'error',
              title: 'Error',
              text: 'No se pudieron cargar las notificaciones de multas.',
              confirmButtonColor: '#d33'
            });
          }
        });
    } else {
      // Cargar todas
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
  }

  aplicarFiltros(): void {
    this.cargarMultas();
  }


  private mapEstadoFromEnum(v: number | null | undefined): 'Pendiente' | 'Pagada' | 'Vencida' | 'Con acuerdo' {
    switch (v) {
      case 0: return 'Pendiente';
      case 1: return 'Pagada';
      case 2: return 'Vencida';
      case 3: return 'Con acuerdo';
      default: return 'Pendiente';
    }
  }

  ngOnDestroy(): void {
    this.wsSub?.unsubscribe();
  }
}
