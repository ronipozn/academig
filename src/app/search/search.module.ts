import {NgModule}                               from '@angular/core';
import {CommonModule}                           from '@angular/common';
import {RouterModule}                           from '@angular/router';
import {FormsModule, ReactiveFormsModule}       from '@angular/forms';

import {NgAisModule}                            from 'angular-instantsearch';
import {AgmCoreModule}                          from '@agm/core';
import {Angular2CsvModule}                      from 'angular2-csv';
import {NouisliderModule}                       from 'ng2-nouislider';
// import {NgbModule}                              from '@ng-bootstrap/ng-bootstrap';
import {JoyrideModule}                          from 'ngx-joyride';

import {SearchComponent}                        from './search.component';

import {SearchMaterialComponent}                from './search-panel/search.component';
import {SearchHighlightsComponent}              from './search-highlights/highlights.component';

import {SearchPublicationsComponent}            from './search-publications/search-publications.component';

import {SearchSaveComponent}                    from './search-save/search-save.component';
import {SearchSavedComponent}                   from './search-saved/search-saved.component';

import {SearchTableComponent}                   from './search-table/search-table.component';
import {SearchFiltersComponent}                 from './search-filters/search-filters.component';

import {RefinementListComponent}                from './search-misc/refinementList.component';
import {FinetuneListComponent}                  from './search-misc/finetuneList.component';
import {CurrentRefinements}                     from './search-misc/currentRefinements.component';

import {SearchBoxComponent}                     from "./search-misc/searchBox.component";
import {ClearRefinementsComponent}              from "./search-misc/refinementClear.component";
import {RangeSliderComponent}                   from "./search-misc/rangeSlider.component";
import {NumericMenuComponent}                   from "./search-misc/numericMenu.component";
import {GeoSearchComponent}                     from "./search-misc/geo-search.component";
import {SortByComponent}                        from "./search-misc/sort-by.component";
import {StatsComponent}                         from "./search-misc/stats.component";
import {PaginationComponent}                    from "./search-misc/pagination.component";
import {LoadingIndicator}                       from "./search-misc/loading.component";

import {CustomAngular2csvComponent}             from "./search-misc/angular2csv.component";

import {FooterModule}                           from '../footer/footer.module';
import {SharedModule}                           from '../shared/shared.module';
import {MaterialModule}                         from '../app.module';
import {PipesModule}                            from '../pipes/pipes.module';
import {LabsizePipe}                            from './labsize.pipe';

import {MissionService}                         from './services/mission-service';

@NgModule({
    imports: [
        CommonModule,
        FormsModule,
        SharedModule,
        FooterModule,
        MaterialModule,
        PipesModule,

        NgAisModule.forRoot(),
        // NgbModule,
        JoyrideModule.forRoot(),
        Angular2CsvModule,
        NouisliderModule,
        AgmCoreModule.forRoot({apiKey: 'AIzaSyADPfY982ZEO3u3qptwAYFgXP8IJRoiqIE'}),
        ReactiveFormsModule,
        RouterModule.forChild([
          {path: '',                                  component: SearchComponent,
            children: [
              {
                path: '',
                redirectTo: 'labs',
                pathMatch: 'prefix'
              },

              {path: 'institutes',                    component: SearchMaterialComponent},
              {path: 'labs',                          component: SearchMaterialComponent},
              {path: 'companies',                     component: SearchMaterialComponent},
              {path: 'researchers',                   component: SearchMaterialComponent},

              {path: 'services',                      component: SearchMaterialComponent},
              {path: 'mentors',                       component: SearchMaterialComponent},

              {path: 'trends',                        component: SearchMaterialComponent},
              {path: 'podcasts',                      component: SearchMaterialComponent},
              {path: 'events',                        component: SearchMaterialComponent},
              {path: 'apps',                          component: SearchMaterialComponent},
              {path: 'quotes',                        component: SearchMaterialComponent},
              // media, books

              {path: 'papers-kits',                   loadChildren: () => import('./search-kits/kits.module').then(m => m.PapersKitsMainModule)},

              {path: 'saved',                         component: SearchSavedComponent},
            ]
          },
          // { path: ":category",                        component: SearchMaterialComponent },

        ]
        // { enableTracing: true }
      )
    ],
    declarations: [SearchComponent,

                   SearchPublicationsComponent,

                   SearchMaterialComponent,
                   SearchHighlightsComponent,

                   SearchFiltersComponent,
                   SearchTableComponent,
                   SearchSaveComponent,
                   SearchSavedComponent,
                   CustomAngular2csvComponent,

                   RefinementListComponent,
                   FinetuneListComponent,
                   CurrentRefinements,

                   SearchBoxComponent,
                   ClearRefinementsComponent,
                   RangeSliderComponent,
                   NumericMenuComponent,
                   GeoSearchComponent,
                   SortByComponent,
                   StatsComponent,
                   PaginationComponent,
                   LoadingIndicator,

                   LabsizePipe],
    providers:    [MissionService],
})
export class SearchMainModule { }
