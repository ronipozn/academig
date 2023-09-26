import { NgModule }               from '@angular/core';
import { Routes, RouterModule }   from '@angular/router';

import { SubscribeComponent }     from './subscribe/subscribe.component';
import { MorningComponent }       from './morning/morning.component';
import { ArchiveComponent }       from './archive/archive.component'
import { SubmitComponent }        from './submit/submit.component'

import { StoriesComponent }       from './stories/stories.component'
import { StoryComponent }         from './stories/story/story.component'
import { StoriesAllComponent }    from './stories/all/all.component'

const routes: Routes = [

  {
    path: '',
    component: SubscribeComponent
  },

  {
    path: 'latest',
    component: MorningComponent
  },

  {
    path: ':year/:month/:day',
    component: MorningComponent
  },

  {
    path: 'stories',
    component: StoriesComponent
  },

  {
    path: 'stories/all',
    component: StoriesAllComponent
  },

  {
    path: 'stories/:year/:month/:day/:story',
    component: StoryComponent
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
export class MorningRoutingModule { }
