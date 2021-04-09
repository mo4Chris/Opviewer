import { UserService } from '../shared/services/user.service';
import { UserType } from '@app/shared/enums/UserType';

export class TokenModel {
    // This model should probably be replaced by the tokenModel on merge
    userID: string;
    userBoats: {
        mmsi: number,
        nicename: string
    }[];
    client_id: number;
    userCompany: string;
    userPermission: UserType;
    permission: UserPermissions;
    username: string;
    hasCampaigns: boolean;
    expires: number;
    iat: number;

    // constructor (userService: UserService) {
    //     return userService.getDecodedAccessToken(localStorage.getItem('token'));
    // }
    static load(userService: UserService): TokenModel {
        return userService.getDecodedAccessToken(localStorage.getItem('token'));
    }
}

export interface UserPermissions {
    admin: boolean,
    user_read: boolean,
    user_manage: boolean,
    dpr: any,
    longterm: any,
    twa: any,
    forecast: any,
    user_type: UserType,
}

