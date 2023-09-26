import {NgModule}     from '@angular/core';
import {CommonModule} from '@angular/common';
import {RouterModule} from '@angular/router';

import {BlogPostViewComponent} from './blog-post-view.component';

import {MarkdownModule} from 'ngx-markdown'

import {ShareButtonsModule} from '@ngx-share/buttons';

import {FooterModule} from '../../footer/footer.module';

@NgModule({
  declarations: [BlogPostViewComponent],
  imports: [
    CommonModule,
    RouterModule.forChild([
      { path: '', component: BlogPostViewComponent},
      { path: ':id', component: BlogPostViewComponent, pathMatch: 'full'}
    ]),
    // ComponentsModule,
    MarkdownModule.forChild(),
    ShareButtonsModule,
    FooterModule
  ]
})
export class BlogPostViewModule { }
