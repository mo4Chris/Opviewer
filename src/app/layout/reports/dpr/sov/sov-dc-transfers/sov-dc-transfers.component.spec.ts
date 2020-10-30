import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { SovDcTransfersComponent } from './sov-dc-transfers.component';
import { CommonModule } from '@angular/common';
import { MockedCommonService, MockedCommonServiceProvider } from '@app/supportModules/mocked.common.service';
import { UserTestService } from '@app/shared/services/test.user.service';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { FormsModule } from '@angular/forms';
import { mockedObservable } from '@app/models/testObservable';

describe('SovDcTransfersComponent', () => {
  let component: SovDcTransfersComponent;
  let fixture: ComponentFixture<SovDcTransfersComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ SovDcTransfersComponent ],
      imports: [
        CommonModule,
        NgbModule,
        FormsModule,
      ],
      providers: [
        MockedCommonServiceProvider
      ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(SovDcTransfersComponent);
    component = fixture.componentInstance;
    component.readonly = true;
    component.vessel2vessels = [{
      transfers: [],
      CTVactivity: [],
      date: 737700,
      mmsi: 987654321
    }];
    component.sovInfo = [];
    component.vesselObject = {
      mmsi: 987654321,
      date: 737700,
      vesselType: 'OSV',
      vesselName: 'Test SOV'
    };
    component.dcInfo = {
      mmsi: 123456789,
      nicename: 'TEST DAUGHTERCRAFT',
    }
    fixture.detectChanges();
  });

  it('should create empty', () => {
    component.vessel2vessels = [];
    fixture.detectChanges();
    expect(component).toBeTruthy();
    component.ngOnChanges();
    expect(component.missedTransfers.length).toBe(0);
    expect(component.transfers.length).toBe(0);
  });

  it('should be disabled if no DC is present', () => {
    component.dcInfo = null;
    setV2V(component);
    component.ngOnChanges();
    expect(component.transfers.length).toBe(0);
  })

  it('should add transfers', () => {
    component.readonly = false;
    component.ngOnChanges();
    expect(component).toBeTruthy();

    setV2V(component);
    component.ngOnChanges();
    expect(component).toBeTruthy();
    expect(component.transfers.length).toBeGreaterThan(0);
  });

  it('should allow for adding new transfers', () => {
    let saveSpy = spyOn(MockedCommonService.prototype, 'updateSOVv2vTurbineTransfers')
      .and.returnValue(mockedObservable('TEST'))

    component.addMissedTransferToArray();
    expect(component.missedTransfers.length).toBe(1);
    expect(saveSpy).not.toHaveBeenCalled();

    component.saveTransfers();
    expect(saveSpy).toHaveBeenCalled();
  })
});

function setV2V(component: SovDcTransfersComponent) {
  component.vessel2vessels[0].CTVactivity = [{
    turbineVisits: [{
      startTime: 1,
      stopTime: 2,
      location: 'test',
      durationMinutes: 10,
      fieldname: 'fake farm'
    }],
    map: null,
    mmsi: 123456789,
    date: 737700
  }];
  component.vessel2vessels[0].transfers = [{
    mmsi: component.vesselObject.mmsi,
    vesselname: component.vesselObject.vesselName,
    toMMSI: 123456789,
    toVesselname: 'TEST DAUGHTERCRAFT',
    startTime: 737700.1,
    stopTime: 737700.2,
    duration: 2.4,
    Hs: null,
    Ts: null,
    DPutilisation: null,
    peakHeave: '',
    peakWindAvg: '',
    peakWindGust: '',
    current: null,
    type: 'Daughter-craft departure',
    turbineActivity: '',
    paxIn: 0,
    paxOut: 0,
    cargoIn: 0,
    cargoOut: 0,
  }];
}
