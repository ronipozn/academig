import {NgModule}                               from '@angular/core';
import {CommonModule}                           from '@angular/common';
import {RouterModule}                           from '@angular/router';
import {FormsModule, ReactiveFormsModule}       from '@angular/forms';

import {PricingComponent}                       from './pricing/pricing.component';
import {PlanComponent}                          from './plan/plan.component';
import {CardComponent}                          from './card.component';

import {FaqResearchersComponent}                from './faq/researchers/researchers.component';
import {FaqLabsComponent}                       from './faq/labs/labs.component';

@NgModule({
    imports: [
              CommonModule,
              FormsModule,
              ReactiveFormsModule,
              RouterModule
             ],
    exports: [
              PricingComponent,
              PlanComponent,
             ],
    declarations: [
                   PricingComponent,
                   PlanComponent,
                   CardComponent,

                   FaqResearchersComponent,
                   FaqLabsComponent
                  ],
    providers: [

               ],
      })
export class PricingModule { }
