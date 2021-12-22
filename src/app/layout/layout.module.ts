import { NgModule } from '@angular/core';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { CommonModule } from '@angular/common';
import { TranslateModule } from '@ngx-translate/core';
import { NgbDropdownModule } from '@ng-bootstrap/ng-bootstrap';

import { LayoutRoutingModule } from './layout-routing.module';
import { LayoutComponent } from './layout.component';
import { SidebarComponent } from './components/sidebar/sidebar.component';
import { HeaderComponent } from './components/header/header.component';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { CommonService } from '../common.service';
import { HttpClientModule } from '@angular/common/http';
import { AlertComponent } from './components/alert/alert.component';
import { PortalSidebarComponent } from './components/portal-sidebar/portal-sidebar.component';
import { PortalLogoComponent } from './components/portal-logo/portal-logo.component';
import { PortalSidebarItemComponent } from './components/portal-sidebar-item/portal-sidebar-item.component';
import { PortalSidebarService } from './components/portal-sidebar/portal-sidebar.service';

@NgModule({
    imports: [
        CommonModule,
        LayoutRoutingModule,
        FormsModule,
        HttpClientModule,
        ReactiveFormsModule,
        NgbModule,
        TranslateModule,
        NgbDropdownModule
    ],
    declarations: [LayoutComponent, SidebarComponent, HeaderComponent, AlertComponent, PortalSidebarComponent, PortalLogoComponent, PortalSidebarItemComponent],
    providers: [CommonService, PortalSidebarService]
})
export class LayoutModule { }
