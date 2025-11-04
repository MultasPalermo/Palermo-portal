import { PaymentAgreementSelectDto } from "../Entities/select/PaymentAgreementSelectDto";


export interface PaymentAgreementCreateResponse {
  agreement: PaymentAgreementSelectDto;
  pdfUrl: string;
}
