import { Injectable } from '@angular/core';
import { LonlatService } from '../supportModules/lonlat.service';
import { DatetimeService } from '../supportModules/datetime.service';
import { EventService } from '../supportModules/event.service';
import { mapLegend, mapMarkerIcon } from '../layout/dashboard/models/mapLegend';
import { MapZoomData, MapZoomLayer, MapZoomPolygon } from '../models/mapZoomLayer';
import { VesselTurbines, VesselPlatforms } from '../layout/vesselreport/models/VesselTurbines';
import { isArray } from 'util';

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
        '../assets/images/windTurbine.png',
        'Windfield',
        {
            width: 25,
            height: 25
        }
    );
    static iconTurbine: mapMarkerIcon = new mapMarkerIcon(
        '../assets/images/turbineIcon.png',
        '',
        {
            width: 5,
            height: 5
        }
    );
    static iconVisitedTurbine: mapMarkerIcon = new mapMarkerIcon(
        '../assets/images/visitedTurbineIcon.png',
        'Visited turbine',
        {
            width: 10,
            height: 10
        }
    );
    static iconPlatform: mapMarkerIcon = new mapMarkerIcon(
        '../assets/images/oil-platform.png',
        'Platform',
        {
            width: 10,
            height: 10
        }
    );
    static iconVisitedPlatform: mapMarkerIcon = new mapMarkerIcon(
        '../assets/images/visitedPlatform.png',
        'Visited platform',
        {
            width: 10,
            height: 10
        }
    );
    static iconHarbour: mapMarkerIcon = new mapMarkerIcon(
        '../assets/images/marina.png',
        'Harbour',
        {
            width: 20,
            height: 20
        }
    );
    static iconVesselLive: mapMarkerIcon = new mapMarkerIcon(
        '../assets/images/grn-circle.png',
         'Updated last hour'
    );
    static iconVesselHours: mapMarkerIcon = new mapMarkerIcon(
        '../assets/images/ylw-circle.png',
        'Updated < 6 hours',
    );
    static iconVesselOld: mapMarkerIcon = new mapMarkerIcon(
        '../assets/images/red-circle.png',
        'Updated > 6 hours'
    );
    static iconVesselCluster: mapMarkerIcon = new mapMarkerIcon(
        '../assets/clusterer/m1.png',
        'Cluster of vessels'
    );
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

    addVesselRouteTurbine(googleMap: google.maps.Map, markerIcon: mapMarkerIcon, lon: number, lat: number, infoArray = null, location = null, zIndex = 2) {
        this.buildLayerIfNotPresent(googleMap);
        let contentString = '';
        if (infoArray !== undefined && infoArray !== null && infoArray.length > 0 && infoArray[0]) {
            contentString =
                '<strong style="font-size: 15px;">' + location + ' Turbine transfers</strong>' +
                '<pre>';
            infoArray = infoArray.filter(function(elem) {
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

    addVesselRouteToGoogleMap(googleMap, vesselRoutes) {
        const lineSymbol = {
            path: google.maps.SymbolPath.FORWARD_CLOSED_ARROW
        };
        vesselRoutes.forEach(route => {
            new google.maps.Polyline({
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

    plotParkBoundaries(googleMap, parkLocations, minZoom = 8, maxZoom = 30) {
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

    plotParkPictograms(googleMap, parkLocations, minZoom = 6, maxZoom = 7) {
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

    plotHarbours(googleMap, harbourLocations, minZoom = 7, maxZoom = 30) {
        const harbourLayer = new MapZoomLayer(googleMap, minZoom, maxZoom);
        harbourLocations.forEach(harbourList => {
            harbourList.forEach(harbour => {
                harbourLayer.addData(new MapZoomData(
                    harbour.centroid.lon,
                    harbour.centroid.lat,
                    GmapService.iconHarbour,
                    GmapService.iconHarbour.description,
                ));
            });
        });
        harbourLayer.draw();
    }

    plotPlatforms(googleMap, platformLocations, minZoom = 10, maxZoom = 30) {
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
