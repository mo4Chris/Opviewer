export class TurbineTransfer {
    _id: string;
    vesselname: string;
    mmsi: number;
    location: string;
    startTime: number;
    stopTime: number;
    duration: number;
    fieldname: string;
    date: number;

    gangwayDeployedDuration: number;
    gangwayReadyDuration: number;
    gangwayUtilisation: string;
    gangwayUtilisationLimiter: string;
    timeGangwayDeployed: number;
    timeGangwayReady: string;
    timeGangwayRetracted: string;
    timeGangwayStowed: number;
    DPutilisation: string;
    angleToAsset: number;
    alarmsPresent: string;
    positionalStabilityRadius: string;

    peakWindGust: number;
    peakWindAvg: string;
    motionsEnvelope: string;
    peakHeave: string;
    approachTime: string;
    windArray: any;
    current: string;
    Hs: string;
    Ts: string;
    lon: number;
    lat: number;

    paxCntEstimate: string;
    detector: string;
    gangwayUtilisationTrace: string;
    positionalStability: string;
    windArray: any;
    date: number;
    paxIn: number ;
    paxOut: number ;
    cargoIn: number ;
    cargoOut: number ;
}
