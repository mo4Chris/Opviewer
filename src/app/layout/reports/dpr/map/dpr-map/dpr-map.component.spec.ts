import { AgmCoreModule } from '@agm/core';
import { CommonModule } from '@angular/common';
import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { MockedUserServiceProvider } from '@app/shared/services/test.user.service';
import { MockedMapStoreProvider } from '@app/stores/map.store';
import { MockedCommonServiceProvider } from '@app/supportModules/mocked.common.service';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
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
  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [
        CommonModule,
        AgmCoreModule.forRoot(),
        AutosizeModule,
        NgbModule,
      ],
      declarations: [ DprMapComponent ],
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

    it('should create', async () => {
      expect(component).toBeTruthy();
      expect(component.hidden).toBe(true);
      expect(component.hasValidVesselTrace).toBe(true);
      component.ngOnChanges();
      expect(component.hidden).toBe(false);
      expect(component).toBeTruthy();
      await component.onLoaded.subscribe()
      expect(consoleSpy).toHaveBeenCalledTimes(0);
    });
  });
});

function linspace(s, e, n) {
  const y = new Array(n);
  for (let i = 0; i < n; i++) {
    y[i] = s + (e - s) * i / (n - 1);
  }
  return y;
}
