import { UserService } from '../shared/services/user.service';

export class TokenModel {
    // This model should probably be replaced by the tokenModel on merge
    userID: string;
    userBoats: {
        mmsi: number,
        nicename: string
    }[];
    userCompany: string;
    userPermission: UserType;
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

export type UserType = 'admin' | 'Vessel master' | 'Marine controller' | 'Logistics specialist';
