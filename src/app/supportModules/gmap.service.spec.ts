import { TestBed } from '@angular/core/testing';
import { MockedUserServiceProvider } from '@app/shared/services/test.user.service';
import { GmapService } from './gmap.service';
import { MockedCommonServiceProvider } from './mocked.common.service';
import { SettingsService } from './settings.service';

describe('GmapService', () => {
  let service: GmapService
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers:[
        MockedCommonServiceProvider,
        MockedUserServiceProvider
      ]
    });
    window['google'] = {maps: <any>{
      Map: () => null,
      Marker: () => null,
      Circle: () => null,
      InfoWindow: () => null,
    }};
    service = TestBed.inject(GmapService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should draw circles om map if enabled in the settings', () => {
    service['settings'].dpr_map_drawExclusionZone = 500;
    const fakeMap = createGoogleConstructorSpy('Map');
    const spy1 = createGoogleConstructorSpy('Marker')
    const spy2 = createGoogleConstructorSpy('Circle')
    const spy3 = createGoogleConstructorSpy('InfoWindow')
    const layer = <any> {map: fakeMap};
    service.addParksToLayersForVessel(layer, layer, [], [{
      lon: 1,
      lat: 1,
      isVisited: false,
      name: 'test platform',
      visits: [],
    }])
    expect(spy1).toHaveBeenCalled();
    expect(spy2).toHaveBeenCalled();
    expect(spy3).not.toHaveBeenCalled();
  });

  it('should not draw circles om map if disabled in the settings', () => {
    service['settings'].dpr_map_drawExclusionZone = 0;
    const fakeMap = createGoogleConstructorSpy('Map');
    const spy1 = createGoogleConstructorSpy('Marker')
    const spy2 = createGoogleConstructorSpy('Circle')
    const spy3 = createGoogleConstructorSpy('InfoWindow')
    const layer = <any> {map: fakeMap};
    service.addParksToLayersForVessel(layer, layer, [], [{
      lon: 1,
      lat: 1,
      isVisited: false,
      name: 'test platform',
      visits: [],
    }])
    expect(spy1).toHaveBeenCalled();
    expect(spy2).not.toHaveBeenCalled();
    expect(spy3).not.toHaveBeenCalled();
  });
});



///////////
function createGoogleConstructorSpy(name = 'InfoWindow') {
  const markerSpy: jasmine.SpyObj<any> = createGoogleSpy(`google.maps.${name}`)
  const markerConstructorSpy =
      jasmine.createSpy('Circle constructor', (_options: google.maps.MarkerOptions) => {
        return markerSpy;
      });
  const testingWindow = window;
  if (testingWindow.google && testingWindow.google.maps) {
    testingWindow['google'].maps[name] = <any> markerConstructorSpy;
  } else {
    testingWindow['google'] = <any> {
      maps: {},
    };
    testingWindow['google'].maps[name] = markerConstructorSpy;
  }
  return markerConstructorSpy;
}
function createGoogleSpy(key = 'google.maps.Marker'):
    jasmine.SpyObj<google.maps.Marker> {
  const markerSpy = jasmine.createSpyObj(key, [
    'addListener', 'close', 'getContent', 'open', 'get',
    'setOptions', 'setMap', 'getAnimation', 'getClickable', 'getCursor',
    'getDraggable', 'getIcon', 'getLabel', 'getOpacity', 'getPosition', 'getShape', 'getTitle',
    'getVisible', 'getZIndex'
  ]);
  markerSpy.addListener.and.returnValue({remove: () => {}});
  return markerSpy;
}
