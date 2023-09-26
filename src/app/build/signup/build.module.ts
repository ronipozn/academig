import {NgModule}     from '@angular/core';
import {CommonModule} from '@angular/common';
import {RouterModule} from '@angular/router';
import {FormsModule, ReactiveFormsModule} from '@angular/forms';

import {SignUpBuildComponent} from './build.component';
import {SignUpBuildRestrictComponent} from './restrict/restrict';

import {SignUpBuildWelcomeComponent} from './welcome/welcome';
import {SignUpBuildPersonalInfoComponent} from './personal-info/personal-info';
import {SignUpBuildInvitesComponent} from './invites/invites';
import {SignUpBuildAboutComponent} from './about/about';
import {SignUpBuildNamesComponent} from './names/names';
import {SignUpBuildCurrentWebsiteComponent} from './current-website/current-website';
import {SignUpBuildInstituteEmailComponent} from './institute-email/institute-email';
import {SignUpBuildGroupInfoComponent} from './group-info/group-info';
import {SignUpBuildGroupPeopleComponent} from './group-people/group-people';
import {SignUpBuildGroupLogoComponent} from './group-logo/group-logo';
import {SignUpBuildGroupPrivacyComponent} from './group-privacy/group-privacy';
import {SignUpBuildUserInfoComponent} from './user-info/user-info';
import {SignUpBuildCoverComponent} from './cover/cover';
import {SignUpBuildNewsletterComponent} from './newsletter/newsletter';
import {SignUpBuildLibraryComponent} from './library/library';
import {SignUpBuildMentoringComponent} from './mentoring/mentoring';
import {SignUpBuildTopicsComponent} from './topics/topics';
import {SignUpBuildFollowComponent} from './follow/follow';

import {SignUpBuildPlanComponent} from './plan/plan';
import {SignUpBuildPIInfoComponent} from './pi-info/pi-info';
import {SignUpBuildFinishComponent} from './finish/finish';

import {PricingModule} from '../../pricing/pricing.module';
import {SharedModule} from '../../shared/shared.module';
import {PipesModule} from '../../pipes/pipes.module';;

import {DatePipe} from '@angular/common';

import {NgAisModule} from 'angular-instantsearch';
import {NgbModule} from '@ng-bootstrap/ng-bootstrap';
import {HttpClientModule} from '@angular/common/http';
import {CustomFormsModule} from 'ng2-validation'

import {
  MatButtonModule,
  MatInputModule,
  MatRippleModule,
  MatFormFieldModule,
  MatTooltipModule,
  MatProgressBarModule,
  MatSelectModule
} from '@angular/material';
import { MatDatepickerModule } from '@angular/material/datepicker';

@NgModule({
    imports: [
        CommonModule,
        FormsModule,
        ReactiveFormsModule,
        CustomFormsModule,
        SharedModule,
        PricingModule,
        PipesModule,
        NgbModule,
        NgAisModule.forRoot(),
        HttpClientModule,

        MatButtonModule,
        MatInputModule,
        MatRippleModule,
        MatFormFieldModule,
        MatTooltipModule,
        MatProgressBarModule,
        MatSelectModule,
        MatDatepickerModule,

        RouterModule.forChild([ {path: 'build', component: SignUpBuildComponent} ]),
        RouterModule.forChild([ {path: 'build-lab', component: SignUpBuildComponent} ])
    ],
    declarations: [ SignUpBuildComponent,
                    SignUpBuildRestrictComponent,
                    SignUpBuildPersonalInfoComponent,
                    SignUpBuildInvitesComponent,
                    SignUpBuildAboutComponent,
                    SignUpBuildNamesComponent,
                    SignUpBuildWelcomeComponent,
                    SignUpBuildCurrentWebsiteComponent,
                    SignUpBuildInstituteEmailComponent,
                    SignUpBuildGroupInfoComponent,
                    SignUpBuildGroupPeopleComponent,
                    SignUpBuildGroupLogoComponent,
                    SignUpBuildGroupPrivacyComponent,
                    SignUpBuildUserInfoComponent,
                    SignUpBuildCoverComponent,
                    SignUpBuildNewsletterComponent,
                    SignUpBuildLibraryComponent,
                    SignUpBuildMentoringComponent,
                    SignUpBuildTopicsComponent,
                    SignUpBuildFollowComponent,
                    SignUpBuildPIInfoComponent,
                    SignUpBuildPlanComponent,
                    SignUpBuildFinishComponent
                    ],
    providers:    [DatePipe
                 ],
})
export class SignUpBuildModule { }
