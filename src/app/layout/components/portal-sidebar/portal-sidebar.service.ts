import { Injectable } from '@angular/core';
import { PermissionModel } from '@app/shared/permissions/permission.service';

export const FEEDBACK_MODAL = '#feedback';
const NO_PERMISSIONS_REQUIRED = ['default'];

@Injectable({
  providedIn: 'root'
})
export class PortalSidebarService {

  // -- Properties --

  private _defaultContent: SidebarItemIconModel[] = [
    {
      type: sidebarContentType.Top,
      label: 'Dashboard',
      icon: 'fa-home',
      destination: '/dashboard',
      requiredPermissionsOr: NO_PERMISSIONS_REQUIRED
    },
    {
      type: sidebarContentType.Top,
      label: 'Analytics',
      icon: 'fa-line-chart',
      destination: '/reports',
      requiredPermissionsOr: ['dprRead', 'longterm']
    },
    {
      type: sidebarContentType.Top,
      label: 'Forecast',
      icon: 'fa-history',
      destination: '/forecast',
      requiredPermissionsOr: ['forecastRead']
    },
    {
      type: sidebarContentType.Top,
      label: 'Users',
      icon: 'fa-users',
      destination: '/users',
      requiredPermissionsOr: ['userManage']
    },
    {
      type: sidebarContentType.Top,
      label: 'Create new user',
      icon: 'fa-user-plus',
      destination: '/signup',
      requiredPermissionsOr: ['userManage']
    },
    {
      type: sidebarContentType.Top,
      label: 'Client overview',
      icon: 'fa-building',
      destination: '/clients',
      requiredPermissionsOr: ['admin']
    },
    {
      type: sidebarContentType.Feedback,
      label: 'Give feedback',
      icon: 'fa-comment',
      destination: FEEDBACK_MODAL,
      requiredPermissionsOr: NO_PERMISSIONS_REQUIRED
    },
    {
      type: sidebarContentType.Bottom,
      label: 'Settings',
      icon: 'fa-cog',
      destination: '/user-settings',
      requiredPermissionsOr: NO_PERMISSIONS_REQUIRED
    },
    {
      type: sidebarContentType.Bottom,
      label: 'Log out',
      icon: 'fa-power-off',
      destination: '/login',
      requiredPermissionsOr: NO_PERMISSIONS_REQUIRED
    }
  ];

  // --- Public methods ---

  constructor() { }

  public getContentWithPermission(permission: PermissionModel, content: SidebarItemIconModel[] = this._defaultContent) {
    return content.filter(item => {
      return item.requiredPermissionsOr.some((itemRequiredPermission) => {
        return permission[itemRequiredPermission] || itemRequiredPermission === 'default';
      });
    });
  }
}

// --- Types ---

export enum sidebarContentType {
  Top = 'TOP',
  Feedback = 'FEEDBACK',
  Bottom = 'BOTTOM',
}

interface SidebarItemIconModel {
  type: sidebarContentType;
  label: string;
  icon: string;
  destination: string;
  requiredPermissionsOr;
}
