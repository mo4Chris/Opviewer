import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { BsComponentComponent } from './bs-component.component';
import { PageHeaderModule } from '../../shared';
import { RouterTestingModule } from '@angular/router/testing';
import {
    AlertComponent,
    ButtonsComponent,
    ModalComponent,
    CollapseComponent,
    DatePickerComponent,
    DropdownComponent,
    PaginationComponent,
    PopOverComponent,
    ProgressbarComponent,
    TabsComponent,
    RatingComponent,
    TooltipComponent,
    TimepickerComponent
} from './components';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';

describe('BsComponentComponent', () => {
    let component: BsComponentComponent;
    let fixture: ComponentFixture<BsComponentComponent>;

    beforeEach(
        async(() => {
            TestBed.configureTestingModule({
                imports: [
                    FormsModule,
                    ReactiveFormsModule,
                    NgbModule,
                    PageHeaderModule,
                    RouterTestingModule
                ],
                declarations: [
                    BsComponentComponent,
                    ButtonsComponent,
                    AlertComponent,
                    ModalComponent,
                    CollapseComponent,
                    DatePickerComponent,
                    DropdownComponent,
                    PaginationComponent,
                    PopOverComponent,
                    ProgressbarComponent,
                    TabsComponent,
                    RatingComponent,
                    TooltipComponent,
                    TimepickerComponent
                ]
            }).compileComponents();
        })
    );

    beforeEach(() => {
        fixture = TestBed.createComponent(BsComponentComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });
});
