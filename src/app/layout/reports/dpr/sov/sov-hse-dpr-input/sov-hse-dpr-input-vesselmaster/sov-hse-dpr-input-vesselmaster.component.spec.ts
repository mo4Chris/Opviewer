import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MockedCommonServiceProvider } from '@app/supportModules/mocked.common.service';
import { SharedPipesModule } from '@app/shared';
import { SovHseDprInputVesselmasterComponent } from './sov-hse-dpr-input-vesselmaster.component';
import { SupportModelModule } from '@app/models/support-model.module';

describe('SovHseDprInputVesselmasterComponent', () => {
  let component: SovHseDprInputVesselmasterComponent;
  let fixture: ComponentFixture<SovHseDprInputVesselmasterComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [
        CommonModule,
        FormsModule,
        ReactiveFormsModule,
        SharedPipesModule,
        SupportModelModule,
      ],
      declarations: [ SovHseDprInputVesselmasterComponent ],
      providers: [
        MockedCommonServiceProvider
      ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    spyOn(SovHseDprInputVesselmasterComponent.prototype, 'saveHseDprInformation');

    fixture = TestBed.createComponent(SovHseDprInputVesselmasterComponent);
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
