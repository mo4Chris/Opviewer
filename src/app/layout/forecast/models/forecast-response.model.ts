export interface ForecastOperation {
  id: number;
  name: string;
  client_id: number;
  latitude: number;
  longitude: number;
  water_depth: number;
  maximum_duration: number;
  vessel_id: string;
  activation_start_data: number;
  activation_end_data: number;
  client_preferences: ForecastResponsePreference,
  consumer_id: number;
}

export interface ForecastResponseObject {
  consumer_id: number
  id: number;
  metocean_id: string;
  project_id: number;
  response: {
    Points_Of_Interest: {
      P1: ForecastResponse
    }
  };
}

interface ForecastResponse {
  Coordinates: ForecastVesselLocation
  Time: number[]; // Matlab timestamps
  Heading: number[]; // In degrees
  Response: {
    Acc: Dof6Array;
    Vel: Dof6Array;
    Disp: Dof6Array;
  }
}

interface ForecastResponsePreference {
  "Points_Of_Interest": {
    "P1": {
      "Coordinates": {
        "X": { "Data": number, "String_Value": string },
        "Y": { "Data": number, "String_Value": string },
        "Z": { "Data": number, "String_Value": string }
      },
      "Max_Type": string,
      "Degrees_Of_Freedom": {
        "Roll": { "Disp": boolean, "Vel": boolean, "Acc": boolean },
        "Pitch": { "Disp": boolean, "Vel": boolean, "Acc": boolean },
        "Yaw": { "Disp": boolean, "Vel": boolean, "Acc": boolean },
        "Surge": { "Disp": boolean, "Vel": boolean, "Acc": boolean },
        "Sway": { "Disp": boolean, "Vel": boolean, "Acc": boolean },
        "Heave": { "Disp": boolean, "Vel": boolean, "Acc": boolean }
      }
    }
  }
}

interface ForecastVesselLocation {
  X: { // From aft of vessel towards the bow
    Data: number;
    String_Value: string;
  }
  Y: { // In horizontal plane perpendicular to roll axis. Is 0 at roll axis.
    Data: number;
    String_Value: string;
  }
  Z: { // Upwards from the keel
    Data: number;
    String_Value: string;
  }
}
export interface ForecastLimit {
  type: DofType,
  dof: Dof6,
  value: number
}

export type Dof6Array = number[][][]; // Time x Heading x Dof6
export type Dof6 = 'Surge' | 'Sway' | 'Heave' | 'Roll' | 'Pitch' | 'Yaw';
export type DofType = 'Disp' | 'Vel' | 'Acc'