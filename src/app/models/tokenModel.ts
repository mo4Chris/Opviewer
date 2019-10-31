import { UserService } from '../shared/services/user.service';

export class TokenModel {
    userID: string;
    userPermission: string;
    userCompany: string;
    userBoats: string[];
    username: string;

    hasCampaigns: boolean;

    constructor (userService: UserService) {
        return userService.getDecodedAccessToken(localStorage.getItem('token'));
    }
}
