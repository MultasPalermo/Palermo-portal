import { ComponentFixture, TestBed } from '@angular/core/testing';
import { AppTopbar } from './topbar.component';



describe('AppTopbar', () => {
  let component: AppTopbar;
  let fixture: ComponentFixture<AppTopbar>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AppTopbar]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AppTopbar);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
