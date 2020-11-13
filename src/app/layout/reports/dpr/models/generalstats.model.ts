


type NaNnumber = '_NaN_' | number;
type matArray = {
    _ArrayType_: 'double',
    _ArraySize_: Array<any>,
    _ArrayData_: null
} | Array<number> | Array<Array<number>>;

export interface CTVGeneralStatsModel {
    _id: string;
    date: number;
    DPRstats: '_NaN_' | CtvDprStatsModel;
    distancekm: NaNnumber;
    harbourEvents: Object;
    lat: matArray;
    lon: matArray;
    lockEvents: Object;
    minutesFloating: NaNnumber;
    minutesInField: NaNnumber;
    mmsi: number;
    speed: matArray;
    speedRestrictedEvents: Object;
    time: matArray;
    utcOffset: number;
    inputStats?: any;
    WindFarmArrivalTime: string;
    departureWindFarmTime: string;
    portArrivalTime: string;
    portDepartureTime: any;
    visitedPark: string;
    FuelEcon: any;
    MsiOutbound: any;
    MsiInbound: any;
    sailedDistance: any;
    AvgSpeedOutbound: any;
    AvgSpeedInbound: any;
    AvgSpeedOutboundUnrestricted: any;
    AvgSpeedInboundUnrestricted: any;
    AverageDockedTime: any;
    videoRequestPermission: any;
    WBVtechs: any;
    WBVcrew: any;
}


type NAnumber = 'n/a' | number;
export interface CtvDprStatsModel {
    portDepartureTime: NAnumber;
    WindFarmArrivalTime: NAnumber;
    sailedDistance: NAnumber;
    AvgSpeedOutbound: NAnumber;
    AvgSpeedOutboundUnrestricted: NAnumber;
    MsiOutbound: NAnumber;
    WBVtechs: NAnumber;
    numDockings: NAnumber;
    departureWindFarmTime: NAnumber;
    portArrivalTime: NAnumber;
    TotalFuel: NAnumber;
    FuelEcon: NAnumber;
    AvgSpeedInbound: NAnumber;
    AvgSpeedInboundUnrestricted: NAnumber;
    MsiInbound: NAnumber;
    WBVcrew: NAnumber;
    AverageDockedTime: string;
    WBVtech: any;
}
