import { Component, OnInit } from '@angular/core';
import { RouterService } from '@app/supportModules/router.service';

@Component({
  selector: 'app-reports',
  templateUrl: './reports.component.html',
  styleUrls: ['./reports.component.scss']
})
export class ReportsComponent implements OnInit {
  constructor(
    private routerService: RouterService
    ) {

    }

  ngOnInit() {
    console.log('INIT');
    this.routerService.routeToDPR({
      mmsi: 244090781,
    });
  }

}
