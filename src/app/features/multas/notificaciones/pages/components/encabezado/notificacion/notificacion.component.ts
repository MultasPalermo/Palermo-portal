import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MultaCardComponent } from '../../contenido/multa-card/multa-card.component';
import Swal from 'sweetalert2';
import { ServiceGenericService } from '../../../../../../../core/services/utils/generic/service-generic.service';
import { PaymentAgreementSelectDto } from '../../../../../../../shared/modeloModelados/Entities/select/PaymentAgreementSelectDto';
import { PaymentService } from '../../../../../../../core/services/payments/payment.service';

@Component({
  selector: 'app-notificacion',
  standalone: true,
  imports: [CommonModule, FormsModule, MultaCardComponent],
  templateUrl: './notificacion.component.html',
  styleUrls: ['./notificacion.component.scss']
})
export class NotificacionComponent implements OnInit {

  agreements: PaymentAgreementSelectDto[] = [];   // 👈 ahora es PaymentAgreementSelectDto[]

  cargando: boolean = false;

  // Filtros de acuerdos
  phoneNumber: string = '';
  address: string = '';
  neighborhood: string = '';
  email: string = '';

  constructor(
    private serviceGeneric: ServiceGenericService,
    private cdr: ChangeDetectorRef,
    private paymentService: PaymentService
  ) {}

  ngOnInit(): void {
    this.cargarAgreements();
  }

  cargarAgreements(): void {
    this.cargando = true;

    if (this.phoneNumber || this.address || this.neighborhood || this.email) {
      // Usar filtro
      this.paymentService.getFiltered(
        this.phoneNumber || undefined,
        this.address || undefined,
        this.neighborhood || undefined,
        this.email || undefined
      ).subscribe({
        next: (data: PaymentAgreementSelectDto[]) => {
          this.agreements = data;
          this.cargando = false;
          this.cdr.detectChanges();
          console.log('✅ Acuerdos filtrados:', this.agreements);
        },
        error: (err: any) => {
          this.cargando = false;
          console.error('❌ Error al filtrar acuerdos:', err);
          Swal.fire({
            icon: 'error',
            title: 'Error',
            text: 'No se pudieron cargar las notificaciones de acuerdos de pago.',
            confirmButtonColor: '#d33'
          });
        }
      });
    } else {
      // Cargar todos
      this.serviceGeneric.getAll<PaymentAgreementSelectDto>('PaymentAgreement')
        .subscribe({
          next: (data) => {
            this.agreements = data;
            this.cargando = false;
            this.cdr.detectChanges();
            console.log('✅ Acuerdos cargados:', this.agreements);
          },
          error: (err) => {
            this.cargando = false;
            console.error('❌ Error al cargar acuerdos:', err);
            Swal.fire({
              icon: 'error',
              title: 'Error',
              text: 'No se pudieron cargar las notificaciones de acuerdos de pago.',
              confirmButtonColor: '#d33'
            });
          }
        });
    }
  }

  aplicarFiltros(): void {
    this.cargarAgreements();
  }
}