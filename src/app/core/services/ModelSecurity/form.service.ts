import { Injectable } from '@angular/core';
import { ServiceGenericService } from '../utils/generic/service-generic.service';

@Injectable({
  providedIn: 'root'
})
export class FormService {
  readonly endpoint = 'Form';

  constructor(public genericService: ServiceGenericService) {}
}
