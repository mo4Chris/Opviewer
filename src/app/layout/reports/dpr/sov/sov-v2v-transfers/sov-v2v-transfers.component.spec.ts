import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { SovV2vTransfersComponent } from './sov-v2v-transfers.component';
import { CommonModule } from '@angular/common';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { NgMultiSelectDropDownModule } from 'ng-multiselect-dropdown';
import { FormsModule } from '@angular/forms';
import { MockedCommonServiceProvider, MockedCommonService } from '@app/supportModules/mocked.common.service';
import { SharedPipesModule } from '@app/shared';
import { AgmCoreModule } from '@agm/core';
import { MockedUserServiceProvider } from '@app/shared/services/test.user.service';

describe('SovV2vTransfersComponent', () => {
  let component: SovV2vTransfersComponent;
  let fixture: ComponentFixture<SovV2vTransfersComponent>;
  let saveSpy: jasmine.Spy;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [
        NgbModule,
        CommonModule,
        FormsModule,
        NgMultiSelectDropDownModule,
        AgmCoreModule,
        SharedPipesModule,
      ],
      declarations: [ SovV2vTransfersComponent ],
      providers: [
        MockedCommonServiceProvider,
        MockedUserServiceProvider,
      ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    saveSpy = spyOn(MockedCommonService.prototype, 'updateSOVv2vPaxInput').and.callThrough();

    fixture = TestBed.createComponent(SovV2vTransfersComponent);
    component = fixture.componentInstance;

    component.vesselObject = {
      mmsi: 987654321,
      date: 737700,
      vesselType: 'OSV',
      vesselName: 'Test SOV'
    };
    component.vessel2vessels = [{
      mmsi: 123456789,
      date: 737700,
      transfers: [],
      CTVactivity: [],
    }];

    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should run ngOnChanges', () => {
    component.ngOnChanges();
    expect(component).toBeTruthy();
  });

  it('Should save stats', () => {
    expect(saveSpy).toHaveBeenCalledTimes(0);
    component.savev2vPaxInput();
    expect(saveSpy).toHaveBeenCalledTimes(1);
  });
});
