export interface LoginDocumentoResponse {
  message: string;
  token?: string;
  sessionId?: string;
  userData?: {
    id: number;
    name: string;
    document: string;
  };
   isSuccess: boolean;
}