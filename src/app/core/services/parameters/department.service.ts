import { Injectable, inject } from '@angular/core';
import { ServiceGenericService } from '../utils/generic/service-generic.service';

@Injectable({
  providedIn: 'root'
})
export class DepartmentService {
  readonly endpoint = 'department';
  
  public genericService = inject(ServiceGenericService);
  
  constructor() { }
}