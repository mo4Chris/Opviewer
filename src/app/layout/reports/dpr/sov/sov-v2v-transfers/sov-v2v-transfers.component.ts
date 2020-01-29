import { Component, OnInit, Input, OnChanges, Output, EventEmitter, ChangeDetectionStrategy } from '@angular/core';
import { SettingsService } from '@app/supportModules/settings.service';
import { DatetimeService } from '@app/supportModules/datetime.service';
import { CalculationService } from '@app/supportModules/calculation.service';
import { Vessel2VesselActivity, TurbineLocsFromMongo } from '../models/vessel2vesselActivity';
import { MapZoomLayer } from '@app/models/mapZoomLayer';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { Vessel2vesselModel } from '../models/Transfers/vessel2vessel/Vessel2vessel';
import { TurbineLocation } from '../../models/TurbineLocation';
import { CommonService } from '@app/common.service';
import { AlertService } from '@app/supportModules/alert.service';
import { map, catchError } from 'rxjs/operators';

@Component({
  selector: 'app-sov-v2v-transfers',
  templateUrl: './sov-v2v-transfers.component.html',
  styleUrls: ['./sov-v2v-transfers.component.scss', '../sovreport.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class SovV2vTransfersComponent implements OnChanges {
  @Input() readonly = true;
  @Input() vessel2vessels: Vessel2vesselModel[];
  @Input() sovInfo;
  @Input() turbineLocations: TurbineLocsFromMongo[];

  @Input() vesselObject;
  @Output() v2vPaxTotals = new EventEmitter<V2vPaxTotalModel>();


  vessel2vesselActivityRoute: Vessel2VesselActivity;
  private v2v_data_layer: MapZoomLayer;

  v2vCargoIn = 0;
  v2vCargoOut = 0;
  v2vPaxIn = 0;
  v2vPaxOut = 0;

  constructor(
    public settings: SettingsService,
    private datetimeService: DatetimeService,
    private calculationService: CalculationService,
    private modalService: NgbModal,
    private commonService: CommonService,
    private alert: AlertService,
  ) { }

  ngOnChanges() {
    this.updatev2vPaxCargoTotal();
  }


  GetMatlabDateToJSTime(serial) {
      return this.datetimeService.MatlabDateToJSTime(serial);
  }

  getMatlabDateToCustomJSTime(serial, format) {
      return this.datetimeService.MatlabDateToCustomJSTime(serial, format);
  }

  GetDecimalValueForNumber(value, endpoint = null) {
      return this.calculationService.GetDecimalValueForNumber(value, endpoint);
  }

  GetMatlabDurationToMinutes(serial) {
    return this.datetimeService.MatlabDurationToMinutes(serial);
  }


  openVesselMap(content, vesselname: string, toMMSI: number) {
    const routemap = document.getElementById('routeMap');
    const v2vHandler = new Vessel2VesselActivity({
      v2vs: this.vessel2vessels,
      htmlMap: routemap,
      vessel: vesselname,
      mmsi: toMMSI,
      turbineLocations: this.turbineLocations
    });
    this.modalService.open(content, { ariaLabelledBy: 'modal-basic-title' });
    this.vessel2vesselActivityRoute = v2vHandler;
  }

  build_v2v_map(googleMap) {
    if (this.v2v_data_layer === undefined) {
      this.v2v_data_layer = new MapZoomLayer(googleMap, 1);
    } else {
      this.v2v_data_layer.reset();
      this.v2v_data_layer.setMap(googleMap);
    }
    // Set up for turbines locations view on map
    this.vessel2vesselActivityRoute.addVesselRouteToMapZoomLayer(this.v2v_data_layer);
    this.vessel2vesselActivityRoute.addTurbinesToMapZoomLayer(this.v2v_data_layer);
    this.v2v_data_layer.draw();
  }

  // Input components (pax and cargo)
  updatev2vPaxCargoTotal() {
    this.v2vCargoIn = 0;
    this.v2vCargoOut = 0;
    this.v2vPaxIn = 0;
    this.v2vPaxOut = 0;
    if (this.vessel2vessels.length > 0) {
      for (let i = 0; i < this.vessel2vessels[0].transfers.length; i++) {
        this.v2vPaxIn = this.v2vPaxIn + +this.vessel2vessels[0].transfers[i].paxIn || this.v2vPaxIn + 0;
        this.v2vPaxOut = this.v2vPaxOut + +this.vessel2vessels[0].transfers[i].paxOut || this.v2vPaxOut + 0;
        this.v2vCargoIn = this.v2vCargoIn + +this.vessel2vessels[0].transfers[i].cargoIn || this.v2vCargoIn + 0;
        this.v2vCargoOut = this.v2vCargoOut + +this.vessel2vessels[0].transfers[i].cargoOut || this.v2vCargoOut + 0;
      }
    }
    this.v2vPaxTotals.emit({
      paxIn: this.v2vPaxIn,
      paxOut: this.v2vPaxOut,
      cargoIn: this.v2vCargoIn,
      cargoOut: this.v2vCargoOut,
    });
  }
  savev2vPaxInput() {
    for (let _i = 0; _i < this.vessel2vessels[0].transfers.length; _i++) {
      this.vessel2vessels[0].transfers[_i].paxIn = this.vessel2vessels[0].transfers[_i].paxIn || 0;
      this.vessel2vessels[0].transfers[_i].paxOut = this.vessel2vessels[0].transfers[_i].paxOut || 0;
      this.vessel2vessels[0].transfers[_i].cargoIn = this.vessel2vessels[0].transfers[_i].cargoIn || 0;
      this.vessel2vessels[0].transfers[_i].cargoOut = this.vessel2vessels[0].transfers[_i].cargoOut || 0;
    }

    this.commonService.updateSOVv2vPaxInput({
      mmsi: this.vesselObject.mmsi,
      date: this.vesselObject.date,
      transfers: this.vessel2vessels[0].transfers
    }).pipe(
      map(
        (res) => {
          this.alert.sendAlert({
            type: 'success',
            text: res.data,
          });
        }
      ),
      catchError(error => {
        this.alert.sendAlert({
          type: 'danger',
          text: error,
        });
        throw error;
      })
    ).subscribe();
    // ToDo: signal other
  }
}

export interface V2vPaxTotalModel {
  cargoIn: number;
  cargoOut: number;
  paxIn: number;
  paxOut: number;
}
