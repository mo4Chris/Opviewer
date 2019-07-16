import { SovModel } from './SovModel';
import { CalculationService } from '../../../../supportModules/calculation.service';
import { V2vCtvActivity } from './Transfers/vessel2vessel/V2vCtvActivity';
import { MapZoomLayer, MapZoomPolygon, MapZoomData } from '../../../../models/mapZoomLayer';
import { isArray } from 'util';
import { GmapService } from '../../../../supportModules/gmap.service';



export class Vessel2VesselActivity {
    mapLat: number;
    mapLon: number;
    mapZoomLevel = 5;
    vessel = '';
    mmsi: number;

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

        this.matchTurbines(Options.sovModel);
        if (this.ctvActivity !== undefined) {
            this.buildVesselRoute();
            this.setMapProperties(Options.htmlMap);
        }
    }

    matchTurbines(sov: SovModel) {
        sov.vessel2vessels.forEach(v2v => {
            v2v.CTVactivity.forEach(ctvActivity => {
                if (ctvActivity.mmsi === this.mmsi) {
                    this.ctvActivity = ctvActivity;
                    if (isArray(ctvActivity.turbineVisits) && ctvActivity.turbineVisits[0].fieldname !== undefined) {
                        this.hasTurbineTransfers = true;
                    } else {
                        this.hasTurbineTransfers = false;
                    }
                }
            });
        });
    }

    buildVesselRoute() {
        this.route = {
            lon: this.ctvActivity.map.lon.map(elt => elt[0]),
            lat: this.ctvActivity.map.lat.map(elt => elt[0])
        };
    }

    setMapProperties(htmlMap: HTMLElement) {
        this.mapProperties = this.calculationService.GetPropertiesForMap(htmlMap.offsetWidth,
            this.ctvActivity.map.lat,
            this.ctvActivity.map.lon);
        this.mapZoomLevel = this.mapProperties.zoomLevel;
        this.mapLon = this.mapProperties.avgLongitude;
        this.mapLat = this.mapProperties.avgLatitude;
    }

    getMapProperties() {
        return this.mapProperties;
    }

    addTurbinesToMapZoomLayer(layer: MapZoomLayer) {
        if (this.hasTurbineTransfers) {
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
            })
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
    sovModel: SovModel;
    mmsi: number;
    turbineLocations: TurbineLocsFromMongo[];
    vessel: string;
    htmlMap: HTMLElement;
    // Optional
    // example: 'some example text';
}

interface TurbineLocsFromMongo {
    SiteName: string;
    filename: string;
    centroid: {lat: number, lon: number, UTMzone: number, UTMletter: string};

    name: Array<string>;
    lon: Array<number[]>;
    lat: Array<number[]>;

    outlineLatCoordinates: number[];
    outlineLonCoordinates: number[];
}