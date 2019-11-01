import { type } from 'os';
import { CalculationService } from './calculation.service';
import { CommonService } from '../common.service';
import { mockedObservable } from '../models/testObservable';


const emptyMatlabObject = {
    _ArrayType_: 'double',
    _ArraySize_: [0, 0],
    _ArrayData_: null,
};

export class MockedCommonService {
    validatePermissionToViewData(opts: {mmsi: number}) {
        return mockedObservable([{
            vesselname: 'Test_BMO',
            nicename: 'TEST BMO',
            client: 'BMO',
            mmsi: 123456789,
            speednotifylimit: emptyMatlabObject,
            impactnotifylimit: emptyMatlabObject,
            operationsClass: 'CTV',
            Site: emptyMatlabObject,
            onHire: 1,
            videobudget: '_NaN_',
            videoResetDay: '_NaN_',
        }]);
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
            lat: [[27.94013], [27.94468], [27.97227]],
            lon: [[12.9398], [12.95748], [13.03988]],
            seCoverageHours: 0,
            seCoverageOutageHours: 0,
            seCoverageSpanHours: 0,
            speed: [],
            speedRestrictedEvents: [],
            time: [[737350.2458], [737350.2638], [737350.2888]],
            transitTime: '_NaN_',
            utcOffset: '_NaN_',
            vesselName: '_NaN_',
        }]});
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
    getDistinctFieldnames(vesselObject: VesselObjectModel) {
        return mockedObservable([]);
    }
    getSpecificPark(parkname: string) {
        const Names = [];
        const Lons = [];
        const Lats = [];
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
    getVideoBudgetByMmsi(mmsi: number) {
        return mockedObservable([120]);
    }
}


// Class support functions
function linspace(start: number, stop: number, step: number = 1) {
  const _linspace = [];
  let curr = start;
  while ( curr <= stop ) {
    _linspace.push(curr);
    curr = curr + step;
  }
  return _linspace;
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

type VesselType = 'CTV' | 'OSV' | 'SOV';
type nanModel = '_NaN_' | null | undefined | number;


interface VesselObjectModel {
    mmsi: number;
    date: number;
    dateNormal?: string;
    vesselType: VesselType;
}
