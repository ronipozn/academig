import {NgModule}       from '@angular/core';
import {CommonModule}   from '@angular/common';
import {RouterModule}     from '@angular/router';

import {FormsModule, ReactiveFormsModule} from '@angular/forms';

import {SettingsComponent} from './settings.component';

import {AccountComponent} from './account/account.component';
import {ThemeComponent} from './theme/theme.component';
import {InstituteComponent} from './institute/institute.component';
import {LibraryComponent} from './library/library.component';
import {NotificationsComponent} from './notifications/notifications.component';
// import {PrivacyComponent} from "./privacy/privacy.component";
import {PlanComponent} from './plan/plan.component';
import {ReportComponent} from './report/report.component';
// import {SocialComponent} from "./social/social.component";
// import {EmbedComponent} from "./embed/embed.component";
import {DeleteComponent} from './delete/delete.component';

import {SharedModule} from '../shared/shared.module';
import {PricingModule} from '../pricing/pricing.module';

import {NgbModule} from '@ng-bootstrap/ng-bootstrap';

import {MaterialModule} from '../app.module';

@NgModule({
    imports: [
        CommonModule,
        SharedModule,
        PricingModule,
        FormsModule,
        NgbModule,
        ReactiveFormsModule,
        MaterialModule,
        RouterModule.forChild([
          {path: '',                                component: SettingsComponent,
            children: [
              {path: '',                            redirectTo: 'account', pathMatch: 'full'},
              {path: 'account',                     component: AccountComponent},
              // {path: 'theme',                       component: ThemeComponent},
              {path: 'notifications',               component: NotificationsComponent},
              {path: 'institute',                   component: InstituteComponent},
              {path: 'library',                     component: LibraryComponent},
              {path: 'plan',                        component: PlanComponent},
              // {path: 'notifications',               component: NotificationsComponent},
              // {path: 'privacy',                     component: PrivacyComponent},
              {path: 'report-and-block',            component: ReportComponent},
              // {path: 'social-accounts',             component: SocialComponent},
              // {path: 'embed',                       component: EmbedComponent},
              {path: 'delete-account',              component: DeleteComponent},
          ]}
        ])
    ],
    declarations: [ SettingsComponent,
                    AccountComponent,
                    ThemeComponent,
                    NotificationsComponent,
                    // PrivacyComponent,
                    InstituteComponent,
                    LibraryComponent,
                    PlanComponent,
                    ReportComponent,
                    // SocialComponent,
                    // EmbedComponent,
                    DeleteComponent
                    ],
    providers:    [
    ],
})
export class SettingsMainModule { }
