import {Component, Input, Output, EventEmitter, OnInit, OnDestroy, Injectable} from '@angular/core';
import {FormGroup, FormControl} from '@angular/forms';

import {Subscription} from 'rxjs/Subscription';
import {Observable, from, of} from 'rxjs';
import {catchError, debounceTime, distinctUntilChanged, map, tap, switchMap} from 'rxjs/operators';
// import {Jsonp, URLSearchParams} from '@angular/http';

// import 'rxjs/add/operator/catch';
// import 'rxjs/add/operator/do';
// import 'rxjs/add/operator/merge';

import { People, PeopleService } from '../../../services/people-service';
import { GroupService } from '../../../services/group-service';
import { UniversityService } from '../../../services/university-service';
import { ResourceService } from '../../../services/resource-service';
import { FundingService } from '../../../services/funding-service';
import { PublicationService } from '../../../services/publication-service';
import { SharedService } from '../../../services/shared-service';
import { objectMini } from '../../../services/shared-service';

@Injectable()
export class SearchService {
  // constructor(private _jsonp: Jsonp) {}
  constructor(private peopleService: PeopleService,
              private groupService: GroupService,
              private universityService: UniversityService,
              private resourceService: ResourceService,
              private fundingService: FundingService,
              private publicationService: PublicationService,
              private sharedService: SharedService) {}

  async search(term: string, mode: number, userId: string, itemId: string, departmentId: string, universityId: string, existIds: string[]) {
    // ItemId can be groupID or projectID or FundingID, or...

    if (term === '') {
      // return Observable.of([]);
      return of([]);
    }

    if (mode == 0) { // Query People
      return await this.peopleService.getPeoples(3, term, itemId, 0, 1)

    } else if (mode == 1) {
      return await this.groupService.getGroups(7, itemId, userId, 0, 1, term)

    } else if (mode == 2) {
      return await this.universityService.getDepartments(universityId, term)

    // } else if (mode == 3) { // DELETE

    } else if (mode == 4) {
      return await this.sharedService.getLanguages(term.toLowerCase())

    } else if (mode == 5) {
      return await this.resourceService.getResources<objectMini>(5, itemId, term, 0)

    } else if (mode == 6) {
      return await this.groupService.getGroupsFilter(8, itemId, userId, 0, 1, term, existIds)

    } else if (mode == 7) {
      return await this.groupService.getGroups(1, departmentId, userId, 0, 1, term)

    } else if (mode == 8) {
      return await this.publicationService.queryJournals(term)

    } else if (mode == 9) {
      return await this.publicationService.queryPublications(term)

    } else if (mode == 10) {
      return await this.fundingService.queryFundings(term)

    } else if (mode == 11) { // Funding Roles / Publication Authors
      return await this.peopleService.getPeoplesFundingsRoles(3, term, itemId, 1, 1, existIds)
      // return this.peopleService.getPeoplesFundingsRoles(3,term,1,2,existIds)

    } else if (mode == 12) { // Share
      return await this.peopleService.getPeoples(7, term, null, 2, 1)

    } else if (mode == 13) { // query from Global universities list
      return await this.universityService.queryUniversities(term)

    }

    // return this.http
    //   .get('/api/v1/getPeoples?mode='+2+'&id='+null+'&userId='+"5a23a770612b012f548a214d"+'&type='+0+'&mini='+1)
    //   .map(response => response.data)
    //   .map(v => v.map(v => v.name))

    // let wikiUrl = 'https://en.wikipedia.org/w/api.php';
    // let params = new URLSearchParams();
    // params.set('search', term);
    // params.set('action', 'opensearch');
    // params.set('format', 'json');
    // params.set('callback', 'JSONP_CALLBACK');

    // return this._jsonp
    // .get(wikiUrl, {search: params})
    // .map(response => <string[]> response[1]);
  }
}

@Component({
  selector: 'build-modal-name-field',
  templateUrl: 'build-query-field.html',
  providers: [SearchService]
})
export class BuildQueryFieldComponent implements OnInit, OnDestroy {

  @Input() set submitStatus(value: boolean) {
    this._controlStatus = value;
    this.changeStatus(this._controlStatus);
  }

  get submitStatus(): boolean {
    return this._controlStatus;
  }
  @Output() controlStatus: EventEmitter <boolean> = new EventEmitter(true);

  @Input() itemTitle: string;
  @Input() placeholder = '';
  @Input() iconTitle = 'university';
  @Input() itemExplain: string = null;
  @Input() itemSmall = false;
  @Input() itemFirst = false;
  @Input() labelHide = false;
  @Input() labelRequired = false;
  @Input() questionFlag = false;
  @Input() signUpFlag = false;

  @Input() parentGroup: FormGroup;
  @Input() controlName: string;

  @Input() mode: number;

  @Input() universityId: string;
  @Input() departmentId: string;
  @Input() groupId: string;
  @Input() userId: string;
  @Input() existIds: string[];

  _controlStatus: boolean;
  _ignite = false;
  itemLength: number;

  subscription: Subscription;

  searching = false;
  searchFailed = false;
  hideSearchingWhenUnsubscribed = new Observable(() => () => this.searching = false);

  // itemsList: objectMini[];

  constructor(private _service: SearchService) { }

  search = (text$: Observable<string>) =>
    text$.pipe(
      debounceTime(300),
      distinctUntilChanged(),
      tap(() => this.searching = true),
      switchMap(term =>
        // https://stackoverflow.com/questions/46151876/convert-promise-to-rxjs-observable
        from(this._service.search(term, this.mode, this.userId, this.groupId, this.departmentId, this.universityId, this.existIds))
        .map(data => {
          // console.log('data',data)
          return (Array.isArray(data)) ? data : []
        })
        // .pipe(
        //   tap(data => { this.searchFailed = false }),
        //   catchError(() => {
        //     this.searchFailed = true;
        //     return of([]);
        //   }))
      ),
      tap(() => this.searching = false)
    );

    // merge
    // tap(v => this.itemsList = v)
    // tap(v => console.log('itemsList',this.itemsList))

  formatter = (x: {name: string}) => x.name;

  changeStatus(a: boolean) {
    if (this._ignite == false) {
      this._ignite = true;
    } else {
      this._controlStatus = true
      this.controlStatus.emit(true);
    }
  }

  ngOnInit() {
    // console.log('1212',this.parentGroup.controls[this.controlName].value)
    this.subscription = this.parentGroup.controls[this.controlName].valueChanges.subscribe(data => {
      // this.itemLength=data.length;
      this._controlStatus = false;
      this.controlStatus.emit(false);
    })
  }

  ngOnDestroy() {
    if (this.subscription) this.subscription.unsubscribe();
  }

}
