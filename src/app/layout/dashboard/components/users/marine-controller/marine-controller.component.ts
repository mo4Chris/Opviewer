import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { CommonService } from '../../../../../common.service';

@Component({
  selector: 'app-marine-controller',
  templateUrl: './marine-controller.component.html',
  styleUrls: ['./marine-controller.component.scss']
})
export class MarineControllerComponent implements OnInit {

  @Input() tokenInfo;
  @Output() locationData: EventEmitter<any[]> = new EventEmitter<any[]>();
  @Output() zoominfo: EventEmitter<any> = new EventEmitter<any[]>();
  
  constructor(private newService: CommonService) { }

  ngOnInit() {
    setTimeout(() => {
      this.setZoomLevel();;
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
