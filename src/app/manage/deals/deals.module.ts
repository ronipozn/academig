import { NgModule }                         from '@angular/core';
import { CommonModule, DatePipe }           from '@angular/common';
import { RouterModule }                     from '@angular/router';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

import { DealsComponent }                   from './deals.component';

import { SharedModule }                     from '../../shared/shared.module';
import { MaterialModule }                   from '../../app.module';

import { TagInputModule }                   from 'ngx-chips';

@NgModule({
    imports: [
      TagInputModule,
      CommonModule,
      SharedModule,
      MaterialModule,
      RouterModule.forChild([
        {path: '', component: DealsComponent}
      ])
    ],
    declarations: [DealsComponent],
    providers:    [DatePipe ],
})
export class DealsMainModule { }
