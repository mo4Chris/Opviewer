import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { FleetsComponent } from './fleets.component';
import { CommonService } from '../../common.service';
import { FormsModule } from '@angular/forms';
import { PageHeaderModule } from '../../shared';
import { HttpModule } from '@angular/http';
import { RouterTestingModule } from '@angular/router/testing';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';

describe('UsersComponent', () => {
    let component: FleetsComponent;
    let fixture: ComponentFixture<FleetsComponent>;

    beforeEach(async(() => {
        TestBed.configureTestingModule({
            imports: [
                FormsModule,
                PageHeaderModule,
                HttpModule,
                RouterTestingModule,
                BrowserAnimationsModule],
            declarations: [FleetsComponent],
            providers: [CommonService]
        })
            .compileComponents();
    }));

    beforeEach(() => {
        fixture = TestBed.createComponent(FleetsComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });
});
