import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { UserInfractionDto } from '../../modeloModelados/Entities/user-infraction';

@Component({
  selector: 'app-generic-card',
  imports: [CommonModule],
  templateUrl: './generic-card.component.html',
  styleUrl: './generic-card.component.scss'
})
export class GenericCardComponent {
  @Input() title: string = '';
  @Input() icon: string = '';
  @Input() iconColor: string = 'text-blue-500';
  @Input() items: UserInfractionDto[] = [];
  @Input() borderColor: string = 'border-blue-500';
  @Input() backgroundColor: string = 'bg-yellow-50';

  @Output() cardClick = new EventEmitter<UserInfractionDto>();

  // Helper methods for template
  getFullName(item: UserInfractionDto): string {
    return `${item.firstName || ''} ${item.lastName || ''}`.trim();
  }

  formatDate(dateString: string): string {
    if (!dateString) return '';
    return new Date(dateString).toLocaleDateString('es-CO');
  }

  formatCurrency(amount: number): string {
    return new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency: 'COP'
    }).format(amount);
  }

  calculateMoraValue(item: UserInfractionDto): number {
    if (!item.dateInfraction) return 0;
    const infractionDate = new Date(item.dateInfraction);
    const now = new Date();
    const diffTime = now.getTime() - infractionDate.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    const days = Math.max(0, diffDays);
    const dailyRate = 0.02 / 30; // 2% monthly / 30 days
    return Math.round(item.amountToPay! * dailyRate * days);
  }

  onCardClick(item: UserInfractionDto) {
    this.cardClick.emit(item);
  }
}