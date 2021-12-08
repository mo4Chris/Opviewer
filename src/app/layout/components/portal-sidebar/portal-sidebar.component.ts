import { AfterViewInit, Component, ViewChild, ChangeDetectorRef } from '@angular/core';
import { Router } from '@angular/router';

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

  constructor(private _cdRef: ChangeDetectorRef, private _router: Router) { }

  ngAfterViewInit(): void {
    this._updateExpandedWidth();
  }

  private _updateExpandedWidth() {
    this._isMeasuring = true;
    this._isExpanded = true;
    this._injectedStyle = '--sidebar-expanded-width: 100%;';
    this._cdRef.detectChanges();
    const width = this._elem.nativeElement.offsetWidth;
    this._injectedStyle = `--sidebar-expanded-width: calc(${width}px - var(--size-8));`;
    this._isExpanded = false;
    this._isMeasuring = false;
    this._cdRef.detectChanges();
  }

  public handleClickFeedback() {
    // TODO: Feedback should be in a separate service... not in an unrelated component.
    window.alert('TODO: Feedback');
  }

  public handleClickItem() {
    this._isExpanded = false;
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
