import { Router } from '@angular/router';
import { isArray } from 'util';
import { Injectable } from '@angular/core';
import { CommonService } from '../common.service';


@Injectable({
    providedIn: 'root'
})
export class RouterService {
    constructor(
        private _router: Router,
    ) {}

    route(destination: Array<string | object> | string) {
        // ToDo: validate route and throw error if the address if invalid
        if (!isArray(destination)) {
            destination = [destination];
        }
        this._router.navigate(<Array<any>> destination);
    }

    // Actual routes go below here
    routeToDPR(route: {mmsi: number, date?: number}) {
        if (route.date) {
            this.route(['reports-dpr', {
                boatmmsi: route.mmsi,
                date: route.date,
            }]);
        } else {
            this.route(['reports-dpr', {
                boatmmsi: route.mmsi
            }]);
        }
    }

    routeToLTM(route: {mmsi: number, name?: string}) {
        if (!route.name) {
            route.name = 'placeholder';
            // ToDo: get vesselname by mmsi
        } else {
            this.route(['longterm', {
                boatmmsi: route.mmsi,
                vesselName: route.name,
            }]);
        }
    }

    routeToCampaign(route: {name: string, windField: string, startDate: number}) {
        this.route(['fleetavailability', {
            campaignName: route.name,
            windfield: route.windField,
            startDate: route.startDate
        }]);
    }

    routeToDashboard() {
        this.route('Dashboard');
    }

    routeToLogin() {
        this.route('login');
    }

    routeToNotFound() {
        this.route('not-found');
    }
}
