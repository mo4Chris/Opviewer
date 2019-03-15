import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';

import { FleetRequestComponent } from './fleet-request.component';
import { NgMultiSelectDropDownModule } from 'ng-multiselect-dropdown';

describe('FleetRequestComponent', () => {
    let component: FleetRequestComponent;
    let fixture: ComponentFixture<FleetRequestComponent>;

    beforeEach(async(() => {
        TestBed.configureTestingModule({
            imports: [NgbModule.forRoot(),
                NgMultiSelectDropDownModule.forRoot()],
            declarations: [FleetRequestComponent]
        })
            .compileComponents();
    }));

    beforeEach(() => {
        fixture = TestBed.createComponent(FleetRequestComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });
});
