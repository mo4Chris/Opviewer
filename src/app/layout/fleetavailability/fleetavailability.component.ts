import { Component, OnInit, HostListener } from '@angular/core';
import { routerTransition } from '../../router.animations';
import { CommonService } from '../../common.service';
import * as Chart from 'chart.js';
import { ActivatedRoute } from '@angular/router';
import { NgbModal, NgbModalRef } from '@ng-bootstrap/ng-bootstrap';
import { map, catchError } from 'rxjs/operators';
import * as moment from 'moment';
import { UserService } from '../../shared/services/user.service';
import { DialogService } from '../../dialog.service';

@Component({
    selector: 'app-users',
    templateUrl: './fleetavailability.html',
    styleUrls: ['./fleetavailability.component.scss'],
    animations: [routerTransition()]
})
export class FleetavailabilityComponent implements OnInit {
    constructor(private newService: CommonService, private modalService: NgbModal, private route: ActivatedRoute, private userService: UserService, public dialogService: DialogService) { }

    tokenInfo = this.userService.getDecodedAccessToken(localStorage.getItem('token'));
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
    modalReference: NgbModalRef;
    totalWeatherDaysPerMonth = [];
    forecastAfterRecorded = [];
    forecastFromStart = [];
    existingVessels;
    sailDaysChanged = [];
    vesselToAdd = { type: 'existing', newVesselValue: '', existingVesselValue: '' };
    openListing = '';
    activeListings
    datePickerValue = [[]];
    activeChanged = [];
    listings = [];
    startDate;
    stopDate;
    changing = false;

    ngOnInit() {
        this.getCampaignName();
        this.getStartDate();
        this.getWindfield();
        this.buildData(true);
    }

    buildData(init = false) {
        this.newService.getTurbineWarrantyOne({ campaignName: this.params.campaignName, windfield: this.params.windfield, startDate: this.params.startDate }).subscribe(data => {
            if (data.data) {
                this.turbineWarrenty = data.data;
                if (!(this.turbineWarrenty.sailMatrix[0][0] >= 0) && this.turbineWarrenty.sailMatrix[0][0] != '_NaN_') {
                    this.turbineWarrenty.sailMatrix = [this.turbineWarrenty.sailMatrix];
                }
                var date = this.MatLabDateToMoment(this.turbineWarrenty.startDate);
                this.startDate = { year: date.year(), month: (date.month() + 1), day: date.date() };
                var date = this.MatLabDateToMoment(this.turbineWarrenty.stopDate);
                this.stopDate = { year: date.year(), month: (date.month() + 1), day: date.date() };
            }
            if (data.sailDayChanged[0]) {
                for (var i = 0; i < this.turbineWarrenty.sailMatrix.length; i++) {
                    for (var j = 0; j < this.turbineWarrenty.Dates.length; j++) {
                        for (var k = 0; k < data.sailDayChanged.length; k++) {
                            if (this.turbineWarrenty.Dates[j] == data.sailDayChanged[k].date && this.turbineWarrenty.fullFleet[i] == data.sailDayChanged[k].vessel) {
                                this.turbineWarrenty.sailMatrix[i][j] = data.sailDayChanged[k].newValue;
                            }
                        }
                    }
                }
            }
            this.sailMatrix = this.turbineWarrenty.sailMatrix;
            if (init) {
                this.getAvailableMonths();
                this.getGraphData();
                this.createLineChart();
                if (this.tokenInfo.userPermission == 'admin') {
                    this.newService.GetVessel().subscribe(data => {
                        this.existingVessels = data;
                        this.loaded = true;
                    });
                } else {
                    this.newService.GetVesselsForCompany([{ client: this.tokenInfo.userCompany }]).subscribe(data => {
                        this.existingVessels = data;
                        this.loaded = true;
                    });
                }
            }
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
        if (this.tokenInfo.userPermission == 'admin' || this.tokenInfo.userPermission == 'Logistics specialist') {
            this.myChart = new Chart('canvas', {
                type: 'line',
                data: {
                    //labels: this.allMonths,
                    datasets: [{
                        data: this.totalWeatherDaysPerMonth,
                        label: 'Recorded weather days',
                        borderColor: 'black',
                        fill: false
                    }, {
                        data: this.forecastAfterRecorded,
                        label: 'Expected after current recorded weather days',
                        borderColor: 'red',
                        fill: false
                    }, {
                        data: this.forecastFromStart,
                        label: 'Expected from start of term',
                        borderColor: 'green',
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
                            },
                            scaleLabel: {
                                display: true,
                                labelString: 'Weather days remaining in TWA'
                            }
                        }],
                        xAxes: [{
                            type: 'time',
                            time: {
                                unit: 'month',
                                displayFormats: {
                                    month: 'MMM YYYY'
                                }
                            }
                        }]
                    }
                }
            });
        }
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

    getAvailableMonths() {
        var dateStart = this.MatLabDateToMoment(this.turbineWarrenty.startDate);
        var dateEnd = this.MatLabDateToMoment(this.turbineWarrenty.stopDate);

        while (dateEnd > dateStart || dateStart.format('M') === dateEnd.format('M')) {
            this.allMonths.push(dateStart.format('MMM YYYY'));
            if (dateStart < moment()) {
                this.availableMonths.push(dateStart.format('MMM YYYY'));
                dateStart.add(1, 'month');
            } else {
                dateStart.add(1, 'month');
            }
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

        if (sd != '_NaN_' && sd >= 0) {
            this.missingDays[ind] += (1 - sd);
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

    cancelData() {
        this.sailDaysChanged = [];
        this.edit = false;
    }

    saveData() {
        this.saving = true;
        this.newService.setSaildays(this.sailDaysChanged).pipe(
            map(
                (res) => {
                    this.setAlert('success', res.data);
                }
            ),
            catchError(error => {
                this.setAlert('danger', error._body);
                throw error;
            })
        ).subscribe(_ => {
            clearTimeout(this.timeout);
            this.showAlert = true;
            this.edit = false;
            this.sailDaysChanged = [];
            this.saving = false;
            this.buildData();
            this.timeout = setTimeout(() => {
                this.showAlert = false;
            }, 7000);
        });

    }

    updateSailDay(date, vessel, newValue, i, ind) {
        if (!this.sailDaysChanged.filter(x => x.date == date && x.vessel == vessel).length) {
            this.sailDaysChanged.push({
                vessel: vessel,
                date: date,
                fleetID: this.turbineWarrenty._id,
                oldValue: this.sailMatrix[i][ind],
                newValue: newValue,
                userID: this.tokenInfo.userID
            });
        } else {
            var index = this.sailDaysChanged.findIndex((x => x.date == date && x.vessel == vessel));
            this.sailDaysChanged[index].newValue = newValue;
        }
    }

    getGraphData() {
        //recorded weather days
        var target = this.turbineWarrenty.weatherDayTarget;
        for (var i = 0; i < this.turbineWarrenty.Dates.length; i++) {
            var x = this.MatLabDateToMoment(this.turbineWarrenty.Dates[i]);
            if (i == 0) {
                x.add(9, 'hour');
            }
            this.totalWeatherDaysPerMonth[i] = { x: x, y: this.turbineWarrenty.numContractedVessels };
            for (var j = 0; j < this.turbineWarrenty.fullFleet.length; j++) {
                this.datePickerValue[j] = [null];
                if (this.sailMatrix[j][i] != '_NaN_') {
                    this.totalWeatherDaysPerMonth[i].y = parseFloat(this.totalWeatherDaysPerMonth[i].y) - parseFloat(this.sailMatrix[j][i]);
                }
            }
        }
        for (var i = 0; i < this.totalWeatherDaysPerMonth.length; i++) {
            target = target - this.totalWeatherDaysPerMonth[i].y;
            this.totalWeatherDaysPerMonth[i].y = target;
            this.forecastAfterRecorded[i] = { x: this.totalWeatherDaysPerMonth[i].x, y: null };
        }
        this.totalWeatherDaysPerMonth.reverse();
        this.totalWeatherDaysPerMonth.push({ x: this.MatLabDateToMoment(this.turbineWarrenty.startDate).subtract(1, 'hour'), y: this.turbineWarrenty.weatherDayTarget });
        this.totalWeatherDaysPerMonth.reverse();

        //forecast after recorded
        var dateForecast = this.MatLabDateToMoment(this.turbineWarrenty.startDate).add(this.totalWeatherDaysPerMonth.length, 'days');
        var dateEnd = this.MatLabDateToMoment(this.turbineWarrenty.stopDate);

        this.forecastAfterRecorded[0] = { x: this.MatLabDateToMoment(this.turbineWarrenty.startDate).subtract(1, 'hour'), y: null };
        this.forecastAfterRecorded[this.forecastAfterRecorded.length - 1].y = parseFloat(this.totalWeatherDaysPerMonth[this.totalWeatherDaysPerMonth.length - 1].y);
        while (dateEnd >= dateForecast) {
            var index = parseInt(dateForecast.format('M')) - 1;
            var forecast = this.turbineWarrenty.weatherDayForecast[index][0] * this.turbineWarrenty.numContractedVessels;
            this.forecastAfterRecorded.push({ x: moment(dateForecast), y: this.forecastAfterRecorded[this.forecastAfterRecorded.length - 1].y - forecast });
            dateForecast.add(1, 'days');
        }
        this.forecastAfterRecorded[this.forecastAfterRecorded.length - 1].x = this.forecastAfterRecorded[this.forecastAfterRecorded.length - 1].x.subtract(1, 'hour');

        //forecast from start
        this.forecastFromStart[0] = { x: this.MatLabDateToMoment(this.turbineWarrenty.startDate).subtract(1, 'hour'), y: this.turbineWarrenty.weatherDayTarget }
        target = this.turbineWarrenty.weatherDayTarget;
        for (var i = 1; i < this.allMonths.length; i++) {
            var index = parseInt(moment(this.allMonths[i - 1], 'MMM YYYY').format('M')) - 1;
            var forecastWeatherdays = this.turbineWarrenty.weatherDayForecast[index][0] * this.turbineWarrenty.numContractedVessels * moment(this.allMonths[i], 'MMM YYYY').daysInMonth();
            target = target - forecastWeatherdays;
            this.forecastFromStart[i] = { x: moment(this.allMonths[i], 'MMM YYYY'), y: target };
        }
    }

    openModal(content) {
        this.modalReference = this.modalService.open(content);
    }

    closeModal() {
        this.modalReference.close();
    }

    addVessel() {
        if (this.tokenInfo.userPermission == 'admin' || this.tokenInfo.userPermission == 'Logistics specialist') {
            var vesselToAdd = { client: this.turbineWarrenty.client, vessel: '', campaignName: this.params.campaignName, windfield: this.params.windfield, startDate: this.params.startDate };
            if (this.vesselToAdd.type == 'existing') {
                vesselToAdd.vessel = this.vesselToAdd.existingVesselValue;
            } else {
                vesselToAdd.vessel = this.vesselToAdd.newVesselValue;
            }
            if (this.turbineWarrenty.fullFleet.indexOf(vesselToAdd.vessel) >= 0) {
                this.setAlert('danger', 'Vessel already in fleet', true);
                return;
            }
            this.newService.addVesselToFleet(vesselToAdd).pipe(
                map(
                    (res) => {
                        this.setAlert('success', res.data, true);
                    }
                ),
                catchError(error => {
                    this.setAlert('danger', error._body, true);
                    throw error;
                })
            ).subscribe(_ => {
                this.vesselToAdd = { type: 'existing', newVesselValue: '', existingVesselValue: '' };
            });
        }
    }

    setAlert(type, msg, closeModal = false) {
        clearTimeout(this.timeout);
        this.alert.type = type;
        this.alert.message = msg;
        this.showAlert = true;
        if (closeModal) {
            this.closeModal();
        }
        this.timeout = setTimeout(() => {
            this.showAlert = false;
        }, 7000);
    }

    @HostListener('window:beforeunload', ['$event'])
    unloadNotification($event: any) {
        if (this.sailDaysChanged.length > 0) {
            $event.returnValue = true;
        }
    }

    setActive() {
        if (this.tokenInfo.userPermission == 'admin' || this.tokenInfo.userPermission == 'Logistics specialist') {
            this.closeModal();
        }
    }

    onChange($event, vessel, dateIsStart): void {
        this.changing = true;
        var vesselnumber = this.turbineWarrenty.fullFleet.findIndex(x => x == vessel);
        var newActiveListing = {
            vesselname: vessel,
            fleetID: this.turbineWarrenty._id,
            dateStart: null,
            dateEnd: null
        };
        if (dateIsStart) {
            newActiveListing.dateStart = $event;
        } else {
            newActiveListing.dateEnd = $event;
        }
        this.listings[vesselnumber].push(newActiveListing);
        this.datePickerValue[vesselnumber] = [{}, {}];
        this.activeChanged[vesselnumber] = false;
        this.timeout = setTimeout(() => {
            this.changing = false;
        }, 10);
    }

    isNew(i) {
        return this.activeChanged[i];
    }

    setNotNew(i) {
        if (!this.changing) {
            this.activeChanged[i] = true;
        }
    }

    isOpen(vessel) {
        return this.openListing == vessel;
    }

    openActiveListings(vessel) {
        if (this.openListing != vessel) {
            this.openListing = vessel;
        } else {
            this.openListing = '';
        }
    }

    getActiveListings() {
        this.newService.getActiveListingsForFleet(this.turbineWarrenty._id, this.turbineWarrenty.client).subscribe(data => {
            this.activeListings = data;
            for (var i = 0; i < this.turbineWarrenty.fullFleet.length; i++) {
                this.listings[i] = [];
                for (var j = 0; j < this.activeListings.length; j++) {
                    if (this.turbineWarrenty.fullFleet[i] == this.activeListings[j].vesselname) {
                        this.listings[i].push(this.activeListings[j]);
                    }
                }
            }
        });
    }
}
