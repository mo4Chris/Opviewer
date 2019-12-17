import { V2vTransfer } from "./V2vTransfer";
import { V2vCtvActivity } from "./V2vCtvActivity";

export class Vessel2vesselModel {
    transfers: V2vTransfer[];
    CTVactivity: V2vCtvActivity[];
    date: number;
    mmsi: number;

    constructor() {
        this.transfers = [];
        this.CTVactivity = [];
    }
}
