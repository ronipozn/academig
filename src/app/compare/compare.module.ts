import { NgModule }                         from '@angular/core';
import { CommonModule, DatePipe }           from '@angular/common';
import { RouterModule }                     from '@angular/router';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

import { SharedModule }                     from '../shared/shared.module';
import { PipesModule }                      from '../pipes/pipes.module';;

import { MaterialModule }                   from '../app.module';
import { TagInputModule }                   from 'ngx-chips';
import { NgxGalleryModule }                 from 'ngx-gallery';
import { AgmCoreModule }                    from '@agm/core';

import { CompareComponent }                 from './compare.component';
import { ComparePeopleComponent }           from './people/compare-people';
import { CompareStatsComponent}             from './compare-stats/compare-stats';

@NgModule({
    imports: [
      TagInputModule,
      CommonModule,
      SharedModule,
      MaterialModule,
      NgxGalleryModule,
      PipesModule,
      AgmCoreModule.forRoot({apiKey: 'AIzaSyADPfY982ZEO3u3qptwAYFgXP8IJRoiqIE'}),
      RouterModule.forChild([
        {path: '', component: CompareComponent}
      ])
    ],
    declarations: [CompareComponent, ComparePeopleComponent, CompareStatsComponent],
    providers:    [DatePipe],
})
export class CompareMainModule { }
