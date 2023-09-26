import {NgModule}                           from '@angular/core';
import {CommonModule}                       from '@angular/common';
import {RouterModule}                       from '@angular/router';
import {HttpClient, HttpClientModule}       from '@angular/common/http';

import {MarkdownModule}                     from 'ngx-markdown'

@NgModule({
  imports: [
    CommonModule,
    RouterModule.forChild([
      {path: '', pathMatch: 'full', loadChildren: () => import('./blog/blog-view.module').then(m => m.BlogViewModule)},
      {path: 'post', loadChildren: () => import('./post/blog-post-view.module').then(m => m.BlogPostViewModule)},
    ]),
    HttpClientModule,
    MarkdownModule.forRoot({ loader: HttpClient }),
  ]
})
export class BlogModule { }
