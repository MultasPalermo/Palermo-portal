import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MultaCardComponent } from './multa-card.component';

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
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
