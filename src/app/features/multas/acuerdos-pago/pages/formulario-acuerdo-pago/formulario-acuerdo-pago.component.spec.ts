import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FormularioAcuerdoPagoComponent } from './formulario-acuerdo-pago.component';

describe('FormularioAcuerdoPagoComponent', () => {
  let component: FormularioAcuerdoPagoComponent;
  let fixture: ComponentFixture<FormularioAcuerdoPagoComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [FormularioAcuerdoPagoComponent]
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
