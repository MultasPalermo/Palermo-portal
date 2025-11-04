import { Component, EventEmitter, OnDestroy, OnInit, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Subject, Subscription } from 'rxjs';
import { debounceTime, distinctUntilChanged } from 'rxjs/operators';
import { LayoutService } from '../services/layout.service';

@Component({
  selector: 'app-topbar',
  standalone: true,
  templateUrl: './topbar.component.html',
  styleUrls: ['./topbar.component.scss'],
  imports: [CommonModule, FormsModule]
})
export class AppTopbar implements OnInit, OnDestroy {
  searchTerm = '';
  private searchSubject = new Subject<string>();
  private subscription!: Subscription;

  @Output() search = new EventEmitter<string>();

  constructor(public layoutService: LayoutService) {}

  ngOnInit() {
    this.subscription = this.searchSubject.pipe(
      debounceTime(200),      // ⏳ espera 400ms tras dejar de escribir
      distinctUntilChanged()  
    ).subscribe(term => this.search.emit(term));
  }

  ngOnDestroy() {
    if (this.subscription) this.subscription.unsubscribe();
  }

  onSearchChange() {
    this.searchSubject.next(this.searchTerm.trim());
  }
}
