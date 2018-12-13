export abstract class Transfer {
    startTime: number;
    stopTime: number;
    vesselname: String;
    mmsi: Number;
    gangwayDeployedDuration: number;
    timeGangwayDeployed: String;
    timeGangwayReady: String;
    timeGangwayRetracted: String;
    timeGangwayStowed: String;
    peakWindGust: number;
    peakWindAvg: number;
    gangwayUtilisation: String;
    gangwayUtilisationLimiter: string;
    gangwayUtilisationTrace: any;
    peakHeave: string;
    DPutilisation: string;
    current: string;
    Hs: string;
    angleToAsset: number;
    lon: number;
    lat: number;
}
