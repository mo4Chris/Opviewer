import { isArray } from 'util';
import { MapZoomData } from './mapZoomLayer';
import { GmapService } from '../supportModules/gmap.service';
import { CalculationService } from '../supportModules/calculation.service';


export class WavedataModel {
    active: boolean;
    date: Number;

    site: string;
    meta: WaveSourceModel;
    wavedata: {
        timeStamp: number[];
        Hs: number[];
        Tp: number[];
        waveDir: number[];
        wind: number[];
        windDir: number[];
    };

    static mergeWavedataArray(arr: Array<WavedataModel | {wavedata: RawWaveData}>) {
        const calcService = new CalculationService;
        const merged = {
            timeStamp: [],
            Hs: [],
            Tp: [],
            waveDir: [],
            wind: [],
            windDir: [],
        };
        const params = ['Hs', 'Tp', 'waveDir', 'wind', 'windDir'];
        arr.forEach(wavedata => {
            merged.timeStamp = merged.timeStamp.concat(wavedata.wavedata.timeStamp);
            params.forEach( param => {
                const vals = wavedata.wavedata[param];
                if (vals && vals.length === wavedata.wavedata.timeStamp.length) {
                    merged[param] = merged[param].concat(vals);
                } else {
                    wavedata.wavedata.timeStamp.forEach(() => {
                        merged[param].push(NaN);
                    });
                }
            });
        });
        // We sort here just to be sure - there have been some irregularities in the past
        const sortedIdx = calcService.sortIndices(merged.timeStamp);
        merged.timeStamp = calcService.sortViaIndex(merged.timeStamp, sortedIdx);
        params.forEach(param => {
            merged[param] = calcService.sortViaIndex(merged[param], sortedIdx);
        });
        return merged;
    }

    static getMetaFromWavedataArrayByDate(arr: WavedataModel[], matlabDate: number) {
        const index = arr.findIndex(((wavedata) => wavedata.date === matlabDate));
        if (index === -1) {
            return null;
        } else {
            return arr[index].meta;
        }
    }

    constructor(objLiteral?: Object) {
        if (objLiteral) {
            const temp: WavedataModel = Object.assign(new WavedataModel(), objLiteral);
            temp.meta = new WaveSourceModel(temp.meta);
            temp.cleanWavedata();
            return temp;
        }
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

    constructor(objLiteral?: Object) {
        if (objLiteral) {
            return Object.assign(new WaveSourceModel(), objLiteral);
        }
    }

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

export interface RawWaveData {
    source: string;
    timeStamp: number[];
    Hs?: number[];
    Ts?: number[];
    Tp?: number[];
    Tz?: number[];
    Hmax?: number[];
    waveDir?: number[];
    wavePeakDir?: number[];
    windSpeed?: number[];
    windGust?: number[];
    windDir?: number[];
}