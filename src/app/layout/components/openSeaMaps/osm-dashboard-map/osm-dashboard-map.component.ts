import { Component, OnInit } from '@angular/core';
import { icon, latLng, marker, tileLayer } from 'leaflet';

import { UserService } from '@app/shared/services/user.service'
import { CommonService } from '@app/common.service';
import { map, take } from 'rxjs/operators';
import * as L from "leaflet";
import { forkJoin } from 'rxjs/internal/observable/forkJoin';
import { DatetimeService } from '@app/supportModules/datetime.service';

@Component({
  selector: 'app-osm-dashboard-map',
  templateUrl: './osm-dashboard-map.component.html',
  styleUrls: ['./osm-dashboard-map.component.scss']
})
export class OsmDashboardMapComponent implements OnInit {

  constructor(
    private userService: UserService,
    private commonService: CommonService,
    private dateTimeService: DatetimeService,
  ) { }

  tokenInfo = this.userService.getDecodedAccessToken(localStorage.getItem('token'));
  zoomLvl = 5.5;

  //icons in icon service
  greenIcon = icon({
    iconSize: [40, 40],
    iconAnchor: [20, 40],
    iconUrl: 'assets/images/grn-circle.png',
  })
  yellowIcon = icon({
    iconSize: [40, 40],
    iconAnchor: [20, 40],
    iconUrl: 'assets/images/ylw-circle.png',
  })
  redIcon = icon({
    iconSize: [40, 40],
    iconAnchor: [20, 40],
    iconUrl: 'assets/images/red-circle.png',
  })
  harbourIcon = icon({
    iconSize: [20, 20],
    iconAnchor: [10, 10],
    iconUrl: 'assets/images/marina.png',
  })
  turbineIcon = icon({
    iconSize: [20, 20],
    iconAnchor: [10, 10],
    iconUrl: 'assets/images/windTurbine.png',
  })
  forecastIcon = icon({
    iconSize: [20, 20],
    iconAnchor: [10, 10],
    iconUrl: 'assets/images/forecast-location.png',
  })

  
   vesselMarkerClusterList = L.markerClusterGroup();
  
  vesselMarkerClusterOptions = {
    iconCreateFunction: function(cluster) {
      const icon = L.divIcon({
        iconSize: [0,0],
        iconAnchor: [16, 16],
        html: `<div style="
        width: 32px;
        height: 32px;
        line-height: 32px;
        background-image: url('http://localhost:4200/assets/clusterer/m1.png');
        background-size: cover; 
        text-align: center;
    ">` + cluster.getChildCount() + '</div>'
    });
    return icon;
    }
  };
  
  


  forecastMarkerClusterList = L.markerClusterGroup();
  
  
  forecastMarkerClusterOptions = {
    iconCreateFunction: function(cluster) {
      const icon = L.divIcon({
        iconSize: [0,0],
        iconAnchor: [16,16],
        html: `<div style="
        width: 32px;
        height: 32px;
        line-height: 32px;
        background-image: url('http://localhost:4200/assets/clusterer/m4.png');
        background-size: cover; 
        text-align: center;
    ">` + cluster.getChildCount() + '</div>'
      });
      return icon;
    }
  }


  harbourMarkerList;
  turbineMarkerList;
  
  map;


  osmMapOptions = {
    layers: [
      this.getMapBaseLayer()
    ],
    zoom: this.zoomLvl,
    center: latLng(55, 0)
  };

  getMapBaseLayer() {
    return this.chooseCorrectStreetMap();
  }

  onMapReady(map: L.Map) {
    this.map = map;
  }

  layers = [];

  controlLayers() {
    if (this.map.getZoom() > 6){ 
      this.map.addLayer(this.harbourMarkerList);
    } else {
      this.map.removeLayer(this.harbourMarkerList);
    }
  }
  

  ngOnInit(): void {
    forkJoin([
      this.retrieveHarbourLocations(),
      this.retrieveLatestVesselLocation(),
      this.retrieveWindfarmLocations(),
      this.retrieveForecastLocations()
    ]).subscribe(([harbours, vessels, windfarms, forecasts]) => {
        this.vesselMarkerClusterList = L.markerClusterGroup().addLayers(vessels),
        this.forecastMarkerClusterList= L.markerClusterGroup().addLayers(forecasts)

        this.harbourMarkerList = L.layerGroup(harbours)
        this.turbineMarkerList = windfarms;

        console.log(this.vesselMarkerClusterList)
    });
    
    
  }



  retrieveHarbourLocations () {
    return this.commonService.getHarbourLocations().pipe(
      map((response: any) => response.map(response => ({
        location_name: response.name,
        lat: response.centroid.lat,
        lon: response.centroid.lon,
          })
        )
      ), 
      map(elements => elements.map(element => {
        return marker([element.lat, element.lon], { icon: this.harbourIcon }).bindPopup(element.location_name);
      })  ),
      take(1)
      )
  }
  retrieveLatestVesselLocation () {
    return this.commonService.getLatestBoatLocation().pipe(
      map((response: any) => response.map(response => ({
        vessel_name: response.vesselInformation[0],
        lat: response.LAT,
        lon: response.LON,
        timestamp: response.TIMESTAMP,
        mmsi: response._id
          })
        )
      ), 
      map(elements => elements.map(element => {
        return marker([element.lat, element.lon], { icon: this.getCorrectColorIcon(element.timestamp)}).bindPopup(element.vessel_name);
      })  ),
      take(1)
      )
  }

  retrieveWindfarmLocations () {
    return this.commonService.getParkLocations().pipe(
      map((response: any) => response.map(response => ({
        site_name: response.SiteName,
        lat: response.centroid.lat,
        lon: response.centroid.lon,
        latOuline: response.outlineLatCoordinates,
        lonOutline: response.outlineLonCoordinates
          })
        )
      ), 
      map(elements => elements.map(element => {
        return marker([element.lat, element.lon], { icon: this.turbineIcon}).bindPopup(element.site_name);
      })  ),
      take(1)
      )
  }

  retrieveForecastLocations () {
    return this.commonService.getForecastProjectLocations().pipe(
      map((response: any) => response.map(response => ({
        forecast_name: response.nicename,
        lat: response.lat,
        lon: response.lon,
        project_id: response.id
          })
        )
      ), 
      map(elements => elements.map(element => {
        return marker([element.lat, element.lon], { icon: this.forecastIcon }).bindPopup(element.forecast_name);
      })  ),
      take(1)
      )
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

  getCorrectColorIcon(timestamp) {
    const lastUpdatedHours = this.dateTimeService.hoursSinceTimeString(timestamp);
      if (lastUpdatedHours < 1) {
        return this.greenIcon;
      } else if (lastUpdatedHours < 6) {
        return this.yellowIcon;
      } else {
        return this.redIcon;
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
