import { Component, OnInit } from '@angular/core';
import { routerTransition } from '../../router.animations';
import { CommonService } from '../../common.service';
import * as jwt_decode from 'jwt-decode';
import * as Chart from 'chart.js';
import { Router } from '@angular/router';
import * as moment from 'moment';

@Component({
    selector: 'app-users',
    templateUrl: './fleetavailability.html',
    styleUrls: ['./fleetavailability.component.scss'],
    animations: [routerTransition()]
})
export class FleetavailabilityComponent implements OnInit {
    constructor(private newService: CommonService, private _router: Router ) { }

    tokenInfo = this.getDecodedAccessToken(localStorage.getItem('token'));
    myChart;
    hideText = false;
    edit = false;
    turbineWarrenty;
    loaded = false;

    ngOnInit() {
        this.createLineChart();
        this.newService.getTurbineWarranty().subscribe(data => {
            this.turbineWarrenty = data[3];
            this.loaded = true;
        });
    }

    createLineChart() {
          this.myChart = new Chart('canvas', {
            type: 'line',
            data: {
                labels: ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'],
                datasets: [{
                    data: [200, 196, 192.5, 133, 111, 107, 105, 101, 75, 0],
                    label: 'Expected start of term',
                    borderColor: 'red',
                    fill: false
                  }, {
                    data: [null, null, null, 130, 125, 90, 85, 83, 75, -5],
                    label: 'expected after first 3 months',
                    borderColor: 'blue',
                    fill: false
                  }, {
                    data: [200, 180, 170, 130],
                    label: 'Reality',
                    borderColor: 'black',
                    fill: false
                  }
                ]
              },
              options: {
                  responsive: true,
                  elements: {
                      point:
                          { radius: 0 },
                      line:
                          { tension: 0 }
                  },
                  animation: {
                      duration: 0,
                  },
                  hover: {
                      animationDuration: 0,
                  },
                  responsiveAnimationDuration: 0,
                  scales: {
                      yAxes: [{
                          stacked: false,
                          ticks: {
                              suggestedMin: 0
                          }
                      }]
                  }
            }
        });
    }

    editData() {
        this.edit = true;
        this.hideText = false;
    }

    saveData() {
        this.edit = false;
    }

    MatlabDateToJSDate(serial) {
        const dateInt = moment((serial - 719529) * 864e5).format('DD-MM-YYYY');
        return dateInt;
    }

    changeToNicename(name) {
        return name.replace(/_/g, ' ');
    }

    getDecodedAccessToken(token: string): any {
        try {
            return jwt_decode(token);
        } catch (Error) {
            return null;
        }
    }
}
