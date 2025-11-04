// inicio.component.spec.ts
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { of } from 'rxjs';

import { InicioComponent } from './inicio.component';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { ServiceGenericService } from '../../../../core/services/utils/generic/service-generic.service';
import { TypeInfraction } from '../../../../shared/modeloModelados/Entities/TypeInfractionDto';



describe('InicioComponent', () => {
  let fixture: ComponentFixture<InicioComponent>;
  let serviceStub: jasmine.SpyObj<ServiceGenericService>;

  beforeEach(async () => {
    // Crea el stub solo con lo que usa el componente: getAll
    serviceStub = jasmine.createSpyObj('ServiceGenericService', ['getAll']);

    // 👇 InicioComponent hace this.api.getAll<TypeInfractionSelectDto>(...)
    // getAll<T> → Observable<T[]>  => ¡debe devolver un ARRAY!
    const fakeData: TypeInfraction[] = [
      {
        // pon solo los campos que tu template/ts usa
        type_Infraction: 'Velocidad',      // agrupa por este campo
        numer_smldv: 2,                    // se muestra como "2 SMLDV"
        description: 'Exceso de velocidad' // texto
      } as any
    ];
    serviceStub.getAll.and.returnValue(of(fakeData));

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
    expect(comp.categories.length).toBeGreaterThan(0);
    expect(comp.categories[0].title).toBe('Velocidad');
    expect(comp.categories[0].items[0].title).toContain('SMLDV'); // "2 SMLDV"
  });
});
