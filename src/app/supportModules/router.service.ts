import { Router } from '@angular/router';
import { Injectable } from '@angular/core';


@Injectable({
    providedIn: 'root'
})
export class RouterService {
    constructor(
        private _router: Router,
    ) {}

    route(destination: Array<string | object> | string) {
        // ToDo: validate route and throw error if the address if invalid
        if (!Array.isArray(destination)) {
            destination = [destination];
        }
        this._router.navigate(<Array<any>> destination);
    }

    // Actual routes go below here
    routeToDashboard() {
        this.route('Dashboard');
    }
    routeToDPR(route: {mmsi?: number, date?: number}) {
        if (! route.mmsi) {
            this.route(['reports']);
        } else if (route.date) {
            this.route(['reports/dpr', {
                mmsi: route.mmsi,
                date: route.date,
            }]);
        } else {
            this.route(['reports/dpr', {
                mmsi: route.mmsi
            }]);
        }
    }
    routeToLTM(route: {mmsi: number, name?: string}) {
        if (!route.name) {
            route.name = 'placeholder';
            console.error('Navigation to LTM without name is currently not supported!');
            // ToDo: get vesselname by mmsi
        } else {
            this.route(['reports/longterm', {
                mmsi: route.mmsi,
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
    routeToLogin() {
        this.route('login');
    }
    routeToSignup() {
        this.route('signup');
    }
    routeToNotFound() {
        this.route('not-found');
    }
    routeToAccessDenied() {
        this.route('access-denied');
    }
    routeSecundary() {
        this.route([{
            outlets: {
                primary: ['reports', 'dpr'],
                reports: ['reports', 'dpr'],
            }
        }]);
    }
    routeToForecast(project_id?: number) {
        if (project_id) {
            this.route(['forecast', 'project', {
                project_id: project_id
            }]);
        } else {
            this.route(['forecast']);
        }
    }
    routeToForecastProjectOverview(project_id: number) {
        this.route(['forecast', 'project-overview', {
            project_id: project_id
        }]);
    }
    routeToForecastNewVesselRequest() {
        this.route(['forecast', 'new-vessel']);
    }
}
