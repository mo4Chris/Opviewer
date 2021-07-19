import { Injectable } from '@angular/core';
import { TokenModel, UserPermissions } from '@app/models/tokenModel';
import { UserService } from '../services/user.service';

abstract class PermissionModel {
  admin = false;
  demo = false;

  hasCampaigns = undefined; // True if organization has campaigns
  dprRead = true;

  // Ctv dpr
  ctvVideoRequest = false;

  // Sov Dpr
  sovCommercialRead = true;
  sovCommercialWrite = false;
  sovCommercialSign = false;

  sovDprInputRead = true;
  sovDprInputWrite = false;
  sovDprInputSign = false;

  sovHseRead = false;
  sovHseWrite = false;
  sovHseSign = false;
  sovWaveSpectrum = false;

  longterm = false;
  sovSiemensMonthlyKpis = false;

  userCreate = false; // Create new users
  userRead = false;   // View users at company
  userManage = false; // Manage vessels, reset password (de-)activate users

  // Forecast
  forecastRead = false;
  forecastChangeLimits = false;
  forecastCreateProject = false;
}




@Injectable({
    providedIn: 'root'
})
export class PermissionService extends PermissionModel {
  constructor (
    private userService: UserService
  ) {
    super();
    this._init();
  }

  public reload() {
    this.admin = false;
    this.demo = false;
    this._init();
  }

  static getDefaultPermission(userPermission: string): PermissionModel {
    switch (userPermission) {
      case 'admin':
        // Alternatively, I could just loop through all the properties and set them to true
        return new AdminPermission();
      case 'Logistics specialist':
        return new LogisticSpecialist();
      case 'Vessel master':
        return new VesselMaster();
      case 'Marine controller':
        return new MarineController();
      case 'Qhse specialist':
        return new HseSpecialist();
      case 'Client representative':
        return new ClientRepresentative();
      case 'demo':
        return new DemoUser();
      default:
        // If unknown user type, only basic access is provided
        return <any> {};
    }
  }

  private _init() {
    let token: TokenModel;
    try {
      token = TokenModel.load(this.userService);
      this.hasCampaigns = token.hasCampaigns;
    } catch (error) {
      console.error('Failed to retrieve permission from token!');
      throw error;
    }

    // We construct this class based on the permissions associated with your account type
    const defaultPermission = PermissionService.getDefaultPermission(token.userPermission);
    const tokenPermission = token.permission;
    const permission = setPermissionFromToken(defaultPermission, tokenPermission);

    // Copy all the permission properties to this class
    Object.keys(permission).forEach(key => {
      if (this[key] != null) {
        this[key] = permission[key];
      }
    });

    // Basic logic to keep the world making sense
    this.sovCommercialRead = this.sovCommercialRead || this.sovCommercialSign || this.sovCommercialWrite;
    this.sovDprInputRead = this.sovDprInputRead || this.sovDprInputWrite || this.sovDprInputSign;
    this.sovHseRead = this.sovHseRead || this.sovHseWrite || this.sovHseSign;
    this.userRead = this.userRead || this.userManage || this.userCreate;

    // Any exceptions or special cases go here
    if (token.userCompany === 'Bibby Marine') {
      this.sovSiemensMonthlyKpis = true;
    }
  }
}

function setPermissionFromToken(base: PermissionModel, permission: UserPermissions) {
  if (permission?.longterm?.read != null) base.longterm = permission.longterm.read;

  if (permission?.forecast?.read != null) base.forecastRead = permission.forecast.read;
  if (permission?.forecast?.createProject != null) base.forecastCreateProject = permission?.forecast?.createProject;
  if (permission?.forecast?.changeLimits != null) base.forecastChangeLimits = permission?.forecast?.changeLimits;

  if (permission?.user_manage != null) base.userManage = permission?.user_manage;
  if (permission?.user_manage != null) base.userCreate = permission?.user_manage;

  return base;
}


class AdminPermission extends PermissionModel {
  admin = true;

  hasCampaigns = true;

  ctvVideoRequest = true;

  sovCommercialWrite = true;
  sovDprInputWrite = true;
  sovHseWrite = true;
  sovWaveSpectrum = true;

  longterm = true;
  sovSiemensMonthlyKpis = true;

  userRead = true;
  userCreate = true;
  userManage = true;

  forecastRead = true;
  forecastCreateProject = true;
  forecastChangeLimits = true;
}

class VesselMaster extends PermissionModel {
  sovCommercialWrite = true;
  sovDprInputWrite = true;
  sovDprInputSign = true;
  sovHseWrite = true;
}

class DemoUser extends PermissionModel {
  demo = true;
  dprRead = false;
  forecastChangeLimits = true;
}

class MarineController extends PermissionModel {
  longterm = true;
  userRead = true;

  sovWaveSpectrum = true;
}

class LogisticSpecialist extends PermissionModel {
  sovHseRead = true;
  sovCommercialRead = true;
  sovDprInputRead = true;
  sovWaveSpectrum = true;

  longterm = true;

  ctvVideoRequest = true;

  userRead = true;
  userCreate = true;
  userManage = true;
}

class HseSpecialist extends PermissionModel {
  sovCommercialRead = true;
  sovDprInputRead = true;

  sovHseSign = true;
  sovHseRead = true;
  sovHseWrite = false;
}

class ClientRepresentative extends PermissionModel {
  sovCommercialRead = true;
  sovDprInputRead = true;
  sovHseRead = false;
}
