import { CommonModule } from '@angular/common';
import { waitForAsync, ComponentFixture, TestBed } from '@angular/core/testing';
import { FormsModule } from '@angular/forms';
import { RouterTestingModule } from '@angular/router/testing';
import { MockedUserServiceProvider } from '@app/shared/services/test.user.service';
import { MockedCommonServiceProvider } from '@app/supportModules/mocked.common.service';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { NgxUploaderDirectiveModule } from 'ngx-uploader-directive';
import { FileUploadComponent } from '../models/file-upload/file-upload.component';
import { ForecastNewVesselComponent } from './forecast-new-vessel.component';

describe('ForecastNewVesselComponent', () => {
  let component: ForecastNewVesselComponent;
  let fixture: ComponentFixture<ForecastNewVesselComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      imports: [
        CommonModule,
        NgbModule,
        FormsModule,
        NgxUploaderDirectiveModule,
        RouterTestingModule,
      ],
      declarations: [
        ForecastNewVesselComponent,
        FileUploadComponent,
      ],
      providers: [
        MockedCommonServiceProvider,
        MockedUserServiceProvider,
      ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ForecastNewVesselComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should not have any broken help buttons', testBrokenHelpButtons(() => fixture));

  it('should not have any broken tooltips', testEmptyTooltips(() => fixture));
});


export function testBrokenHelpButtons(getFixture: () => ComponentFixture<any>, mustHaveHelpButtons = false) {
  return async () => {
    const fixture = getFixture();
    await fixture.whenStable();
    const elt: HTMLElement = fixture.nativeElement;
    const helpbtns: NodeListOf<HTMLButtonElement> = await elt.querySelectorAll('button[popoverClass="helpPopup"]');

    const noButtons = helpbtns == null || helpbtns.length == 0;
    if (noButtons) return expect(mustHaveHelpButtons).toBe(false, 'Missing help buttons');

    helpbtns.forEach(async helper => {
      helper.click();
      fixture.detectChanges()
      await fixture.whenStable();
      const window: HTMLCollection = document.getElementsByClassName('ngb-popover-window');
      expect(window).toBeTruthy(helper.parentElement.textContent);
      if (window.length > 0) {
        expect(window[0].innerHTML.length).toBeGreaterThan(0,
          `Missing help btn context: ${helper.parentElement.textContent}`
          );
      }
      helper.click(); // Close the window
    });
  };
}

export function testEmptyTooltips(getFixture: () => ComponentFixture<any>, mustHaveTooltips=false) {
  // ToDo: get all elements with a broken reference
  return async () => {
    const fixture = getFixture();
    await fixture.whenStable();
    const elt: HTMLElement = fixture.nativeElement;
    const hoverDivs: NodeListOf<HTMLDivElement> = await elt.querySelectorAll('div[ng-reflect-ngb-tooltip]');

    const noButtons = hoverDivs == null || hoverDivs.length == 0;
    if (noButtons) return expect(mustHaveTooltips).toBe(false, 'Missing tooltips!');

    for (let _i =0; _i<hoverDivs.length; _i++) {
      const helper = hoverDivs[_i];
      const is_send = helper.dispatchEvent(new MouseEvent('mouseenter'));
      expect(is_send).toBe(true, 'Event dispatch failed')
      fixture.detectChanges()
      await fixture.whenStable();
      const window = await document.getElementsByClassName('tooltip-inner');
      expect(window.length).toBe(1, `Missing tooltip window: ${helper.textContent}`);
      if (window.length > 0) {
        expect(window[0].innerHTML.length).toBeGreaterThan(0, `Missing tooltip: ${helper.textContent}`);
      }
      helper.dispatchEvent(new MouseEvent('mouseleave'));
    }
  };
}

