import { Injectable } from '@angular/core';
import { ServiceGenericService } from '../utils/generic/service-generic.service';

@Injectable({
  providedIn: 'root'
})
export class FormModuleService {
  readonly endpoint = 'FormModule';

  constructor(public genericService: ServiceGenericService) {}
}

