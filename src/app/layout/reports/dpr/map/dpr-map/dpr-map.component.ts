import { Component, OnInit, Input, Output, OnChanges, EventEmitter, ChangeDetectorRef, ChangeDetectionStrategy, NgZone } from '@angular/core';
import { GmapService } from '@app/supportModules/gmap.service';
import { MapStore, TurbinePark, OffshorePlatform, HarbourLocation } from '@app/stores/map.store';
import { CalculationService } from '@app/supportModules/calculation.service';
import { LonlatService } from '@app/supportModules/lonlat.service';
import { MapZoomLayer } from '@app/models/mapZoomLayer';

@Component({
  selector: 'app-dpr-map',
  templateUrl: './dpr-map.component.html',
  styleUrls: ['./dpr-map.component.scss'],
})
export class DprMapComponent implements OnChanges {
  @Input() vesselTrace: GeoTrace;
  @Input() turbineVisits = [];
  @Input() platformVisits = [];
  @Input() v2vs = [];
  @Input() width: number;
  @Output() onLoaded = new EventEmitter<google.maps.Map>();

  constructor(
    private mapService: GmapService,
    private mapStore: MapStore,
    private calcService: CalculationService,
    private geoService: LonlatService,
    private ref: ChangeDetectorRef,
    private zone: NgZone,
  ) {
  }

  triggerMapPromise: (map: google.maps.Map) => void;
  private mapIsReady: Promise<google.maps.Map>;
  private googleMap: google.maps.Map;
  private parks: TurbinePark[];
  private platforms: OffshorePlatform[];
  private harbours: HarbourLocation[];
  private visitsLayer: MapZoomLayer;
  private otherLayer: MapZoomLayer;

  public mapProperties = {
    avgLatitude: 0,
    avgLongitude: 0,
    zoomLevel: 5,
  };
  public mapStyle = GmapService.defaultMapStyle;
  public streetViewControl = false;
  public routeFound = false;

  // Get callbacks
  get hidden() {
    return !this.routeFound;
  }
  get parkFound() {
    return this.parks && this.parks.length > 0 || this.platformVisits && this.platformVisits.length > 0;
  }
  get hasTransfers() {
    return this.turbineVisits && this.turbineVisits.length > 0 ||
      this.platformVisits && this.platformVisits.length > 0;
  }
  get hasValidVesselTrace() {
    return this.vesselTrace
      && Array.isArray(this.vesselTrace.lat)
      && this.vesselTrace.lat.length > 0
      && this.vesselTrace.lat.length === this.vesselTrace.lon.length
      && this.vesselTrace.lat.length === this.vesselTrace.time.length;
  }

  ngOnChanges() {
    if (!this.hasValidVesselTrace) {
      this.routeFound = false;
      return this.ref.detectChanges();
    }
    if (!this.googleMap) this.initMapPromise();

    this.routeFound = true;
    this.ref.detectChanges();
    this.setMapProperties();
    Promise.all([
      this.getPlatformsNearVesselTrace(),
      this.getParksNearVesselTrace(),
      this.mapIsReady,
      this.mapStore.harbours,
    ]).then(([_platforms, _parks, _map, _harbours]) => {
      this.platforms = _platforms;
      this.parks = _parks;
      this.googleMap = _map;
      this.harbours = _harbours;
      this.onAllReady();
    });
  }

  // Init
  initMapPromise() {
    this.mapIsReady = new Promise((resolve, reject) => {
      this.triggerMapPromise = resolve;
      this.zone.runOutsideAngular(() => {
        setTimeout(() => {
          if (this.hasValidVesselTrace) {
            reject('Error initializing google map!');
          }
        }, 30000);
      })
    });
  }
  setMapProperties() {
    const map = document.getElementById('routeMap');
    if (map !== null) {
      // ToDo: fix the width check here
      const mapPixelWidth = map.offsetWidth || this.width || Math.round(0.75 * window.innerWidth);
      this.mapProperties = this.calcService.calcPropertiesForMap(
        mapPixelWidth,
        this.vesselTrace.lat,
        this.vesselTrace.lon
      );
      if (!(this.mapProperties.avgLatitude > 0 && this.mapProperties.avgLatitude < 180)) {
        console.warn('Detected bad map properties!');
        this.routeFound = false;
      }
    }
  }
  initZoomLayers(map: google.maps.Map, ) {
    this.visitsLayer = new MapZoomLayer(map, 8);
    this.otherLayer = new MapZoomLayer(map, 10);
  }

  // Async callbacks
  public onGmapReady(map: google.maps.Map) {
    if (this.googleMap) {
      this.googleMap.unbindAll();
    }
    this.initZoomLayers(map);
    this.triggerMapPromise(map);
  }
  private async getPlatformsNearVesselTrace() {
    return this.mapStore.platforms.then((platforms) => {
      const trace = this.geoService.lonlatarrayToLatLngArray(this.vesselTrace);
      if (trace[0] && trace[0].time) {
        const hrs = this.calcService.linspace(trace[0].time, trace[trace.length - 1].time, 1 / 24 - 0.00001);
        const dist2center = this.calcService.fillArray(1000, platforms.length);
        for (let _i = 0; _i < hrs.length - 1; _i++) {
          const s = trace.findIndex(_e => _e.time > hrs[_i]);
          const e = trace.findIndex(_e => _e.time > hrs[_i + 1]);
          const traceCentroid = this.geoService.latlngcentroid(trace.slice(s, e));
          platforms.forEach((_platform, _j) => {
            const d2p = this.geoService.latlngdist({lat: _platform.lat, lng: _platform.lon}, traceCentroid);
            if (d2p > 0) {
              dist2center[_j] = Math.min(dist2center[_j], d2p);
            }
          });
        }
        return platforms.filter((_, j) => dist2center[j] < 5);
      } else {
        const traceCentroid = this.geoService.latlngcentroid(trace);
        const dist2platforms = platforms.map((_platform) => {
          return this.geoService.latlngdist({lng: _platform.lon, lat: _platform.lat}, traceCentroid);
        });
        return platforms.filter((_, _i) => dist2platforms[_i] < 20);
      }
    });
  }
  private async getParksNearVesselTrace() {
    return this.mapStore.parks.then((parks) => {
      const trace = this.geoService.lonlatarrayToLatLngArray(this.vesselTrace);
      // If possible, we consider 10KM range every hour. Otherwise, we take 20KM around global centroid
      if (trace[0] && trace[0].time) {
        const hrs = this.calcService.linspace(trace[0].time, trace[trace.length - 1].time, 1 / 24 - 0.00001);
        const dist2center = this.calcService.fillArray(1000, parks.length);
        for (let _i = 0; _i < hrs.length - 1; _i++) {
          const s = trace.findIndex(_e => _e.time > hrs[_i]);
          const e = trace.findIndex(_e => _e.time > hrs[_i + 1]);
          const traceCentroid = this.geoService.latlngcentroid(trace.slice(s, e));
          parks.forEach((_park: any, _j) => {
            const centroid = _park.centroid;
            const d2p = this.geoService.latlngdist({lat: centroid.lat, lng: centroid.lon}, traceCentroid);
            if (d2p > 0) {
              dist2center[_j] = Math.min(dist2center[_j], d2p);
            }
          });
        }
        return parks.filter((_, j) => dist2center[j] < 12);
      } else {
        const traceCentroid = this.geoService.latlngcentroid(trace);
        const dist2center = parks.map((_park: any) => {
          const centroid = _park.centroid;
          return this.geoService.latlngdist({lat: centroid.lat, lng: centroid.lon}, traceCentroid);
        });
        return parks.filter((_, _i) => dist2center[_i] < 20);
      }
    });
  }

  // Synchronous callbacks
  private onAllReady() {
    this.buildGoogleMap();
    this.onLoaded.emit(this.googleMap);
    this.ref.detectChanges();
  }
  private buildGoogleMap() {
    this.mapService.addVesselRouteToLayer(this.visitsLayer, [this.vesselTrace]);
    const turbines = this.parks.map(_park => this.markVisitedTurbines(_park));
    const platforms = this.platforms.map(_platform => this.markVisitedPlatform(_platform));
    // this.mapService.addTurbinesToMapForVessel(map, turbines, {turbineLocations: []});
    this.mapService.addParksToLayersForVessel(this.visitsLayer, this.otherLayer, turbines, platforms);
    if (this.v2vs && this.v2vs[0]) {
      this.mapService.addV2VtransfersToLayer(this.visitsLayer, this.v2vs[0].transfers, this.vesselTrace);
    }
    this.mapService.addHarboursToLayer(this.visitsLayer, this.harbours);
    this.visitsLayer.draw();
    this.otherLayer.draw();
  }
  private markVisitedTurbines(park: TurbinePark): TurbineParkWithDrawData {
    // We need to copy the park data so we dont affect the original park array, which could bleed between pages.
    const turbines: TurbineWithData[] = park.turbines.map(_turb => {
      return {..._turb, ... {
        isVisited: false,
        visits: [],
      }};
    });
    const parkWithData: TurbineParkWithDrawData = {
      filename: park.filename,
      name: park.name,
      outline: park.outline,
      centroid: park.centroid,
      isVisited: false,
      turbines: turbines,
    };
    this.turbineVisits.forEach((visit) => {
      if (visit.fieldname === parkWithData.filename) {
        const turbine = parkWithData.turbines.find(_turb => _turb.name === visit.location);
        if (turbine) {
          parkWithData.isVisited = true;
          turbine.isVisited = true;
          if (turbine.visits) {
            turbine.visits.push(visit);
          } else {
            turbine.visits = [visit];
          }
        }
      }
    });
    return parkWithData as TurbineParkWithDrawData;
  }
  private markVisitedPlatform(platform: OffshorePlatform): OffshorePlatformWithData {
    const platformWithData: OffshorePlatformWithData = {
      ... platform,
      ... {
        isVisited: false,
        visits: [],
      }
    };
    platformWithData.isVisited = false;
    this.platformVisits.forEach(visit => {
      if (visit.locationname === platformWithData.name) {
        platformWithData.isVisited = true;
        if (platformWithData.visits) {
          platformWithData.visits.push(visit);
        } else {
          platformWithData.visits = [visit];
        }
      }
    });
    return platformWithData;
  }
}


interface GeoTrace {
  time: number[];
  lon:  number[];
  lat:  number[];
}
export interface TurbineParkWithDrawData extends TurbinePark {
  isVisited: boolean;
  turbines: Array<TurbineWithData>;
}
export interface TurbineWithData {
  name: string;
  lon: number;
  lat: number;
  isVisited?: boolean;
  visits?: any[];
}
export interface OffshorePlatformWithData extends OffshorePlatform {
  isVisited: boolean;
  visits: any[];
}
