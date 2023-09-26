import { NgModule }                         from '@angular/core';
import { CommonModule, DatePipe }           from '@angular/common';
import { RouterModule }                     from '@angular/router';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

import { CalendarComponent }                from './calendar.component';
import { CalendarHeaderComponent }          from './calendar-header.component';

import { SharedModule }                     from '../../shared/shared.module';
import { PipesModule }                      from '../../pipes/pipes.module';

import { MaterialModule }                   from '../../app.module';
import { TagInputModule }                   from 'ngx-chips';

import {
  CalendarDateFormatter,
  CalendarModule,
  CalendarMomentDateFormatter,
  DateAdapter,
  MOMENT
} from 'angular-calendar';
import { adapterFactory }                   from 'angular-calendar/date-adapters/date-fns';

import moment from 'moment-timezone';

@NgModule({
    imports: [
      TagInputModule,
      CommonModule,
      SharedModule,
      PipesModule,
      MaterialModule,
      CalendarModule.forRoot({
        provide: DateAdapter,
        useFactory: adapterFactory
      }),
      RouterModule.forChild([
        {path: '', component: CalendarComponent}
      ])
    ],
    declarations: [CalendarComponent, CalendarHeaderComponent],
    providers:    [DatePipe],
})
export class CalendarMainModule { }
