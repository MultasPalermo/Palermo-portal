import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AcuerdoCardComponent } from './acuerdo-card.component';

describe('AcuerdoCardComponent', () => {
  let component: AcuerdoCardComponent;
  let fixture: ComponentFixture<AcuerdoCardComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AcuerdoCardComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AcuerdoCardComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});