import { NgModule }                         from '@angular/core';
import { CommonModule }                     from '@angular/common';
import { RouterModule }                     from '@angular/router';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

import { MatDatepickerModule }              from '@angular/material/datepicker';
import { MaterialModule }                   from '../app.module';
import { NgxTwitterTimelineModule }         from 'ngx-twitter-timeline';

import { PipesModule }                      from '../pipes/pipes.module';
import { SharedModule }                     from '../shared/shared.module';

import { MissionService }                   from './services/mission-service';
import { ItemService }                      from './services/item-service';
import { DealService }                      from './services/deal-service';
import { TimerService }                     from './services/timer-service';

import { ScopeGuardService as ScopeGuard }  from '../auth/scope-guard.service';

import { ItemComponent }                    from './item/item.component';
import { NavbarComponent }                  from './item/navbar/navbar';

import { HomeComponent }                    from './item/home/home.component';
import { DetailsComponent }                 from './item/home/details/details.component';

import { DealComponent }                    from './item/deal/deal.component';
import { NewsComponent }                    from './item/news/news';
import { ContactComponent }                 from './item/contact/contact';

import { BuildSlideTldrComponent }          from './item/build-slide-tldr/build.component';
import { BuildSlideDealComponent }          from './item/build-slide-deal/build.component';
import { BuildSlidePlanComponent }          from './item/build-slide-plan/build.component';

import { SubmitComponent }                  from './submit/submit.component';
import { SubmitTrendComponent }             from './submit/trend/submit.component';
import { SubmitPodcastComponent }           from './submit/podcast/submit.component';
import { SubmitEventComponent }             from './submit/event/submit.component';
import { SubmitAppComponent }               from './submit/app/submit.component';

import { NgbModule }                        from '@ng-bootstrap/ng-bootstrap';
import { TrumbowygNgxModule }               from 'trumbowyg-ngx';

@NgModule({
    imports: [
      FormsModule,
      ReactiveFormsModule,
      CommonModule,
      MaterialModule,
      NgbModule,
      NgxTwitterTimelineModule,
      PipesModule,
      SharedModule,
      MatDatepickerModule,

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
              // ['formatting'],
              // ['fullscreen']
          ]
      }),

      RouterModule.forChild([
        {path: 'submit',                       component: SubmitComponent},
        // path: 'my-apps'
        // path: 'refer-a-friend'

        {path: ':item', component: ItemComponent,
          children: [
            {path: '',                         component: HomeComponent},
            // {path: 'events',                component: EventsComponent}, // program
            {path: 'deal',                     component: DealComponent},
            {path: 'news',                     component: NewsComponent},
            {path: 'contact',                  component: ContactComponent},

            {path: 'settings',                 loadChildren: () => import('./item/settings/settings.module').then(m => m.SettingsModule), canActivate: [ScopeGuard], data: { expectedScopes: ['write:departments']}},
            // purchase

          ]
        },
      ])
    ],
    declarations: [
      ItemComponent,
      NavbarComponent,

      HomeComponent,
      DetailsComponent,

      DealComponent,
      NewsComponent,
      ContactComponent,

      BuildSlideTldrComponent,
      BuildSlideDealComponent,
      BuildSlidePlanComponent,

      SubmitComponent,
      SubmitTrendComponent,
      SubmitPodcastComponent,
      SubmitEventComponent,
      SubmitAppComponent
    ],
    providers: [
      MissionService,
      ItemService,
      DealService,
      TimerService
    ],
})
export class ItemsMainModule { }
