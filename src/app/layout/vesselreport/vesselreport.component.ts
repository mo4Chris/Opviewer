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
  Repdata;
  Locdata;
  boatLocationData;
  datePickerValue;
  vesselObject = {"date": this.getMatlabDateYesterday(), "mmsi": 235095774, "dateNormal": this.getJSDateYesterdayYMD()};
  tokenInfo = this.getDecodedAccessToken(localStorage.getItem('token'));

  constructor(private newService: CommonService) { }
  zoomlvl = 8;
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
        this.Repdata = transfers;
      })
     .catch((error) => {
        console.log('error ' + error);
        throw error;
      });
    // users => this.users = users,
    // error => this.errorMsg = <any>error);
  }

  ngOnInit() {
    this.GetTransfersForVessel(this.vesselObject).subscribe(_ => {;
      this.newService.GetSpecificPark("test").subscribe(data => {this.Locdata = data.geometry.coordinates, this.latitude = data.geometry.coordinates[0][1], this.longitude = data.geometry.coordinates[0][0]} );
      this.newService.getRouteForBoat(this.vesselObject).subscribe(data => this.boatLocationData = data);
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
    console.log(JSValueYesterday);

    return JSValueYesterday;
  }

  searchTransfersByNewSpecificDate(){
    let datepickerValueAsMomentDate = moment(this.datePickerValue.day + "-" + this.datePickerValue.month + "-" + this.datePickerValue.year, "DD-MM-YYYY");
    datepickerValueAsMomentDate.utcOffset(0).set({hour:0,minute:0,second:0,millisecond:0});
    datepickerValueAsMomentDate.format();
    
    let momentDateAsIso = moment(datepickerValueAsMomentDate).unix();
    
    let dateAsMatlab : number;
    dateAsMatlab = this.unixEpochtoMatlabDate(momentDateAsIso);

    
    this.vesselObject.date = dateAsMatlab;
    this.newService.GetTransfersForVessel(this.vesselObject).subscribe(data => this.Repdata = data );
    this.vesselObject.dateNormal = this.MatlabDateToJSDateYMD(dateAsMatlab);
    this.newService.getRouteForBoat(this.vesselObject).subscribe(data => this.boatLocationData = data);

    this.ngOnInit();
  }
}
