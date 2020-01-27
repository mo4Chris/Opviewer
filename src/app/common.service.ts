import { map } from 'rxjs/operators';
import { Injectable } from '@angular/core';
import { Http, Response, Headers } from '@angular/http';
import { environment } from '../environments/environment';
// tslint:disable-next-line:import-blacklist
import { Observable } from 'rxjs';
// import { WavedataModel, WaveSourceModel } from './models/wavedataModel';
import { AisMarkerModel } from './layout/dashboard/dashboard.component';
import { isArray } from 'util';
import { VesselModel } from './models/vesselModel';
import { VesselObjectModel } from './supportModules/mocked.common.service';
import { UserModel } from './models/userModel';
import { CampaignModel } from './layout/TWA/models/campaignModel';
import { Vessel2vesselModel } from './layout/reports/dpr/sov/models/Transfers/vessel2vessel/Vessel2vessel';

@Injectable({
  providedIn: 'root',
})
export class CommonService {

  constructor(private http: Http) { }

  get(url: string) {
    const headers = new Headers();
    this.createAuthorizationHeader(headers);
    return this.http.get(environment.DB_IP + url, {
      headers: headers
    });
  }

  post(url: string, data: any) {
    const headers = new Headers();
    this.createAuthorizationHeader(headers);
    return this.http.post(environment.DB_IP + url, data, {
      headers: headers
    });
  }

  createAuthorizationHeader(headers: Headers) {
    headers.append('authorization', localStorage.getItem('token'));
  }

  validatePermissionToViewData(vessel: { mmsi: number}) {
    return this.post('/api/validatePermissionToViewData/', vessel).pipe(
      map((response: Response) => response.json()));
  }

  getActiveConnections(): Observable<string> {
    return this.get('/api/getActiveConnections/').pipe(
      map((response: Response) => response.json()));
  }

  saveVessel(vessel) {
    return this.post('/api/saveVessel/', vessel).pipe(
      map((response: Response) => response.json()));
  }

  saveTransfer(transfer) {
    return this.post('/api/saveTransfer/', transfer).pipe(
      map((response: Response) => response.json()));
  }

  getVessel(): Observable<VesselModel[]> {
    return this.get('/api/getVessel/').pipe(
      map((response: Response) => response.json()));
  }

  getSov(vessel: VesselObjectModel) {
    return this.get('/api/getSov/' + vessel.mmsi + '/' + vessel.date).pipe(
      map((response: Response) => response.json()));
  }

  getTransitsForSov(mmsi: number, date: number) {
    return this.get('/api/getTransitsForSov/' + mmsi + '/' + date).pipe(
      map((response: Response) => response.json()));
  }

  getLatestGeneral(): Observable<{_id: number, date: number, vesselname: string}[]> {
    // For both CTV and SOV!
    return this.get('/api/getLatestGeneral/').pipe(
      map((response: Response) => response.json()));
  }

  getLatestGeneralForCompany(opts: {client: string, vesselname?: string}) {
    // For both CTV and SOV!
  }

  getLatestTwaUpdate(): Observable<number> {
    return this.get('/api/getLatestTwaUpdate/').pipe(
      map((response: Response) => {
        const res = response.json();
        return res.lastUpdate;
      }));
  }

  getVessel2vesselsForSov(mmsi: number, date: number): Observable<Vessel2vesselModel[]> {
    return this.get('/api/getVessel2vesselForSov/' + mmsi + '/' + date).pipe(
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
    return this.get('/api/getCycleTimesForSov/' + mmsi + '/' + date).pipe(
      map((response: Response) => response.json()));
  }

  getPlatformTransfers(mmsi: number, date: number) {
    return this.get('/api/getPlatformTransfers/' + mmsi + '/' + date).pipe(
      map((response: Response) => response.json()));
  }

  getTurbineTransfers(mmsi: number, date: number) {
    return this.get('/api/getTurbineTransfers/' + mmsi + '/' + date).pipe(
      map((response: Response) => response.json()));
  }

  getVesselsForCompany(client: { client: string, notHired?: number}[]) {
    return this.post('/api/getVesselsForCompany/', client).pipe(
      map((response: Response) => response.json()));
  }

  getCompanies() {
    return this.get('/api/getCompanies/').pipe(
      map((response: Response) => response.json()));
  }

  getHarbourLocations() {
    return this.get('/api/getHarbourLocations/').pipe(
      map((response: Response) => response.json()));
  }

  checkUserActive(username: string) {
    return this.get('/api/checkUserActive/' + username).pipe(
      map((response: Response) => response.json()));
  }

  getDistinctFieldnames(transferdata: {mmsi: number, date: number}) {
    return this.post('/api/getDistinctFieldnames/', transferdata).pipe(
      map((response: Response) => response.json()));
  }

  getSovDistinctFieldnames(vesselObject: VesselObjectModel) {
    return this.get('/api/getSovDistinctFieldnames/' + vesselObject.mmsi + '/' + vesselObject.date).pipe(
      map((response: Response) => response.json()));
  }

  getLatestBoatLocation(): Observable<AisMarkerModel[]> {
    return this.get('/api/getLatestBoatLocation/').pipe(
      map((response: Response) => response.json()));
  }

  getSpecificPark(park: {park: string[]}) {
    return this.post('/api/getSpecificPark/', park).pipe(
      map((response: Response) => response.json()));
  }

  getParkByNiceName(park: string): Observable<{
    centroid: {lon: number, lat: number, radius: number},
    SiteName: string,
    name: string[]
  } | undefined> {
    return this.get('/api/getParkByNiceName/' + park).pipe(
      map((response: Response) => response.json()[0]));
  }

  getParkLocations() {
    return this.get('/api/getParkLocations').pipe(
      map((response: Response) => response.json()));
  }

  getParkLocationForCompany(company: string) {
    company = company.replace(' ', '--_--');
    return this.get('/api/getParkLocationForCompany/' + company).pipe(
      map((response: Response) => response.json()));
  }

  getPlatformLocations(src_name: string) {
    // ToDo: replace hardcoded platforms filename with dynamic links when more than 1 source becomes available
    return this.post('/api/getPlatformLocations/', {Name: 'Northsea_offshore_oilgas_platform_coordinates'}).pipe(
      map((response: Response) => response.json()));
  }

  getLatestBoatLocationForCompany(company: string): Observable<AisMarkerModel[]> {
    return this.get('/api/getLatestBoatLocationForCompany/' + company).pipe(
      map((response: Response) => response.json()));
  }

  getTransfersForVessel(mmsi: number, date: number) {
    return this.get('/api/getTransfersForVessel/' + mmsi + '/' + date).pipe(
      map((response: Response) => response.json()));
  }

  getTransfersForVesselByRange(vessel: StatsRangeRequest) {
    return this.post('/api/getTransfersForVesselByRange/', vessel).pipe(
      map((response: Response) => response.json()));
  }

  getTransitsForVesselByRange(vessel: StatsRangeRequest) {
    return this.post('/api/getTransitsForVesselByRange/', vessel).pipe(
      map((response: Response) => response.json()));
  }

  getTurbineTransfersForVesselByRangeForSOV(vessel: StatsRangeRequest) {
    return this.post('/api/getTurbineTransfersForVesselByRangeForSOV/', vessel).pipe(
      map((response: Response) => response.json()));
  }

  getPlatformTransfersForVesselByRangeForSOV(vessel: StatsRangeRequest) {
    return this.post('/api/getPlatformTransfersForVesselByRangeForSOV/', vessel).pipe(
      map((response: Response) => response.json()));
  }

  getTransitsForVesselByRangeForSOV(vessel: StatsRangeRequest) {
    return this.post('/api/getTransitsForVesselByRangeForSOV/', vessel).pipe(
      map((response: Response) => response.json()));
  }

  getVessel2vesselsByRangeForSov(vessel: StatsRangeRequest) {
    return this.post('/api/getVessel2vesselsByRangeForSov/', vessel).pipe(
      map((response: Response) => response.json()));
  }

  getPortcallsByRange(vessel: StatsRangeRequest) {
    return this.post('/api/getPortcallsByRange/', vessel).pipe(
      map((response: Response) => response.json()));
  }

  getDatesWithValues(vessel: VesselObjectModel) {
    return this.post('/api/getDatesWithValues/', vessel).pipe(
     map((response: Response) => response.json()));
  }

  getDatesWithValuesFromGeneralStats(vessel: VesselObjectModel) {
    return this.post('/api/getHasSailedDatesCTV/', vessel).pipe(
       map((response: Response) => response.json()));
  }

  getDatesShipHasSailedForSov(vessel: VesselObjectModel) {
    return this.get('/api/getDatesShipHasSailedForSov/' + vessel.mmsi).pipe(
      map((response: Response) => response.json()));
  }

  getDatesWithTransfersForSOV(vessel: VesselObjectModel) {
    return this.get('/api/getDatesWithTransferForSov/' + vessel.mmsi).pipe(
      map((response: Response) => response.json()));
  }

  getCommentsForVessel(vessel: VesselObjectModel) {
    return this.post('/api/getCommentsForVessel/', vessel).pipe(
      map((response: Response) => response.json()));
  }

  getUsers(): Observable<UserModel[]> {
    return this.get('/api/getUsers/').pipe(
      map((response: Response) => response.json()));
  }

  getUsersForCompany(client: {client: any}[]): Observable<UserModel[]> {
    return this.post('/api/getUsersForCompany/', client).pipe(
      map((response: Response) => response.json()));
  }

  getUserByUsername(username: Object): Observable<UserModel> {
    return this.post('/api/getUserByUsername/', username).pipe(
      map((response: Response) => response.json()));
  }

  getUserClientById(user: any, client: any): Observable<{_id: string, client: string}> {
    return this.get('/api/getUserClientById/' + user + '/' + client).pipe(
      map((response: Response) => response.json()));
  }

  saveUserBoats(user) {
    return this.post('/api/saveUserBoats/', user).pipe(
      map((response: Response) => response.json()));
  }

  saveFuelStatsSovDpr(sovfuelstats) {
    return this.post('/api/saveFuelStatsSovDpr/', sovfuelstats).pipe(
      map((response: Response) => response.json()));
  }

  saveIncidentDpr(sovincidentstats) {
    return this.post('/api/saveIncidentDpr/', sovincidentstats).pipe(
      map((response: Response) => response.json()));
  }

  updateSOVTurbinePaxInput(transfer) {
    return this.post('/api/updateSOVTurbinePaxInput/', transfer).pipe(
      map((response: Response) => response.json()));
  }

  updateSOVPlatformPaxInput(transfer) {
    return this.post('/api/updateSOVPlatformPaxInput/', transfer).pipe(
      map((response: Response) => response.json()));
  }

  updateSOVv2vPaxInput(transfer) {
    return this.post('/api/updateSOVv2vPaxInput/', transfer).pipe(
      map((response: Response) => response.json()));
  }

  saveNonAvailabilityDpr(sovnonavailabilitystats) {
    return this.post('/api/saveNonAvailabilityDpr/', sovnonavailabilitystats).pipe(
      map((response: Response) => response.json()));
  }

  saveWeatherDowntimeDpr(weatherdowntime) {
    return this.post('/api/saveWeatherDowntimeDpr/', weatherdowntime).pipe(
      map((response: Response) => response.json()));
  }

  saveStandByDpr(weatherdowntime) {
    return this.post('/api/saveStandByDpr/', weatherdowntime).pipe(
      map((response: Response) => response.json()));
  }

  saveCateringStats(sovcateringstats) {
    return this.post('/api/saveCateringStats/', sovcateringstats).pipe(
      map((response: Response) => response.json()));
  }

  saveDPStats(dpstats) {
    return this.post('/api/saveDPStats/', dpstats).pipe(
      map((response: Response) => response.json()));
  }

  saveMissedPaxCargo(missedpaxcargo) {
    return this.post('/api/saveMissedPaxCargo/', missedpaxcargo).pipe(
      map((response: Response) => response.json()));
  }

  saveHelicopterPaxCargo(helicopterpaxcargo) {
    return this.post('/api/saveHelicopterPaxCargo/', helicopterpaxcargo).pipe(
      map((response: Response) => response.json()));
  }

  savePoBStats(sovpobstats) {
    return this.post('/api/savePoBStats/', sovpobstats).pipe(
      map((response: Response) => response.json()));
  }

  saveRemarksStats(sovremarks) {
    return this.post('/api/saveRemarksStats/', sovremarks).pipe(
      map((response: Response) => response.json()));
  }

  sendFeedback(feedback: {message: string, page: string, person: any}) {
    return this.post('/api/sendFeedback/', feedback).pipe(
      map((response: Response) => response.json()));
  }

  getSovDprInput(vessel: VesselObjectModel) {
    return this.post('/api/getSovDprInput/', vessel).pipe(
      map((response: Response) => response.json()));
  }

  getSovHseDprInput(vessel: VesselObjectModel) {
    return this.post('/api/getSovHseDprInput/', vessel).pipe(
      map((response: Response) => response.json()));
  }

  updateSOVHseDpr(dataObject) {
    return this.post('/api/updateSOVHseDpr/', dataObject).pipe(
      map((response: Response) => response.json()));
  }

  updateDprFieldsSOVHseDpr(dataObject) {
    return this.post('/api/updateDprFieldsSOVHseDpr/', dataObject).pipe(
      map((response: Response) => response.json()));
  }

  resetPassword(user) {
    return this.post('/api/resetPassword/', user).pipe(
      map((response: Response) => response.json()));
  }

  setActive(user) {
    return this.post('/api/setActive/', user).pipe(
      map((response: Response) => response.json()));
  }

  setInactive(user) {
    return this.post('/api/setInactive/', user).pipe(
      map((response: Response) => response.json()));
  }

  getVideoRequests(vessel: VesselObjectModel) {
    return this.post('/api/getVideoRequests/', vessel).pipe(
      map((response: Response) => response.json()));
  }

  saveVideoRequest(transfer) {
    return this.post('/api/saveVideoRequest/', transfer).pipe(
      map((response: Response) => response.json()));
  }

  getVideoBudgetByMmsi(vessel: VesselObjectModel) {
    return this.post('/api/getVideoBudgetByMmsi/', {mmsi: vessel.mmsi}).pipe(
      map((response: Response) => response.json()));
  }

  getGeneral(vessel: VesselObjectModel) {
    return this.post('/api/getGeneral/', vessel).pipe(
      map((response: Response) => response.json()));
  }

  getTurbineWarranty() {
    return this.get('/api/getTurbineWarranty/').pipe(
      map((response: Response) => response.json()));
  }

  getTurbineWarrantyForCompany(client: {client: string}): Observable<CampaignModel[]> {
    return this.post('/api/getTurbineWarrantyForCompany/', client).pipe(
      map((response: Response) => response.json()));
  }

  getTurbineWarrantyOne(warrenty) {
    return this.post('/api/getTurbineWarrantyOne/', warrenty).pipe(
      map((response: Response) => response.json()));
  }

  setSaildays(warrenty) {
    return this.post('/api/setSaildays/', warrenty).pipe(
      map((response: Response) => response.json()));
  }

  saveCTVGeneralStats(generalStats: Object) {
    return this.post('/api/saveCTVGeneralStats/', generalStats).pipe(
      map((response: Response) => response.json()));
  }

  addVesselToFleet(vessel) {
    return this.post('/api/addVesselToFleet/', vessel).pipe(
      map((response: Response) => response.json()));
  }

  getActiveListingsForFleet(fleetID: string, client: string, stopDate: number) {
    return this.get('/api/getActiveListingsForFleet/' + fleetID + '/' + client + '/' + stopDate).pipe(
      map((response: Response) => response.json()));
  }

  getAllActiveListingsForFleet(fleetID: string) {
    return this.get('/api/getAllActiveListingsForFleet/' + fleetID).pipe(
      map((response: Response) => response.json()));
  }

  setActiveListings(_listings: {listings: any, client: string, fleetID: string, stopDate: number}) {
    return this.post('/api/setActiveListings/', _listings).pipe(
      map((response: Response) => response.json()));
  }

  getVesselsToAddToFleet(fleet) {
    return this.post('/api/getVesselsToAddToFleet/', fleet).pipe(
      map((response: Response) => response.json()));
  }

  get2faExistence(user: {userEmail: any}) {
    return this.post('/api/get2faExistence', user).pipe(
      map((response: Response) => response.json()));
  }

  getSovWaveSpectrumAvailable(vessel: {date:  number, mmsi: number}) {
    return this.post('/api/getSovWaveSpectrumAvailable', vessel).pipe(
      map((response: Response) => response.json()));
  }
  getSovWaveSpectrum(vessel: {date:  number, mmsi: number}) {
    return this.post('/api/getSovWaveSpectrum', vessel).pipe(
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
    return this.post('/api/saveFleetRequest', request).pipe(
      map((response: Response) => response.json()));
  }

  getWavedataForDay(request: {
    date: number,
    site: string,
  }): Observable<any> {// Observable<WavedataModel> {
    return this.post('/api/getWavedataForDay', request).pipe(
      map((response: Response) => {
        if (response.status === 204) {
          return null;
        } else {
          return response.json(); // new WavedataModel(response.json());
        }
      }));
  }

  getWavedataForRange(request: {
    startDate: number,
    stopDate: number,
    source: string,
  }): Observable<any> {// Observable<WavedataModel[]> {
    return this.post('/api/getWavedataForRange', request).pipe(
      map((response: Response) => {
        return response.json(); // .map( wavedata => new WavedataModel(wavedata));
      }));
  }

  getGeneralForRange(request: {
    startDate: number,
    stopDate: number,
    mmsi: number | number[],
    vesselType: 'CTV' | 'SOV' | 'OSV',
    projection?: any,
  }): Observable<any[]> {
    return this.post('/api/getGeneralForRange', request).pipe(
      map((response: Response) => response.json()));
  }

  getFieldsWithWaveSourcesByCompany(): Observable<{_id: string, site: string, name: string}[]> {
    return this.get('/api/getFieldsWithWaveSourcesByCompany').pipe(
    map((response: Response) => response.json()));
  }

  saveUserSettings(settings: object): void {
    this.post('/api/saveUserSettings/', settings).subscribe();
  }

  loadUserSettings(): Observable<object> {
    return this.get('/api/loadUserSettings').pipe(
      map((response: Response) => response.json().settings));
  }

}

export interface StatsRangeRequest {
  mmsi: number[];
  dateMin: number;
  dateMax: number;
  reqFields: string[];
}

