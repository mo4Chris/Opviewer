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
  
  constructor(private newService: CommonService) { }

  ngOnInit() {

  }

  GetLocations() {
    this.newService.getLatestBoatLocationForCompany(this.tokenInfo.userCompany).subscribe( boatLocationData => {
      this.locationData.emit(boatLocationData);
    });
  }
}
