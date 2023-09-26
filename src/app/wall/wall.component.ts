import {Component, ElementRef, ViewChild} from '@angular/core';

import {UserService} from '../user/services/user-service';
import {AuthService} from '../auth/auth.service';
import {Group, GroupCompareMini} from '../shared/services/group-service';
import {PeopleService} from '../shared/services/people-service';
import {Folder} from '../shared/services/publication-service';

import {NGXLogger} from 'ngx-logger';

import algoliasearch from 'algoliasearch/lite';

const searchClient = algoliasearch(
  'TDKUK8VW4T',
  '73303e9badf36767a06c37395b6a3693'
);

import {titlesTypes} from '../shared/services/people-service';
import {environment} from '../../environments/environment';

@Component({
    selector: 'wall',
    templateUrl: 'wall.html',
    styleUrls: ['wall.css'],
})
export class WallComponent {
  config_labs = {
    indexName: 'labs', //environment.algolia.labs,
    searchClient
  };

  config_news = {
    indexName: environment.algolia.news,
    searchClient,
  };

  config_apps = {
    indexName: environment.algolia.apps,
    searchClient
  };

  config_trends = {
    indexName: environment.algolia.trends,
    searchClient
  };

  config_podcasts = {
    indexName: environment.algolia.podcasts,
    searchClient
  };

  config_events = {
    indexName: environment.algolia.events,
    searchClient
  };

  config_quotes = {
    indexName: environment.algolia.quotes,
    searchClient
  };

  compareStatuses: boolean[] = [];
  followStatuses: boolean[] = [];

  groupsIds: string[] = [];

  stream: number[] = [];;
  streamCompare: number[] = [];
  streamFollow: number[] = [];

  titlesSelect = titlesTypes;

  userRead: number = 0;

  searches: any[];

  trendTypes: string[] = [
    "Publications",
    "Citations",
    "Authors"
  ];

  @ViewChild('toggleCompareModal', { static: true }) toggleCompare: ElementRef;

  constructor(public userService: UserService,
              private authService: AuthService,
              private peopleService: PeopleService,
              private logger: NGXLogger) {
    if (this.userService.userId && this.userService.userFolders) {
      const userFolder: Folder = this.userService.userFolders.find(r=>r.folder=="read");
      this.userRead = userFolder ? userFolder.count : 0;
    } else {
      this.userRead = 0;
    }
  }

  async ngOnInit() {
    const searches = await this.peopleService.getFeatured();
    this.searches = searches.slice(0,2);
  }

  // https://stackoverflow.com/questions/45638450/angular2-using-directive-to-execute-function-in-component-losing-scope
  transformGroups = (groups) => {
    this.streamCompare = new Array(groups.length).fill(0);
    this.compareStatuses = groups.map(r => this.userService.userCompareGroups.map(u => u.groupIndex.group._id).indexOf(r.objectID)>-1);
    this.groupsIds = groups.map(r => r.groupIndex.group._id); // for unCompare

    this.streamFollow = new Array(groups.length).fill(0);
    this.followStatuses = (this.userService.userFollowings && this.userService.userFollowings.groupsIds) ? groups.map(r => this.userService.userFollowings.groupsIds.indexOf(r.objectID)>-1) : new Array(groups.length).fill(false);
    // const adminGroupsLength = this.userService.userPositions ? this.userService.userPositions.length : 0;
    // this.streamAdminFollow = Array(groups.length).fill(0).map(() => new Array(adminGroupsLength).fill(0));
    // this.groupsAdminFollow =  Array(groups.length).fill(0).map(() => new Array(adminGroupsLength).fill(0));
    // this.streamRetrieved=true;
    return groups
  }

  async buttonWallFunc(i: number, state: boolean) {
    this.userService.userWall[i]=state;
    await this.peopleService.toggleWall(i, state);
  }

  async itemFollow(j: number) {
    this.streamFollow[j] = 3;
    await this.peopleService.toggleFollow(4, 0, this.groupsIds[j], true);
    this.userService.toggleFollow(true, this.groupsIds[j], "group");
    this.followStatuses[j] = !this.followStatuses[j];
    this.streamFollow[j] = 0;
  }

  async itemCompare(i: number, group: Group) {
    const itemId: string = group.groupIndex.group._id;
    const compareFlag: boolean = this.compareStatuses[i];

    if (compareFlag || this.userService.userCompareGroups.length<5) {

      if (compareFlag) {
        const compareIndex: number = this.userService.userCompareGroups.map(r => r.groupIndex.group._id).indexOf(itemId);
        if (compareIndex > -1) this.userService.userCompareGroups.splice(compareIndex, 1);
      } else {
        const groupCompare: GroupCompareMini = {
          "_id": group.groupIndex.group._id,
          "pic": group.pic,
          "groupIndex": group.groupIndex,
          "country": group.country,
          "city": group.city,
        }
        this.userService.userCompareGroups.push(groupCompare);
      }

      this.streamCompare[i] = 3;

      await this.peopleService.toggleFollow(12, 0, itemId, !compareFlag);

      this.compareStatuses[i]=!this.compareStatuses[i];
      this.streamCompare[i] = 0;

    } else {

      this.toggleCompare.nativeElement.click();

    }
  }

}
