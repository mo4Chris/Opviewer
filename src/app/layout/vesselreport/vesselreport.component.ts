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

  constructor(private newService: CommonService) { }
  zoomlvl = 8;
  latitude;
  longitude;
  mapTypeId = "roadmap"
  streetViewControl = false;

  MatlabDateToJSDate(serial) {
    var dateInt = moment((serial - 719529) * 864e5).format("DD-MM-YYYY");
    return dateInt;
    
    //var dateIntTest = new Date(Date.UTC(2018,1,20,0,0,0)).valueOf();
    //var dateIntReverse = ( dateIntTest / 864e5) + 719529;
  }

  MatlabDateToJSTime(serial) {
    var time_info  = moment((serial - 719529) * 864e5 ).format("HH:mm:ss");

    return time_info;
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
tokenInfo = this.getDecodedAccessToken(localStorage.getItem('token'));

  GetTransfersForVessel() {
    return this.newService
    .GetTransfersForVessel("test")
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
    this.GetTransfersForVessel().subscribe(_ => {;
      this.newService.GetSpecificPark("test").subscribe(data => {this.Locdata = data.geometry.coordinates, this.latitude = data.geometry.coordinates[0][1], this.longitude = data.geometry.coordinates[0][0]} );
      setTimeout(10000);
    });
  }

  edit = function (kk) {
    this.id = kk.mmsi;
    this.name = kk.name;
    this.address = kk.address;
    this.valbutton = "Update";
}

}
