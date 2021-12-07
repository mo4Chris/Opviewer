import { AfterViewInit, Component, ViewChild, OnDestroy, ChangeDetectorRef, AfterViewChecked } from '@angular/core';

@Component({
  selector: 'app-portal-sidebar',
  templateUrl: './portal-sidebar.component.html',
  styleUrls: ['./portal-sidebar.component.scss']
})
export class PortalSidebarComponent implements AfterViewInit {

  @ViewChild('portalSidebar') private _elem;
  private _isMeasuring = true;
  private _isExpanded = true;
  private _injectedStyle = '--sidebar-expanded-width: 100%;';

  constructor(private _cdRef: ChangeDetectorRef) { }

  ngAfterViewInit(): void {
    this._updateExpandedWidth();
  }

  private _updateExpandedWidth() {
    this._isMeasuring = true;
    this._isExpanded = true;
    this._injectedStyle = '--sidebar-expanded-width: 100%;';
    this._cdRef.detectChanges();
    const width = this._elem.nativeElement.offsetWidth;
    this._injectedStyle = `--sidebar-expanded-width: calc(${width}px - var(--size-16));`;
    this._isExpanded = false;
    this._isMeasuring = false;
    this._cdRef.detectChanges();
  }

  public get isMeasuring() {
    return this._isMeasuring;
  }

  public get isExpanded() {
    return this._isExpanded;
  }

  public get injectedStyle() {
    return this._injectedStyle;
  }

  public toggleExpanded() {
    this._isExpanded = !this._isExpanded;
  }

}
