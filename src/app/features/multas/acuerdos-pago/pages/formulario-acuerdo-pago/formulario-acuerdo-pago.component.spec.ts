import { ComponentFixture, TestBed } from '@angular/core/testing';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';

import { FormularioAcuerdoPagoComponent } from './formulario-acuerdo-pago.component';

describe('FormularioAcuerdoPagoComponent', () => {
  let component: FormularioAcuerdoPagoComponent;
  let fixture: ComponentFixture<FormularioAcuerdoPagoComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [
        FormularioAcuerdoPagoComponent,
        HttpClientTestingModule,
        RouterTestingModule,
        NoopAnimationsModule
      ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(FormularioAcuerdoPagoComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
