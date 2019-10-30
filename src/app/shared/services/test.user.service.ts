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

    static getMockedAccessToken(config?: UserTokenOptions): any {
        if (!config) {
            config = {};
        }
        return {
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
    }
}

interface UserTokenOptions {
    userPermission?: 'admin' | 'Vessel master' | 'Marine controller' | 'Logistics specialist';
    hasCampaigns?: boolean;
    userBoats?: {mmsi: number, nicename: string}[];
}
