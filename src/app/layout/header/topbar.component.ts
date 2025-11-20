import { MenuModule } from 'primeng/menu';
import { AvatarModule } from 'primeng/avatar';
import { BadgeModule } from 'primeng/badge';
import { CommonModule } from '@angular/common';
import { Component, EventEmitter, OnDestroy, OnInit, Output } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { ButtonModule } from 'primeng/button';
import { RippleModule } from 'primeng/ripple';
import { LayoutService } from '../services/layout.service';
import { TooltipModule } from 'primeng/tooltip';

@Component({
  selector: 'app-topbar',
  standalone: true,
  templateUrl: './topbar.component.html',
  styleUrls: ['./topbar.component.scss'],
  imports: [
    CommonModule,
    FormsModule,
    AvatarModule,
    BadgeModule,
    ButtonModule,
    MenuModule,
    RippleModule,
    TooltipModule
  ]
})
export class AppTopbar implements OnInit, OnDestroy {

    darkMode: boolean = false;

  currentUser: any = null;

  items: any[] = [];

  constructor(
    public layoutService: LayoutService,
    private router: Router
  ) {}

  ngOnInit() {
    this.loadUser();
    this.buildMenu();
  }

  loadUser() {
    const token = localStorage.getItem('token');
    if (!token) return;

    const decoded: any = jwtDecode(token);

    const fullName = decoded.fullName || decoded.name || "Usuario";
    const role = decoded.role || decoded.rolName || "Sin Rol";

    this.currentUser = {
      fullName,
      role,
      initial: fullName[0].toUpperCase()
    };
  }

  buildMenu() {
    this.items = [
      {
        label: `Bienvenido(a) ${this.currentUser?.fullName}`,
        disabled: true,
        style: { 'font-weight': '600', 'font-size': '14px' }
      },
      { separator: true },
      {
        label: 'Cambiar contraseña',
        icon: 'pi pi-lock',
        command: () => this.changePassword()
      },
      {
        label: 'Cerrar sesión',
        icon: 'pi pi-sign-out',
        command: () => this.logout()
      }
    ];
  }

  changePassword() {
    this.router.navigate(['/cambiar-contrasena']);
  }

  logout() {
    localStorage.clear();
    sessionStorage.clear();
    this.router.navigate(['/login']);
  }

    toggleDark() {
    this.darkMode = !this.darkMode;
    document.documentElement.classList.toggle('app-dark', this.darkMode);
  }

  toggleFullscreen() {
    if (!document.fullscreenElement)
      document.documentElement.requestFullscreen();
    else
      document.exitFullscreen();
  }

  ngOnDestroy() {}
}
function jwtDecode(token: string): any {
    throw new Error('Function not implemented.');
}

