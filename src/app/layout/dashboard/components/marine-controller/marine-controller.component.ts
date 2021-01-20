import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { CommonService } from '@app/common.service';
import { TokenModel } from '@app/models/tokenModel';
import { VesselModel } from '@app/models/vesselModel';
import { CalculationService } from '@app/supportModules/calculation.service';
import { DatetimeService } from '@app/supportModules/datetime.service';
import { RouterService } from '@app/supportModules/router.service';
import { UnassignedTransferModel } from '../vessel-master/vessel-master.component';

@Component({
  selector: 'app-marine-controller',
  templateUrl: './marine-controller.component.html',
  styleUrls: ['./marine-controller.component.scss']
})
export class MarineControllerComponent implements OnInit {

  @Input() tokenInfo: TokenModel;
  @Output() locationData: EventEmitter<any[]> = new EventEmitter<any[]>();
  @Output() zoominfo: EventEmitter<any> = new EventEmitter<any[]>();

  constructor(
    private newService: CommonService,
    private dateService: DatetimeService,
    private routerService: RouterService,
    private calcService: CalculationService
  ) { }

  defaultZoomInfo = {
    latitude: 55,
    longitude: 0.1,
    zoomlvl: 5.5
  };
  matlabDate = this.dateService.getMatlabDateYesterday() + 1;
  unassignedTransfers: UnassignedTransferModel[] = [];
  vesselInfos: VesselModel[];

  ngOnInit() {
    setTimeout(() => {
      this.newService.getVesselsForCompany([{
        client: this.tokenInfo.userCompany
      }]).subscribe(vessels => {
        this.vesselInfos = vessels;
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
    const activeFields = [];
    const uniqueParkNames = this.vesselInfos.map(info => info.Site).filter((value, index, self) => {
      return typeof(value) === 'string' && self.indexOf(value) === index;
    });
    const isLoaded = [];
    const cb = () => {
      if (activeFields.length > 0) {
        // Do smart stuff
        const props = this.calcService.GetPropertiesForMap(400,
          activeFields.map(field => field.centroid.lat),
          activeFields.map( field => field.centroid.lon)
          );
          this.zoominfo.emit({
            zoomlvl: Math.min(props.zoomLevel, 8.5),
            latitude: props.avgLatitude,
            longitude: props.avgLongitude
          });
      } else {
        this.zoominfo.emit(this.defaultZoomInfo);
      }
    };

    if (uniqueParkNames.length > 0) {
      uniqueParkNames.forEach((parkname, _i) => {
        isLoaded.push(false);
        this.newService.getParkByNiceName(parkname).subscribe(park => {
          isLoaded[_i] = true;
          if (park) {
            activeFields.push(park);
          }
          if (isLoaded.reduce((prev, curr) => prev && curr, true)) {
            cb();
          }
        });
      });
    } else {
      cb();
    }
  }

  getUnassignedTransfers() {
    const min_lookback = 2; // MC gets no messages about yesterday
    const lookback = 14;
    this.vesselInfos.forEach( (vesselInfo, vidx) => {
      if (vesselInfo.operationsClass === 'CTV') {
        this.newService.getTransfersForVesselByRange({
          mmsi: [this.tokenInfo.userBoats[vidx].mmsi],
          dateMin: this.matlabDate - lookback,
          dateMax: this.matlabDate - min_lookback,
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
                this.unassignedTransfers.push({
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
    });
  }

  routeToDprFromTransfer(transfer: UnassignedTransferModel) {
    this.routerService.routeToDPR({
      mmsi: transfer.mmsi,
      date: Math.floor(transfer.date),
    });
  }

}
