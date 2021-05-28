export interface PlatformTransfer {
    _id: string;
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
    gangwayDeployedDuration: number;
    gangwayReadyDuration: number;
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
    Hmax: string;
    angleToAsset: number;
    distanceToAsset: number;
    lon: number;
    lat: number;
    paxCntEstimate: string;
    TexitExclusionZone: number;

    date?:  number ;
    paxIn?:  number | string ;
    paxOut?:  number | string ;
    cargoIn?: number ;
    cargoOut?: number ;
    default_paxIn?: number | string;
    default_paxOut?:  number | string;
}
