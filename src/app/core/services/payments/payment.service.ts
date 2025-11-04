// ===============================
import { Injectable } from '@angular/core';
import { ApiService } from '../base/api.service';
import { PaymentAgreementCreateResponse } from '../../../shared/modeloModelados/Entities/PaymentAgreementCreateResponse';
import { PaymentAgreementInitDto } from '../../../shared/modeloModelados/init/PaymentAgreementInitDto';

// Models

@Injectable({ providedIn: 'root' })
export class PaymentService extends ApiService {

  // ===============================
  // 📌 Pagos
  // ===============================
  getInitData(userId: number, infractionId?: number) {
    let url = this.url('PaymentAgreement', 'init', userId);
    if (infractionId) {
      url += `?infractionId=${infractionId}`;
    }
    return this.http.get<PaymentAgreementInitDto | PaymentAgreementInitDto[]>(url, this.optsJwt());
  }

  createInfraction(body: any) {
    return this.http.post<any>(
      this.url('UserInfraction', 'create-with-person'),
      body,
      this.optsJwt()
    );
  }

  createPaymentAgreement(body: any) {
    return this.http.post<PaymentAgreementCreateResponse>(
      this.url('PaymentAgreement'),
      body,
      this.optsJwt()
    );
  }

  downloadPaymentAgreementPdf(agreementId: number) {
    const url = this.url('PaymentAgreement', agreementId, 'pdf');
    return this.http.get(url, {
      ...this.optsJwt(),
      responseType: 'blob' as 'json'
    });
  }
}