import {NgModule}     from '@angular/core';
import {CommonModule} from '@angular/common';
import {RouterModule} from '@angular/router';
import {FormsModule, ReactiveFormsModule} from '@angular/forms';

import {LegalComponent} from './legal/legal.component';
import {PolicyComponent} from './legal/policy/policy';
import {TermsComponent} from './legal/terms/terms';
import {CopyrightComponent} from './legal/copyright/copyright'
import {AdvertisingComponent} from './legal/advertising-guidelines/advertising-guidelines';

import {PressComponent} from './promotions/press/press.component';
import {SuccessComponent} from './promotions/success/success';

import {AcademigProComponent} from './products/academig-pro/academig-pro';
import {AcademigLabsProComponent} from './products/academig-labs-pro/academig-labs-pro';
import {InfoPricingComponent} from './products/pricing/pricing.component';

import {JobsTemplateComponent} from './jobs/job-template/job-template';
import {JobsWhyComponent} from './jobs/why/why';

import {LabsComponent} from './leads/labs/labs';
import {CompaniesComponent} from './leads/companies/companies';
import {DepartmentsComponent} from './leads/departments/departments';
import {DepartmentRequestComponent} from './leads/departments/request/request';

import {AboutComponent} from './about/about.component';
import {FaqComponent} from './faq/faq';
import {TourComponent} from './tour/tour';
import {ChangesLogComponent} from './changes-log/changes-log';
import {AcademicResearchComponent} from './academic-research/academic-research';
import {ContactComponent} from './contact/contact.component';

import {LogOutComponent} from './log-out/log-out';
import {SignUpComponent} from './sign-up/sign-up';

import {SupportService} from '../shared/services/support-service';

import {FooterModule} from '../footer/footer.module';
import {PricingModule} from '../pricing/pricing.module';
import {PipesModule} from '../pipes/pipes.module';;

import {
  MatButtonModule,
  // MatInputModule,
  MatRippleModule,
  // MatFormFieldModule,
  MatTooltipModule,
  MatSelectModule
} from '@angular/material';

@NgModule({
    imports: [
        CommonModule,
        FormsModule,
        ReactiveFormsModule,
        FooterModule,
        PricingModule,

        MatButtonModule,
        MatRippleModule,
        // MatInputModule,
        MatSelectModule,
        MatTooltipModule,

        PipesModule,

        RouterModule.forChild([
            {path: 'logout',                            component: LogOutComponent},
            {path: 'signup',                            component: SignUpComponent},

            {path: 'about',                             component: AboutComponent},
            {path: 'press',                             component: PressComponent},
            {path: 'frequently-asked-questions',        component: FaqComponent},

            // {path: 'academic-job-description-template', component: JobsTemplateComponent},
            // {path: 'academic-job-benefits',             component: JobsWhyComponent},
            // {path: 'academic-job-guide',                component: JobsGuideComponent},

            {path: 'legal',                             component: LegalComponent,
              children: [
                {path: 'terms',                         component: TermsComponent},
                {path: 'policy',                        component: PolicyComponent},
                // {path: 'copyright',                     component: CopyrightComponent},
                // {path: 'advertising',                   component: AdvertisingComponent}
              ]
            },

            {path: 'tour',                              component: TourComponent},
            // {path: 'success',                        component: SuccessComponent},

            {path: 'contact',                           component: ContactComponent},

            {path: 'academig-pro',                      component: AcademigProComponent},
            {path: 'academig-pro-pricing',              component: InfoPricingComponent},

            {path: 'academig-lab-tools',                component: AcademigLabsProComponent},

            // {path: 'academig-company-pro',           component: AcademigCompanyProComponent},

            // {path: 'academig-department-pro',        component: AcademigDepartmentProComponent},

            {path: 'department-request',                component: DepartmentRequestComponent},

            {path: 'for-labs',                          component: LabsComponent},
            {path: 'for-companies',                     component: CompaniesComponent},
            {path: 'for-departments',                   component: DepartmentsComponent},

            // {path: 'changes-log',                     component: ChangesLogComponent}.
        ]),
    ],
    declarations: [AboutComponent,

                   FaqComponent,

                   PressComponent,

                   LegalComponent,
                   TermsComponent,
                   PolicyComponent,
                   CopyrightComponent,
                   AdvertisingComponent,

                   JobsTemplateComponent,
                   JobsWhyComponent,
                   InfoPricingComponent,

                   SuccessComponent,

                   TourComponent,

                   AcademicResearchComponent,

                   AcademigProComponent,
                   AcademigLabsProComponent,

                   ContactComponent,

                   ChangesLogComponent,

                   LabsComponent,
                   CompaniesComponent,
                   DepartmentsComponent,
                   DepartmentRequestComponent,

                   LogOutComponent,
                   SignUpComponent
                 ],
     providers:  [
                  SupportService
                 ]
})
export class InfoModule { }
