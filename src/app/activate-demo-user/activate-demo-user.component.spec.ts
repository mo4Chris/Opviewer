import { HttpClientTestingModule } from '@angular/common/http/testing';
import { waitForAsync, ComponentFixture, TestBed } from '@angular/core/testing';
import { Router } from '@angular/router';
import { RouterTestingModule } from "@angular/router/testing";
import { ActivatedRoute } from '@angular/router';
import { CommonService } from '@app/common.service';
import { AlertService } from '@app/supportModules/alert.service';
import { RouterService } from '@app/supportModules/router.service';

import { ActivateDemoUserComponent } from './activate-demo-user.component';

describe('ActivateDemoUserComponent', () => {
  let component: ActivateDemoUserComponent;
  let fixture: ComponentFixture<ActivateDemoUserComponent>;
  let commonServiceMock;
  let alertServiceMock;
  let routerServiceMock;
  let router;
  let route;


  beforeEach(waitForAsync(() => {
    alertServiceMock = jasmine.createSpyObj('AlertService', ['sendAlert']);
    commonServiceMock = jasmine.createSpyObj('CommonService', ['activateDemoUser'])
    routerServiceMock = jasmine.createSpyObj('RouterService', ['route'])
    
    TestBed.configureTestingModule({
      declarations: [ 
        ActivateDemoUserComponent
      ],
      imports: [
        RouterTestingModule.withRoutes([]),
        HttpClientTestingModule 
      ],
      providers: [
        { provide: AlertService, useValue: alertServiceMock },
        { provide: CommonService, useValue: commonServiceMock },
        { provide: RouterService, useValue: routerServiceMock },
      ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    router = TestBed.inject(Router)
    route = TestBed.inject(ActivatedRoute)

    fixture = TestBed.createComponent(ActivateDemoUserComponent)
    component = fixture.componentInstance;
  });

  it('should create', () => {
    const spyRouteTokenValue = spyOn(route.snapshot.paramMap, 'get')
    spyRouteTokenValue.and.returnValue(null)

    fixture.detectChanges()
    expect(component).toBeTruthy()
  });

  it('should validate if token is set and tokenValidationResult is true',() => {
    const token = "imaginaryToken";
    const tokenValidationResult = component.validateTokenParameter(token);

    fixture.detectChanges();
    expect(tokenValidationResult).toEqual(true);
  });

  it('should recognize that there is no token and tokenValidationResult is false',() => {
    fixture = TestBed.createComponent(ActivateDemoUserComponent)
    component = fixture.componentInstance;

    const token = null;
    const tokenValidationResult = component.validateTokenParameter(token);
    fixture.detectChanges();

    expect(tokenValidationResult).toEqual(false);
  });

  
  it('should call loginhandler with invalid token',() => {
    const spyRouteTokenValue = spyOn(route.snapshot.paramMap, 'get')
    spyRouteTokenValue.and.returnValue(null)
    spyOn(component, "loginHandler")
    fixture.detectChanges();
    const expected =  [ false, null, null ]

    expect(component.loginHandler).toHaveBeenCalledWith( ...expected);
  });

  it('should call rerouteToLogin if tokenValidationResult is false',() => {
    const spyRouteTokenValue = spyOn(route.snapshot.paramMap, 'get')
    spyRouteTokenValue.and.returnValue(null)
    spyOn(component, "rerouteToLogin")
    fixture.detectChanges();

    const expected = [ 'danger', 'No token has been provided to activate a demo user' ]

    expect(component.rerouteToLogin).toHaveBeenCalledWith( ...expected);
  });

  it('should call rerouteToLogin if tokenValidationResult is false and check if Alert is set and page redirects to index.',() => {
    const spyRouteTokenValue = spyOn(route.snapshot.paramMap, 'get')
    spyRouteTokenValue.and.returnValue(null)
    
    fixture.detectChanges();

    const expected = { type: 'danger', text: 'No token has been provided to activate a demo user' }
    const expectedRouteCalls = [ 'login', { status: 'danger', message: 'No token has been provided to activate a demo user' }]

    expect(alertServiceMock.sendAlert).toHaveBeenCalledWith(expected);
    expect(routerServiceMock.route).toHaveBeenCalledWith(expectedRouteCalls);

  });


  it('should call rerouteToLogin if tokenValidationResult is true',() => {
    
    const spyRouteTokenValue = spyOn(route.snapshot.paramMap, 'get')
    spyRouteTokenValue.and.returnValue("test");

    spyOn(component, "activateDemoUser");
    
    fixture.detectChanges();

    const expected = [ 'test', 'test' ]
    
    expect(component.activateDemoUser).toHaveBeenCalledWith( ...expected);

  });

});
