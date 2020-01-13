import { CommonModule } from "@angular/common";
import { NgModule } from "@angular/core";
import { SOVSiemensMonthlyKPIComponent } from "./sov-siemens-monthly-kpi.component";
import { CommonService } from "../../../common.service";

@NgModule({
    imports: [
        CommonModule,
    ],
    declarations: [SOVSiemensMonthlyKPIComponent],
    providers: [CommonService],
    bootstrap: [SOVSiemensMonthlyKPIComponent]
})
export class SovSiemensMojnthlyKpiModule {}
