import {Component, Input, OnInit, HostListener, ViewChild, ElementRef} from '@angular/core';
import {Title} from '@angular/platform-browser';
import {Router, ActivatedRoute} from '@angular/router';

import {MissionService} from '../services/mission-service';
import {UserService} from '../../user/services/user-service';
import {SettingsService} from '../../shared/services/settings-service';
import {AuthService} from '../../auth/auth.service';

import algoliasearch from 'algoliasearch/lite';

const searchClient = algoliasearch(
  'TDKUK8VW4T',
  '73303e9badf36767a06c37395b6a3693'
);

import {environment} from '../../../environments/environment';
// import { MetaService } from '../shared/services/meta-service';

// search/search.component.ts
import { history as historyRouter } from 'instantsearch.js/es/lib/routers';

// Returns a slug from the category name.
// Spaces are replaced by "+" to make
// the URL easier to read and other
// characters are encoded.
function getCategorySlug(name) {
  return name
    .split(" ")
    .map(encodeURIComponent)
    .join("+");
}

// Returns a name from the category slug.
// The "+" are replaced by spaces and other
// characters are decoded.
function getCategoryName(slug) {
  return slug
    .split("+")
    .map(decodeURIComponent)
    .join(" ");
}

export interface QueryParameters {
  // query: string;
  page: number
  brands: string[];
  countries: string[];
  universities: string[];
  types: string[];
}

export interface Collection {
  title: string;
  link: string;
  description: string;
}

const CollectionsData: Collection[] = [
  {title: 'Freebies', link: null, description: "The best things in life are free."},
  {title: 'What’s Hot', link: null, description: "Deals everyone's talking about"},
  {title: 'Open Source', link: null, description: "Your one stop for Academic Open Source."},
  {title: 'Remote Tools', link: null, description: "The tools for academic remote work."},
];

@Component({
  selector: 'search',
  templateUrl: 'search.html',
  styleUrls: ['search.css']
})
export class SearchMaterialComponent implements OnInit {
  isMobile: boolean;
  expandTableFlag: boolean;
  expandFiltersFlag: boolean;

  adminFlag: boolean = false;

  collections: Collection[];

  // URL:
  // https://stackoverflow.com/questions/5817505/is-there-any-method-to-get-the-url-without-query-string
  // https://www.algolia.com/doc/guides/building-search-ui/going-further/routing-urls/angular/#basic-urls
  // https://codesandbox.io/s/staging-water-rqpig?file=/src/app/search/search.component.html:95-148

  // SSR:
  // https://www.algolia.com/doc/guides/building-search-ui/going-further/server-side-rendering/angular/

  config_search = {
    indexName: null,
    // searchClient: algoliasearch('TDKUK8VW4T', '73303e9badf36767a06c37395b6a3693'),
    searchClient,
    routing: {
      router: historyRouter({
        windowTitle({ category, query }) {
          const queryTitle = query ? `Results for "${query}"` : 'Search';
          if (category) return `${category} – ${queryTitle}`;
          return queryTitle;
        },

        // createURL({ qsModule, routeState }) {
        //   console.log('routeState',routeState)
        //   const categoryPath = routeState.category ? `${getCategorySlug(routeState.category)}/` : "";
        //   const queryParameters = {} as any;
        //
        //   if (routeState.query) queryParameters.query = encodeURIComponent(routeState.query);
        //   if (routeState.page !== 1) queryParameters.page = routeState.page;
        //   if (routeState.brands) queryParameters.brands = routeState.brands.map(encodeURIComponent);
        //   if (routeState.countries) queryParameters.countries = routeState.countries.map(encodeURIComponent);
        //   if (routeState.universities) queryParameters.universities = routeState.universities.map(encodeURIComponent);
        //   if (routeState.types) queryParameters.types = routeState.types.map(encodeURIComponent);
        //
        //   const queryString = qsModule.stringify(queryParameters, {
        //     addQueryPrefix: true,
        //     arrayFormat: "repeat"
        //   });
        //
        //   return `/search/${categoryPath}${queryString}`;
        // },

        createURL({ qsModule, routeState, location }) {
          // const urlParts = location.href.match(/^(.*?)\/search/);
          const urlParts = location.href.split('?')[0]
          const baseUrl = `${urlParts ? urlParts[1] : ''}/`;

          // const categoryPath = routeState.category ? `${getCategorySlug(routeState.category)}/` : '';
          // const queryParameters = {};
          // console.log('categoryPath',categoryPath)

          let queryParameters: QueryParameters = {
            // query: null,
            page: null,
            brands: [],
            countries: [],
            universities: [],
            types: []
          };
          // console.log('queryParameters',queryParameters)

          // if (routeState.query) queryParameters.query = encodeURIComponent(routeState.query);
          if (routeState.page !== 1) queryParameters.page = routeState.page;
          if (routeState.brands) queryParameters.brands = routeState.brands.map(encodeURIComponent);
          if (routeState.countries) queryParameters.countries = routeState.countries.map(encodeURIComponent);
          if (routeState.universities) queryParameters.universities = routeState.universities.map(encodeURIComponent);
          if (routeState.types) queryParameters.types = routeState.types.map(encodeURIComponent);

          const queryString = qsModule.stringify(queryParameters, {
            addQueryPrefix: true,
            arrayFormat: 'repeat'
          });

          // console.log('routeState',routeState)
          // console.log('queryString',queryString)

          // return `${baseUrl}search/${categoryPath}${queryString}`;
          return `${urlParts}${queryString}`;
        },

        // parseURL: () => {
        //   const { params, queryParams } = this.route.snapshot;
        //   // console.log('this.route.snapshot',this.route.snapshot.routeConfig.path)
        //   // console.log('this.router',this.router.url)
        //   const category = getCategoryName(
        //     decodeURIComponent(params.category || "")
        //   );
        //   // console.log('caaa',category)
        //   const { query = "", page, brands = [], countries = [], universities = [], types = [] } = queryParams;
        //   // brands is not an array when there's a single value.
        //   const allBrands = [].concat(brands);
        //   const allCountries = [].concat(countries);
        //   const allUniversities = [].concat(universities);
        //   const allTypes = [].concat(types);
        //
        //   return {
        //     query: decodeURIComponent(query),
        //     page,
        //     brands: allBrands.map(decodeURIComponent),
        //     countries: allCountries.map(decodeURIComponent),
        //     universities: allUniversities.map(decodeURIComponent),
        //     types: allUniversities.map(decodeURIComponent),
        //     category
        //   };
        // }

        parseURL({ qsModule, location }) {
          const pathnameMatches = location.pathname.match(/search\/(.*?)\/?$/);
          // console.log('pathnameMatches',pathnameMatches)
          const category = getCategoryName(
            decodeURIComponent((pathnameMatches && pathnameMatches[1]) || '')
          );
          const { query = '', page, brands = [], countries = [], universities = [], types = [] } = qsModule.parse(
            location.search.slice(1)
          );
          // `qs` does not return an array when there's a single value.
          const allBrands = Array.isArray(brands) ? brands : [brands].filter(Boolean);
          const allCountries = Array.isArray(countries) ? countries : [countries].filter(Boolean);
          const allUniversities = Array.isArray(universities) ? universities : [universities].filter(Boolean);
          const allTypes = Array.isArray(types) ? types : [types].filter(Boolean);

          // console.log("parseURL_category",category)
          // console.log("page",page)

          return {
            // query: decodeURIComponent(query),
            page,
            brands: allBrands.map(decodeURIComponent),
            countries: allCountries.map(decodeURIComponent),
            universities: allUniversities.map(decodeURIComponent),
            types: allUniversities.map(decodeURIComponent),
            category
          };
        }
      }),

      stateMapping: {
        stateToRoute(uiState) {
          // console.log('uiState',uiState)
          // console.log('uiState',that.expandTableFlag)
          return {
            // query: uiState.query,
            page: uiState.page,
            brands: uiState.refinementList && uiState.refinementList.brand,
            countries: uiState.refinementList && uiState.refinementList.country,
            universities: uiState.refinementList && uiState.refinementList["positions.group.university.name"],
            types: uiState.refinementList && uiState.refinementList.type,
            // category: uiState.menu && uiState.menu.categories
            // category: "labs"
          };
        },

        routeToState(routeState) {
          // console.log('routeState22222',routeState)
          return {
            // query: routeState.query,
            page: routeState.page,
            menu: {
              categories: routeState.category
            },
            refinementList: {
              brand: routeState.brands,
              country: routeState.countries,
              university: routeState.universities,
              type: routeState.types
            }
          };
        }
      }
    }
  };

  sourceType: number;
  searchTypeName: string;
  sourceIconName: string;

  streamSubscribe: number;

  upgradeMode: number; // 0 - search filters
                       // 1 - following (personalized alerts)
                       // 2 - save search
                       // 3 - export search
                       // 4 - statistics
                       // 5 - pagination

  upgradeTitle: string[] = [
    'Unlock search filters',
    'Follow new labs',
    'Save your search',
    'Export your search results',
    'Apply statistics',
    'Unlock all search results'
  ];

  upgradePics: string[] = [
    'search',
    'following',
    'save',
    'export',
    'statistics',
    'statistics'
  ];

  @ViewChild('toggleUpgradeModal', { static: true }) toggleUpgrade: ElementRef;
  @ViewChild('toggleSignUpModal', { static: true }) toggleSignUp: ElementRef;

  constructor(private titleService: Title,
              private settingsService: SettingsService,
              public missionService: MissionService,
              public userService: UserService,
              private router: Router,
              private route: ActivatedRoute,
              private authService: AuthService,
              // private metaService: MetaService,
             ) {
    this.isMobile = (window.innerWidth < 992);
  }

  @HostListener('window:resize', ['$event'])
  onResize(event) {
    this.isMobile = (window.innerWidth < 992);
  }

  ngOnInit() {
    this.authService.token.subscribe(token => {
      this.adminFlag = this.authService.userHasScopes(token, ['write:departments']);
    });

    this.collections = [
      {title: 'Freebies', link: null, description: "The best things in life are free."},
      {title: 'What’s Hot', link: null, description: "Deals everyone's talking about"},
      {title: 'Open Source', link: null, description: "Your one stop for Academic Open Source."},
      {title: 'Remote Tools', link: null, description: "The tools for academic remote work."},
    ];

    this.searchTypeName = this.getUrlWithoutParams().split('/').pop();
    this.titleService.setTitle('Academic ' + this.capitalizeOp(this.searchTypeName) + ' | Academig');
    // this.metaService.addMetaTags('Academig', 'academia, resarch labs, phd, msc, post-doc, departments, universities', null);

    switch (this.searchTypeName) {
      case "institutes": this.sourceType=0; this.sourceIconName= 'supervised_user_circle'; this.config_search.indexName = environment.algolia.institutes; break;
      case "labs": this.sourceType=1; this.sourceIconName= 'supervised_user_circle'; this.config_search.indexName =  'labs'; break; // environment.algolia.labs
      case "companies": this.sourceType=2; this.sourceIconName= 'business'; this.config_search.indexName = 'companies'; break;
      case "researchers": this.sourceType=3; this.sourceIconName= 'face'; this.config_search.indexName = environment.algolia.researchers; break;
      case "trends": this.sourceType=4; this.sourceIconName= 'trending_up'; this.config_search.indexName = environment.algolia.trends; break;
      case "services": this.sourceType=10; this.sourceIconName= 'construction'; this.config_search.indexName = environment.algolia.services; break;
      case "podcasts": this.sourceType=5; this.sourceIconName= 'graphic_eq'; this.config_search.indexName = environment.algolia.podcasts; break;
      case "events": this.sourceType=6; this.sourceIconName= 'event'; this.config_search.indexName = environment.algolia.events; break;
      case "apps": this.sourceType=7; this.sourceIconName= 'computer'; this.config_search.indexName = environment.algolia.apps; break;
      case "quotes": this.sourceType=8; this.sourceIconName= 'format_quote'; this.config_search.indexName = environment.algolia.quotes; break;
      case "papers-kits": this.sourceType=9; this.sourceIconName= 'bookmark'; this.config_search.indexName = 'papers-kits'; break;
      case "mentors": this.sourceType=11; this.sourceIconName= 'hearing'; this.config_search.indexName = environment.algolia.mentors; break;
      case "": this.sourceType=1; this.sourceIconName= 'supervised_user_circle'; this.config_search.indexName =  environment.algolia.labs; break;
      // case "publications": this.sourceType=10; this.sourceIconName= 'article'; this.config_search.indexName = 'publications'; break;
    }
  }

  getUrlWithoutParams(){
    let urlTree = this.router.parseUrl(this.router.url);
    urlTree.queryParams = {};
    return urlTree.toString();
  }

  capitalizeOp(string) {
    return string.charAt(0).toUpperCase() + string.slice(1);
  }

  upgradeModeOp(mode: number) {
    this.upgradeMode = mode;
    if (this.userService.userId==null) {
      this.toggleSignUp.nativeElement.click();
    } else {
      this.toggleUpgrade.nativeElement.click();
    }
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
      // console.log('planUpdate',result)
      this.streamSubscribe = 0;
    });
    // this.togglePricingInfo.nativeElement.click();
  }

}
