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


export function testBrokenHelpButtons(getFixture: () => ComponentFixture<any>) {
  return async () => {
    const fixture = getFixture();
    await fixture.whenStable();
    const elt: HTMLElement = fixture.nativeElement;
    const helpbtns: NodeListOf<HTMLButtonElement> = elt.querySelectorAll('button[popoverClass="helpPopup"]');
    helpbtns.forEach(helper => {
      helper.click();
      const window = elt.querySelector('ngb-popover-window');
      expect(window).toBeTruthy(helper.parentElement.textContent);
      if (window) {
        expect(window.textContent.length).toBeGreaterThan(0, helper.parentElement.textContent);
      }
      helper.click(); // Close the window
    });
  };
}

export function testEmptyTooltips(getFixture: () => ComponentFixture<any>) {
  // ToDo: get all elements with a broken reference
  return async () => {
    const fixture = getFixture();
    await fixture.whenStable();
    const elt: HTMLElement = fixture.nativeElement;
    const hoverDivs: NodeListOf<HTMLDivElement> = elt.querySelectorAll('div[ng-reflect-ngb-tooltip]');

    if (hoverDivs == null || hoverDivs.length == 0) { expect(true).toBe(true); } // Hide warnings about no spec

    hoverDivs.forEach(helper => {
      helper.dispatchEvent(new MouseEvent('mouseenter'));
      const window = elt.querySelector('ngb-tooltip-window div.tooltip-inner');
      expect(window).toBeTruthy(helper.textContent);
      if (window) {
        expect(window.textContent.length).toBeGreaterThan(0, helper.textContent);
      }
      helper.dispatchEvent(new MouseEvent('mouseleave'));
    });
  };
}

