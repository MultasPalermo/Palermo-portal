import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';

@Component({
  selector: 'app-agreement-success',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="flex items-center justify-center p-10">
      <div class="bg-white border border-green-600 rounded-xl shadow-md w-full max-w-xl p-10">
        <!-- Icono de éxito -->
        <div class="text-center mb-6">
          <div class="inline-flex items-center justify-center w-20 h-20 bg-green-100 rounded-full mb-4">
            <svg class="w-12 h-12 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path>
            </svg>
          </div>
          <h2 class="text-2xl font-bold text-gray-800 mb-2">¡Éxito!</h2>
          <p class="text-lg text-gray-600">Tu acuerdo de pago ha sido generado con éxito</p>
        </div>

        <!-- Infracciones incluidas -->
        <div class="bg-gray-50 rounded-lg p-4 mb-4" *ngIf="selectedFines.length > 0">
          <h3 class="font-semibold text-gray-700 mb-3">Infracciones Incluidas</h3>
          <div class="space-y-2">
            <div *ngFor="let fine of selectedFines" class="flex justify-between items-center py-2 border-b border-gray-200 last:border-b-0">
              <div>
                <div class="font-medium text-sm">{{ fine.number }}</div>
                <div class="text-xs text-gray-500">{{ fine.date }}</div>
              </div>
              <span class="font-semibold">\${{ fine.amount }}</span>
            </div>
          </div>
        </div>

        <!-- Información del acuerdo -->
        <div class="bg-gray-50 rounded-lg p-4 mb-6">
          <h3 class="font-semibold text-gray-700 mb-3">Detalles del Acuerdo</h3>
          <div class="space-y-2 text-sm">
            <div class="flex justify-between">
              <span class="text-gray-600">Número de Acuerdo:</span>
              <span class="font-medium">{{ agreementNumber }}</span>
            </div>
            <div class="flex justify-between">
              <span class="text-gray-600">Número de Cuotas:</span>
              <span class="font-medium">{{ numberOfInstallments }}</span>
            </div>
            <div class="flex justify-between">
              <span class="text-gray-600">Cuota Mensual:</span>
              <span class="font-medium">\${{ monthlyInstallment }}</span>
            </div>
            <div class="flex justify-between">
              <span class="text-gray-600">Monto Total:</span>
              <span class="font-medium">\${{ totalAmount }}</span>
            </div>
            <div class="flex justify-between">
              <span class="text-gray-600">Fecha de Generación:</span>
              <span class="font-medium">{{ getCurrentDate() }}</span>
            </div>
          </div>
        </div>

        <!-- Mensaje informativo -->
        <div class="bg-blue-50 border-l-4 border-blue-400 p-4 mb-6">
          <div class="flex">
            <div class="flex-shrink-0">
              <svg class="h-5 w-5 text-blue-400" viewBox="0 0 20 20" fill="currentColor">
                <path fill-rule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clip-rule="evenodd" />
              </svg>
            </div>
            <div class="ml-3">
              <p class="text-sm text-blue-700">
                El acuerdo ha sido enviado a tu correo electrónico. También puedes descargar el comprobante haciendo clic en el botón de abajo.
              </p>
            </div>
          </div>
        </div>

        <!-- Botones de acción -->
        <div class="flex flex-col space-y-3">
          <button 
            class="w-full bg-green-700 hover:bg-green-800 text-white font-semibold py-3 px-4 rounded-md transition-colors flex items-center justify-center"
            (click)="downloadReceipt()">
            <svg class="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path>
            </svg>
            Descargar Comprobante
          </button>
          
          <button 
            class="w-full bg-gray-600 hover:bg-gray-700 text-white font-semibold py-3 px-4 rounded-md transition-colors flex items-center justify-center"
            (click)="goToHome()">
            <svg class="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"></path>
            </svg>
            Volver al Inicio
          </button>
        </div>
      </div>
    </div>
  `
})
export class AgreementSuccessComponent implements OnInit {
  agreementNumber: string = '';
  numberOfInstallments: number = 0;
  monthlyInstallment: number = 0;
  totalAmount: number = 0;
  selectedFines: any[] = [];

  constructor(private router: Router) {}

  ngOnInit() {
    const navigation = this.router.getCurrentNavigation();
    if (navigation?.extras.state) {
      this.agreementNumber = navigation.extras.state['agreementNumber'] || '';
      this.numberOfInstallments = navigation.extras.state['numberOfInstallments'] || 0;
      this.monthlyInstallment = navigation.extras.state['monthlyInstallment'] || 0;
      this.totalAmount = navigation.extras.state['totalAmount'] || 0;
      this.selectedFines = navigation.extras.state['selectedFines'] || [];
      
      console.log('Success page - Datos recibidos:', {
        agreementNumber: this.agreementNumber,
        numberOfInstallments: this.numberOfInstallments,
        monthlyInstallment: this.monthlyInstallment,
        totalAmount: this.totalAmount,
        selectedFines: this.selectedFines
      });
    } else {
      console.log('Success page - No se recibieron datos de navegación');
    }
  }

  getCurrentDate(): string {
    return new Date().toLocaleDateString('es-ES');
  }

  downloadReceipt() {
    // Crear lista de infracciones
    const finesList = this.selectedFines.map(fine => 
      `- ${fine.number} (${fine.date}): $${fine.amount}`
    ).join('\n');

    // Crear contenido del comprobante
    const receiptContent = `
COMPROBANTE DE ACUERDO DE PAGO
================================

Número de Acuerdo: ${this.agreementNumber}
Fecha de Generación: ${this.getCurrentDate()}

INFRACCIONES INCLUIDAS:
${finesList || 'No se especificaron infracciones'}

DETALLES DEL ACUERDO:
- Número de Cuotas: ${this.numberOfInstallments}
- Cuota Mensual: $${this.monthlyInstallment}
- Monto Total: $${this.totalAmount}

Gracias por utilizar nuestro servicio.
    `;

    // Crear y descargar archivo
    const blob = new Blob([receiptContent], { type: 'text/plain' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `comprobante-acuerdo-${this.agreementNumber}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
  }

  goToHome() {
    this.router.navigate(['/']);
  }
}