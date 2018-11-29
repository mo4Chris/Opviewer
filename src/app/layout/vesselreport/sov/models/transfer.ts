export abstract class Transfer {
    startTime: number;
    stopTime: number;
    vesselname: String;
    mmsi: Number;
    gangwayDeployedDuration: String;
    timeGangwayDeployed: String;
    timeGangwayReady: String;
    timeGangwayRetracted: String;
    timeGangwayStowed: String;
    peakWindGust: number;
    peakWindAvg: number;
    gangwayUtilisation: String;
    peakHeave: string;
    DPutilisation: string;
    current: String;
    Hs: number;
}
