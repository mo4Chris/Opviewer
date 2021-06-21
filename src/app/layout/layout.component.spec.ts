import { waitForAsync, ComponentFixture, TestBed } from '@angular/core/testing';

import { LayoutComponent } from './layout.component';
import { NgbModule, NgbDropdownModule } from '@ng-bootstrap/ng-bootstrap';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { HttpClientModule } from '@angular/common/http';
import { TranslateModule } from '@ngx-translate/core';
import { SidebarComponent } from './components/sidebar/sidebar.component';
import { HeaderComponent } from './components/header/header.component';
import { RouterTestingModule } from '@angular/router/testing';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { CommonService } from '../common.service';

describe('LayoutComponent', () => {
    let component: LayoutComponent;
    let fixture: ComponentFixture<LayoutComponent>;

    beforeEach(
        waitForAsync(() => {
            TestBed.configureTestingModule({
                imports: [
                    FormsModule,
                    NgbModule,
                    NgbDropdownModule,
                    TranslateModule.forRoot(),
                    RouterTestingModule,
                    BrowserAnimationsModule,
                    HttpClientModule
                ],
                declarations: [LayoutComponent, SidebarComponent, HeaderComponent],
                providers: [ CommonService ]
            }).compileComponents();
        })
    );

    beforeEach(() => {
        fixture = TestBed.createComponent(LayoutComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    // it('should create', () => {
    //     expect(component).toBeTruthy();
    // });
});


export function assertTableEqualRowLength(table: HTMLElement) {
    expect(table).toBeTruthy('Table not present!')
    const rows = table.querySelectorAll('tr');
    expect(rows.length).toBeGreaterThan(0, 'Should have at least 1 row')
    const row_len = get_num_cells_from_row(rows[0]);
    expect(row_len).toBeGreaterThan(0, 'Row length should be positive!')
    rows.forEach((_row, row_index) => {
      const num_cells = get_num_cells_from_row(_row);
      console.log(`Row ${row_index} has length ${num_cells} != ${row_len}`)
      expect(num_cells).toEqual(row_len, `Row ${row_index} has length ${num_cells} != ${row_len}`);
    })

    function get_num_cells_from_row(row: HTMLElement) {
      let count = 0;
      const tds = row.querySelectorAll('td');
      const ths = row.querySelectorAll('th');
      tds.forEach(td => {
        const colspan = td.getAttribute('colspan') ?? 1;
        count += +colspan;
      })
      ths.forEach(th => {
        const colspan = th.getAttribute('colspan') ?? 1;
        count += +colspan;
      })
      return count;
    }
  }
