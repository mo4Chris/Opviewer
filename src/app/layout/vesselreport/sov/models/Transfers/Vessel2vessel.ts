export class Vessel2vesselModel {
    vesselname: string;
    mmsi: number;
    startTime: number;
    stopTime: number;
    duration: number;
    toVesselname: string;
    toMMSI: number;
    peakWindGust: number;
    peakWindAvg: number;
    DPutilisation: number;
    current: number;
    Hs: number;
    Ts: number;
    turbineActivity: any[];
    date: number;
}