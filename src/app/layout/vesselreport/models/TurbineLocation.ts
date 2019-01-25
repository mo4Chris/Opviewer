export class TurbineLocation {
    latitude: any;
    longitude: any;
    shipHasSailedBy: boolean;

    constructor(latitude: any, longitude: any, shipHasSailedBy: boolean) {
        this.latitude = latitude;
        this.longitude = longitude;
        this.shipHasSailedBy = shipHasSailedBy;
    }
}