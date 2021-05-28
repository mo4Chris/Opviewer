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

type DprInputType = 'read' | 'write' | 'sign';
export interface UserPermissions {
    admin: boolean,
    demo: boolean,
    user_read: boolean,
    user_manage: boolean,
    dpr: {read: boolean, sov_input: DprInputType, sov_commercial: DprInputType, sov_hse: DprInputType},
    longterm: {read: boolean},
    twa: {read: boolean},
    forecast: {read: boolean, changeLimits: boolean, createProject: boolean},
    user_type: UserType,
    user_see_all_vessels_client: boolean,
}

