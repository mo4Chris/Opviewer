import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { LogisticsSpecialistComponent } from './logistics-specialist.component';
import { AgmCoreModule } from '@agm/core';
import { HttpModule } from '@angular/http';
import { CommonService } from '../../../../../common.service';

describe('LogisticsSpecialistComponent', () => {
  let component: LogisticsSpecialistComponent;
  let fixture: ComponentFixture<LogisticsSpecialistComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ LogisticsSpecialistComponent ],
      imports: [
        AgmCoreModule.forRoot(),
        HttpModule],
      providers: [CommonService]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(LogisticsSpecialistComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
