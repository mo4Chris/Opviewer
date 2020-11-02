import { V2vTransfer } from './V2vTransfer';
import { V2vCtvActivity } from './V2vCtvActivity';

export class Vessel2vesselModel {
    date: number;
    mmsi: number;
    transfers: V2vTransfer[];
    CTVactivity: V2vCtvActivity[];
    missedTransfers?: MissedDcTransfer[];

    constructor() {
        this.transfers = [];
        this.CTVactivity = [];
    }
}

export interface MissedDcTransfer {
    location: string,
    from: {hour: string, minutes: string},
    to: {hour: string, minutes: string},
    paxIn: number,
    paxOut: number,
    cargoIn: number,
    cargoOut: number,
}