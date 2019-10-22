import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { CommonService } from '../../../../../common.service';
import { TokenModel } from '../../../../../models/tokenModel';
import { VesselModel } from '../../../../../models/vesselModel';
import { DatetimeService } from '../../../../../supportModules/datetime.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-vessel-master',
  templateUrl: './vessel-master.component.html',
  styleUrls: ['./vessel-master.component.scss']
})
export class VesselMasterComponent implements OnInit {

  @Input() tokenInfo: TokenModel;
  @Output() locationData: EventEmitter<any[]> = new EventEmitter<any[]>();
  @Output() zoominfo: EventEmitter<any> = new EventEmitter<any>();

  constructor(
    private newService: CommonService,
    private dateService: DatetimeService,
    private _router: Router,
    ) { }

  vesselInfo: VesselModel;
  defaultZoomInfo = {
    latitude: 55,
    longitude: 0,
    zoomlvl: 6.0
  };
  matlabDate = this.dateService.getMatlabDateYesterday() + 1;
  unassignedTransfers: UnassignedTransferModel[] = [];

  ngOnInit() {
    setTimeout(() => {
      this.newService.getVesselsForCompany([{
        client: this.tokenInfo.userCompany
      }]).subscribe(vessels => {
        this.vesselInfo = vessels[0]; // Vessel master only gets 1 vessel
        this.setZoomLevel();
        this.getUnassignedTransfers();
      });
    });
}

  getLocations() {
    this.newService.getLatestBoatLocationForCompany(this.tokenInfo.userCompany).subscribe( boatLocationData => {
      this.locationData.emit(boatLocationData);
    });
  }

  setZoomLevel() {
    if (typeof(this.vesselInfo.Site) === 'string') {
      this.newService.getParkByNiceName(this.vesselInfo.Site).subscribe(park => {
        if (park) {
          this.zoominfo.emit({
            latitude: park.centroid.lat,
            longitude: park.centroid.lon,
            zoomlvl: 8.5,
          });
        } else {
          this.zoominfo.emit(this.defaultZoomInfo);
        }
      });
    } else {
      this.zoominfo.emit(this.defaultZoomInfo);
    }
  }

  getUnassignedTransfers() {
    const lookback = 14;
    const unassigned: UnassignedTransferModel[] = [];
    if (this.vesselInfo.operationsClass === 'CTV') {
      this.newService.getTransfersForVesselByRange({
        mmsi: [this.tokenInfo.userBoats[0].mmsi],
        dateMin: this.matlabDate - lookback,
        dateMax: this.matlabDate,
        reqFields: ['comment', 'location']
      }).subscribe(_transfers => {
        _transfers.forEach((transfers: {
          _id: number; // mmsi
          comment: string[];
          location: string[];
          label: string[];
          date: number[];
        }) => {
          transfers.comment.forEach((comment: string, _i) => {
            if (comment === 'Unassigned') {
              unassigned.push({
                mmsi: transfers._id,
                turbine: transfers.location[_i],
                vessel: transfers.label[_i],
                date: transfers.date[_i],
                datestr: this.dateService.MatlabDateToJSDateYMD(transfers.date[_i]),
              });
            }
          });
        });
      });
    }
    this.unassignedTransfers = unassigned;
  }

  routeToDprFromTransfer(transfer: UnassignedTransferModel) {
    this._router.navigate(['vesselreport', {
      boatmmsi: transfer.mmsi,
      date: Math.floor(transfer.date),
    }]);
  }

}

interface UnassignedTransferModel {
  mmsi: number;
  vessel: string;
  turbine: string;
  date: number;
  datestr: string;
}
