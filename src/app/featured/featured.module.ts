import { NgModule }                         from '@angular/core';
import { CommonModule }                     from '@angular/common';
import { RouterModule }                     from '@angular/router';

import { FeaturedRoutingModule }            from './featured-routing.module';

import { PipesModule }                      from '../pipes/pipes.module';;

import { MaterialModule }                   from '../app.module';

import { HomeComponent }                    from './home/home.component';

@NgModule({
    imports: [
      FeaturedRoutingModule,

      CommonModule,
      MaterialModule,
      PipesModule
    ],
    declarations: [
      HomeComponent
    ],
    providers:    [],
})
export class FeaturedMainModule { }
