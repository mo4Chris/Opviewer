import { Component, OnInit } from '@angular/core';
import { routerTransition } from '../../router.animations';
import { CommonService } from '../../common.service';
import 'rxjs/add/operator/map';
import 'rxjs/add/operator/catch';
import * as jwt_decode from "jwt-decode";
import * as moment from "moment";

@Component({
  selector: 'app-vesselreport',
  templateUrl: './vesselreport.component.html',
  styleUrls: ['./vesselreport.component.scss'],
  animations: [routerTransition()]
})
export class VesselreportComponent implements OnInit {
  transferData;
  Locdata;
  boatLocationData;
  datePickerValue;
  dateData;
  vesselObject = {"date": this.getMatlabDateYesterday(), "mmsi": 235095774, "dateNormal": this.getJSDateYesterdayYMD()};
  tokenInfo = this.getDecodedAccessToken(localStorage.getItem('token'));

  constructor(private newService: CommonService) { }
  maxDate = {year: moment().add(-1, 'days').year(), month: (moment().month() + 1), day: moment().add(-1, 'days').date()}
  zoomlvl = 9;
  latitude;
  longitude;
  mapTypeId = "roadmap"
  streetViewControl = false;

  MatlabDateToJSDate(serial) {
    var dateInt = moment((serial - 719529) * 864e5).format("DD-MM-YYYY");
    return dateInt;
  }

  MatlabDateToJSDateYMD(serial) {
    var datevar = moment((serial - 719529) * 864e5).format("YYYY-MM-DD");
    return datevar;
  }
  JSDateYMDToObjectDate(YMDDate){
    YMDDate = YMDDate.split("-");
    var ObjectDate = {year: YMDDate[0], month: YMDDate[1] , day: YMDDate[2]};
    return ObjectDate;
  }

  MatlabDateToJSTime(serial) {
    var time_info  = moment((serial - 719529) * 864e5 ).format("HH:mm:ss");

    return time_info;
  }

  unixEpochtoMatlabDate(epochDate){
    let matlabTime = ((epochDate / 864e2) + 719530);
    return matlabTime;
  }

  MatlabDateToJSTimeDifference(serialEnd, serialBegin) {
    serialEnd = moment((serialEnd - 719529) * 864e5).startOf('second');
    serialBegin = moment((serialBegin - 719529) * 864e5).startOf('second');
    let difference = serialEnd.diff(serialBegin);

    return moment(difference).subtract(1, "hours").format("HH:mm:ss");
  }

  getDecodedAccessToken(token: string): any {
    try{
        return jwt_decode(token);
    }
    catch(Error){
        return null;
    }
  }

  GetTransfersForVessel(vessel) {
    return this.newService
    .GetTransfersForVessel(vessel)
    .map(
      (transfers) => {
        this.transferData = transfers;
      })
     .catch((error) => {
        console.log('error ' + error);
        throw error;
      });
  }

  getDatesWithTransfers(date){
    return this.newService
    .getDatesWithValues(date)
    .map(
      (dates) => {
        for (var _i = 0; _i < dates.length; _i++) {
          dates[_i] = this.JSDateYMDToObjectDate(this.MatlabDateToJSDateYMD(dates[_i]));
      }
        this.dateData = dates;
      })
     .catch((error) => {
        console.log('error ' + error);
        throw error;
      });
  }

  ngOnInit() {
   
    this.GetTransfersForVessel(this.vesselObject).subscribe(_ => {;
    this.getDatesWithTransfers(this.vesselObject).subscribe();
      if(this.transferData.length !== 0){
        this.newService.GetSpecificPark({"park" : this.transferData[0].fieldname}).subscribe(data => {this.Locdata = data.geometry.coordinates, this.latitude = data.geometry.coordinates[0][1], this.longitude = data.geometry.coordinates[0][0]} );
        this.newService.getRouteForBoat(this.vesselObject).subscribe(data => this.boatLocationData = data);
      }
      
    });
  }

  getMatlabDateYesterday(){
    let matlabValueYesterday = moment().add(-2, 'days');
    matlabValueYesterday.utcOffset(0).set({hour:0,minute:0,second:0,millisecond:0});
    matlabValueYesterday.format();

    let momentDateAsIso = moment(matlabValueYesterday).unix();

    let dateAsMatlab =  this.unixEpochtoMatlabDate(momentDateAsIso);

    return dateAsMatlab;
  }

  getJSDateYesterdayYMD(){
    let JSValueYesterday = moment().add(-1, 'days').utcOffset(0).set({hour:0,minute:0,second:0,millisecond:0}).format("YYYY-MM-DD");
    return JSValueYesterday;
  }

  searchTransfersByNewSpecificDate(){
    let datepickerValueAsMomentDate = moment(this.datePickerValue.day + "-" + this.datePickerValue.month + "-" + this.datePickerValue.year, "DD-MM-YYYY");
    datepickerValueAsMomentDate.utcOffset(0).set({hour:0,minute:0,second:0,millisecond:0});
    datepickerValueAsMomentDate.format();
    
    let momentDateAsIso = moment(datepickerValueAsMomentDate).unix();
    
    let dateAsMatlab = this.unixEpochtoMatlabDate(momentDateAsIso);
    
    this.vesselObject.date = dateAsMatlab;
    this.vesselObject.dateNormal = this.MatlabDateToJSDateYMD(dateAsMatlab);
    
    this.ngOnInit();
  }
}
