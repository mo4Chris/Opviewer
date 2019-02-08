import { TurbineLocation } from "./TurbineLocation";

export class VesselTurbines {

    turbineLocations: Array<TurbineLocation[]>;
    parkBoundaryLongitudes: number[];
    parkBoundaryLatitudes: number[];

    constructor() {
        this.turbineLocations = new Array<TurbineLocation[]>();
        this.parkBoundaryLatitudes = [];
        this.parkBoundaryLongitudes = [];
    }
}