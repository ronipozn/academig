import {NgModule}                              from '@angular/core';
import {CommonModule}                          from '@angular/common';
import {RouterModule}                          from '@angular/router';
import {FormsModule, ReactiveFormsModule}      from '@angular/forms';

import {WallComponent}                         from './wall.component';
import {WallNewsComponent}                     from './news/news.component';

import {SharedModule}                          from '../shared/shared.module';
import {FooterModule}                          from '../footer/footer.module';
import {PipesModule}                           from '../pipes/pipes.module';;

import {NgAisModule}                           from 'angular-instantsearch';
import {LoadingIndicator}                      from './loading.component'

import {
  MatButtonModule,
  MatInputModule,
  MatRippleModule,
  MatFormFieldModule,
  MatTooltipModule,
  MatSelectModule,
  MatCheckboxModule,
  MatExpansionModule,
  MatProgressBarModule,
  MatTabsModule,
} from '@angular/material';

@NgModule({
    imports: [
      CommonModule,
      FormsModule,
      ReactiveFormsModule,

      FooterModule,
      SharedModule,
      PipesModule,

      MatButtonModule,
      MatRippleModule,
      MatFormFieldModule,
      MatInputModule,
      MatSelectModule,
      MatTooltipModule,
      MatCheckboxModule,
      MatExpansionModule,
      MatProgressBarModule,
      MatTabsModule,

      NgAisModule.forRoot(),

      RouterModule.forChild([
          {path: '',                                                     component: WallComponent,
            children: [
              // {
              //   path: '',
              //   loadChildren: () => import('../search/search.module').then(m => m.SearchMainModule),
              //   // loadChildren: () => import('./handle.module').then(m => m.HandlerModule)
              // },
            ]}
        ]),
    ],
    declarations: [
                    WallComponent,
                    WallNewsComponent,
                    LoadingIndicator,
                  ],
    providers:    [ ]
})
export class WallModule { }
