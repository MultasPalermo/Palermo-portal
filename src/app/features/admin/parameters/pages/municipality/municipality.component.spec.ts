import { ComponentFixture, TestBed } from '@angular/core/testing';
import { of } from 'rxjs';

import { MunicipalityComponent } from './municipality.component';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';

import { ServiceGenericService } from '../../../core/services/utils/generic/service-generic.service';
import { Municipality } from '../../../shared/Models/parameters/municipality.models';

describe('MunicipalityComponent', () => {
  let fixture: ComponentFixture<MunicipalityComponent>;
  let serviceStub: jasmine.SpyObj<ServiceGenericService>;

  beforeEach(async () => {
    serviceStub = jasmine.createSpyObj('ServiceGenericService', ['getAll']);
    serviceStub.getAll.and.returnValue(of([] as Municipality[])); // 👈 array

    await TestBed.configureTestingModule({
      imports: [
        MunicipalityComponent,
        HttpClientTestingModule,     // ✅
        RouterTestingModule,         // por navigate()
        NoopAnimationsModule         // opcional
      ],
      providers: [
        { provide: ServiceGenericService, useValue: serviceStub }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(MunicipalityComponent);
    fixture.detectChanges(); // ngOnInit -> cargarMunicipios()
  });

  it('should create', () => {
    expect(fixture.componentInstance).toBeTruthy();
  });
});
