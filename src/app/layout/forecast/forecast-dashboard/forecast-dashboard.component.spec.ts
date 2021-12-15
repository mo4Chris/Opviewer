import { CommonModule } from '@angular/common';
import { waitForAsync, ComponentFixture, TestBed } from '@angular/core/testing';
import { FormsModule } from '@angular/forms';
import { RouterTestingModule } from '@angular/router/testing';
import { CommonService } from '@app/common.service';
import { PermissionService } from '@app/shared/permissions/permission.service';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { of } from 'rxjs';
import { ForecastDashboardUtilsService } from './forecast-dashboard-utils.service';
import { ForecastDashboardComponent } from './forecast-dashboard.component';
import { By } from '@angular/platform-browser';


describe('ForecastDashboardComponent', () => {
  let component: ForecastDashboardComponent;
  let fixture: ComponentFixture<ForecastDashboardComponent>;
  let commonServiceMock;
  let forecastDashboardUtilsServiceMock;
  let permissionServiceMock;
  let debugElement;
  beforeEach(waitForAsync(() => {
    forecastDashboardUtilsServiceMock = jasmine.createSpyObj('forecastDashboardUtilsService', ['createViewModel', 'sortProductList']);
    commonServiceMock = jasmine.createSpyObj('commonService', ['getForecastProjectList', 'getForecastClientList'])
    permissionServiceMock = jasmine.createSpyObj('permissionService', ['admin'])
    TestBed.configureTestingModule({
      declarations: [ForecastDashboardComponent],
      imports: [
        FormsModule,
        NgbModule,
        CommonModule,
        RouterTestingModule,
      ],
      providers: [
        { provide: PermissionService, useValue: permissionServiceMock },
        { provide: CommonService, useValue: commonServiceMock },
        { provide: ForecastDashboardUtilsService, useValue: forecastDashboardUtilsServiceMock }
      ]
    })
      .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ForecastDashboardComponent);
    component = fixture.componentInstance;
    debugElement = fixture.debugElement;
  });

  it('should create', () => {
    commonServiceMock.getForecastProjectList.and.returnValue(of([{}]))
    commonServiceMock.getForecastClientList.and.returnValue(of([{}]))
    forecastDashboardUtilsServiceMock.createViewModel.and.returnValue(of([{}]))
    fixture.detectChanges();
    expect(component).toBeTruthy()
  });

  describe('HTML Template testing',()=>{
    beforeEach(() => {
      const project = {
        "id": 1,
        "active": false,
        "nicename": "A video demo project",
      }

      const client = {
        "id": 1,
      }

      const combined = {
        ...project,
        client
      }
      commonServiceMock.getForecastProjectList.and.returnValue(of([{}]))
      commonServiceMock.getForecastClientList.and.returnValue(of([{}]))
      forecastDashboardUtilsServiceMock.createViewModel.and.returnValue(of([combined]));
      forecastDashboardUtilsServiceMock.sortProductList.and.returnValue([combined]);
    })

    it('should show the table for admin when admin is logged in', async () => {
      permissionServiceMock.admin = true;
      fixture.detectChanges();

      const result = debugElement.queryAll(By.css('th')).length
      const expected = 5;

      expect(result).toEqual(expected)
    });
    
    it('should show the table for non-admin when customer is logged in', async () => {
      permissionServiceMock.admin = false;

      fixture.detectChanges();

      const result = debugElement.queryAll(By.css('th')).length
      const expected = 3;

      expect(result).toEqual(expected)
    });
    
    it('should show rendering of data "nicename" in table ', async () => {
      permissionServiceMock.admin = false;

      fixture.detectChanges();

      const result = debugElement.queryAll(By.css('td'))[0].nativeElement.textContent
      const expected = 'A video demo project'

      expect(result).toEqual(expected)
    });
  })  
});
