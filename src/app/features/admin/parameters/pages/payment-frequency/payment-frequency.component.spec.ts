import { ComponentFixture, TestBed } from '@angular/core/testing';
import { of } from 'rxjs';

import { PaymentFrequencyComponent } from './payment-frequency.component';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';

import { ServiceGenericService } from '../../../core/services/utils/generic/service-generic.service';
import { PaymentFrequency } from '../../../shared/Models/parameters/payment-frequency.models';

describe('PaymentFrequencyComponent', () => {
  let fixture: ComponentFixture<PaymentFrequencyComponent>;
  let serviceStub: jasmine.SpyObj<ServiceGenericService>;

  beforeEach(async () => {
    // Crea el stub del servicio con los métodos que usa el componente
    serviceStub = jasmine.createSpyObj('ServiceGenericService', ['getAll']);
    // 👇 getAll<T> debe retornar T[] => usa un ARRAY (no {data:[]})
    serviceStub.getAll.and.returnValue(of([] as PaymentFrequency[]));

    await TestBed.configureTestingModule({
      imports: [
        PaymentFrequencyComponent,   // standalone
        HttpClientTestingModule,     // ✅ provee HttpClient en tests
        RouterTestingModule,         // si el template navega
        NoopAnimationsModule         // opcional (Material/PrimeNG)
      ],
      providers: [
        { provide: ServiceGenericService, useValue: serviceStub }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(PaymentFrequencyComponent);
    fixture.detectChanges(); // dispara ngOnInit -> cargarAcuerdosFrecuencia()
  });

  it('should create', () => {
    expect(fixture.componentInstance).toBeTruthy();
  });
});
