import { Component, ViewChildren, QueryList, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';

import { MatExpansionModule, MatAccordion } from '@angular/material/expansion';
import { MatIconModule } from '@angular/material/icon';
import { Identificacion } from '../identificacion/identificacion.component';
import { StepCardComponent } from '../../../../shared/components/step-card/step-card.component';
import { ServiceGenericService } from '../../../../core/services/utils/generic/service-generic.service';
import { StepCard } from '../../../../shared/modeloModelados/util/StepCard';
import { MultasModalComponent } from '../Modal/multas-modal.component';


// ⬇️ usa tu servicio genérico

interface SubItem { title: string; text: string; }
interface Category { title: string; items: SubItem[]; }

@Component({
  selector: 'app-inicio',
  standalone: true,
  imports: [CommonModule, MatExpansionModule, MatIconModule, Identificacion, StepCardComponent, MultasModalComponent],
  templateUrl: './inicio.component.html',
  styleUrls: ['./inicio.component.scss'],
})
export class InicioComponent implements OnInit {
  constructor(
    private router: Router,
    private api: ServiceGenericService   // ⬅️ tu servicio genérico
  ) {}

  @ViewChildren('subAcc') subAccordions!: QueryList<MatAccordion>;

  // estado UI
  loadingTypes = false;
  loadError = '';

  // datos renderizados
  categories: Category[] = [];

  // modal de multas
  modalVisible = false;
  multas: any[] = [];
  ciudadano = '';

  steps: StepCard[] = [
    { number: '01', icon: 'edit_note', title: 'Ingresa tus datos', description: 'Completa el formulario con tu tipo y número de documento' },
    { number: '02', icon: 'search', title: 'Consulta instantánea', description: 'Nuestro sistema busca todas tus infracciones en tiempo real' },
    { number: '03', icon: 'assignment', title: 'Revisa los detalles', description: 'Ve fecha, lugar, valor y estado de cada multa' },
  ];

  ngOnInit(): void {
    this.loadTypeInfractions();
  }

  private loadTypeInfractions(): void {
  this.loadingTypes = true;
  this.loadError = '';

  // Cargar tipos de infracción
  this.api.getAll<any>('TypeInfraction').subscribe({
    next: (types) => {
      // Cargar todas las infracciones
      this.api.getAll<any>('Infraction').subscribe({
        next: (infractions) => {
          this.loadingTypes = false;

          // Agrupar infracciones por tipo
          this.categories = types.map((type: any) => {
            const typeInfractions = infractions.filter((inf: any) =>
              inf.typeInfractionName === type.name
            );

            return {
              title: type.typeInfractionName || type.name,
              items: typeInfractions.map((inf: any) => ({
                title: inf.description.length > 50
                  ? inf.description.substring(0, 50) + '...'
                  : inf.description,
                text: `Valor SMLDV: ${inf.numer_smldv} - ${inf.description}`
              }))
            };
          }).filter(cat => cat.items.length > 0); // Solo mostrar tipos que tienen infracciones
        },
        error: (err) => {
          this.loadingTypes = false;
          if (err.status === 0) {
            this.loadError = 'El servidor no está disponible en este momento. Intenta más tarde.';
          } else {
            this.loadError = err?.error?.message || 'No fue posible cargar las infracciones.';
          }
        }
      });
    },
    error: (err) => {
      this.loadingTypes = false;
      if (err.status === 0) {
        this.loadError = 'El servidor no está disponible en este momento. Intenta más tarde.';
      } else {
        this.loadError = err?.error?.message || 'No fue posible cargar los tipos de infracción.';
      }
    }
  });
}


  onParentOpened(index: number): void {
    const arr = this.subAccordions?.toArray() ?? [];
    arr.forEach(acc => acc.closeAll());
    arr[index]?.closeAll();
  }

  onLogin(e?: Event): void {
    e?.preventDefault();
    this.router.navigate(['/auth/login']);
  }

  onMultasConsultadas(multas: any[], ciudadano: string): void {
    this.multas = multas;
    this.ciudadano = ciudadano;
    this.modalVisible = true;
  }

  onModalClose(): void {
    this.modalVisible = false;
    this.multas = [];
    this.ciudadano = '';
  }
}
