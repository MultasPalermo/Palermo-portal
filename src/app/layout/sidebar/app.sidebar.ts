import { Component, ElementRef } from '@angular/core';
import { AppMenu } from './app.menu';

@Component({
    selector: 'app-sidebar',
    standalone: true,
    imports: [AppMenu],
    template: ` <div class="layout-sidebar">
        <app-menu></app-menu>
    </div>`,
    styles: [`
        .layout-sidebar {
  position: fixed;
  left: 0;
  top: 0;
  height: 100vh;
  width: 300px;
  background: #2d8659;
  color: #ffffff;
  z-index: 999;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  overflow-y: auto;
  overflow-x: hidden;
  box-shadow: 4px 0 20px rgba(0, 0, 0, 0.15);
  display: flex;
  flex-direction: column;
}

/* Borde decorativo derecho */
.layout-sidebar::after {
  content: '';
  position: absolute;
  right: 0;
  top: 0;
  bottom: 0;
  width: 1px;
  background: linear-gradient(180deg,
    transparent 0%,
    rgba(255,255,255,0.2) 20%,
    rgba(255,255,255,0.2) 80%,
    transparent 100%);
}

.layout-sidebar * {
  color: #ffffff !important;
}

.layout-sidebar .layout-menu a {
  color: #ffffff !important;
}

.layout-sidebar .layout-menuitem-root-text {
  color: #ffffff !important;
}

.layout-sidebar .layout-menuitem-icon {
  color: #ffffff !important;
}

.layout-sidebar .layout-menuitem-text {
  color: #ffffff !important;
}

.layout-sidebar .layout-submenu-toggler {
  color: #ffffff !important;
}

/* Estados del sidebar */
.layout-overlay .layout-sidebar,
.layout-static-inactive .layout-sidebar {
  transform: translateX(-100%);
}

.layout-overlay-active .layout-sidebar,
.layout-mobile-active .layout-sidebar,
.layout-static .layout-sidebar {
  transform: translateX(0);
}

/* Responsive */
@media (max-width: 991px) {
  .layout-sidebar {
    transform: translateX(-100%);
  }

  .layout-overlay-active .layout-sidebar,
  .layout-mobile-active .layout-sidebar {
    transform: translateX(0);
  }
}

/* Scrollbar para el sidebar completo si es necesario */
.layout-sidebar::-webkit-scrollbar {
  width: 6px;
}

.layout-sidebar::-webkit-scrollbar-track {
  background: rgba(255, 255, 255, 0.05);
}

.layout-sidebar::-webkit-scrollbar-thumb {
  background: rgba(255, 255, 255, 0.2);
  border-radius: 10px;
}

.layout-sidebar::-webkit-scrollbar-thumb:hover {
  background: rgba(255, 255, 255, 0.3);
}`]
})
export class AppSidebar {
    constructor(public el: ElementRef) {}
}
