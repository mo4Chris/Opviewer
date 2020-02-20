import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { SovHseDprInputReadonlyComponent } from './sov-hse-dpr-input-readonly.component';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MockedCommonServiceProvider } from '@app/supportModules/mocked.common.service';
import { SharedPipesModule } from '@app/shared';
import { NgbAlertModule, NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { SupportModelModule } from '@app/models/support-model.module';

describe('SovHseDprInputReadonlyComponent', () => {
  let component: SovHseDprInputReadonlyComponent;
  let fixture: ComponentFixture<SovHseDprInputReadonlyComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [
        CommonModule,
        FormsModule,
        ReactiveFormsModule,
        SharedPipesModule,
        NgbAlertModule,
        SupportModelModule,
        NgbModule,
      ],
      declarations: [ SovHseDprInputReadonlyComponent ],
      providers: [
        MockedCommonServiceProvider
      ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(SovHseDprInputReadonlyComponent);
    component = fixture.componentInstance;
    component.vesselObject = {
      date: 737700,
      mmsi: 987654321,
      vesselType: 'OSV'
    };
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
