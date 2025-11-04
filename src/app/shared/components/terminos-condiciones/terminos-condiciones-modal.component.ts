import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DialogModule } from 'primeng/dialog';
import { ButtonModule } from 'primeng/button';
import { CheckboxModule } from 'primeng/checkbox';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-terminos-condiciones-modal',
  standalone: true,
  imports: [CommonModule, DialogModule, ButtonModule, CheckboxModule, FormsModule],
  templateUrl: './terminos-condiciones-modal.component.html',
  styleUrls: ['./terminos-condiciones-modal.component.scss']
})
export class TerminosCondicionesModalComponent {
  @Input() visible = false;
  @Output() visibleChange = new EventEmitter<boolean>();
  @Output() onAcceptTerms = new EventEmitter<void>();
  @Output() onRejectTerms = new EventEmitter<void>();

  hasScrolledToBottom = false;

  onScroll(event: Event) {
    const element = event.target as HTMLElement;
    const scrollTop = element.scrollTop;
    const scrollHeight = element.scrollHeight;
    const clientHeight = element.clientHeight;

    // Considera que llegó al final si está a 10px o menos del final
    if (scrollTop + clientHeight >= scrollHeight - 10) {
      this.hasScrolledToBottom = true;
    }
  }

  onAccept() {
    if (this.hasScrolledToBottom) {
      this.visible = false;
      this.visibleChange.emit(false);
      this.onAcceptTerms.emit();
      this.resetState();
    }
  }

  onReject() {
    this.visible = false;
    this.visibleChange.emit(false);
    this.onRejectTerms.emit();
    this.resetState();
  }

  private resetState() {
    this.hasScrolledToBottom = false;
  }
}
