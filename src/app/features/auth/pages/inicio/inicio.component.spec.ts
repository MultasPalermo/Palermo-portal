// inicio.component.spec.ts
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { of } from 'rxjs';

import { InicioComponent } from './inicio.component';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { ServiceGenericService } from '../../../../core/services/utils/generic/service-generic.service';



describe('InicioComponent', () => {
  let fixture: ComponentFixture<InicioComponent>;
  let serviceStub: jasmine.SpyObj<ServiceGenericService>;

  beforeEach(async () => {
    // Crea el stub solo con lo que usa el componente: getAll
    serviceStub = jasmine.createSpyObj('ServiceGenericService', ['getAll']);

    // Mock data for TypeInfraction
    const fakeTypes = [
      {
        name: 'Velocidad',
        typeInfractionName: 'Velocidad'
      }
    ];

    // Mock data for Infraction
    const fakeInfractions = [
      {
        typeInfractionName: 'Velocidad',
        description: 'Exceso de velocidad',
        numer_smldv: 2
      }
    ];

    // Setup spy to return different values based on the endpoint
    serviceStub.getAll.and.callFake(((endpoint: string) => {
      if (endpoint === 'TypeInfraction') {
        return of(fakeTypes);
      } else if (endpoint === 'Infraction') {
        return of(fakeInfractions);
      }
      return of([]);
    }) as any);

    await TestBed.configureTestingModule({
      imports: [
        InicioComponent,         // standalone
        HttpClientTestingModule, // ✅ provee HttpClient en tests
        RouterTestingModule,     // por si usa Router en template/handlers
        NoopAnimationsModule     // evita flakiness con Material
      ],
      providers: [
        { provide: ServiceGenericService, useValue: serviceStub }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(InicioComponent);
    fixture.detectChanges(); // ngOnInit -> loadTypeInfractions() -> getAll()
  });

  it('should create', () => {
    expect(fixture.componentInstance).toBeTruthy();
  });

  // (Opcional) verifica que se cargaron categorías
  it('should load and group infractions into categories', () => {
    const comp = fixture.componentInstance;
    expect(serviceStub.getAll).toHaveBeenCalledWith('TypeInfraction');
    expect(serviceStub.getAll).toHaveBeenCalledWith('Infraction');
    expect(comp.categories.length).toBeGreaterThan(0);
    expect(comp.categories[0].title).toBe('Velocidad');
    expect(comp.categories[0].items[0].text).toContain('SMLDV'); // "Valor SMLDV: 2 - ..."
  });
});
