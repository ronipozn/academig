import {Component, OnDestroy} from '@angular/core';
import {Title} from '@angular/platform-browser';
import {Subscription} from 'rxjs/Subscription';
import {Router} from '@angular/router';

import {MissionService} from '../services/mission-service';
import {UserService} from '../../user/services/user-service';
import {PeopleService} from '../../shared/services/people-service';
import {GroupSize, CompanySize} from '../../shared/services/group-service';

import {itemsAnimation} from '../../shared/animations/index';

@Component({
  selector: 'search-saved',
  templateUrl: 'search-saved.html',
  styleUrls: ['search-saved.css'],
  animations: [itemsAnimation],
  host: { '[@itemsAnimation]': '' }
})
export class SearchSavedComponent {
  searches: any[] = [];
  streamRetrieved: boolean = true;

  streamSearches: number[];

  groupSize = GroupSize;

  constructor(public titleService: Title,
              public router: Router,
              public userService: UserService,
              public missionService: MissionService,
              public peopleService: PeopleService) {

    this.titleService.setTitle('Saved Searches - Academig');
    this.searchesGet()
  }

  async searchesGet() {
    this.streamRetrieved = false;
    this.searches = await this.peopleService.getSearches();
    if (this.searches) {
      this.streamSearches = new Array(this.searches.length).fill(0);
    } else {
      this.searches = [];
    }
    this.streamRetrieved = true;
  }

  async btnDeleteFunc(i: number) {
    this.streamSearches[i] = 3;
    await this.peopleService.deleteSearch(this.searches[i]._id);
    this.userService.userSearch--;
    this.searches.splice(i, 1);
    this.streamSearches[i] = 0;
  }

  searchOp(i: number) {
    this.missionService.refinements = this.searches[i].refinements;
    this.missionService.query = this.searches[i].query;

    const searchType: string = this.searches[i].refinements.search_type[0].toLowerCase();
    this.missionService.activeLink = './' + searchType;
    this.router.navigate(['/','search',searchType]);
  }

}
