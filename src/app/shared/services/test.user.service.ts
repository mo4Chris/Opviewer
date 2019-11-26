import { Injectable } from '@angular/core';
import * as jwt_decode from 'jwt-decode';
import * as moment from 'moment';
import { Router } from '@angular/router';
import { TokenModel, UserType } from '../../models/tokenModel';

@Injectable({
    providedIn: 'root'
})
export class UserTestService {

    constructor(
    ) { }

    static getMockedAccessToken(config: UserTokenOptions = {}): TokenModel {
        const defaults: TokenModel = {
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

// type UserType = 'admin' | 'Vessel master' | 'Marine controller' | 'Logistics specialist';

interface UserTokenOptions {
    userPermission?: UserType;
    hasCampaigns?: boolean;
    userBoats?: {mmsi: number, nicename: string}[];
}

