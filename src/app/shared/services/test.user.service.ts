import { Injectable } from '@angular/core';
import { TokenModel, UserPermissions } from '../../models/tokenModel';
import { UserService } from './user.service';
import { UserType } from '../enums/UserType';

@Injectable({
  providedIn: 'root'
})
export class UserTestService extends UserService {

  constructor(
  ) {
    super(null);
  }

  static getMockedAccessToken(config: UserTokenOptions = {}): TokenModel {
    const defaults: TokenModel = {
      userID: 'testyMcTest',
      userBoats: [{
        mmsi: 123456789,
        nicename: 'Test_BMO'
      }],
      client_id: 1,
      userCompany: 'BMO',
      userPermission: 'admin',
      username: 'tester',
      hasCampaigns: true,
      expires: 1234,
      iat: 1234,
      permission: {
        admin: true,
        demo: false,
        dpr: null,
        twa: null,
        user_see_all_vessels_client: true,
        longterm: null,
        forecast: {
          read: true,
          changeLimits: true,
          createProject: false,
        },
        user_read: true,
        user_manage: true,
        user_type: 'admin',
      }
    };
    return {...defaults, ...config};
  }

  getDecodedAccessToken( token: string ) {
    return UserTestService.getMockedAccessToken();
  }

  logout() {
    throw new Error('Logout triggered')
  }
}

export const MockedUserServiceProvider = {
  provide: UserService,
  useClass: UserTestService,
};


interface UserTokenOptions {
  userPermission?: UserType;
  userCompany?: string,
  hasCampaigns?: boolean;
  userBoats?: {mmsi: number, nicename: string}[];
  permission?: UserPermissions,
}

