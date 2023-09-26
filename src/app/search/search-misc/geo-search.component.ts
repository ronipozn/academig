import { Component, forwardRef, Inject } from "@angular/core";
import { BaseWidget, NgAisInstantSearch } from "angular-instantsearch";
import { connectGeoSearch } from "instantsearch.js/es/connectors";

@Component({
  selector: "app-geo-search",
  template: `
    <agm-map [latitude]="center.lat" [longitude]="center.lng" style="height: 300px">
    </agm-map>
  `
})
// <ng-container *ngFor="let item of state.items || []">
//   <agm-marker *ngIf="item._geoloc.lat"
//     [latitude]="item._geoloc.lat"
//     [longitude]="item._geoloc.lng"
//     [label]="item.name">
//   </agm-marker>
// </ng-container>
export class GeoSearchComponent extends BaseWidget {
  state: {
    clearMapRefinement: Function;
    hasMapMoveSinceLastRefine: Function;
    isRefineOnMapMove: Function;
    isRefinedWithMap: Function;
    items: { name: string; _geoloc: { lat: number; lng: number } }[];
    refine: Function;
    setMapMoveSinceLastRefine: Function;
    toggleRefineOnMapMove: Function;
    position: object;
  };

  constructor(
    @Inject(forwardRef(() => NgAisInstantSearch))
    public instantSearchParent
  ) {
    super("GeoSearchComponent");
  }

  get center() {
    // console.log('this.state',this.state)
    if (this.state.items && this.state.items.length > 0) {
      const [first] = this.state.items;
      return first._geoloc || { lat: 0, lng: 0 };
    }
    return { lat: 0, lng: 0 };
  }

  public ngOnInit() {
    this.createWidget(connectGeoSearch, {});
    super.ngOnInit();
  }
}
