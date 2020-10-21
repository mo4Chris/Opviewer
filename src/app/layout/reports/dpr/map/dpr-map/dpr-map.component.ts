import { Component, OnInit, Input, Output, OnChanges, EventEmitter } from '@angular/core';
import { GmapService } from '@app/supportModules/gmap.service';
import { MapStore, TurbinePark, OffshorePlatform } from '@app/stores/map.store';
import { CalculationService } from '@app/supportModules/calculation.service';
import { LonlatService } from '@app/supportModules/lonlat.service';

@Component({
  selector: 'app-dpr-map',
  templateUrl: './dpr-map.component.html',
  styleUrls: ['./dpr-map.component.scss']
})
export class DprMapComponent implements OnInit, OnChanges {
  @Input() hidden = true;
  @Input() vesselTrace: GeoTrace;
  @Input() turbineVisits = [];
  @Input() platformVisits = [];
  @Input() v2vs = [];
  @Input() pxWidth: number;

  @Output() onLoaded = new EventEmitter<google.maps.Map>();

  constructor(
    private mapService: GmapService,
    private mapStore: MapStore,
    private calcService: CalculationService,
    private geoService: LonlatService,
  ) {
    this.mapIsReady = new Promise((resolve, reject) => {
      this.triggerMapPromise = resolve;
      setTimeout(() => {
        reject('Reached timeout!');
      }, 5000)
    })
  }

  private triggerMapPromise: (map: google.maps.Map) => void;
  private mapIsReady: Promise<google.maps.Map>;
  private googleMap: google.maps.Map;
  private parks: TurbinePark[];
  private platforms: OffshorePlatform[];

  public mapProperties = {
    avgLatitude: 0,
    avgLongitude: 0,
    zoomLevel: 5,
  }
  public mapStyle = GmapService.defaultMapStyle;
  public streetViewControl = false;
  public parkFound = true;
  public routeFound = true;
  public hasTransfers = true;

  ngOnInit() {
    this.mapService;
  }
  ngOnChanges() {
    if (!this.hidden) {
      this.setMapProperties();
      Promise.all([
        this.getPlatformsNearVesselTrace(),
        this.getParksNearVesselTrace(),
        this.mapIsReady,
      ]).then(([_platforms, _parks, _map]) => {
        this.platforms = _platforms;
        this.parks = _parks;
        this.googleMap = _map;
        this.onAllReady();
      });
    }
  }

  // Init
  setMapProperties() {
    let map = document.getElementById('routeMap');
    if (map !== null) {
      // ToDo: fix the width check here
      const mapPixelWidth = map.offsetWidth || this.pxWidth || Math.round(0.75 * window.innerWidth);
      this.mapProperties = this.calcService.GetPropertiesForMap(
        mapPixelWidth,
        this.vesselTrace.lat,
        this.vesselTrace.lon
      );
    }
  }

  // Async callbacks
  public async onGmapReady(map: google.maps.Map) {
    this.triggerMapPromise(map);
  }
  private async getPlatformsNearVesselTrace() {
    return this.mapStore.platforms.then((platforms) => {
      let trace = this.geoService.lonlatarrayToLatLngArray(this.vesselTrace)
      let traceCentroid = this.geoService.latlngcentroid(trace);
      let dist2platforms = platforms.map((_platform) => {
        return this.geoService.latlngdist({lng: _platform.lon, lat: _platform.lat}, traceCentroid);
      });
      return platforms.filter((_, _i) => dist2platforms[_i] < 5)
    })
  }
  private async getParksNearVesselTrace() {
    return this.mapStore.parks.then((parks) => {
      let trace = this.geoService.lonlatarrayToLatLngArray(this.vesselTrace)
      let traceCentroid = this.geoService.latlngcentroid(trace);
      const dist2center = parks.map((_park: any) => {
        const centroid = _park.centroid
        return this.geoService.latlngdist({lat: centroid.lat, lng: centroid.lon}, traceCentroid)
      });
      return parks.filter((_, _i) => dist2center[_i] < 20);
    });
  }

  // Synchronous callbacks
  private onAllReady() {
    this.buildGoogleMap(this.googleMap);
    this.onLoaded.emit(this.googleMap);
  }
  private buildGoogleMap(map: google.maps.Map) {
    this.mapService.addVesselRouteToGoogleMap(map, [this.vesselTrace]);
    let turbines = this.parks.map(_park => this.markVisitedTurbines(_park));
    let platforms = this.platforms.map(_platform => this.markVisitedPlatform(_platform));
    // this.mapService.addTurbinesToMapForVessel(map, turbines, {turbineLocations: []});
    this.mapService.addParksToMapForVessel(map, turbines, platforms);
    this.mapService.addV2VtransfersToMap(this.googleMap, this.v2vs, this.vesselTrace);
  }
  private markVisitedTurbines(park: TurbinePark): TurbineParkWithDrawData {
    let parkWithData = park as TurbineParkWithDrawData;
    parkWithData.isVisited = false;
    this.turbineVisits.forEach((visit) => {
      if (visit.fieldname === parkWithData.filename) {
        let turbine = parkWithData.turbines.find(_turb => _turb.name === visit.location)
        if (turbine) {
          parkWithData.isVisited = true;
          turbine.isVisited = true;
          if (turbine.visits) {
            turbine.visits.push(visit);
          } else {
            turbine.visits = [visit]
          }
        }
      } 
    });
    return park as TurbineParkWithDrawData;
  }
  private markVisitedPlatform(platform: OffshorePlatform): OffshorePlatformWithData {
    let platformWithData = platform as OffshorePlatformWithData
    platformWithData.isVisited = false;
    this.platformVisits.forEach(visit => {
      if (visit.name === platformWithData.name) {
        platformWithData.isVisited = true;
      }
    })
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
  turbines: Array<{
    name: string;
    lon: number
    lat: number;
    isVisited?: boolean;
    visits?: any;
  }>,
}

export interface OffshorePlatformWithData extends OffshorePlatform {
  isVisited: boolean;
  visits: boolean;
}