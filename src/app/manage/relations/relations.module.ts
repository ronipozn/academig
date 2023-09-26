import { NgModule}                         from '@angular/core';
import { CommonModule, DatePipe}           from '@angular/common';
import { RouterModule}                     from '@angular/router';
import { FormsModule, ReactiveFormsModule} from '@angular/forms';

import { RelationsComponent}               from './relations.component';

import { SharedModule}                     from '../../shared/shared.module';

import { TagInputModule}                   from 'ngx-chips';

@NgModule({
    imports: [
      TagInputModule,
      CommonModule,
      SharedModule,
      RouterModule.forChild([
        {path: '', component: RelationsComponent}
      ])
    ],
    declarations: [RelationsComponent],
    providers:    [DatePipe,
    ],
})
export class RelationsMainModule { }
