
import {map} from 'rxjs/operators';
import { Injectable } from '@angular/core';
import { Http, Response, Headers, RequestOptions } from '@angular/http';

@Injectable()
export class CommonService {

    constructor(private http: Http) {  }
    headers = new Headers()
    
  loginUser(user) {
      let res = this.http.post('http://localhost:8080/api/login/', user).pipe(
          map((response: Response) => response.json()));
      return res;
  }

  registerUser(user) {
    return this.http.post('http://localhost:8080/api/registerUser/', user).pipe(
            map((response: Response) => response.json()));
  }

  saveVessel(vessel) {
    return this.http.post('http://localhost:8080/api/SaveVessel/', vessel).pipe(
            map((response: Response) => response.json()));
  }

  saveTransfer(transfer) {
      return this.http.post('http://localhost:8080/api/saveTransfer/', transfer).pipe(
          map((response: Response) => response.json()));
  }

  GetVessel() {
    return this.http.get('http://localhost:8080/api/getVessel/').pipe(
            map((response: Response) => response.json()));
  }

  GetVesselsForCompany(client) {
      this.headers.append('authorization', localStorage.getItem('token'));
      return this.http.post('http://localhost:8080/api/getVesselsForCompany/', client, { headers: this.headers }).pipe(
            map((response: Response) => response.json()));
  }

  GetScatter(test) {
    return this.http.post('http://localhost:8080/api/getScatter/', test).pipe(
            map((response: Response) => response.json()));
  }

  GetCompanies() {
    return this.http.get('http://localhost:8080/api/getCompanies/').pipe(
            map((response: Response) => response.json()));
  }

  GetDistinctFieldnames(transferdata) {
    return this.http.post('http://localhost:8080/api/getDistinctFieldnames/', transferdata).pipe(
            map((response: Response) => response.json()));
  }

  GetLatLon() {
    return this.http.get('http://localhost:8080/api/getLatLon/').pipe(
            map((response: Response) => response.json()));
  }

   GetLatestBoatLocation() {
    return this.http.get('http://localhost:8080/api/getLatestBoatLocation/').pipe(
            map((response: Response) => response.json()));
  }

  GetSpecificPark(park) {
    return this.http.post('http://localhost:8080/api/GetSpecificPark/', park).pipe(
            map((response: Response) => response.json()));
  }

    GetLatestBoatLocationForCompany(company) {
        this.headers.append('authorization', localStorage.getItem('token'));
        return this.http.post('http://localhost:8080/api/getLatestBoatLocationForCompany/', company, { headers: this.headers }).pipe(
            map((response: Response) => response.json()));
  }

  GetTransfersForVessel (vessel) {
    return this.http.post('http://localhost:8080/api/GetTransfersForVessel/', vessel).pipe(
            map((response: Response) => response.json()));
  }

  getTransfersForVesselByRange (vessel) {
    return this.http.post('http://localhost:8080/api/getTransfersForVesselByRange/', vessel).pipe(
            map((response: Response) => response.json()));
  }

  getRouteForBoat(vessel) {
    return this.http.post('http://localhost:8080/api/getRouteForBoat/', vessel).pipe(
            map((response: Response) => response.json()));
  }

  getCrewRouteForBoat(vessel) {
    return this.http.post('http://localhost:8080/api/getCrewRouteForBoat/', vessel).pipe(
            map((response: Response) => response.json()));
  }

  getDatesWithValues(vessel) {
    return this.http.post('http://localhost:8080/api/getDatesWithValues/', vessel).pipe(
            map((response: Response) => response.json()));
  }

  getCommentsForVessel(vessel) {
    return this.http.post('http://localhost:8080/api/getCommentsForVessel/', vessel).pipe(
            map((response: Response) => response.json()));
  }

  getUsers() {
    return this.http.get('http://localhost:8080/api/getUsers/').pipe(
        map((response: Response) => response.json()));
  }

  getUsersForCompany(client) {
    return this.http.post('http://localhost:8080/api/getUsersForCompany/', client).pipe(
        map((response: Response) => response.json()));
  }

  getUserByUsername(username) {
    return this.http.post('http://localhost:8080/api/getUserByUsername/', username).pipe(
        map((response: Response) => response.json()));
  }

  saveUserBoats(user) {
    return this.http.post('http://localhost:8080/api/saveUserBoats/', user).pipe(
        map((response: Response) => response.json()));
  } 
}

