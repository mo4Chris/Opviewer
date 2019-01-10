import { map } from 'rxjs/operators';
import { Injectable } from '@angular/core';
import { Http, Response, Headers } from '@angular/http';
import { environment } from '../environments/environment';

@Injectable()
export class CommonService {

    constructor(private http: Http) {  }

  saveVessel(vessel) {
    return this.post(environment.DB_IP + '/api/saveVessel/', vessel).pipe(
            map((response: Response) => response.json()));
  }

  saveTransfer(transfer) {
      return this.post(environment.DB_IP + '/api/saveTransfer/', transfer).pipe(
          map((response: Response) => response.json()));
  }

  GetVessel() {
    return this.get(environment.DB_IP + '/api/getVessel/').pipe(
            map((response: Response) => response.json()));
  }

  GetSov(mmsi, date) {
    return this.get(environment.DB_IP + '/api/getSov/' + mmsi + '/' + date).pipe(
      map((response: Response) => response.json()));
  }

  GetTransitsForSov(mmsi, date) {
    return this.get(environment.DB_IP + '/api/GetTransitsForSov/' + mmsi + '/' + date).pipe(
      map((response: Response) => response.json()));
  }

  GetVessel2vesselsForSov(mmsi, date) {
    return this.get(environment.DB_IP + '/api/GetVessel2vesselForSov/' + mmsi + '/' + date).pipe(
      map((response: Response) => response.json()));
  }

  GetStationaryPeriodsForSov(mmsi, date) {
    return this.get(environment.DB_IP + '/api/GetStationaryPeriodsForSov/' + mmsi + '/' + date).pipe(
      map((response: Response) => response.json()));
  }

  GetPlatformTransfers(mmsi, date) {
    return this.get(environment.DB_IP + '/api/getPlatformTransfers/' + mmsi + '/' + date).pipe(
      map((response: Response) => response.json()));
  }

  GetTurbineTransfers(mmsi, date) {
    return this.get(environment.DB_IP + '/api/getTurbineTransfers/' + mmsi + '/' + date).pipe(
      map((response: Response) => response.json()));
  }

  GetVesselsForCompany(client) {
    return this.post(environment.DB_IP + '/api/getVesselsForCompany/', client).pipe(
            map((response: Response) => response.json()));
  }

  GetScatter(test) {
    return this.post(environment.DB_IP + '/api/getScatter/', test).pipe(
            map((response: Response) => response.json()));
  }

  GetCompanies() {
    return this.get(environment.DB_IP + '/api/getCompanies/').pipe(
            map((response: Response) => response.json()));
  }

  GetDistinctFieldnames(transferdata) {
    return this.post(environment.DB_IP + '/api/getDistinctFieldnames/', transferdata).pipe(
            map((response: Response) => response.json()));
  }

  GetSovDistinctFieldnames(mmsi, date) {
    return this.get(environment.DB_IP + '/api/getSovDistinctFieldnames/' + mmsi + '/' + date).pipe(
            map((response: Response) => response.json()));
  }

  GetLatLon() {
    return this.get(environment.DB_IP + '/api/getLatLon/').pipe(
            map((response: Response) => response.json()));
  }

  GetLatestBoatLocation() {
    return this.get(environment.DB_IP + '/api/getLatestBoatLocation/').pipe(
            map((response: Response) => response.json()));
  }

  GetSpecificPark(park) {
    return this.post(environment.DB_IP + '/api/getSpecificPark/', park).pipe(
            map((response: Response) => response.json()));
  }

  GetLatestBoatLocationForCompany(company) {
    return this.post(environment.DB_IP + '/api/getLatestBoatLocationForCompany/', company).pipe(
            map((response: Response) => response.json()));
  }

  GetTransfersForVessel(mmsi, date) {
    return this.get(environment.DB_IP + '/api/getTransfersForVessel/' + mmsi + '/' + date).pipe(
            map((response: Response) => response.json()));
  }

  getTransfersForVesselByRange (vessel) {
    return this.post(environment.DB_IP + '/api/getTransfersForVesselByRange/', vessel).pipe(
            map((response: Response) => response.json()));
  }

  getRouteForBoat(vessel) {
    return this.post(environment.DB_IP + '/api/getRouteForBoat/', vessel).pipe(
            map((response: Response) => response.json()));
  }

  getCrewRouteForBoat(vessel) {
    return this.post(environment.DB_IP + '/api/getCrewRouteForBoat/', vessel).pipe(
            map((response: Response) => response.json()));
  }

  getDatesWithValues(vessel) {
    return this.post(environment.DB_IP + '/api/getDatesWithValues/', vessel).pipe(
            map((response: Response) => response.json()));
  }

  GetDatesShipHasSailedForSov(mmsi) {
    return this.get(environment.DB_IP + '/api/GetDatesShipHasSailedForSov/' + mmsi).pipe(
      map((response: Response) => response.json()));
  }

  getCommentsForVessel(vessel) {
    return this.post(environment.DB_IP + '/api/getCommentsForVessel/', vessel).pipe(
            map((response: Response) => response.json()));
  }

  getUsers() {
    return this.get(environment.DB_IP + '/api/getUsers/').pipe(
        map((response: Response) => response.json()));
  }

  getUsersForCompany(client) {
    return this.post(environment.DB_IP + '/api/getUsersForCompany/', client).pipe(
        map((response: Response) => response.json()));
  }

  getUserByUsername(username) {
    return this.post(environment.DB_IP + '/api/getUserByUsername/', username).pipe(
        map((response: Response) => response.json()));
  }

  saveUserBoats(user) {
    return this.post(environment.DB_IP + '/api/saveUserBoats/', user).pipe(
        map((response: Response) => response.json()));
  }

  sendFeedback(feedback) {
    return this.post(environment.DB_IP + '/api/sendFeedback/', feedback).pipe(
        map((response: Response) =>  response.json()));
  }

  get(url) {
    const headers = new Headers();
    this.createAuthorizationHeader(headers);
    return this.http.get(url, {
      headers: headers
    });
  }

  post(url, data) {
    const headers = new Headers();
    this.createAuthorizationHeader(headers);
    return this.http.post(url, data, {
      headers: headers
    });
  }

  createAuthorizationHeader(headers: Headers) {
    headers.append('authorization', localStorage.getItem('token'));
  }

  validatePermissionToViewData(vessel) {
    return this.post(environment.DB_IP + '/api/validatePermissionToViewData/', vessel).pipe(
        map((response: Response) => response.json()));
  }

  resetPassword(user) {
    return this.post(environment.DB_IP + '/api/resetPassword/', user).pipe(
        map((response: Response) => response.json()));
  }

  getVideoRequests(vessel) {
    return this.post(environment.DB_IP + '/api/getVideoRequests/', vessel).pipe(
        map((response: Response) => response.json()));
  }

  saveVideoRequest(transfer) {
    return this.post(environment.DB_IP + '/api/saveVideoRequest/', transfer).pipe(
        map((response: Response) => response.json()));
  }

  getVideoBudgetByMmsi(mmsi) {
    return this.post(environment.DB_IP + '/api/getVideoBudgetByMmsi/', mmsi).pipe(
        map((response: Response) => response.json()));
  }

  getGeneral(vessel) {
    return this.post(environment.DB_IP + '/api/getGeneral/', vessel).pipe(
        map((response: Response) => response.json()));
  }

}

