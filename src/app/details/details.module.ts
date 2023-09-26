import {NgModule}                              from '@angular/core';
import {CommonModule}                          from '@angular/common';
import {RouterModule}                          from '@angular/router';

import {DetailsComponent}                      from './details.component';

import {SharedModule}                          from '../shared/shared.module';
import {FooterModule}                          from '../footer/footer.module';
import {PipesModule}                           from '../pipes/pipes.module';;

@NgModule({
    imports: [
      CommonModule,

      FooterModule,
      SharedModule,
      PipesModule,

      RouterModule.forChild([
        {path: '',                              component: DetailsComponent},
      ]),
    ],
    declarations: [ DetailsComponent ],
    providers:    [ ]
})
export class DetailsModule { }
