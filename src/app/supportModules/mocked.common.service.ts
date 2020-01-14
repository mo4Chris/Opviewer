import { CommonService, StatsRangeRequest } from '../common.service';
import { mockedObservable } from '../models/testObservable';
import { VesselModel } from '../models/vesselModel';
import { Observable } from 'rxjs';
import { UserTestService } from '../shared/services/test.user.service';
import { UserModel } from '../models/userModel';
import { CampaignModel } from '../layout/TWA/models/campaignModel';
import { CalculationService } from './calculation.service';


const emptyMatlabObject = {
    _ArrayType_: 'double',
    _ArraySize_: [0, 0],
    _ArrayData_: null,
};

export class MockedCommonService extends CommonService {
    constructor() {
        // We build the superclass CommonService using a null http class (since we dont want internet traffic)
        super(null);
    }

    loadUserSettings() {
        return mockedObservable({});
    }

    // Overriding the get and post methods as we want to know about any uncaught requests made to the server.
    get(request_url: string) {
         console.error('Uncaught get request: ' + request_url);
         const Response: any = 0;
         return Response;
    }

    post(request_url: string, payload = []) {
         console.error('Uncaught post request: ' + request_url);
         const Response: any = 0;
         return Response;
    }

    validatePermissionToViewData(opts: {
        mmsi?: number,
        vesselname?: string,
        nicename?: string,
        client?: any,
        Site?: string,
        onHire?: 0 | 1,
        operationsClass?: VesselType,
    } = {}): Observable<VesselModel> {
        const defaults = this.getVesselDefault()[0];
        return mockedObservable([{...defaults, ...opts}]);
    }

    getDatesWithValues(vesselObject: VesselObjectModel) {
        // When using async, such as mockedObservable, this does not point to the MockedCommonService
        const T = linspace(vesselObject.date - 10, vesselObject.date, 1);
        return mockedObservable(T);
    }
    getDatesWithValuesFromGeneralStats(vesselObject: VesselObjectModel) {
        const T = linspace(vesselObject.date - 12, vesselObject.date - 2, 1);
        return mockedObservable(T);
    }
    getDatesShipHasSailedForSov(vesselObject: VesselObjectModel) {
        const T = linspace(vesselObject.date - 12, vesselObject.date - 2, 1);
        return mockedObservable(T);
    }
    getDatesWithTransfersForSOV(vesselObject: VesselObjectModel) {
        const T = linspace(vesselObject.date - 15, vesselObject.date - 5, 1);
        return mockedObservable(T);
    }

    getGeneral(vesselObject: VesselObjectModel) {
        const date = vesselObject.date;
        return mockedObservable({data: [{
            mmsi: vesselObject.mmsi,
            vesselname: 'BMO Apollo 12',
            date: date,
            minutesFloating: 6.123,
            minutesInField: 74.3,
            distancekm: 124.3,
            DPRstats: {
                portDepartureTime: date + 0.48241266,
                WindFarmArrivalTime: date + 0.49341266,
                sailedDistance: 67.19673893,
                AvgSpeedOutbound: 18.32887451,
                AvgSpeedOutboundUnrestricted: 20.87434116,
                MsiOutbound: 5.070039138,
                WBVtechs: 0.3679741968,
                numDockings: 3,
                departureWindFarmTime: date + 0.75326827,
                portArrivalTime: date + 0.77225,
                TotalFuel: 623,
                FuelEcon: 1718,
                AvgSpeedInbound: 19.91148152,
                AvgSpeedInboundUnrestricted: 21.20668402,
                MsiInbound: 15.9433976,
                WBVcrew: 0.3693717037,
            },
            AIScoverageHours: '_NaN_',
            AIScoveragePerc: '_NaN_',
            COMcoverageHours: '_NaN_',
            COMcoveragePerc: '_NaN_',
            ENGINEcoverageHours: '_NaN_',
            ENGINEcoveragePerc: '_NaN_',
            GPScoverageHours: '_NaN_',
            GPScoveragePerc: '_NaN_',
            MTIcoverageHours: '_NaN_',
            MTIcoveragePerc: '_NaN_',
            activityLog: '',
            arrivalAtBerth: [],
            arrivalAtBerthNum: [],
            arrivalAtHarbour: [],
            arrivalAtHarbourNum: [],
            arrivalAtJetty: [],
            arrivalAtJettyNum: [],
            arrivalAtLockNum: [],
            computerTimeOffset: '_NaN_',
            day: '_NaN_',
            dayNum: '_NaN_',
            departureFromBerth: [],
            departureFromBerthNum: [],
            departureFromHarbour: [],
            departureFromHarbourNum: [],
            departureFromJetty: [],
            departureFromJettyNum: [],
            departureFromLockNum: [],
            fuelConsumed: 623,
            fuelEconomy: 1718,
            harbourEvents: [],
            jettyEvents: [],
            lockEvents: [],
            time: [[date + 0.2458], [date + 0.2638], [date + 0.2888]],
            lat: [[27.94013], [27.94468], [27.97227]],
            lon: [[12.9398], [12.95748], [13.03988]],
            seCoverageHours: 0,
            seCoverageOutageHours: 0,
            seCoverageSpanHours: 0,
            speed: [],
            speedRestrictedEvents: [],
            transitTime: '_NaN_',
            utcOffset: '_NaN_',
            vesselName: '_NaN_',
        }]});
    }
    getSov(vesselObject: VesselObjectModel) {
        const date = vesselObject.date;
        return mockedObservable([{
            id: 'dummy',
            date: vesselObject.date,
            mmsi: vesselObject.mmsi,
            AIScoverageHours: '_NaN_',
            AIScoveragePerc: '_NaN_',
            COMcoverageHours: '_NaN_',
            COMcoveragePerc: '_NaN_',
            DPRstats: '_NaN_',
            ENGINEcoverageHours: '_NaN_',
            ENGINEcoveragePerc: '_NaN_',
            GPScoverageHours: '_NaN_',
            GPScoveragePerc: '_NaN_',
            MTIcoverageHours: '_NaN_',
            MTIcoveragePerc: '_NaN_',
            activityLog: '',
            arrivalAtBerth: emptyMatlabObject,
            arrivalAtBerthNum: emptyMatlabObject,
            arrivalAtHarbour: '_NaN_',
            arrivalAtHarbourNum: emptyMatlabObject,
            arrivalAtJetty: emptyMatlabObject,
            arrivalAtJettyNum: emptyMatlabObject,
            arrivalAtLockNum: emptyMatlabObject,
            computerTimeOffset: '_NaN_',
            coverageHours: 21.957672,
            coverageOutageHours: 1.990607997,
            day: '2019-10-2',
            dayNum: vesselObject.date,
            departureFromBerth: emptyMatlabObject,
            departureFromBerthNum: emptyMatlabObject,
            departureFromHarbour: '_NaN_',
            departureFromHarbourNum: emptyMatlabObject,
            departureFromJetty: emptyMatlabObject,
            departureFromJettyNum: emptyMatlabObject,
            departureFromLockNum: emptyMatlabObject,
            distancekm: 61.01372287,
            fuelConsumed: '_NaN_',
            fuelEconomy: '_NaN_',
            harbourEvents: emptyMatlabObject,
            jettyEvents: emptyMatlabObject,
            lockEvents: emptyMatlabObject,
            minutesFloating: '_NaN_',
            minutesInField: '_NaN_',
            seCoverageHours: '_NaN_',
            seCoverageOutageHours: 0,
            seCoverageSpanHours: 23.94828,
            speedRestrictedEvents: emptyMatlabObject,
            time: [[date + 0.2458], [date + 0.2638], [date + 0.2888]],
            lat: [[27.94013], [27.94468], [27.97227]],
            lon: [[12.9398], [12.95748], [13.03988]],
            speed: [['_NaN_'], ['_NaN_'], ['_NaN_']],
            timeBreakdown: {
                hoursSailing: 5.08,
                hoursAtTurbine: 1.878,
                hoursOfCTVops: 2.951,
                hoursWaiting: 14.089,
            },
            transitTime: '_NaN_',
            utcOffset: '_NaN_',
            vesselName: 'SOV_example',
            weatherConditions: mockWeatherConditions(vesselObject.date),
        }]);
    }
    getVessel(): Observable<VesselModel[]> {
        const mock = mockedObservable(this.getVesselDefault());
        return mock;
    }
    getVesselsForCompany(): Observable<VesselModel[]> {
        return mockedObservable(this.getVesselDefault());
    }
    getVesselDefault(): VesselModel[] {
        return [{
            vesselname: 'Test_BMO',
            nicename: 'TEST BMO',
            client: ['BMO'],
            mmsi: 123456789,
            speednotifylimit: emptyMatlabObject,
            impactnotifylimit: emptyMatlabObject,
            operationsClass: 'CTV',
            Site: <string><unknown> emptyMatlabObject,
            onHire: true,
            videobudget: 120,
            videoResetDay: 19,
            isDaughterCraft: false,
            Operator: 'BMO',
            vessel_length: 20,
            displacement: 38620,
            Propulsion_type: 'CPP'
        }];
    }

    getUserByUsername(username: any) {
        return mockedObservable([
            UserTestService.getMockedAccessToken()
        ]);
    }
    checkUserActive(username: string) {
        return mockedObservable(true);
    }

    getSovDprInput(vessel: VesselObjectModel) {
        // ToDo
        return mockedObservable([]);
    }

    getTransfersForVessel(mmsi: number, date: number) {
        return mockedObservable([{
            id: 'dummy',
            vesselname: 'BMO Apollo 12',
            mmsi: mmsi,
            startTime: date + 0.3,
            stopTime: date + 0.31,
            duration: 14.4,
            location: 'T01',
            fieldname: 'Non_Existing_Windpark_turbine_coordinates',
            Hs: '_NaN_',
            score: 6.8,
            thrustPerc: '_NaN_',
            comment: 'Transfer OK',
            impactForceN: [2200, 2300, 6100, 18836],
            slipGraph: mockSlipGraph(date + 0.3, date + 0.31),
            impactForceNmax: 4311.12,
            detector: 'docking',
            date: date,
            videoAvailable: true,
            videoPath: 'TEST_VIDEO_REQUEST',
            videoDurationMinutes: 16,
            videoCoverage: 112
        }]);
    }
    getCommentsForVessel(vesselObject: VesselObjectModel) {
        return mockedObservable([]);
    }
    getTurbineTransfers(mmsi: number, date: number) {
        // ToDo
        return mockedObservable([]);
    }
    getPlatformTransfers(mmsi: number, date: number) {
        // ToDo
        return mockedObservable([]);
    }
    getVessel2vesselsForSov(mmsi: number, date: number) {
        // ToDo
        return mockedObservable([]);
    }
    getCycleTimesForSov(mmsi: number, date: number) {
        // ToDo
        return mockedObservable([]);
    }
    getTransitsForSov(mmsi: number, date: number) {
        // ToDo
        return mockedObservable([]);
    }

    getDistinctFieldnames(vesselObject: VesselObjectModel) {
        return mockedObservable([]);
    }
    getSovDistinctFieldnames(vesselObject: VesselObjectModel) {
        return mockedObservable([]);
    }

    getSpecificPark(park: {park: string[]}) {
        const Names = [];
        const Lons = [];
        const Lats = [];
        const parkname = park ? park[0] : '';
        for (let _i = 1; _i < 65; _i++) {
            if (_i < 10) {
                Names.push('T0' + _i);
            } else {
                Names.push('T' + _i);
            }
            Lons.push([-13.38898]);
            Lats.push([28.21904]);
        }
        return mockedObservable({
            filename: parkname,
            SiteName: 'TEST FIELD',
            centroid: {
                lat: 28.2679,
                lon: -13.2757,
                UTMzone: 28,
                UTMletter: 'N',
            },
            name: Names,
            lon: Lons,
            lat: Lats,
            outlineLonCoordinates: [-13.101497740823, -13.283567632564, -13.286174483517],
            outlineLatCoordinates: [28.259194567759, 28.328068592315, 28.327769362833],
        });
    }
    getPlatformLocations() {
        return mockedObservable([{
            filename: 'test123',
            name: ['PE-F15-PA'],
            lat: [[0]],
            lon: [[0]],
            centroid: {
                lat: 53,
                lon: 4,
                UTMzone: 31,
                UTMletter: 'N',
            }
        }]);
    }
    getVideoBudgetByMmsi(vessel: VesselObjectModel) {
        return mockedObservable([120]);
    }
    getVideoRequests(vessel: VesselObjectModel) {
        return mockedObservable([]);
    }

    saveTransfer(transfer) {
        return mockedObservable({data: 'saveTransfer'});
    }
    saveVideoRequest(transfer) {
        return mockedObservable({data: 'saveVideoRequest'});
    }

    getActiveConnections() {
        return mockedObservable('Not yet tracked!');
    }
    getLatestTwaUpdate() {
        return mockedObservable(0);
    }
    getUsers(): Observable<UserModel[]> {
        return mockedObservable([
            UserTestService.getMockedAccessToken()
        ]);
    }
    getLatestGeneral(): Observable<{_id: number, date: number, vesselname: string}[]> {
        return mockedObservable([]);
    }
    getGeneralForRange(request: GeneralForRangeInput) {
        return this.getGeneral({
            mmsi: <number> request.mmsi[0] ? request.mmsi[0] : request.mmsi,
            date: request.startDate,
            vesselType: request.vesselType,
        });
    }
    getTransfersForVesselByRange(request: StatsRangeRequest) {
        return mockedObservable([]);
    }

    getTurbineWarrantyForCompany(input: {client: string}): Observable<CampaignModel[]> {
        return mockedObservable([{
            campaignName: 'test',
            fullFleet: ['Test_BMO'],
            activeFleet: ['Test_BMO'],
            validFields: ['Test_field'],
            startDate: 0,
            stopDate: 1,
            windField: 'test123',
        }]);
    }
}

// Replace the CommonService propvider with this provider to completely mock the common service!
// Providing the mocked class directly wont work because the interpreter wont know which provider this service is mocking.
export const MockedCommonServiceProvider = {
    provide: CommonService,
    useClass: MockedCommonService,
};


// Class support functions
function linspace(start: number, stop: number, step: number = 1) {
  const _calc = new CalculationService;
  return _calc.linspace(start, stop, step);
}

function mockSlipGraph(startTime: number, stopTime: number) {
    const T = linspace(startTime, stopTime, 1 / 24 / 60 / 60);
    return {
        slipX: T,
        slipY: T.map(() => 1),
        transferPossible: T.map((_, _i) => _i === 0 || _i === T.length ? 0 : 1),
        yLimits: [0, 1.5],
        slipLimit: 0.3,
    };
}

function mockWeatherConditions(date: number) {
    date = Math.floor(date);
    const time = linspace(date, date + 1, 1 / 24 / 6);
    return {
        time: time,
        waveHs: time.map(() => 1),
        waveTp: time.map(() => 1),
        windAvg: time.map(() => 1),
        windGust: time.map(() => 1),
        windDirection: time.map(x => 180 * (x - date)),
    };
}

type VesselType = 'CTV' | 'OSV' | 'SOV';
type nanModel = '_NaN_' | null | undefined | number;


export interface VesselObjectModel {
    mmsi: number;
    date: number;
    dateNormal?: string | Date;
    vesselType: VesselType;
}

export interface GeneralForRangeInput {
    startDate: number;
    stopDate: number;
    mmsi: number | number[];
    vesselType: VesselType;
    projection?: any;
}
