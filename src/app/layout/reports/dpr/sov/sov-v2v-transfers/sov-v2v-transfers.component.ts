import { Component, OnInit, Input } from '@angular/core';
import { SettingsService } from '@app/supportModules/settings.service';
import { DatetimeService } from '@app/supportModules/datetime.service';
import { CalculationService } from '@app/supportModules/calculation.service';
import { Vessel2VesselActivity, TurbineLocsFromMongo } from '../models/vessel2vesselActivity';
import { MapZoomLayer } from '@app/models/mapZoomLayer';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { Vessel2vesselModel } from '../models/Transfers/vessel2vessel/Vessel2vessel';
import { TurbineLocation } from '../../models/TurbineLocation';

@Component({
  selector: 'app-sov-v2v-transfers',
  templateUrl: './sov-v2v-transfers.component.html',
  styleUrls: ['./sov-v2v-transfers.component.scss', '../sovreport.component.scss']
})
export class SovV2vTransfersComponent implements OnInit {
  @Input() tokenInfo;
  @Input() vessel2vessels: Vessel2vesselModel[];
  @Input() sovInfo;
  @Input() turbineLocations: TurbineLocsFromMongo[];


  vessel2vesselActivityRoute: Vessel2VesselActivity;
  private v2v_data_layer: MapZoomLayer;

  constructor(
    private settings: SettingsService,
    private datetimeService: DatetimeService,
    private calculationService: CalculationService,
    private modalService: NgbModal,
  ) { }

  ngOnInit() {
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
}
