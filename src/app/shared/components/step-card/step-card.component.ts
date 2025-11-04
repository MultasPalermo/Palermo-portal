import { CommonModule } from '@angular/common';
import { Component, Input } from '@angular/core';
import { StepCard } from '../../modeloModelados/util/StepCard';

@Component({
  selector: 'app-step-card',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './step-card.component.html',
  styleUrls: ['./step-card.component.scss']   // ⬅️ SCSS (no .css)
})
export class StepCardComponent {
  @Input() headline = '¿Cómo funciona?';
  @Input() subHeadline = 'Consulta tus multas en 3 simples pasos';
  @Input({ required: true }) steps: StepCard[] = [];


  pad(n: string | number | undefined, i: number): string {
    const val = (n === undefined || n === null || n === '' ? i + 1 : n);
    const s = String(val);
    const numeric = Number.isNaN(Number(s)) ? s : String(Number(s));
    return numeric.padStart(2, '0');
  }
}
