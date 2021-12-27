import { Component, Input, OnInit } from '@angular/core';

@Component({
  selector: 'app-portal-logo',
  templateUrl: './portal-logo.component.html',
  styleUrls: ['./portal-logo.component.scss']
})
export class PortalLogoComponent implements OnInit {

  @Input() public sidebarIsExpanded = false;

  constructor() { }

  ngOnInit(): void {
  }

}
