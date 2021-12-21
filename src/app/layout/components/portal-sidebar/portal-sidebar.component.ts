// Third party dependencies
import { OnInit, Component, ViewChild, ChangeDetectorRef, ViewEncapsulation } from '@angular/core';

// Services
import { PermissionService } from '@app/shared/permissions/permission.service';
import { PortalSidebarService } from './portal-sidebar.service';

// Types
import { sidebarContentType } from './portal-sidebar.service';

@Component({
  selector: 'app-portal-sidebar',
  templateUrl: './portal-sidebar.component.html',
  styleUrls: ['./portal-sidebar.component.scss'],
  encapsulation: ViewEncapsulation.None
})
export class PortalSidebarComponent implements OnInit {
  @ViewChild('fakeHeader') private _header;
  private _isExpanded = false;

  public sidebarContent = [];

  constructor(private _permissionService: PermissionService, private _portalSidebarService: PortalSidebarService) { }

  ngOnInit(): void {
    this.sidebarContent =
      this._portalSidebarService
        .getContentWithPermission(this._permissionService);
  }

  public handleClickFeedback() {
    console.log(this._header);
    // TODO: Feedback should be in a separate service... not in an unrelated component.
    // Using a dirty hack for now, until this is solved.
    this._header.openFeedbackModal(this._header.modal);
  }

  public handleClickItem() {
    this._isExpanded = false;
  }

  public toggleExpanded() {
    this._isExpanded = !this._isExpanded;
  }

  public get isExpanded() {
    return this._isExpanded;
  }

  public get sidebarContentType() {
    return sidebarContentType;
  }
}
