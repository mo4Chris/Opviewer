import { Injectable } from '@angular/core';
import * as jwt_decode from 'jwt-decode';
import * as moment from 'moment-timezone';
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
    console.log('DECODING ACCESS TOKEN')
    const decoded: TokenModel = jwt_decode(token);
    if (typeof decoded.expires != 'number') return null;
    if (moment().valueOf() > decoded.expires) {
      localStorage.removeItem('token');
      this.router.navigate(['/login']);
      return null;
    }
    return decoded;
  }
}
