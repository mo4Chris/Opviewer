import { CommonService } from "@app/common.service";
import { Injectable } from "@angular/core";
import { CalculationService } from "@app/supportModules/calculation.service";


@Injectable({
  providedIn: 'root',
})
export class MapStore {
  // In-memory datastore holding information on all parks locations, harbours etc...
  // The promises used prevent the data from being loaded multiple times.
  static PlatformFileName = 'Northsea_offshore_oilgas_platform_coordinates';

  constructor(
    private newService: CommonService,
    private calcService: CalculationService,
  ) {
  }

  parks: Promise<TurbinePark[]> = new Promise(resolve => {
    this.newService.getParkLocations().subscribe((raw) => {
      resolve(this.initFields(raw));
    })
  });
  platforms: Promise<OffshorePlatform[]> = new Promise(resolve => {
    this.newService.getPlatformLocations(MapStore.PlatformFileName).subscribe((raw) => {
      resolve(this.initPlatforms(raw[0]));
    })
  });
  harbours: Promise<HarbourLocation[]> = new Promise(resolve => {
    this.newService.getHarbourLocations().subscribe((raw) => {
      resolve(this.initHarbours(raw));
    });
  })

  public onAllData(): Promise<[TurbinePark[], OffshorePlatform[], HarbourLocation[]]> {
    return Promise.all([
      this.parks,
      this.platforms,
      this.harbours,
    ])
  }

  private initFields(_parks: any) {
    return <TurbinePark[]> _parks.map(_park => {
      let turbines: Array<{name: string, lon: number, lat: number}> = [];
      for (let _i=0; _i<_park.name.length; _i++) {
        turbines.push({
          name: _park.name[_i],
          lon: _park.lon[_i],
          lat: _park.lat[_i],
        })
      }
      return <TurbinePark> {
        name: _park.SiteName,
        filename: _park.filename,
        centroid: {
          lon: _park.centroid.lon,
          lat: _park.centroid.lat,
        },
        turbines: turbines,
        outline: {
          lon: _park.outlineLonCoordinates,
          lat: _park.outlineLatCoordinates,
        }
      }
    });
  }

  private initPlatforms(_platforms: {name: Array<any>, lon: Array<any>, lat: Array<any>}): OffshorePlatform[] {
    let platforms = [];
    if (Array.isArray(_platforms.name[0])) {
      for (let _i = 0; _i< _platforms.name[0].length; _i++) {
        platforms.push({
          name: _platforms.name[0][_i],
          lon: _platforms.lon[0][_i],
          lat: _platforms.lat[0][_i],
        })
      }
    } else {
      for (let _i = 0; _i< _platforms.name.length; _i++) {
        platforms.push({
          name: _platforms.name[_i],
          lon: _platforms.lon[_i],
          lat: _platforms.lat[_i],
        })
      }
    }
    return platforms
  }

  private initHarbours(rawdata: {centroid: any, lon: any[][], lat: any[][], name: string}[]) {
    let harbours  = rawdata.map(raw => {
      return {
        name: raw.name,
        centroid: raw.centroid,
        outline: {
          lon: this.calcService.parseMatlabArray(raw.lon),
          lat: this.calcService.parseMatlabArray(raw.lat),
        }
      }
    });
    return harbours;
  }
}

class MockedMapStore extends MapStore{
  parks: Promise<TurbinePark[]> = new Promise(resolve => resolve([]));
  platforms: Promise<OffshorePlatform[]> = new Promise(resolve => resolve([]));
}
export const MockedMapStoreProvider = {
  provide: MapStore,
  useClass: MockedMapStore,
}

export interface TurbinePark {
  name: string;
  filename: string;
  centroid: {
    lon: number;
    lat: number;
  }
  turbines: Array<{
    name: string;
    lon: number
    lat: number;
  }>,
  outline: {
    lon: number[];
    lat: number[];
  }
}
export interface OffshorePlatform {
  name: string;
  lon: number;
  lat: number;
}
export interface HarbourLocation {
  name: string,
  centroid: {
    lon: number,
    lat: number,
    radius: number,
  },
  outline: {
    lon: number[],
    lat: number[],
  }
}