import { ComponentFixture, TestBed } from '@angular/core/testing';
import { of } from 'rxjs';

import { DepartmentComponent } from './department.component';
import { ServiceGenericService } from '../../../core/services/utils/generic/service-generic.service';

import { RouterTestingModule } from '@angular/router/testing';
import { HttpClientTestingModule } from '@angular/common/http/testing';

import { NoopAnimationsModule } from '@angular/platform-browser/animations';

describe('DepartmentComponent', () => {
  let fixture: ComponentFixture<DepartmentComponent>;
  let serviceStub: jasmine.SpyObj<ServiceGenericService>;

  beforeEach(async () => {
    serviceStub = jasmine.createSpyObj('ServiceGenericService', [
      'getAll', 'get', 'post', 'put', 'delete', 'deleteLogic'
    ]);

    serviceStub.getAll.and.returnValue(of([]));

    await TestBed.configureTestingModule({
      imports: [
        DepartmentComponent,        // standalone
        RouterTestingModule,        
        HttpClientTestingModule,   
        NoopAnimationsModule       
      ],
      providers: [
        { provide: ServiceGenericService, useValue: serviceStub }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(DepartmentComponent);
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(fixture.componentInstance).toBeTruthy();
  });

  // (Opcional) valida que cargó el array vacío
  it('should load departments as empty array from stub', () => {
    expect(fixture.componentInstance.departamentos).toEqual([]);
    expect(serviceStub.getAll).toHaveBeenCalledWith('department', 'GetAll');
  });
});
