import {Component} from '@angular/core';
import {Router, ActivatedRoute} from '@angular/router';

import {MissionService} from './services/mission-service';
import {UserService} from '../user/services/user-service';

import {ThemePalette} from '@angular/material/core';

import {JoyrideService} from 'ngx-joyride';

@Component({
    selector: 'search',
    templateUrl: 'search.html',
    styleUrls: ['./search.css']
})
export class SearchComponent {
  navLinks: any[];
  background: ThemePalette = undefined;

  constructor(public missionService: MissionService,
              private userService: UserService,
              private route: ActivatedRoute,
              private router: Router,
              private readonly joyrideService: JoyrideService) {
    this.navLinks = [
      {
          label: 'Institutes', // departments
          link: './institutes',
          icon: 'account_balance'
      }, {
          label: 'Labs',
          link: './labs',
          icon: 'supervised_user_circle'
      }, {
          label: 'Companies',
          link: './companies',
          icon: 'business'
      }, {
          label: 'Researchers',
          link: './researchers',
          icon: 'face'
      // }, {
      //     label: 'Mentors',
      //     link: 'mentors',
      //     icon: 'hearing'
      }, {
          label: 'Services',
          link: './services',
          icon: 'construction'
      }, {
          label: 'Trends',
          link: './trends',
          icon: 'trending_up'
      }, {
          label: 'Podcasts',
          link: './podcasts',
          icon: 'graphic_eq'
      }, {
          label: 'Events',
          link: './events',
          icon: 'event'
      }, {
          label: 'Apps',
          link: './apps',
          icon: 'computer'
      }, {
          label: 'Quotes',
          link: './quotes',
          icon: 'format_quote'
      }, {
          label: 'Papers Kits',
          link: './papers-kits',
          icon: 'bookmark'
      }
    ];

    this.missionService.activeLink = this.navLinks[0].label;
  }

  ngOnInit() {
    this.missionService.activeLink = './' + this.getUrlWithoutParams().split('/').pop();

    // this.joyrideService.startTour(
    //   { steps: ['saveStep', 'exportStep']}
    // );
    // setTimeout(() => {
    //   try {
    //     this.viewportScroller.scrollToPosition([0, 0]);
    //     // this.scrollAdd.nativeElement.scrollIntoView({ behavior: "smooth", block: "center" });
    //   } catch (e) { }
    // }, 1);

    // this.route.params.subscribe(params => {
      // this.route.queryParams.subscribe(queryParams => {
        // this.missionService.refinements = this.userService.searchRefinements;
      // });
    // });
  }

  getUrlWithoutParams(){
    let urlTree = this.router.parseUrl(this.router.url);
    urlTree.queryParams = {};
    return urlTree.toString();
  }

  titleCase(str) {
    if (!str) return null
     var splitStr = str.toLowerCase().split('_');
     for (var i = 0; i < splitStr.length; i++) {
       // You do not need to check if i is larger than splitStr length,
       // as your for does that for you. Assign it back to the array
       splitStr[i] = splitStr[i].charAt(0).toUpperCase() + splitStr[i].substring(1);
     }
     return splitStr.join(' ');
  }

  navRoute(link: string) {
    this.resetRefinements();
    this.missionService.activeLink = link;
    this.missionService.jobFilters = 0;
    this.missionService.isLoading = true;
    this.router.navigate([link], { relativeTo: this.route });
  }

  ngOnDestroy() {
    this.joyrideService.closeTour();
    this.resetRefinements();
  }

  resetRefinements() {
    this.userService.searchRefinements = {
      search_type: [],
      type: [],
      countries: [],
      states: [],
      cities: [],
      universities: [],
      disciplines: [],
      interests: [],
      positions: [],
      size: [],
      head: [],
      types: [],
      languages: [],
      categories: [],
      establish: null,
      times: null,
      shanghai: null,
      top: null,
      usnews: null,
      facebook: null,
      twitter: null,
      linkedin: null,
      instagram: null,
      youtube: null
    }
    this.missionService.jobFilters = 0;
    this.userService.searchText=null;
    // this.userService.searchType=0;
    this.missionService.refinements = this.userService.searchRefinements;
    this.missionService.totalRefinements = [0,0,0,0,0,0,0,0];
  }

}
