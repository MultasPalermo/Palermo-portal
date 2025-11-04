import { Injectable } from '@angular/core';
import { ServiceGenericService } from '../utils/generic/service-generic.service';


@Injectable({
  providedIn: 'root'
})
export class RolesService {
  readonly endpoint = 'Rol';

  constructor(public genericService: ServiceGenericService) {}
}