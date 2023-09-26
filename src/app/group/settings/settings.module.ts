import {NgModule}       from '@angular/core';
import {CommonModule}   from '@angular/common';
import {RouterModule}     from '@angular/router';
import {FormsModule, ReactiveFormsModule} from '@angular/forms';

import {SettingsComponent} from './settings.component';

import {AccountComponent} from './account/account.component';
import {BuildSlideDataComponent} from './account/build-data/build-data.component';

import {PlanComponent} from './plan/plan.component';
import {NotificationsComponent} from './notifications/notifications.component';
import {ToolsComponent} from "./tools/tools.component";
import {DeleteComponent} from './delete/delete.component';

import {SharedModule} from '../../shared/shared.module';
import {PricingModule} from '../../pricing/pricing.module';

import {MaterialModule} from '../../app.module';

@NgModule({
    imports: [
        CommonModule,
        SharedModule,
        MaterialModule,
        FormsModule,
        PricingModule,
        ReactiveFormsModule,
        RouterModule.forChild([
          {path: '',                component: SettingsComponent,
            children: [
              {path: '',            redirectTo: 'account', pathMatch: 'full'},
              {path: 'billing',     component: PlanComponent},
            ]}
        ])
    ],
    declarations: [ SettingsComponent,
                    AccountComponent,
                    PlanComponent,
                    NotificationsComponent,
                    ToolsComponent,
                    // HistoryComponent,
                    // EmbedComponent,
                    // IntegrationsComponent,
                    DeleteComponent,
                    BuildSlideDataComponent
                    ],
    providers:    [
    ],
})
export class SettingsModule { }
