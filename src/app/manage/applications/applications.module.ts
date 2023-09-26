import { NgModule }                         from '@angular/core';
import { CommonModule, DatePipe }           from '@angular/common';
import { RouterModule }                     from '@angular/router';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

import { ApplicationsComponent }            from './applications.component';

import { SharedModule }                     from '../../shared/shared.module';

import { TagInputModule }                   from 'ngx-chips';

@NgModule({
    imports: [
      TagInputModule,
      CommonModule,
      SharedModule,
      RouterModule.forChild([
        {path: '', component: ApplicationsComponent}
      ])
    ],
    declarations: [ApplicationsComponent],
    providers:    [DatePipe,
    ],
})
export class ApplicationsMainModule { }
