import { Component, OnInit, ViewChild } from '@angular/core';
import { routerTransition } from '@app/router.animations';
import { CommonService } from '@app/common.service';

import { Hotkeys } from '@app/supportModules/hotkey.service';
import { UserService } from '@app/shared/services/user.service';
import { StringMutationService } from '@app/shared/services/stringMutation.service';
import { VesselModel } from '@app/models/vesselModel';
import { TokenModel } from '@app/models/tokenModel';
import { RouterService } from '@app/supportModules/router.service';
import { PermissionService } from '@app/shared/permissions/permission.service';
import { isArray, isString } from 'util';

@Component({
    selector: 'app-report-tables',
    templateUrl: './tables.component.html',
    styleUrls: ['./tables.component.scss'],
    animations: [routerTransition()]
})
export class TablesComponent implements OnInit {
    constructor(
        private stringMutationService: StringMutationService,
        private newService: CommonService,
        private userService: UserService,
        private hotkeys: Hotkeys,
        private routerService: RouterService,
        public permission: PermissionService,
    ) { }
    Repdata: VesselModel[];
    tokenInfo: TokenModel = TokenModel.load(this.userService);
    filter = [];
    sortedData: VesselModel[];
    sort = { active: 'Client', isAsc: true };

    ngOnInit() {
      this.hotkeys.addShortcut({keys: 'control.f'}).subscribe(_ => {
        const searchRef = <HTMLInputElement> document.getElementById('searchBox');
        searchRef.select();
      });
      this.newService.checkUserActive(this.tokenInfo.username).subscribe(userIsActive => {
        // Ik vind het op zich een goed idee dat we checken of een user active is, maar kunnen we dat niet beter op een ngOnInit doen in de commonService?
        if (userIsActive === true) {
          if (this.permission.admin) {
            this.newService.getVessel().subscribe(data => {
              this.Repdata = data;
              this.Repdata.forEach(_rep => {
                _rep.client = isArray(_rep.client) ? _rep.client : [];
                _rep.client = _rep.client.filter((_client: any) => isString(_client));
              });
              this.applyFilter(''); });
          } else {
            this.newService.getVesselsForCompany([{ client: this.tokenInfo.userCompany }]).subscribe(data => {
              this.Repdata = data;
              this.Repdata.forEach(_rep => {
                _rep.client = isArray(_rep.client) ? _rep.client : [];
                _rep.client = _rep.client.filter((_client: any) => isString(_client));
              });
              this.applyFilter('');
            });
          }
        } else {
          localStorage.removeItem('isLoggedin');
          localStorage.removeItem('token');
          this.routerService.routeToLogin();
        }
      });
    }

    redirectDailyVesselReport(mmsi: number) {
        this.routerService.routeToDPR({mmsi: mmsi});
    }

    redirectLongterm(mmsi: number, vesselName: string) {
        this.routerService.routeToLTM({mmsi: mmsi, name: vesselName});
    }

    applyFilter(filterValue: string) {
        filterValue = filterValue.trim().toLowerCase();
        if (filterValue === '') {
            this.filter = this.Repdata;
            this.sortData(this.sort);
            return;
        }
        this.filter = this.Repdata.filter(s => {
            return s.nicename.toLowerCase().includes(filterValue) ||
                ('' + s.mmsi).includes(filterValue) ||
                s.client.some(client => {
                  return client.toLowerCase().includes(filterValue);
                });
        });
        this.sortData(this.sort);
    }

    sortData(sort: {active: string, isAsc: boolean}) {
        this.sort = sort;
        const data: VesselModel[] = this.filter.slice();

        this.filter = data.sort((a, b) => {
            const isAsc = sort.isAsc;
            switch (sort.active) {
                case 'nicename': return this.stringMutationService.compare(a.nicename.toLowerCase(), b.nicename.toLowerCase(), isAsc);
                case 'mmsi': return this.stringMutationService.compare(a.mmsi, b.mmsi, isAsc);
                case 'client':
                    if (a.client.length === 0 ) {
                        return sort.isAsc ? -1 : 1;
                    } else if (b.client.length === 0) {
                        return sort.isAsc ? 1 : -1;
                    } else {
                        return this.stringMutationService.compare(a.client[0].toLowerCase(), b.client[0].toLowerCase(), isAsc);
                    }
                default: return 0;
            }
        });
    }
}

