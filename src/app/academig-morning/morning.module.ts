import { NgModule }                         from '@angular/core';
import { CommonModule }                     from '@angular/common';
import { RouterModule }                     from '@angular/router';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

import { MorningRoutingModule }             from './morning-routing.module';

import { PipesModule }                      from '../pipes/pipes.module';;
import { MaterialModule }                   from '../app.module';
import { FooterModule }                     from '../footer/footer.module';

import { SubscribeComponent }               from './subscribe/subscribe.component';
import { MorningComponent }                  from './morning/morning.component'
import { ArchiveComponent }                 from './archive/archive.component'
import { SubmitComponent }                  from './submit/submit.component'

import { StoriesComponent }                 from './stories/stories.component';
import { StoriesAllComponent }              from './stories/all/all.component';
import { StoryComponent }                   from './stories/story/story.component';

import { RefinementListComponent }          from './services/refinementList.component'
import { PaginationComponent }              from "./services/pagination.component";
import { LoadingIndicator }                 from './services/loading.component'

import { MorningService }                   from './services/morning-service'

import { AdComponent }                      from './adsense.component';

import { TrumbowygNgxModule }               from 'trumbowyg-ngx';
import { NgAisModule }                      from 'angular-instantsearch';
import { MatCardModule }                    from '@angular/material/card';

@NgModule({
    imports: [
      MorningRoutingModule,
      FormsModule,
      ReactiveFormsModule,
      CommonModule,
      MaterialModule,
      FooterModule,
      PipesModule,
      MatCardModule,

      TrumbowygNgxModule.withConfig({
          lang: 'hu',
          svgPath: '/assets/icons.svg',
          removeformatPasted: true,
          autogrow: true,
          btns: [
              ['undo', 'redo'], // Only supported in Blink browsers
              ['fontsize', 'foreColor', 'backColor'],
              ['link'],
              ['strong', 'em', 'underline'],
              ['superscript', 'subscript'],
              ['removeformat'],
              ['horizontalRule'],
              ['unorderedList', 'orderedList'],
              ['justifyLeft', 'justifyCenter', 'justifyRight', 'justifyFull'],
          ]
      }),
      NgAisModule.forRoot()
    ],
    declarations: [
      SubscribeComponent,
      MorningComponent,
      ArchiveComponent,
      SubmitComponent,

      StoriesComponent,
      StoryComponent,
      StoriesAllComponent,

      RefinementListComponent,
      PaginationComponent,
      LoadingIndicator,
      AdComponent
    ],
    providers: [MorningService],
})
export class MorningMainModule { }
