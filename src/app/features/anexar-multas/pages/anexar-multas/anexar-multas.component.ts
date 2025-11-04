import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { DropdownModule } from 'primeng/dropdown';
import { InputTextModule } from 'primeng/inputtext';
import { ButtonModule } from 'primeng/button';
import Swal from 'sweetalert2';
import { ServiceGenericService } from '../../../../core/services/utils/generic/service-generic.service';
import { DocumentSessionService } from '../../../../core/services/documents/document-session.service';
import { PaymentService } from '../../../../core/services/payments/payment.service';



@Component({
  selector: 'app-anexar-multas',
  standalone: true,
  imports: [CommonModule, FormsModule, DropdownModule, InputTextModule, ButtonModule],
  templateUrl: './anexar-multas.component.html',
  styleUrls: ['./anexar-multas.component.scss']
})
export class AnexarMultasComponent implements OnInit {

  form = {
    firstName: '',
    lastName: '',
    documentTypeId: null as number | null,
    documentNumber: '',
    typeInfractionId: null as number | null,
    infractionId: null as number | null,
    smldvCount: null as number | null,
    email: ''
  };

  isLoading = false;
  isExistingUser = false;
  documentTypes: { label: string; value: number }[] = [];
  infractionTypes: { label: string; value: number; smldv: number }[] = [];
  infractions: { label: string; value: number; smldv: number }[] = [];

  constructor(
    private router: Router,
    private api: ServiceGenericService,
    private documentSessionService: DocumentSessionService,
    private paymentService: PaymentService
  ) { }

  ngOnInit() {
    this.loadDocumentTypes();
    this.loadTypeInfractions();
  }

  loadDocumentTypes() {
    this.api.getAll<any>('documentType').subscribe({
      next: (resp) => {
        this.documentTypes = (resp ?? []).map(d => ({
          value: d.id,
          label: d.abbreviation ? `${d.name} (${d.abbreviation})` : d.name
        }));
      },
      error: (err) => {
        console.error('❌ Error cargando tipos de documentos:', err);
        Swal.fire('Error', 'No se pudieron cargar los tipos de documento', 'error');
      }
    });
  }

  loadTypeInfractions() {
    this.api.getAll<any>('TypeInfraction').subscribe({
      next: (resp) => {
        this.infractionTypes = (resp ?? []).map(i => ({
          value: i.id,
          label: i.name,
          smldv: i.numer_smldv ?? 0
        }));
      },
      error: (err) => {
        console.error('❌ Error cargando tipos de infracción:', err);
        Swal.fire('Error', 'No se pudieron cargar los tipos de multa', 'error');
      }
    });
  }

  // Cambio de tipo de infracción
  onInfractionTypeChange(typeId: number) {
    this.form.infractionId = null;
    this.form.smldvCount = null;
    this.infractions = [];

    if (!typeId) return;

    this.api.getAll<any>('Infraction').subscribe({
      next: (resp: any[]) => {
        const filtered = resp.filter(i => i.typeInfractionName === this.infractionTypes.find(t => t.value === typeId)?.label);
        this.infractions = filtered.map(i => ({
          value: i.id,
          label: i.description,
          smldv: i.numer_smldv
        }));
      },
      error: (err) => {
        console.error('❌ Error cargando infracciones del tipo:', err);
        Swal.fire('Error', 'No se pudieron cargar las infracciones', 'error');
      }
    });
  }

  checkExistingInfraction() {
  const { documentTypeId, documentNumber } = this.form;
  if (!documentTypeId || !documentNumber) {
    this.isExistingUser = false;
    return;
  }

  // Aquí no tocamos isLoading para el botón
  this.documentSessionService.getMultasByDocument(documentTypeId, documentNumber).subscribe({
    next: (resp: any) => {
      if (resp.isSuccess && resp.count > 0) {
        const multa = resp.data[0];
        this.form.firstName = multa.firstName;
        this.form.lastName = multa.lastName;
        this.form.email = multa.userEmail;
        this.isExistingUser = true; // bloqueamos campos
      } else {
        this.resetFieldsForNewUser();
      }
    },
    error: (err: any) => {
      console.error('❌ Error verificando multas existentes:', err);
      Swal.fire('Error', 'No se pudo verificar si la persona tiene multas', 'error');
    }
  });
}


  resetFieldsForNewUser() {
    this.form.firstName = '';
    this.form.lastName = '';
    this.form.email = '';
    this.form.typeInfractionId = null;
    this.form.infractionId = null;
    this.form.smldvCount = null;
    this.infractions = [];
    this.isExistingUser = false; 
  }

  onInfractionChange(infractionId: number) {
    const selected = this.infractions.find(x => x.value === infractionId);
    this.form.smldvCount = selected ? selected.smldv : null;
  }

  saveInfraction() {
  if (this.isLoading) return; // evita doble click

  // ✅ Validaciones del frontend
  if (!this.form.documentTypeId) {
    Swal.fire('⚠️', 'Debe seleccionar un tipo de documento', 'warning');
    return;
  }

  if (!this.form.documentNumber.trim()) {
    Swal.fire('⚠️', 'Debe ingresar el número de documento', 'warning');
    return;
  }

  if (!this.form.firstName.trim()) {
    Swal.fire('⚠️', 'Debe ingresar el nombre', 'warning');
    return;
  }

  if (!this.form.lastName.trim()) {
    Swal.fire('⚠️', 'Debe ingresar el apellido', 'warning');
    return;
  }

  if (!this.form.typeInfractionId) {
    Swal.fire('⚠️', 'Debe seleccionar un tipo de multa', 'warning');
    return;
  }

  if (!this.form.infractionId) {
    Swal.fire('⚠️', 'Debe seleccionar la infracción cometida', 'warning');
    return;
  }

  if (!this.form.email.trim()) {
    Swal.fire('⚠️', 'Debe ingresar el correo electrónico', 'warning');
    return;
  }

  // Validación básica de email
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(this.form.email)) {
    Swal.fire('⚠️', 'El correo electrónico no tiene un formato válido', 'warning');
    return;
  }

  this.isLoading = true; // ahora sí bloqueamos mientras se registra

  const payload = {
    firstName: this.form.firstName,
    lastName: this.form.lastName,
    documentTypeId: Number(this.form.documentTypeId),
    documentNumber: this.form.documentNumber,
    email: this.form.email,
    typeInfractionId: Number(this.form.infractionId), // Enviar el ID de la infracción específica, no del tipo
    smldvCount: Number(this.form.smldvCount)
  };

  this.paymentService.createInfraction(payload).subscribe({
    next: (resp: any) => {
      this.isLoading = false;

      if (resp?.isSuccess) {
        Swal.fire('✅', resp.message || 'Multa registrada exitosamente', 'success');

        if (resp.pdfUrl) {
          const link = document.createElement('a');
          link.href = resp.pdfUrl;
          link.download = `Multa_${resp.data.id}.pdf`;
          document.body.appendChild(link);
          link.click();
          document.body.removeChild(link);
        }

        this.resetForm();
      } else {
        Swal.fire('⚠️', resp?.message || 'No se pudo registrar la multa', 'warning');
      }
    },
    error: async (err: any) => {
      this.isLoading = false;

      console.error('❌ Error al crear multa:', err);
      if (err.error?.errors) {
        const errores = Object.entries(err.error.errors);
        const [campo, listaMensajes] = errores[0];
        const mensaje = (listaMensajes as string[])[0];
        await Swal.fire({
          icon: 'warning',
          title: 'Validación',
          text: `⚠️ ${mensaje}`,
          confirmButtonColor: '#d33'
        });
      } else {
        Swal.fire('❌', err.error?.message || 'Error interno del servidor', 'error');
      }
    }
  });
}


  resetForm() {
    this.form = {
      firstName: '',
      lastName: '',
      email: '',
      documentTypeId: null,
      documentNumber: '',
      typeInfractionId: null,
      infractionId: null,
      smldvCount: null
    };
    this.infractions = [];
    this.isExistingUser = false;
  }

  getSelectedInfractionDescription(): string {
    if (!this.form.infractionId) return '';
    const selected = this.infractions.find(x => x.value === this.form.infractionId);
    return selected ? selected.label : '';
  }

}

