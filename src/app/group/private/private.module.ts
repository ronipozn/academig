import {NgModule}              from '@angular/core';
import {CommonModule}          from '@angular/common';
import {RouterModule}          from '@angular/router';

import {PrivateComponent}      from './private.component';

import {ReportsComponent}      from './reports/reports.component';
import {NewsComponent}         from './news/news.component';
import {ChatComponent}         from './chat/chat.component';
import {SeminarsComponent}     from './seminars/seminars.component';
import {AssignmentsComponent}  from './assignments/assignments.component';
import {CalendarComponent}     from './calendar/calendar.component';
import {PollsComponent}        from './polls/polls.component';
import {PapersKitComponent}    from './papers/papers.component';
import {PersonalInfoComponent} from './personal/personal.component';

import {SharedModule}          from '../../shared/shared.module';
import {PrivateModule}         from '../../private/private.module';

@NgModule({
    imports: [
        CommonModule,
        SharedModule,
        PrivateModule,
        RouterModule.forChild([
          {path: '',                      component: PrivateComponent,
            children: [
              {path: '',                  redirectTo: 'news', pathMatch: 'full'},
              {path: 'reports',           component: ReportsComponent},

              {path: 'news',              component: NewsComponent},
              {path: 'chat',              component: ChatComponent},
              {path: 'personal-info',     component: PersonalInfoComponent},

              {path: 'seminars',          component: SeminarsComponent},
              {path: 'assignments',       component: AssignmentsComponent},
              {path: 'calendar',          component: CalendarComponent},

              {path: 'polls',             component: PollsComponent},

              {path: 'papers-kit',        component: PapersKitComponent}
            ]
          }
        ])
    ],
    declarations: [ PrivateComponent,

                    ReportsComponent,
                    NewsComponent,
                    ChatComponent,
                    SeminarsComponent,
                    AssignmentsComponent,
                    CalendarComponent,
                    PollsComponent,
                    PapersKitComponent,
                    PersonalInfoComponent
                    ],
    providers:    [
    ],
})
export class PrivateModuleGroup {}
