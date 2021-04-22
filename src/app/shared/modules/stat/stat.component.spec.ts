import { waitForAsync, ComponentFixture, TestBed } from '@angular/core/testing';

import { StatComponent } from './stat.component';

describe('StatComponent', () => {
    let component: StatComponent;
    let fixture: ComponentFixture<StatComponent>;

    beforeEach(
        waitForAsync(() => {
            TestBed.configureTestingModule({
                declarations: [StatComponent]
            }).compileComponents();
        })
    );

    beforeEach(() => {
        fixture = TestBed.createComponent(StatComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });
});
