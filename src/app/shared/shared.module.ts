import {NgModule}         from '@angular/core';
import {CommonModule}     from '@angular/common';
import {RouterModule}     from '@angular/router';
import {FormsModule, ReactiveFormsModule} from '@angular/forms';

////////////////////////////////////////////////
//////////////////// MISC //////////////////////
////////////////////////////////////////////////

import {BlockBtnComponent} from './buttons/block-btn/block-btn';
import {DetailsButtonsComponent} from './buttons/details-buttons/details-buttons';
import {FollowBtnComponent} from './buttons/follow-btn/follow-btn';
import {FollowBtnAdminComponent} from './buttons/follow-btn-admin/follow-btn-admin';

import {FoldersBtnComponent} from './buttons/folders-btn/folders-btn';
import {ReadFormDialog} from './buttons/folders-btn/read-form-dialog';

import {BreadComponent} from './misc/bread/bread';
import {CountdownComponent} from './misc/countdown/countdown';
import {FooterComponent} from './misc/footer/footer';
import {GroupLinkComponent} from './misc/group-link/group-link';
import {LinkItemComponent} from './misc/link-item/link-item';
import {PlaceholdersMapComponent} from './misc/placeholders-map/placeholders-map';
import {Error404Component} from './misc/error-404/error-404';
import {GroupTrDetailsComponent} from './misc/tr-details/tr-details';
import {slidePDFComponent} from './misc/slide-pdf/slide-pdf';
import {DotsNavComponent} from './misc/dots-nav/dots-nav';

import {AdComponent} from './misc/adsense.component';
import {AdFeedComponent} from './misc/adsense-feed.component';

import {LoadingComponent} from './misc/loading/loading';
import {SpinnerComponent} from './misc/spinner/spinner';
import {SpinnerPutComponent} from './misc/spinner-put/spinner-put';

import {ModalCiteComponent} from './modals/modal-cite/modal-cite';
import {ModalShareComponent} from './modals/modal-share/modal-share';
import {ModalReportComponent} from './modals/modal-report/modal-report';
import {ModalClaimComponent} from './modals/modal-claim/modal-claim';
import {ModalSignupComponent} from './modals/modal-signup/modal-signup';
import {ImproveFormDialog} from './modals/modal-improve/modal-improve';

////////////////////////////////////////////////
///////////////// BUILD ITEMS //////////////////
////////////////////////////////////////////////

import {QuoteComponent} from './build/build-items/build-quote/build-quote';
import {SinglePicComponent} from './build/build-items/single-pic/single-pic';
import {GroupBuildPicComponent} from './build/build-items/build-pic/build-pic';
import {GroupBuildTextComponent} from './build/build-items/build-text/build-text';
import {GroupBuildTextPicComponent} from './build/build-items/build-text-pic/build-text-pic';

import {GroupBuildHeadlineComponent} from './build/build-items/build-headline/build-headline';
import {GroupBuildButtonComponent} from './build/build-items/build-buttons/build-buttons';
import {GroupBuildModalIntroComponent} from './build/build-items/build-modal-intro/build-modal-intro';
import {GroupBuildBadgeComponent} from './build/build-items/build-badge/build-badge';
import {GroupBuildTrComponent} from './build/build-items/build-tr/build-tr';
import {GroupBuildModalComponent} from './build/build-items/build-modal/build-modal';

////////////////////////////////////////////////
///////////////// BUILD SLIDE //////////////////
////////////////////////////////////////////////

import {BuildSlidePicComponent} from './build/build-slide/build-slide-pic/build-slide-pic';
import {BuildSlidePicMultiComponent} from './build/build-slide/build-slide-pic-multi/build-slide-pic-multi';
import {BuildSlideQueryComponent} from './build/build-slide/build-slide-query//build-slide-query';
import {BuildSlideTextComponent} from './build/build-slide/build-slide-text//build-slide-text';
import {BuildSlideTextPicComponent} from './build/build-slide/build-slide-text-pic/build-slide-text-pic';
import {BuildSlideTextClipComponent} from './build/build-slide/build-slide-text-clip/build-slide-text-clip';

import {BuildSlideRankComponent} from './build/build-slide/build-slide-rank/build-slide-rank';
import {BuildSlideInfoComponent} from './build/build-slide/build-slide-info/build-slide-info';
import {BuildSlideSocialComponent} from './build/build-slide/build-slide-social/build-slide-social';
import {BuildSlideAddComponent} from './build/build-slide/build-slide-add/build-slide-add';

import {BuildSlideQuoteComponent} from './build/build-slide/build-slide-quote/build-slide-quote';
import {BuildSlideAffiliationComponent} from './build/build-slide/build-slide-affiliation/build-slide-affiliation';
import {BuildSlideMediaComponent} from './build/build-slide/build-slide-media/build-slide-media';
import {BuildSlideProjectComponent} from './build/build-slide/build-slide-project/build-slide-project';
import {BuildSlideOutreachComponent} from './build/build-slide/build-slide-outreach/build-slide-outreach';
import {BuildSlideTeachingComponent} from './build/build-slide/build-slide-teaching/build-slide-teaching';
import {BuildSlideGalleryComponent} from './build/build-slide/build-slide-gallery/build-slide-gallery';
import {BuildSlideObjectComponent} from './build/build-slide/build-slide-object/build-slide-object';
import {BuildSlideContactComponent} from './build/build-slide/build-slide-contact/build-slide-contact';
import {BuildSlideFAQComponent} from './build/build-slide/build-slide-faq/build-slide-faq';
import {BuildSlideTagsComponent} from './build/build-slide/build-slide-tags/build-slide-tags';
import {BuildSlideLinkComponent} from './build/build-slide/build-slide-link/build-slide-link';
import {BuildSlideLocationComponent} from './build/build-slide/build-slide-location/build-slide-location';
import {BuildSlideReadComponent} from './build/build-slide/build-slide-read/build-slide-read';

import {BuildSlideMarketingComponent} from './build/build-slide/build-slide-marketing/build-slide-marketing';
import {BuildSlideSuggestComponent} from './build/build-slide/build-slide-suggest/build-slide-suggest';

import {BuildSlideFundingComponent} from './build/build-slide/build-slide-funding/build-slide-funding';
import {BuildFundingPeriodsComponent} from './build/build-slide/build-slide-funding/build-periods/build-periods';
import {BuildFundingRolesComponent} from './build/build-slide/build-slide-funding/build-roles/build-roles';

import {BuildSlidePublicationsComponent} from './build/build-slide/build-slide-publications/build-slide-publications';
import {BuildSlideMultiComponent} from './build/build-slide/build-slide-publications/build-slide-multi/build-slide-multi';
import {BuildMultiComponent} from './build/build-slide/build-slide-publications/build-multi/build-multi';

import {BuildTextFieldComponent} from './build/build-field/build-text-field/build-text-field';
import {BuildQueryFieldComponent} from './build/build-field/build-query-field/build-query-field';
import {BuildMonthtFieldComponent} from './build/build-field/build-month-field/build-month-field';
import {BuildTagFetchFieldComponent} from './build/build-field/build-tag-fetch-field/build-tag-fetch-field';

import {BuildSlideSelectMembersComponent} from './build/build-field/build-slide-select-members/build-slide-select-members';
import {BuildSlideSelectProjectsComponent} from './build/build-field/build-slide-select-projects/build-slide-select-projects';
import {BuildSlideSelectFundingsComponent} from './build/build-field/build-slide-select-fundings/build-slide-select-fundings';
import {BuildSlideSelectCollaborationsComponent} from './build/build-field/build-slide-select-collaborations/build-slide-select-collaborations';
import {BuildSlideSelectMediaComponent} from './build/build-field/build-slide-select-media/build-slide-select-media';

////////////////////////////////////////////////
///////////////// GROUP LIST ///////////////////
////////////////////////////////////////////////

import {GroupsListComponent} from './groups/groups-list/groups-list';
import {GroupPreviewComponent} from './groups/group-preview/group-preview';
import {GroupColumnsComponent} from './groups/group-columns/group-columns';
import {GroupItemComponent} from './groups/group-item/group-item';
import {GroupItemCloudComponent} from './groups/group-item-cloud/group-item-cloud';
import {CollaborationInfoComponent} from './groups/group-item/collaboration-info/collaboration-info';
import {RelationInfoComponent} from './groups/group-item/relation-info/relation-info';

////////////////////////////////////////////////
/////////////////// Progress ///////////////////
////////////////////////////////////////////////

import {PeopleProgressComponent} from './progress/progress.component';

////////////////////////////////////////////////
///////////////// PEOPLE LIST //////////////////
////////////////////////////////////////////////

import {PeopleListComponent} from './people/people-list/people-list';
import {PeopleItemComponent} from './people/people-item/people-item';
import {PeopleItemGroupComponent} from './people/people-item-group/people-item-group';
import {PeopleItemCloudComponent} from './people/people-item-cloud/people-item-cloud';
import {PeopleButtonsComponent} from './people/people-buttons/people-buttons';
import {PeopleBuildButtonComponent} from './people/people-build-buttons/people-build-buttons';

////////////////////////////////////////////////
///////////////// PUBLICATIONS /////////////////
////////////////////////////////////////////////

import {PublicationsSearchComponent} from './publications/publications-search/publications-search';
import {PublicationsButtonsComponent} from './publications/publications-buttons/publications-buttons';
import {PublicationsStatsComponent} from './publications/publications-stats/publications-stats';
import {PublicationsStatsAllComponent} from './publications/publications-stats-all/publications-stats-all';

import {PublicationsListTableComponent} from './publications/publications-list-table/publications-list-table';
import {PublicationItemTableComponent} from './publications/publication-item-table/publication-item-table';

import {PublicationsListSuggestComponent} from './publications/publications-list-suggest/publications-list-suggest';
import {PublicationsListComponent} from './publications/publications-list/publications-list';
import {PublicationItemComponent} from './publications/publication-item/publication-item';
import {PublicationAuthorsComponent} from './publications/publication-authors/publication-authors';

import {PublicationReadComponent} from './publications/publication-read/publication-read';

import {PublicationDetailsComponent} from './publications/publication-details/publication-details';
import {PublicationCommentsComponent} from './publications/publication-comments/publication-comments';
import {BuildSlideFiguresComponent} from './publications/build-slide-figures/build-slide-figures';
import {BuildSlideJournalComponent} from './publications/build-slide-journal/build-slide-journal';

////////////////////////////////////////////////
////////////// RESEARCH PROJECTS ///////////////
////////////////////////////////////////////////

import {TopicItemComponent} from './topics/topic-item/topic-item';

import {ProjectsListComponent} from './projects/projects-list/projects-list';
import {ProjectItemComponent} from './projects/project-item/project-item';
import {ProjectDetailsComponent} from './projects/project-details/project-details';
import {BuildSlideAssociatedResourceComponent} from './projects/build-slide-associated-resource/build-slide-associated-resource';

import {FundingsListComponent} from './fundings/fundings-list/fundings-list';
import {FundingItemComponent} from './fundings/funding-item/funding-item';

////////////////////////////////////////////////
////////////////// RESOURCES ///////////////////
////////////////////////////////////////////////

import {ResourceListComponent} from './resources/resource-list/resource-list';
import {ResourceItemComponent} from './resources/resource-item/resource-item';
import {ResourceDetailsComponent} from './resources/resource-details/resource-details';
import {ResourceTableComponent} from './resources/resource-table/resource-table.component';
import {ResourceTableBuildComponent} from './resources/table-build/table-build.component';
import {ResourcePriceBuildComponent} from './resources/price-build/price-build.component';
import {TermsBuildComponent} from './resources/terms-build/terms-build';

////////////////////////////////////////////////
////////////////// POSITIONS ///////////////////
////////////////////////////////////////////////

import {PositionListComponent} from './positions/positions-list/positions-list';
import {PositionItemComponent} from './positions/position-item/position-item';
import {PositionInsightsComponent} from './positions/position-insights/position-insights';
import {PositionStepsComponent} from './positions/position-steps/position-steps';

import {PositionDetailsComponent} from './positions/position-details/position-details';
import {PositionStatsComponent} from './positions/position-details/position-stats/position-stats';
import {PositionInfoComponent} from './positions/position-details/position-info/position-info';

import {PositionReviewComponent} from './positions/position-details/position-stages/position-review/position-review';
import {PositionInviteComponent} from './positions/position-details/position-stages/position-invite/position-invite';
import {PositionInterviewComponent} from './positions/position-details/position-stages/position-interview/position-interview';
import {PositionHireComponent} from './positions/position-details/position-stages/position-hire/position-hire';
import {PositionProposalComponent} from './positions/position-details/position-stages/position-proposal/position-proposal';

import {PositionApplyComponent} from './positions/position-apply/position-apply';
import {PositionBuildRefereesComponent} from './positions/position-apply/build-referees/build-referees';

import {PositionBuildGeneralComponent} from './positions/position-details/position-build/position-build-general/build';
import {PositionBuildLettersComponent} from './positions/position-details/position-build/position-build-letters/build';
import {PositionBuildDeadlinesComponent} from './positions/position-details/position-build/position-build-deadlines/build';

////////////////////////////////////////////////
//////////////////// MEDIA /////////////////////
////////////////////////////////////////////////

import {MediaTalksListComponent} from './media/talk-list/talk-list';
import {MediaPostersListComponent} from './media/poster-list/poster-list';
import {MediaPressListComponent} from './media/press-list/press-list';

import {MediaTalksItemComponent} from './media/talk-item/talk-item';
import {MediaPostersItemComponent} from './media/poster-item/poster-item';
import {MediaPressItemComponent} from './media/press-item/press-item';

////////////////////////////////////////////////
/////////////////// GALLERY ////////////////////
////////////////////////////////////////////////

import {GalleryItemComponent} from './galleries/gallery-item/gallery-item';
import {GalleryDetailsComponent} from './galleries/gallery-details/gallery-details';

////////////////////////////////////////////////
/////////////////// OUTREACH ///////////////////
////////////////////////////////////////////////

import {OutreachsListComponent} from './outreach/outreachs-list/outreachs-list';
import {OutreachItemComponent} from './outreach/outreach-item/outreach-item';

////////////////////////////////////////////////
/////////////////// TEACHING ///////////////////
////////////////////////////////////////////////

import {TeachingsListComponent} from './teaching/teachings-list/teachings-list';
import {TeachingItemComponent} from './teaching/teaching-item/teaching-item';

// import {EventsBetaComponent} from './events/events';

////////////////////////////////////////////////
///////////////////// FAQ //////////////////////
////////////////////////////////////////////////

import {FAQListComponent} from './faq/faq-list/faq-list';
import {FAQItemComponent} from './faq/faq-item/faq-item';

////////////////////////////////////////////////
////////////////// CONTACTS ////////////////////
////////////////////////////////////////////////

import {ContactListComponent} from './contact/contact-list/contact-list';
import {ContactItemComponent} from './contact/contact-item/contact-item';

////////////////////////////////////////////////
/////////////////// CHALLENGE //////////////////
////////////////////////////////////////////////

import {ChallengeComponent} from './challenge/challenge.component';
////////////////////////////////////////////////
///////////////// AFFILIATIONS /////////////////
////////////////////////////////////////////////

import {AffiliationItemComponent} from './affiliation/affiliation-item/affiliation-item';

////////////////////////////////////////////////
///////////////////// NEWS /////////////////////
////////////////////////////////////////////////

import {NewsListComponent} from './news/news-list/news-list';
import {NewsItemComponent} from './news/news-item/news-item';
import {CommentItemComponent} from './news/comment-item/comment-item';

////////////////////////////////////////////////
/////////////////// SERVICES ///////////////////
////////////////////////////////////////////////

import {AdminService} from './services/admin-service';
import {GalleryService} from './services/gallery-service';
import {FaqService} from './services/faq-service';
import {GroupService} from './services/group-service';
import {InviteService} from './services/invite-service';
import {PeopleService} from './services/people-service';
import {PublicationService} from './services/publication-service';
import {SortService} from './services/publication-service';
import {ProfileSortService} from './services/people-service';
import {ResourceService} from './services/resource-service';
import {MentorService} from './services/mentor-service';
import {ProjectService} from './services/project-service';
import {FundingService} from './services/funding-service';
import {CollaborationService} from './services/collaboration-service';
import {OpenPositionService} from './services/position-service';
import {TeachingService} from './services/teaching-service';
import {OutreachService} from './services/outreach-service';
import {MediaService} from './services/media-service';
import {ContactService} from './services/contact-service';
import {DepartmentService} from './services/department-service';
import {UniversityService} from './services/university-service';
import {SettingsService} from './services/settings-service';
import {NewsService} from './services/news-service';
import {PrivateService} from './services/private-service';
import {SeminarService} from './services/seminars-service';
import {SharedService} from './services/shared-service';
import {MetaService} from './services/meta-service';
import {SupportService} from './services/support-service';
import {WebSocketService} from './services/websocket-observable-service';

import {ValidatorsService} from './services/shared-service';
import {ValidatorsReadService} from './services/shared-service';

////////////////////////////////////////////////
///////////////// DIRECTIVES ///////////////////
////////////////////////////////////////////////

import { AutofocusDirective } from './misc/auto-focus.directive';
import { CloseMenuDirective } from './misc/close-menu.directive';
import { ImagePreview } from './misc/image-preview.directive';

////////////////////////////////////////////////
//////////////////// PIPES /////////////////////
////////////////////////////////////////////////

import { DatePipe } from '@angular/common';

////////////////////////////////////////////////
/////////////////// MODULES ////////////////////
////////////////////////////////////////////////

import { AgmCoreModule } from '@agm/core';
import { TagInputModule } from 'ngx-chips';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { CustomFormsModule } from 'ng2-validation'
import { TrumbowygNgxModule } from 'trumbowyg-ngx';
import { ShareButtonsModule } from '@ngx-share/buttons';
import { ClickOutsideModule } from 'ng-click-outside';
import { NgxGalleryModule } from 'ngx-gallery';
import { PipesModule } from '../pipes/pipes.module';;

import {
  MatAutocompleteModule,
  MatButtonModule,
  MatButtonToggleModule,
  MatCardModule,
  MatCheckboxModule,
  MatChipsModule,
  MatDialogModule,
  MatExpansionModule,
  MatGridListModule,
  MatIconModule,
  MatInputModule,
  MatListModule,
  MatMenuModule,
  MatNativeDateModule,
  MatPaginatorModule,
  MatProgressBarModule,
  MatProgressSpinnerModule,
  MatRadioModule,
  MatRippleModule,
  MatSelectModule,
  MatSidenavModule,
  MatSliderModule,
  MatSlideToggleModule,
  MatSnackBarModule,
  MatSortModule,
  MatTableModule,
  MatTabsModule,
  MatToolbarModule,
  MatTooltipModule,
  MatStepperModule,
} from '@angular/material';
import { MatDatepickerModule } from '@angular/material/datepicker';

import {MatDialogRef} from '@angular/material/dialog';

@NgModule({
  exports: [
    MatAutocompleteModule,
    MatButtonModule,
    MatButtonToggleModule,
    MatCardModule,
    MatCheckboxModule,
    MatChipsModule,
    MatStepperModule,
    MatDatepickerModule,
    MatDialogModule,
    MatExpansionModule,
    MatGridListModule,
    MatIconModule,
    MatInputModule,
    MatListModule,
    MatMenuModule,
    MatNativeDateModule,
    MatPaginatorModule,
    MatProgressBarModule,
    MatProgressSpinnerModule,
    MatRadioModule,
    MatRippleModule,
    MatSelectModule,
    MatSidenavModule,
    MatSliderModule,
    MatSlideToggleModule,
    MatSnackBarModule,
    MatSortModule,
    MatTableModule,
    MatTabsModule,
    MatToolbarModule,
    MatTooltipModule
  ]
})
export class MaterialModule {}

// import { PdfViewerModule } from 'ng2-pdf-viewer';
// import { NgAisModule } from 'angular-instantsearch';
// import { DragulaModule } from 'ng2-dragula';

@NgModule({
    imports: [
        CommonModule,
        FormsModule,
        ReactiveFormsModule,
        RouterModule.forChild([]),

        CustomFormsModule,
        AgmCoreModule.forRoot({apiKey: 'AIzaSyBZAggoJNVAYOGG0neuO_zYJw053wpqzrk'}),
        TagInputModule,
        NgbModule,
        ClickOutsideModule,
        NgxGalleryModule,
        ShareButtonsModule,
        MaterialModule,
        // PdfViewerModule,
        // DragulaModule.forRoot(),
        // NgAisModule.forRoot(),

        PipesModule,

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
                // ['formatting'],
                // ['fullscreen']
            ]
        })

    ],
    exports: [
              DetailsButtonsComponent,
              FollowBtnComponent,
              FoldersBtnComponent,
              BlockBtnComponent,

              PeopleProgressComponent,

              BreadComponent,
              CountdownComponent,
              FooterComponent,
              GroupLinkComponent,
              LinkItemComponent,
              PlaceholdersMapComponent,
              Error404Component,
              GroupTrDetailsComponent,
              slidePDFComponent,
              DotsNavComponent,

              AdComponent,
              AdFeedComponent,

              ModalCiteComponent,
              ModalShareComponent,
              ModalReportComponent,
              ModalClaimComponent,
              ModalSignupComponent,

              LoadingComponent,
              SpinnerComponent,
              SpinnerPutComponent,

              BuildSlidePicComponent,
              BuildSlidePicMultiComponent,
              BuildSlideQueryComponent,
              BuildSlideTextComponent,
              BuildSlideTextPicComponent,
              BuildSlideTextClipComponent,

              BuildSlideRankComponent,
              BuildSlideInfoComponent,
              BuildSlideSocialComponent,
              BuildSlideAddComponent,

              QuoteComponent,
              GroupBuildPicComponent,
              GroupBuildTextPicComponent,
              GroupBuildTextComponent,
              SinglePicComponent,

              BuildSlideSelectMembersComponent,
              BuildSlideSelectProjectsComponent,
              BuildSlideSelectFundingsComponent,
              BuildSlideSelectCollaborationsComponent,
              BuildSlideSelectMediaComponent,

              BuildMonthtFieldComponent,
              BuildTextFieldComponent,
              BuildQueryFieldComponent,
              BuildTagFetchFieldComponent,

              BuildSlideQuoteComponent,
              BuildSlideAffiliationComponent,
              BuildSlideMediaComponent,
              BuildSlideProjectComponent,
              BuildSlideOutreachComponent,
              BuildSlideTeachingComponent,
              BuildSlideGalleryComponent,
              BuildSlideObjectComponent,
              BuildSlideContactComponent,
              BuildSlideFAQComponent,
              BuildSlideTagsComponent,
              BuildSlideLinkComponent,
              BuildSlideLocationComponent,
              BuildSlideReadComponent,

              BuildSlideMarketingComponent,
              BuildSlideSuggestComponent,

              BuildSlideFundingComponent,

              BuildSlidePublicationsComponent,
              BuildSlideMultiComponent,

              GroupBuildBadgeComponent,
              GroupBuildButtonComponent,
              GroupBuildModalIntroComponent,
              GroupBuildHeadlineComponent,
              GroupBuildTrComponent,
              GroupBuildModalComponent,

              GroupsListComponent,
              GroupPreviewComponent,
              GroupItemCloudComponent,

              PeopleListComponent,

              PublicationsSearchComponent,
              PublicationsButtonsComponent,
              PublicationsStatsComponent,
              PublicationsStatsAllComponent,
              PublicationsListTableComponent,
              PublicationsListSuggestComponent,
              PublicationsListComponent,
              PublicationDetailsComponent,

              TopicItemComponent,

              ProjectsListComponent,
              ProjectDetailsComponent,

              FundingsListComponent,

              ResourceListComponent,
              ResourceDetailsComponent,

              PositionListComponent,
              PositionDetailsComponent,
              PositionInsightsComponent,
              PositionStepsComponent,

              MediaTalksListComponent,
              MediaPostersListComponent,
              MediaPressListComponent,

              TeachingsListComponent,

              OutreachsListComponent,

              GalleryItemComponent,
              GalleryDetailsComponent,

              // EventsBetaComponent,

              FAQListComponent,
              FAQItemComponent,

              ContactListComponent,

              ChallengeComponent,

              AffiliationItemComponent,

              NewsListComponent,

              AutofocusDirective,
              CloseMenuDirective,
              ImagePreview
             ],
    declarations: [
                   DetailsButtonsComponent,
                   FollowBtnComponent,
                   FollowBtnAdminComponent,
                   BlockBtnComponent,

                   PeopleProgressComponent,

                   FoldersBtnComponent,
                   ReadFormDialog,

                   BreadComponent,
                   CountdownComponent,
                   FooterComponent,
                   GroupLinkComponent,
                   LinkItemComponent,
                   PlaceholdersMapComponent,
                   Error404Component,
                   GroupTrDetailsComponent,
                   slidePDFComponent,
                   DotsNavComponent,

                   AdComponent,
                   AdFeedComponent,

                   LoadingComponent,
                   SpinnerComponent,
                   SpinnerPutComponent,

                   ModalCiteComponent,
                   ModalShareComponent,
                   ModalReportComponent,
                   ModalClaimComponent,
                   ModalSignupComponent,
                   ImproveFormDialog,

                   BuildSlidePicComponent,
                   BuildSlidePicMultiComponent,
                   BuildSlideQueryComponent,
                   BuildSlideTextComponent,
                   BuildSlideTextPicComponent,
                   BuildSlideTextClipComponent,

                   BuildSlideRankComponent,
                   BuildSlideInfoComponent,
                   BuildSlideSocialComponent,
                   BuildSlideAddComponent,

                   BuildMonthtFieldComponent,
                   BuildTextFieldComponent,
                   BuildQueryFieldComponent,
                   BuildTagFetchFieldComponent,

                   BuildSlideSelectMembersComponent,
                   BuildSlideSelectProjectsComponent,
                   BuildSlideSelectFundingsComponent,
                   BuildSlideSelectCollaborationsComponent,
                   BuildSlideSelectMediaComponent,

                   BuildSlideQuoteComponent,
                   BuildSlideAffiliationComponent,
                   BuildSlideMediaComponent,
                   BuildSlideProjectComponent,
                   BuildSlideOutreachComponent,
                   BuildSlideTeachingComponent,
                   BuildSlideGalleryComponent,
                   BuildSlideObjectComponent,
                   BuildSlideContactComponent,
                   BuildSlideFAQComponent,
                   BuildSlideTagsComponent,
                   BuildSlideLinkComponent,
                   BuildSlideLocationComponent,
                   BuildSlideReadComponent,

                   BuildSlideMarketingComponent,
                   BuildSlideSuggestComponent,

                   BuildSlideFundingComponent,
                   BuildFundingPeriodsComponent,
                   BuildFundingRolesComponent,

                   BuildSlidePublicationsComponent,
                   BuildSlideMultiComponent,
                   BuildMultiComponent,

                   QuoteComponent,
                   GroupBuildPicComponent,
                   GroupBuildTextPicComponent,
                   GroupBuildTextComponent,
                   SinglePicComponent,

                   GroupBuildBadgeComponent,
                   GroupBuildButtonComponent,
                   GroupBuildModalIntroComponent,
                   GroupBuildHeadlineComponent,
                   GroupBuildTrComponent,
                   GroupBuildModalComponent,

                   GroupsListComponent,
                   GroupPreviewComponent,
                   GroupColumnsComponent,
                   GroupItemComponent,
                   GroupItemCloudComponent,
                   CollaborationInfoComponent,
                   RelationInfoComponent,

                   PeopleListComponent,
                   PeopleItemComponent,
                   PeopleItemGroupComponent,
                   PeopleItemCloudComponent,
                   PeopleButtonsComponent,
                   PeopleBuildButtonComponent,

                   PublicationsSearchComponent,
                   PublicationsButtonsComponent,
                   PublicationsStatsComponent,
                   PublicationsStatsAllComponent,

                   PublicationsListTableComponent,
                   PublicationItemTableComponent,

                   PublicationsListSuggestComponent,
                   PublicationsListComponent,
                   PublicationItemComponent,
                   PublicationAuthorsComponent,

                   PublicationReadComponent,

                   PublicationDetailsComponent,
                   PublicationCommentsComponent,
                   BuildSlideFiguresComponent,
                   BuildSlideJournalComponent,

                   TopicItemComponent,

                   ProjectsListComponent,
                   ProjectItemComponent,
                   ProjectDetailsComponent,
                   BuildSlideAssociatedResourceComponent,

                   FundingsListComponent,
                   FundingItemComponent,

                   ResourceListComponent,
                   ResourceItemComponent,
                   ResourceDetailsComponent,
                   ResourceTableComponent,
                   ResourceTableBuildComponent,
                   ResourcePriceBuildComponent,
                   TermsBuildComponent,

                   PositionListComponent,
                   PositionItemComponent,

                   PositionDetailsComponent,
                   PositionStatsComponent,
                   PositionInfoComponent,
                   PositionStepsComponent,
                   PositionInsightsComponent,

                   PositionReviewComponent,
                   PositionInviteComponent,
                   PositionInterviewComponent,
                   PositionHireComponent,
                   PositionProposalComponent,

                   PositionApplyComponent,
                   PositionBuildRefereesComponent,

                   PositionBuildGeneralComponent,
                   PositionBuildLettersComponent,
                   PositionBuildDeadlinesComponent,

                   MediaTalksListComponent,
                   MediaPostersListComponent,
                   MediaPressListComponent,
                   MediaTalksItemComponent,
                   MediaPostersItemComponent,
                   MediaPressItemComponent,

                   GalleryItemComponent,
                   GalleryDetailsComponent,

                   TeachingsListComponent,
                   TeachingItemComponent,

                   OutreachsListComponent,
                   OutreachItemComponent,

                   // EventsBetaComponent,

                   FAQListComponent,
                   FAQItemComponent,

                   ContactListComponent,
                   ContactItemComponent,

                   ChallengeComponent,

                   AffiliationItemComponent,

                   NewsListComponent,
                   NewsItemComponent,
                   CommentItemComponent,

                   AutofocusDirective,
                   CloseMenuDirective,
                   ImagePreview
                  ],
    providers:    [
                   AdminService,
                   GalleryService,
                   FaqService,
                   GroupService,
                   InviteService,
                   PeopleService,
                   PublicationService,
                   SortService,
                   ProfileSortService,
                   ResourceService,
                   MentorService,
                   ProjectService,
                   FundingService,
                   CollaborationService,
                   OpenPositionService,
                   TeachingService,
                   OutreachService,
                   MediaService,
                   ContactService,
                   DepartmentService,
                   UniversityService,
                   SettingsService,
                   NewsService,
                   PrivateService,
                   SeminarService,
                   SharedService,
                   ValidatorsService,
                   ValidatorsReadService,
                   MetaService,
                   SupportService,
                   WebSocketService,
                   {
                    provide: MatDialogRef,
                    useValue: {}
                   },

                   DatePipe
                 ],
    entryComponents: [
        ReadFormDialog,
        ImproveFormDialog
    ]
    })
export class SharedModule { }
