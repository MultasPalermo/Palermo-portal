import { Injectable, inject } from '@angular/core';
import { ServiceGenericService } from '../utils/generic/service-generic.service';

@Injectable({
  providedIn: 'root'
})
export class PaymentFrequencyService {
  readonly endpoint = 'PaymentFrequency';

  public genericService = inject(ServiceGenericService);

  constructor() { }
}