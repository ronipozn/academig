import {Component, Input, Output, EventEmitter, OnInit, ViewChild, ElementRef} from '@angular/core';
// DoCheck, IterableDiffers

import {animate, state, style, transition, trigger} from '@angular/animations';

import {MissionService} from '../services/mission-service';
import {UserService} from '../../user/services/user-service';

import {PeopleService} from '../../shared/services/people-service';
import {SettingsService} from '../../shared/services/settings-service';
import {News, NewsService} from '../../shared/services/news-service';

import {AuthService} from '../../auth/auth.service';
import Auth0Client from '@auth0/auth0-spa-js/dist/typings/Auth0Client';

import {SelectionModel} from '@angular/cdk/collections';
import {MatPaginator} from '@angular/material/paginator';
import {Sort, MatSortable, MatSort} from '@angular/material/sort';
import {MatTableDataSource} from '@angular/material/table';
import {CdkDragDrop, moveItemInArray} from '@angular/cdk/drag-drop';
import {MatSelectionList, MatSelectionListChange, MatListOption} from '@angular/material';

import {GroupSize, GroupCompareMini} from '../../shared/services/group-service';
import {EventType, ProductType, PodcastType} from '../../items/services/item-service';
import {DealType} from '../../items/services/deal-service';
import {titlesTypes} from '../../shared/services/people-service';

import * as moment from 'moment';

export interface TableData {
  id: string;
  pic: string;
  name: string;
  type: number;
  website: string;
  category: string[];
  description: string;
}

export interface ColumnsData {
  name: string;
  code: string;
}

export interface ColumnsSelect {
  subheader: boolean;
  name: string;
  code: string;
  selected: boolean;
}

@Component({
    selector: 'search-table',
    templateUrl: 'search-table.html',
    styleUrls: ['search-table.css'],
    animations: [
      trigger('detailExpand', [
        state('collapsed', style({height: '0px', minHeight: '0'})),
        state('expanded', style({height: '*'})),
        transition('expanded <=> collapsed', animate('225ms cubic-bezier(0.4, 0.0, 0.2, 1)')),
      ]),
    ]
})
export class SearchTableComponent implements OnInit {
  @Input() sourceType: number = 0;
  @Input() searchTypeName: string;
  @Input() isMobile: boolean;

  @Output() upgradeMode: EventEmitter <number> = new EventEmitter();

  // groupsAdminFollow: boolean[][]
  // streamAdminFollow: number[][]

  moment: any = moment;

  viewMode: number = 0;
  hitsLength: number;

  timeline: News[] = [];
  streamTimeline: boolean = false;
  streamFollow: boolean = false;

  isAuthenticated: boolean;
  private auth0Client: Auth0Client;

  columnsCodes: string[];
  columnsData: ColumnsData[];

  columnsModalSelect: ColumnsSelect[];
  columnsModalData: ColumnsData[];
  columnsSelected: ColumnsData[] = [];

  dataSource: MatTableDataSource<TableData>;
  selection = new SelectionModel<TableData>(true, []);
  expandedRow: TableData | null;

  placeholders: string[] = [
    'Institute',
    'Lab',
    'Company',
    'Researcher',
    'Trend',
    'Podcast',
    'Event',
    'App',
    'Quote',
    'Kit',
    'Service',
    'Mentor'
  ]

  lengthSelect: string[] = ['Months', 'Years'];
  typeSelect: string[] = ["Full-time", "Part-time", "Contract", "Internship", "Volunteer"];

  groupSize = GroupSize;
  titlesSelect = titlesTypes;

  typeNames: string[];
  dealNames: string[];

  streamSubscribe: number;
  streamSaveSearch: number;
  streamExportSearch: number;

  saveFlag: boolean = false;

  CSV_OPTIONS = {
    fieldSeparator: ',',
    quoteStrings: '"',
    decimalseparator: '.',
    showLabels: true,
    showTitle: false,
    // title: 'Academig Labs Export',
    useBom: false,
    removeNewLines: true
  };

  CSV_DATA: any[] = [];

  @ViewChild('toggleCompareModal', { static: true }) toggleCompare: ElementRef;
  @ViewChild('toggleExportModal', { static: true }) toggleExport: ElementRef;
  @ViewChild('toggleColumnsModal', { static: true }) toggleColumns: ElementRef;

  @ViewChild(MatPaginator, {static: true}) paginator: MatPaginator;
  @ViewChild(MatSort, {static: true}) sort: MatSort;

  @ViewChild('newColumns', {static: true}) newColumns: MatSelectionList;

  constructor(public missionService: MissionService,
              public userService: UserService,
              private peopleService: PeopleService,
              private settingsService: SettingsService,
              private newsService: NewsService,
              private authService: AuthService,
              // private differs: IterableDiffers
             ) {
    // this.differ = differs.find([]).create(null);
  }

  async ngOnInit() {
    this.columnsModalData = [{ name: null, code: null }];
    this.columnsData = [{ name: null, code: null }];
    this.columnsModalSelect = [{ name: null, code: null, selected: null, subheader: null }];
    this.authService.isAuthenticated.subscribe(value => this.isAuthenticated = value);
    this.auth0Client = await this.authService.getAuth0Client();
    this.initColumns();
  }

  // ngDoCheck() {
    // const change = this.differ.diff(hits);
    // if (change) this.updateData();
  // }

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

  transformSearch = (hits) => { // if (this.selection) console.log('transformSearch',this.selection._selected)
    if (this.userService.userId==null || this.userService.planNumber==0) hits = hits.slice(0,6);
    this.hitsLength = hits.length;
    this.updateData(hits)
    this.updateTimeline()
    return hits
  }

  async updateTimeline() {
    this.streamTimeline = false;
    // const timeline = await this.newsService.getTimeline(type, offset, this.userService.userId);
    // if (timeline) this.timeline = timeline;
    this.streamTimeline = true;
  }

  initColumns() {
    switch (this.sourceType) {
      case 0: { // Institutes
        this.columnsModalSelect = [
          { name: 'Name', code: 'name', selected: false, subheader: false },
          { name: 'Founded Year', code: 'year', selected: false, subheader: false },
          { name: 'Location', code: 'location', selected: false, subheader: false },
          { name: 'Description', code: 'description', selected: false, subheader: false },

          { name: 'Structure', code: null, selected: null, subheader: true },
          { name: 'Departments', code: 'departments', selected: false, subheader: false },
          { name: 'Programs', code: 'programs', selected: false, subheader: false },
          { name: 'Centers', code: 'centers', selected: false, subheader: false },

          { name: 'Social impact', code: null, selected: null, subheader: true },
          { name: 'Linkedin followers', code: 'linkedin_followers', selected: false, subheader: false },
          { name: 'Twitter followers', code: 'twitter_followers', selected: false, subheader: false },
          { name: 'Facebook followers', code: 'facebook_followers', selected: false, subheader: false },
          { name: 'Instagram followers', code: 'instagram_followers', selected: false, subheader: false },
          { name: 'Youtube followers', code: 'youtube_followers', selected: false, subheader: false },

          { name: 'Social links', code: null, selected: null, subheader: true },
          { name: 'Linkedin link', code: 'linkedin_link', selected: false, subheader: false },
          { name: 'Twitter link', code: 'twitter_link', selected: false, subheader: false },
          { name: 'Facebook link', code: 'facebook_link', selected: false, subheader: false },
          { name: 'Instagram link', code: 'instagram_link', selected: false, subheader: false },
          { name: 'Youtube link', code: 'youtube_link', selected: false, subheader: false },

          { name: 'Ranks', code: null, selected: null, subheader: true },
          { name: 'Times Rank', code: 'rank_times', selected: false, subheader: false },
          { name: 'Shanghai Rank', code: 'rank_shanghai', selected: false, subheader: false },
          { name: 'Topuniversities Rank', code: 'rank_top', selected: false, subheader: false },
          { name: 'Worldreport Rank', code: 'ranks_usnews', selected: false, subheader: false },

          { name: 'Facilities', code: null, selected: null, subheader: true },
          { name: 'Library Facilities', code: 'year', selected: false, subheader: false },
          { name: 'Housing Facilities', code: 'year', selected: false, subheader: false },
          { name: 'Sport Facilities', code: 'year', selected: false, subheader: false },

          { name: 'People', code: null, selected: null, subheader: true },
          { name: 'Students Number', code: 'year', selected: false, subheader: false },
          { name: 'Doctoral Number', code: 'year', selected: false, subheader: false },
          { name: 'Staff Number', code: 'year', selected: false, subheader: false },

          { name: 'Other', code: null, selected: null, subheader: true },
          { name: 'Campus Settings', code: 'year', selected: false, subheader: false },
          { name: 'Control Type', code: 'year', selected: false, subheader: false },
          { name: 'Entity Type', code: 'year', selected: false, subheader: false },
          { name: 'Religious', code: 'year', selected: false, subheader: false },
          { name: 'Calendar', code: 'year', selected: false, subheader: false },
          { name: 'Distance Learning', code: 'year', selected: false, subheader: false }
        ]
        this.columnsData = [
          { name: 'Name', code: 'name' },
          { name: 'Founded Year', code: 'year' },
          { name: 'Location', code: 'location' },
          { name: 'Departments', code: 'departments' },
          { name: 'Programs', code: 'programs' },
          { name: 'Centers', code: 'centers' },
          { name: 'Description', code: 'description' },
          { name: 'Times Rank', code: 'rank_times' },
        ]
        break;
      }
      case 1: { // Labs
        this.columnsModalSelect = [
          { name: 'Lab Name', code: 'name', selected: false, subheader: false },
          { name: 'Institute', code: 'institute', selected: false, subheader: false },
          { name: 'Location', code: 'location', selected: false, subheader: false },
          { name: 'Description', code: 'description', selected: false, subheader: false },
          { name: 'Lab Head', code: 'head', selected: false, subheader: false },
          { name: 'Topics', code: 'topic', selected: false, subheader: false },
          { name: 'Lab Size', code: 'size', selected: false, subheader: false },
          { name: 'Founded Year', code: 'year', selected: false, subheader: false },
          { name: 'Research Interests', code: 'categories', selected: false, subheader: false },
        ]
        this.columnsData = [
          { name: 'Lab Name', code: 'name' },
          { name: 'Institute', code: 'institute' },
          { name: 'Location', code: 'location' },
          { name: 'Description', code: 'description' },
          { name: 'Lab Head', code: 'head' },
        ]
        // 'people'
        break;
      }
      case 2: { // Companies
        this.columnsModalSelect = [
          { name: 'Company Name', code: 'name', selected: false, subheader: false },
          { name: 'Categories', code: 'categories', selected: false, subheader: false },
          { name: 'Field', code: 'field', selected: false, subheader: false },
          { name: 'Location', code: 'location', selected: false, subheader: false },
          { name: 'Description', code: 'description', selected: false, subheader: false },
          { name: 'Establishment Year', code: 'start', selected: false, subheader: false },
        ]
        this.columnsData = [
          { name: 'Company Name', code: 'name' },
          { name: 'Categories', code: 'categories' },
          { name: 'Field', code: 'field' },
          { name: 'Location', code: 'location' },
          { name: 'Description', code: 'description' },
          { name: 'Establishment Year', code: 'start' },
        ]
        break;
      }
      case 3: { // Researchers
        this.columnsModalSelect = [
          { name: 'Researcher Name', code: 'name', selected: false, subheader: false },
          { name: 'Position', code: 'position', selected: false, subheader: false },
          { name: 'Institute', code: 'institute', selected: false, subheader: false },
          // Rank
          { name: 'Location', code: 'location', selected: false, subheader: false },
          { name: 'Start Date', code: 'start', selected: false, subheader: false },
          { name: 'Description', code: 'description', selected: false , subheader: false },
          { name: 'Categories', code: 'categories', selected: false, subheader: false },

          // currentSize
          // followedSize
          // publicationsSize

          // Social info
          // Public info
          // Social impact
        ]
        this.columnsData = [
          { name: 'Researcher Name', code: 'name' },
          { name: 'Position', code: 'position' },
          { name: 'Institute', code: 'institute' },
          { name: 'Location', code: 'location' },
          { name: 'Start Date', code: 'start' },
          { name: 'Description', code: 'description' },
          { name: 'Categories', code: 'categories' },
        ]
        break;
      }
      case 10: { // Services
        this.columnsModalSelect = [
          { name: 'Service Name', code: 'name', selected: false, subheader: false },
          { name: 'Location', code: 'location', selected: false, subheader: false },
          { name: 'Category', code: 'field', selected: false, subheader: false },
          { name: 'Type', code: 'type', selected: false, subheader: false },
          { name: 'Provider', code: 'provider', selected: false, subheader: false },
          { name: 'Description', code: 'description', selected: false, subheader: false },
          { name: 'Expertise', code: 'categories', selected: false, subheader: false },
          { name: 'Price', code: 'price', selected: false, subheader: false },
        ]
        this.columnsData = [
          { name: 'Service Name', code: 'name' },
          // { name: 'Location', code: 'location' },
          { name: 'Category', code: 'field' },
          { name: 'Type', code: 'type' },
          { name: 'Provider', code: 'provider' },
          { name: 'Description', code: 'description' },
          { name: 'Expertise', code: 'categories' },
          { name: 'Price', code: 'price' },
        ]
        break;
      }
      case 4: { // Trends
        this.columnsModalSelect = [
          { name: 'Trend Name', code: 'name', selected: false, subheader: false },
          { name: 'Description', code: 'description', selected: false, subheader: false },
          { name: 'Category', code: 'categories', selected: false, subheader: false },
        ]
        this.columnsData = [
          { name: 'Trend Name', code: 'name' },
          { name: 'Description', code: 'description' },
          { name: 'Categories', code: 'categories' },
        ]
        break;
      }
      case 5: { // Podcasts
        this.columnsModalSelect = [
          { name: 'Podcast Name', code: 'name', selected: false, subheader: false },
          { name: 'Podcast Type', code: 'type', selected: false, subheader: false },
          { name: 'Description', code: 'description', selected: false, subheader: false },
          { name: 'Categories', code: 'categories', selected: false, subheader: false },
          { name: 'Podcast URL', code: 'website', selected: false, subheader: false },
          { name: 'Release Year', code: 'year', selected: false, subheader: false },
          { name: 'Episodes', code: 'size', selected: false, subheader: false },
          { name: 'Language', code: 'language', selected: false, subheader: false },
          // social impact
          // social info
          // public info
        ]
        this.columnsData = [
          { name: 'Podcast Name', code: 'name' },
          { name: 'Podcast Type', code: 'type' },
          { name: 'Description', code: 'description' },
          { name: 'Categories', code: 'categories' },
        ]
        this.typeNames = PodcastType;
        break;
      }
      case 6: { // Events
        this.columnsModalSelect = [
          { name: 'Event Name', code: 'name', selected: false, subheader: false },
          { name: 'Event Type', code: 'type', selected: false, subheader: false },
          { name: 'Description', code: 'description', selected: false, subheader: false },
          { name: 'Categories', code: 'categories', selected: false, subheader: false },
          { name: 'Event URL', code: 'website', selected: false, subheader: false },
          { name: 'Reigstration URL', code: 'register', selected: false, subheader: false },
          { name: 'Start date', code: 'start', selected: false, subheader: false },
          { name: 'End date', code: 'end', selected: false, subheader: false },
          { name: 'Language', code: 'language', selected: false, subheader: false },
          // social impact
          // social info
          // public info
        ]
        this.columnsData = [
          { name: 'Event Name', code: 'name' },
          { name: 'Event Type', code: 'type' },
          { name: 'Description', code: 'description' },
          { name: 'Categories', code: 'categories' },
          { name: 'Start date', code: 'start' },
          { name: 'End date', code: 'end' },
        ]
        this.typeNames = EventType;
        break;
      }
      case 7: { // Apps
        this.columnsModalSelect = [
          { name: 'App Name', code: 'name', selected: false, subheader: false },
          { name: 'App Deal', code: 'price', selected: false, subheader: false },
          { name: 'App Type', code: 'type', selected: false, subheader: false },
          { name: 'Description', code: 'description', selected: false, subheader: false },
          { name: 'Categories', code: 'categories', selected: false, subheader: false },
          { name: 'App URL', code: 'website', selected: false, subheader: false },
          { name: 'Release Year', code: 'year', selected: false, subheader: false },
          { name: 'Company', code: 'company', selected: false, subheader: false },
          // social impact
          // social info
          // public info
        ]
        this.columnsData = [
          { name: 'App Name', code: 'name' },
          { name: 'App Deal', code: 'price' },
          { name: 'App Type', code: 'type' },
          { name: 'Description', code: 'description' },
          { name: 'Categories', code: 'categories' },
        ]
        this.typeNames = ProductType;
        this.dealNames = DealType;
        break;
      }
      case 8: { // Quotes
        this.columnsModalSelect = [
          { name: 'Quote Name', code: 'name', selected: false, subheader: false },
          { name: 'Description', code: 'description', selected: false, subheader: false },
          { name: 'Categories', code: 'categories', selected: false, subheader: false },
        ]
        this.columnsData = [
          { name: 'Quote Name', code: 'name' },
          { name: 'Description', code: 'description' },
          { name: 'Categories', code: 'categories' },
        ]
        break;
      }
      case 9: { // Papers Kits
        break;
      }
      case 11: { // Mentors
        this.columnsModalSelect = [
          { name: 'Mentor Name', code: 'name', selected: false, subheader: false },
          { name: 'Position', code: 'position', selected: false, subheader: false },
          { name: 'Institute', code: 'institute', selected: false, subheader: false }, // Rank
          { name: 'Location', code: 'location', selected: false, subheader: false }, // FromLocation

          { name: 'Description', code: 'description', selected: false, subheader: false },
          { name: 'Expertise', code: 'categories', selected: false, subheader: false },

          { name: 'Times available', code: 'times', selected: false, subheader: false },
          { name: 'Days available', code: 'days', selected: false, subheader: false },
          { name: 'Price', code: 'price', selected: false, subheader: false },
          { name: 'Sessions', code: 'size', selected: false, subheader: false },
          { name: 'Languages', code: 'language', selected: false, subheader: false },

          // viewsSize
          // currentSize
          // followedSize
          // publicationsSize

          // Social info
          // Public info
          // Social impact

          // Reviews
          // Rating
        ]
        this.columnsData = [
          { name: 'Mentor Name', code: 'name' },
          { name: 'Position', code: 'position' },
          { name: 'Institute', code: 'institute' },
          { name: 'Location', code: 'location' },
          { name: 'Description', code: 'description' },
          { name: 'Expertise', code: 'categories' },
          { name: 'Price', code: 'price' },
          { name: 'Sessions', code: 'size' },
          { name: 'Languages', code: 'language' },
        ]
        break;
      }
    }

    this.columnsCodes = ['select'].concat(this.columnsData.map(r=>r.code)).concat('action');
  }

  updateData(hits) {
    let dataKits: any;

    switch (this.sourceType) {
      case 0: { // Institutes
        dataKits = hits.map(
          u => ({
            // Description Keywords

            id: u.objectID,
            name: u.name,
            link: u.link,
            pic: u.pic,

            year: u.establish,
            categories: u.interests,

            country: u.country,
            state: u.state,
            city: u.city,

            social: u.social,
            rank: u.rank,
            facilities: u.facilities,
            people: u.people,
            // alumni: u.alumni,
            settings: u.settings,

            departments: u.departments ? u.departments.filter(r=>r.type=="department") : [],
            programs: u.departments ? u.departments.filter(r=>r.type=="program") : [],
            centers: u.departments ? u.departments.filter(r=>r.type=="center") : []
          })
        )
        this.missionService.isLoading = false;
        break;
      }
      case 1: { // Labs
        // console.log('hits',hits)
        dataKits = hits.map(
          u => ({
            id: u.objectID,
            name: u.name,
            description: u.background ? this.everyTwo(u.background) : null,
            country: u.country,
            state: u.state,
            city: u.city,
            groupIndex: u.groupIndex,
            categories: u.interests,
            size: u.size,
            year: u.establish,
            peoples: u.peoples,
            topics: u.topic,
            positions: u.positions ? u.positions.filter(u => u.mode==1) : null,
            standout: Math.max(u.positions ? u.positions.map(r => r.standout) : null)

            // Social info
            // Public info
            // Social impact:
            // linkedin_number
            // twitter_number
            // facebook_number
            // instagram_number
            // youtube_number

            // Institute Rank:
            // times_rank
            // shanghai_rank
            // topuniversities_rank
            // worldreport_rank
          })
        )
        this.missionService.isLoading = false;
        break;
      }
      case 2: { // Companies
        dataKits = hits.map(
          u => ({
            id: u.objectID,
            name: u.name,
            pic: u.groupIndex.group.pic,
            country: u.country,
            state: u.state,
            city: u.city,
            categories: u.interests,
            start: u.establish,
          })
          // fields
        )
        this.missionService.isLoading = false;
        break;
      }
      case 3: { // Researchers
        dataKits = hits.map(
          u => ({
            id: u.objectID,
            name: u.name,
            pic: u.pic,
            country: u.country,
            groupIndex: u.positions[0] ? u.positions[0].group : null,
            position: u.positions[0] ? u.positions[0].titles[0] : null,
            start: u.positions[0] ? u.positions[0].period.start : null,

            description: u.background ? this.everyTwo(u.background) : null,
            categories: u.interests,

            views: u.views,
            currentSize: u.currentSize,
            followedSize: u.followedSize,
            publicationsSize: u.publicationsSize

            // Social info:
            // Social impact:
            // linkedin_number
            // twitter_number
            // facebook_number
            // instagram_number
            // youtube_number

            // Public info:

            // Institute Rank:
            // times_rank
            // shanghai_rank
            // topuniversities_rank
            // worldreport_rank
          })
        )
        this.missionService.isLoading = false;
        break;
      }
      case 10: { // Services
        dataKits = hits.filter(u => u.mode==1).map(
          u => ({
            // created_on
            id: u.objectID,
            pic: u.pic,
            name: u.name,

            country: u.country,
            state: u.state,
            city: u.city,

            groupIndex: u.group,
            type: u.type, // TBD: also in Filters

            description: u.description,
            field: u.categoryName,
            categories: u.tags,
            standout: u.standout,

            price: u.price, // request, currency, mode, type, price[0,1]

            // reviews (Num of reviews)
            // rating (Stars 0-5)
          })
        )
        this.typeNames = ["Lab", "Company"];
        this.missionService.isLoading = false;
        break;
      }
      case 4: { // Trends
        dataKits = hits.map(
          u => ({
            id: u.objectID,
            pic: './assets/img/trends/'+u.category+'.svg',
            name: u.topic,
            link: u.link,
            website: u.clips ? u.clips[0] : null,
            // clips: u.clips,
            categories: u.categories,
            // fields (Sub fields (expandable?))
            description: u.description
          })
        )
        this.missionService.isLoading = false;
        break;
      }
      case 5: { // Podcasts
        dataKits = hits.map(
          u => ({
            id: u.objectID,
            pic: u.pic,
            name: u.name,
            link: u.link,
            type: u.type,
            website: u.website, // Podcast URL
            categories: u.categories,
            // fields
            description: this.addNewlines(u.description),
            release: u.release, // releaseYear
            total: u.total, // num of episodes
            language: u.language, // language
            // latest episode date

            // social impact
            // social info
            // public info

            // guests
            // team
          })
        )
        this.missionService.isLoading = false;
        break;
      }
      case 6: { // Events
        dataKits = hits.map(
          u => ({
            id: u.objectID,
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
            register: u.register,
            language: u.language,
            // price: u.price, // Event Price

            // social impact
            // social info
            // public info

            // organizers
            // speakers
            // sponsors
            // exhibitors
          })
        )
        this.missionService.isLoading = false;
        break;
      }
      case 7: { // Apps
        dataKits = hits.map(
          u => ({
            id: u.objectID,
            pic: u.pic,
            name: u.name,
            link: u.link,
            type: u.type,
            website: u.website, // App URL
            categories: u.categories,
            // fields
            description: u.description,
            release: u.release, // releaseYear
            company: u.company, // companyName

            deal: u.deal

            // customers
            // team

            // social impact
            // social info
            // public info

            // reviews (Num of reviews)
            // rating (Stars 0-5)
          })
        )
        this.missionService.isLoading = false;
        break;
      }
      case 8: { // Quotes
        dataKits = hits.map(
          u => ({
            id: u.objectID,
            pic: u.author.pic,
            name: u.author.name,
            categories: u.tags,
            description: u.quote
          })
        )
        this.missionService.isLoading = false;
        break;
      }
      case 9: { // Papers Kits
        break;
      }
      case 11: { // Mentors
        // Button: Request a call
        dataKits = hits.map(
          u => ({
            id: u.objectID,
            name: u.name,
            pic: u.pic,
            country: u.country, // Current Location (+02:00 UTC) // From (original location)
            groupIndex: (u.positios && u.positions[0]) ? u.positions[0].group : null, // Current Lab
            position: (u.positios && u.positions[0]) ? u.positions[0].titles[0] : null, // Current Role
            start: (u.positios && u.positions[0]) ? u.positions[0].period.start : null,

            description: u.description, // Background
            categories: u.categories, // Skills (+Tooltips)
            languages: u.languages,

            // Times available
            // Days available
            // Price / hour
            // Sessions

            views: u.views,
            currentSize: u.currentSize,
            followedSize: u.followedSize,
            publicationsSize: u.publicationsSize

            // social impact
            // social info
            // public info

            // reviews (Num of reviews)
            // rating (Stars 0-5)
          })
        )
        this.missionService.isLoading = false;
        break;
      }
    }

    this.columnsCodes = ['select'].concat(this.columnsData.map(r=>r.code)).concat('action');

    this.missionService.refinements['search_type'] = [this.searchTypeName];

    this.dataSource = new MatTableDataSource(dataKits);
    this.dataSource.paginator = this.paginator;
    this.dataSource.sort = this.sort;
  }

  ////////////////////////////////////////
  ////////////////// Save ////////////////
  ////////////////////////////////////////

  async saveOp(mode: number, flag: boolean, event) {
    if (this.userService.userId==null || (flag==true && this.userService.planNumber==0 && this.userService.userSearch==1)) {
      this.upgradeMode.emit(2);
    } else {
      this.saveFlag = flag;
    }

    if (mode == 1) {
      this.streamSaveSearch = 3;
      const id: string = await this.peopleService.putSearch(event.title, this.missionService.query, this.missionService.refinements);
      this.userService.userSearch++;
      this.streamSaveSearch = 0;
    }
  }

  /** Whether the number of selected elements matches the total number of rows. */
  isAllSelected() {
    const numSelected = this.selection.selected.length;
    const numRows = this.dataSource.data.length;
    return numSelected === numRows;
  }

  /** Selects all rows if they are not all selected; otherwise clear selection. */
  masterToggle() {
    this.isAllSelected() ?
      this.selection.clear() :
      this.dataSource.data.forEach(row => this.selection.select(row));
    // console.log('this.selection',this.selection)
  }

  /** The label for the checkbox on the passed row */
  checkboxLabel(row?: TableData): string {
    if (!row) {
      return `${this.isAllSelected() ? 'select' : 'deselect'} all`;
    }
    // FIX
    // return `${this.selection.isSelected(row) ? 'deselect' : 'select'} row ${row.position + 1}`;
  }

  ////////////////////////////////////////
  ///////////////// Export ///////////////
  ////////////////////////////////////////

  async exportFunc(mode: number) {
    if (mode==0) {
      if (this.userService.userId==null) {
        this.upgradeMode.emit(3);
      } else {
        this.streamExportSearch = 0;
        switch (this.sourceType) {
          case 0: { // Institutes
            break;
          }
          case 1: { // Labs
            this.CSV_OPTIONS['headers'] = ['Lab Name','Year of establishment','Lab Size','Country','State','City','University','Department','Interests','Peoples','Open Positions','Projects','Services','Contact Email','Website','Address','Phone','Fax','Facebook','Github','Linkedin','Orcid','Pinterest','Instagram','Researchgate','Scholar','Twitter','Youtube'],
            this.CSV_OPTIONS['keys'] = ['name','establish','size','country','state','city','university','department','interests','peoples','jobs','projects','resources','email','website','address','phone','fax','facebook','github','linkedin','orcid','pinterest','instagram','researchgate','scholar','twitter','youtube']
            break;
          }
          case 2: { // Companies
            break;
          }
          case 3: { // Researchers
            break;
          }
          case 4: { // Trends
            break;
          }
          case 5: { // Podcasts
            break;
          }
          case 6: { // Events
            break;
          }
          case 7: { // Apps
            this.CSV_OPTIONS['headers'] = ['App Name','Founded year','Country','State','City','Interests','Peoples','Contact Email','Website','Address','Phone','Fax','Facebook','Linkedin','Pinterest','Instagram','Researchgate','Twitter','Youtube'],
            this.CSV_OPTIONS['keys'] = ['name','establish','country','state','city','interests','peoples','email','website','address','phone','fax','facebook','linkedin','pinterest','instagram','researchgate','twitter','youtube']
            break;
          }
          case 8: { // Quotes
            break;
          }
          // case 10: { // Services
            // break;
          // }
        }
        this.toggleExport.nativeElement.click();
      }
    } else if (mode==1) {
      // console.log('this.missionService.refinements',this.missionService.refinements)
      this.streamExportSearch = 1;
      this.CSV_DATA = await this.peopleService.exportSearch(this.missionService.query, this.missionService.refinements);
      console.log('this.CSV_DATA',this.CSV_DATA)
      if (this.CSV_DATA) {
        this.CSV_DATA.forEach((col, j) => {
          if (col.name=="upgrade" && j==3 && this.userService.planNumber==0) {

            col.name = "Upgrade to Academig Pro to export all the results",
            col.establish = '', col.size = '', col.country = '', col.state = '', col.city = '', col.university = '', col.department = '',
            col.interests = '', col.peoples = '', col.positions = '', col.projects = '', col.resources = '',
            col.email = '', col.website = '', col.address = '', col.phone = '', col.fax = '',
            col.facebook = '', col.github = '', col.linkedin = '', col.orcid = '', col.pinterest = '', col.instagram = '',
            col.researchgate = '', col.scholar = '', col.twitter = '', col.youtube = ''

          } else {

            col.establish = col.establish ? col.establish : '',
            col.size = col.size ? this.groupSize[this.groupSize.findIndex(y => y.id == col.size)].name : '',
            col.country = col.country ? col.country : '',
            col.state = col.state ? col.state : '',
            col.city = col.city ? col.city : '',
            col.university = col.groupIndex ? col.groupIndex.university.name : '',
            col.department = col.groupIndex ? col.groupIndex.department.name : '',
            col.interests = col.interests ? col.interests.join(", ") : '',
            col.peoples = col.peoples ? col.peoples.map(r => r.name).join(", ") : '',
            col.positions = col.positions ? col.positions.map(r => r.positionName + ' - ' + r.title).join(", ") : '',
            col.projects = col.projects ? col.projects.map(r => r.name).join(", ") : '',
            col.resources = col.resources ? col.resources.map(r => r.name).join(", ") : '',

            col.email = col.email ? col.email : '',
            col.website = col.website ? col.website : '',
            col.address = col.address ? col.address : '',
            col.phone = col.phone ? col.phone : '',
            col.fax = col.fax ? col.fax : '',

            col.facebook = col.facebook ? ('https://www.facebook.com/' + col.facebook) : '',
            col.github = col.github ? ('https://www.github.com/' + col.github) : '',
            col.linkedin = col.linkedin ? ('https://www.linkedin.com/in/' + col.linkedin) : '',
            col.orcid = col.orcid ? ('https://www.orcid.org/' + col.orcid) : '',
            col.pinterest = col.pinterest ? ('https://www.pinterest.com/' + col.pinterest) : '',
            col.instagram = col.instagram ? ('https://www.instagram.com/' + col.instagram) : '',
            col.researchgate = col.researchgate ? ('https://www.researchgate.net/profile/' + col.researchgate) : '',
            col.scholar = col.scholar ? ('https://scholar.google.com/citations?user=' + col.scholar) : '',
            col.twitter = col.twitter ? ('https://www.twitter.com/' + col.twitter) : '',
            col.youtube = col.youtube ? ('https://www.youtube.com/' + col.youtube) : ''

          }
        });
        this.streamExportSearch = 2;
      } else {
        this.streamExportSearch = 3;
      }
    }
  }

  ////////////////////////////////////////
  ////////////// Following ///////////////
  ////////////////////////////////////////

  addFollow() {
    if (this.userService.userId==null || (this.userService.planNumber==0 && this.selection.selected.length>5)) {
      this.upgradeMode.emit(1);
    } else {
      this.selection.selected.forEach((select, j) => {
        this.followItem(select.id)
      })
    }
  }

  async followItem(id: string) {
    switch (this.sourceType) {
      case 0: { // Institutes
        this.streamFollow = true;
        await this.peopleService.toggleFollow(4, 0, id, true);
        this.userService.toggleFollow(true, id, "group");
        this.streamFollow = false;
        break;
      }
      case 1: { // Labs
        this.streamFollow = true;
        await this.peopleService.toggleFollow(4, 0, id, true);
        this.userService.toggleFollow(true, id, "group");
        this.streamFollow = false;
        break;
      }
      case 2: { // Companies
        this.streamFollow = true;
        await this.peopleService.toggleFollow(4, 0, id, true);
        this.userService.toggleFollow(true, id, "group");
        this.streamFollow = false;
        break;
      }
      case 3: { // Researchers
        this.streamFollow = true;
        await this.peopleService.toggleFollow(9, 0, id, true);
        this.userService.toggleFollow(true, id, "people");
        this.streamFollow = false;
        break;
      }
      case 4: { // Trends
        break;
      }
      case 5: { // Podcasts
        this.streamFollow = true;
        await this.peopleService.toggleFollow(6, 0, id, true);
        this.userService.toggleFollow(true, id, "podcasts");
        this.streamFollow = false;
        break;
      }
      case 6: { // Events
        this.streamFollow = true;
        // console.log('id',id)
        await this.peopleService.toggleFollow(7, 0, id, true);
        this.userService.toggleFollow(true, id, "events");
        this.streamFollow = false;
        break;
      }
      case 7: { // Apps
        this.streamFollow = true;
        await this.peopleService.toggleFollow(8, 0, id, true);
        this.userService.toggleFollow(true, id, "apps");
        this.streamFollow = false;
        break;
      }
    }
  }

  ////////////////////////////////////////
  //////////////// Compare ///////////////
  ////////////////////////////////////////

  addCompare() {
    let existIndex: number;
    this.selection.selected.forEach((select, j) => {
      existIndex = this.userService.userCompareGroups.findIndex(y => y._id == select.id);
      if (existIndex==-1) this.compareItem(select)
    })
  }

  // async itemCompare(i: number, group: Group) {
  async compareItem(select) {
    if (this.userService.userCompareGroups.length<5) {
      const groupCompare: GroupCompareMini = {
        "_id": select.id,
        "pic": select.pic,
        "groupIndex": select.groupIndex,
        "country": select.country,
        "city": select.city,
      }
      this.userService.userCompareGroups.push(groupCompare);
      if (this.isAuthenticated) {
        await this.peopleService.toggleFollow(12, 0, select.id, true);
      }
    } else {
      this.toggleCompare.nativeElement.click();
    }
    // const itemId: string = group.groupIndex.group._id;
    // const compareFlag: boolean = this.compareStatuses[i];
    // this.streamCompare[i] = 3;
    // this.compareStatuses[i]=!this.compareStatuses[i];
    // this.streamCompare[i] = 0;
    // this.compareFlag = !this.compareFlag;
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
    this.columnsCodes = ['select'].concat(this.columnsData.map(r=>r.code)).concat('action');
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
    this.columnsCodes = ['select'].concat(this.columnsData.map(r=>r.code)).concat('action');
  }

  ////////////////////////////////////////
  ///////////// Columns Modal ////////////
  ////////////////////////////////////////

  // onNameSelection(e, v){
  //  this.current_selected = e.option.value;
  // }

  columnsOp() {
    let index: number;
    this.columnsModalData = this.columnsData;
    this.columnsModalSelect.forEach((column, j) => {
      index = this.columnsModalData.findIndex(y => y.name==column.name);
      column.selected = (index>-1) ? true : false;
    })
    // this.newColumns.deselectAll();
    this.toggleColumns.nativeElement.click();
  }

  onColumnRemove(i: number, name: string) {
    const targetIndex = this.columnsModalData.findIndex(y => y.name==name);
    this.columnsModalSelect[targetIndex].selected = false;
    this.columnsModalData.splice(i,1);
    // const summerFruitsCopy = this.columnsModalData.map(y => y.name===name ? {...summerFruits, ...fruit} : fruitItem );
  }

  onColumnsSelected(event) {
    this.columnsSelected = [];
    let index: number;

    event.source._value.forEach((column, j) => {
      index = this.columnsModalData.findIndex(y => y.name==column.name);
      if (index==-1) this.columnsSelected.push({"name": column.name, "code": column.code});
    })

    if (event.option._value.selected==true) {
      const indexData: number = this.columnsModalData.findIndex(y => y.name==event.option._value.name);
      this.columnsModalData.splice(indexData,1);
      const indexSelect: number = this.columnsModalSelect.findIndex(y => y.name==event.option._value.name);
      this.columnsModalSelect[indexSelect].selected = false;
    }
  }

  updateColumns(newNames) {
    // this.columnsData = this.columnsModalData.concat(newNames.selectedOptions.selected.map(r=>r.value));
    this.columnsData = this.columnsModalData.concat(this.columnsSelected);
    this.columnsCodes = ['select'].concat(this.columnsData.map(r=>r.code)).concat('action');
    this.toggleColumns.nativeElement.click();
  }

  drop(event: CdkDragDrop<string[]>) {
    // console.log('event',event)
    moveItemInArray(this.columnsData, event.previousIndex, event.currentIndex);
  }

  ////////////////////////////////////////
  /////////////// Insights ///////////////
  ////////////////////////////////////////


  ////////////////////////////////////////
  /////////////// Upgrade ////////////////
  ////////////////////////////////////////

  signUpFunc() {
    if (this.userService.userId) { // && this.userService.planNumber==0
      this.planUpdate();
    } else {
      this.login();
    }
  }

  upgragePagination() {
    this.upgradeMode.emit(5);
  }

  async planUpdate() {
    const mode: number = 0; // User / Lab / Company / Department
    const type: number = 1; // Free / PRO / PRO+
    const period: number = 0; // Monthly / Yearly

    this.streamSubscribe = 3;
    const plan = await this.settingsService.postStripeSubscribe(mode, period, type, null, null);
    // console.log('plan',plan)

    stripe.redirectToCheckout({
      sessionId: plan.id
    }).then(function (result) {
      // console.log('result1',result)
      this.streamSubscribe = 0;
    });
    // this.togglePricingInfo.nativeElement.click();
  }

  async login() {
    await this.auth0Client.loginWithRedirect({
      redirect_uri: `${window.location.origin}/callback`,
      // appState: { target: this.router.url }
    });
  }

}
