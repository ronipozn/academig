import { NgModule }                         from '@angular/core';
import { CommonModule }                     from '@angular/common';
import { RouterModule }                     from '@angular/router';

import { KitsRoutingModule }                from './kits-routing.module';

import { PipesModule }                      from '../../pipes/pipes.module';;

import { MaterialModule }                   from '../../app.module';

import { HomeComponent }                    from './home/home.component';

@NgModule({
    imports: [
      KitsRoutingModule,

      CommonModule,
      MaterialModule,
      PipesModule
    ],
    declarations: [
      HomeComponent
    ],
    providers:    [],
})
export class PapersKitsMainModule { }
