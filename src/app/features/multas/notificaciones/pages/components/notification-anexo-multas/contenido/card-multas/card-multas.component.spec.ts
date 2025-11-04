import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CardMultasComponent } from './card-multas.component';

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
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
