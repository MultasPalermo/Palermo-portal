import { Injectable } from '@angular/core';
import { environment } from '../../../../environments/environment.development';

declare const grecaptcha: any; // viene del script global

@Injectable({ providedIn: 'root' })
export class RecaptchaService {
  getToken(action: string): Promise<string> {
    return new Promise((resolve, reject) => {
      if (typeof grecaptcha === 'undefined') {
        return reject(new Error('reCAPTCHA no cargó'));
      }
      grecaptcha.ready(() => {
        grecaptcha.execute(environment.recapchat.sitekey, { action })
          .then((token: string) => resolve(token))
          .catch(reject);
      });
    });
  }
}
    