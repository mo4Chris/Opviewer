import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { NgbModule, NgbAlertModule } from '@ng-bootstrap/ng-bootstrap';

import { AlertComponent } from './alert.component';
// import * as alertBackend from '@app/layout/bs-component/components/alert/alert.component';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { PageHeaderModule } from '@app/shared';
import { RouterTestingModule } from '@angular/router/testing';

describe('BS Alert Component', () => {
  let component: AlertComponent;
  let fixture: ComponentFixture<AlertComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [
        NgbModule,
      ],
      declarations: [
        AlertComponent,
      ],
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(AlertComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
