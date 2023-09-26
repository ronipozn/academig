import {NgModule}         from '@angular/core';
import {CommonModule}     from '@angular/common';
import {RouterModule}     from '@angular/router';
import {FormsModule, ReactiveFormsModule} from '@angular/forms';

import {FooterComponent} from './footer/footer.component';

import {
  MatButtonModule,
  MatInputModule,
  MatRippleModule,
  MatFormFieldModule,
  MatTooltipModule,
  MatSelectModule,
  MatCheckboxModule
} from '@angular/material';

@NgModule({
    imports: [
      CommonModule,
      RouterModule.forChild([]),
      MatButtonModule,
      MatRippleModule,
      MatFormFieldModule,
      MatInputModule,
      MatSelectModule,
      MatTooltipModule,
      MatCheckboxModule
    ],
    exports: [ FooterComponent ],
    declarations: [ FooterComponent ],
    providers: [ ]
})
export class FooterModule { }
