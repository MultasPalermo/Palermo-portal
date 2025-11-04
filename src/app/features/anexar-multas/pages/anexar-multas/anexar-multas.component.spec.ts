import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AnexarMultasComponent } from './anexar-multas.component';

describe('AnexarMultasComponent', () => {
  let component: AnexarMultasComponent;
  let fixture: ComponentFixture<AnexarMultasComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AnexarMultasComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AnexarMultasComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
