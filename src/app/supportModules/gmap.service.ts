import { Injectable } from '@angular/core';
import { LonlatService } from '../supportModules/lonlat.service';
import { DatetimeService } from '../supportModules/datetime.service';
import { EventService } from '../supportModules/event.service';
import { mapLegend, mapMarkerIcon } from '../layout/dashboard/models/mapLegend';
import { MapZoomData, MapZoomLayer, MapZoomPolygon } from '../models/mapZoomLayer';
import { isArray, isNull, isObject } from 'util';
import { Observable } from 'rxjs';
import { VesselTurbines, VesselPlatforms } from '../layout/reports/dpr/models/VesselTurbines';
import { V2vTransfer } from '@app/layout/reports/dpr/sov/models/Transfers/vessel2vessel/V2vTransfer';
import { TurbinePark, OffshorePlatform } from '@app/stores/map.store';
import { TurbineParkWithDrawData, OffshorePlatformWithData } from '@app/layout/reports/dpr/map/dpr-map/dpr-map.component';

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

    layersInitialized = false;
    vesselRouteTurbineLayer: MapZoomLayer;
    unvisitedPlatformLayer: MapZoomLayer;

    reset() {
        if (this.layersInitialized) {
            this.vesselRouteTurbineLayer.reset();
            this.unvisitedPlatformLayer.reset();
            this.layersInitialized = false; // This ensures that the correct map will be set when switching between pages
        }
    }

    buildLayerIfNotPresent(googleMap: google.maps.Map) {
        if (!this.layersInitialized) {
            this.vesselRouteTurbineLayer = new MapZoomLayer(googleMap, 8);
            this.vesselRouteTurbineLayer.draw();
            this.unvisitedPlatformLayer = new MapZoomLayer(googleMap, 10);
            setTimeout(() => {
                // Platform layer is drawn only after 500 ms delay to keep map responsive
                this.unvisitedPlatformLayer.draw();
            }, 500);
            this.layersInitialized = true;
        }
    }

    addTurbinesToMapForVessel(googleMap: google.maps.Map, vesselturbines: VesselTurbines, platformLocations: VesselPlatforms) {
        // Drawing turbines
        this.buildLayerIfNotPresent(googleMap);
        vesselturbines.turbineLocations.forEach((turbineParkLocation, index) => {
            turbineParkLocation.forEach(parkLocation => {
                if (parkLocation.shipHasSailedBy) {
                    this.addVesselRouteTurbine(googleMap, GmapService.iconVisitedTurbine, parkLocation.longitude, parkLocation.latitude, turbineParkLocation.map(docking => docking.transfer), parkLocation.location, 5);
                } else {
                    this.addVesselRouteTurbine(googleMap, GmapService.iconTurbine, parkLocation.longitude, parkLocation.latitude, turbineParkLocation.map(docking => docking.transfer));
                }
            });
        });
        // Drawing platforms
        platformLocations.turbineLocations.forEach(platformArray => {
            platformArray.forEach(platform => {
                if (platform.shipHasSailedBy) {
                    this.addVesselRoutePlatform(googleMap, GmapService.iconVisitedPlatform, platform.longitude, platform.latitude, platformArray.map(docking => docking.transfer), platform.location, 5);
                } else {
                    this.unvisitedPlatformLayer.addData(new MapZoomData(platform.longitude, platform.latitude, GmapService.iconPlatform, 'Unvisited platform', platform.location, 'click'));
                }
            });
        });
    }

    addParksToMapForVessel(map: google.maps.Map, parks: TurbineParkWithDrawData[], platforms: OffshorePlatformWithData[]) {
        // Drawing turbines
        let outlineLayer = new MapZoomLayer(map, 5, 10);
        this.buildLayerIfNotPresent(map);
        parks.forEach((park, index) => {
            if (park.isVisited) {
                park.turbines.forEach((_turb, _i) => {
                    if (_turb.isVisited) {
                        this.addVesselRouteTurbine(map, GmapService.iconVisitedTurbine, _turb.lon, _turb.lat,  _turb.visits, _turb.name, 5);
                    } else {
                        this.addVesselRouteTurbine(map, GmapService.iconTurbine, _turb.lon, _turb.lat, null);
                    }
                })
            } else {
                this.addParkOutlineToLayer(outlineLayer, park);
            }
        });
        // Drawing platforms
        platforms.forEach(_platform => {
            this.addPlatformToLayer(outlineLayer, _platform)
        })
        outlineLayer.draw();
    }
    
    private addParkOutlineToLayer(layer: MapZoomLayer, park: TurbineParkWithDrawData) {
        layer.addData(new MapZoomPolygon(
            park.outline.lon,
            park.outline.lat,
            park.name,
            park.name,
        ));
    }
    private addPlatformToLayer(layer: MapZoomLayer, platform: OffshorePlatformWithData) {
        layer.addData(new MapZoomData(
            platform.lon,
            platform.lat,
            platform.isVisited ? GmapService.iconVisitedPlatform : GmapService.iconPlatform,
            platform.name,
        ));
    }

    addVesselRouteTurbine(googleMap: google.maps.Map, markerIcon: mapMarkerIcon, lon: number, lat: number, infoArray = null, location = null, zIndex = 2) {
        this.buildLayerIfNotPresent(googleMap);
        let contentString = '';
        if (infoArray !== undefined && infoArray !== null && infoArray.length > 0 && infoArray[0]) {
            contentString =
                '<strong style="font-size: 15px;">' + location + ' Turbine transfers</strong>' +
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
        this.vesselRouteTurbineLayer.addData(new MapZoomData(
            lon,
            lat,
            markerIcon,
            'Turbine',
            contentString
        ));
    }

    addVesselRoutePlatform(googleMap: google.maps.Map, markerIcon: mapMarkerIcon, lon: number, lat: number, infoArray = null, location = null, zIndex = 2) {
        this.buildLayerIfNotPresent(googleMap);
        const markerPosition = { lat: lat, lng: lon };
        const mymarker = new google.maps.Marker({
            position: markerPosition,
            draggable: false,
            icon: markerIcon,
            zIndex: zIndex,
            map: googleMap
        });
        if (infoArray.length > 0 && infoArray[0]) {
            let contentString =
                '<strong style="font-size: 15px;">' + location + ' Platform transfers</strong>' +
                '<pre>';
            infoArray.forEach(info => {
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
                this.eventService.OpenAgmInfoWindow(window, [], googleMap, marker);
            };
            mymarker.addListener('mouseover', function () {
                openInfoWindow(mymarker, infowindow);
            });
        }
    }

    addVesselRouteToGoogleMap(googleMap: google.maps.Map, vesselRoutes: {lon: number[], lat: number[]}[]) {
        const lineSymbol = {
            path: google.maps.SymbolPath.FORWARD_CLOSED_ARROW
        };
        vesselRoutes.forEach(route => {
            return new google.maps.Polyline({
                clickable: false,
                map: googleMap,
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

    addV2VtransfersToMap(map: google.maps.Map, v2vTransfers: V2vTransfer[], vesselRoute: { time: number[], lon: number[], lat: number[] }) {
        // Adds v2v transfer locations to the map
        if (isArray(v2vTransfers)) {
            v2vTransfers.forEach(_transfer => {
                const loc = this.getNearestLocation(vesselRoute, _transfer.stopTime / 2 + _transfer.startTime / 2);
                if (loc) {
                    this.vesselRouteTurbineLayer.addData(new MapZoomData(
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
