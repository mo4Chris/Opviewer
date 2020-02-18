export class SovData {
    day: string;
    dayNum: number;
    vesselname: string;
    mmsi: number;
    weatherConditions: weatherConditionModel;
    timeBreakdown: any;
    seCoverageHours: string;
    distancekm: string;
    arrivalAtHarbour: string;
    departureFromHarbour: string;
    lon: any[];
    lat: any[];

    constructor() {
        this.lon = [];
        this.lat = [];
    }
}

interface weatherConditionModel{
    wavesource: string;
    time: number[];
    waveDirection: number[];
    waveHs: number[];
    waveTp: number[];
    windAvg: number[];
    windGust: number[];
}