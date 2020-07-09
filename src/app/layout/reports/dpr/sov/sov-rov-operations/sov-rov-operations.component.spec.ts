// import { async, ComponentFixture, TestBed } from '@angular/core/testing';

// import { SovDcTransfersComponent } from './sov-rov-operations.component';
// import { CommonModule } from '@angular/common';
// import { MockedCommonService, MockedCommonServiceProvider } from '@app/supportModules/mocked.common.service';
// import { UserTestService } from '@app/shared/services/test.user.service';
// import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
// import { FormsModule } from '@angular/forms';

// describe('SovDcTransfersComponent', () => {
//   let component: SovDcTransfersComponent;
//   let fixture: ComponentFixture<SovDcTransfersComponent>;
//   const mocked = new MockedCommonService();

//   beforeEach(async(() => {
//     TestBed.configureTestingModule({
//       declarations: [ SovDcTransfersComponent ],
//       imports: [
//         CommonModule,
//         NgbModule,
//         FormsModule,
//       ],
//       providers: [
//         MockedCommonServiceProvider
//       ]
//     })
//     .compileComponents();
//   }));

//   beforeEach(() => {
//     fixture = TestBed.createComponent(SovDcTransfersComponent);
//     component = fixture.componentInstance;
//     component.readonly = true;
//     component.vessel2vessels = [{
//       transfers: [],
//       CTVactivity: [],
//       date: 737700,
//       mmsi: 987654321
//     }];
//     component.sovInfo = [];
//     component.vesselObject = {
//       mmsi: 987654321,
//       date: 737700,
//       vesselType: 'OSV',
//       vesselName: 'Test SOV'
//     };
//     fixture.detectChanges();
//   });

//   it('should create empty', () => {
//     component.vessel2vessels = [];
//     fixture.detectChanges();
//     expect(component).toBeTruthy();
//   });

//   it('should create read only', () => {
//     expect(component).toBeTruthy();

//     component.ngOnChanges();
//     expect(component).toBeTruthy();

//     setV2V(component);
//     component.ngOnChanges();
//     expect(component).toBeTruthy();
//   });

//   it('should create with write rights', () => {
//     component.readonly = false;
//     component.ngOnChanges();
//     expect(component).toBeTruthy();

//     setV2V(component);
//     component.ngOnChanges();
//     expect(component).toBeTruthy();
//   });
// });

// function setV2V(component: SovDcTransfersComponent) {
//   component.vessel2vessels[0].CTVactivity = [{
//     turbineVisits: [],
//     map: null,
//     mmsi: 123456789,
//     date: 737700
//   }];
//   component.vessel2vessels[0].transfers = [{
//     mmsi: component.vesselObject.mmsi,
//     vesselname: component.vesselObject.vesselName,
//     toMMSI: 123456789,
//     toVesselname: 'TEST DAUGHTERCRAFT',
//     startTime: 737700.1,
//     stopTime: 737700.2,
//     duration: 2.4,
//     Hs: null,
//     Ts: null,
//     DPutilisation: null,
//     peakHeave: '',
//     peakWindAvg: '',
//     peakWindGust: '',
//     current: null,
//     type: 'Daughter-craft departure',
//     turbineActivity: '',
//     paxIn: 0,
//     paxOut: 0,
//     cargoIn: 0,
//     cargoOut: 0,
//   }];
// }
