import { Injectable } from '@angular/core';
import * as jwt_decode from 'jwt-decode';
import * as moment from 'moment';
import { Router } from '@angular/router';
import { TokenModel } from '../../models/tokenModel';

@Injectable({
    providedIn: 'root'
})
export class UserService {

  constructor(
    public router: Router
  ) { }

  getDecodedAccessToken(token: string): TokenModel {
    const decoded = jwt_decode(token);
    if (decoded.expires) {
      const expires = moment.utc(decoded.expires);
      if (moment().valueOf() > expires.valueOf()) {
        localStorage.removeItem('token');
        this.router.navigate(['/login']);
      }
    }
    try {
      return jwt_decode(token);
    } catch (Error) {
      return null;
    }
  }
}
