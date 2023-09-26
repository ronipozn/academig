import {Component, ElementRef, ViewChild, OnDestroy} from '@angular/core';
import {Title} from '@angular/platform-browser';
import {Subscription} from 'rxjs/Subscription';
import {Router} from '@angular/router';

import {ItemService} from '../../shared/services/item-service';
import {People, PeopleService} from '../../shared/services/people-service';
import {GroupCompareMini, Group, GroupService} from '../../shared/services/group-service';

import {UserService} from '../../user/services/user-service';

import {itemsAnimation} from '../../shared/animations/index';

import {SelectionModel} from '@angular/cdk/collections';
import {MatPaginator} from '@angular/material/paginator';
import {Sort, MatSortable, MatSort} from '@angular/material/sort';
import {MatTableDataSource} from '@angular/material/table';
import {CdkDragDrop, moveItemInArray} from '@angular/cdk/drag-drop';
import {MatSelectionList, MatSelectionListChange, MatListOption} from '@angular/material';

export interface PodcastData {
  id: string;
  pic: string;
  name: string;
  website: string;
  category: string[];
  description: string;
  compareStatus: boolean;
}

export interface ColumnsData {
  name: string;
  code: string;
}

@Component({
  selector: 'follow-table',
  templateUrl: 'follow-table.html',
  styleUrls: ['follow-table.css'],
  animations: [itemsAnimation],
  host: { '[@itemsAnimation]': '' }
})
export class FollowTableComponent implements OnDestroy {
  streamRetrieved: boolean = false;
  isMobile: boolean = false;

  dataSource: MatTableDataSource<PodcastData>;
  dataKits: any;

  columnsCodes: string[];
  columnsData: ColumnsData[];

  sourceType: number;
  searchTypeName: string;

  streamAdminFollow: number[][];
  subscriptionUnCompare: Subscription;

  @ViewChild('toggleCompareModal', { static: false }) toggleCompare: ElementRef;

  @ViewChild(MatPaginator, {static: true}) paginator: MatPaginator;
  @ViewChild(MatSort, {static: true}) sort: MatSort;

  constructor(public titleService: Title,
              public userService: UserService,
              public itemService: ItemService,
              public peopleService: PeopleService,
              public groupService: GroupService,
              private router: Router) {
    this.titleService.setTitle('My Following | Academig');

    this.subscriptionUnCompare = userService.searchUnCompareAnnounced$.subscribe(
      item => {
        if (this.sourceType==2 || this.sourceType==3) {
          const compareIndex: number = this.dataKits.map(r=>r.id).indexOf(item._id);
          if (compareIndex>-1) this.dataKits[compareIndex].compareStatus=false;
        }
    });
  }

  async ngOnInit() {
    this.searchTypeName = this.getUrlWithoutParams().split('/').pop();
    this.initTable();
    this.updateData();
  }

  ngOnDestroy() {
    if (this.subscriptionUnCompare) this.subscriptionUnCompare.unsubscribe();
  }

  ////////////////////////////////////
  ////////////////////////////////////
  ////////////////////////////////////
  ////////////////////////////////////

  initTable() {
    switch (this.searchTypeName) {
      case "institutes":
        this.sourceType=0;
        break;
      case "departments":
        this.sourceType=1;
        this.columnsData = [
          { name: 'Name', code: 'name' },
          { name: 'Founded Year', code: 'year' },
          // { name: 'Size', code: 'size' },
          { name: 'Location', code: 'location' },
          { name: 'Institute', code: 'institute' },
          { name: 'Description', code: 'description' },
          { name: 'Categories', code: 'categories' },
        ]
        break;
      case "labs":
        this.sourceType=2;
        // headerRow: ['PI', 'Topic', 'Size', 'Year']
        // headerTooltip: ['Principal investigator', 'Main Research Field', 'Lab Size', 'Year of establishment']
        this.columnsData = [
          { name: 'Name', code: 'name' },
          { name: 'Founded Year', code: 'year' },
          // { name: 'Size', code: 'size' },
          { name: 'Location', code: 'location' },
          { name: 'Institute', code: 'institute' },
          { name: 'Description', code: 'description' },
          { name: 'Categories', code: 'categories' },
        ]
        break;
      case "companies":
        this.sourceType=3;
        this.columnsData = [
          { name: 'Name', code: 'name' },
          // { name: 'Founded Year', code: 'year' },
          { name: 'Location', code: 'location' },
          { name: 'Institute', code: 'institute' },
          { name: 'Description', code: 'description' },
          { name: 'Categories', code: 'categories' },
        ]
        break;
      case "researchers":
        this.sourceType=4;
        this.columnsData = [
          { name: 'Name', code: 'name' },
          { name: 'Location', code: 'location' },
          { name: 'Mentor', code: 'mentor' },
          { name: 'Institute', code: 'institute' },
          { name: 'Description', code: 'description' },
          { name: 'Categories', code: 'categories' },
        ]
        break;
      case "podcasts":
        this.sourceType=5;
        // this.peoplesRetreive();
        this.columnsData = [
          { name: 'Name', code: 'name' },
          { name: 'Type', code: 'type' },
          { name: 'Location', code: 'location' },
          { name: 'Institute', code: 'institute' },
          { name: 'Description', code: 'description' },
          { name: 'Categories', code: 'categories' },
          { name: 'Website', code: 'website' },
          { name: 'Language', code: 'language' },
          { name: 'Release', code: 'year' },
          { name: 'Toal', code: 'size' },
        ]
        break;
      case "events":
        this.sourceType=6;
        this.columnsData = [
          { name: 'Name', code: 'name' },
          { name: 'Type', code: 'type' },
          { name: 'Location', code: 'location' },
          { name: 'Description', code: 'description' },
          { name: 'Categories', code: 'categories' },
          { name: 'Website', code: 'website' },
          { name: 'Language', code: 'language' },
          { name: 'Start', code: 'start' },
          { name: 'End', code: 'end' },
          { name: 'Price', code: 'price' }
        ]
        break;
      case "apps":
        this.sourceType=7;
        this.columnsData = [
          { name: 'Name', code: 'name' },
          { name: 'Type', code: 'type' },
          { name: 'Location', code: 'location' },
          { name: 'Institute', code: 'institute' },
          { name: 'Description', code: 'description' },
          { name: 'Categories', code: 'categories' },
          { name: 'Website', code: 'website' },
          { name: 'Release', code: 'year' },
          { name: 'Price', code: 'price' },
          { name: 'Company', code: 'company' },
        ]
        break;
      case "services":
        this.sourceType=8;
        this.columnsData = [
          { name: 'Name', code: 'name' },
          { name: 'Type', code: 'type' },
          { name: 'Location', code: 'location' },
          { name: 'Description', code: 'description' },
          { name: 'Categories', code: 'categories' }
        ]
        break;
    }
  }

  ////////////////////////////////////
  ////////////////////////////////////
  ////////////////////////////////////
  ////////////////////////////////////

  async updateData() {
    this.streamRetrieved = false;

    switch (this.sourceType) {
      case 0: { // Institutes
        // this.dataKits = hits.map(
        //   u => ({
        //     // Description Keywords
        //     id: u.objectID,
        //     name: "moti",
        //     link: u.link,
        //     pic: u.pic,
        //
        //     year: u.establish,
        //     categories: u.interests,
        //
        //     country: u.country,
        //     state: u.state,
        //     city: u.city,
        //
        //     social: u.social,
        //     rank: u.rank,
        //     facilities: u.facilities,
        //     people: u.people,
        //     // alumni: u.alumni,
        //     settings: u.settings,
        //
        //     departments: u.departments ? u.departments.filter(r=>r.type=="department") : [],
        //     programs: u.departments ? u.departments.filter(r=>r.type=="program") : [],
        //     centers: u.departments ? u.departments.filter(r=>r.type=="center") : []
        //   })
        // )
        break;
      }
      case 2: { // Labs
        const groupsTmp: Group[] = await this.groupService.getGroups(0, this.userService.userId, this.userService.userId, 0, 5);
        const groups: Group[] = groupsTmp.filter(r => r.onBehalf!=4 && r.onBehalf!=5 && r.onBehalf!=7);
        // this.streamAdminFollow = Array(this.groups.length).fill(0).map(() => new Array(this.userService.userPositions.length).fill(0));

        this.dataKits = groups.map(
          u => ({
            id: u.groupIndex.group._id,
            name: u.groupIndex.group.name,
            pic: u.groupIndex.group.pic,
            description: u.background ? this.everyTwo(u.background) : null,
            country: u.country,
            state: u.state,
            city: u.city,
            groupIndex: u.groupIndex,
            // categories: u.interests,
            // size: u.size,
            // year: u.establish,
            // peoples: u.peoples,
            // topics: u.topic,
            // positions: u.positions
            compareStatus: (this.userService.userCompareGroups.map(u => u.groupIndex.group._id).indexOf(u._id)>-1) ? true : false,
            followStatus: u.followStatus,
            followStream: 0
          })
        )
        break;
      }
      case 3: { // Companies
        const groupsTmp: Group[] = await this.groupService.getGroups(0, this.userService.userId, this.userService.userId, 0, 5);
        const groups: Group[] = groupsTmp.filter(r => (r.onBehalf==4 || r.onBehalf==5 || r.onBehalf==7));

        // this.streamAdminFollow = Array(this.groups.length).fill(0).map(() => new Array(this.userService.userPositions.length).fill(0));

        this.dataKits = groups.map(
          u => ({
            id: u.groupIndex.group._id,
            name: u.groupIndex.group.name,
            pic: u.groupIndex.group.pic,
            description: u.background ? this.everyTwo(u.background) : null,
            country: u.country,
            state: u.state,
            city: u.city,
            groupIndex: u.groupIndex,
            // categories: u.interests,
            // size: u.size,
            // year: u.establish,
            // peoples: u.peoples,
            // topics: u.topic,
            // positions: u.positions
            compareStatus: (this.userService.userCompareGroups.map(u => u.groupIndex.group._id).indexOf(u._id)>-1) ? true : false,
            followStatus: u.followStatus,
            followStream: 0
          })
        )
        break;
      }
      case 4: { // Researchers
        const peoples: People[] = await this.peopleService.getPeoples(0, null, null, null, 0);
        this.dataKits = peoples.map(
          u => ({
            id: u._id,
            name: u.name,
            pic: u.pic,
            // country: u.country,
            groupIndex: u.positions[0] ? u.positions[0].group : null,
            // position: u.positions[0] ? u.positions[0].titles[0] : null,
            // start: u.positions[0] ? u.positions[0].period.start : null,
            // compareStatus: u.compareStatus,
            followStatus: u.followStatus,
            followStream: 0
          })
        )
        break;
      }
      case 5: { // Podcasts
        const podcasts = await this.itemService.getPodcasts();
        this.dataKits = podcasts.map(
          u => ({
            id: u._id,
            pic: u.pic,
            name: u.name,
            link: u.link,
            type: u.type,
            website: u.website, // Podcast URL
            categories: u.categories,
            description: this.addNewlines(u.description),
            release: u.release, // releaseYear
            total: u.total, // num of episodes
            // compareStatus: u.compareStatus,
            followStatus: u.followStatus,
            followStream: 0
          })
        )
        break;
      }
      case 6: { // Events
        const events = await this.itemService.getEvents();
        this.dataKits = events.map(
          u => ({
            id: u._id,
            pic: u.pic,
            name: u.name,
            link: u.link,
            type: u.type,
            website: u.website, // Event URL
            categories: u.categories,
            // fields
            description: u.description,
            start: u.start,
            end: u.end,
            language: u.language,
            price: u.price, // Event Price
            // compareStatus: u.compareStatus,
            followStatus: u.followStatus,
            followStream: 0
          })
        )
        break;
      }
      case 7: { // Apps
        const apps = await this.itemService.getApps();
        this.dataKits = apps.map(
          u => ({
            id: u._id,
            pic: u.pic,
            name: u.name,
            link: u.link,
            type: u.type,
            website: u.website, // App URL
            categories: u.categories,
            description: u.description,
            release: u.release, // releaseYear
            company: u.company, // companyName
            price: u.price, // pricePerYear
            // compareStatus: u.compareStatus,
            followStatus: u.followStatus,
            followStream: 0
          })
        )
        break;
      }
      case 8: { // Services
        const apps = await this.itemService.getApps();
        this.dataKits = apps.map(
          u => ({
            id: u._id,
            pic: u.pic,
            name: u.name,
            followStream: 0
          })
        )
        break;
      }
      case 9: { // Mentors
        const peoples: People[] = await this.peopleService.getPeoples(0, null, null, null, 0);
        this.dataKits = peoples.map(
          u => ({
            id: u._id,
            name: u.name,
            pic: u.pic,
            // country: u.country,
            groupIndex: u.positions[0] ? u.positions[0].group : null,
            // position: u.positions[0] ? u.positions[0].titles[0] : null,
            // start: u.positions[0] ? u.positions[0].period.start : null,
            // compareStatus: u.compareStatus,
            followStatus: u.followStatus,
            followStream: 0
          })
        )
        break;
      }
    }

    // this.columnsCodes = this.columnsData.map(r=>r.code);
    this.columnsCodes = this.columnsData.map(r=>r.code).concat(['comments','pros','cons','score','action'])

    this.dataSource = new MatTableDataSource(this.dataKits);
    this.dataSource.paginator = this.paginator;
    this.dataSource.sort = this.sort;

    this.streamRetrieved = true;
  }

  ////////////////////////////////////////
  //////////////// Follow ////////////////
  ////////////////////////////////////////

  async buttonFollowFunc(i: number) {
    const toFollow: boolean = !this.dataKits[i].followStatus;
    const itemId: string = this.dataKits[i].id;

    var clientType: string;
    var serverIndex: number;

    switch (this.searchTypeName) {
      // case "publications": clientType="publication"; serverIndex=0; break;
      case "services": clientType="resource"; serverIndex=1; break;
      // case "projects": clientType="project"; serverIndex=2; break;
      // case "positions": clientType="position"; serverIndex=3; break;
      case "labs": clientType="group"; serverIndex=4; break;
      case "companies": clientType="group"; serverIndex=4; break;
      case "podcasts": clientType="podcast"; serverIndex=6; break;
      case "events": clientType="event"; serverIndex=7; break;
      case "apps": clientType="app"; serverIndex=8; break;
      case "researchers": clientType="people"; serverIndex=9; break;
      case "mentors": clientType="people"; serverIndex=9; break;
    }

    this.dataKits[i].followStream = 3;
    await this.peopleService.toggleFollow(serverIndex, 0, itemId, toFollow);
    this.userService.toggleFollow(toFollow, itemId, clientType);
    this.dataKits[i].followStream = 0;
    this.dataKits[i].followStatus = toFollow;
  }

  // async groupAdminFollow(index: number[]) {
    // // index[0] - follow as
    // // index[1] - group to follow
    // const adminGroupId: string = this.userService.userPositions[index[0]].group.group._id;
    // // const toFollow: boolean = !this.groups[index[1]].followAdminStatus[index[0]];
    // // const groupId: string = this.groups[index[1]]._id;
    //
    // this.streamAdminFollow[index[1]][index[0]] = 3;
    // await this.groupService.toggleFollow(adminGroupId, groupId, toFollow);
    // // this.groups[index[1]].followAdminStatus[index[0]] = toFollow;
    // this.streamAdminFollow[index[1]][index[0]] = 0;
  // }

  ////////////////////////////////////
  ////////////// Compare /////////////
  ////////////////////////////////////

  async buttonCompareFunc(i: number) {
    const compareFlag: boolean = this.dataKits[i].compareStatus;

    if (compareFlag || this.userService.userCompareGroups.length<5) {

      if (compareFlag) {
        const compareIndex: number = this.userService.userCompareGroups.map(r => r.groupIndex.group._id).indexOf(this.dataKits[i].id);
        if (compareIndex > -1) this.userService.userCompareGroups.splice(compareIndex, 1);
      } else {
        const groupCompare: GroupCompareMini = {
          "_id": this.dataKits[i].id,
          "pic": this.dataKits[i].pic,
          "groupIndex": this.dataKits[i].groupIndex,
          "country": this.dataKits[i].country,
          "city": this.dataKits[i].city,
        }
        this.userService.userCompareGroups.push(groupCompare);
      }
      await this.peopleService.toggleFollow(12, 0, this.dataKits[i].id, !compareFlag);
      this.dataKits[i].compareStatus=!this.dataKits[i].compareStatus;

    } else {

      this.toggleCompare.nativeElement.click();

    }
  }

  ////////////////////////////////////////
  //////////// Columns DropDown //////////
  ////////////////////////////////////////

  columnIndex(column: string) {
    return this.columnsData.findIndex(y => y.code==column);
  }

  columnLast(column: string) {
    return this.columnsData[this.columnsData.length-1].code==column;
  }

  columnRemove(i: number) {
    this.columnsData.splice(i,1);
    this.columnsCodes = this.columnsData.map(r=>r.code);
    // .concat('add')
  }

  columnMove(i: number, direction: number) {
    let n: number;

    if (direction==-2) {
      n = 1;
    } else if (direction==-1) {
      n = i-1;
    } else if (direction==1) {
      n = i+1;
    } else if (direction==2) {
      n = this.columnsData.length-1;
    }

    [this.columnsData[n], this.columnsData[i]] = [this.columnsData[i], this.columnsData[n]];
    this.columnsCodes = this.columnsData.map(r=>r.code);
    // .concat('add')
  }

  ////////////////////////////////////////
  ////////////////////////////////////////
  ////////////////////////////////////////

  getUrlWithoutParams(){
    let urlTree = this.router.parseUrl(this.router.url);
    urlTree.queryParams = {};
    return urlTree.toString();
  }

  addNewlines(str) {
    var result = '';
    while (str.length > 0) {
      result += str.substring(0, 50) + '<br>';
      str = str.substring(50);
    }
    return result;
  }

  everyTwo(str) {
    return str
        .split(" ") // find spaces and make array from string
        .map((item, idx) => idx % 5 === 0 ? item + "<br>" : item) // add line break to every second word
        .join(" ") // make string from array
        .concat("...")
  }

  peopleMessage(i: number) {
    const userMessage: People = this.dataKits[i];
    this.userService.newChannel = {
                                   _id: null, block: 0, usersIds: [userMessage._id], users: [userMessage], unread: 0, type: 0,
                                   message: {_id: null, type: null, userId: null, text: null, file: null, date: null }
                                  };
    this.router.navigate(['/messages']);
  }
}
