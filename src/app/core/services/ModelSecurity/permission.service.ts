import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { ServiceGenericService } from '../utils/generic/service-generic.service';

@Injectable({ providedIn: 'root' })
export class PermissionService {
  readonly endpoint = 'Permission';

  constructor(public genericService: ServiceGenericService) {}

}
