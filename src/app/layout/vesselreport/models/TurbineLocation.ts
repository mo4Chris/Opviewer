export class TurbineLocation {
    latitude: any;
    longitude: any;
    location: string;
    shipHasSailedBy: boolean = false;
    transfer: TurbineLocationTransfer;

    constructor(latitude: any, longitude: any, location: string, transfer = null) {
        this.latitude = latitude;
        this.longitude = longitude;
        this.location = location;
        if(transfer != null && location != "") {
            this.shipHasSailedBy = true;
            this.transfer = new TurbineLocationTransfer(transfer.startTime, transfer.stopTime, transfer.duration);
        }
    }
}

export class TurbineLocationTransfer {
    startTime: number;
    stopTime: number;
    duration: string;

    constructor(startTime: number, stopTime: number, duration: string) {
        this.startTime = startTime;
        this.stopTime = stopTime;
        this.duration = duration;
    }
}