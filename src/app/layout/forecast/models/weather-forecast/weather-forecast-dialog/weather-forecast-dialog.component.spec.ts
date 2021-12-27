import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ReactiveFormsModule } from '@angular/forms';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { of } from 'rxjs';
import { WeatherForecastDialogUtilsService } from './weather-forecast-dialog-utils.service';

import { WeatherForecastDialogComponent } from './weather-forecast-dialog.component';

describe('WeatherForecastDialogComponent', () => {
  let component: WeatherForecastDialogComponent;
  let fixture: ComponentFixture<WeatherForecastDialogComponent>;
  let weatherForecastDialogUtilsServiceMock;
  beforeEach(async () => {
    weatherForecastDialogUtilsServiceMock = jasmine.createSpyObj('WeatherForecastDialogUtilsService', ['getFilteredFormValues'])
    await TestBed.configureTestingModule({
      imports: [ReactiveFormsModule],
      declarations: [ WeatherForecastDialogComponent ],
      providers: [{ provide: NgbActiveModal, useValue: {} },{
        provide: WeatherForecastDialogUtilsService, useValue: weatherForecastDialogUtilsServiceMock
      }]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(WeatherForecastDialogComponent);
    component = fixture.componentInstance;
  });
  
  it('should create', () => {
    component.fromParent = [{
      "Provider": "INFOPLAZA",
      "Received_On": "2021-08-06T05:59:00",
      "Latitude": "55.67",
      "Longitude": "7.83",
      "File_Id": "FC_mat"
  }]
    weatherForecastDialogUtilsServiceMock.getFilteredFormValues.and.returnValue(of([]))
    fixture.detectChanges();
    expect(component).toBeTruthy();
  });
});
