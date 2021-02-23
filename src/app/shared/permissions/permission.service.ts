import { Injectable } from '@angular/core';
import { TokenModel } from '@app/models/tokenModel';
import { UserService } from '../services/user.service';

abstract class PermissionModel {
  admin = false;

  hasCampaigns = undefined; // True iff organization has campaigns

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
    let token: TokenModel;
    try {
      token = TokenModel.load(this.userService);
      this.hasCampaigns = token.hasCampaigns;
    } catch (error) {
      console.error('Failed to retrieve permission from token!');
      throw error;
    }

    // We construct this class based on the permissions associated with your account type
    const permission = PermissionService.getDefaultPermission(token.userPermission);

    // Copy all the permission properties to this class
    Object.keys(permission).forEach(key => {
      if (this[key] !== undefined) {

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
      default:
        // If unknown user type, only basic access is provided
        return <any> {};
    }
  }
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

class MarineController extends PermissionModel {
  sovCommercialWrite = true;
  sovDprInputWrite = true;
  sovDprInputSign = true;
  sovHseWrite = true;
  longterm = true;

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
