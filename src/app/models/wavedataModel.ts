import { isArray } from "util";
import { MapZoomData } from "./mapZoomLayer";
import { GmapService } from "../supportModules/gmap.service";


export class WavedataModel {
    constructor(objLiteral?: Object) {
        if (objLiteral) {
            const temp: WavedataModel = Object.assign(new WavedataModel(), objLiteral);
            temp.meta = new WaveSourceModel(temp.meta);
            temp.cleanWavedata();
            return temp;
        }
    }

    active: boolean;
    date: Number;

    site: string;
    wavedata: {
        timeStamp: number[];
        Hs: number[];
        Tp: number[];
        waveDir: number[];
        wind: number[];
        windDir: number[];
    };

    meta: WaveSourceModel;

    merge(other: WavedataModel) {
        this.wavedata.timeStamp.concat(other.wavedata.timeStamp);
    }

    cleanWavedata() {
        const Keys = Object.keys(this.wavedata);
        Keys.forEach((key) => {
            this.wavedata[key] = this.cleanArray(this.wavedata[key]);
        });
    }

    cleanArray(arr: any) {
        if (!isArray(arr)) {
            return [arr];
        } else if (arr.length === 1) {
            // We dont allow wavedata consisting of only 1 point
            return null;
        } else if (isArray(arr[0])) {
            return arr.map( elt => elt[0] );
        } else {
            return arr;
        }
    }

    availableWaveParameters(): string[] {
        const params = Object.keys(this.wavedata);
        return params.filter(param => {
            if (param === 'timeStamp') {
                return false;
            }
            const arr = this.wavedata[param];
            return arr !== null && arr.some(elt => elt !== null && elt !== '_NaN_');
        });
    }
}

export class WaveSourceModel {
    constructor(objLiteral?: Object) {
        if (objLiteral) {
            return Object.assign(new WaveSourceModel(), objLiteral);
        }
    }

    name: string;
    info: string;
    clients: string | string [];

    provider: string;
    site: string;

    active: boolean;
    lat: number | null;
    lon: number | null;

    source: {
        Hs: string,
        Tp: string,
        waveDir: string,
        wind: string,
        windDir: string,
    };

    getLatLng() {
        if (this.lon !== null && this.lat !== null) {
            return {lat: this.lat, lng: this.lon};
        } else {
            return null;
        }
    }

    asMapZoomData() {
        if (this.lon && this.lat) {
            return new MapZoomData(
                this.lon,
                this.lat,
                GmapService.iconWaveSource,
                this.name,
                this.site + '<br>' +
                'Wave source: ' + this.name + '<br>' +
                this.info,
                'click',
                1,
                true
            );
        } else {
            return null;
        }
    }

    drawOnMap(map: google.maps.Map) {
        if (this.lon && this.lat) {
            this.asMapZoomData().setMap(map);
        }
    }
}
