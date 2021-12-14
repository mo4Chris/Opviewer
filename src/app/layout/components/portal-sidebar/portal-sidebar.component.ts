import { AfterViewInit, Component, ViewChild, ChangeDetectorRef } from '@angular/core';
import { Router } from '@angular/router';
import { PermissionService } from '@app/shared/permissions/permission.service';

@Component({
  selector: 'app-portal-sidebar',
  templateUrl: './portal-sidebar.component.html',
  styleUrls: ['./portal-sidebar.component.scss']
})
export class PortalSidebarComponent implements AfterViewInit {

  @ViewChild('portalSidebar') private _elem;
  private _isMeasuring = true;
  private _isExpanded = true;
  private _injectedStyle = '--sidebar-expanded-width: 100%;';

  private _sidebarContent: SidebarContentModel = {
    sidebarGroups: [
      {
        type: sidebarContentType.Group,
        contents: [
          {
            type: sidebarContentType.Icon,
            label: 'Dashboard',
            icon: 'fa-home',
            destination: '/dashboard',
            requiredPermissionsOr: []
          },
          {
            type: sidebarContentType.Icon,
            label: 'Analytics',
            icon: 'fa-line-chart',
            destination: '/reports',
            requiredPermissionsOr: ['dprRead', 'longterm']
          },
          {
            type: sidebarContentType.Icon,
            label: 'Forecast',
            icon: 'fa-history',
            destination: '/forecast',
            requiredPermissionsOr: ['forecastRead']
          },
          {
            type: sidebarContentType.Icon,
            label: 'Campaigns',
            icon: 'fa-ship',
            destination: '/campaigns',
            requiredPermissionsOr: [false]
          },
          {
            type: sidebarContentType.Icon,
            label: 'Users',
            icon: 'fa-users',
            destination: '/users',
            requiredPermissionsOr: ['userManage']
          },
          {
            type: sidebarContentType.Icon,
            label: 'Create new user',
            icon: 'fa-user-plus',
            destination: '/signup',
            requiredPermissionsOr: ['userManage']
          },
          {
            type: sidebarContentType.Icon,
            label: 'Client overview',
            icon: 'fa-building',
            destination: '/clients',
            requiredPermissionsOr: ['admin']
          }
        ]
      },
      { type: sidebarContentType.Spacer },
      {
        type: sidebarContentType.Group,
        contents: [
          {
            type: sidebarContentType.Icon,
            label: 'Give feedback',
            icon: 'fa-comment',
            destination: '#feedback',
            requiredPermissionsOr: []
          },
          {
            type: sidebarContentType.Icon,
            label: 'Settings',
            icon: 'fa-cog',
            destination: '/user-settings',
            requiredPermissionsOr: []
          },
          {
            type: sidebarContentType.Icon,
            label: 'Log out',
            icon: 'fa-power-off',
            destination: '/login',
            requiredPermissionsOr: []
          }
        ]
      }
    ]
  };

  @ViewChild('dirtyHackHeader') private _header;

  constructor(private _cdRef: ChangeDetectorRef, private _router: Router, public permission: PermissionService) { }

  ngAfterViewInit(): void {
    this._updateExpandedWidth();
  }

  public checkPermission(requiredPermissionsOr) {
    const mappedPermissions = requiredPermissionsOr.map(required => this.permission[required]);
    if (mappedPermissions.includes(true) || mappedPermissions.length === 0) {
      return true;
    }
    return false;
  }

  public handleClickFeedback() {
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

  public get isMeasuring() {
    return this._isMeasuring;
  }

  public get isExpanded() {
    return this._isExpanded;
  }

  public get injectedStyle() {
    return this._injectedStyle;
  }

  public get sidebarGroups() {
    return this._sidebarContent.sidebarGroups;
  }

  public get sidebarContentType() {
    return sidebarContentType;
  }

  private _updateExpandedWidth() {
    this._isMeasuring = true;
    this._isExpanded = true;
    this._injectedStyle = '--sidebar-expanded-width: 100%;';
    this._cdRef.detectChanges();
    const width = this._elem.nativeElement.offsetWidth;
    this._injectedStyle = `--sidebar-expanded-width: calc(${width}px - var(--size-8));`;
    this._isExpanded = false;
    this._isMeasuring = false;
    this._cdRef.detectChanges();
  }
}

enum sidebarContentType {
  Spacer = 'SPACER',
  Icon = 'ICON',
  Group = 'GROUP'
}

interface SidebarItemSpacerModel {
  type: sidebarContentType.Spacer;
}

interface SidebarItemIconModel {
  type: sidebarContentType.Icon;
  label: string;
  icon: string;
  destination: string;
  requiredPermissionsOr;
}

interface SidebarItemGroupModel {
  type: sidebarContentType.Group;
  contents: SidebarItemIconModel[];
}

interface SidebarContentModel {
  sidebarGroups: (SidebarItemSpacerModel | SidebarItemGroupModel)[];
}
