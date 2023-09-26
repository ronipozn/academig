import {NgModule}       from '@angular/core';
import {CommonModule}   from '@angular/common';
import {RouterModule}   from '@angular/router';
import {FormsModule, ReactiveFormsModule} from '@angular/forms';

import {UniversityComponent} from './university.component';
import {NavbarComponent} from './navbar/navbar';

import {UniversityHomeComponent} from './home/home';
import {UniversityAboutComponent} from './home/about/about.component';
import {UniversitySlideshowBuildComponent} from './home/slideshow/slideshow-build';

import {UniversityNewsComponent} from './news/news';
import {UniversityContactComponent} from './contact/home/home';

import {UniversityDepatmentsComponent} from './departments/home/home';
import {UniversityDepartmentBuildComponent} from './departments/build-department/build.component';
import {UniversityUnitBuildComponent} from './departments/build-unit/build.component';

import {UniversityPeopleComponent} from './people/home/home';
import {UniversityPublicationsComponent} from './publications/home/home';
import {UniversityProjectsComponent} from './projects/home/home';
import {UniversityResourcesComponent} from './resources/home/home';
import {UniversityTeachingComponent} from './teaching/home/home';
import {UniversityPositionsComponent} from './positions/home/home';
import {UniversityMediaComponent} from './media/home/home';
import {UniversityGalleriesComponent} from './galleries/home/home';
import {UniversitySeminarsComponent} from './seminars/home/home';

import {MissionService} from './services/mission-service';

import {SharedModule} from '../shared/shared.module';

import {MaterialModule} from '../app.module';

import {ScopeGuardService as ScopeGuard} from '../auth/scope-guard.service';
import {ShareButtonsModule} from '@ngx-share/buttons';
import {AgmCoreModule} from '@agm/core';
import {NgxGalleryModule} from 'ngx-gallery';
import {NgxTwitterTimelineModule} from 'ngx-twitter-timeline';
import {PipesModule} from '../pipes/pipes.module';;

@NgModule({
    imports: [
        CommonModule,
        FormsModule,
        ShareButtonsModule,
        NgxGalleryModule,
        AgmCoreModule.forRoot({apiKey: 'AIzaSyADPfY982ZEO3u3qptwAYFgXP8IJRoiqIE'}),
        ReactiveFormsModule,
        SharedModule,
        MaterialModule,
        NgxTwitterTimelineModule,
        PipesModule,
        RouterModule.forChild([
          {path: '', component: UniversityComponent,
            children: [
              // {path: '',                              redirectTo: 'home', pathMatch: 'full'},
              {path: '',                              component: UniversityHomeComponent},

              {path: 'summary',                       component: UniversityHomeComponent},
              {path: 'departments',                   component: UniversityDepatmentsComponent},
              {path: 'programs',                      component: UniversityDepatmentsComponent},

              {path: 'people',                        component: UniversityPeopleComponent},
              {path: 'publications',                  component: UniversityPublicationsComponent},
              {path: 'services',                      component: UniversityResourcesComponent},
              {path: 'projects',                      component: UniversityProjectsComponent},
              {path: 'teaching',                      component: UniversityTeachingComponent},
              {path: 'jobs',                          component: UniversityPositionsComponent},
              {path: 'media',                         component: UniversityMediaComponent},
              {path: 'galleries',                     component: UniversityGalleriesComponent},
              {path: 'seminars',                      component: UniversitySeminarsComponent},
              // {path: 'events',                     component: UniversityEventsComponent},

              {path: 'news',                          component: UniversityNewsComponent},
              {path: 'contact',                       component: UniversityContactComponent},

              {path: 'slideshow',                     component: UniversitySlideshowBuildComponent, canActivate: [ScopeGuard], data: { expectedScopes: ['write:universities']}},
              {path: 'settings',                      loadChildren: () => import('./settings/settings.module').then(m => m.SettingsModule), canActivate: [ScopeGuard], data: { expectedScopes: ['write:universities']}},
            ]},
          {path: ':departmentId',                     loadChildren: () => import('../department/department.module').then(m => m.DepartmentMainModule)}
    ])],
    declarations: [ UniversityComponent,
                    NavbarComponent,

                    UniversityHomeComponent,
                    UniversityAboutComponent,
                    UniversitySlideshowBuildComponent,

                    UniversityNewsComponent,
                    UniversityContactComponent,

                    UniversityDepatmentsComponent,
                    UniversityDepartmentBuildComponent,
                    UniversityUnitBuildComponent,

                    UniversityPeopleComponent,
                    UniversityPublicationsComponent,
                    UniversityResourcesComponent,
                    UniversityProjectsComponent,
                    UniversityTeachingComponent,
                    UniversityPositionsComponent,
                    UniversityMediaComponent,
                    UniversityGalleriesComponent,
                    UniversitySeminarsComponent,
                    // UniversityEventsComponent
                    ],
    providers:    [ MissionService ],
})
export class UniversityMainModule { }
