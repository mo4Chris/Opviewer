import { Injectable } from '@angular/core';
import * as jwt_decode from 'jwt-decode';
import * as moment from 'moment';
import { Router } from '@angular/router';
import { TokenModel } from '../../models/tokenModel';

@Injectable({
    providedIn: 'root'
})
export class UserTestService {

    constructor(
    ) { }

    static getMockedAccessToken(config: UserTokenOptions = {}): UserModel {
        const defaults: UserModel = {
            userID: 'testyMcTest',
            userBoats: [{
                mmsi: 123456789,
                nicename: 'Test_BMO'
            }],
            userCompany: 'BMO',
            userPermission: 'admin',
            username: 'tester',
            hasCampaigns: true,
            expires: 1234,
            iat: 1234
        };
        return {...defaults, ...config};
    }
}

type UserType = 'admin' | 'Vessel master' | 'Marine controller' | 'Logistics specialist';

interface UserTokenOptions {
    userPermission?: UserType;
    hasCampaigns?: boolean;
    userBoats?: {mmsi: number, nicename: string}[];
}

interface UserModel {
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
}
