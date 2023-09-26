import { NgModule }                           from '@angular/core';
import { CommonModule }                       from '@angular/common';
import { RouterModule }                       from '@angular/router';
import { FormsModule, ReactiveFormsModule }   from '@angular/forms';

import { SharedModule}                        from '../shared/shared.module';
import { PipesModule }                        from '../pipes/pipes.module';;

import {
  CalendarDateFormatter,
  CalendarModule,
  CalendarMomentDateFormatter,
  DateAdapter,
  MOMENT
} from 'angular-calendar';
import { adapterFactory }                     from 'angular-calendar/date-adapters/date-fns';

import moment from 'moment-timezone';

import { PrivateAnalyticsListComponent }      from './analytics/analytics-list/analytics-list';
import { PrivateAnalyticsItemComponent }      from './analytics/analytics-item/analytics-item';
import { PrivateAnalyticsTableComponent }     from './analytics/analytics-table/analytics-table';
import { MdTableComponent }                   from './analytics/md-table/md-table.component';
import { MdChartComponent }                   from './analytics/md-chart/md-chart.component';

import { PrivateNewsListComponent }           from './news/news-list/news-list';
import { PrivateNewsItemComponent }           from './news/news-item/news-item';

import { PrivateChatComponent }               from './chat/chat.component';
import { ChatNewMessageComponent }            from './chat/chat-new-message/chat-new-message.component';
import { ChatMessagesComponent }              from './chat/chat-message/chat-message.component';
import { ChatHeadComponent }                  from './chat/chat-head/chat-head.component';

import { PrivateMeetingsListComponent }       from './seminars/meetings-list/meetings-list';
import { PrivateMeetingBuildComponent }       from './seminars/meeting-build/meeting-build';
import { PrivateSingleMeetingBuildComponent } from './seminars/single-meeting-build/single-meeting-build';
import { PrivateMeetingItemComponent }        from './seminars/meeting-item/meeting-item';
import { PrivateMeetingButtonsComponent }     from './seminars/meeting-buttons/meeting-buttons';
import { PrivateMeetingNextComponent }        from './seminars/meeting-next/meeting-next';

import { PrivateAssignmentsListComponent }        from './assignments/assignments-list/assignments-list';
import { PrivateSingleAssignmentBuildComponent }  from './assignments/single-assignment-build/single-assignment-build';
import { PrivateAssignmentItemComponent }         from './assignments/assignment-item/assignment-item';
import { PrivateAssignmentBuildComponent }        from './assignments/assignment-build/assignment-build';
import { PrivateAssignmentNextComponent }         from './assignments/assignment-next/assignment-next';
import { PrivateAssignmentSubmitComponent }       from './assignments/assignment-submit/assignment-submit';

import { PrivateCalendarListComponent }       from './calendar/calendar-list/calendar-list';
import { PrivateCalendarHeaderComponent }     from './calendar/calendar-list/calendar-header.component';
import { PrivateCalendarBuildComponent }      from './calendar/calendar-build/calendar-build';

import { PollsComponent }                     from './polls/polls';

import { PapersKitComponent }                 from './papers-kit/papers-kit';

import { PrivatePersonalListComponent }       from './personal/personal-list/personal-list';
import { PrivatePersonalItemComponent }       from './personal/personal-item/personal-item';
import { PrivatePersonalBuildComponent }      from './personal/personal-build/personal-build';
import { PrivatePersonalOutBuildComponent }   from './personal/personal-build/build-out/build-out';

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

@NgModule({
    imports: [
              CommonModule,
              FormsModule,
              ReactiveFormsModule,
              RouterModule,
              SharedModule,
              PipesModule,
              MaterialModule,

              CalendarModule.forRoot({
                provide: DateAdapter,
                useFactory: adapterFactory
              }),
             ],
    exports: [
              PrivateAnalyticsListComponent,
              PrivateChatComponent,
              ChatMessagesComponent,
              PrivateNewsListComponent,
              PrivateMeetingsListComponent,
              PrivateAssignmentsListComponent,
              PrivateCalendarListComponent,
              PapersKitComponent,
              PollsComponent,
              PrivatePersonalListComponent,
             ],
    declarations: [
                   PrivateNewsListComponent,
                   PrivateNewsItemComponent,

                   PrivateChatComponent,
                   ChatHeadComponent,
                   ChatMessagesComponent,
                   ChatNewMessageComponent,

                   PrivateCalendarListComponent,
                   PrivateCalendarHeaderComponent,
                   PrivateCalendarBuildComponent,

                   PapersKitComponent,

                   PollsComponent,

                   PrivateAnalyticsListComponent,
                   PrivateAnalyticsItemComponent,
                   PrivateAnalyticsTableComponent,

                   MdTableComponent,
                   MdChartComponent,

                   PrivateMeetingsListComponent,
                   PrivateMeetingBuildComponent,
                   PrivateSingleMeetingBuildComponent,
                   PrivateMeetingItemComponent,
                   PrivateMeetingButtonsComponent,
                   PrivateMeetingNextComponent,

                   PrivateAssignmentsListComponent,
                   PrivateAssignmentBuildComponent,
                   PrivateSingleAssignmentBuildComponent,
                   PrivateAssignmentItemComponent,
                   PrivateAssignmentNextComponent,
                   PrivateAssignmentSubmitComponent,

                   PrivatePersonalListComponent,
                   PrivatePersonalItemComponent,
                   PrivatePersonalBuildComponent,
                   PrivatePersonalOutBuildComponent
                  ],
    providers: [

               ],
      })
export class PrivateModule { }
