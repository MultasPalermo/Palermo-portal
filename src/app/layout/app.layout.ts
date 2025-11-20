// src/app/layout/shell/app.layout.ts
import { Component, Renderer2, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NavigationEnd, Router, RouterModule } from '@angular/router';
import { filter, Subscription } from 'rxjs';

import { LayoutService } from './services/layout.service';
import { AppSidebar } from './sidebar/app.sidebar';
import { AppTopbar } from './header/topbar.component';

@Component({
  selector: 'app-layout',
  standalone: true,
  imports: [CommonModule, RouterModule, AppSidebar, AppTopbar],
  template: `
    <div class="layout-wrapper" [ngClass]="containerClass">

      <!-- SIDEBAR -->
      <app-sidebar></app-sidebar>

      <!-- TOPBAR FIJO -->
      <app-topbar></app-topbar>

      <!-- CONTENIDO PRINCIPAL -->
      <div class="layout-main">
        <router-outlet></router-outlet>
      </div>

      <div
        class="layout-mask animate-fadein"
        *ngIf="layoutService.layoutState().overlayMenuActive || layoutService.layoutState().staticMenuMobileActive"
        (click)="hideMenu()">
      </div>

    </div>
  `,
  styles: [`
    :host {
      display:block;
      height:100vh;
      width:100vw;
      overflow:hidden;
    }

    .layout-wrapper {
      display:flex;
      height:100vh;
      width:100vw;
      position:relative;
      overflow:hidden;
    }

    /* SIDEBAR */
    app-sidebar {
      width:169px;
      min-width:169px;
      z-index:1000;
    }

    /* TOPBAR FIJO */
    app-topbar {
      position:fixed;
      top:0;
      left:300px;
      right:0;
      height:70px;
      z-index:1200;
      left: unset !important;
    }

    /* CONTENIDO */
    .layout-main {
      flex:1;
      height:100vh;
      margin-left:169px;
      padding-top:70px;
      overflow-y:auto;
      background:#f3f4f6;
      transition:margin-left .3s ease;
    }

    /* SIDEBAR CERRADO */
    .layout-static-inactive app-sidebar {
      width:0 !important;
      min-width:0 !important;
    }

    .layout-static-inactive app-topbar {
      left:0 !important;
    }

    .layout-static-inactive .layout-main {
      margin-left:0 !important;
    }

    /* MASK */
    .layout-mask {
      position:fixed;
      inset:0;
      background:rgba(0,0,0,.4);
      z-index:1400;
      display:none;
    }

    .layout-overlay-active .layout-mask,
    .layout-mobile-active .layout-mask {
      display:block;
    }
  `]
})
export class AppLayout {
  overlayMenuOpenSubscription: Subscription;
  menuOutsideClickListener: any;

  @ViewChild(AppSidebar) appSidebar!: AppSidebar;
  @ViewChild(AppTopbar)  appTopBar!: AppTopbar;

  constructor(
    public layoutService: LayoutService,
    public renderer: Renderer2,
    public router: Router
  ) {
    this.overlayMenuOpenSubscription = this.layoutService.overlayOpen$.subscribe(() => {
      if (!this.menuOutsideClickListener) {
        this.menuOutsideClickListener = this.renderer.listen('document', 'click', (event) => {
          if (this.isOutsideClicked(event)) this.hideMenu();
        });
      }
      if (this.layoutService.layoutState().staticMenuMobileActive)
        this.blockBodyScroll();
    });

    this.router.events.pipe(filter(evt => evt instanceof NavigationEnd))
      .subscribe(() => this.hideMenu());
  }

  isOutsideClicked(event: MouseEvent) {
    const sidebarEl = document.querySelector('.layout-sidebar');
    const t = event.target as Node;
    return !(sidebarEl?.contains(t));
  }

  hideMenu() {
    this.layoutService.updateState({
      overlayMenuActive: false,
      staticMenuMobileActive: false,
      menuHoverActive: false
    });

    if (this.menuOutsideClickListener) {
      this.menuOutsideClickListener();
      this.menuOutsideClickListener = null;
    }

    this.unblockBodyScroll();
  }

  blockBodyScroll() {
    document.body.classList.add('blocked-scroll');
  }

  unblockBodyScroll() {
    document.body.classList.remove('blocked-scroll');
  }

  get containerClass() {
    return {
      'layout-overlay': this.layoutService.layoutConfig().menuMode === 'overlay',
      'layout-static': this.layoutService.layoutConfig().menuMode === 'static',
      'layout-static-inactive': this.layoutService.layoutState().staticMenuDesktopInactive &&
                                this.layoutService.layoutConfig().menuMode === 'static',
      'layout-overlay-active': this.layoutService.layoutState().overlayMenuActive,
      'layout-mobile-active': this.layoutService.layoutState().staticMenuMobileActive
    };
  }

  ngOnDestroy() {
    this.overlayMenuOpenSubscription?.unsubscribe();
    if (this.menuOutsideClickListener) this.menuOutsideClickListener();
  }
}
