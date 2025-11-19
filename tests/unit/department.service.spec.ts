import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { DepartmentService } from '../../src/app/core/services/parameters/department.service';
import { ServiceGenericService } from '../../src/app/core/services/utils/generic/service-generic.service';

describe('DepartmentService', () => {
  let service: DepartmentService;
  let genericService: ServiceGenericService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [DepartmentService, ServiceGenericService]
    });

    service = TestBed.inject(DepartmentService);
    genericService = TestBed.inject(ServiceGenericService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should have correct endpoint', () => {
    expect(service.endpoint).toBe('department');
  });

  it('should have access to genericService', () => {
    expect(service.genericService).toBeTruthy();
    expect(service.genericService).toBeInstanceOf(ServiceGenericService);
  });
});
