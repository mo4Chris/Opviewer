export class ConditionDuringOperationModel {
    Time: string;
    Windspeed: string;
    WaveHeight: string;
    DpCurrent: string;
    WavePeriod: number;

    constructor(time: string, windspeed: string, waveheight: string, dpCurrent: string, wavePeriod: number) {
        this.Time = time;
        this.Windspeed = windspeed;
        this.WaveHeight = waveheight;
        this.DpCurrent = dpCurrent;
        this.WavePeriod = wavePeriod;
    }
}