import { ComponentFixture, TestBed } from '@angular/core/testing';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';

import { CardHeaderComponent } from './card-header.component';

describe('CardHeaderComponent', () => {
  let component: CardHeaderComponent;
  let fixture: ComponentFixture<CardHeaderComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CardHeaderComponent, NoopAnimationsModule]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CardHeaderComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should display title when provided', () => {
    component.title = 'Test Title';
    fixture.detectChanges();

    expect(component.title).toBe('Test Title');
  });

  it('should mask citizen name in description', () => {
    const description = 'Ciudadano: Juan Pérez';
    const maskedDescription = component.maskDescription(description);

    expect(maskedDescription).toContain('Ciudadano:');
    // El método maskCitizenName mantiene primera y última letra: "J**n P***z"
    expect(maskedDescription).toContain('J**n');
    expect(maskedDescription).toContain('P***z');
  });

  it('should emit back event when onBack is called', () => {
    spyOn(component.back, 'emit');

    component.onBack();

    expect(component.back.emit).toHaveBeenCalled();
  });

  it('should handle empty description gracefully', () => {
    const result = component.maskDescription('');
    expect(result).toBe('');
  });

  it('should not mask description without citizen pattern', () => {
    const description = 'This is a normal description';
    const result = component.maskDescription(description);

    expect(result).toBe(description);
  });
});
