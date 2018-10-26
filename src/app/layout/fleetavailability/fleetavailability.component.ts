import { Component, OnInit } from '@angular/core';
import { routerTransition } from '../../router.animations';
import { CommonService } from '../../common.service';
import * as jwt_decode from 'jwt-decode';
import * as Chart from 'chart.js';
import { Router } from '@angular/router';

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

    ngOnInit() {
        this.createLineChart();
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
                scales: {
                    yAxes: [{
                        stacked: false,
                        ticks: {
                            suggestedMin: 0
                        }
                    }]
                }, elements: {
                    line: {
                        tension: 0, // disables bezier curves
                    }
                }
            }
        });
    }



    getDecodedAccessToken(token: string): any {
        try {
            return jwt_decode(token);
        } catch (Error) {
            return null;
        }
    }
}
