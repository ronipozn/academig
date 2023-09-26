import { NgModule }                         from '@angular/core';
import { CommonModule }                     from '@angular/common';
import { RouterModule }                     from '@angular/router';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

import { DailyRoutingModule }               from './daily-routing.module';

import { PipesModule }                      from '../pipes/pipes.module';;
import { MaterialModule }                   from '../app.module';
import { FooterModule }                     from '../footer/footer.module';

import { SubscribeComponent }               from './subscribe/subscribe.component';
import { DailyComponent }                   from './daily/daily.component';
import { NewsComponent }                    from './news/news.component'
import { ArchiveComponent }                 from './archive/archive.component';
import { SubmitComponent }                  from './submit/submit.component'

import { RefinementListComponent }          from './services/refinementList.component'
import { PaginationComponent }              from "./services/pagination.component";
import { LoadingIndicator }                 from './services/loading.component'

import { DailyService }                   from './services/daily-service'

import { NgAisModule }                      from 'angular-instantsearch';

@NgModule({
    imports: [
      DailyRoutingModule,
      FormsModule,
      ReactiveFormsModule,
      CommonModule,
      FooterModule,
      MaterialModule,
      PipesModule,
      NgAisModule.forRoot()
    ],
    declarations: [
      SubscribeComponent,
      DailyComponent,
      NewsComponent,
      ArchiveComponent,
      SubmitComponent,

      RefinementListComponent,
      PaginationComponent,
      LoadingIndicator,
    ],
    providers: [DailyService],
})
export class DailyMainModule { }
