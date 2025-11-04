import { Injectable, inject } from '@angular/core';
import { ServiceGenericService } from '../utils/generic/service-generic.service';
import { BehaviorSubject, Observable } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { Municipio } from '../../../shared/modeloModelados/parameters/municipality.models';

@Injectable({ providedIn: 'root' })
export class MunicipalityService {
  readonly endpoint = 'municipality';
  public genericService = inject(ServiceGenericService);

  private municipalitiesSubject = new BehaviorSubject<Municipio[]>([]);
  municipalities$ = this.municipalitiesSubject.asObservable();

  constructor() {
    this.loadMunicipios();
  }

  private loadMunicipios(): void {
    this.genericService.getAll<Municipio>(this.endpoint).subscribe({
      next: (municipios) => this.municipalitiesSubject.next(municipios),
      error: (error) => {
        console.error('Error al cargar municipios:', error);
        this.municipalitiesSubject.next([]);
      }
    });
  }



  refreshMunicipios(): void {
    this.loadMunicipios();
  }
}
