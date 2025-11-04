export interface LoginEmailResponse {
  isSuccess: boolean;
  message: string;
  token?: string;
  lastVerificationSentAt?: string | null; 
  user?: {
    id: number;
    email: string;
    name: string;
  };
}
