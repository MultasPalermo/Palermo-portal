import { Injectable, inject } from '@angular/core';
import { ServiceGenericService } from '../utils/generic/service-generic.service';

@Injectable({
  providedIn: 'root'
})
export class SmdlvService {
  readonly endpoint = 'ValueSmldv';

  public genericService = inject(ServiceGenericService);

  constructor() { }
}