import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

/**
 * Componente reutilizable para mostrar tarjetas de estadísticas
 * Utiliza signals para mejor rendimiento y detecta cambios automáticamente
 */
@Component({
  selector: 'app-stat-card',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="stat-card" [ngClass]="colorClass">
      <div class="stat-icon">
        <i [class]="icon"></i>
      </div>
      <div class="stat-content">
        <div class="stat-value">{{ value | number }}</div>
        <div class="stat-label">{{ label }}</div>
      </div>
    </div>
  `,
  styles: [`
    .stat-card {
      background: white;
      border-radius: 12px;
      padding: 1.5rem;
      box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
      display: flex;
      align-items: center;
      gap: 1.25rem;
      transition: all 0.3s ease;
      border-left: 4px solid;
      min-height: 120px;
    }

    .stat-card:hover {
      transform: translateY(-2px);
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.12);
    }

    .stat-icon {
      display: flex;
      align-items: center;
      justify-content: center;
      width: 60px;
      height: 60px;
      border-radius: 12px;
      font-size: 1.75rem;
      flex-shrink: 0;
    }

    .stat-content {
      flex: 1;
      display: flex;
      flex-direction: column;
      gap: 0.25rem;
    }

    .stat-value {
      font-size: 2rem;
      font-weight: 700;
      line-height: 1.2;
    }

    .stat-label {
      font-size: 0.9rem;
      color: #6b7280;
      font-weight: 500;
    }

    /* Color variations - Green theme */
    .green-light {
      border-left-color: #86efac;
    }

    .green-light .stat-icon {
      background: #dcfce7;
      color: #16a34a;
    }

    .green-light .stat-value {
      color: #15803d;
    }

    .green-medium {
      border-left-color: #4ade80;
    }

    .green-medium .stat-icon {
      background: #bbf7d0;
      color: #15803d;
    }

    .green-medium .stat-value {
      color: #166534;
    }

    .green-dark {
      border-left-color: #22c55e;
    }

    .green-dark .stat-icon {
      background: #86efac;
      color: #166534;
    }

    .green-dark .stat-value {
      color: #14532d;
    }

    .green-darker {
      border-left-color: #16a34a;
    }

    .green-darker .stat-icon {
      background: #4ade80;
      color: #14532d;
    }

    .green-darker .stat-value {
      color: #052e16;
    }

    /* Responsive design */
    @media (max-width: 768px) {
      .stat-card {
        padding: 1.25rem;
        gap: 1rem;
      }

      .stat-icon {
        width: 50px;
        height: 50px;
        font-size: 1.5rem;
      }

      .stat-value {
        font-size: 1.5rem;
      }

      .stat-label {
        font-size: 0.85rem;
      }
    }
  `]
})
export class StatCardComponent {
  /** Icono de PrimeIcons a mostrar */
  @Input({ required: true }) icon!: string;

  /** Valor numérico de la estadística */
  @Input({ required: true }) value!: number;

  /** Etiqueta descriptiva de la estadística */
  @Input({ required: true }) label!: string;

  /** Clase CSS para el tema de color */
  @Input() colorClass: string = 'green-light';
}
