import { Component, Inject, forwardRef } from '@angular/core';
import { BaseWidget, NgAisInstantSearch } from 'angular-instantsearch';

const connectSearchMetaData = (renderFn, unmountFn) => (widgetParams = {}) => ({
  init() {
    renderFn({ searchMetadata: {} }, true);
  },
  render({ searchMetadata }) {
    renderFn({ searchMetadata }, false);
  },
  dispose() {
    unmountFn();
  },
});

@Component({
  selector: 'app-loading-indicator',
  template: `
    <mat-progress-bar *ngIf="state.searchMetadata && state.searchMetadata.isSearchStalled"
                      style="margin: 0px 0px;"
                      [color]="color"
                      [mode]="mode">
    </mat-progress-bar>
  `,
})
export class LoadingIndicator extends BaseWidget {
  // <spinner *ngIf="state.searchMetadata && state.searchMetadata.isSearchStalled"></spinner>
  color = 'primary';
  mode = 'indeterminate';

  state: {
    searchMetadata: any;
  };

  constructor(
    @Inject(forwardRef(() => NgAisInstantSearch))
    public instantSearchParent
  ) {
    super('LoadingIndicator');
  }

  public ngOnInit() {
    this.createWidget(connectSearchMetaData as any, {});
    super.ngOnInit();
  }
}
