import { Component, OnInit, HostListener, ViewChild, ViewEncapsulation } from '@angular/core';
import { routerTransition } from '../../../router.animations';
import { CommonService } from '../../../common.service';
import * as Chart from 'chart.js';
import { ActivatedRoute, Router } from '@angular/router';
import { NgbModal, NgbModalRef } from '@ng-bootstrap/ng-bootstrap';
import { NgbTypeahead } from '@ng-bootstrap/ng-bootstrap';
import { map, catchError, debounceTime, distinctUntilChanged } from 'rxjs/operators';
import { Observable, Subject, merge } from 'rxjs';
import * as moment from 'moment-timezone';
import { UserService } from '@app/shared/services/user.service';
import { DialogService } from '@app/dialog.service';
import { DatetimeService } from '@app/supportModules/datetime.service';
import { CalculationService } from '@app/supportModules/calculation.service';
import { StringMutationService } from '@app/shared/services/stringMutation.service';
import * as ChartAnnotation from 'chartjs-plugin-annotation';
import { UserModel } from '@app/models/userModel';
import { isArray } from 'util';


@Component({
    selector: 'app-users',
    templateUrl: './fleetavailability.html',
    styleUrls: ['./fleetavailability.component.scss'],
    animations: [routerTransition()],
    encapsulation: ViewEncapsulation.None,
})
export class FleetavailabilityComponent implements OnInit {
    constructor(
        private router: Router,
        private newService: CommonService,
        private modalService: NgbModal,
        private route: ActivatedRoute,
        private dateTimeService: DatetimeService,
        private userService: UserService,
        public dialogService: DialogService,
        private calculationService: CalculationService,
        private stringMutationService: StringMutationService
    ) { }

    tokenInfo = this.userService.getDecodedAccessToken(localStorage.getItem('token'));
    myChart;
    hideText = false;
    edit = false;
    turbineWarrenty: TurbineWarrentyModel;
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
    vesselToAdd = '';
    openListing = [''];
    activeListings;
    datePickerValue = [[]];
    activeChanged = [];
    listings = [];
    startDate;
    stopDate;
    changing = false;
    errorListing = [[]];
    numberNewListings = 0;
    isActive = [[]];
    changedUsers: ExtendedUserModel[][] = [];
    noData = false;

    @ViewChild('instance') instance: NgbTypeahead;
    focus$ = new Subject<string>();
    click$ = new Subject<string>();

    search = (text$: Observable<string>) => {
        const debouncedText$ = text$.pipe(debounceTime(200), distinctUntilChanged());
        const inputFocus$ = this.focus$;

        return merge(debouncedText$, inputFocus$).pipe(
            map(term => (term === '' ? this.existingVessels
                : this.existingVessels.filter(v => v.toLowerCase().indexOf(term.toLowerCase()) > -1)).slice(0, this.existingVessels.length))
        );
    }

    ngOnInit() {
        this.newService.checkUserActive(this.tokenInfo.username).subscribe(userIsActive => {
            if (userIsActive === true) {
                Chart.pluginService.register(ChartAnnotation);
                this.getCampaignName();
                this.getStartDate();
                this.getWindfield();
                this.buildData(true);
            } else {
                localStorage.removeItem('isLoggedin');
                localStorage.removeItem('token');
                this.router.navigate(['login']);
              }
            });
    }

    buildData(init = false) {
        this.newService.getTurbineWarrantyOne({
            campaignName: this.params.campaignName,
            windfield: this.params.windfield,
            startDate: this.params.startDate
        }).subscribe(data => {
            if (data.data != null) {
                if (!isArray(data.data.sailMatrix[0])) {
                    data.data.sailMatrix = [data.data.sailMatrix];
                }
                this.turbineWarrenty = data.data;
                let date = this.dateTimeService.matlabDatenumToMoment(this.turbineWarrenty.startDate);
                this.startDate = this.convertMomentToObject(date);
                date = this.dateTimeService.matlabDatenumToMoment(this.turbineWarrenty.stopDate);
                this.stopDate = this.convertMomentToObject(date);
            } else {
                this.noData = data.err;
                return;
            }
            this.getActiveListings(init);
            this.orderSailMatrixByActive();
            this.sailMatrix = this.turbineWarrenty.sailMatrix.map(x => Object.assign({}, x));
            if (data.sailDayChanged[0]) {
                for (let i = 0; i < this.sailMatrix.length; i++) {
                    this.changedUsers[i] = [];
                    for (let j = 0; j < this.turbineWarrenty.Dates.length; j++) {
                        for (let k = 0; k < data.sailDayChanged.length; k++) {
                            if (this.turbineWarrenty.Dates[j] === data.sailDayChanged[k].date && this.turbineWarrenty.fullFleet[i] === data.sailDayChanged[k].vessel) {
                                this.changedUsers[i][j] = data.sailDayChanged[k].userID;
                                this.sailMatrix[i][j] = data.sailDayChanged[k].newValue;
                            }
                        }
                    }
                }
                this.newService.getUserClientById(this.changedUsers, this.turbineWarrenty.client).subscribe((_data: ExtendedUserModel) => {
                    const changed = [];
                    this.changedUsers.forEach(function(items, index) {
                        changed[index] = [];
                        items.forEach(function(item, ind) {
                            changed[index][ind] = _data[_data.findIndex(x => x._id === item)];
                        });
                    });
                    this.changedUsers = changed;
                });
            }
            if (init) {
                this.getAvailableMonths();
                if (this.tokenInfo.userPermission === 'admin') {
                    this.newService.getVessel().subscribe(_vessel => {
                        this.existingVessels = _vessel.map(v => v.nicename);
                    });
                } else {
                    this.newService.getVesselsForCompany([{
                        client: this.tokenInfo.userCompany,
                        notHired: 1
                    }]).subscribe(_vessel => {
                        this.existingVessels = data.map(v => v.nicename);
                    });
                }
            }
        });
    }

    getCampaignName() {
        this.route.params.subscribe(params => this.params.campaignName = params.campaignName);
    }

    getWindfield() {
        this.route.params.subscribe(params => this.params.windfield = params.windfield);
    }

    getStartDate() {
        this.route.params.subscribe(params => this.params.startDate = parseFloat(params.startDate));
    }

    createLineChart() {
        if (this.tokenInfo.userPermission === 'admin' || this.tokenInfo.userPermission === 'Logistics specialist') {
            this.myChart = new Chart('canvas', {
                type: 'line',
                data: {
                    datasets: [{
                        data: this.totalWeatherDaysPerMonth,
                        label: 'Actual weather days',
                        borderColor: 'black',
                        backgroundColor: '#00000000'
                    }, {
                        data: this.forecastAfterRecorded,
                        label: 'Predicted weather days',
                        borderColor: 'red',
                        backgroundColor: '#00000000'
                    }, {
                        data: this.forecastFromStart,
                        label: 'Original prediction',
                        borderColor: 'green',
                        backgroundColor: '#00000000'
                    }]
                },
                options: {
                    tooltips: {
                        callbacks: {
                            label: function (tooltipItem, data) {
                                let label = data.datasets[tooltipItem.datasetIndex].label || '';
                                if (label) {
                                    label += ': ';
                                }
                                label += Math.round(tooltipItem.yLabel * 100) / 100;
                                return label;
                            }
                        }
                    },
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
                    },
                    annotation: {
                        annotations: [
                            {
                                type: 'line',
                                drawTime: 'afterDatasetsDraw',
                                id: 'average',
                                mode: 'horizontal',
                                scaleID: 'y-axis-0',
                                value: 0,
                                borderWidth: 2,
                                borderColor: 'gray',
                                borderDash: [10, 5]
                            }
                        ]
                    }
                }
            });
        }
    }

    MatlabDateToJSDatePerMonth(serial) {
        if (this.selectedMonth === 'Last 2 weeks') {
            return this.dateTimeService.matlabDatenumToDmyString(serial);
        } else {
            return this.dateTimeService.matlabDatenumToDayString(serial);
        }
    }

    MatlabDateToJSDate(serial) {
        return this.dateTimeService.matlabDatenumToDmyString(serial);
    }

    MatlabDateToJSTime(serial) {
        return this.dateTimeService.matlabDatenumToTimeString(serial);
    }

    MatlabDateToJSDateTime(serial) {
        return this.dateTimeService.matlabDatenumToDmyString(serial) + ' ' + this.dateTimeService.matlabDatenumToTimeString(serial);
    }

    convertObjectToMoment(year, month, day) {
        return this.dateTimeService.moment(year, month, day);
    }

    convertMomentToObject(date, addMonth = true) {
        return this.dateTimeService.momentToYMD(date, addMonth);
    }

    changeToNicename(name) {
        return this.stringMutationService.changeToNicename(name);
    }

    roundNumber(number, decimal = 10, addString = '') {
        return this.calculationService.roundNumber(number, decimal, addString);
    }

    getAvailableMonths() {
        const dateStart = this.dateTimeService.matlabDatenumToMoment(this.turbineWarrenty.startDate);
        const dateEnd = this.dateTimeService.matlabDatenumToMoment(this.turbineWarrenty.stopDate);

        let _counter = 0;
        while ((dateEnd > dateStart || dateStart.format('M') === dateEnd.format('M')) && _counter++ < 200 ) {
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
        const date = this.dateTimeService.matlabDatenumToMoment(Date);
        if (this.selectedMonth !== 'Last 2 weeks') {
            const stopDate = moment('01 ' + this.selectedMonth, 'DD MMM YYYY');
            if (date.month() === stopDate.month() && date.year() === stopDate.year()) {
                return true;
            }
        } else {
            const lastTwoWeeks = this.turbineWarrenty.Dates.slice(Math.max(this.turbineWarrenty.Dates.length - 14, 0));
            if (lastTwoWeeks.indexOf(Date) > -1) {
                return true;
            }
        }
        return false;
    }

    getSailDay(sailday) {
        if (sailday === '_NaN_') {
            return '-';
        } else {
            return sailday;
        }
    }

    setMonth(val) {
        this.selectedMonth = val;
        this.missingDays = [];
    }

    addDateSailDay(sd, ind, date) {
        if (!this.missingDays[ind]) {
            this.missingDays[ind] = 0;
        }
        if (sd !== '_NaN_' && sd >= 0 && this.isActive[ind][this.turbineWarrenty.Dates.findIndex(x => x === date)]) {
            this.missingDays[ind] += (1 - sd);
            this.dateSailDays += parseFloat(sd);
        }
    }

    getDateWeatherDays() {
        const saildays = this.dateSailDays;
        this.dateSailDays = 0;
        const weatherDays = this.turbineWarrenty.numContractedVessels - saildays;
        this.totalWeatherDays += weatherDays;
        return weatherDays;
    }

    getTotalWeatherDays() {
        const total = this.totalWeatherDays;
        this.totalWeatherDays = 0;
        return total;
    }

    getTotalMissingDays(ind) {
        const total = this.missingDays[ind];
        this.missingDays[ind] = 0;
        return total;
    }

    setEditDataFlag() {
        this.edit = true;
        this.hideText = false;
    }

    cancelSailDaysEdit() {
        this.sailDaysChanged = [];
        this.edit = false;
    }

    saveSailDaysChanged() {
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
            this.edit = false;
            this.sailDaysChanged = [];
            this.saving = false;
            this.buildData();
        });

    }

    updateSailDay(date, vessel, newValue, i, ind) {
        if (!this.sailDaysChanged.filter(x => x.date === date && x.vessel === vessel).length) {
            this.sailDaysChanged.push({
                vessel: vessel,
                date: date,
                fleetID: this.turbineWarrenty._id,
                oldValue: this.sailMatrix[i][ind],
                newValue: newValue,
                userID: this.tokenInfo.userID
            });
        } else {
            const index = this.sailDaysChanged.findIndex((x => x.date === date && x.vessel === vessel));
            this.sailDaysChanged[index].newValue = newValue;
        }
    }

    getGraphData() {
        // recorded weather days
        let target = this.turbineWarrenty.weatherDayTarget;
        for (let i = 0; i < this.turbineWarrenty.Dates.length; i++) {
            const x = this.dateTimeService.matlabDatenumToMoment(this.turbineWarrenty.Dates[i]);
            if (i === 0) {
                x.add(9, 'hour');
            }
            this.totalWeatherDaysPerMonth[i] = { x: x, y: this.turbineWarrenty.numContractedVessels };
            for (let j = 0; j < this.turbineWarrenty.fullFleet.length; j++) {
                this.datePickerValue[j] = [null];
                if (this.sailMatrix[j][i] !== '_NaN_' && this.isActive[j][i]) {
                    this.totalWeatherDaysPerMonth[i].y = parseFloat(this.totalWeatherDaysPerMonth[i].y) - parseFloat(this.sailMatrix[j][i]);
                }
            }
        }
        for (let i = 0; i < this.totalWeatherDaysPerMonth.length; i++) {
            target = target - this.totalWeatherDaysPerMonth[i].y;
            this.totalWeatherDaysPerMonth[i].y = target;
            this.forecastAfterRecorded[i] = { x: this.totalWeatherDaysPerMonth[i].x, y: null };
        }
        this.totalWeatherDaysPerMonth.reverse();
        this.totalWeatherDaysPerMonth.push({
            x: this.dateTimeService.matlabDatenumToMoment(this.turbineWarrenty.startDate).subtract(1, 'hour'),
            y: this.turbineWarrenty.weatherDayTarget
        });
        this.totalWeatherDaysPerMonth.reverse();

        // forecast after recorded
        const dateForecast = this.dateTimeService.matlabDatenumToMoment(this.turbineWarrenty.startDate).add(this.totalWeatherDaysPerMonth.length - 1, 'days');
        const dateEnd = this.dateTimeService.matlabDatenumToMoment(this.turbineWarrenty.stopDate);

        this.forecastAfterRecorded[0] = { x: this.dateTimeService.matlabDatenumToMoment(this.turbineWarrenty.startDate).subtract(1, 'hour'), y: null };
        this.forecastAfterRecorded[this.forecastAfterRecorded.length - 1].y = parseFloat(this.totalWeatherDaysPerMonth[this.totalWeatherDaysPerMonth.length - 1].y);

        let _counter = 0;
        while (dateEnd >= dateForecast && _counter++ < 200) {
            const index = parseInt(dateForecast.format('M')) - 1;
            const forecast = this.turbineWarrenty.weatherDayForecast[index][0] * this.turbineWarrenty.numContractedVessels;
            this.forecastAfterRecorded.push({ x: moment(dateForecast), y: this.forecastAfterRecorded[this.forecastAfterRecorded.length - 1].y - forecast });
            dateForecast.add(1, 'days');
        }
        this.forecastAfterRecorded[this.forecastAfterRecorded.length - 1].x = this.forecastAfterRecorded[this.forecastAfterRecorded.length - 1].x.subtract(1, 'hour');

        // forecast from start
        this.forecastFromStart[0] = {
            x: this.dateTimeService.matlabDatenumToMoment(this.turbineWarrenty.startDate).subtract(1, 'hour'),
            y: this.turbineWarrenty.weatherDayTarget
        };
        target = this.turbineWarrenty.weatherDayTarget;
        for (let i = 1; i < this.allMonths.length; i++) {
            const index = parseInt(moment(this.allMonths[i - 1], 'MMM YYYY').format('M')) - 1;
            const forecastWeatherdays = this.turbineWarrenty.weatherDayForecast[index][0] *
                this.turbineWarrenty.numContractedVessels *
                moment(this.allMonths[i], 'MMM YYYY').daysInMonth();
            target = target - forecastWeatherdays;
            this.forecastFromStart[i] = { x: moment(this.allMonths[i], 'MMM YYYY'), y: target };
        }
        this.loaded = true;
        this.createLineChart();
    }

    openModal(content, settings, activeListingsModal = false) {
        if (activeListingsModal) {
            this.getActiveListings();
        }
        this.modalReference = this.modalService.open(content, settings);
    }

    closeModal() {
        this.modalReference.close();
    }

    addVessel(closeModal = true) {
        if (this.tokenInfo.userPermission === 'admin' || this.tokenInfo.userPermission === 'Logistics specialist') {
            const vesselToAdd = {
                client: this.turbineWarrenty.client,
                vessel: this.vesselToAdd,
                campaignName: this.params.campaignName,
                windfield: this.params.windfield,
                startDate: this.params.startDate
            };
            if (this.turbineWarrenty.fullFleet.indexOf(vesselToAdd.vessel) >= 0) {
                this.setAlert('danger', 'Vessel already in fleet', true);
                return;
            }
            this.newService.addVesselToFleet(vesselToAdd).pipe(
                map(
                    (res) => {
                        this.setAlert('success', res.data, closeModal);
                    }
                ),
                catchError(error => {
                    this.setAlert('danger', error._body, closeModal);
                    throw error;
                })
            ).subscribe(_ => {
                this.vesselToAdd = '';
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

    setActive(closeModal = true) {
        if (this.tokenInfo.userPermission === 'admin' || this.tokenInfo.userPermission === 'Logistics specialist') {
            this.openListing = [''];
            let stopSetActive = false;
            for (let i = 0; i < this.activeChanged.length; i++) {
                for (let j = 0; j < this.activeChanged[i].length; j++) {
                    this.errorListing[i][j] = false;
                    let start, end;
                    if (this.activeChanged[i][j].dateStart) {
                        start = this.convertObjectToMoment(this.activeChanged[i][j].dateStart.year, this.activeChanged[i][j].dateStart.month,
                            this.activeChanged[i][j].dateStart.day).add(1, 'hour').valueOf();
                    }
                    if (this.activeChanged[i][j].dateEnd) {
                        end = this.convertObjectToMoment(this.activeChanged[i][j].dateEnd.year, this.activeChanged[i][j].dateEnd.month,
                            this.activeChanged[i][j].dateEnd.day).add(1, 'hour').valueOf();
                    }
                    if (this.activeChanged[i][j].dateStart && this.activeChanged[i][j].dateEnd) {
                        if (start > end) {
                            this.errorListing[i][j] = true;
                            if (!(this.openListing.indexOf(this.turbineWarrenty.fullFleet[i]) > -1)) {
                                this.openListing.push(this.turbineWarrenty.fullFleet[i]);
                            }
                            stopSetActive = true;
                        }
                    }
                    if (this.activeChanged[i][j].dateStart) {
                        this.activeChanged[i][j].dateStart = start;
                    }
                    if (this.activeChanged[i][j].dateEnd) {
                        this.activeChanged[i][j].dateEnd = end;
                    }
                }
            }
            if (stopSetActive) {
                this.activeChanged.forEach((items, index) => {
                    if (items instanceof Array) {
                        items.forEach((item, ind) => {
                            item.dateStart = this.convertMomentToObject(moment(item.dateStart));
                            item.dateEnd = this.convertMomentToObject(moment(item.dateEnd));
                        });
                    }
                });
                return;
            }
            const params = {
                listings: this.activeChanged,
                client: this.turbineWarrenty.client,
                fleetID: this.turbineWarrenty._id,
                stopDate: this.convertObjectToMoment(this.stopDate.year, this.stopDate.month, this.stopDate.day).valueOf()
            };
            this.newService.setActiveListings(params).pipe(
                map(
                    (res) => {
                        if (res.twa) {
                            this.turbineWarrenty.activeFleet = res.twa.activeFleet;
                        }
                        this.setAlert('success', res.data, closeModal);
                    }
                ),
                catchError(error => {
                    this.setAlert('danger', error._body, closeModal);
                    throw error;
                })
            ).subscribe(_ => {
                this.getActiveListings();
                this.openListing = [''];
            });
        } else {
            this.setAlert('danger', 'You are not authorised to perform this action', closeModal);
        }
    }

    onChange(listing, vesselnumber) {
        const index = this.activeChanged[vesselnumber].findIndex(x => x.listingID === listing.listingID);
        if (index < 0) {
            this.activeChanged[vesselnumber].push(listing);
        } else {
            this.activeChanged[vesselnumber][index] = listing;
        }
    }

    onClear(listing, vesselnumber, isDateStart) {
        const index = this.activeChanged[vesselnumber].findIndex(x => x.listingID === listing.listingID);
        if (isDateStart) {
            listing.dateStart = null;
        } else {
            listing.dateEnd = null;
        }
        if (index < 0) {
            this.activeChanged[vesselnumber].push(listing);
        } else {
            this.activeChanged[vesselnumber][index] = listing;
        }
    }

    onChangeNew($event, vessel, dateIsStart): void {
        this.changing = true;
        this.numberNewListings++;
        const vesselnumber = this.turbineWarrenty.fullFleet.findIndex(x => x === vessel);
        const newActiveListing = {
            vesselname: vessel,
            fleetID: this.turbineWarrenty._id,
            dateStart: null,
            dateEnd: null,
            listingID: this.numberNewListings,
            newListing: true
        };
        if (dateIsStart) {
            newActiveListing.dateStart = $event;
        } else {
            newActiveListing.dateEnd = $event;
        }
        this.listings[vesselnumber].push(newActiveListing);
        this.activeChanged.push(newActiveListing);
        this.datePickerValue[vesselnumber] = [{}, {}];
        this.timeout = setTimeout(() => {
            this.changing = false;
        }, 10);
    }

    setNotNew(i) {
        if (!this.changing) {
            this.numberNewListings++;
            const newActiveListing = {
                vesselname: this.turbineWarrenty.fullFleet[i],
                fleetID: this.turbineWarrenty._id,
                dateStart: null,
                dateEnd: null,
                listingID: this.numberNewListings,
                newListing: true
            };
            this.listings[i].push(newActiveListing);
            this.activeChanged[i].push(newActiveListing);
        }
    }

    isOpen(vessel) {
        return this.openListing.indexOf(vessel) > -1;
    }

    openActiveListings(vessel) {
        if (!(this.openListing.indexOf(vessel) > -1)) {
            this.openListing = [vessel];
        } else {
            this.openListing = [''];
        }
    }

    getActiveListings(init = false) {
        this.openListing = [''];
        const stop = this.convertObjectToMoment(this.stopDate.year, this.stopDate.month, this.stopDate.day).valueOf();
        this.newService.getActiveListingsForFleet(this.turbineWarrenty._id, this.turbineWarrenty.client, stop).subscribe(data => {
            this.activeListings = data.data;
            this.activeListings.sort(function (listing1, listing2) { return listing1.dateStart - listing2.dateStart; });
            this.turbineWarrenty.activeFleet = data.twa.activeFleet;
            for (let i = 0; i < this.turbineWarrenty.fullFleet.length; i++) {
                this.listings[i] = [];
                this.errorListing[i] = [];
                this.activeChanged[i] = [];
                const deletedListings = [];
                for (let j = 0; j < this.activeListings.length; j++) {
                    if (this.turbineWarrenty.fullFleet[i] === this.activeListings[j].vesselname && deletedListings.indexOf(this.activeListings[j].listingID) < 0) {
                        let date = moment(this.activeListings[j].dateStart);
                        this.activeListings[j].dateStart = this.convertMomentToObject(date);
                        date = moment(this.activeListings[j].dateEnd);
                        this.activeListings[j].dateEnd = this.convertMomentToObject(date);
                        const index = this.listings[i].findIndex(x => x.listingID === this.activeListings[j].listingID);
                        if (!this.activeListings[j].deleted) {
                            if (index > -1) {
                                if (this.activeListings[j].dateChanged >= this.listings[i][index].dateChanged) {
                                    this.listings[i][index] = this.activeListings[j];
                                }
                            } else {
                                this.listings[i].push(this.activeListings[j]);
                            }
                        } else {
                            deletedListings.push(this.activeListings[j].listingID);
                            if (index > -1) {
                                this.listings[i].splice(index, 1);
                            }
                        }
                    }
                }
                this.isActive[i] = [];
                for (let k = 0; k < this.listings[i].length; k++) {
                    const item = this.listings[i][k];
                    for (let l = 0; l < this.turbineWarrenty.sailMatrix[i].length; l++) {
                        if (item.deleted) {
                            continue;
                        }
                        const dat = this.dateTimeService.matlabDatenumToMoment(this.turbineWarrenty.Dates[l]);
                        let start;
                        if (item.dateStart.year !== 'NaN') {
                            start = this.convertObjectToMoment(item.dateStart.year, item.dateStart.month, item.dateStart.day).add(1, 'hour').valueOf();
                        }
                        let end;
                        if (item.dateEnd.year !== 'NaN') {
                            end = this.convertObjectToMoment(item.dateEnd.year, item.dateEnd.month, item.dateEnd.day).add(22, 'hour').valueOf();
                        }
                        if (!start && !end || !start && dat <= end || !end && dat >= start || dat >= start && dat <= end) {
                            this.isActive[i][l] = true;
                        }
                    }
                }
            }
            if (init) {
                this.getGraphData();
            }
        });
    }

    deleteListing(deleteItem, vesselnumber) {
        this.listings[vesselnumber].forEach((item, index) => {
            if (item === deleteItem) {
                this.listings[vesselnumber].splice(index, 1);
            }
        });
        if (deleteItem.listingID) {
            deleteItem.deleted = true;
            const index = this.activeChanged[vesselnumber].findIndex(x => x.listingID === deleteItem.listingID);
            if (!deleteItem.newListing) {
                if (index > -1) {
                    this.activeChanged[vesselnumber][index] = deleteItem;
                } else {
                    this.activeChanged[vesselnumber].push(deleteItem);
                }
            } else {
                this.activeChanged[vesselnumber].splice(index, 1);
            }
        }
    }

    orderSailMatrixByActive() {
        const active = this.turbineWarrenty.activeFleet;
        const sorted = { fleet: [], sailMatrix: [] };
        for (let i = 0; i < this.turbineWarrenty.fullFleet.length; i++) {
            if (active.includes(this.turbineWarrenty.fullFleet[i])) {
                sorted.fleet.push(this.turbineWarrenty.fullFleet[i]);
                this.turbineWarrenty.fullFleet.splice(i, 1);
                sorted.sailMatrix.push(this.turbineWarrenty.sailMatrix[i]);
                this.turbineWarrenty.sailMatrix.splice(i, 1);
                i--;
            }
        }
        sorted.fleet = sorted.fleet.concat(this.turbineWarrenty.fullFleet);
        sorted.sailMatrix = sorted.sailMatrix.concat(this.turbineWarrenty.sailMatrix);
        this.turbineWarrenty.fullFleet = sorted.fleet;
        this.turbineWarrenty.sailMatrix = sorted.sailMatrix;
    }
}

interface ExtendedUserModel extends UserModel {
    findIndex ?: (any) => number;
}

export interface TurbineWarrentyModel {
    campaignName: string;
    startDate: number;
    stopDate: number;
    client: string;
    windfield: string;

    fullFleet: string[];
    activeFleet: string[];

    numContractedVessels: number;
    weatherDayTarget: number;
    weatherDayForecast: number;

    Dates: number[];
    sailMatrix: Array<number|'_NaN_'>[];
    lastUpdated: number;
    _id: string;
}
