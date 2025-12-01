//import { Injectable } from '@angular/core';
//import { environment } from '../../../../environments/environment.development';

//declare var grecaptcha: any;

//@Injectable({ providedIn: 'root' })
//export class RecaptchaService {
  //private ready: Promise<void>;

  //constructor() {
    //this.ready = new Promise((resolve, reject) => {
    //  if (typeof grecaptcha !== 'undefined') {
     //   return resolve();
     // }

      // cargar script dinámicamente
     // const script = document.createElement('script');
      //script.src = 'https://www.google.com/recaptcha/api.js?render=${environment.recapchat.sitekey}';
     // script.async = true;
     // script.defer = true;
     // script.onload = () => resolve();
    //  script.onerror = (err) => reject(new Error('No se pudo cargar recaptcha: ' + err));
     // document.head.appendChild(script);
    //});
  //}

 // async getToken(action: string): Promise<string> {
 //   await this.ready;

   // return new Promise((resolve, reject) => {
   //   if (!grecaptcha || !grecaptcha.execute) {
      //  return reject(new Error('recaptcha no inicializó correctamente'));
     // }

     // grecaptcha.execute(environment.recapchat.sitekey, { action })
    //    .then((token: string) => resolve(token))
    //    .catch((err: any) => reject(err));
   // });
 // }
//}
