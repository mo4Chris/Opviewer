import { waitForAsync, ComponentFixture, TestBed } from '@angular/core/testing';
import { SovTurbineTransfersComponent } from './sov-turbine-transfers.component';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { CommonModule } from '@angular/common';
import { MockedCommonServiceProvider } from '@app/supportModules/mocked.common.service';
import { NgMultiSelectDropDownModule } from 'ng-multiselect-dropdown';
import { FormsModule } from '@angular/forms';
import { MockedUserServiceProvider } from '@app/shared/services/test.user.service';
import { assertTableEqualRowLength } from '@app/layout/layout.component.spec';

describe('SovTurbineTransfersComponent', () => {
  let component: SovTurbineTransfersComponent;
  let fixture: ComponentFixture<SovTurbineTransfersComponent>;
  let saveSpy: jasmine.Spy;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      imports: [
        NgbModule,
        CommonModule,
        FormsModule,
        NgMultiSelectDropDownModule,
      ],
      declarations: [ SovTurbineTransfersComponent ],
      providers: [
        MockedCommonServiceProvider,
        MockedUserServiceProvider,
      ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    saveSpy = spyOn(SovTurbineTransfersComponent.prototype, 'saveStats');

    fixture = TestBed.createComponent(SovTurbineTransfersComponent);
    component = fixture.componentInstance;

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

  it('should run ngOnChanges', () => {
    component.ngOnChanges();
    expect(component).toBeTruthy();
  });

  it('Should save stats', () => {
    expect(saveSpy).toHaveBeenCalledTimes(0);
    component.saveAllTurbineTransfers();
    expect(saveSpy).toHaveBeenCalledTimes(2 + component.turbineTransfers.length);
  });

  it('should have equal row length in readonly mode', () => {
    component.v2vPaxCargoTotals = {cargoIn: 1, cargoOut: 2, paxIn: 3, paxOut: 4};
    component.missedPaxCargo = [{
      location: 'test',
      from: {hour: "10", minutes: "2"},
      to: {hour: "10", minutes: "12"},
      cargoIn: 0, cargoOut: 3,
      paxIn: 5, paxOut: 10,
    }]
    component.helicopterPaxCargo = [{
      from: {hour: "10", minutes: "2"},
      to: {hour: "10", minutes: "12"},
      cargoIn: 0, cargoOut: 3,
      paxIn: 5, paxOut: 10,
    }]
    component.readonly = true;
    component.updatePaxCargoTotal();
    fixture.detectChanges();
    const table = document.querySelector('table');
    assertTableEqualRowLength(table as HTMLElement)
  })

  it('should have equal row length in edit mode', () => {
    component.v2vPaxCargoTotals = {cargoIn: 1, cargoOut: 2, paxIn: 3, paxOut: 4};
    component.missedPaxCargo = [{
      location: 'test',
      from: {hour: "10", minutes: "2"},
      to: {hour: "10", minutes: "12"},
      cargoIn: 0, cargoOut: 3,
      paxIn: 5, paxOut: 10,
    }]
    component.helicopterPaxCargo = [{
      from: {hour: "10", minutes: "2"},
      to: {hour: "10", minutes: "12"},
      cargoIn: 0, cargoOut: 3,
      paxIn: 5, paxOut: 10,
    }]
    component.readonly = false;
    component.updatePaxCargoTotal();
    fixture.detectChanges();
    const table = document.querySelector('table');
    assertTableEqualRowLength(table as HTMLElement)
  })
});
