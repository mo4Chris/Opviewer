import { Injectable } from '@angular/core';
import { LonlatService } from '../supportModules/lonlat.service';
import { DatetimeService } from '../supportModules/datetime.service';
import { EventService } from '../supportModules/event.service';
import { ClusterManager } from '@agm/js-marker-clusterer';
import { MapZoomLayer } from '../models/mapZoomLayer';

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
    iconMarker = {
        url: '../../assets/images/turbineIcon.png',
        scaledSize: {
            width: 5,
            height: 5
        }
    };

    visitedIconMarker = {
        url: '../../assets/images/visitedTurbineIcon.png',
        scaledSize: {
            width: 10,
            height: 10
        }
    };

    platformMarker = {
        url: '../../assets/images/oil-platform.png',
        scaledSize: {
            width: 10,
            height: 10
        }
    };
    visitedPlatformMarker = {
        url: '../../assets/images/visitedPlatform.png',
        scaledSize: {
            width: 10,
            height: 10
        }
    };

    initGoogleMap() {
        const gmap = 1;
        return gmap;
    }

    addTurbinesToMapForVessel(googleMap, turbineLocations, platformLocations) {
        console.log(turbineLocations)
        turbineLocations.forEach((turbineParkLocation, index) => {
            if (turbineParkLocation[0].shipHasSailedBy) {
                this.addMarkerToGoogleMap(googleMap, this.visitedIconMarker, turbineParkLocation[0].longitude, turbineParkLocation[0].latitude, turbineParkLocation.map(docking => docking.transfer), turbineParkLocation[0].location, 5);
            } else {
                this.addMarkerToGoogleMap(googleMap, this.iconMarker, turbineParkLocation[0].longitude, turbineParkLocation[0].latitude, turbineParkLocation.map(docking => docking.transfer));
            }
        });
        platformLocations.turbineLocations.forEach(platform => {
            if (platform[0].shipHasSailedBy) {
                this.addMarkerToGoogleMap(googleMap, this.visitedPlatformMarker, platform[0].longitude, platform[0].latitude, platform.map(docking => docking.transfer), platform[0].location, 5);
            } else if (false) {
                // ToDO Need to decide if we want to show all platforms. Maybe we use some sort of fancy merger similar to dashboard or show only above certain zoom level
                this.addMarkerToGoogleMap(googleMap, this.platformMarker, platform[0].longitude, platform[0].latitude);
            }
        });

    }

    addTurbinesToMapForDashboard(googleMap, parkLocations) {
        // const parkLocations = this.commonService.getParkLocations();
        console.log(parkLocations)
        // const turbineLayer = new MapZoomLayer(googleMap, 8);
        // const fieldsLayer = new MapZoomLayer(googleMap);
    }

    addMarkerToGoogleMap(map, markerIcon, lon, lat, infoArray = null, location = null, zIndex = 2) {
        const markerPosition = { lat: lat, lng: lon };
        const mymarker = new google.maps.Marker({
            position: markerPosition,
            draggable: false,
            icon: markerIcon,
            zIndex: zIndex
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

    addVesselRouteToGoogleMap(googleMap, vesselRoutes) {
        const lineSymbol = {
            path: google.maps.SymbolPath.FORWARD_CLOSED_ARROW
        };
        vesselRoutes.forEach(vessel => {
            new google.maps.Polyline({
                clickable: false,
                map: googleMap,
                path: this.lonlatService.lonlatarrayToLatLngArray(vessel),
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
}