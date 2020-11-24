import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { CommonService } from '@app/common.service';
import { TokenModel } from '@app/models/tokenModel';
import { VesselModel } from '@app/models/vesselModel';
import { CalculationService } from '@app/supportModules/calculation.service';
import { DatetimeService } from '@app/supportModules/datetime.service';
import { RouterService } from '@app/supportModules/router.service';
import { AisMarkerModel } from '../../dashboard.component';

@Component({
  selector: 'app-logistics-specialist',
  templateUrl: './logistics-specialist.component.html',
  styleUrls: ['./logistics-specialist.component.scss']
})
export class LogisticsSpecialistComponent implements OnInit {

  @Input() tokenInfo: TokenModel;
  @Output() locationData: EventEmitter<AisMarkerModel[]> = new EventEmitter<AisMarkerModel[]>();
  @Output() zoominfo: EventEmitter<any> = new EventEmitter<any>();

  constructor(
    private newService: CommonService,
    private dateService: DatetimeService,
    private routerService: RouterService,
    private calcService: CalculationService
    ) { }
  activeVessels: VesselInfo[] = [];
  vesselInfos: VesselModel[] = [];
  campaignInfo: CampaignInfo[] = [];
  locData: AisMarkerModel[] = [];
  uniqueParkNames: string[];
  lastMonth: string;

  defaultZoomInfo = {
    latitude: 55,
    longitude: 0.1,
    zoomlvl: 5.5
  };

  ngOnInit() {
    setTimeout(() => {
      this.newService.getVesselsForCompany([{
        client: this.tokenInfo.userCompany
      }]).subscribe(vessels => {
        this.vesselInfos = vessels;
        this.setZoomLevel();
        this.getVesselInfo();
      });
    });
    this.getCampaigns();
  }

  getLocations() {
    this.newService.getLatestBoatLocationForCompany(this.tokenInfo.userCompany).subscribe( boatLocationData => {
      this.locationData.emit(boatLocationData);
    });
  }

  setZoomLevel() {
    const activeFields = [];
    this.uniqueParkNames = this.vesselInfos.map(info => info.Site).filter((value, index, self) => {
      return typeof(value) === 'string' && self.indexOf(value) === index;
    });

    const isLoaded = [];
    const cb = () => {
      if (activeFields.length > 0) {
        // Do smart stuff
        const lats = [];
        const lons = [];
        activeFields.forEach(field => {
          lats.push(field.centroid.lat);
          lons.push(field.centroid.lon);
        });

        const props = this.calcService.GetPropertiesForMap(400, lats, lons);
        this.zoominfo.emit({
          zoomlvl: Math.min(props.zoomLevel, 8.5),
          latitude: props.avgLatitude,
          longitude: props.avgLongitude
        });
      } else {
        this.zoominfo.emit(this.defaultZoomInfo);
      }
    };

    if (this.uniqueParkNames.length > 0) {
      this.uniqueParkNames.forEach((parkname, _i) => {
        isLoaded.push(false);
        this.newService.getParkByNiceName(<string> parkname).subscribe(park => {
          isLoaded[_i] = true;
          if (park) {
            activeFields.push(park);
          }
          if (isLoaded.reduce((prev, curr) => prev && curr, true)) {
            cb();
          }
        });
      });
    } else {
      cb();
    }
  }

  getVesselInfo() {
    const startDate = this.dateService.getMatlabDateLastMonth();
    this.lastMonth = this.dateService.MatlabDateToJSDate(startDate);
    const stopDate = this.dateService.getMatlabDateYesterday();
    const numDays = stopDate - startDate + 1;
    this.vesselInfos.forEach(vInfo => {
      this.newService.getGeneralForRange({
        startDate: startDate,
        stopDate: stopDate,
        mmsi: vInfo.mmsi,
        vesselType: vInfo.operationsClass,
        projection: {
          date: 1,
          minutesFloating: 1
        }
      }).subscribe(genInfos => {
        genInfos = genInfos.length === 1 ? genInfos[0] : [];
        let lastSailed = 0;
        const hasSailed: number[] = genInfos.map(info => {
          if (info.minutesFloating > 0) {
            if (info.date > lastSailed) {
              lastSailed = info.date;
            }
            return 1;
          } else {
            return 0;
          }
        });
        const numSailingDays = hasSailed.reduce((prev, curr, _i) => {
          return curr ? prev + 1 : prev;
        }, 0);
        this.activeVessels.push({
          Name: vInfo.nicename,
          mmsi: vInfo.mmsi,
          LastSailed: lastSailed > 0 ? this.dateService.MatlabDateToJSDate(lastSailed) : '-',
          Site: typeof(vInfo.Site) === 'string' ? vInfo.Site : 'N/a',
          Type: vInfo.operationsClass,
          Budget: vInfo.videobudget > 0 ? <number> vInfo.videobudget : null,
          Usage: (numSailingDays / numDays * 100).toFixed(0) + '%',
        });
      });
    });
  }

  getCampaigns() {
    if (this.tokenInfo.hasCampaigns || true) {
      this.newService.getTurbineWarrantyForCompany({client: this.tokenInfo.userCompany}).subscribe(campains => {
        campains.forEach(campaign => {
          this.campaignInfo.push({
            Name: campaign.campaignName,
            Site: campaign.windField,
            Progress: NaN,
            RemDays: Math.max(0, campaign.stopDate - this.dateService.getMatlabDateYesterday() - 1),
            StartDate: campaign.startDate,
          });
        });
      });
    }
    // this.campaignInfo.push({
    //   Name: 'Test',
    //   Site: 'Graggy Gappert',
    //   Progress: -3,
    //   RemDays: 10,
    //   StartDate: 737727,
    // });
  }

  routeToDprFromVesselInfo(vesselInfo: VesselInfo) {
    this.routerService.routeToDPR({
      mmsi: vesselInfo.mmsi
    });
  }

  routeToLtmFromVesselInfo(vesselInfo: VesselInfo) {
    let rawVesselName = '';
    this.vesselInfos.some(info => {
      if (info.mmsi === vesselInfo.mmsi) {
        rawVesselName = info.vesselname;
        return true;
      }
      return false;
    });
    this.routerService.routeToDPR({
      mmsi: vesselInfo.mmsi
    });
    this.routerService.routeToLTM({
      mmsi: vesselInfo.mmsi,
      name: rawVesselName
    });
  }

  routeTCampaign(campaign: CampaignInfo) {
    this.routerService.routeToCampaign({
      name: campaign.Name,
      windField: campaign.Site,
      startDate: campaign.StartDate
    });
  }

}

interface VesselInfo {
  Name: string;
  mmsi: number;
  LastSailed: string;
  Site: string;
  Budget: number;
  Type: 'CTV' | 'SOV' | 'OSV';
  Usage: string;
}

interface CampaignInfo {
  Name: string;
  Site: string;
  StartDate: number;
  Progress: number;
  RemDays: number;
}
