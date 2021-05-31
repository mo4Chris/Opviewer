import { ChangeDetectionStrategy, Component, Input, OnChanges, OnInit } from '@angular/core';
import { MatrixService } from '@app/supportModules/matrix.service';
import { Dof6Array } from '../../models/forecast-response.model';

@Component({
  selector: 'app-forecast-motion-overview',
  templateUrl: './forecast-motion-overview.component.html',
  styleUrls: ['./forecast-motion-overview.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ForecastMotionOverviewComponent implements OnChanges {
  @Input() time: Date[];
  @Input() headings: number[];
  @Input() response: ForecastResponse;

  @Input() startTime: number;
  @Input() stopTime: number;

  public MotionTypes = ['Acc', 'Vel', 'Disp']
  public MotionType = 'Acc';

  public DofTypes = ['Surge', 'Sway', 'Heave', 'Roll', 'Pitch', 'Yaw']
  public Dof = 'Surge';

  public motion: number[][];

  constructor(
    private matService: MatrixService
  ) {
  }

  ngOnChanges(): void {
    this.computeMotion();
  }

  computeMotion() {
    if (!this.response) return null;
    const DofIdx = this.DofTypes.findIndex(val => val == this.Dof);
    const res: number[][] = this.response[this.MotionType];
    this.motion = res.map((_d) => _d.map(__d => __d[DofIdx]))
  }

  public onMotionChange() {
    this.computeMotion();
  }

}


interface ForecastResponse {
  Acc: Dof6Array;
  Vel: Dof6Array;
  Disp: Dof6Array;
}
