import { UserService } from '../shared/services/user.service';

export class TokenModel {
    userID: string;
    userPermission: string;
    userCompany: string;
    userBoats: {mmsi: number, nicename: string}[];
    username: string;
    hasCampaigns: boolean;

    expires: number;
    iat: number;

    constructor (userService: UserService) {
        return userService.getDecodedAccessToken(localStorage.getItem('token'));
    }
}
