import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { Identificacion } from '../../../auth/pages/identificacion/identificacion.component';
import { AuthService } from '../../../../core/services/auth/auth.service';

@Component({
  selector: 'app-consultar-ingresar',
  standalone: true,
  imports: [CommonModule, Identificacion],
  template: `
    <app-identification
      [redirectTo]="'/home/contenido'"
      [showLogoutButton]="true"
      [mode]="'redirect'">
    </app-identification>
  `,
  styles: [`:host{display:block;padding:1rem;}`]
})
export class ConsultarIngresarComponent {

  constructor(
    private authService: AuthService,
    private router: Router
  ) {}

  logout() {
    this.authService.logout().subscribe({
      next: () => {
        this.router.navigate(['/auth/login']);
      },
      error: () => {
        this.router.navigate(['/auth/login']);
      }
    });
  }
}



