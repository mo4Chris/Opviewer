import { ForecastMotionLimit } from "./forecast-limit";

export type ForecastAnalysisType = "Standard" | "CTV";

export interface ForecastOperation {
  id: number;
  active?: boolean,
  name: string;
  nicename: string;
  client_id: number;
  latitude: number;
  longitude: number;
  water_depth: number;
  maximum_duration: number;
  vessel_id: number;
  activation_start_date: string;
  activation_end_date: string;
  client_preferences: ForecastExpectedResponsePreference;
  analysis_types: ForecastAnalysisType[],
  metocean_provider: MetoceanProvider,
  consumer_id?: number;
}

export interface ForecastResponseObject {
  id: number;
  consumer_id: number;
  longitude: number;
  latitude: number;
  metocean_id: string;
  project_id: number;
  response: {
    Points_Of_Interest: {
      P1: ForecastResponse
    }
  };
}

export interface MetoceanProvider {
  id: number;
  is_active: boolean;
  display_name: string;
  name: string;
}

interface ForecastResponse {
  Coordinates: ForecastVesselLocation;
  Time: number[]; // Matlab timestamps
  Heading: number[]; // In degrees
  Response: {
    Acc: Dof6Array;
    Vel: Dof6Array;
    Disp: Dof6Array;
  };
  SlipResponse?: CtvSlipResponse;
  Project_Settings: {
    client_preferences: ForecastExpectedResponsePreference;
    latitude: number;
    longitude: number;
    water_depth: number;
    maximum_duration?: number;
  }
}

interface ForecastResponsePoi {
  'P1': {
    'Coordinates': {
      'X': { 'Data': number, 'String_Value': string },
      'Y': { 'Data': number, 'String_Value': string },
      'Z': { 'Data': number, 'String_Value': string }
    },
    'Max_Type': string,
    'Degrees_Of_Freedom': {
      'Roll': { 'Disp': boolean, 'Vel': boolean, 'Acc': boolean },
      'Pitch': { 'Disp': boolean, 'Vel': boolean, 'Acc': boolean },
      'Yaw': { 'Disp': boolean, 'Vel': boolean, 'Acc': boolean },
      'Surge': { 'Disp': boolean, 'Vel': boolean, 'Acc': boolean },
      'Sway': { 'Disp': boolean, 'Vel': boolean, 'Acc': boolean },
      'Heave': { 'Disp': boolean, 'Vel': boolean, 'Acc': boolean }
    }
  }
}

export interface CtvSlipResponse{
  Dimensions: string;
  Friction_Coeff_Range: number[];
  ProbabilityWindowNoSlip: number[][][];
  Thrust_Range: number[];
}
export interface ForecastExpectedResponsePreference {
  Points_Of_Interest?: ForecastResponsePoi
  Points: PointOfInterest[];
  Degrees_Of_Freedom?: {
    'Roll': { 'Disp': boolean, 'Vel': boolean, 'Acc': boolean },
    'Pitch': { 'Disp': boolean, 'Vel': boolean, 'Acc': boolean },
    'Yaw': { 'Disp': boolean, 'Vel': boolean, 'Acc': boolean },
    'Surge': { 'Disp': boolean, 'Vel': boolean, 'Acc': boolean },
    'Sway': { 'Disp': boolean, 'Vel': boolean, 'Acc': boolean },
    'Heave': { 'Disp': boolean, 'Vel': boolean, 'Acc': boolean }
  };
  Ops_Start_Time: any;
  Ops_Stop_Time: any;
  Ops_Heading: number;
  Limits: ForecastMotionLimit[];
  Max_Type: MAX_TYPE;
  Ctv_Slip_Options: ForecastCtvSlipSettings;
}
export interface ForecastCtvSlipSettings {
  Window_Length_Seconds: number,
  Max_Allowed_Slip_Meter: number,
  Thrust_Level_N: number,
  Slip_Coefficient: number
}
export interface PointOfInterest {
  Name: string;
  X: PoiValue;
  Y: PoiValue;
  Z: PoiValue;
}
interface PoiValue {
  Type: 'absolute'|'relative';
  Value: number;
  Unit: string;
}
type MAX_TYPE = 'MPM' | 'STD' | 'Significant';

interface ForecastVesselLocation {
  X: { // From aft of vessel towards the bow
    Data: number;
    String_Value: string;
  };
  Y: { // In horizontal plane perpendicular to roll axis. Is 0 at roll axis.
    Data: number;
    String_Value: string;
  };
  Z: { // Upwards from the keel
    Data: number;
    String_Value: string;
  };
}
export interface StoredForecastLimit {
  Type: DofType;
  Dof: Dof6;
  Unit: string;
  Value: number;
}

export type Dof6Array = number[][][]; // Time x Heading x Dof6
export type Dof6 = 'Surge' | 'Sway' | 'Heave' | 'Roll' | 'Pitch' | 'Yaw';
export type DofType = 'Disp' | 'Vel' | 'Acc';
