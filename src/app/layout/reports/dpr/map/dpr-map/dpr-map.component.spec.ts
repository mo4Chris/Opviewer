import { AgmMap } from '@agm/core';
import { CommonModule } from '@angular/common';
import { waitForAsync, ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';
import { MockedUserServiceProvider } from '@app/shared/services/test.user.service';
import { MockedMapStoreProvider } from '@app/stores/map.store';
import { MockedCommonServiceProvider } from '@app/supportModules/mocked.common.service';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { MockComponents } from 'ng-mocks';
import { AutosizeModule } from 'ngx-autosize';
import { DprMapComponent } from './dpr-map.component';

describe('DprMapComponent', () => {
  let component: DprMapComponent;
  let fixture: ComponentFixture<DprMapComponent>;
  let consoleSpy: jasmine.Spy;
  const vessel = {
    trace: {
      time: linspace(738000, 738001, 100),
      lon: linspace(50, 51, 100),
      lat: linspace(50, 51, 100),
    },
    turbineTransfers: [],
    platformTransfers: [],
    v2vs: [],
  };
  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      imports: [
        CommonModule,
        AutosizeModule,
        NgbModule,
      ],
      declarations: [
        DprMapComponent,
        MockComponents(
          AgmMap,
        )
      ],
      providers: [
        MockedCommonServiceProvider,
        MockedMapStoreProvider,
        MockedUserServiceProvider,
      ]
    })
    .compileComponents();
    consoleSpy = spyOn(console, 'error').and.callThrough();
  }));

  describe('as ctv', () => {
    beforeEach(() => {
      fixture = TestBed.createComponent(DprMapComponent);
      component = fixture.componentInstance;
      component.turbineVisits = vessel.turbineTransfers;
      component.platformVisits = vessel.platformTransfers;
      component.v2vs = vessel.v2vs;
      component.vesselTrace = vessel.trace;
      component.width = 1000;
      fixture.detectChanges();
    });

    it('should create', fakeAsync(async () => {
      expect(component).toBeTruthy();
      expect(component.hidden).toBe(true);
      expect(component.hasValidVesselTrace).toBe(true);

      const onAllReadySpy = spyOn<any>(component, 'buildGoogleMap')
      await fixture.whenStable();
      component.ngOnChanges();
      expect(component.hidden).toBe(false);
      expect(component).toBeTruthy();
      component.onGmapReady(null);
      tick(100000)
      expect(onAllReadySpy).toHaveBeenCalled();
      expect(consoleSpy).toHaveBeenCalledTimes(0);
    }));
  });
});

function linspace(s, e, n) {
  const y = new Array(n);
  for (let i = 0; i < n; i++) {
    y[i] = s + (e - s) * i / (n - 1);
  }
  return y;
}
