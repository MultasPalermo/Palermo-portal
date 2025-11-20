import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { DocumentTypeService } from '../../src/app/core/services/parameters/document-type.service';
import { ServiceGenericService } from '../../src/app/core/services/utils/generic/service-generic.service';

describe('DocumentTypeService', () => {
  let service: DocumentTypeService;
  let genericService: ServiceGenericService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [DocumentTypeService, ServiceGenericService]
    });

    service = TestBed.inject(DocumentTypeService);
    genericService = TestBed.inject(ServiceGenericService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should have correct endpoint', () => {
    expect(service.endpoint).toBe('documentType');
  });

  it('should have access to genericService', () => {
    expect(service.genericService).toBeTruthy();
    expect(service.genericService).toBeInstanceOf(ServiceGenericService);
  });
});
