import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { VesselMasterComponent } from './vessel-master.component';
import { AgmCoreModule } from '@agm/core';
import { CommonService } from '../../../../../common.service';
import { HttpModule } from '@angular/http';

describe('VesselMasterComponent', () => {
  let component: VesselMasterComponent;
  let fixture: ComponentFixture<VesselMasterComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ VesselMasterComponent ],
      imports: [
        AgmCoreModule.forRoot(),
        HttpModule],
      providers: [CommonService]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(VesselMasterComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
