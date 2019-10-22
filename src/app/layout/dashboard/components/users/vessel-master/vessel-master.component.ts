import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { CommonService } from '../../../../../common.service';
import { TokenModel } from '../../../../../models/tokenModel';
import { VesselModel } from '../../../../../models/vesselModel';

@Component({
  selector: 'app-vessel-master',
  templateUrl: './vessel-master.component.html',
  styleUrls: ['./vessel-master.component.scss']
})
export class VesselMasterComponent implements OnInit {

  @Input() tokenInfo: TokenModel;
  @Output() locationData: EventEmitter<any[]> = new EventEmitter<any[]>();
  @Output() zoominfo: EventEmitter<any> = new EventEmitter<any>();

  constructor(private newService: CommonService) { }

  vesselInfo: VesselModel;
  defaultZoomInfo = {
    latitude: 55,
    longitude: 0,
    zoomlvl: 6.0
  };

  ngOnInit() {
    setTimeout(() => {
      this.setZoomLevel();
    });
  }

  getLocations() {
    this.newService.getLatestBoatLocationForCompany(this.tokenInfo.userCompany).subscribe( boatLocationData => {
      this.locationData.emit(boatLocationData);
    });
  }

  setZoomLevel() {
    this.newService.getVesselsForCompany([{
      client: this.tokenInfo.userCompany
    }]).subscribe(vessels => {
      this.vesselInfo = vessels[0]; // Vessel master only gets 1 vessel
      if (typeof(this.vesselInfo.Site) === 'string') {
        this.newService.getParkByNiceName(this.vesselInfo.Site).subscribe(park => {
          this.zoominfo.emit({
            latitude: park.centroid.lat,
            longitude: park.centroid.lon,
            zoomlvl: 8.5,
          });
        });
      } else {
        this.zoominfo.emit(this.defaultZoomInfo);
      }
    });
  }
}
