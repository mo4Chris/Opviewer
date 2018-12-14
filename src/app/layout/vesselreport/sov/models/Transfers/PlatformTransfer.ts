export class PlatformTransfer {

    vesselname: string; 
    mmsi: number;
    locationname: string;
    Tentry1000mWaitingRange: number;
    TentryExclusionZone: number;
    arrivalTimePlatform: number;
    departureTimePlatform: number;
    timeInWaitingZone: number;
    approachTime: number;
    visitDuration: number;
    totalDuration: number;
    gangwayDeployedDuration: string;
    gangwayReadyDuration: string;
    timeGangwayDeployed: string;
    timeGangwayReady: string;
    timeGangwayRetracted: string;
    timeGangwayStowed: string;
    peakWindGust: string;
    peakWindAvg: string;
    windArray: any;
    gangwayUtilisation: string;
    gangwayUtilisationTrace: any;
    gangwayUtilisationLimiter: string; 
    alarmsPresent: string;
    motionsEnvelope: string;
    peakHeave: string;
    DPutilisation: string;
    positionalStability: string;
    positionalStabilityRadius: string;
    current: string;
    Hs: string;
    angleToAsset: number;
    distanceToAsset: number;
    lon: number;
    lat: number;
    paxCntEstimate: string;
    TexitExclusionZone: number;
    date: { type: Number }
}
