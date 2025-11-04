import { Component } from '@angular/core';
import { CommonModule } from '@angular/common'; // 👈 IMPORTANTE para *ngFor y *ngIf
import { Router } from '@angular/router';

@Component({
  selector: 'app-calendar',
  standalone: true,
  imports: [CommonModule], // 👈 NECESARIO para usar *ngFor
  templateUrl: './calendar.component.html',
  styleUrls: ['./calendar.component.css']
})
export class CalendarComponent {
  multas = [
    {
      tipo: 'Multa Tipo Uno',
      descripcion: 'Consumir bebidas alcohólicas o sustancias psicoactivas en lugares públicos.'
    },
    {
      tipo: 'Multa Tipo Dos',
      descripcion: 'Perturbar la tranquilidad con ruido excesivo.'
    },
    {
      tipo: 'Multa Tipo Tres',
      descripcion: 'Portar armas, elementos cortopunzantes o sustancias peligrosas sin permiso.'
    },
    {
      tipo: 'Multa Tipo Cuatro',
      descripcion: 'Poner en peligro la vida de otros, amenazas o incendios provocados.'
    }
  ];

  showBigCalendar = false;
  selectedYear = new Date().getFullYear();
  months = [
    'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
    'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
  ];

  constructor(private router: Router) {}

  getDaysInMonth(month: number, year: number): number {
    return new Date(year, month + 1, 0).getDate();
  }

  onMultaClick(index: number) {
    const multa = this.multas[index];
    this.router.navigate(['/calendar-detail'], { state: { multa } });
  }

  closeBigCalendar() {
    this.showBigCalendar = false;
  }

  nextYear() {
    this.selectedYear++;
  }

  prevYear() {
    this.selectedYear--;
  }
}
