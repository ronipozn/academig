import {NgModule}                               from '@angular/core';
import {CommonModule}                           from '@angular/common';
import {RouterModule}                           from '@angular/router';
import {FormsModule, ReactiveFormsModule}       from '@angular/forms';

import {AdminComponent}                         from './admin.component';

import {AnalyticsComponent}                     from './analytics/analytics.component';

import {AlgoliaComponent}                       from './general/algolia/algolia.component';
import {LoggingComponent}                       from './general/logging/logging.component';
import {ContactsComponent}                      from './general/contacts/contacts.component';
import {ReportsComponent}                       from './general/reports/reports.component';
import {ReportBuildComponent}                   from './general/reports/build/build.component';

import {PeoplesComponent}                       from './peoples/peoples/peoples.component';
import {MentorsComponent}                       from './peoples/mentors/mentors.component';
import {DataRequestComponent}                   from './peoples/data/data.component';

import {PositionsComponent}                     from './positions/positions.component';
import {PositionItemComponent}                  from './positions/item/item.component';
import {PositionStatsBuildComponent}            from './positions/item/build-stats/build.component';

import {PublicationsComponent}                  from './publications/publications/publications.component';
import {PublicationsAutomationComponent}        from './publications/automation/automation.component';
import {PublicationsClaimsComponent}            from './publications/claims/claims.component';

import {GroupsComponent}                        from './groups/groups/groups.component';
import {BuildLabComponent}                      from './groups/groups/build/build.component';
import {ChangeLabComponent}                     from './groups/groups/change/change.component';
import {GroupsComponentContest}                 from './groups/groups_contest/groups.component';
import {BuildLabContestComponent}               from './groups/groups_contest/build/build.component';

import {UniversitiesComponent}                  from './universities/universities/universities.component';
import {UniversitiesQueryComponent}             from './universities/universities_query/universities.component';
import {UniversityBuildComponent}               from './universities/universities_query/build/build.component';
import {UniversityAutomationComponent}          from './universities/automation/automation.component';

import {ItemsDealsComponent}                    from './items/deals/deals.component';
import {ItemsSubmitsComponent}                  from './items/submits/submits.component';
import {ItemsUploadsComponent}                  from './items/uploads/uploads.component';

import {SharedModule}                           from '../shared/shared.module';
import {ChartsModule}                           from 'ng2-charts';
import {MaterialModule}                         from '../app.module';
import {PipesModule}                            from '../pipes/pipes.module';;
import {NgAisModule}                            from 'angular-instantsearch';

@NgModule({
    imports: [
        CommonModule,
        FormsModule,
        ReactiveFormsModule,
        MaterialModule,
        SharedModule,
        ChartsModule,
        PipesModule,
        NgAisModule.forRoot(),
        RouterModule.forChild([
            {path: '',                                  component: AdminComponent,
              children: [
                {path: '',                              redirectTo: 'analytics', pathMatch: 'full'},
                {path: 'analytics',                     component: AnalyticsComponent},
                {path: 'algolia',                       component: AlgoliaComponent},
                {path: 'logging',                       component: LoggingComponent},

                {path: 'people',                        component: PeoplesComponent},
                {path: 'mentors',                       component: MentorsComponent},
                {path: 'reports',                       component: ReportsComponent},
                {path: 'contacts',                      component: ContactsComponent},
                {path: 'data-request',                  component: DataRequestComponent},

                {path: 'labs',                          component: GroupsComponent},
                {path: 'labs-contest',                  component: GroupsComponentContest},

                {path: 'positions',                     component: PositionsComponent},
                {path: 'positions/:positionId',         component: PositionItemComponent},

                {path: 'publications',                  component: PublicationsComponent},
                {path: 'publications-automation',       component: PublicationsAutomationComponent},
                {path: 'publications-claims',           component: PublicationsClaimsComponent},

                {path: 'universities',                  component: UniversitiesComponent},
                {path: 'universities-query',            component: UniversitiesQueryComponent},
                {path: 'universities-csv',              component: UniversityAutomationComponent},

                {path: 'item-deals'  ,                  component: ItemsDealsComponent},
                {path: 'item-submits',                  component: ItemsSubmitsComponent},
                {path: 'item-uploads',                  component: ItemsUploadsComponent}
            ]}
        ]),
    ],
    declarations: [AdminComponent,

                   AnalyticsComponent,
                   AlgoliaComponent,
                   LoggingComponent,
                   ReportsComponent,
                   ReportBuildComponent,

                   PeoplesComponent,
                   ContactsComponent,
                   DataRequestComponent,

                   GroupsComponent,
                   ChangeLabComponent,
                   BuildLabComponent,

                   GroupsComponentContest,
                   BuildLabContestComponent,

                   PositionsComponent,
                   PositionItemComponent,
                   PositionStatsBuildComponent,

                   PublicationsComponent,
                   PublicationsAutomationComponent,
                   PublicationsClaimsComponent,

                   UniversitiesComponent,
                   UniversitiesQueryComponent,
                   UniversityBuildComponent,
                   UniversityAutomationComponent,

                   ItemsDealsComponent,
                   ItemsSubmitsComponent,
                   ItemsUploadsComponent,

                   MentorsComponent,
                  ],
    providers:    [
    ],
})
export class AdminModule { }
