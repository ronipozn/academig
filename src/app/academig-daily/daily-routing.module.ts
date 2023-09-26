import { NgModule }               from '@angular/core';
import { Routes, RouterModule }   from '@angular/router';

import { SubscribeComponent }     from './subscribe/subscribe.component';
import { DailyComponent }         from './daily/daily.component';
import { NewsComponent }          from './news/news.component';
import { ArchiveComponent }       from './archive/archive.component';
import { SubmitComponent }        from './submit/submit.component'

const routes: Routes = [

  {
    path: '',
    component: SubscribeComponent
  },

  {
    path: 'latest',
    component: DailyComponent
  },

  {
    path: ':year/:month/:day',
    component: DailyComponent
  },

  {
    path: 'news',
    component: NewsComponent
  },

  {
    path: 'archive',
    component: ArchiveComponent
  },

  {
    path: 'submit',
    component: SubmitComponent
  }

];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class DailyRoutingModule { }
