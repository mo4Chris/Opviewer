import { Component, OnInit } from '@angular/core';
import { AlertService } from '@app/supportModules/alert.service';

@Component({
  selector: 'app-alert',
  templateUrl: './alert.component.html',
  styleUrls: ['./alert.component.scss']
})
export class AlertComponent implements OnInit {
  // This class is responsible for the html such that alerts are always shown and are in the same place
  constructor(
    public alert: AlertService
  ) { }

  ngOnInit() {
  }

}
