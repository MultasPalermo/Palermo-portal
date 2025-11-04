import { Injectable } from '@angular/core';
import { ServiceGenericService } from '../utils/generic/service-generic.service';

@Injectable({ providedIn: 'root' })
export class RolUserService {
readonly endpoint = 'RolUser';

  constructor(public genericService: ServiceGenericService) {}


}
