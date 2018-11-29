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
    peakHeave: String;
    DPutilisation: String;
    current: String;
    Hs: number;
}
