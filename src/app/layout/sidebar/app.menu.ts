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
    <!-- Header mejorado con logo y título -->
    <div class="sidebar-header">
      <div class="logo-container">
        <img src="../../../assets/demo/logo.png" alt="Logo Municipio de Palermo" class="logo-image" />
      </div>
      <div class="header-title">
        <h2 class="municipality-name">Municipio de Palermo</h2>
        <p class="header-subtitle">Portal de Gestión</p>
      </div>
    </div>

    <!-- Línea divisoria -->
    <div class="header-divider"></div>

    <!-- Menú mejorado -->
    <nav class="layout-menu">
      <ng-container *ngFor="let section of model; let i = index">
        <div class="menu-section" [class.collapsed]="section['collapsed']">
          <!-- Encabezado de sección mejorado (clickeable para plegar/desplegar) -->
          <div class="section-header" (click)="toggleSection(i)">
            <div class="section-icon-wrapper">
              <i *ngIf="section.icon" [class]="section.icon" class="section-icon"></i>
            </div>
            <span class="section-label">{{ section.label }}</span>
            <i class="pi section-toggle-icon"
               [ngClass]="section['collapsed'] ? 'pi-chevron-down' : 'pi-chevron-up'"></i>
          </div>

          <!-- Items del menú -->
          <ul class="submenu" *ngIf="section.items && !section['collapsed']">
            <li *ngFor="let item of section.items" class="menu-item">
              <a
                [routerLink]="item.routerLink"
                routerLinkActive="active"
                [routerLinkActiveOptions]="{exact: true}"
                class="menu-link"
                [class.disabled]="item.disabled"
                [attr.title]="item.label">
                <div class="menu-item-content">
                  <i *ngIf="item.icon" [class]="item.icon" class="menu-icon"></i>
                  <span class="menu-label">{{ item.label }}</span>
                </div>
                <div class="menu-item-indicator"></div>
              </a>
            </li>
          </ul>
        </div>

        <!-- Separador entre secciones (excepto la última) -->
        <div *ngIf="i < model.length - 1" class="section-separator"></div>
      </ng-container>
    </nav>
  `,
  styles: [`
    /* ===== HEADER DEL SIDEBAR ===== */
    .sidebar-header {
      padding: 1.5rem 1rem;
      text-align: center;
      background: linear-gradient(135deg, rgba(255,255,255,0.05) 0%, rgba(255,255,255,0.02) 100%);
    }

    .logo-container {
      margin-bottom: 1rem;
      display: flex;
      justify-content: center;
      align-items: center;
    }

    .logo-image {
      width: 120px;
      height: 120px;
      object-fit: contain;
      filter: drop-shadow(0 4px 8px rgba(0, 0, 0, 0.2));
      transition: transform 0.3s ease;
    }

    .logo-image:hover {
      transform: scale(1.05);
    }

    .header-title {
      margin-top: 0.5rem;
    }

    .municipality-name {
      font-size: 1.1rem;
      font-weight: 700;
      margin: 0;
      color: #ffffff;
      text-transform: uppercase;
      letter-spacing: 0.5px;
      line-height: 1.3;
    }

    .header-subtitle {
      font-size: 0.85rem;
      margin: 0.3rem 0 0 0;
      color: rgba(255, 255, 255, 0.8);
      font-weight: 400;
    }

    .header-divider {
      height: 2px;
      background: linear-gradient(90deg,
        transparent 0%,
        rgba(255,255,255,0.3) 20%,
        rgba(255,255,255,0.3) 80%,
        transparent 100%);
      margin: 0 1rem 1.5rem 1rem;
    }

    /* ===== MENÚ PRINCIPAL ===== */
    .layout-menu {
      padding: 0 0.75rem 1.5rem 0.75rem;
      flex: 1;
    }

    .menu-section {
      margin-bottom: 0.5rem;
    }

    /* ===== ENCABEZADO DE SECCIÓN ===== */
    .section-header {
      display: flex;
      align-items: center;
      padding: 0.75rem 0.75rem 0.5rem 0.75rem;
      margin-bottom: 0.25rem;
      gap: 0.75rem;
      cursor: pointer;
      user-select: none;
      transition: all 0.3s ease;
      border-radius: 6px;
    }

    .section-header:hover {
      background: rgba(255, 255, 255, 0.08);
    }

    .section-header:active {
      transform: scale(0.98);
    }

    .section-icon-wrapper {
      width: 28px;
      height: 28px;
      display: flex;
      align-items: center;
      justify-content: center;
      background: rgba(255, 255, 255, 0.15);
      border-radius: 6px;
      flex-shrink: 0;
    }

    .section-icon {
      font-size: 0.95rem !important;
      color: #ffffff !important;
    }

    .section-label {
      color: rgba(255, 255, 255, 0.95) !important;
      font-size: 0.8rem;
      font-weight: 700;
      text-transform: uppercase;
      letter-spacing: 1px;
      flex: 1;
    }

    .section-toggle-icon {
      font-size: 0.75rem !important;
      color: rgba(255, 255, 255, 0.7) !important;
      transition: all 0.3s ease;
    }

    .section-header:hover .section-toggle-icon {
      color: rgba(255, 255, 255, 1) !important;
    }

    /* ===== SUBMENU ===== */
    .submenu {
      list-style: none;
      padding: 0;
      margin: 0;
      animation: slideDown 0.3s ease-out;
    }

    @keyframes slideDown {
      from {
        opacity: 0;
        max-height: 0;
        transform: translateY(-10px);
      }
      to {
        opacity: 1;
        max-height: 1000px;
        transform: translateY(0);
      }
    }

    .menu-item {
      margin-bottom: 2px;
    }

    /* ===== ENLACES DEL MENÚ ===== */
    .menu-link {
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 0.65rem 0.75rem;
      color: rgba(255, 255, 255, 0.9) !important;
      text-decoration: none;
      border-radius: 8px;
      transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
      position: relative;
      overflow: hidden;
      background: transparent;
      border-left: 3px solid transparent;
    }

    .menu-link::before {
      content: '';
      position: absolute;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      background: rgba(255, 255, 255, 0.05);
      opacity: 0;
      transition: opacity 0.3s ease;
      z-index: 0;
    }

    .menu-link:hover::before {
      opacity: 1;
    }

    .menu-item-content {
      display: flex;
      align-items: center;
      gap: 0.75rem;
      position: relative;
      z-index: 1;
      flex: 1;
    }

    .menu-icon {
      font-size: 1.1rem !important;
      color: rgba(255, 255, 255, 0.85) !important;
      width: 20px;
      text-align: center;
      flex-shrink: 0;
      transition: all 0.3s ease;
    }

    .menu-label {
      font-weight: 500;
      font-size: 0.9rem;
      color: rgba(255, 255, 255, 0.9) !important;
      transition: all 0.3s ease;
    }

    .menu-item-indicator {
      width: 6px;
      height: 6px;
      border-radius: 50%;
      background: transparent;
      transition: all 0.3s ease;
      position: relative;
      z-index: 1;
    }

    /* ===== ESTADOS DEL MENÚ ===== */
    .menu-link:hover:not(.disabled) {
      background: rgba(255, 255, 255, 0.12);
      padding-left: 1rem;
      border-left-color: rgba(255, 255, 255, 0.5);
      transform: translateX(2px);
    }

    .menu-link:hover:not(.disabled) .menu-icon {
      color: #ffffff !important;
      transform: scale(1.1);
    }

    .menu-link:hover:not(.disabled) .menu-label {
      color: #ffffff !important;
    }

    .menu-link.active {
      background: rgba(255, 255, 255, 0.2) !important;
      border-left-color: #ffffff;
      box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
    }

    .menu-link.active .menu-icon {
      color: #ffffff !important;
      transform: scale(1.15);
    }

    .menu-link.active .menu-label {
      color: #ffffff !important;
      font-weight: 600;
    }

    .menu-link.active .menu-item-indicator {
      background: #ffffff;
      box-shadow: 0 0 8px rgba(255, 255, 255, 0.6);
    }

    .menu-link.disabled {
      opacity: 0.4;
      cursor: not-allowed;
      pointer-events: none;
    }

    /* ===== SEPARADOR ENTRE SECCIONES ===== */
    .section-separator {
      height: 1px;
      background: linear-gradient(90deg,
        transparent 0%,
        rgba(255,255,255,0.15) 20%,
        rgba(255,255,255,0.15) 80%,
        transparent 100%);
      margin: 1rem 1rem;
    }

    /* ===== SCROLLBAR PERSONALIZADO ===== */
    .layout-menu::-webkit-scrollbar {
      width: 6px;
    }

    .layout-menu::-webkit-scrollbar-track {
      background: rgba(255, 255, 255, 0.05);
      border-radius: 10px;
    }

    .layout-menu::-webkit-scrollbar-thumb {
      background: rgba(255, 255, 255, 0.2);
      border-radius: 10px;
      transition: background 0.3s ease;
    }

    .layout-menu::-webkit-scrollbar-thumb:hover {
      background: rgba(255, 255, 255, 0.3);
    }

    /* ===== ANIMACIONES ===== */
    @keyframes slideIn {
      from {
        opacity: 0;
        transform: translateX(-10px);
      }
      to {
        opacity: 1;
        transform: translateX(0);
      }
    }

    .menu-section {
      animation: slideIn 0.3s ease-out backwards;
    }

    .menu-section:nth-child(1) { animation-delay: 0.05s; }
    .menu-section:nth-child(2) { animation-delay: 0.1s; }
    .menu-section:nth-child(3) { animation-delay: 0.15s; }
    .menu-section:nth-child(4) { animation-delay: 0.2s; }
    .menu-section:nth-child(5) { animation-delay: 0.25s; }
  `]
})
export class AppMenu {
  public model: MenuItem[] = [];

  constructor(private authService: AuthService) {}

  ngOnInit() {
    this.authService.GetMe().subscribe((user: any) => {
      console.log("✅ Usuario cargado en sidebar:", user);
      const backendMenu = mapBackendMenuToPrimeNG(user.menu);

      // Agregar Dashboard como primera sección del menú
      this.model = [
        {
          label: 'Dashboard',
          icon: 'pi pi-fw pi-chart-line',
          collapsed: false,
          items: [
            {
              label: 'Vista General',
              icon: 'pi pi-fw pi-home',
              routerLink: ['/dashboard']
            }
          ]
        },
        ...backendMenu.map(section => ({
          ...section,
          collapsed: false
        }))
      ];

      console.log("📌 Menu final con dashboard:", this.model);
    });
  }

  toggleSection(index: number) {
    this.model[index]['collapsed'] = !this.model[index]['collapsed'];
  }
}


