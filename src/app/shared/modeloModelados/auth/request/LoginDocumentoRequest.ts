export interface LoginDocumentoRequest {
  documentTypeId: number;         
  documentNumber: string;         
  recaptchaToken: string;
  recaptchaAction: string;
}