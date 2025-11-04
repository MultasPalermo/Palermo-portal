import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatIcon } from '@angular/material/icon';

type Align = 'left' | 'center' | 'right';

@Component({
  selector: 'app-card-header',
  standalone: true,
  imports: [CommonModule, MatIcon],
  templateUrl: './card-header.component.html',
  styleUrls: ['./card-header.component.scss']
})
export class CardHeaderComponent {
  @Input() title = '';
  @Input() description = '';
  @Input() showBack = false;              // 👈 flecha opcional
  @Output() back = new EventEmitter<void>(); // 👈 evento

  onBack() {
    this.back.emit();
  }

  maskDescription(description: string): string {
    if (!description) return '';

    // Buscar patrones como "Ciudadano: Nombre Apellido"
    const ciudadanoPattern = /Ciudadano:\s*([^.]+)/i;
    const match = description.match(ciudadanoPattern);

    if (match) {
      const fullName = match[1].trim();
      const maskedName = this.maskCitizenName(fullName);
      return description.replace(match[0], `Ciudadano: ${maskedName}`);
    }

    return description;
  }

  private maskCitizenName(name: string): string {
    if (!name) return '';

    // Dividir el nombre completo en partes
    const parts = name.trim().split(' ');

    // Si solo hay una parte (solo nombre o apellido)
    if (parts.length === 1) {
      const part = parts[0];
      if (part.length <= 2) return part;
      return part.charAt(0) + '*'.repeat(part.length - 2) + part.charAt(part.length - 1);
    }

    // Si hay múltiples partes, enmascarar todas menos la primera letra de cada una
    return parts.map(part => {
      if (part.length <= 2) return part;
      return part.charAt(0) + '*'.repeat(part.length - 2) + part.charAt(part.length - 1);
    }).join(' ');
  }

}
