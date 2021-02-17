import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { SovPlatformTransfersComponent } from './sov-platform-transfers.component';
import { MockedCommonServiceProvider } from '@app/supportModules/mocked.common.service';
import { SharedPipesModule } from '@app/shared';
import { NgMultiSelectDropDownModule } from 'ng-multiselect-dropdown';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { MockedUserServiceProvider } from '@app/shared/services/test.user.service';
import { testBrokenHelpButtons, testEmptyTooltips } from '@app/layout/forecast/forecast-new-vessel/forecast-new-vessel.component.spec';

describe('SovPlatformTransfersComponent', () => {
  let component: SovPlatformTransfersComponent;
  let fixture: ComponentFixture<SovPlatformTransfersComponent>;
  let saveSpy: jasmine.Spy;


  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [
        NgbModule,
        CommonModule,
        FormsModule,
        NgMultiSelectDropDownModule,
        SharedPipesModule,
      ],
      declarations: [ SovPlatformTransfersComponent ],
      providers: [
        MockedCommonServiceProvider,
        MockedUserServiceProvider,
      ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    saveSpy = spyOn(SovPlatformTransfersComponent.prototype, 'saveStats');

    fixture = TestBed.createComponent(SovPlatformTransfersComponent);
    component = fixture.componentInstance;

    component.v2vPaxCargoTotals = {
      cargoIn: 0,
      cargoOut: 0,
      paxIn: 0,
      paxOut: 0
    };
    component.vesselObject = {
      mmsi: 987654321,
      date: 737700,
      vesselType: 'OSV',
      vesselName: 'Test SOV'
    };

    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should run ngOnChanges', (done) => {
    component.ngOnChanges();
    expect(component).toBeTruthy();
    done();
  });

  it('Should save stats', (done) => {
    expect(saveSpy).toHaveBeenCalledTimes(0);
    component.saveAllPlatformTransfers();
    expect(saveSpy).toHaveBeenCalledTimes(2 + component.platformTransfers.length);
    done();
  });

  it('should not have any broken help buttons', testBrokenHelpButtons(() => fixture))

  it('should not have any broken tooltips', testEmptyTooltips(() => fixture))
});
