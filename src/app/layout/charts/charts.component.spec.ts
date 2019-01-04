import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ChartsComponent } from './charts.component';
import { PageHeaderModule } from '../../shared';

import { RouterTestingModule } from '@angular/router/testing';

import { ChartsModule as Ng2Charts } from 'ng2-charts';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';

describe('ChartsComponent', () => {
    let component: ChartsComponent;
    let fixture: ComponentFixture<ChartsComponent>;

    beforeEach(
        async(() => {
            TestBed.configureTestingModule({
                imports: [Ng2Charts, PageHeaderModule, RouterTestingModule, BrowserAnimationsModule],
                declarations: [ChartsComponent]
            }).compileComponents();
        })
    );

    beforeEach(() => {
        fixture = TestBed.createComponent(ChartsComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });
});
