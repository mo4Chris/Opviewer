import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { VesselreportComponent } from './vesselreport.component';
import { AgmCoreModule } from '@agm/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { PageHeaderModule } from '../../shared';
import { CommonService } from '../../common.service';
import { RouterTestingModule } from '@angular/router/testing';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { HttpModule } from '@angular/http';

describe('VesselreportComponent', () => {
  let component: VesselreportComponent;
  let fixture: ComponentFixture<VesselreportComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [        
        AgmCoreModule.forRoot(),
        FormsModule,
        ReactiveFormsModule,
        NgbModule.forRoot(),
        PageHeaderModule,
        RouterTestingModule,
        BrowserAnimationsModule,
        HttpModule],
      declarations: [ VesselreportComponent ],
      providers: [CommonService]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(VesselreportComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  // it('should create', () => {
  //   expect(component).toBeTruthy();
  // });
});
