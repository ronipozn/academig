import { NgModule }                         from '@angular/core';
import { CommonModule }                     from '@angular/common';
import { RouterModule }                     from '@angular/router';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

import { FollowingRoutingModule }           from './following-routing.module';

import { SharedModule }                     from '../shared/shared.module';
import { PipesModule }                      from '../pipes/pipes.module';;

import { MaterialModule }                   from '../app.module';

import { FollowingComponent }               from './following.component';
import { FollowTableComponent }             from './follow-table/follow-table.component';

@NgModule({
    imports: [
      FollowingRoutingModule,

      CommonModule,
      SharedModule,
      MaterialModule,
      PipesModule
    ],
    declarations: [
      FollowingComponent,
      FollowTableComponent,
    ],
    providers:    [],
})
export class FollowingMainModule { }
