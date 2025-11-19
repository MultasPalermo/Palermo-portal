import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MultaCardComponent } from './multa-card.component';
import { PaymentAgreementSelectDto } from '../../../../../../../shared/modeloModelados/Entities/select/PaymentAgreementSelectDto';

describe('MultaCardComponent', () => {
  let component: MultaCardComponent;
  let fixture: ComponentFixture<MultaCardComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MultaCardComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(MultaCardComponent);
    component = fixture.componentInstance;

    // Mock the required input with all necessary fields
    component.multa = {
      id: 1,
      personName: 'Test Person',
      documentNumber: '12345678',
      documentType: 'CC',
      phoneNumber: '3001234567',
      email: 'test@test.com',
      address: 'Test Address',
      neighborhood: 'Test Neighborhood',
      infringement: 'Test Infringement',
      typeFine: 'Type A',
      valorSMDLV: 5,
      agreementStart: '2025-01-01',
      agreementEnd: '2025-12-31',
      expeditionCedula: '2020-01-01',
      paymentMethod: 'Monthly',
      frequencyPayment: 'Mensual',
      baseAmount: 1000000,
      accruedInterest: 0,
      outstandingAmount: 1000000,
      installments: 12,
      monthlyFee: 83333,
      isPaid: false,
      isCoactive: false,
      installmentSchedule: []
    };

    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
