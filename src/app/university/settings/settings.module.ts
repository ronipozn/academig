import {NgModule}       from '@angular/core';
import {CommonModule}   from '@angular/common';
import {RouterModule}     from '@angular/router';

import {FormsModule} from '@angular/forms';

import {SettingsComponent} from './settings.component';

import {AccountComponent} from './account/account.component';
import {DeleteComponent} from './delete/delete.component';

import {SharedModule} from '../../shared/shared.module';
import {PipesModule} from '../../pipes/pipes.module';;

@NgModule({
    imports: [
        CommonModule,
        SharedModule,
        FormsModule,
        PipesModule,
        RouterModule.forChild([{path: '', component: SettingsComponent}])
    ],
    declarations: [
                    SettingsComponent,
                    AccountComponent,
                    DeleteComponent
                  ],
    providers: [ ],
})
export class SettingsModule { }
