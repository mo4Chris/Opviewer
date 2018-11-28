import { Component, OnInit, ViewChild } from '@angular/core';
import { routerTransition } from '../../router.animations';
import { CommonService } from '../../common.service';

import * as jwt_decode from 'jwt-decode';
import * as moment from 'moment';
import { ActivatedRoute, Router } from '@angular/router';
import { map, catchError } from 'rxjs/operators';
import { CalculationService } from '../../supportModules/calculation.service';
import { NgbDateStruct } from '@ng-bootstrap/ng-bootstrap';
import { DatetimeService } from '../../supportModules/datetime.service';

import { CtvreportComponent } from './ctv/ctvreport/ctvreport.component';
import { SovreportComponent } from './sov/sovreport/sovreport.component';

@Component({
  selector: 'app-vesselreport',
  templateUrl: './vesselreport.component.html',
  styleUrls: ['./vesselreport.component.scss'],
  animations: [routerTransition()]
})
export class VesselreportComponent implements OnInit {

  constructor(public router: Router, private newService: CommonService, private route: ActivatedRoute, private calculationService : CalculationService, private dateTimeService : DatetimeService) {

  }

  maxDate = {year: moment().add(-1, 'days').year(), month: (moment().add(-1, 'days').month() + 1), day: moment().add(-1, 'days').date()};
  outsideDays = 'collapsed';
  vesselObject = {'date': this.dateTimeService.getMatlabDateYesterday(), 'mmsi': this.getMMSIFromParameter(), 'dateNormal': this.dateTimeService.getJSDateYesterdayYMD(), 'vesselType': ''};

  parkNamesData;
  Locdata = [];
  boatLocationData;
  datePickerValue = this.maxDate;
  dateData;
  typeOfLat;
  vessels;

  tokenInfo = this.getDecodedAccessToken(localStorage.getItem('token'));
  public showContent = false;
  public noPermissionForData = false;
  
  overviewZoomlvl;
  detailZoomlvl;
  latitude;
  longitude;
  mapTypeId = 'roadmap';
  streetViewControl = false;

  vessel;

  @ViewChild(CtvreportComponent)
  private child: CtvreportComponent;

  @ViewChild(SovreportComponent)
  private sovChild: SovreportComponent;

  getOverviewZoomLvl(childZoomLvl: number): void{
    setTimeout(() => this.overviewZoomlvl = childZoomLvl, 500);
  }

  getDetailZoomLvl(childZoomLvl: number): void{
    setTimeout(() => this.detailZoomlvl = childZoomLvl, 500);
  }

  hasSailed(date: NgbDateStruct) {
    return this.dateTimeService.dateHasSailed(date, this.dateData);
  }

  getMatlabDateToJSDate(serial) {
    return this.dateTimeService.MatlabDateToJSDate(serial);
  }

  getMMSIFromParameter() {
    let mmsi;
    this.route.params.subscribe( params => mmsi = parseFloat(params.boatmmsi));

    return mmsi;
  }

  getDecodedAccessToken(token: string): any {
    try {
        return jwt_decode(token);
    } catch (Error) {
        return null;
    }
  }

  getDatesWithTransfers(date) {
    return this.newService
    .getDatesWithValues(date).pipe(
      map(
        (dates) => {
          for (let _i = 0; _i < dates.length; _i++) {
            dates[_i] = this.dateTimeService.JSDateYMDToObjectDate(this.dateTimeService.MatlabDateToJSDateYMD(dates[_i]));
        }
          this.dateData = dates;
        }),
        catchError(error => {
          console.log('error ' + error);
          throw error;
        }));
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
    this.noPermissionForData = false;
    this.newService.validatePermissionToViewData({mmsi: this.vesselObject.mmsi}).subscribe(validatedValue => {
      if (validatedValue.length === 1) {
        this.vesselObject.vesselType = validatedValue[0].operationsClass;
        this.getDatesWithTransfers(this.vesselObject).subscribe(_ => {        
            this.newService.GetDistinctFieldnames({'mmsi' : this.vesselObject.mmsi, 'date' : this.vesselObject.date}).subscribe(data => {
              this.newService.GetSpecificPark({'park' : data}).subscribe(data => {
                if(data.length !== 0) {
                    this.Locdata = data, this.latitude = parseFloat(data[0].lat[Math.floor(data[0].lat.length / 2)]), this.longitude = parseFloat(data[0].lon[Math.floor(data[0].lon.length / 2)]); 
                }
                else {
                  this.Locdata = [];
                }             
                });
            });
            this.newService.getCrewRouteForBoat(this.vesselObject).subscribe(data => this.boatLocationData = data);
            setTimeout(() => this.showContent = true, 1050);
        });
      } else {
        this.showContent = true;
        this.noPermissionForData = true;
      }
    });
  }

  onChange(event): void {
    this.searchTransfersByNewSpecificDate();
    if(this.vesselObject.vesselType == 'CTV' && this.child != null) {
        setTimeout(() => this.child.BuildPageWithCurrentInformation(), 1000);
    }
    if((this.vesselObject.vesselType == 'SOV' || this.vesselObject.vesselType == 'OSV') && this.sovChild != null) {
      setTimeout(() => this.sovChild.BuildPageWithCurrentInformation(), 1000);
    }
  }

  GetDateAsMatlab(): any {
    const datepickerValueAsMomentDate = moment(this.datePickerValue.day + '-' + this.datePickerValue.month + '-' + this.datePickerValue.year, 'DD-MM-YYYY');
    datepickerValueAsMomentDate.utcOffset(0).set({hour: 0, minute: 0, second: 0, millisecond: 0});
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
}