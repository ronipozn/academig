import { NgModule }                         from '@angular/core';
import { Routes, RouterModule }             from '@angular/router';

import { FollowingComponent }               from './following.component';
import { FollowTableComponent }             from './follow-table/follow-table.component';

const routes: Routes = [
  {path: '',                        component: FollowingComponent,
    children: [
      {path: '',                    redirectTo: 'labs', pathMatch: 'full'},
      {path: 'institutes',          component: FollowTableComponent},
      {path: 'departments',         component: FollowTableComponent},
      {path: 'labs',                component: FollowTableComponent},
      {path: 'companies',           component: FollowTableComponent},
      {path: 'researchers',         component: FollowTableComponent},
      {path: 'mentors',             component: FollowTableComponent},
      {path: 'services',            component: FollowTableComponent},
      {path: 'mentors',             component: FollowTableComponent},
      {path: 'podcasts',            component: FollowTableComponent},
      {path: 'events',              component: FollowTableComponent},
      {path: 'apps',                component: FollowTableComponent},
    ]
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class FollowingRoutingModule { }
