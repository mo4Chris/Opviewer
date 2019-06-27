import { Injectable } from '@angular/core';
import { LonlatService } from '../supportModules/lonlat.service';
import { DatetimeService } from '../supportModules/datetime.service';
import { EventService } from '../supportModules/event.service';
import { ClusterManager } from '@agm/js-marker-clusterer';
import { mapLegend, mapMarkerIcon } from '../layout/dashboard/models/mapLegend';
import { MapZoomData, MapZoomLayer, MapZoomPolygon } from '../models/mapZoomLayer';

@Injectable({
    providedIn: 'root'
})
export class GmapService {
    constructor(
        private eventService: EventService,
        private lonlatService: LonlatService,
        private dateTimeService: DatetimeService,
        // private commonService: CommonService,
    ) {

    }
    iconWindfield: mapMarkerIcon = new mapMarkerIcon(
        '../assets/images/windTurbine.png',
        'Windfield',
        {
            width: 25,
            height: 25
        }
    );
    iconTurbine: mapMarkerIcon = new mapMarkerIcon(
        '../assets/images/turbineIcon.png',
        '',
        {
            width: 5,
            height: 5
        }
    );
    iconVisitedTurbine: mapMarkerIcon = new mapMarkerIcon(
        '../assets/images/visitedTurbineIcon.png',
        'Visited turbine',
        {
            width: 10,
            height: 10
        }
    );
    iconPlatform: mapMarkerIcon = new mapMarkerIcon(
        '../../assets/images/oil-platform.png',
        'Platform',
        {
            width: 10,
            height: 10
        }
    );
    iconVisitedPlatform: mapMarkerIcon = new mapMarkerIcon(
        '../assets/images/visitedPlatform.png',
        'Visited platform',
        {
            width: 10,
            height: 10
        }
    );
    iconHarbour: mapMarkerIcon = new mapMarkerIcon(
        '../assets/images/marina.png',
        'Harbour',
        {
            width: 20,
            height: 20
        }
    );
    iconVesselLive: mapMarkerIcon = new mapMarkerIcon(
        '../assets/images/grn-circle.png',
         'Updated last hour'
    );
    iconVesselHours: mapMarkerIcon = new mapMarkerIcon(
        '../assets/images/ylw-circle.png',
        'Updated < 6 hours',
    );
    iconVesselOld: mapMarkerIcon = new mapMarkerIcon(
        '../assets/images/red-circle.png',
        'Updated > 6 hours'
    );
    iconVesselCluster: mapMarkerIcon = new mapMarkerIcon(
        '../assets/clusterer/m1.png',
        'Cluster of vessels'
    );


    addTurbinesToMapForVessel(googleMap: google.maps.Map, vesselturbines, platformLocations) {
        // Drawing turbines
        vesselturbines.turbineLocations.forEach((turbineParkLocation, index) => {
            turbineParkLocation.forEach(parkLocation => {
                if (parkLocation.shipHasSailedBy) {
                    this.addVesselRouteTurbine(googleMap, this.iconVisitedTurbine, parkLocation.longitude, parkLocation.latitude, turbineParkLocation.map(docking => docking.transfer), parkLocation.location, 5);
                } else {
                    this.addVesselRouteTurbine(googleMap, this.iconTurbine, parkLocation.longitude, parkLocation.latitude, turbineParkLocation.map(docking => docking.transfer));
                }
            });
        });
        // Drawing platforms
        platformLocations.turbineLocations.forEach(platformArray => {
            platformArray.forEach(platform => {
                if (platform.shipHasSailedBy) {
                    this.addVesselRoutePlatform(googleMap, this.iconVisitedPlatform, platform.longitude, platform.latitude, platformArray.map(docking => docking.transfer), platform.location, 5);
                } else if (false) {
                    // ToDO Need to decide if we want to show all platforms. Maybe we use some sort of fancy merger similar to dashboard or show only above certain zoom level
                    this.addVesselRoutePlatform(googleMap, this.iconPlatform, platform.longitude, platform.latitude);
                }
            });
        });
    }

    addVesselRouteTurbine(map, markerIcon, lon, lat, infoArray = null, location = null, zIndex = 2) {
        const markerPosition = { lat: lat, lng: lon };
        const mymarker = new google.maps.Marker({
            position: markerPosition,
            draggable: false,
            icon: markerIcon,
            zIndex: zIndex,
            map: map
        });
        if (infoArray.length > 0 && infoArray[0]) {
            let contentString =
                '<strong style="font-size: 15px;">' + location + ' Turbine transfers</strong>' +
                '<pre>';
            infoArray.forEach(info => {
                contentString = contentString + '<br>' +
                    'Start: ' + this.dateTimeService.MatlabDateToJSTime(info.startTime) + '<br>' +
                    'Stop: ' + this.dateTimeService.MatlabDateToJSTime(info.stopTime) + '<br>' +
                    'Duration: ' + this.dateTimeService.MatlabDurationToMinutes(info.duration) + '<br>';
            });
            contentString = contentString + '</pre>';
            const infowindow = new google.maps.InfoWindow({
                content: contentString,
                disableAutoPan: true,
            });
            // Need to define local function here since we cant use callbacks to other functions from this class in the listener callback
            const openInfoWindow = (marker, window) => {
                this.eventService.OpenAgmInfoWindow(window, [], map, marker);
            };
            mymarker.addListener('mouseover', function () {
                openInfoWindow(mymarker, infowindow);
            });
        }
    }

    addVesselRoutePlatform(map, markerIcon, lon, lat, infoArray = null, location = null, zIndex = 2) {
        const markerPosition = { lat: lat, lng: lon };
        const mymarker = new google.maps.Marker({
            position: markerPosition,
            draggable: false,
            icon: markerIcon,
            zIndex: zIndex,
            map: map
        });
        if (infoArray.length > 0 && infoArray[0]) {
            let contentString =
                '<strong style="font-size: 15px;">' + location + ' Platform transfers</strong>' +
                '<pre>';
            infoArray.forEach(info => {
                contentString = contentString + '<br>' +
                    'Start: ' + this.dateTimeService.MatlabDateToJSTime(info.startTime) + '<br>' +
                    'Stop: ' + this.dateTimeService.MatlabDateToJSTime(info.stopTime) + '<br>' +
                    'Duration: ' + this.dateTimeService.MatlabDurationToMinutes(info.duration) + '<br>';
            });
            contentString = contentString + '</pre>';
            const infowindow = new google.maps.InfoWindow({
                content: contentString,
                disableAutoPan: true,
            });
            // Need to define local function here since we cant use callbacks to other functions from this class in the listener callback
            const openInfoWindow = (marker, window) => {
                this.eventService.OpenAgmInfoWindow(window, [], map, marker);
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
                    this.iconWindfield,
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
                    this.iconHarbour,
                    this.iconHarbour.description,
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
                        this.iconPlatform,
                        platform.name[idx],
                        platform.name[idx],
                        'click'
                    ));
                });
            });
        });
        platformLayer.draw();
    }
}
