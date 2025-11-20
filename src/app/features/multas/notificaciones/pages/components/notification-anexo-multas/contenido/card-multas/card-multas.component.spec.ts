import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CardMultasComponent } from './card-multas.component';
import { UserInfractionSelectDto } from '../../../../../../../../shared/modeloModelados/Entities/select/UserInfractionSelectDto';

describe('CardMultasComponent', () => {
  let component: CardMultasComponent;
  let fixture: ComponentFixture<CardMultasComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CardMultasComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CardMultasComponent);
    component = fixture.componentInstance;

    // Mock the required input
    component.multa = {
      id: 1,
      dateInfraction: '2025-01-01',
      stateInfraction: 0,
      userId: 1,
      typeInfractionId: 1,
      userNotificationId: 1,
      firstName: 'Test',
      lastName: 'User',
      typeInfractionName: 'Velocidad',
      documentNumber: '12345678',
      observations: 'Test observation',
      amountToPay: 100000,
      tipo: 'Velocidad',
      fecha: '2025-01-01',
      descripcion: 'Test description',
      estado: 'Pendiente'
    };

    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
