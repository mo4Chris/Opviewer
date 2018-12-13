export class SovData {
    day: string;
    dayNum: number;
    vesselname: string;
    mmsi: number;
    timeBreakdown: any;
    seCoverageHours: string;
    distancekm: any;
    arrivalAtHarbour: string;
    departureFromHarbour: string;
    lon: any[];
    lat: any[];

    constructor() {
        this.lon = [];
        this.lat = [];
    }
}