import { EventService } from '../supportModules/event.service';

export class MapZoomLayer {
    map: google.maps.Map;
    data = new Array<MapZoomData>();
    minZoom: number;
    maxZoom: number;
    private oldZoomLvl = 0;
    private layerEnabled: boolean;
    private isDrawn = false;

    constructor(map: google.maps.Map, minZoom = 7, maxZoom = 30) {
        this.map = map;
        this.minZoom = minZoom;
        this.maxZoom = maxZoom;
        this.setZoomCallbacks();
    }

    addData(data: MapZoomData) {
        if (!this.isDrawn) {
            this.data.push(data);
        } else {
            this.data.push(data);
            data.addDataToLayer(this);
        }
        data.setVisible(this.layerEnabled);
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
        this.layerEnabled = this.zoomLevelIsInLimits(mapZoomLevel)
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

export class MapZoomData {
    description: string;
    image: string;
    scaledSize: object;
    lon: number;
    lat: number;
    zIndex = 2;
    private info: string;
    private visible: boolean;
    private infoWindowEnabled: boolean;
    private isDrawn = false;
    private marker: google.maps.Marker;
    private eventService: EventService;

    constructor(
        lon: number,
        lat: number,
        image: string,
        description: string,
        visible = true,
        info = '',
        enableInfoWindow = true,
        scaledSize = {width: 20, height: 20},
    ) {
        this.lon = lon;
        this.lat = lat;
        this.image = image;
        this.description = description;
        this.scaledSize = scaledSize;
        this.visible = visible;
        this.infoWindowEnabled = enableInfoWindow;
        this.info = info;
    }

    getInfoWindowEnabled() {
        return this.infoWindowEnabled && this.info.length > 0;
    }

    setInfoWindowEnabled(newSetting: boolean) {
        if (!this.isDrawn){
            this.infoWindowEnabled = newSetting;
        } else {
            // ToDo: allow users to enabled this setting later on
        }
    }

    getVisible() {
        return this.visible;
    }

    setVisible(newStatus: boolean) {
        this.visible = newStatus;
        if (this.isDrawn) {
            this.marker.setVisible(newStatus);
        }
    }

    getInfo() {
        return this.info;
    }

    addDataToLayer( layer: MapZoomLayer ) {
        if (this.isDrawn) {
            return;
        }
        const markerPosition = {lat: this.lat, lng: this.lon};
        const markerIcon = {
            url: this.image,
            scaledSize: this.scaledSize
        }
        this.marker = new google.maps.Marker({
            position: markerPosition,
            draggable: false,
            icon: markerIcon, // Not sure why it is compaining, it is working
            map: layer.map,
            zIndex: this.zIndex,
            visible: this.visible
        });
        // Adding infowindow if enabled
        if (this.getInfoWindowEnabled()) {
            const infoWindow = new google.maps.InfoWindow({
                content: this.info,
                disableAutoPan: true,
            });
            const openInfoWindowCB = () => {
                this.eventService.OpenAgmInfoWindow(infoWindow, [], layer.map, this.marker);
            };
            this.marker.addListener('mouseover', function () {
                openInfoWindowCB();
            });
        } else {
            this.marker.setClickable(false);
        }
        this.isDrawn = true;
    }
}



