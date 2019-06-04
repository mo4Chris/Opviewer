import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { CommonService } from '../../../../../common.service';

@Component({
  selector: 'app-vessel-master',
  templateUrl: './vessel-master.component.html',
  styleUrls: ['./vessel-master.component.scss']
})
export class VesselMasterComponent implements OnInit {

  @Input() tokenInfo;
  @Output() locationData: EventEmitter<any[]> = new EventEmitter<any[]>();
  @Output() zoominfo: EventEmitter<any> = new EventEmitter<any>();
  
  constructor(private newService: CommonService) { }

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
    const zoominfo = {
      latitude: 55,
      longitude: 0,
      zoomlvl: 6.0
    }
    this.zoominfo.emit(zoominfo)
  }
}
