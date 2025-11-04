import { ComponentFixture, TestBed } from '@angular/core/testing';

import { NotificationMultasComponent } from './notification-multas.component';

describe('NotificationMultasComponent', () => {
  let component: NotificationMultasComponent;
  let fixture: ComponentFixture<NotificationMultasComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [NotificationMultasComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(NotificationMultasComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
