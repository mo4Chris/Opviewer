import { Component, OnInit } from '@angular/core';
import { routerTransition } from '../../router.animations';
import { CommonService } from '../../common.service';
import * as jwt_decode from 'jwt-decode';
import * as Chart from 'chart.js';
import { Router, ActivatedRoute } from '@angular/router';
import * as moment from 'moment';

@Component({
    selector: 'app-users',
    templateUrl: './fleetavailability.html',
    styleUrls: ['./fleetavailability.component.scss'],
    animations: [routerTransition()]
})
export class FleetavailabilityComponent implements OnInit {
    constructor(private newService: CommonService, private _router: Router, private route: ActivatedRoute ) { }

    tokenInfo = this.getDecodedAccessToken(localStorage.getItem('token'));
    myChart;
    hideText = false;
    edit = false;
    turbineWarrenty;
    loaded = false;
    selectedMonth = 'Last 2 weeks';
    availableMonths = [];
    tempSailDays = [];
    dateSailDays = 0;
    totalWeatherDays = 0;
    missingDays = [];
    campaignName;
    windfield;
    startDate;
    
    ngOnInit() {
        this.createLineChart();
        this.getCampaignName();
        this.getStartDate();
        this.getWindfield();

        this.newService.getTurbineWarrantyOne({ campaignName: this.campaignName, windfield: this.windfield, startDate: this.startDate }).subscribe(data => {
            if (data.data) {
                this.turbineWarrenty = data.data;
                this.getAvailableMonths();
            }
            this.loaded = true;
        });
    }

    getCampaignName() {
        this.route.params.subscribe(params => this.campaignName = params.campaignName);
    }

    getStartDate() {
        this.route.params.subscribe(params => this.windfield = params.windfield);
    }

    getWindfield() {
        this.route.params.subscribe(params => this.startDate = parseFloat(params.startDate));
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
                    label: 'Expected after first 3 months',
                    borderColor: 'blue',
                    fill: false
                  }, {
                    data: [200, 180, 170, 130],
                    label: 'Recorded weather days',
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
        this.turbineWarrenty.sailMatrix = this.tempSailDays;
        this.edit = false;
    }

    MatlabDateToJSDate(serial) {
        var dateInt = moment((serial - 719529) * 864e5);
        if (this.selectedMonth == 'Last 2 weeks') {
            return dateInt.format('DD-MM-YYYY');
        } else {
            return dateInt.format('DD');
        }
    }

    MatLabDateToMoment(serial) {
        return moment((serial - 719529) * 864e5);
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

    getAvailableMonths() {
        var dateStart = this.MatLabDateToMoment(this.turbineWarrenty.startDate);
        var dateEnd = this.MatLabDateToMoment(this.turbineWarrenty.stopDate);

        while (dateEnd > dateStart || dateStart.format('M') === dateEnd.format('M')) {
            if (dateStart < moment()) {
                this.availableMonths.push(dateStart.format('MMM YYYY'));
            }
            dateStart.add(1, 'month');
        }
        this.availableMonths.push('Last 2 weeks');
        this.availableMonths.reverse();
    }

    checkDateRange(Date) {
        var date = this.MatLabDateToMoment(Date);
        if (this.selectedMonth != 'Last 2 weeks') {
            var stopDate = moment('01 ' + this.selectedMonth, 'DD MMM YYYY');
            if (date.month() == stopDate.month() && date.year() == stopDate.year()) {
                return true;
            }
        } else {
            var lastTwoWeeks = this.turbineWarrenty.Dates.slice(Math.max(this.turbineWarrenty.Dates.length - 14, 1));
            if (lastTwoWeeks.indexOf(Date) > -1) {
                return true;
            }
        }
        return false;
    }

    getSailDay(sailday) {
        if (sailday == '_NaN_') {
            return '-';
        } else {
            return sailday;
        }
    }

    setMonth(val) {
        this.selectedMonth = val;
        this.missingDays = [];
    }

    updateSailDay(sailDays, i, ind, value) {
        this.tempSailDays = sailDays;
        this.tempSailDays[i][ind] = value;
    }

    addDateSailDay(sd, ind) {
        if (!this.missingDays[ind]) {
            this.missingDays[ind] = 0;
        }

        if (sd != "_NaN_") {
            this.missingDays[ind]+= (1 - sd);
            this.dateSailDays += parseFloat(sd);
        }
    }

    getDateWeatherDays() {
        var saildays = this.dateSailDays;
        this.dateSailDays = 0;
        var weatherDays = this.turbineWarrenty.numContractedVessels - saildays;
        this.totalWeatherDays += weatherDays;
        return weatherDays
    }

    getTotalWeatherDays() {
        var total = this.totalWeatherDays;
        this.totalWeatherDays = 0;
        return total;
    }

    getTotalMissingDays(ind) {
        var total = this.missingDays[ind];
        this.missingDays[ind] = 0;
        return total;
    }
}
