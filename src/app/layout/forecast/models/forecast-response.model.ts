

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

export type Dof6Array = number[][][]; // Time x Heading x Dof6
export type Dof6 = 'surge' | 'sway' | 'heave' | 'roll' | 'pitch' | 'yaw';