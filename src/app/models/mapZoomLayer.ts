import { EventService } from '../supportModules/event.service';
import { mapMarkerIcon } from '../layout/dashboard/models/mapLegend';
import { isArray } from 'util';

export class MapZoomLayer {
    map: google.maps.Map;
    data: MapZoomChild[] = new Array<MapZoomChild>();
    minZoom: number;
    maxZoom: number;
    eventService: EventService = new EventService();
    private oldZoomLvl = 0;
    private layerEnabled: boolean;
    private isDrawn = false;

    constructor(map: google.maps.Map, minZoom = 7, maxZoom = 30) {
        this.map = map;
        this.minZoom = minZoom;
        this.maxZoom = maxZoom;
        this.setZoomCallbacks();
    }

    addData(newData: MapZoomChild) {
        if (!this.isDrawn) {
            this.data.push(newData);
        } else {
            this.data.push(newData);
            newData.addDataToLayer(this);
        }
        newData.setVisible(this.layerEnabled);
    }

    draw() {
        this.data.forEach((dataElement) => {
            dataElement.addDataToLayer(this);
        });
        this.isDrawn = true;
    }

    getIsDrawn() {
        return this.isDrawn;
    }

    reset() {
        this.data.forEach(data => {
            data.delete();
        });
        this.data = new Array<MapZoomChild>();
    }

    setMap(gmap: google.maps.Map) {
        this.data.forEach(data => {
            data.setMap(gmap);
        });
        this.map = gmap;
    }

    private zoomLevelIsInLimits (mapZoomLevel: number) {
        return mapZoomLevel >= this.minZoom && mapZoomLevel <= this.maxZoom;
    }

    private setZoomCallbacks() {
        this.map.addListener('zoom_changed', () => {
            const newZoomLvl = this.map.getZoom();
            if (this.oldZoomLvl !== newZoomLvl) {
                this.onZoom(newZoomLvl);
                this.oldZoomLvl = newZoomLvl;
            }
        });
        const mapZoomLevel = this.map.getZoom();
        this.layerEnabled = this.zoomLevelIsInLimits(mapZoomLevel);
    }

    private onZoom(mapZoomLevel: number) {
        const inLimits = this.zoomLevelIsInLimits(mapZoomLevel);
        if (!inLimits && this.layerEnabled) {
            this.data.forEach(elt => {
                elt.setVisible(false);
            });
            this.layerEnabled = false;
        } else if (inLimits && !this.layerEnabled) {
            this.data.forEach(elt => {
                elt.setVisible(true);
            });
            this.layerEnabled = true;
        }
    }
}

export abstract class MapZoomChild {
    description: string;
    popupMode: string;
    zIndex: number;
    protected visible: boolean;
    protected isDrawn: boolean = false;
    constructor() {
    }
    getVisible() {
        return this.visible;
    }

    abstract setMap(map: google.maps.Map): void;
    abstract setVisible(status: boolean): void;
    abstract addDataToLayer(dataLayer: MapZoomLayer): void;
    abstract delete(): void;
}

export class MapZoomData extends MapZoomChild {
    lon: number;
    lat: number;
    private marker: google.maps.Marker;
    markerIcon: mapMarkerIcon;
    private info: string;
    private infoWindow: google.maps.InfoWindow;
    private infoWindowEnabled: boolean;

    constructor(
        lon: number,
        lat: number,
        markerIcon: mapMarkerIcon,
        description: string,
        info = '',
        popupMode = 'mouseover',
        zIndex = 2,
        enableInfoWindow = true,
    ) {
        super()

        if (isArray(lon)) {
            this.lon = lon[0];
            this.lat = lat[0];
        } else {
            this.lon = lon;
            this.lat = lat;
        }
        this.markerIcon = markerIcon;
        this.description = description;
        this.popupMode = popupMode;
        this.infoWindowEnabled = enableInfoWindow;
        this.info = info;
        this.zIndex = zIndex;
    }

    delete() {
        this.marker.setMap(null);
    }

    getInfoWindowEnabled() {
        return this.infoWindowEnabled && this.info.length > 0;
    }

    setInfoWindowEnabled(newSetting: boolean) {
        if (!this.isDrawn) {
            this.infoWindowEnabled = newSetting;
        } else {
            // ToDo: allow users to enabled this setting later on
        }
    }

    getInfo() {
        return this.info;
    }

    setMap(map: google.maps.Map) {
        this.marker.setMap(map);
    }

    setVisible(newStatus: boolean) {
        this.visible = newStatus;
        if (this.isDrawn) {
            this.marker.setVisible(newStatus);
            if (this.infoWindow && !newStatus) {
                this.infoWindow.close();
            }
        }
    }

    addDataToLayer( layer: MapZoomLayer ) {
        if (this.isDrawn) {
            return;
        }
        const markerPosition = {lat: this.lat, lng: this.lon};
        this.marker = new google.maps.Marker({
            position: markerPosition,
            draggable: false,
            icon: this.markerIcon, // This is fine
            map: layer.map,
            zIndex: this.zIndex
        });
        // Adding infowindow if enabled
        if (this.getInfoWindowEnabled()) {
            this.infoWindow = new google.maps.InfoWindow({
                content: this.info,
                disableAutoPan: true,
            });
            const openInfoWindowCB = () => {
                layer.eventService.OpenAgmInfoWindow(this.infoWindow, [], layer.map, this.marker);
            };
            this.marker.addListener(this.popupMode, function () {
                openInfoWindowCB();
            });
        } else {
            this.marker.setClickable(false);
        }
        this.isDrawn = true;
    }
}


export class MapZoomPolygon extends MapZoomChild {
    lon: number[];
    lat: number[];
    private linetype = 'polygon';
    private polyline;
    private fillColor: string;
    private info: string;
    private infoWindow: google.maps.InfoWindow;
    private infoWindowEnabled: boolean;

    constructor(
        lons: number[],
        lats: number[],
        description: string,
        info = '',
        popupMode = 'click',
        linetype = 'polygon',
        fillColor = 'blue',
        zIndex = 2,
        enableInfoWindow = true,
    ) {
        super();
        this.lon = lons;
        this.lat = lats;
        this.description = description;
        this.popupMode = popupMode;
        this.infoWindowEnabled = enableInfoWindow;
        this.info = info;
        this.zIndex = zIndex;
        this.fillColor = fillColor;
        if (linetype === 'polygon' || linetype === 'polyline') {
            this.linetype = linetype;
        }
    }

    delete() {
        this.polyline.setMap(null);
    }

    getInfoWindowEnabled() {
        return this.infoWindowEnabled && this.info && this.info.length > 0;
    }

    setInfoWindowEnabled(newSetting: boolean) {
        if (!this.isDrawn) {
            this.infoWindowEnabled = newSetting;
        } else {
            // ToDo: allow users to enabled this setting later on
        }
    }

    getInfo() {
        return this.info;
    }

    centroid() {
        return {lat: this.mean(this.lat), lng: this.mean(this.lon)};
    }
     
    setMap(map: google.maps.Map) {
        this.polyline.setMap(map);
    }

    setVisible(newStatus: boolean) {
        this.visible = newStatus;
        if (this.isDrawn) {
            this.polyline.setVisible(newStatus);
            if (this.infoWindow && !newStatus) {
                this.infoWindow.close();
            }
        }
    }

    addDataToLayer( layer: MapZoomLayer ) {
        if (this.isDrawn) {
            return;
        }
        const markerPosition = this.concatLonLatArray(this.lon, this.lat);
        if (this.linetype === 'polygon') {
            this.polyline = new google.maps.Polygon({
                paths: [markerPosition],
                draggable: false,
                editable: false,
                clickable: this.getInfoWindowEnabled(),
                map: layer.map,
                zIndex: this.zIndex,
                visible: this.visible,
                fillColor: this.fillColor,
                strokeWeight: 2
            });
        } else{
            this.polyline = new google.maps.Polyline({
                path: markerPosition,
                draggable: false,
                editable: false,
                strokeColor: this.fillColor,
                geodesic: true,
                clickable: this.getInfoWindowEnabled(),
                map: layer.map,
                zIndex: this.zIndex,
                visible: this.visible,
                strokeWeight: 1.5
            });
        }

        // Adding infowindow if enabled
        if (this.getInfoWindowEnabled()) {
            this.infoWindow = new google.maps.InfoWindow({
                content: this.info,
                position: this.centroid(),
                disableAutoPan: true,
            });
            const openInfoWindowCB = () => {
                layer.eventService.OpenAgmInfoWindow(this.infoWindow, [], this.polyline.getMap(), this.polyline);
            };
            this.polyline.addListener(this.popupMode, function () {
                openInfoWindowCB();
            });
        }
        this.isDrawn = true;
    }

    private concatLonLatArray(lons: number[], lats: number[]) {
        const lonlatArray = [];
        let latt: number;
        if (isArray(lons)) {
            lons.forEach((long, idx) => {
                if (isArray(long)) {
                    latt = lats[idx][0];
                    lonlatArray.push({lng: long[0], lat: latt});
                } else {
                    latt = lats[idx];
                    lonlatArray.push({lng: long, lat: latt});
                }
            });
        }
        return lonlatArray;
    }

    private mean(elmt: number[]) {
        let sum = 0;
        elmt.forEach(element => {
            sum += element;
        });
        return sum / elmt.length;
    }
}
