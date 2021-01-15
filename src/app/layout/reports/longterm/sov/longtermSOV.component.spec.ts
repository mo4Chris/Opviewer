import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { MockedCommonService, MockedCommonServiceProvider } from '@app/supportModules/mocked.common.service';
import { LongtermSOVComponent } from './longtermSOV.component';

describe('LongtermSovComponent', () => {
  let component: LongtermSOVComponent;
  let fixture: ComponentFixture<LongtermSOVComponent>;
  const mockedCommonService = new MockedCommonService();
  const defaultVessel = mockedCommonService.getVesselDefault();


  // ToDo: implement usefull tests here
});
