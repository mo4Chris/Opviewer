export class V2vCtvActivity {
    map: any;
    turbineVisits: Array<v2vTurbineTransfer>;
    missedVisits?: Array<v2vTurbineTransfer>;
    mmsi: number;
    date: number;
}

interface v2vTurbineTransfer {
    startTime: number;
    stopTime: number;
    durationMinutes: number;
    fieldname: string;
    location: string;
   }