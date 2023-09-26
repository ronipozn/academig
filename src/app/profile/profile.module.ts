import {NgModule}       from '@angular/core';
import {CommonModule}   from '@angular/common';
import {RouterModule}     from '@angular/router';
import {FormsModule, ReactiveFormsModule} from '@angular/forms';

import {NgbModule} from '@ng-bootstrap/ng-bootstrap';

import {ProfileComponent} from './profile.component';

import {ProfileNavbarComponent} from './navbar/navbar';

import {BackgroundComponent} from './background/background.component';
import {SidebarComponent} from './background/sidebar/sidebar.component';
import {AboutComponent} from './background/about/about.component';
import {TableComponent} from './background/table/table.component';

import {LibraryComponent} from './library/library.component';
import {NetworkComponent} from './network/network.component';

import {PublicationsComponent} from './publications/publications.component';
// import {BooksComponent} from "./books/books.component";
import {MentoringComponent} from './mentoring/mentoring.component';
import {ProjectsComponent} from './projects/projects.component';
import {FundingComponent} from './funding/funding.component';
import {OutreachComponent} from './outreach/outreach.component';
import {TeachingComponent} from './teaching/teaching.component';
import {GalleryComponent} from './gallery/gallery.component';
import {MediaComponent} from './media/media.component';
import {InterviewComponent} from './interview/interview.component';
import {ContactComponent} from './contact/contact.component';
import {NewsComponent} from './news/news.component';

import {ProfilePublicationSuggestionsComponent} from './publications/publication-suggestions/suggestions.component';

import {ProfilePublicationDetailsComponent} from './publications/publication-details/publication-details';
import {ProfileProjectDetailsComponent} from './projects/project-details/project-details';
import {ProfileGalleryDetailsComponent} from './gallery/gallery-details/gallery-details';

import {PeopleAssistComponent} from './assist/assist';
// import {GroupAnalyticsComponent} from "./powerups/powerups.component";

import {ModalBuildLabComponent} from './modal-build-lab/modal-build-lab';
import {BuildSlideTableComponent} from './background/build-slide-table/build-slide-table';
import {BuildSlideExpertiseComponent} from './mentoring/build-slide-expertise/build-slide-expertise';
import {BuildSlideMentoringComponent} from './mentoring/build-slide-mentoring/build-slide-mentoring';
import {BuildSlideOngoingComponent} from './mentoring/build-slide-ongoing/build-slide-ongoing';

import {CoachingFormDialog} from './mentoring/coaching-dialog/coaching-dialog';

import {MissionService} from './services/mission-service';

////////////////////////////////////////////////
/////////////////// MODULES ////////////////////
////////////////////////////////////////////////

import {SharedModule} from '../shared/shared.module';
import {PipesModule} from '../pipes/pipes.module';;

import {TrumbowygNgxModule} from 'trumbowyg-ngx';
import {ShareButtonsModule} from '@ngx-share/buttons';
import {NgxTwitterTimelineModule} from 'ngx-twitter-timeline';
import {MaterialModule} from '../app.module';
import {NgxGalleryModule} from 'ngx-gallery';
import {JoyrideModule} from 'ngx-joyride';

@NgModule({
    imports: [
        CommonModule,
        FormsModule,
        ReactiveFormsModule,
        MaterialModule,
        SharedModule,
        PipesModule,
        JoyrideModule.forRoot(),
        NgxGalleryModule,
        NgbModule,
        ShareButtonsModule,
        NgxTwitterTimelineModule,
        TrumbowygNgxModule.withConfig({
            lang: 'hu',
            svgPath: '/assets/icons.svg',
            removeformatPasted: true,
            autogrow: true,
            btns: [
                ['undo', 'redo'], // Only supported in Blink browsers
                ['fontsize', 'foreColor', 'backColor'],
                ['link'],
                ['strong', 'em', 'underline'],
                ['superscript', 'subscript'],
                ['removeformat'],
                ['horizontalRule'],
                ['unorderedList', 'orderedList'],
                ['justifyLeft', 'justifyCenter', 'justifyRight', 'justifyFull'],
            ]
        }),
        RouterModule.forChild([
          {path: '',                                                      component: ProfileComponent,
            children: [
              {path: '',                                                  component: BackgroundComponent},

              {path: 'news',                                              component: NewsComponent},
              {path: 'network',                                           component: NetworkComponent},

              {path: 'library',                                           component: LibraryComponent},
              {path: 'library/:publicationId',                            component: ProfilePublicationDetailsComponent, runGuardsAndResolvers: 'paramsChange'},

              {path: 'publications',                                      component: PublicationsComponent},
              {path: 'publications/suggestions',                          component: ProfilePublicationSuggestionsComponent},
              {path: 'publications/:publicationId',                       component: ProfilePublicationDetailsComponent, runGuardsAndResolvers: 'paramsChange'},
              {path: 'people/:profileId/publications/:publicationId',     component: ProfilePublicationDetailsComponent, runGuardsAndResolvers: 'paramsChange'},

              // {path: 'books',                                          component: BooksComponent},

              {path: 'mentoring',                                         component: MentoringComponent},

              {
                path: 'become-mentor',
                loadChildren: () => import('../build/mentor/build.module').then(m => m.MentorBuildModule),
              },

              {path: 'projects',                                          component: ProjectsComponent},
              {path: 'projects/:projectId',                               component: ProfileProjectDetailsComponent, runGuardsAndResolvers: 'paramsChange'},
              {path: 'projects/:projectId/publications/:publicationId',   component: ProfilePublicationDetailsComponent, runGuardsAndResolvers: 'paramsChange'},

              {path: 'funding',                                           component: FundingComponent},

              {path: 'gallery',                                           component: GalleryComponent},
              {path: 'gallery/:galleryId',                                component: ProfileGalleryDetailsComponent, runGuardsAndResolvers: 'paramsChange'},

              {path: 'outreach',                                          component: OutreachComponent},

              {path: 'teaching',                                          component: TeachingComponent},

              {path: 'media',                                             component: MediaComponent},

              {path: 'interview',                                         component:  InterviewComponent},

              {path: 'contact',                                           component: ContactComponent},

              // {path: 'powerups',                                       component: PowerUpsComponent},
            ]}
        ])

    ],
    declarations: [ ProfileComponent,
                    ProfileNavbarComponent,

                    BackgroundComponent,
                    AboutComponent,
                    SidebarComponent,
                    TableComponent,

                    PeopleAssistComponent,

                    LibraryComponent,
                    NetworkComponent,

                    PublicationsComponent,

                    // BooksComponent,

                    MentoringComponent,

                    ProjectsComponent,

                    FundingComponent,

                    GalleryComponent,

                    OutreachComponent,

                    TeachingComponent,

                    MediaComponent,

                    InterviewComponent,

                    ContactComponent,

                    NewsComponent,

                    ProfilePublicationSuggestionsComponent,

                    ProfilePublicationDetailsComponent,
                    ProfileProjectDetailsComponent,
                    ProfileGalleryDetailsComponent,

                    ModalBuildLabComponent,
                    BuildSlideTableComponent,
                    BuildSlideExpertiseComponent,
                    BuildSlideMentoringComponent,
                    BuildSlideOngoingComponent,

                    CoachingFormDialog
                    ],
    providers:      [ MissionService ],
    entryComponents: [
                    CoachingFormDialog,
                    ]
})
export class ProfileModule {}
