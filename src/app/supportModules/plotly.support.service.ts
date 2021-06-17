import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class PlotlySupportService {

  constructor() { }

  setXLimits(xVals: any[], plotLayout: Partial<Plotly.Layout>): void {
    const xmin = Math.min(... xVals);
    const xmax = Math.max(... xVals);
    if (plotLayout.xaxis != null) {
      plotLayout.xaxis['range'] = [xmin, xmax];
      return;
    }
    plotLayout.xaxis = {
      range: [xmin, xmax]
    }
  }

  createAreaLines(xVals: any[], yVals: number[], validator: (x: any, y: number)=>boolean) {
    // Algorithm for splitting
    const condition = xVals.map((_x:any, _i: number) => {
      const _y = yVals[_i];
      const is_valid = validator(_x, _y);
      return is_valid;
    });
    let prev = condition[0];
    const greens: { x: any, y: number }[] = [];
    const reds: { x: any, y: number }[] = [];
    if (condition[0]) {
      greens.push({x: xVals[0], y: yVals[0]});
    } else {
      reds  .push({x: xVals[0], y: yVals[0]});
    }
    const maxLength = Math.min(xVals.length, yVals.length);
    for (let i = 1; i < maxLength; i++) {
      const curr = condition[i];
      if (curr == prev) {
        if (curr) {
          greens.push({x: xVals[i], y: yVals[i]});
        } else {
          reds  .push({x: xVals[i], y: yVals[i]});
        }
      } else {
        // This could be replaced with an algoritm which does linear interpolation
        let x_mean: number | Date;
        if (typeof xVals[0] == 'number') {
          x_mean = (xVals[i - 1] + xVals[i]) / 2;
        } else {
          x_mean = (xVals[i - 1].valueOf() + xVals[i].valueOf()) / 2;
          x_mean = new Date(x_mean);
        }
        const y_mean = (yVals[i - 1] + yVals[i]) / 2;
        if (curr) {
          reds  .push({x: x_mean,   y: y_mean});
          reds  .push({x: x_mean,   y: 0});
          greens.push({x: x_mean,   y: 0});
          greens.push({x: x_mean,   y: y_mean});
          greens.push({x: xVals[i], y: yVals[i]});
        } else {
          greens.push({x: x_mean,   y: y_mean});
          greens.push({x: x_mean,   y: 0});
          reds  .push({x: x_mean,   y: 0});
          reds  .push({x: x_mean,   y: y_mean});
          reds  .push({x: xVals[i], y: yVals[i]});
        }
      }
      prev = curr;
    }
    return {
      green: greens,
      red: reds,
    };
  }
}
