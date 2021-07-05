import { waitForAsync, ComponentFixture, TestBed, tick, fakeAsync } from '@angular/core/testing';
import { AgmCoreModule } from '@agm/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { PageHeaderModule, SharedPipesModule } from '@app/shared';
import { RouterTestingModule } from '@angular/router/testing';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { MockedCommonServiceProvider } from '@app/supportModules/mocked.common.service';
import { MockedUserServiceProvider } from '@app/shared/services/test.user.service';
import { CtvreportComponent } from './ctv/ctvreport/ctvreport.component';
import { NgMultiSelectDropDownModule } from 'ng-multiselect-dropdown';
import { ReportsDprComponent } from './reports-dpr.component';
import { SovreportComponent } from './sov/sovreport.component';
import { PermissionService } from '@app/shared/permissions/permission.service';
import { MockComponents } from 'ng-mocks';


describe('ReportsDprComponent', () => {
  let component: ReportsDprComponent;
  let fixture: ComponentFixture<ReportsDprComponent>;
  const perm = <PermissionService> PermissionService.getDefaultPermission('admin');
  let buildPageWithCurrentInformationSpy: jasmine.Spy;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      imports: [
        AgmCoreModule,
        FormsModule,
        ReactiveFormsModule,
        NgbModule,
        PageHeaderModule,
        RouterTestingModule,
        BrowserAnimationsModule,
        NgMultiSelectDropDownModule,
      ],
      declarations: [
        ReportsDprComponent,
        MockComponents(
          CtvreportComponent,
          SovreportComponent,
        )
      ],
      providers: [
        MockedCommonServiceProvider,
        MockedUserServiceProvider,
        {
          provide: PermissionService,
          useValue: perm
        }
      ],
    })
    .compileComponents();
  }));

  beforeEach(() => {
    spyOn(ReportsDprComponent.prototype, 'getDateFromParameter').and.returnValue(737700); // Equivalent to no date provided
    spyOn(ReportsDprComponent.prototype, 'getMMSIFromParameter').and.returnValue(123456789); // CTV test vessel - replace mmsi later if not desired
    buildPageWithCurrentInformationSpy = spyOn(ReportsDprComponent.prototype, 'buildPageWithCurrentInformation');

    fixture = TestBed.createComponent(ReportsDprComponent);
    component = fixture.componentInstance;
    component.permission.admin = false;

    fixture.detectChanges();
  });

  it('Report dpr component should instantiate', () => {
    expect(component).toBeTruthy();
    expect(component.datePickerValue).toEqual({
      year: 2019, month: 10, day: 2
    });
  });

  it('should correctly use prev day button', async () => {
    const el: HTMLElement = fixture.nativeElement;
    const prevDayBtn: HTMLButtonElement = el.querySelector('#prevDayButton');
    await fixture.whenStable();
    const oldValue = toDate(component.datePickerValue).getTime();
    prevDayBtn.click();
    const newValue = toDate(component.datePickerValue).getTime();
    expect(Math.round((oldValue - newValue) / 1000) / 3600 ).toEqual(24);
  });
  it('should correctly use next day button', async () => {
    const el: HTMLElement = fixture.nativeElement;
    const nextDayBtn: HTMLButtonElement = el.querySelector('#nextDayButton');
    await fixture.whenStable();
    const oldValue = toDate(component.datePickerValue).getTime();
    nextDayBtn.click();
    const newValue = toDate(component.datePickerValue).getTime();
    expect(Math.round((newValue - oldValue) / 1000) / 3600 ).toEqual(24);
  });
  it('should correctly use the date picker', async () => {
    const el: HTMLElement = fixture.nativeElement;
    const dpBtn: HTMLButtonElement = el.querySelector('#datePickBtn');
    component.sailDates = {
      transfer: [],
      transit: [],
      other: [],
    };
    component.noPermissionForData = false;
    component.loaded = true;
    spyOn(component, 'hasSailedTransfer').and.returnValue(true);
    spyOn(component, 'hasSailedTransit').and.returnValue(true);
    spyOn(component, 'hasSailedOther').and.returnValue(false);
    spyOn(component, 'onChange');

    fixture.detectChanges();
    await fixture.whenStable();
    expect(getDatepickerDropdown()).not.toBeTruthy('Datepicker should start closed');
    dpBtn.click();
    const dropdown = getDatepickerDropdown();
    expect(dropdown).toBeTruthy('Datepicker should open on click');
    // ToDo: Clicking again does not appear to close the window during testing...
    // dpBtn.click();
    // expect(getDatepickerDropdown()).not.toBeTruthy('Datepicker should be closed when clicking again');
  });
  function getDatepickerDropdown(): HTMLElement {
    return fixture.nativeElement.querySelector('ngb-datepicker');
  }

  it('should correctly handle next / prev day when switching months', () => {
    component.changeDay(-2);
    expect(buildPageWithCurrentInformationSpy).toHaveBeenCalled();
    expect(component.datePickerValue).toEqual({year: 2019, month: 9, day: 30});
  })

  xit('should print page using hotkey',  async () => {
    // xit means this test is disabled
    const printSpy = spyOn(component, 'printPage');
    spyOn(window, 'print');
    component.sailDates = {
      transfer: [],
      transit: [],
      other: [],
    };
    component.noPermissionForData = false;
    component.loaded = true;
    fixture.detectChanges();
    await fixture.whenStable();

    const el: HTMLElement = fixture.nativeElement;
    const event = new KeyboardEvent('keydown', {
      code: 'KeyP',
      key: 'p',
      ctrlKey: true,
    });
    document.dispatchEvent(event);
    // ToDo: Current test will work, but ALSO triggers print window
    fixture.detectChanges();
    expect(printSpy).toHaveBeenCalled();
  });

});

function toDate(YMD: {year: number, month: number, day: number}): Date {
  return new Date(YMD.year, YMD.month, YMD.day);
}
