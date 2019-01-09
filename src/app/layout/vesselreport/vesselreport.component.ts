import { Component, OnInit, ViewChild } from '@angular/core';
import { routerTransition } from '../../router.animations';
import { CommonService } from '../../common.service';

import * as moment from 'moment';
import { ActivatedRoute, Router } from '@angular/router';
import { CalculationService } from '../../supportModules/calculation.service';
import { NgbDateStruct } from '@ng-bootstrap/ng-bootstrap';
import { DatetimeService } from '../../supportModules/datetime.service';
import { UserService } from '../../shared/services/user.service';

import { CtvreportComponent } from './ctv/ctvreport/ctvreport.component';
import { SovreportComponent } from './sov/sovreport/sovreport.component';

@Component({
  selector: 'app-vesselreport',
  templateUrl: './vesselreport.component.html',
  styleUrls: ['./vesselreport.component.scss'],
  animations: [routerTransition()]
})

export class VesselreportComponent implements OnInit {

  constructor(public router: Router, private newService: CommonService, private route: ActivatedRoute, private calculationService: CalculationService, private dateTimeService: DatetimeService, private userService: UserService) {

  }

  maxDate = {year: moment().add(-1, 'days').year(), month: (moment().add(-1, 'days').month() + 1), day: moment().add(-1, 'days').date() };
  outsideDays = 'collapsed';
  vesselObject = {'date': this.dateTimeService.getMatlabDateYesterday(), 'mmsi': this.getMMSIFromParameter(), 'dateNormal': this.dateTimeService.getJSDateYesterdayYMD(), 'vesselType': ''};

  parkNamesData;
  Locdata = [];
  boatLocationData = [];
  datePickerValue = this.maxDate;
  sailDates = [];
  typeOfLat;
  vessels;
  videoRequests;
  videoBudget;
  general = {};
  XYvars = [];
  charts = [];

  tokenInfo = this.userService.getDecodedAccessToken(localStorage.getItem('token'));
  public showContent = false;
  public showAlert = false;
  public noPermissionForData = false;
  mapZoomLvl;
  latitude;
  longitude;
  mapTypeId = 'roadmap';
  streetViewControl = false;
  commentOptions = ['Transfer OK', 'Unassigned', 'Tied off',
    'Incident', 'Embarkation', 'Vessel2Vessel',
    'Too much wind for craning', 'Trial docking',
    'Transfer of PAX not possible', 'Other'];
  commentsChanged;
  changedCommentObj = { 'newComment': '', 'otherComment': '' };
  alert = { type: '', message: '' };
  timeout;
  vessel;
  showMap = false;
  parkFound = false;
  routeFound = false;
  noTransits = true;
  videoRequestPermission = this.tokenInfo.userPermission === 'admin' || this.tokenInfo.userPermission === 'Logistics specialist';
  RequestLoading = true;

  @ViewChild(CtvreportComponent)
  private ctvChild: CtvreportComponent;

  @ViewChild(SovreportComponent)
  private sovChild: SovreportComponent;

  /////// Get variables from child components//////////
      getMapZoomLvl(mapZoomLvl: number): void {
        setTimeout(() => this.mapZoomLvl = mapZoomLvl, 500);
      }

      getLocdata(locData: any[]): void {
        this.Locdata = locData;
      }

      getLongitude(longitude: any): void {
        this.longitude = longitude;
      }

      getLatitude(latitude: any): void {
        this.latitude = latitude;
      }

      getBoatLocationData(boatLocationData: any[]): void {
        this.boatLocationData = boatLocationData;
        this.showMap = true;
      }

      getDatesHasSailed(sailDates: any[]): void {
          this.sailDates = sailDates;
      }

      getShowContent(showContent: boolean): void {
        setTimeout(() => this.showContent = showContent, 2000);
      }
  ///////////////////////////////////////////////////

  hasSailed(date: NgbDateStruct) {
    return this.dateTimeService.dateHasSailed(date, this.sailDates);
  }

  getMatlabDateToJSDate(serial) {
    return this.dateTimeService.MatlabDateToJSDate(serial);
  }

  getMMSIFromParameter() {
    let mmsi;
    this.route.params.subscribe( params => mmsi = parseFloat(params.boatmmsi));

    return mmsi;
  }

  objectToInt(objectvalue) {
    return this.calculationService.objectToInt(objectvalue);
  }

  ngOnInit() {
      if (this.tokenInfo.userPermission === 'admin') {
          this.newService.GetVessel().subscribe(data => this.vessels = data);
      } else {
          this.newService.GetVesselsForCompany([{ client: this.tokenInfo.userCompany }]).subscribe(data => {
              this.vessels = data;
          });
      }
      this.BuildPageWithCurrentInformation();
  }

  // TODO: make complient with the newly added usertypes
  BuildPageWithCurrentInformation() {
    this.resetRoutes();
    this.noPermissionForData = false;
    this.RequestLoading = true;
    this.newService.validatePermissionToViewData({ mmsi: this.vesselObject.mmsi }).subscribe(validatedValue => {
      if (validatedValue.length === 1) {
        this.vesselObject.vesselType = validatedValue[0].operationsClass;

        setTimeout(() => {

          if (this.vesselObject.vesselType === 'CTV' && this.ctvChild !== undefined) {
              this.ctvChild.BuildPageWithCurrentInformation();
          }

          if ((this.vesselObject.vesselType === 'SOV' || this.vesselObject.vesselType === 'OSV') && this.sovChild !== undefined) {
              this.sovChild.BuildPageWithCurrentInformation();
          }
      }, 1000);
          /* setTimeout(() => this.showContent = true, 1050);

          // when chartinfo has been generated create slipgraphs. If previously slipgraphes have existed destroy them before creating new ones.
          if (this.charts.length <= 0) {
            setTimeout(() => this.createSlipgraphs(), 10);
          } else {
            if (typeof this.transferData[0] !== 'undefined' && typeof this.transferData[0].slipGraph !== 'undefined' && typeof this.transferData[0].slipGraph.slipX !== 'undefined' && this.transferData[0].slipGraph.slipX.length > 0) {
                for (let i = 0; i < this.charts.length; i++) {
                  this.charts[i].destroy();
                }
                setTimeout(() => this.createSlipgraphs(), 10);
              } else {
                for (let i = 0; i < this.charts.length; i++) {
                  this.charts[i].destroy();
                }
            }
          }
        }); */
      } else {
        this.noPermissionForData = true;
      }
    });
    setTimeout(() => this.RequestLoading = false, 2500);
  }

  onChange(): void {
    this.searchTransfersByNewSpecificDate();
    this.resetRoutes();
  }

  GetDateAsMatlab(): any {
    const datepickerValueAsMomentDate = moment(this.datePickerValue.day + '-' + this.datePickerValue.month + '-' + this.datePickerValue.year, 'DD-MM-YYYY');
    datepickerValueAsMomentDate.utcOffset(0).set({ hour: 0, minute: 0, second: 0, millisecond: 0 });
    datepickerValueAsMomentDate.format();

    const momentDateAsIso = moment(datepickerValueAsMomentDate).unix();

    return this.dateTimeService.unixEpochtoMatlabDate(momentDateAsIso);
  }

  searchTransfersByNewSpecificDate() {
    const dateAsMatlab = this.GetDateAsMatlab();
    this.vesselObject.date = dateAsMatlab;
    this.vesselObject.dateNormal = this.dateTimeService.MatlabDateToJSDateYMD(dateAsMatlab);

    this.BuildPageWithCurrentInformation();
  }

  resetRoutes() {
    this.Locdata = [];
    this.boatLocationData = [];
    this.longitude = 0;
    this.latitude = 0;
    this.showMap = false;
    this.routeFound = false;
    this.parkFound = false;
  }

  getGeneralStats() {
      this.newService.getGeneral(this.vesselObject).subscribe(general => {
          if (general.data.length > 0 && general.data[0].DPRstats) {
              this.noTransits = false;
              this.general = general.data[0].DPRstats;
          } else {
              this.noTransits = true;
              this.general = {};
      }});
  }

  roundNumber(number, decimal = 10, addString = '') {
    if (typeof number === 'string' || number instanceof String) {
      return number;
    }
    if (!number) {
      return 'n/a';
    }

    return (Math.round(number * decimal) / decimal) + addString;
  }
}
