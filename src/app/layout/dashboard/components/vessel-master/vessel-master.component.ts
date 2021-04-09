import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { CommonService } from '@app/common.service';
import { TokenModel } from '@app/models/tokenModel';
import { VesselModel } from '@app/models/vesselModel';
import { DatetimeService } from '@app/supportModules/datetime.service';
import { RouterService } from '@app/supportModules/router.service';

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
    private routerService: RouterService
    ) { }

  vesselInfo: VesselModel;
  defaultZoomInfo = {
    latitude: 55,
    longitude: 0.1,
    zoomlvl: 5.5
  };
  matlabDate = this.dateService.getMatlabDateYesterday() + 1;
  unassignedTransfers: UnassignedTransferModel[] = [];
  unassignedTransferLookback = 14;

  ngOnInit() {
    setTimeout(() => {
      this.newService.getVessel().subscribe(vessels => {
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
    const unassigned: UnassignedTransferModel[] = [];
    if (this.vesselInfo.operationsClass === 'CTV') {
      this.newService.getTransfersForVesselByRange({
        mmsi: [this.tokenInfo.userBoats[0].mmsi],
        dateMin: this.matlabDate - this.unassignedTransferLookback,
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
                datestr: this.dateService.matlabDatenumToYmdString(transfers.date[_i]),
              });
            }
          });
        });
      });
    }
    this.unassignedTransfers = unassigned;
  }

  routeToDprFromTransfer(transfer: UnassignedTransferModel) {
    this.routerService.routeToDPR({
      mmsi: transfer.mmsi,
      date: Math.floor(transfer.date),
    });
  }

  routeToLastDPR() {
    this.routerService.routeToDPR({mmsi: this.vesselInfo.mmsi});
  }

}

export interface UnassignedTransferModel {
  mmsi: number;
  vessel: string;
  turbine: string;
  date: number;
  datestr: string;
}
