import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { MarineControllerComponent } from './marine-controller.component';
import { AgmCoreModule } from '@agm/core';
import { HttpModule } from '@angular/http';
import { CommonService } from '../../../../../common.service';

describe('MarineControllerComponent', () => {
  let component: MarineControllerComponent;
  let fixture: ComponentFixture<MarineControllerComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ MarineControllerComponent ],
      imports: [
        AgmCoreModule.forRoot(),
        HttpModule],
      providers: [CommonService]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(MarineControllerComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
