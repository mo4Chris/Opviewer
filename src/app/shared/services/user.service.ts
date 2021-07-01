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
    if (token == null) return null;
    const decoded: TokenModel = jwt_decode(token);
    if (typeof decoded.expires != 'number') return null;
    if (moment().valueOf() > decoded.expires) {
      this.logout();
      return null;
    }
    return decoded;
  }

  logout() {
    localStorage.removeItem('token');
    localStorage.removeItem('isLoggedIn');
    localStorage.clear();
    this.router.navigate(['/login']);
    window.location.reload();
  }
}
