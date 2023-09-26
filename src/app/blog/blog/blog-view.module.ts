import {NgModule}                           from '@angular/core';
import {CommonModule}                       from '@angular/common';
import {RouterModule}                       from '@angular/router';

import {NgAisModule}                        from 'angular-instantsearch';
import {MarkdownModule}                     from 'ngx-markdown'

import {FooterModule}                       from '../../footer/footer.module';

import {BlogViewComponent}                  from './blog-view.component';

import { RefinementListComponent }          from './refinementList.component'
import { PaginationComponent }              from "./pagination.component";
import { LoadingIndicator }                 from './loading.component'

import {
  MatProgressBarModule,
  MatCheckboxModule
} from '@angular/material';

@NgModule({
  declarations: [
    BlogViewComponent,
    RefinementListComponent,
    PaginationComponent,
    LoadingIndicator
  ],
  imports: [
    CommonModule,
    RouterModule.forChild([
      { path: '', component: BlogViewComponent}
    ]),
    // ComponentsModule,
    MarkdownModule.forChild(),
    FooterModule,
    NgAisModule.forRoot(),
    MatProgressBarModule,
    MatCheckboxModule
  ]
})
export class BlogViewModule { }
