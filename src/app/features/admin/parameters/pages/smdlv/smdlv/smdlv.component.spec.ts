import { ComponentFixture, TestBed } from '@angular/core/testing';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';

import { SmdlvComponent } from './smdlv.component';

describe('SmdlvComponent', () => {
  let component: SmdlvComponent;
  let fixture: ComponentFixture<SmdlvComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [
        SmdlvComponent,
        HttpClientTestingModule,
        RouterTestingModule,
        NoopAnimationsModule
      ]
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
