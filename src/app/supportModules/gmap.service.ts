import { Injectable } from '@angular/core';
import { LonlatService } from '../supportModules/lonlat.service';
import { DatetimeService } from '../supportModules/datetime.service';
import { EventService } from '../supportModules/event.service';
import { mapLegend, mapMarkerIcon } from '../layout/dashboard/models/mapLegend';
import { MapZoomData, MapZoomLayer, MapZoomPolygon } from '../models/mapZoomLayer';
import { isArray, isObject } from 'util';
import { Observable } from 'rxjs';
import { V2vTransfer } from '@app/layout/reports/dpr/sov/models/Transfers/vessel2vessel/V2vTransfer';
import { TurbineParkWithDrawData, OffshorePlatformWithData, TurbineWithData } from '@app/layout/reports/dpr/map/dpr-map/dpr-map.component';

@Injectable({
    providedIn: 'root'
})
export class GmapService {
    constructor(
        private eventService: EventService,
        private lonlatService: LonlatService,
        private dateTimeService: DatetimeService
    ) {
    }
    static iconWindfield: mapMarkerIcon = new mapMarkerIcon(
        'assets/images/windTurbine.png',
        'Wind farm',
        {
            width: 25,
            height: 25
        }
    );
    static iconTurbine: mapMarkerIcon = new mapMarkerIcon(
        'assets/images/turbineIcon.png',
        '',
        {
            width: 5,
            height: 5
        }
    );
    static iconVisitedTurbine: mapMarkerIcon = new mapMarkerIcon(
        'assets/images/visitedTurbineIcon.png',
        'Visited turbine',
        {
            width: 10,
            height: 10
        }
    );
    static iconPlatform: mapMarkerIcon = new mapMarkerIcon(
        'assets/images/oil-platform.png',
        'Platform',
        {
            width: 10,
            height: 10
        }
    );
    static iconVisitedPlatform: mapMarkerIcon = new mapMarkerIcon(
        'assets/images/visitedPlatform.png',
        'Visited platform',
        {
            width: 10,
            height: 10
        }
    );
    static iconHarbour: mapMarkerIcon = new mapMarkerIcon(
        'assets/images/marina.png',
        'Harbour',
        {
            width: 20,
            height: 20
        }
    );
    static iconVessel2VesselTransfer: mapMarkerIcon = new mapMarkerIcon(
        'assets/images/vesselToVesselTransfer.png',
        'Vessel to vessel transfer',
        {
            width: 14,
            height: 14,
        }
    );
    static iconVesselLive: mapMarkerIcon = new mapMarkerIcon(
        'assets/images/grn-circle.png',
        'Updated last hour'
    );
    static iconVesselHours: mapMarkerIcon = new mapMarkerIcon(
        'assets/images/ylw-circle.png',
        'Updated < 6 hours',
    );
    static iconVesselOld: mapMarkerIcon = new mapMarkerIcon(
        'assets/images/red-circle.png',
        'Updated > 6 hours'
    );
    static iconVesselCluster: mapMarkerIcon = new mapMarkerIcon(
        'assets/clusterer/m1.png',
        'Cluster of vessels'
    );
    static iconWaveSource: mapMarkerIcon = new mapMarkerIcon(
        'assets/images/buoy.png',
        'Wave source',
        {
            width: 20,
            height: 20,
        }
    );
    static defaultMapStyle = [
        {
            featureType: 'administrative',
            elementType: 'geometry',
            stylers: [
                {
                    visibility: 'off'
                }
            ]
        },
        {
            featureType: 'administrative.land_parcel',
            elementType: 'labels',
            stylers: [
                {
                    visibility: 'off'
                }
            ]
        },
        {
            featureType: 'poi',
            stylers: [
                {
                    visibility: 'off'
                }
            ]
        },
        {
            featureType: 'poi',
            elementType: 'labels.text',
            stylers: [
                {
                    visibility: 'off'
                }
            ]
        },
        {
            featureType: 'road',
            elementType: 'labels.icon',
            stylers: [
                {
                    visibility: 'off'
                }
            ]
        },
        {
            featureType: 'road.local',
            elementType: 'labels',
            stylers: [
                {
                    visibility: 'off'
                }
            ]
        },
        {
            featureType: 'transit',
            stylers: [
                {
                    visibility: 'off'
                }
            ]
        }
    ];

    addParksToLayersForVessel(visitLayer: MapZoomLayer, otherLayer: MapZoomLayer, parks: TurbineParkWithDrawData[], platforms: OffshorePlatformWithData[]) {
        // Drawing turbines
        parks.forEach((park, index) => {
            if (park.isVisited) {
                park.turbines.forEach((_turb, _i) => {
                    if (_turb.isVisited) {
                        this.addTurbineToLayer(visitLayer, _turb, 5);
                    } else {
                        this.addTurbineToLayer(otherLayer, _turb);
                    }
                })
            } else {
                this.addParkOutlineToLayer(otherLayer, park);
            }
        });
        // Drawing platforms
        platforms.forEach(_platform => {
            this.addPlatformToLayer(otherLayer, _platform)
        });
    }
    
    private addParkOutlineToLayer(layer: MapZoomLayer, park: TurbineParkWithDrawData) {
        layer.addData(new MapZoomPolygon(
            park.outline.lon,
            park.outline.lat,
            park.name,
            park.name,
        ));
    }

    addTurbineToLayer(layer: MapZoomLayer, turbine: TurbineWithData, zIndex = 2) {
        let contentString = '';
        let markerIcon = turbine.isVisited ? GmapService.iconVisitedTurbine : GmapService.iconTurbine;
        let infoArray = turbine.visits;
        if (infoArray !== undefined && infoArray !== null && infoArray.length > 0 && infoArray[0]) {
            contentString =
                '<strong style="font-size: 15px;">' + turbine.name + ' Turbine transfers</strong>' +
                '<pre>';
            infoArray = infoArray.filter(function (elem) {
                return elem !== undefined;
            });
            infoArray.forEach(info => {
                contentString = contentString + '<br>' +
                    'Start: ' + this.dateTimeService.MatlabDateToJSTime(info.startTime) + '<br>' +
                    'Stop: ' + this.dateTimeService.MatlabDateToJSTime(info.stopTime) + '<br>' +
                    'Duration: ' + this.dateTimeService.MatlabDurationToMinutes(info.duration) + '<br>';
            });
            contentString = contentString + '</pre>';
        }
        layer.addData(new MapZoomData(
            turbine.lon,
            turbine.lat,
            markerIcon,
            'Turbine',
            contentString
        ));
    }

    private addPlatformToLayer(layer: MapZoomLayer, platform: OffshorePlatformWithData, zIndex = 2) {
        const markerPosition = { lat: platform.lat, lng: platform.lon };
        const markerIcon = platform.isVisited ? GmapService.iconVisitedPlatform : GmapService.iconPlatform;
        const mymarker = new google.maps.Marker({
            position: markerPosition,
            draggable: false,
            icon: markerIcon,
            zIndex: zIndex,
            map: layer.map
        });
        if (platform.isVisited) {
            let contentString =
                '<strong style="font-size: 15px;">' + platform.name + ' Platform transfers</strong>' +
                '<pre>';
            platform.visits.forEach(info => {
                if (info) {
                    contentString = contentString + '<br>' +
                        'Start: ' + this.dateTimeService.MatlabDateToJSTime(info.startTime) + '<br>' +
                        'Stop: ' + this.dateTimeService.MatlabDateToJSTime(info.stopTime) + '<br>' +
                        'Duration: ' + this.dateTimeService.MatlabDurationToMinutes(info.duration) + '<br>';
                }
            });
            contentString = contentString + '</pre>';
            const infowindow = new google.maps.InfoWindow({
                content: contentString,
                disableAutoPan: true,
            });
            // Need to define local function here since we cant use callbacks to other functions from this class in the listener callback
            const openInfoWindow = (marker, window) => {
                this.eventService.OpenAgmInfoWindow(window, [], layer.map, marker);
            };
            mymarker.addListener('mouseover', function () {
                openInfoWindow(mymarker, infowindow);
            });
        }
    }

    addVesselRouteToLayer(layer: MapZoomLayer, vesselRoutes: {lon: number[], lat: number[]}[]) {
        const lineSymbol = {
            path: google.maps.SymbolPath.FORWARD_CLOSED_ARROW
        };
        vesselRoutes.forEach(route => {
            return new google.maps.Polyline({
                clickable: false,
                map: layer.map,
                path: this.lonlatService.lonlatarrayToLatLngArray(route),
                strokeColor: '#FF0000',
                strokeWeight: 1.5,
                icons: [{
                    icon: lineSymbol,
                    offset: '0.5%'
                }, {
                    icon: lineSymbol,
                    offset: '10%'
                }, {
                    icon: lineSymbol,
                    offset: '20%'
                }, {
                    icon: lineSymbol,
                    offset: '30%'
                }, {
                    icon: lineSymbol,
                    offset: '40%'
                }, {
                    icon: lineSymbol,
                    offset: '50%'
                }, {
                    icon: lineSymbol,
                    offset: '60%'
                }, {
                    icon: lineSymbol,
                    offset: '70%'
                }, {
                    icon: lineSymbol,
                    offset: '80%'
                }, {
                    icon: lineSymbol,
                    offset: '90%'
                }, {
                    icon: lineSymbol,
                    offset: '100%'
                }],
            });
        });
    }

    addV2VtransfersToLayer(layer: MapZoomLayer, v2vTransfers: V2vTransfer[], vesselRoute: { time: number[], lon: number[], lat: number[] }) {
        // Adds v2v transfer locations to the map
        if (Array.isArray(v2vTransfers)) {
            v2vTransfers.forEach(_transfer => {
                const loc = this.getNearestLocation(vesselRoute, _transfer.stopTime / 2 + _transfer.startTime / 2);
                if (loc) {
                    layer.addData(new MapZoomData(
                        loc.lon,
                        loc.lat,
                        GmapService.iconVessel2VesselTransfer,
                        'V2V transfer',
                        '<strong style="font-size: 15px;">Transfer to ' + _transfer.toVesselname + '</strong><br>' +
                        'Start: ' + this.dateTimeService.MatlabDateToJSTime(_transfer.startTime) + '<br>' +
                        'Stop: ' + this.dateTimeService.MatlabDateToJSTime(_transfer.stopTime) + '<br>' +
                        'Duration: ' + this.dateTimeService.MatlabDurationToMinutes(_transfer.duration) + '<br>'
                    ));
                }
            });
        }
    }

    private getNearestLocation(locs: { time: number[], lon: number[], lat: number[] }, target: number, opts = { tolerance: 1 / 24 / 4 }) {
        // Gets the lons and lat coordinates of the vessel route closest to the target time stamp, with given tolerance
        let optimal = null;
        let minDist = opts.tolerance;
        if (isObject(locs) && isArray(locs.time) && isArray(locs.lon) && isArray(locs.lat)) {
            locs.time.forEach((_t: number, _i: number) => {
                if (Math.abs(_t - target) < minDist) {
                    minDist = Math.abs(_t - target);
                    optimal = {
                        time: _t[0] || _t,
                        lon: locs.lon[_i][0] || locs.lon[_i],
                        lat: locs.lat[_i][0] || locs.lat[_i],
                    };
                }
            });
        }
        return optimal;
    }

    plotParkBoundaries(googleMap: google.maps.Map, parkLocations, minZoom = 8, maxZoom = 30) {
        const parkBdrLayer = new MapZoomLayer(googleMap, minZoom, maxZoom);
        parkLocations.forEach(locations => {
            locations.forEach(field => {
                parkBdrLayer.addData(new MapZoomPolygon(
                    field.outlineLonCoordinates,
                    field.outlineLatCoordinates,
                    field.SiteName,
                    field.SiteName,
                ));
            });
        });
        parkBdrLayer.draw();
    }

    plotParkPictograms(googleMap: google.maps.Map, parkLocations, minZoom = 6, maxZoom = 7) {
        const parkLayer = new MapZoomLayer(googleMap, minZoom, maxZoom);
        parkLocations.forEach(locations => {
            locations.forEach(field => {
                parkLayer.addData(new MapZoomData(
                    field.centroid.lon,
                    field.centroid.lat,
                    GmapService.iconWindfield,
                    field.SiteName
                ));
            });
        });
        parkLayer.draw();
    }

    plotHarbours(googleMap: google.maps.Map, harbourLocations: Observable<HarbourModel[]>, minZoom = 7, maxZoom = 30) {
        const harbourLayer = new MapZoomLayer(googleMap, minZoom, maxZoom);
        harbourLocations.subscribe(harbourList => {
            harbourList.forEach(harbour => {
                harbourLayer.addData(new MapZoomData(
                    harbour.centroid.lon,
                    harbour.centroid.lat,
                    GmapService.iconHarbour,
                    GmapService.iconHarbour.description,
                    harbour.name.split('_').join(' '),
                ));
            });
        });
        harbourLayer.draw();
    }

    plotPlatforms(googleMap: google.maps.Map, platformLocations, minZoom = 10, maxZoom = 30) {
        const platformLayer = new MapZoomLayer(googleMap, minZoom, maxZoom);
        platformLocations.forEach(platformList => {
            platformList.forEach(platform => {
                platform.lon.forEach((_long, idx) => {
                    platformLayer.addData(new MapZoomData(
                        platform.lon[idx],
                        platform.lat[idx],
                        GmapService.iconPlatform,
                        platform.name[idx],
                        isArray(platform.name[0]) ? platform.name[0][idx] : platform.name[idx],
                        'click'
                    ));
                });
            });
        });
        platformLayer.draw();
    }
}

interface HarbourModel {
    lon: number[];
    lat: number[];
    _id: string;
    name: string;
    centroid: {
        lon: number;
        lat: number;
        radius: number;
    };
}
