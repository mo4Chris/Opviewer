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
            if(transfer.duration !== undefined && transfer.duration !== ''){
                this.transfer = new TurbineLocationTransfer(transfer.startTime, transfer.stopTime, transfer.duration);
            }
            else if(transfer.arrivalTimePlatform !== undefined && transfer.arrivalTimePlatform !== ''){
                this.transfer = new TurbineLocationTransfer(transfer.arrivalTimePlatform, transfer.departureTimePlatform, transfer.visitDuration);
            }
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