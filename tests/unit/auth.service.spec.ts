import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { Router } from '@angular/router';
import { AuthService } from '../../src/app/core/services/auth/auth.service';
import { UserStore } from '../../src/app/core/services/User.Store';
import { environment } from '../../src/environments/environment';

describe('AuthService', () => {
  let service: AuthService;
  let httpMock: HttpTestingController;
  let routerSpy: jasmine.SpyObj<Router>;
  let userStoreSpy: jasmine.SpyObj<UserStore>;

  beforeEach(() => {
    routerSpy = jasmine.createSpyObj('Router', ['navigate']);
    userStoreSpy = jasmine.createSpyObj('UserStore', ['setUser', 'clear']);

    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [
        AuthService,
        { provide: Router, useValue: routerSpy },
        { provide: UserStore, useValue: userStoreSpy }
      ]
    });

    service = TestBed.inject(AuthService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should send login request with correct credentials', () => {
    const mockCredentials = { email: 'test@test.com', password: 'password123' };
    const mockResponse = { isSuccess: true, message: 'Login exitoso' };

    service.loginEmail(mockCredentials).subscribe(response => {
      expect(response).toEqual(mockResponse);
    });

    const req = httpMock.expectOne(`${environment.apiURL}/Auth/login`);
    expect(req.request.method).toBe('POST');
    expect(req.request.body).toEqual(mockCredentials);
    req.flush(mockResponse);
  });

  it('should send register request with user data', () => {
    const mockUserData = {
      email: 'newuser@test.com',
      password: 'password123',
      firstName: 'Test',
      lastName: 'User'
    };
    const mockResponse = { isSuccess: true, message: 'Usuario registrado' };

    service.registrar(mockUserData as any).subscribe(response => {
      expect(response).toEqual(mockResponse);
    });

    const req = httpMock.expectOne(`${environment.apiURL}/Auth/register`);
    expect(req.request.method).toBe('POST');
    expect(req.request.body).toEqual(mockUserData);
    req.flush(mockResponse);
  });

  it('should handle logout correctly', () => {
    service.logout().subscribe();

    const req = httpMock.expectOne(`${environment.apiURL}/Auth/logout`);
    expect(req.request.method).toBe('POST');
    req.flush({});
  });

  it('should get current user info', () => {
    const mockUser = {
      id: 1,
      email: 'test@test.com',
      firstName: 'Test',
      lastName: 'User'
    };

    service.GetMe().subscribe(user => {
      expect(user).toEqual(mockUser);
    });

    const req = httpMock.expectOne(`${environment.apiURL}/Auth/me`);
    expect(req.request.method).toBe('GET');
    req.flush(mockUser);
  });
});
