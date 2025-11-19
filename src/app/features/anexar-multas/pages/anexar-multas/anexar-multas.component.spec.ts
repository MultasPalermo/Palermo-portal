import { ComponentFixture, TestBed } from '@angular/core/testing';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';

import { AnexarMultasComponent } from './anexar-multas.component';

describe('AnexarMultasComponent', () => {
  let component: AnexarMultasComponent;
  let fixture: ComponentFixture<AnexarMultasComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [
        AnexarMultasComponent,
        HttpClientTestingModule,
        RouterTestingModule,
        NoopAnimationsModule
      ]
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
