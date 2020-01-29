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

  userCreate = false; // Create new users
  userRead = false;   // View users at company
  userManage = false; // Manage vessels, reset password (de-)activate users
}




@Injectable({
    providedIn: 'root'
})
export class PermissionService extends PermissionModel {
  constructor (
    private userService: UserService
  ) {
    super();
    const token = TokenModel.load(this.userService);
    this.hasCampaigns = token.hasCampaigns;

    // We construct this class based on the permissions associated with your account type
    let permission: PermissionModel;
    switch (token.userPermission) {
      case 'admin':
        // Alternatively, I could just loop through all the properties and set them to true
        permission = new AdminPermission();
        break;
      case 'Logistics specialist':
        permission = new LogisticSpecialist();
        break;
      case 'Vessel master':
        permission = new VesselMaster();
        break;
        case 'Marine controller':
          permission = new MarineController();
          break;
        case 'QHSE specialist':
          permission = new HseSpecialist();
          break;
        case 'Client representative':
          permission = new ClientRepresentative();
          break;
      default:
        // If unknown user type, only basic access is provided
        permission = <any> {};
    }

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

  userRead = true;
  userCreate = true;
  userManage = true;
}

class VesselMaster extends PermissionModel {
  sovCommercialWrite = true;
}


class LogisticSpecialist extends PermissionModel {
  sovHseRead = true;
  sovWaveSpectrum = true;
  longterm = true;

  ctvVideoRequest = true;

  userRead: true;
  userCreate: true;
}

class MarineController extends PermissionModel {
  sovHseRead = true;
  sovHseWrite = true;
  sovCommercialWrite = true;
}

class HseSpecialist extends PermissionModel {
  sovCommercialRead = true;
  sovHseSign = true;
  sovHseRead = true;
  sovHseWrite = false;
}

class ClientRepresentative extends PermissionModel {
  sovCommercialRead = true;
}
