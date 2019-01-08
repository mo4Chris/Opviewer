import { Component, OnInit } from '@angular/core';
import { routerTransition } from '../../router.animations';
import { CommonService } from '../../common.service';
import * as jwt_decode from 'jwt-decode';
import * as Chart from 'chart.js';
import { Router, ActivatedRoute } from '@angular/router';
import { map, catchError } from 'rxjs/operators';
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
    allMonths = [];
    sailMatrix = [];
    dateSailDays = 0;
    totalWeatherDays = 0;
    missingDays = [];
    params = { campaignName: '', windfield: '', startDate: 0 };
    saving;
    alert = { type: '', message: '' };
    showAlert = false;
    timeout;
    totalWeatherDaysPerMonth = [];
    forecastAfterRecorded = [];
    forecastFromStart = [];

    ngOnInit() {
        this.getCampaignName();
        this.getStartDate();
        this.getWindfield();

        this.newService.getTurbineWarrantyOne({ campaignName: this.params.campaignName, windfield: this.params.windfield, startDate: this.params.startDate }).subscribe(data => {
            if (data.data) {
                this.turbineWarrenty = data.data;
                if (!this.turbineWarrenty.sailMatrix[0][0]) {
                    this.turbineWarrenty.sailMatrix = [this.turbineWarrenty.sailMatrix];
                }
                if (this.turbineWarrenty.updatedSailMatrix[0]) {
                    this.sailMatrix = this.turbineWarrenty.updatedSailMatrix;
                } else {
                    this.sailMatrix = this.turbineWarrenty.sailMatrix;
                }
                this.getAvailableMonths();
            }
            this.getGraphData();
            this.createLineChart();
            this.loaded = true;
        });
    }

    getCampaignName() {
        this.route.params.subscribe(params => this.params.campaignName = params.campaignName);
    }

    getStartDate() {
        this.route.params.subscribe(params => this.params.windfield = params.windfield);
    }

    getWindfield() {
        this.route.params.subscribe(params => this.params.startDate = parseFloat(params.startDate));
    }

    createLineChart() {
          this.myChart = new Chart('canvas', {
            type: 'line',
            data: {
                labels: this.allMonths,
                datasets: [{
                    data: this.forecastFromStart,
                    label: 'Expected from start of term',
                    borderColor: 'green',
                    fill: false
                }, {
                    data: this.forecastAfterRecorded,
                    label: 'Expected after current recorded weather days',
                    borderColor: 'red',
                    fill: false
                }, {
                    data: this.totalWeatherDaysPerMonth,
                    label: 'Recorded weather days',
                    borderColor: 'black',
                    fill: false
                }]
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

        var i = 1;
        while (dateEnd > dateStart || dateStart.format('M') === dateEnd.format('M')) {
            if (dateStart < moment()) {
                this.availableMonths.push(dateStart.format('MMM YYYY'));
                if (dateStart.format('M') != moment().format('M')) {
                    this.totalWeatherDaysPerMonth[i] = 0;
                }
            }
            this.allMonths.push(dateStart.format('MMM YYYY'));
            dateStart.add(1, 'month');
            i++;
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

    editData() {
        this.edit = true;
        this.hideText = false;
    }

    saveData() {
        this.turbineWarrenty.sailMatrix = this.sailMatrix;
        this.saving = true;
        this.newService.setSaildays(this.turbineWarrenty).pipe(
            map(
                (res) => {
                    this.alert.type = 'success';
                    this.alert.message = res.data;
                }
            ),
            catchError(error => {
                this.alert.type = 'danger';
                this.alert.message = error;
                throw error;
            })
        ).subscribe(_ => {
            clearTimeout(this.timeout);
            this.showAlert = true;
            this.edit = false;
            this.saving = false;
            this.timeout = setTimeout(() => {
                this.showAlert = false;
            }, 7000);
        });

    }

    updateSailDay(i, ind, value) {
        this.sailMatrix[i][ind] = value;
    }

    getGraphData() {

        //recorded weather days
        var target = this.turbineWarrenty.weatherDayTarget;
        this.totalWeatherDaysPerMonth[0] = target;
        for (var i = 0; i < this.turbineWarrenty.Dates.length; i++) {
            var index = this.allMonths.indexOf(this.MatLabDateToMoment(this.turbineWarrenty.Dates[i]).format('MMM YYYY')) + 1;
            this.totalWeatherDaysPerMonth[index] = parseFloat(this.totalWeatherDaysPerMonth[index]) + this.turbineWarrenty.numContractedVessels;
            for (var j = 0; j < this.turbineWarrenty.fullFleet.length; j++) {
                if (this.sailMatrix[j][i] != '_NaN_') {
                    this.totalWeatherDaysPerMonth[index] = parseFloat(this.totalWeatherDaysPerMonth[index]) - parseFloat(this.sailMatrix[j][i]);
                }
            }
        }
        this.forecastAfterRecorded[0] = null;
        for (var i = 1; i < this.totalWeatherDaysPerMonth.length - 1; i++) {
            target = target - this.totalWeatherDaysPerMonth[i];
            this.totalWeatherDaysPerMonth[i] = target;
            this.forecastAfterRecorded[i] = null;
        }
        console.log(this.totalWeatherDaysPerMonth); //TODO NaN value aant einde en januari erin doen

        //forecast
        this.forecastAfterRecorded[this.forecastAfterRecorded.length - 1] = parseFloat(this.totalWeatherDaysPerMonth[this.totalWeatherDaysPerMonth.length - 2]);
        this.forecastFromStart[0] = this.turbineWarrenty.weatherDayTarget;
        target = this.turbineWarrenty.weatherDayTarget;
        for (var i = 0; i < this.turbineWarrenty.weatherDayForecast.length; i++) {
            var forecastWeatherdays = this.turbineWarrenty.weatherDayForecast[i][0] * this.turbineWarrenty.numContractedVessels * moment(this.allMonths[i], 'MMM YYYY').daysInMonth();
            if (typeof this.forecastAfterRecorded[i+1] == 'undefined') {
                this.forecastAfterRecorded.push(this.forecastAfterRecorded[this.forecastAfterRecorded.length - 1] - forecastWeatherdays);
            }
            target = target - forecastWeatherdays;
            this.forecastFromStart[i + 1] = target;
        }
    }
}
