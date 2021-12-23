import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-portal-sidebar-item',
  templateUrl: './portal-sidebar-item.component.html',
  styleUrls: ['./portal-sidebar-item.component.scss', '../portal-sidebar/portal-sidebar.component.scss']
})
export class PortalSidebarItemComponent {

  @Input() destination: string;
  @Input() icon = 'fa-circle';
  @Input() label: string;
  @Input() disableRouter = false;
}
