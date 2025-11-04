import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Location } from '@angular/common';
import { Router } from '@angular/router';

@Component({
  selector: 'app-calendar-detail',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './calendar-detail.component.html',
  styleUrls: ['./calendar-detail.component.css']
})
export class CalendarDetailComponent {
  multa: any;
  selectedYear = new Date().getFullYear();
  selectedMonth = new Date().getMonth();
  months = [
    'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
    'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
  ];
  weekDays = ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sabado', 'Domingo'];

  constructor(private location: Location, private router: Router) {
    const nav = this.router.getCurrentNavigation();
    this.multa = nav?.extras.state?.['multa'];
  }

  getDaysArray(): any[] {
    const daysInMonth = new Date(this.selectedYear, this.selectedMonth + 1, 0).getDate();
    const firstDay = new Date(this.selectedYear, this.selectedMonth, 1).getDay();
    // Ajuste para que el lunes sea el primer día
    const offset = firstDay === 0 ? 6 : firstDay - 1;
    const days: any[] = [];
    for (let i = 0; i < offset; i++) {
      days.push(null);
    }
    for (let d = 1; d <= daysInMonth; d++) {
      days.push(d);
    }
    return days;
  }

  prevMonth() {
    if (this.selectedMonth === 0) {
      this.selectedMonth = 11;
      this.selectedYear--;
    } else {
      this.selectedMonth--;
    }
  }

  nextMonth() {
    if (this.selectedMonth === 11) {
      this.selectedMonth = 0;
      this.selectedYear++;
    } else {
      this.selectedMonth++;
    }
  }

  goBack() {
    this.location.back();
  }

  // Ejemplo de lógica para colores de días
  getDayColor(day: number): string {
    if (!day) return '';
    if (day === new Date().getDate() && this.selectedMonth === new Date().getMonth() && this.selectedYear === new Date().getFullYear()) {
      return 'negro';
    }
    if ([3, 6].includes(day)) return 'verde';
    if ([1, 2, 4, 5, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23, 24, 25, 26, 27, 28, 29, 30, 31].includes(day)) return 'amarillo';
    return '';
  }
}
