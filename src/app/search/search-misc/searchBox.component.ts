import {
  Component,
  Inject,
  forwardRef,
  Input,
  Output,
  EventEmitter
} from "@angular/core";
import { BaseWidget, NgAisInstantSearch } from "angular-instantsearch";
import { connectAutocomplete } from "instantsearch.js/es/connectors";

import { Subject, Subscription } from 'rxjs';
import { debounceTime, distinctUntilChanged } from 'rxjs/operators';

import { MissionService } from '../services/mission-service';

@Component({
  selector: "app-search-box",
  template: `
    <div class="ais-SearchBox">
    <form class="ais-SearchBox-form" novalidate>

      <input #input
             (keyup)="handleChange($event)"
             [value]="state.query || missionService.query"
             class="ais-SearchBox-input"
             [placeholder]="'Search for ' + placeholders[sourceType] + '...'"
             style="width: 100%;
             padding: 10px"/>

      <button *ngIf="missionService.query" (click)="clearOp()" class="ais-SearchBox-reset" style="margin-right: 70px; padding-bottom: 30px" type="reset" title="Clear the search query.">
        <i style="font-size: 30px;" class="material-icons text-muted">clear</i>
      </button>

      <button (click)="keyUpOp(input.value)" class="ais-SearchBox-reset" style="margin-right: 30px; padding-bottom: 30px" type="submit" title="Submit the search query.">
        <i style="font-size: 30px;" class="material-icons text-muted">search</i>
      </button>

    </form>
    </div>
  `
})
export class SearchBoxComponent extends BaseWidget {
  // <input [matAutocomplete]="auto" matInput

  // <mat-option *ngFor="let option of index.hits" [value]="option.name" (click)="onQuerySuggestionClick.emit({ query: option.name })">
  // class="ais-SearchBox-submit"

  // <mat-autocomplete #auto="matAutocomplete" style="margin-top: 30px; max-height: 600px">
  //   <div *ngFor="let index of state.indices || []">
  //     <mat-option *ngFor="let option of index.hits" [value]="option.name" (click)="onQuerySuggestionClick.emit({ query: option.name })">
  //       {{ option.name }}
  //     </mat-option>
  //   </div>
  // </mat-autocomplete>

  // https://stackoverflow.com/questions/32051273/angular-and-debounce
  public notesText: string;
  private notesModelChanged: Subject<string> = new Subject<string>();
  private changeSubscription: Subscription

  state: {
    query: string;
    refine: Function;
    indices: object[];
  };

  @Input() query: string;
  @Input() sourceType: number = 0;

  placeholders: string[] = [
    'institutes',
    'research labs',
    'companies',
    'researchers',
    // journals
    // funding
    // scholarships
    // courses
    // projects
    'trends',
    'podcasts',
    'events',
    'apps',
    // media
    'quotes',
    'papers kits',
    'publications',
  ]

  @Output() onQuerySuggestionClick = new EventEmitter<{ query : string }>();

  constructor(
    public missionService: MissionService,
    @Inject(forwardRef(() => NgAisInstantSearch))
    public instantSearchParent
  ) {
    super("SearchBoxComponent");
  }

  public handleChange($event: KeyboardEvent) {
    const value = ($event.target as HTMLInputElement).value;
    // console.log('value',value)
    // this.keyUpOp(value)
    this.notesModelChanged.next(value);
    // this.state.refine(value);
  }

  public ngOnInit() {
    this.createWidget(connectAutocomplete, {});
    super.ngOnInit();

    setTimeout(() => {
      try {
        this.keyUpOp(this.missionService.query || '')
      } catch (e) { }
    }, 10);

    this.changeSubscription = this.notesModelChanged
        .pipe(
          debounceTime(500),
          distinctUntilChanged()
        )
        .subscribe(newText => {
          this.notesText = newText;
          // console.log('newText',newText);
          this.keyUpOp(newText)
        });
  }

  keyUpOp(query: string) {
    // console.log('query',query)
    this.missionService.query = query;
    this.missionService.currentPage = 0;
    this.state.refine(query)
  }

  clearOp() {
    // this.state.clear;
    this.missionService.query = '';
    this.missionService.currentPage = 0;
    this.state.refine('')
  }

  ngOnDestroy(): void {
    if (this.changeSubscription) this.changeSubscription.unsubscribe();
  }

}
