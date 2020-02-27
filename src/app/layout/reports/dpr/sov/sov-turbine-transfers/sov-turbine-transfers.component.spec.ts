import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { SovTurbineTransfersComponent } from './sov-turbine-transfers.component';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { CommonModule } from '@angular/common';
import { MockedCommonServiceProvider } from '@app/supportModules/mocked.common.service';
import { NgMultiSelectDropDownModule } from 'ng-multiselect-dropdown';
import { FormsModule } from '@angular/forms';

describe('SovTurbineTransfersComponent', () => {
  let component: SovTurbineTransfersComponent;
  let fixture: ComponentFixture<SovTurbineTransfersComponent>;
  let saveSpy: jasmine.Spy;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [
        NgbModule,
        CommonModule,
        FormsModule,
        NgMultiSelectDropDownModule,
      ],
      declarations: [ SovTurbineTransfersComponent ],
      providers: [
        MockedCommonServiceProvider
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

  it('should run ngOnChanges', (done) => {
    component.ngOnChanges();
    expect(component).toBeTruthy();
    done();
  });

  it('Should save stats', (done) => {
    expect(saveSpy).toHaveBeenCalledTimes(0);
    component.saveAllTurbineTransfers();
    expect(saveSpy).toHaveBeenCalledTimes(2 + component.turbineTransfers.length);
    done();
  });
});
