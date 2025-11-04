import { ComponentFixture, TestBed } from '@angular/core/testing';
import { of } from 'rxjs';

import { DocumentTypeComponent } from './document-type.component';
import { RouterTestingModule } from '@angular/router/testing';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { ServiceGenericService } from '../../../core/services/utils/generic/service-generic.service';

describe('DocumentTypeComponent', () => {
  let fixture: ComponentFixture<DocumentTypeComponent>;
  let apiStub: jasmine.SpyObj<ServiceGenericService>;

  beforeEach(async () => {
    apiStub = jasmine.createSpyObj('ServiceGenericService', ['getAll']);
    apiStub.getAll.and.returnValue(of([])); // 👈 array, no {data:[]}

    await TestBed.configureTestingModule({
      imports: [
        DocumentTypeComponent,
        RouterTestingModule,
        HttpClientTestingModule,
        NoopAnimationsModule
      ],
      providers: [
        { provide: ServiceGenericService, useValue: apiStub }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(DocumentTypeComponent);
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(fixture.componentInstance).toBeTruthy();
  });
});
