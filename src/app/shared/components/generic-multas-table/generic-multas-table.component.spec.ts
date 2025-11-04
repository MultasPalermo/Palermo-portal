import { ComponentFixture, TestBed } from '@angular/core/testing';
import { of } from 'rxjs';

import { GenericMultasTableComponent } from './generic-multas-table.component';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { ServiceGenericService } from '../../../core/services/utils/generic/service-generic.service';

describe('GenericMultasTableComponent', () => {
  let fixture: ComponentFixture<GenericMultasTableComponent>;
  let serviceStub: jasmine.SpyObj<ServiceGenericService>;

  beforeEach(async () => {
    serviceStub = jasmine.createSpyObj('ServiceGenericService', ['getAll', 'post', 'put', 'delete', 'deleteLogic']);
    // Ajusta según cómo el componente obtenga datos:
    serviceStub.getAll.and.returnValue(of([]));

    await TestBed.configureTestingModule({
      imports: [
        GenericMultasTableComponent,
        HttpClientTestingModule,
        NoopAnimationsModule
      ],
      providers: [
        { provide: ServiceGenericService, useValue: serviceStub }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(GenericMultasTableComponent);
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(fixture.componentInstance).toBeTruthy();
  });
});
