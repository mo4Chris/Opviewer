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
  
  constructor(private newService: CommonService) { }

  ngOnInit() {

  }

  GetLocations() {
    this.newService.GetLatestBoatLocationForCompany(this.tokenInfo.userCompany).subscribe( boatLocationData => {
      this.locationData.emit(boatLocationData);
    });
  }
}
