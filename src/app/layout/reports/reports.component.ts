import { Component, OnInit, OnChanges } from '@angular/core';
import { RouterService } from '@app/supportModules/router.service';
import { ActivatedRoute } from '@angular/router';

@Component({
  selector: 'app-reports',
  templateUrl: './reports.component.html',
  styleUrls: ['./reports.component.scss']
})
export class ReportsComponent implements OnInit {

  activeRoute: ReportsSelector = 'tables';

  constructor(
    private routerService: RouterService,
    private route: ActivatedRoute,
    ) {

    }

  ngOnInit() {
    this.getCurrentRoute();
  }

  getCurrentRoute() {
    this.route.url.subscribe((urlSegment) => {
      if (urlSegment.length > 0) {
        const path = urlSegment[0].path;
        switch (path) {
          case 'tables': case 'dpr': case 'longterm':
            this.activeRoute = path;
            break;
          default:
            this.routerService.routeToNotFound();
        }
      }
    });
  }
}

type ReportsSelector = 'tables' | 'dpr' | 'longterm';
