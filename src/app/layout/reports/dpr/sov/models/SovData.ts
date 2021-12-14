export class SovData {
    day: string;
    dayNum: number;
    vesselname: string;
    mmsi: number;
    weatherConditions: weatherConditionModel;
    timeBreakdown: any;
    seCoverageHours: string;
    distancekm: number | string;
    arrivalAtHarbour: string;
    departureFromHarbour: string;
    time: number[] | number[][];
    lon: any[] | number[][];
    lat: any[] | number [][];

    constructor() {
        this.lon = [];
        this.lat = [];
    }
}

interface weatherConditionModel {
    wavesource: string;
    time: number[];
    waveDirection: number[];
    waveHs: number[];
    waveTp: number[];
    windAvg: number[];
    windGust: number[];
}
