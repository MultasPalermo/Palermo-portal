import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SmdlvComponent } from './smdlv.component';

describe('SmdlvComponent', () => {
  let component: SmdlvComponent;
  let fixture: ComponentFixture<SmdlvComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SmdlvComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(SmdlvComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
