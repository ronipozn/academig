import {NgModule}     from '@angular/core';
import {CommonModule} from '@angular/common';
import {RouterModule} from '@angular/router';
import {FormsModule} from '@angular/forms';

import {DepartmentComponent} from './department.component';
import {NavbarComponent} from './navbar/navbar';

import {DepartmentHomeComponent} from './home/home';
import {DepartmentAboutComponent} from './home/about/about.component';
import {DepartmentSlideshowBuildComponent} from './home/slideshow/slideshow-build';

import {DepartmentGroupsComponent} from './groups/groups';
import {DepartmentGroupsListComponent} from './groups-list/groups-list';

import {DepartmentNewsComponent} from './news/news';
import {DepartmentContactComponent} from './contact/home/home';

import {DepartmentPeopleComponent} from './people/home/home';
import {DepartmentPublicationsComponent} from './publications/home/home';
import {DepartmentProjectsComponent} from './projects/home/home';
import {DepartmentResourcesComponent} from './resources/home/home';
import {DepartmentTeachingComponent} from './teaching/home/home';
import {DepartmentPositionsComponent} from './positions/home/home';
import {DepartmentMediaComponent} from './media/home/home';
import {DepartmentGalleriesComponent} from './galleries/home/home';
// import {DepartmentSeminarsComponent} from './seminars/home/home';

import {MissionService} from './services/mission-service';
import {ScopeGuardService as ScopeGuard} from '../auth/scope-guard.service';

import {SharedModule} from '../shared/shared.module';
import {PipesModule} from '../pipes/pipes.module';

import {MaterialModule} from '../app.module';
import {ShareButtonsModule} from '@ngx-share/buttons';
import {AgmCoreModule} from '@agm/core';
import {NgxGalleryModule} from 'ngx-gallery';
import {NgxTwitterTimelineModule} from 'ngx-twitter-timeline';

@NgModule({
    imports: [
        CommonModule,
        SharedModule,
        MaterialModule,
        FormsModule,
        ShareButtonsModule,
        NgxGalleryModule,
        AgmCoreModule.forRoot({apiKey: 'AIzaSyADPfY982ZEO3u3qptwAYFgXP8IJRoiqIE'}),
        NgxTwitterTimelineModule,
        PipesModule,
        RouterModule.forChild([
          {path: '', component: DepartmentComponent,
            children: [
              // {path: '',                      redirectTo: 'home', pathMatch: 'full'},
              {path: '',                         component: DepartmentHomeComponent},

              {path: 'summary',                  component: DepartmentHomeComponent},
              {path: 'labs',                     component: DepartmentGroupsComponent},

              {path: 'people',                   component: DepartmentPeopleComponent},
              {path: 'publications',             component: DepartmentPublicationsComponent},
              {path: 'services',                 component: DepartmentResourcesComponent},
              {path: 'projects',                 component: DepartmentProjectsComponent},
              {path: 'teaching',                 component: DepartmentTeachingComponent},
              {path: 'jobs',                     component: DepartmentPositionsComponent},
              {path: 'media',                    component: DepartmentMediaComponent},
              {path: 'galleries',                component: DepartmentGalleriesComponent},
              // {path: 'seminars',              component: DepartmentSeminarsComponent},
              // {path: 'events',                component: DepartmentEventsComponent},

              {path: 'news',                     component: DepartmentNewsComponent},
              {path: 'contact',                  component: DepartmentContactComponent},

              {path: 'slideshow',                component: DepartmentSlideshowBuildComponent, canActivate: [ScopeGuard], data: { expectedScopes: ['write:departments']}},
              {path: 'settings',                 loadChildren: () => import('./settings/settings.module').then(m => m.SettingsModule), canActivate: [ScopeGuard], data: { expectedScopes: ['write:departments']}},
            ]
          },
          {path: ':groupId',                     loadChildren: () => import('../group/group.module').then(m => m.GroupMainModule)}
        ])
    ],
    declarations: [ DepartmentComponent,
                    NavbarComponent,

                    DepartmentHomeComponent,
                    DepartmentAboutComponent,
                    DepartmentSlideshowBuildComponent,

                    DepartmentGroupsComponent,
                    DepartmentGroupsListComponent,

                    DepartmentNewsComponent,
                    DepartmentContactComponent,

                    DepartmentPeopleComponent,
                    DepartmentPublicationsComponent,
                    DepartmentResourcesComponent,
                    DepartmentProjectsComponent,
                    DepartmentTeachingComponent,
                    DepartmentPositionsComponent,
                    DepartmentMediaComponent,
                    DepartmentGalleriesComponent
                    // DepartmentSeminarsComponent,
                    // DepartmentEventsComponent
                  ],
    providers:    [ MissionService ],
})
export class DepartmentMainModule { }
