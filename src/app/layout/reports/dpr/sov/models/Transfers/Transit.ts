export interface Transit {
    from: string;
    fromName: string;
    to: string;
    toName: string;
    day: string;
    timeString: string;
    dayNum: number
    vesselname: string;
    mmsi: number
    combineId: number;
    speedInTransitAvg: number
    speedInTransitAvgUnrestricted: string;
    distancekm: string;
    transitTimeMinutes: number;
    lon: any[];
    lat: any[];
    avHeading: number;
    date: number;
}