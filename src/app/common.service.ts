import { map, takeUntil, takeLast } from 'rxjs/operators';
import { Injectable } from '@angular/core';
import { Http, Response, Headers } from '@angular/http';
import { environment } from '../environments/environment';
import { Observable, observable, timer } from 'rxjs';
import { WavedataModel, WaveSourceModel } from './models/wavedataModel';
import { isArray } from 'util';
import { VesselModel } from './models/vesselModel';
import { VesselObjectModel } from './supportModules/mocked.common.service';

@Injectable()
export class CommonService {

  constructor(private http: Http) { }

  get(url: string) {
    const headers = new Headers();
    this.createAuthorizationHeader(headers);
    return this.http.get(url, {
      headers: headers
    });
  }

  post(url: string, data: any) {
    const headers = new Headers();
    this.createAuthorizationHeader(headers);
    return this.http.post(url, data, {
      headers: headers
    });
  }

  createAuthorizationHeader(headers: Headers) {
    headers.append('authorization', localStorage.getItem('token'));
  }

  validatePermissionToViewData(vessel: { mmsi: number}) {
    return this.post(environment.DB_IP + '/api/validatePermissionToViewData/', vessel).pipe(
      map((response: Response) => response.json()));
  }

  saveVessel(vessel) {
    return this.post(environment.DB_IP + '/api/saveVessel/', vessel).pipe(
      map((response: Response) => response.json()));
  }

  saveTransfer(transfer) {
    return this.post(environment.DB_IP + '/api/saveTransfer/', transfer).pipe(
      map((response: Response) => response.json()));
  }

  getVessel(): Observable<VesselModel[]> {
    return this.get(environment.DB_IP + '/api/getVessel/').pipe(
      map((response: Response) => response.json()));
  }

  getSov(vessel: VesselObjectModel) {
    return this.get(environment.DB_IP + '/api/getSov/' + vessel.mmsi + '/' + vessel.date).pipe(
      map((response: Response) => response.json()));
  }

  getTransitsForSov(mmsi: number, date: number) {
    return this.get(environment.DB_IP + '/api/getTransitsForSov/' + mmsi + '/' + date).pipe(
      map((response: Response) => response.json()));
  }

  getVessel2vesselsForSov(mmsi: number, date: number) {
    return this.get(environment.DB_IP + '/api/getVessel2vesselForSov/' + mmsi + '/' + date).pipe(
      map((response: Response) => {
        const v2vs = response.json();
        v2vs.forEach(v2v => {
          if (!isArray(v2v.transfers)) {
            v2v.transfers = [v2v.transfers];
          }
          if (!isArray(v2v.CTVactivity)) {
            v2v.CTVactivity = [v2v.CTVactivity];
          }
        });
        return v2vs;
      }));
  }

  getCycleTimesForSov(mmsi: number, date: number) {
    return this.get(environment.DB_IP + '/api/getCycleTimesForSov/' + mmsi + '/' + date).pipe(
      map((response: Response) => response.json()));
  }

  getPlatformTransfers(mmsi: number, date: number) {
    return this.get(environment.DB_IP + '/api/getPlatformTransfers/' + mmsi + '/' + date).pipe(
      map((response: Response) => response.json()));
  }

  getTurbineTransfers(mmsi: number, date: number) {
    return this.get(environment.DB_IP + '/api/getTurbineTransfers/' + mmsi + '/' + date).pipe(
      map((response: Response) => response.json()));
  }

  getVesselsForCompany(client: { client: string, notHired?: number}[]) {
    return this.post(environment.DB_IP + '/api/getVesselsForCompany/', client).pipe(
      map((response: Response) => response.json()));
  }

  getCompanies() {
    return this.get(environment.DB_IP + '/api/getCompanies/').pipe(
      map((response: Response) => response.json()));
  }

  getHarbourLocations() {
    return this.get(environment.DB_IP + '/api/getHarbourLocations/').pipe(
      map((response: Response) => response.json()));
  }

  checkUserActive(username: string) {
    return this.get(environment.DB_IP + '/api/checkUserActive/' + username).pipe(
      map((response: Response) => response.json()));
  }

  getDistinctFieldnames(transferdata: {mmsi: number, date: number}) {
    return this.post(environment.DB_IP + '/api/getDistinctFieldnames/', transferdata).pipe(
      map((response: Response) => response.json()));
  }

  getSovDistinctFieldnames(mmsi: number, date: number): Observable<string[]> {
    return this.get(environment.DB_IP + '/api/getSovDistinctFieldnames/' + mmsi + '/' + date).pipe(
      map((response: Response) => response.json()));
  }

  getLatestBoatLocation() {
    return this.get(environment.DB_IP + '/api/getLatestBoatLocation/').pipe(
      map((response: Response) => response.json()));
  }

  getSpecificPark(park: {park: string[]}) {
    return this.post(environment.DB_IP + '/api/getSpecificPark/', park).pipe(
      map((response: Response) => response.json()));
  }

  getParkLocations() {
    return this.get(environment.DB_IP + '/api/getParkLocations').pipe(
      map((response: Response) => response.json()));
  }

  getParkLocationForCompany(company: string) {
    company = company.replace(' ', '--_--');
    return this.get(environment.DB_IP + '/api/getParkLocationForCompany/' + company).pipe(
      map((response: Response) => response.json()));
  }

  getPlatformLocations(src_name: string) {
    // ToDo: replace hardcoded platforms filename with dynamic links when more than 1 source becomes available
    return this.post(environment.DB_IP + '/api/getPlatformLocations/', {Name: 'Northsea_offshore_oilgas_platform_coordinates'}).pipe(
      map((response: Response) => response.json()));
  }

  getLatestBoatLocationForCompany(company: string) {
    return this.get(environment.DB_IP + '/api/getLatestBoatLocationForCompany/' + company).pipe(
      map((response: Response) => response.json()));
  }

  getTransfersForVessel(mmsi: number, date: number) {
    return this.get(environment.DB_IP + '/api/getTransfersForVessel/' + mmsi + '/' + date).pipe(
      map((response: Response) => response.json()));
  }

  getTransfersForVesselByRange(vessel: StatsRangeRequest) {
    return this.post(environment.DB_IP + '/api/getTransfersForVesselByRange/', vessel).pipe(
      map((response: Response) => response.json()));
  }

  getTransitsForVesselByRange(vessel: StatsRangeRequest) {
    return this.post(environment.DB_IP + '/api/getTransitsForVesselByRange/', vessel).pipe(
      map((response: Response) => response.json()));
  }

  getTurbineTransfersForVesselByRangeForSOV(vessel: StatsRangeRequest) {
    return this.post(environment.DB_IP + '/api/getTurbineTransfersForVesselByRangeForSOV/', vessel).pipe(
      map((response: Response) => response.json()));
  }

  getPlatformTransfersForVesselByRangeForSOV(vessel: StatsRangeRequest) {
    return this.post(environment.DB_IP + '/api/getPlatformTransfersForVesselByRangeForSOV/', vessel).pipe(
      map((response: Response) => response.json()));
  }

  getTransitsForVesselByRangeForSOV(vessel: StatsRangeRequest) {
    return this.post(environment.DB_IP + '/api/getTransitsForVesselByRangeForSOV/', vessel).pipe(
      map((response: Response) => response.json()));
  }

  getCrewRouteForBoat(vessel: VesselObjectModel) {
    return this.post(environment.DB_IP + '/api/getCrewRouteForBoat/', vessel).pipe(
      map((response: Response) => response.json()));
  }

  getTransitsRouteForBoat(vessel: VesselObjectModel) {
    return this.post(environment.DB_IP + '/api/getTransitsRouteForBoat/', vessel).pipe(
      map((response: Response) => response.json()));
  }

  getDatesWithValues(vessel: VesselObjectModel) {
    return this.post(environment.DB_IP + '/api/getDatesWithValues/', vessel).pipe(
     map((response: Response) => response.json()));
  }

  getDatesWithValuesFromGeneralStats(vessel: VesselObjectModel) {
    return this.post(environment.DB_IP + '/api/getHasSailedDatesCTV/', vessel).pipe(
       map((response: Response) => response.json()));
  }

  getDatesShipHasSailedForSov(vessel: VesselObjectModel) {
    return this.get(environment.DB_IP + '/api/getDatesShipHasSailedForSov/' + vessel.mmsi).pipe(
      map((response: Response) => response.json()));
  }

  getDatesWithTransfersForSOV(vessel: VesselObjectModel) {
    return this.get(environment.DB_IP + '/api/getDatesWithTransferForSov/' + vessel.mmsi).pipe(
      map((response: Response) => response.json()));
  }

  getCommentsForVessel(vessel: VesselObjectModel) {
    return this.post(environment.DB_IP + '/api/getCommentsForVessel/', vessel).pipe(
      map((response: Response) => response.json()));
  }

  getUsers() {
    return this.get(environment.DB_IP + '/api/getUsers/').pipe(
      map((response: Response) => response.json()));
  }

  getUsersForCompany(client: any[]) {
    return this.post(environment.DB_IP + '/api/getUsersForCompany/', client).pipe(
      map((response: Response) => response.json()));
  }

  getUserByUsername(username: any) {
    return this.post(environment.DB_IP + '/api/getUserByUsername/', username).pipe(
      map((response: Response) => response.json()));
  }

  getUserClientById(user: any, client: any) {
    return this.get(environment.DB_IP + '/api/getUserClientById/' + user + '/' + client).pipe(
      map((response: Response) => response.json()));
  }

  saveUserBoats(user) {
    return this.post(environment.DB_IP + '/api/saveUserBoats/', user).pipe(
      map((response: Response) => response.json()));
  }

  saveFuelStatsSovDpr(sovfuelstats) {
    return this.post(environment.DB_IP + '/api/saveFuelStatsSovDpr/', sovfuelstats).pipe(
      map((response: Response) => response.json()));
  }

  saveIncidentDpr(sovincidentstats) {
    return this.post(environment.DB_IP + '/api/saveIncidentDpr/', sovincidentstats).pipe(
      map((response: Response) => response.json()));
  }

  updateSOVTurbinePaxInput(transfer) {
    return this.post(environment.DB_IP + '/api/updateSOVTurbinePaxInput/', transfer).pipe(
      map((response: Response) => response.json()));
  }

  updateSOVPlatformPaxInput(transfer) {
    return this.post(environment.DB_IP + '/api/updateSOVPlatformPaxInput/', transfer).pipe(
      map((response: Response) => response.json()));
  }

  updateSOVv2vPaxInput(transfer) {
    return this.post(environment.DB_IP + '/api/updateSOVv2vPaxInput/', transfer).pipe(
      map((response: Response) => response.json()));
  }

  saveNonAvailabilityDpr(sovnonavailabilitystats) {
    return this.post(environment.DB_IP + '/api/saveNonAvailabilityDpr/', sovnonavailabilitystats).pipe(
      map((response: Response) => response.json()));
  }

  saveWeatherDowntimeDpr(weatherdowntime) {
    return this.post(environment.DB_IP + '/api/saveWeatherDowntimeDpr/', weatherdowntime).pipe(
      map((response: Response) => response.json()));
  }

  saveCateringStats(sovcateringstats) {
    return this.post(environment.DB_IP + '/api/saveCateringStats/', sovcateringstats).pipe(
      map((response: Response) => response.json()));
  }

  saveDPStats(dpstats) {
    return this.post(environment.DB_IP + '/api/saveDPStats/', dpstats).pipe(
      map((response: Response) => response.json()));
  }

  saveMissedPaxCargo(missedpaxcargo) {
    return this.post(environment.DB_IP + '/api/saveMissedPaxCargo/', missedpaxcargo).pipe(
      map((response: Response) => response.json()));
  }

  saveHelicopterPaxCargo(helicopterpaxcargo) {
    return this.post(environment.DB_IP + '/api/saveHelicopterPaxCargo/', helicopterpaxcargo).pipe(
      map((response: Response) => response.json()));
  }

  savePoBStats(sovpobstats) {
    return this.post(environment.DB_IP + '/api/savePoBStats/', sovpobstats).pipe(
      map((response: Response) => response.json()));
  }

  saveRemarksStats(sovremarks) {
    return this.post(environment.DB_IP + '/api/saveRemarksStats/', sovremarks).pipe(
      map((response: Response) => response.json()));
  }

  sendFeedback(feedback: {message: string, page: string, person: any}) {
    return this.post(environment.DB_IP + '/api/sendFeedback/', feedback).pipe(
      map((response: Response) => response.json()));
  }

  getSovDprInput(vessel: VesselObjectModel) {
    return this.post(environment.DB_IP + '/api/getSovDprInput/', vessel).pipe(
      map((response: Response) => response.json()));
  }

  resetPassword(user) {
    return this.post(environment.DB_IP + '/api/resetPassword/', user).pipe(
      map((response: Response) => response.json()));
  }

  setActive(user) {
    return this.post(environment.DB_IP + '/api/setActive/', user).pipe(
      map((response: Response) => response.json()));
  }

  setInactive(user) {
    return this.post(environment.DB_IP + '/api/setInactive/', user).pipe(
      map((response: Response) => response.json()));
  }

  getVideoRequests(vessel: VesselObjectModel) {
    return this.post(environment.DB_IP + '/api/getVideoRequests/', vessel).pipe(
      map((response: Response) => response.json()));
  }

  saveVideoRequest(transfer) {
    return this.post(environment.DB_IP + '/api/saveVideoRequest/', transfer).pipe(
      map((response: Response) => response.json()));
  }

  getVideoBudgetByMmsi(vessel: VesselObjectModel) {
    return this.post(environment.DB_IP + '/api/getVideoBudgetByMmsi/', {mmsi: vessel.mmsi}).pipe(
      map((response: Response) => response.json()));
  }

  getGeneral(vessel: VesselObjectModel) {
    return this.post(environment.DB_IP + '/api/getGeneral/', vessel).pipe(
      map((response: Response) => response.json()));
  }

  getTurbineWarranty() {
    return this.get(environment.DB_IP + '/api/getTurbineWarranty/').pipe(
      map((response: Response) => response.json()));
  }

  getTurbineWarrantyForCompany(client: {client: string}) {
    return this.post(environment.DB_IP + '/api/getTurbineWarrantyForCompany/', client).pipe(
      map((response: Response) => response.json()));
  }

  getTurbineWarrantyOne(warrenty) {
    return this.post(environment.DB_IP + '/api/getTurbineWarrantyOne/', warrenty).pipe(
      map((response: Response) => response.json()));
  }

  setSaildays(warrenty) {
    return this.post(environment.DB_IP + '/api/setSaildays/', warrenty).pipe(
      map((response: Response) => response.json()));
  }

  saveCTVGeneralStats(generalStats: Object) {
    return this.post(environment.DB_IP + '/api/saveCTVGeneralStats/', generalStats).pipe(
      map((response: Response) => response.json()));
  }

  addVesselToFleet(vessel) {
    return this.post(environment.DB_IP + '/api/addVesselToFleet/', vessel).pipe(
      map((response: Response) => response.json()));
  }

  getActiveListingsForFleet(fleetID: string, client: string, stopDate: number) {
    return this.get(environment.DB_IP + '/api/getActiveListingsForFleet/' + fleetID + '/' + client + '/' + stopDate).pipe(
      map((response: Response) => response.json()));
  }

  getAllActiveListingsForFleet(fleetID: string) {
    return this.get(environment.DB_IP + '/api/getAllActiveListingsForFleet/' + fleetID).pipe(
      map((response: Response) => response.json()));
  }

  setActiveListings(listings: {listings: any, client: string, fleetID: string, stopDate: number}) {
    return this.post(environment.DB_IP + '/api/setActiveListings/', listings).pipe(
      map((response: Response) => response.json()));
  }

  getVesselsToAddToFleet(fleet) {
    return this.post(environment.DB_IP + '/api/getVesselsToAddToFleet/', fleet).pipe(
      map((response: Response) => response.json()));
  }

  get2faExistence(user: {userEmail: any}): Observable <{secret2fa: string}> {
    return this.post(environment.DB_IP + '/api/get2faExistence', user).pipe(
      map((response: Response) => response.json()));
  }

  saveFleetRequest(request: {
    boats: any[],
    client: string,
    windfield: string,
    startDate: { year: null, month: null, day: null },
    stopDate: { year: null, month: null, day: null },
    numContractedVessels: number,
    campaignName: string,
    weatherDayTarget: null,
    weatherDayTargetType: string,
    jsTime: { startDate: number, stopDate: number },
    validFields: any[],
    limitHs: null,
    requestTime: null
}): Observable<any> {
    return this.post(environment.DB_IP + '/api/saveFleetRequest', request).pipe(
      map((response: Response) => response.json()));
  }

  getWavedataForDay(request: {
    date: number,
    site: string,
  }): Observable<WavedataModel> {
    return this.post(environment.DB_IP + '/api/getWavedataForDay', request).pipe(
      map((response: Response) => {
        if (response.status === 204) {
          return null;
        } else {
          return new WavedataModel(response.json());
        }
      }));
  }

  getWavedataForRange(request: {
    startDate: number,
    stopDate: number,
    source: string,
  }): Observable<WavedataModel[]> {
    return this.post(environment.DB_IP + '/api/getWavedataForRange', request).pipe(
      map((response: Response) => {
        return response.json().map( wavedata => new WavedataModel(wavedata));
      }));
  }

  getGeneralForRange(request: {
    startDate: number,
    stopDate: number,
    mmsi: number | number[],
    vesselType: 'CTV' | 'SOV' | 'OSV',
    projection?: any,
  }): Observable<any[]> {
    return this.post(environment.DB_IP + '/api/getGeneralForRange', request).pipe(
      map((response: Response) => response.json()));
  }

  getFieldsWithWaveSourcesByCompany(): Observable<{_id: string, site: string, name: string}[]> {
    return this.get(environment.DB_IP + '/api/getFieldsWithWaveSourcesByCompany').pipe(
    map((response: Response) => response.json()));
  }
}

interface StatsRangeRequest {
  mmsi: number[];
  dateMin: number;
  dateMax: number;
  reqFields: string[];
} 

