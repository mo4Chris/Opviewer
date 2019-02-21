import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import {
    CanDeactivate,
    ActivatedRouteSnapshot,
    RouterStateSnapshot
} from '@angular/router';

import { FleetavailabilityComponent } from './layout/fleetavailability/fleetavailability.component';

@Injectable({
    providedIn: 'root',
})
export class CanDeactivateGuard implements CanDeactivate<FleetavailabilityComponent> {

    canDeactivate(
        component: FleetavailabilityComponent,
        route: ActivatedRouteSnapshot,
        state: RouterStateSnapshot
    ): Observable<boolean> | boolean {
        // Get the Crisis Center ID
        //console.log(route.paramMap.get('id'));

        // Get the current URL
        //console.log(state.url);

        // Allow synchronous navigation (`true`) if no unsaved changes
        if (component.sailDaysChanged.length <= 0) {
            return true;
        }
        // Otherwise ask the user with the dialog service and return its
        // observable which resolves to true or false when the user decides
        return component.dialogService.confirm('Are you sure you want to leave this page? Any unsaved changes will be discarded.');
    }
}
