import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { MenuItem } from 'primeng/api';
import { mapBackendMenuToPrimeNG } from '../../core/services/utils/menu-mapper';
import { AuthService } from '../../core/services/auth/auth.service';


@Component({
  selector: 'app-menu',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <div class="menu-logo">
      <img src="../../../assets/demo/logo.png" alt="Logo" />
    </div>

    <ul class="layout-menu">
      <ng-container *ngFor="let section of model">
        <li class="menu-section">
          <div class="section-header">
            <i *ngIf="section.icon" [class]="section.icon" class="section-icon"></i>
            <span class="section-label">{{ section.label }}</span>
          </div>
          <ul class="submenu" *ngIf="section.items">
            <li *ngFor="let item of section.items" class="menu-item">
              <a [routerLink]="item.routerLink" class="menu-link" [class.disabled]="item.disabled">
                <i *ngIf="item.icon" [class]="item.icon" class="menu-icon"></i>
                <span class="menu-label">{{ item.label }}</span>
              </a>
            </li>
          </ul>
        </li>
      </ng-container>
    </ul>
  `,
  styles: [`
    .layout-menu {
      list-style: none;
      padding: 0;
      margin: 0;
    }

    .menu-section {
      margin-bottom: 1rem;
    }

    .section-header {
      display: flex;
      align-items: center;
      padding: 0.5rem 1rem;
      color: #ccc;
      font-size: 0.9rem;
      font-weight: 600;
      text-transform: uppercase;
      letter-spacing: 0.5px;
    }

    .section-icon {
      margin-right: 0.5rem;
      font-size: 1rem;
    }

    .submenu {
      list-style: none;
      padding: 0;
      margin: 0;
      margin-left: 0.5rem;
    }

    .menu-item {
      margin-bottom: 0.25rem;
    }

    .menu-link {
      display: flex;
      align-items: center;
      padding: 0.6rem 1rem;
      color: white;
      text-decoration: none;
      border-radius: 6px;
      transition: background-color 0.3s ease;
      font-size: 0.95rem;
    }

    .menu-link:hover:not(.disabled) {
      background-color: rgba(255, 255, 255, 0.1);
    }

    .menu-link.disabled {
      color: #666;
      cursor: not-allowed;
    }

    .menu-icon {
      margin-right: 0.75rem;
      font-size: 1.1rem;
    }

    .menu-label {
      font-weight: 500;
    }
  `]
})
export class AppMenu {
  public model: MenuItem[] = [];

  constructor(private authService: AuthService) {}

  ngOnInit() {
    this.authService.GetMe().subscribe((user: any) => {
      console.log("✅ Usuario cargado en sidebar:", user);
      this.model = mapBackendMenuToPrimeNG(user.menu);
      console.log("📌 Menu recibido del backend:", user.menu);
    });
  }
}


