import { SovModel } from './SovModel';
import { CalculationService } from '../../../../../supportModules/calculation.service';
import { V2vCtvActivity } from './Transfers/vessel2vessel/V2vCtvActivity';
import { MapZoomLayer, MapZoomPolygon, MapZoomData } from '../../../../../models/mapZoomLayer';
import { isArray } from 'util';
import { GmapService } from '../../../../../supportModules/gmap.service';
import { Vessel2vesselModel } from './Transfers/vessel2vessel/Vessel2vessel';



export class Vessel2VesselActivity {
    mapLat: number;
    mapLon: number;
    mapZoomLevel = 5;
    vessel = '';
    mmsi: number;
    mapAvailable = true;

    route: {lon: number[], lat: number[]};
    private mapProperties: {zoomLevel: number, avgLatitude: number, avgLongitude: number};
    private calculationService = new CalculationService();
    private ctvActivity: V2vCtvActivity;
    private hasNotVisitedIcon = GmapService.iconTurbine; // static property
    private hasVisitedIcon = GmapService.iconVisitedTurbine;

    hasTurbineTransfers: boolean;
    turbineLocations: TurbineLocsFromMongo[];

    constructor (Options: V2Voptions) {
        this.vessel = Options.vessel;
        this.mmsi = Options.mmsi;
        this.turbineLocations = Options.turbineLocations;

        this.matchTurbines(Options.v2vs);
        if (this.ctvActivity !== undefined) {
            this.buildVesselRoute();
            this.setMapProperties(Options.htmlMap);
        }
    }

    matchTurbines(v2vs: Vessel2vesselModel[]) {
        v2vs.forEach(v2v => {
            v2v.CTVactivity.forEach(ctvActivity => {
                if (ctvActivity.mmsi === this.mmsi) {
                    this.ctvActivity = ctvActivity;
                    if (isArray(ctvActivity.turbineVisits) && ctvActivity.turbineVisits.length > 0 && ctvActivity.turbineVisits[0].fieldname !== undefined) {
                        this.hasTurbineTransfers = true;
                    } else {
                        this.hasTurbineTransfers = false;
                    }
                }
            });
        });
    }

    buildVesselRoute() {
        if (isArray(this.ctvActivity.map.lon) && isArray(this.ctvActivity.map.lat)) {
            this.route = {
                lon: this.ctvActivity.map.lon.map(elt => elt[0]),
                lat: this.ctvActivity.map.lat.map(elt => elt[0])
            };
        } else {
            this.route = {
                lon: [],
                lat: [],
            };
        }
    }

    setMapProperties(htmlMap: HTMLElement) {
        this.mapProperties = this.calculationService.calcPropertiesForMap(htmlMap.offsetWidth,
            this.ctvActivity.map.lat,
            this.ctvActivity.map.lon);

        this.mapAvailable = this.mapProperties.zoomLevel > 0 && this.mapProperties.avgLatitude > 0;
        this.mapZoomLevel = this.mapProperties.zoomLevel || 10;
        this.mapLon = this.mapProperties.avgLongitude || 0;
        this.mapLat = this.mapProperties.avgLatitude || 0;
    }

    getMapProperties() {
        return this.mapProperties;
    }

    addTurbinesToMapZoomLayer(layer: MapZoomLayer) {
        if (this.hasTurbineTransfers && this.turbineLocations) {
            this.turbineLocations.forEach(turbineLocation => {
                if (turbineLocation) {
                    turbineLocation.name.forEach((Name, idx) => {
                        const lon = turbineLocation.lon[idx][0];
                        const lat = turbineLocation.lat[idx][0];
                        if (this.hasVisited(Name)) {
                            layer.addData(new MapZoomData(lon, lat, this.hasVisitedIcon, '', Name));
                        } else {
                            layer.addData(new MapZoomData(lon, lat, this.hasNotVisitedIcon, ''));
                        }
                    });
                }
            });
        }
    }

    hasVisited(Name: string) {
        let hasDocked = false;
        this.ctvActivity.turbineVisits.forEach(visit => {
            if (visit.location === Name) {
                hasDocked = true;
            }
        });
        return hasDocked;
    }

    addVesselRouteToMapZoomLayer(layer: MapZoomLayer) {
        layer.addData(new MapZoomPolygon(this.route.lon, this.route.lat, 'CTV subroute', null, null, 'polyline', 'red'));
    }
}

export interface V2Voptions {
    // Mandatory
    v2vs: Vessel2vesselModel[];
    mmsi: number;
    turbineLocations: TurbineLocsFromMongo[];
    vessel: string;
    htmlMap: HTMLElement;
    // Optional
    // example: 'some example text';
}

export interface TurbineLocsFromMongo {
    SiteName: string;
    filename: string;
    centroid: {lat: number, lon: number, UTMzone: number, UTMletter: string};

    name: Array<string>;
    lon: Array<number[]>;
    lat: Array<number[]>;

    outlineLatCoordinates: number[];
    outlineLonCoordinates: number[];
}
