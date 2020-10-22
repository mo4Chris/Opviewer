import { Component, OnInit, Input, Output, OnChanges, EventEmitter } from '@angular/core';
import { GmapService } from '@app/supportModules/gmap.service';
import { MapStore, TurbinePark, OffshorePlatform } from '@app/stores/map.store';
import { CalculationService } from '@app/supportModules/calculation.service';
import { LonlatService } from '@app/supportModules/lonlat.service';
import { MapZoomLayer } from '@app/models/mapZoomLayer';

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
  private visitsLayer: MapZoomLayer;
  private otherLayer: MapZoomLayer;

  // reset() {
  //     // This ensures that the correct map will be set when switching between pages
  //     if (this.layersInitialized) {
  //         this.vesselRouteTurbineLayer.reset();
  //         this.unvisitedPlatformLayer.reset();
  //         this.layersInitialized = false;
  //     }
  //     this.layersInitialized = false;
  // }

  // buildLayerIfNotPresent(googleMap: google.maps.Map) {
  //     if (!this.layersInitialized) {
  //         console.log('Initializing zoom layers!')
  //         this.vesselRouteTurbineLayer = new MapZoomLayer(googleMap, 8);
  //         this.unvisitedPlatformLayer = new MapZoomLayer(googleMap, 10);
  //         this.layersInitialized = true;
  //         setTimeout(() => {
  //             // Platform layer is drawn only after 500 ms delay to keep map responsive
  //             this.unvisitedPlatformLayer.draw();
  //         }, 500);
  //     }
  // }

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
    console.log('INIT dpr map')
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
  initZoomLayers(map: google.maps.Map, ) {
    this.visitsLayer = new MapZoomLayer(map, 8);
    this.otherLayer = new MapZoomLayer(map, 8);
  }

  // Async callbacks
  public async onGmapReady(map: google.maps.Map) {
    this.initZoomLayers(map);
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
      console.log(parks)
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
    console.log('BUILDING GOOGLE MAP')
    this.mapService.addVesselRouteToLayer(this.visitsLayer, [this.vesselTrace]);
    let turbines = this.parks.map(_park => this.markVisitedTurbines(_park));
    let platforms = this.platforms.map(_platform => this.markVisitedPlatform(_platform));
    // this.mapService.addTurbinesToMapForVessel(map, turbines, {turbineLocations: []});
    this.mapService.addParksToLayersForVessel(this.visitsLayer, this.otherLayer, turbines, platforms);
    this.mapService.addV2VtransfersToLayer(this.visitsLayer, this.v2vs, this.vesselTrace);
    this.visitsLayer.draw();
    this.otherLayer.draw();
  }
  private markVisitedTurbines(park: TurbinePark): TurbineParkWithDrawData {
    let turbines: TurbineWithData[] = park.turbines.map(_turb => {
      return {
        name: _turb.name,
        lon: _turb.lon,
        lat: _turb.lat,
        isVisited: false,
        visits: [],
      }
    })
    let parkWithData: TurbineParkWithDrawData = {
      ... {
        isVisited: false,
        turbines: turbines,
      }, ...
      park
    };
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
    return parkWithData as TurbineParkWithDrawData;
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
  turbines: Array<TurbineWithData>,
}

export interface TurbineWithData {
  name: string;
  lon: number
  lat: number;
  isVisited?: boolean;
  visits?: any[];
}

export interface OffshorePlatformWithData extends OffshorePlatform {
  isVisited: boolean;
  visits: any[];
}