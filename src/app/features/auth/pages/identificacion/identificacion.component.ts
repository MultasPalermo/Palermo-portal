import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { DropdownModule } from 'primeng/dropdown';
import { InputTextModule } from 'primeng/inputtext';
import { ButtonModule } from 'primeng/button';
import { Router } from '@angular/router';

import Swal from 'sweetalert2';
import { RecaptchaService } from '../../../../core/services/utils/recaptcha.service';
import { ServiceGenericService } from '../../../../core/services/utils/generic/service-generic.service';
import { DocumentSessionService } from '../../../../core/services/documents/document-session.service';
import { SessionPingService } from '../../../../core/services/utils/session-ping.service';
import { DocumentTypeDto } from '../../../../shared/modeloModelados/parameters/document-type.models';
import { LoginDocumentoRequest } from '../../../../shared/modeloModelados/auth/request/LoginDocumentoRequest';
import { TerminosCondicionesModalComponent } from '../../../../shared/components/terminos-condiciones/terminos-condiciones-modal.component';

@Component({
  selector: 'app-identification',
  standalone: true,
  imports: [CommonModule, FormsModule, DropdownModule, InputTextModule, ButtonModule, TerminosCondicionesModalComponent],
  template: `
  <div [ngClass]="layout === 'embedded' ? 'block pt-0' : 'flex justify-center items-center pt-20'">
    <div [ngClass]="layout === 'embedded' ? 'bg-white p-8 md:p-10 rounded-xl shadow-lg w-full max-w-md md:max-w-lg' : 'bg-white p-12 rounded-xl shadow-lg w-full max-w-2xl'">
      <h2 class="text-center text-3xl font-semibold mb-8 text-gray-800">Identificación ciudadana</h2>

      <div class="mb-6">
        <label class="block mb-3 font-medium text-lg text-gray-700">Tipo de documento</label>
        <div *ngIf="docTypesLoading" class="text-gray-600 mb-2">Cargando tipos...</div>
        <div *ngIf="!docTypesLoading && docTypesError" class="text-red-600 mb-2">{{ docTypesError }}</div>
        <p-dropdown
          [options]="documentTypes"
          [(ngModel)]="selectedDocType"
          optionLabel="label"
          optionValue="value"
          placeholder="Selecciona"
          class="w-full text-lg"
          [disabled]="docTypesLoading || isSubmitting">
        </p-dropdown>
      </div>

      <div class="mb-6">
        <label class="block mb-3 font-medium text-lg text-gray-700">Número de documento</label>
        <input pInputText type="text" [(ngModel)]="documentNumber" placeholder="Ingresa tu número" class="w-full text-lg p-3" [disabled]="isSubmitting"/>
      </div>

      <button
        pButton
        type="button"
        [label]="isSubmitting ? 'Validando...' : 'Consultar Multas'"
        class="w-full bg-green-700 border-none hover:bg-green-800 text-lg py-4"
        [disabled]="isSubmitting"
        (click)="onSubmit()">
      </button>

      <small>
        Este sitio está protegido por reCAPTCHA y aplican la
        <a href="https://policies.google.com/privacy" target="_blank" rel="noopener">Política de privacidad</a>
        y los
        <a href="https://policies.google.com/terms" target="_blank" rel="noopener">Términos de servicio</a> de Google.
      </small>
    </div>
  </div>

  <app-terminos-condiciones-modal
    [(visible)]="showTermsModal"
    (onAcceptTerms)="onTermsAccepted()"
    (onRejectTerms)="onTermsRejected()">
  </app-terminos-condiciones-modal>
  `
})
export class Identificacion implements OnInit {
  @Input() layout: 'standalone' | 'embedded' = 'standalone';
  @Input() redirectTo: string = '/contenido-documento/document';
  @Input() showLogoutButton = false;
  @Input() mode: 'modal' | 'redirect' = 'redirect'; // Nuevo input para controlar el comportamiento
  @Output() loginSuccess = new EventEmitter<{multas: any[], ciudadano: string}>();
  @Output() logoutClick = new EventEmitter<void>();

  constructor(
    private router: Router,
    private recaptcha: RecaptchaService,
    private documentSessionService: DocumentSessionService,
    private sessionPing: SessionPingService,
    private api: ServiceGenericService
  ) {}

  documentTypes: { label: string; value: number }[] = [];
  selectedDocType?: number;
  documentNumber = '';
  isSubmitting = false;

  docTypesLoading = false;
  docTypesError = '';

  showTermsModal = false;
  pendingData: { multas: any[], ciudadano: string } | null = null;

  ngOnInit(): void {
    this.loadDocumentTypes();
  }

  private loadDocumentTypes(): void {
    this.docTypesLoading = true;
    this.api.getAll<DocumentTypeDto>('documentType').subscribe({
      next: (items) => {
        this.documentTypes = (items ?? []).map(d => ({
          value: d.id,
          label: d.abbreviation ? `${d.name} (${d.abbreviation})` : d.name
        }));
        this.docTypesLoading = false;
      },
      error: async (err) => {
        const payload = await this.normalizeErrorPayload(err);
        this.docTypesError = payload?.message || 'No fue posible cargar los tipos de documento.';
        await this.showError(this.docTypesError);
        this.docTypesLoading = false;
      }
    });
  }

  async onSubmit() {
    this.isSubmitting = true;
    try {
      const action = 'documento';
      const recaptchaToken = await this.recaptcha.getToken(action);

      const body: LoginDocumentoRequest = {
        documentTypeId: this.selectedDocType as number, // puede venir undefined, el back lo validará
        documentNumber: (this.documentNumber ?? '').trim(), // el back valida longitud/numérico/>0
        recaptchaToken,
        recaptchaAction: action
      };

      // 1) Login por documento: si hay errores de DTO, FluentValidation devuelve 400 con errors:{...}
      const resp = await this.documentSessionService.loginDocumento(body).toPromise();
      if (!resp?.isSuccess) {
        await this.showError(resp?.message ?? 'No fue posible iniciar sesión.');
        return;
      }

      // 2) Guarda doc para fallback
      sessionStorage.setItem('docTypeId', String(body.documentTypeId ?? ''));
      sessionStorage.setItem('docNumber', body.documentNumber ?? '');

      // 3) Consultar multas
      const r = await this.documentSessionService.getMultasByDocument(body.documentTypeId!, body.documentNumber!).toPromise();
      const data = r?.data ?? [];
      if (!data.length) {
        await this.showInfo('Este usuario no tiene multas registradas.', 'Sin resultados');
        return;
      }

      // 4) Mapear a la interfaz de la tabla (usando la misma función que el componente de tabla)
      const multas = data.map((x: any) => ({
        id: x.id,
        userId: x.userId,
        tipo: x.typeInfractionName ?? '—',
        fecha: x.dateInfraction ?? '',
        descripcion: x.observations ?? '',
        estado: mapEstadoFromEnum(x.stateInfraction),
        pdfUrl: x.pdfUrl,
        documentNumber: x.documentNumber
      }));

      const first = data[0];
      const ciudadano = [first?.firstName, first?.lastName].filter(Boolean).join(' ');

      // 5) Iniciar ping de sesión (idle)
      this.sessionPing.start(60000);

      // 6) Guardar datos pendientes y mostrar términos y condiciones
      this.pendingData = { multas, ciudadano };
      this.showTermsModal = true;

    } catch (err: any) {
      // === Aquí mostramos SOLO el primer error de las validaciones del back ===
      const payload = await this.normalizeErrorPayload(err);
      const firstMsg = this.pickFirstFluentError(payload)
        ?? payload?.message
        ?? 'Error en la solicitud.';
      await this.showError(firstMsg);
    } finally {
      this.isSubmitting = false;
    }
  }

  // =========================
  // SweetAlert2 helpers
  // =========================
  private async showInfo(text: string, title = 'Aviso') {
    await Swal.fire({ icon: 'info', title, text, confirmButtonText: 'Ok' });
  }
  private async showError(text: string, title = 'Error') {
    await Swal.fire({ icon: 'error', title, text, confirmButtonText: 'Entendido' });
  }

  /**
   * Devuelve SOLO el primer error de FluentValidation (errors:{campo:[msg,...]}).
   * Prioriza campos del DocumentLoginDto: DocumentTypeId, DocumentNumber, RecaptchaToken, RecaptchaAction.
   */
  private pickFirstFluentError(payload: any): string | null {
    const errors = payload?.errors;
    if (!errors) return null;

    const order = ['DocumentTypeId', 'DocumentNumber', 'RecaptchaToken', 'RecaptchaAction'];
    for (const f of order) {
      const list = errors[f];
      if (Array.isArray(list) && list.length) return list[0];
    }
    for (const k of Object.keys(errors)) {
      const list = errors[k];
      if (Array.isArray(list) && list.length) return list[0];
    }
    return null;
  }

  onLogout() {
    this.logoutClick.emit();
  }

  /**
   * Normaliza el error si vino como Blob (text/html) o string en vez de JSON.
   * Si no es parseable, devuelve {} para evitar romper el flujo.
   */
  private async normalizeErrorPayload(err: any): Promise<any> {
    if (err?.error instanceof Blob) {
      try { return JSON.parse(await err.error.text()); } catch { return {}; }
    }
    if (typeof err?.error === 'string') {
      try { return JSON.parse(err.error); } catch { return {}; }
    }
    return err?.error ?? {};
  }

  // =========================
  // Términos y condiciones
  // =========================
  onTermsAccepted() {
    if (this.pendingData) {
      const { multas, ciudadano } = this.pendingData;

      if (this.mode === 'modal') {
        // Emitir datos para mostrar modal
        this.loginSuccess.emit({ multas, ciudadano });
      } else {
        // Navegar con state (comportamiento original)
        if (this.redirectTo) {
          this.router.navigate([this.redirectTo], { state: { multas, ciudadano } });
        }
        this.loginSuccess.emit();
      }

      this.pendingData = null;
    }
  }

  onTermsRejected() {
    Swal.fire({
      icon: 'warning',
      title: 'Términos no aceptados',
      text: 'Debe aceptar los términos y condiciones para consultar sus multas.',
      confirmButtonText: 'Entendido'
    });
    this.pendingData = null;
  }
}

// 🔎 Mapear enum del backend a texto legible (misma función que en contenido-documento.component.ts)
function mapEstadoFromEnum(v: string | number | null | undefined): 'Pendiente' | 'Pagada' | 'Vencida' | 'Con acuerdo' {
  if (v === null || v === undefined) return 'Pendiente';

  if (typeof v === 'string') {
    switch (v) {
      case 'Pendiente': return 'Pendiente';
      case 'Pagada': return 'Pagada';
      case 'Vencida': return 'Vencida';
      case 'ConAcuerdoPago': return 'Con acuerdo';
    }
  }

  if (typeof v === 'number') {
    switch (v) {
      case 0: return 'Pendiente';
      case 1: return 'Pagada';
      case 2: return 'Vencida';
      case 3: return 'Con acuerdo';
    }
  }

  return 'Pendiente';
}