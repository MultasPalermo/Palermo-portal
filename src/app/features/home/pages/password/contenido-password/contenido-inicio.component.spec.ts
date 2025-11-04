import { ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';
import { of } from 'rxjs';
import { delay } from 'rxjs/operators';
import { Router } from '@angular/router';

import { ContenidoInicioComponent } from '../../password/contenido-password/contenido-inicio.component';
import { RouterTestingModule } from '@angular/router/testing';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';

import { ServiceGenericService } from '../../../../../core/services/servicesGeneric/service-generic.service';
import { SessionPingService } from '../../../../../core/services/session-ping.service';

describe('ContenidoInicioComponent', () => {
  let fixture: ComponentFixture<ContenidoInicioComponent>;
  let apiStub: jasmine.SpyObj<ServiceGenericService>;
  let pingStub: jasmine.SpyObj<SessionPingService>;
  let router: Router;
  let alertSpy: jasmine.Spy<(msg?: any) => void>;

  beforeEach(async () => {
    apiStub  = jasmine.createSpyObj('ServiceGenericService', ['getMultasByDocument']);
    pingStub = jasmine.createSpyObj('SessionPingService', ['start', 'stop']);

    await TestBed.configureTestingModule({
      imports: [ContenidoInicioComponent, RouterTestingModule, HttpClientTestingModule, NoopAnimationsModule],
      providers: [
        { provide: ServiceGenericService, useValue: apiStub },
        { provide: SessionPingService,  useValue: pingStub }
      ]
    }).compileComponents();

    router = TestBed.inject(Router);
    spyOn(router, 'getCurrentNavigation').and.returnValue(null as any);

    alertSpy = spyOn(window, 'alert').and.stub(); // silenciar

    sessionStorage.clear();
    sessionStorage.setItem('docTypeId', '1');
    sessionStorage.setItem('docNumber', '123456');

    fixture = TestBed.createComponent(ContenidoInicioComponent);
  });

  it('should create (con datos)', fakeAsync(() => {
    apiStub.getMultasByDocument.and.returnValue(of({
      isSuccess: true, count: 1,
      data: [{
        typeInfractionName: 'Velocidad',
        dateInfraction: '2025-09-01',
        observations: 'Exceso de velocidad',
        stateInfraction: false,
        firstName: 'Camilo', lastName: 'Andrés'
      }]
    }).pipe(delay(0))); // <-- asíncrono

    fixture.detectChanges(); // ngOnInit
    tick(0);                 // <-- avanza delay(0)
    fixture.detectChanges();

    const comp = fixture.componentInstance;
    expect(apiStub.getMultasByDocument).toHaveBeenCalledWith(1, '123456');
    expect(pingStub.start).toHaveBeenCalled();
    expect(comp.multas.length).toBe(1);
    expect(comp.ciudadano).toBe('Camilo Andrés');
    expect(alertSpy).not.toHaveBeenCalled();
  }));
});
