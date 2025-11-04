import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-pagination',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="pagination-container" *ngIf="totalPages > 1">
      <div class="pagination-info">
        <span>Página {{ currentPage }} de {{ totalPages }} ({{ totalItems }} elementos)</span>
      </div>
      <div class="pagination-controls">
        <button
          class="pagination-btn"
          (click)="onPrevPage()"
          [disabled]="currentPage === 1"
          title="Página anterior">
          « Anterior
        </button>

        <button
          *ngFor="let page of getVisiblePages()"
          class="pagination-btn"
          [class.active]="page === currentPage"
          (click)="onPageChange(page)">
          {{ page }}
        </button>

        <button
          class="pagination-btn"
          (click)="onNextPage()"
          [disabled]="currentPage === totalPages"
          title="Página siguiente">
          Siguiente »
        </button>
      </div>
    </div>
  `,
  styleUrls: ['./pagination.component.scss']
})
export class PaginationComponent {
  @Input() currentPage: number = 1;
  @Input() totalPages: number = 0;
  @Input() totalItems: number = 0;
  @Input() itemsPerPage: number = 5;

  @Output() pageChange = new EventEmitter<number>();

  onPageChange(page: number): void {
    if (page >= 1 && page <= this.totalPages && page !== this.currentPage) {
      this.pageChange.emit(page);
    }
  }

  onNextPage(): void {
    this.onPageChange(this.currentPage + 1);
  }

  onPrevPage(): void {
    this.onPageChange(this.currentPage - 1);
  }

  getVisiblePages(): number[] {
    const visiblePages: number[] = [];
    const maxVisible = 5;
    let start = Math.max(1, this.currentPage - Math.floor(maxVisible / 2));
    let end = Math.min(this.totalPages, start + maxVisible - 1);

    if (end - start + 1 < maxVisible) {
      start = Math.max(1, end - maxVisible + 1);
    }

    for (let i = start; i <= end; i++) {
      visiblePages.push(i);
    }

    return visiblePages;
  }
}