import { Component, OnInit } from '@angular/core';
import { latLng, tileLayer } from 'leaflet';

import { CommonService } from '@app/common.service';
import * as L from "leaflet";
import { forkJoin } from 'rxjs/internal/observable/forkJoin';
import { OsmGenerateIconsService } from '../osm-generate-icons.service';
import { OsmAssignDataService } from '../osm-assign-data.service';

@Component({
  selector: 'app-osm-dashboard-map',
  templateUrl: './osm-dashboard-map.component.html',
  styleUrls: ['./osm-dashboard-map.component.scss']
})
export class OsmDashboardMapComponent implements OnInit {

  constructor(
    private osmIconService: OsmGenerateIconsService,
    private osmDataAssignService: OsmAssignDataService,
    private commonService: CommonService,
  ) { }

  vesselMarkerClusterList = L.markerClusterGroup();
  forecastMarkerClusterList = L.markerClusterGroup();
  harbourMarkerList;
  turbineMarkerList;
  turbineOutlineList;
  map;

  vesselMarkerClusterOptions = this.osmIconService.getMarkerClustererIcon('m1');
  forecastMarkerClusterOptions = this.osmIconService.getMarkerClustererIcon('m4');

  osmMapOptions = {
    layers: [
      this.getMapBaseLayer()
    ],
    zoom: 5.5,
    center: latLng(55, 0)
  };

  getMapBaseLayer() {
    return this.chooseCorrectStreetMap();
  }

  onMapReady(map: L.Map) {
    this.map = map;
  }

  controlLayers() {
    if (this.map.getZoom() > 6) {
      this.map.addLayer(this.harbourMarkerList);
    } else {
      this.map.removeLayer(this.harbourMarkerList);
    }

    if (this.map.getZoom() > 8) {
      this.map.addLayer(this.turbineOutlineList)
    } else {
      this.map.removeLayer(this.turbineOutlineList)
    }
  }


  ngOnInit(): void {
    forkJoin([
      this.osmDataAssignService.retrieveHarbourLocations(),
      this.osmDataAssignService.retrieveLatestVesselLocation(),
      this.osmDataAssignService.retrieveWindfarmLocations(),
      this.osmDataAssignService.retrieveForecastLocations(),
      this.osmDataAssignService.retrieveWindfarmOutline()
    ]).subscribe(([harbours, vessels, windfarms, forecasts, windfarmOutlines]) => {
      this.vesselMarkerClusterList = L.markerClusterGroup().addLayers(vessels),
        this.forecastMarkerClusterList = L.markerClusterGroup().addLayers(forecasts)

      this.harbourMarkerList = L.layerGroup(harbours)
      this.turbineMarkerList = windfarms;
      this.turbineOutlineList = L.layerGroup(windfarmOutlines);
    });
  }


  chooseCorrectStreetMap() {
    const isOnline = true;
    if (isOnline) {
      return this.getOnlineStreetMapTiles();
    } // ToDo: else {return this.getOfflineStreetMapTiles();}
  }

  chooseCorrectSeaMap() {
    const isOnline = true;
    if (isOnline) {
      return this.getOnlineSeaMapsLayer();
    }
  }


  getOnlineStreetMapTiles() {
    return tileLayer('http://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
      {
        minZoom: 3,
        maxZoom: 18
      })
  }

  getOnlineSeaMapsLayer() {
    return tileLayer('http://tiles.openseamap.org/seamark/{z}/{x}/{y}.png', {})
  }
}
