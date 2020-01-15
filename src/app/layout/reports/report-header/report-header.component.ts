import { Component, OnInit, Input, OnChanges } from '@angular/core';
import { RouterService } from '@app/supportModules/router.service';

@Component({
  selector: 'app-report-header',
  templateUrl: './report-header.component.html',
  styleUrls: ['./report-header.component.scss']
})
export class ReportHeaderComponent implements OnChanges {
  constructor(
    private router: RouterService
  ) {}

  @Input() activeRoute = 'tables';

  navItems: NavItem[] = [{
    text: 'Select vessel',
    status: 'selected',
    route: 'tables',
    cb: () => this.router.routeToDPR({})
  }, {
    text: 'Commercial dpr',
    status: 'active',
    route: 'dpr',
    cb: () => this.router.routeToDPR({})
  }, {
    text: 'HSE dpr',
    status: 'disabled',
    route: 'hse',
    cb: () => this.router.routeToDPR({})
  }, {
    text: 'Longterm',
    status: 'active',
    route: 'longterm',
    cb: () => this.router.routeToLTM({mmsi: 244090781, name: 'Acta Auriga'})
  }, {
    text: 'Monthly KPI',
    status: 'active',
    route: 'siemens-montly-kpi',
    cb: () => this.router.routeToDPR({})
  }];


  ngOnChanges() {
    this.navItems.forEach(navItem => {
      const status = navItem.status;
      if (status === 'active' || status === 'selected') {
        if (navItem.route === this.activeRoute) {
          navItem.status = 'selected';
        } else {
          navItem.status = 'active';
        }
      }
    });
  }

  onClick(elt: MouseEvent) {
    const activeText: string = elt.target['id'];
    const navItem = this.navItems.find(_elt => _elt.route === activeText);
    if (navItem) {
      navItem.cb();
    }
  }

}

type linkStatus = 'active' | 'selected' | 'disabled' | 'hidden';

interface NavItem {
  text: string;
  status: linkStatus;
  route: string;
  cb: Function;
}
