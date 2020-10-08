import { ReportsComponent } from './reports.component';
import { Routes, RouterModule } from '@angular/router';
import { NgModule } from '@angular/core';
import { LongtermComponent } from './longterm/longterm.component';
import { ReportsDprComponent } from './dpr/reports-dpr.component';
import { TablesComponent } from './tables/tables.component';

const routes: Routes = [
    { path: '', component: ReportsComponent },
    { path: 'dpr', component: ReportsComponent },
    { path: 'longterm', component: ReportsComponent },
    { path: 'tables', component: ReportsComponent },
    { path: '**', component: ReportsComponent },
];

@NgModule({
    imports: [
        RouterModule.forChild(routes),
    ],
    exports: [RouterModule]
})
export class ReportsRoutingModule {
}
