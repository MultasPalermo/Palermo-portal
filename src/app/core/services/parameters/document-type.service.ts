import { Injectable } from '@angular/core';
import { ServiceGenericService } from '../utils/generic/service-generic.service';

@Injectable({
  providedIn: 'root'
})
export class DocumentTypeService {
  readonly endpoint = 'documentType';

  constructor(public genericService: ServiceGenericService) { }
}