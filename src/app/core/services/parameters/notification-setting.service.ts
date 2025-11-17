import { Injectable, inject } from '@angular/core';
import { ServiceGenericService } from '../utils/generic/service-generic.service';

@Injectable({
  providedIn: 'root'
})
export class NotificationSettingService {
  readonly endpoint = 'NotificationSetting';
  
  public genericService = inject(ServiceGenericService);
  
  constructor() { }
}
