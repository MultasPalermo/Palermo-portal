import { MenuModule } from 'primeng/menu';
import { AvatarModule } from 'primeng/avatar';
import { BadgeModule } from 'primeng/badge';
import { DialogModule } from 'primeng/dialog';
import { InputTextModule } from 'primeng/inputtext';

import { CommonModule } from '@angular/common';
import { Component, EventEmitter, OnDestroy, OnInit, Output, HostListener, HostBinding, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { ButtonModule } from 'primeng/button';
import { RippleModule } from 'primeng/ripple';
import { TooltipModule } from 'primeng/tooltip';

import { LayoutService } from '../services/layout.service';
import { ProfileService } from '../../core/services/profile/profile.service';
import { NotificacionComponent } from '../../features/multas/notificaciones/pages/components/encabezado/notificacion/notificacion.component';



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
    TooltipModule,
    DialogModule,
    InputTextModule,
     NotificacionComponent
  ]
})
export class AppTopbar implements OnInit, OnDestroy {

  private profileService = inject(ProfileService);

  darkMode: boolean = false;
  currentUser: any = null;

  items: any[] = [];

  // Scroll hide
  lastScrollTop = 0;
  isHidden = false;

  @Output() topbarHidden = new EventEmitter<boolean>();

  // Modal
  showPasswordModal = false;
  newPassword = '';
  confirmPassword = '';

  constructor(
    public layoutService: LayoutService,
    private router: Router
  ) {}


  @HostBinding('class.hidden')
  get hiddenClass() {
    return this.isHidden;
  }

  @HostListener('window:scroll', [])
  onWindowScroll() {
    const y = window.scrollY;

    if (y > this.lastScrollTop) {
      this.isHidden = true;
      this.topbarHidden.emit(true);
    } else {
      this.isHidden = false;
      this.topbarHidden.emit(false);
    }

    this.lastScrollTop = y <= 0 ? 0 : y;
  }


  // Cargar perfil real
  ngOnInit() {
    this.profileService.profile$
      .subscribe(profile => {
        if (profile) {
          this.currentUser = {
            fullName: `${profile.firstName} ${profile.lastName}`,
            role: 'Usuario',
            initial: profile.firstName.charAt(0).toUpperCase()
          };

          this.buildMenu();
        }
      });
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
        label: 'Cerrar sesión',
        icon: 'pi pi-sign-out',
        command: () => this.logout()
      }
    ];
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
