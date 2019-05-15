import { TurbineLocation } from "./TurbineLocation";

export class VesselTurbines {

    turbineLocations: Array<TurbineLocation[]>;
    parkName: string;
    parkBoundaryLongitudes: number[];
    parkBoundaryLatitudes: number[];

    constructor() {
        this.turbineLocations = new Array<TurbineLocation[]>();
        this.parkBoundaryLatitudes = [];
        this.parkBoundaryLongitudes = [];
    }
}

export class VesselPlatforms{

    turbineLocations: Array<TurbineLocation[]>;

    constructor() {
        this.turbineLocations = new Array<TurbineLocation[]>();
    }
}
