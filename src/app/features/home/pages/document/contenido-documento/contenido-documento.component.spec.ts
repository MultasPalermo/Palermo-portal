import { ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';
import { of } from 'rxjs';
import { delay } from 'rxjs/operators';
import { Router } from '@angular/router';

import { ContenidoDocumentoComponent } from './contenido-documento.component';
import { RouterTestingModule } from '@angular/router/testing';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';

import { DocumentSessionService } from '../../../../../core/services/documents/document-session.service';
import { SessionPingService } from '../../../../../core/services/utils/session-ping.service';

describe('ContenidoDocumentoComponent', () => {
  let fixture: ComponentFixture<ContenidoDocumentoComponent>;
  let apiStub: jasmine.SpyObj<DocumentSessionService>;
  let pingStub: jasmine.SpyObj<SessionPingService>;
  let router: Router;
  let alertSpy: jasmine.Spy<(msg?: any) => void>;

  beforeEach(async () => {
    apiStub  = jasmine.createSpyObj('DocumentSessionService', ['getMultasByDocument', 'logout']);
    pingStub = jasmine.createSpyObj('SessionPingService', ['start', 'stop']);

    await TestBed.configureTestingModule({
      imports: [ContenidoDocumentoComponent, RouterTestingModule, HttpClientTestingModule, NoopAnimationsModule],
      providers: [
        { provide: DocumentSessionService, useValue: apiStub },
        { provide: SessionPingService,  useValue: pingStub }
      ]
    }).compileComponents();

    router = TestBed.inject(Router);
    spyOn(router, 'getCurrentNavigation').and.returnValue(null as any);

    alertSpy = spyOn(window, 'alert').and.stub();

    sessionStorage.setItem('docTypeId', '1');
    sessionStorage.setItem('docNumber', '123456');

    fixture = TestBed.createComponent(ContenidoDocumentoComponent);
  });

  it('should create (con datos)', fakeAsync(() => {
    apiStub.getMultasByDocument.and.returnValue(of({
      isSuccess: true,
      count: 1,
      data: [{
        typeInfractionName: 'Velocidad',
        dateInfraction: '2025-09-01',
        observations: 'Exceso de velocidad',
        stateInfraction: false,
        firstName: 'Camilo', lastName: 'Andrés'
      }]
    }).pipe(delay(0)));

    fixture.detectChanges(); // ngOnInit
    tick(0);                 // avanza delay(0)
    fixture.detectChanges();

    const comp = fixture.componentInstance;
    expect(comp.multas.length).toBe(1);
    expect(comp.ciudadano).toBe('Camilo Andrés');
    expect(pingStub.start).toHaveBeenCalled();
    expect(alertSpy).not.toHaveBeenCalled();
  }));
});
