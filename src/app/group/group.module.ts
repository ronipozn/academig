import {NgModule}     from '@angular/core';
import {CommonModule} from '@angular/common';
import {RouterModule} from '@angular/router';
import {FormsModule, ReactiveFormsModule} from '@angular/forms';

import {GroupComponent} from './group.component';

import {GroupNavbarComponent} from './navbar/navbar';
import {GroupLinksBarComponent} from './linksbar/linksbar';

import {GroupBuildProgressComponent} from './build/progress/progress';
import {GroupBuildAlertsComponent} from './build/build-alerts/build-alerts';
import {GroupWelcomeModalComponent} from './build/welcome-modal/welcome-modal';

// import {WebSocketComponent} from "./websocket-observable-service-subscriber";

import {GroupHomeComponent} from './home/home/home';
import {GroupSidebarComponent} from './home/sidebar/sidebar.component';

import {GroupPeopleComponent} from './people/home/home';
import {GroupPeopleBuildComponent} from './people/build/build.component';
import {GroupPeoplePositionsBuildComponent} from './people/build/build-positions/build-positions';
import {GroupPeopleAnalyticsComponent} from './people/analytics/analytics';

import {GroupPublicationsComponent} from './publications/home/home';
import {GroupPublicationDetailsComponent} from './publications/publication-details/publication-details';

import {GroupMediaComponent} from './media/home/home';

import {GroupResourcesComponent} from './resources/home/home';
import {GroupResourceDetailsComponent} from './resources/resource-details/resource-details';

import {GroupResearchComponent} from './research/home/home';
import {GroupResearchBuildComponent} from './research/build/build.component';

import {GroupProjectsComponent} from './projects/home/home';
import {GroupProjectDetailsComponent} from './projects/project-details/project-details';

import {GroupFundingsComponent} from './fundings/home/home';

import {GroupCollaborationsComponent} from './collaborations/home/home';
import {GroupCollaborationBuildComponent} from './collaborations/build/build.component';
import {GroupCollaborationsSponsorsComponent} from './collaborations/sponsors/sponsors';
import {GroupCollaborationsSponsorBuildComponent} from './collaborations/sponsor-build/build.component';

import {GroupPositionsComponent} from './positions/home/home';
import {GroupPositionDetailsComponent} from './positions/position-details/position-details';

import {GroupSeminarsComponent} from './seminars/seminars.component';

import {GroupPapersKitComponent} from './papers-kit/kit.component';

import {GroupOutreachComponent} from './outreach/home/home';

import {GroupTeachingComponent} from './teaching/home/home';

import {GroupEventsComponent} from './events/events';

import {GroupGalleryComponent} from './gallery/home/home';
import {GroupGalleryDetailsComponent} from './gallery/gallery-details/gallery-details';

import {GroupFAQComponent} from './faq/home/home';

import {GroupContactComponent} from './contact/home/home';

import {GroupAIComponent} from './ai/ai';
import {GroupAIListComponent} from './ai/list/list';

import {GroupNetworkComponent} from './network/network';

import {GroupNewsComponent} from './news/news';

import {MissionService} from './services/mission-service';
import {DatePipe} from '@angular/common';

import {_404Component} from './404';

////////////////////////////////////////////////
/////////////////// MODULES ////////////////////
////////////////////////////////////////////////

import {TagInputModule} from 'ngx-chips';
import {NgbModule} from '@ng-bootstrap/ng-bootstrap';
import {ShareButtonsModule} from '@ngx-share/buttons';
import {NgxTwitterTimelineModule} from 'ngx-twitter-timeline';
import {AgmCoreModule} from '@agm/core';
import {MaterialModule} from '../app.module';
import {NgxGalleryModule} from 'ngx-gallery';
import {JoyrideModule} from 'ngx-joyride';

import {PipesModule} from '../pipes/pipes.module';;
import {UserModule} from '../user/user.module';
import {SharedModule} from '../shared/shared.module';
import {PrivateModule} from '../private/private.module';

import {LabGuardService as LabGuard} from './lab-guard.service';

// import {DragulaModule} from 'ng2-dragula';
// import {ClickOutsideModule} from 'ng-click-outside';
// import {ZeronizePipe} from '../pipes/zeronize.pipe';

@NgModule({
    imports: [
        CommonModule,
        FormsModule,
        ReactiveFormsModule,
        MaterialModule,

        UserModule,
        SharedModule,
        PrivateModule,
        PipesModule,

        JoyrideModule.forRoot(),
        AgmCoreModule.forRoot({apiKey: 'AIzaSyADPfY982ZEO3u3qptwAYFgXP8IJRoiqIE'}),
        TagInputModule,
        ShareButtonsModule,
        NgbModule,
        NgxTwitterTimelineModule,
        NgxGalleryModule,

        // DragulaModule,
        // ClickOutsideModule,

        RouterModule.forChild([
          {path: '', component: GroupComponent,
            children: [

              // {path: '',                              redirectTo: 'home', pathMatch: 'full'},
              {path: '',                              component: GroupHomeComponent},
              {path: 'summary',                       component: GroupHomeComponent},

              {path: 'suggestions',                   component: GroupAIComponent},

              {path: 'network',                       component: GroupNetworkComponent},

              {path: 'news',                          component: GroupNewsComponent},

              {path: 'people',                        component: GroupPeopleComponent},
              {path: 'tools',                         loadChildren: () => import('./private/private.module').then(m => m.PrivateModuleGroup), canActivate: [LabGuard]},

              {path: 'publications',                  component: GroupPublicationsComponent},
              {path: 'publications/:publicationId',   component: GroupPublicationDetailsComponent, runGuardsAndResolvers: 'paramsChange'},

              {path: 'services',                      component: GroupResourcesComponent},
              {path: 'services/:resourceId/manage',   loadChildren: () => import('../manage/requests/requests.module').then(m => m.RequestsMainModule), runGuardsAndResolvers: 'paramsChange'},
              {path: 'services/:resourceId',          component: GroupResourceDetailsComponent, runGuardsAndResolvers: 'paramsChange'},
              {path: 'services/:resourceId/publications/:publicationId', component: GroupPublicationDetailsComponent, runGuardsAndResolvers: 'paramsChange'},
              // {path: 'services/:resourceId',          component: GroupResourceDetailsComponent, runGuardsAndResolvers: 'paramsChange',
                // children: [
                  // {path: 'manage',                      loadChildren: '../requests/requests.module#RequestsMainModule', runGuardsAndResolvers: 'paramsChange'},
                  // {path: 'publications/:publicationId', component: GroupPublicationDetailsComponent, runGuardsAndResolvers: 'paramsChange'},
                // ]
              // },

              {
                path: 'post-service',
                loadChildren: () => import('../build/service/build.module').then(m => m.ServiceBuildModule),
              },

              {path: 'research-topics',               component: GroupResearchComponent},
              {path: 'research/:topicId',             component: GroupProjectsComponent},
              {path: 'research/:topicId/:projectId',  component: GroupProjectDetailsComponent, runGuardsAndResolvers: 'paramsChange'},
              {path: 'research/:topicId/:projectId/publications/:publicationId', component: GroupPublicationDetailsComponent, runGuardsAndResolvers: 'paramsChange'},
              // {path: 'research/:topicId',             component: GroupProjectsComponent,
              //   children: [
              //     {path: ':projectId',                             component: GroupProjectDetailsComponent, runGuardsAndResolvers: 'paramsChange'},
              //     {path: ':projectId/publications/:publicationId', component: GroupPublicationDetailsComponent, runGuardsAndResolvers: 'paramsChange'},
              //   ]
              // },

              // {path: 'projects',                      component: GroupProjectsComponent},
              // {path: 'projects/:projectId',           component: GroupProjectDetailsComponent, runGuardsAndResolvers: 'paramsChange'},
              // {path: 'projects/:projectId/publications/:publicationId', component: GroupPublicationDetailsComponent, runGuardsAndResolvers: 'paramsChange'},
              // {path: 'projects/:projectId',           component: GroupProjectDetailsComponent, runGuardsAndResolvers: 'paramsChange',
                // children: [
                  // {path: 'publications/:publicationId', component: GroupPublicationDetailsComponent, runGuardsAndResolvers: 'paramsChange'},
                // ]
              // },

              {path: 'projects/sponsors',             component: GroupCollaborationsSponsorsComponent}, // FIX?

              {path: 'funding',                       component: GroupFundingsComponent, canActivate: [LabGuard]},

              {path: 'collaborations',                component: GroupCollaborationsComponent},

              {path: 'seminars',                      component: GroupSeminarsComponent, canActivate: [LabGuard]},

              {path: 'papers-kit',                    component: GroupPapersKitComponent, canActivate: [LabGuard]},

              {path: 'jobs',                          component: GroupPositionsComponent},
              {path: 'jobs/:positionId',              component: GroupPositionDetailsComponent, canActivate: [LabGuard], runGuardsAndResolvers: 'paramsChange'},

              {
                path: 'post-job',
                loadChildren: () => import('../build/position/build.module').then(m => m.JobBuildModule),
              },

              {path: 'outreach',                      component: GroupOutreachComponent, canActivate: [LabGuard]},

              {path: 'teaching',                      component: GroupTeachingComponent, canActivate: [LabGuard]},

              // {path: 'events',                        component: GroupEventsComponent},

              {path: 'gallery',                       component: GroupGalleryComponent},
              {path: 'gallery/:galleryId',            component: GroupGalleryDetailsComponent, runGuardsAndResolvers: 'paramsChange'},

              {path: 'media',                         component: GroupMediaComponent},

              {path: 'faq',                           component: GroupFAQComponent},

              {path: 'contact',                       component: GroupContactComponent},

              {path: 'settings',                      loadChildren: () => import('./settings/settings.module').then(m => m.SettingsModule)},

              {path: '**',                            component: _404Component}
            ]}
    ])],
    declarations: [ GroupComponent,
                    GroupNavbarComponent,
                    GroupSidebarComponent,
                    GroupLinksBarComponent,

                    GroupBuildProgressComponent,
                    GroupBuildAlertsComponent,
                    GroupWelcomeModalComponent,

                    // WebSocketComponent,

                    GroupHomeComponent,

                    GroupPeopleComponent,
                    GroupPeopleBuildComponent,
                    GroupPeoplePositionsBuildComponent,
                    GroupPeopleAnalyticsComponent,

                    GroupPublicationsComponent,
                    GroupPublicationDetailsComponent,

                    GroupMediaComponent,

                    GroupResourcesComponent,
                    GroupResourceDetailsComponent,

                    GroupResearchComponent,
                    GroupResearchBuildComponent,

                    GroupProjectsComponent,
                    GroupProjectDetailsComponent,

                    GroupFundingsComponent,

                    GroupCollaborationsComponent,
                    GroupCollaborationBuildComponent,
                    GroupCollaborationsSponsorsComponent,
                    GroupCollaborationsSponsorBuildComponent,

                    GroupSeminarsComponent,

                    GroupPapersKitComponent,

                    GroupPositionsComponent,
                    GroupPositionDetailsComponent,

                    GroupOutreachComponent,

                    GroupTeachingComponent,

                    GroupEventsComponent,

                    GroupGalleryComponent,
                    GroupGalleryDetailsComponent,

                    GroupFAQComponent,

                    GroupContactComponent,

                    GroupAIComponent,
                    GroupAIListComponent,

                    GroupNetworkComponent,

                    GroupNewsComponent,

                    _404Component

                    ],
    providers:    [ MissionService, DatePipe, LabGuard
                 ],
})
export class GroupMainModule { }
