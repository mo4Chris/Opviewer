import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ScatterplotComponent } from './scatterplot.component';
import { HttpClientModule } from '@angular/common/http';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { CommonModule } from '@angular/common';
import { ScatterplotRoutingModule } from './scatterplot-routing.module';
import { PageHeaderModule } from '../../shared';
import { CommonService } from '../../common.service';
import { ChartsModule as Ng2Charts } from 'ng2-charts';
import { HttpModule } from '@angular/http';
import { RouterModule } from '@angular/router';

describe('ScatterplotComponent', () => {
  let component: ScatterplotComponent;
  let fixture: ComponentFixture<ScatterplotComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [
        Ng2Charts,
        FormsModule,
        NgbModule.forRoot(),
        ReactiveFormsModule,
        ScatterplotRoutingModule,
        PageHeaderModule,
        HttpModule,
        RouterModule.forRoot([])],
      declarations: [ ScatterplotComponent ],
      providers: [CommonService]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ScatterplotComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
