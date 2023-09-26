import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import {RouterModule} from '@angular/router';
import {FormsModule} from '@angular/forms';

import {RequestsComponent} from './requests.component';
import {MessagesHeadComponent } from './messages-head/messages-head.component';
import {MessagesListComponent } from './messages-list/messages-list.component';
import {MessagesBoxComponent } from './messages-box/messages-box.component';
import {NewMessageComponent } from './new-message/new-message.component';

import {SharedModule} from '../../shared/shared.module';
import {PipesModule} from '../../pipes/pipes.module';;

import {MaterialModule} from '../../app.module';

@NgModule({
    imports: [
        CommonModule,
        SharedModule,
        PipesModule,
        MaterialModule,
        FormsModule,
        RouterModule.forChild([
          {path: '', component: RequestsComponent}
        ])
    ],
    declarations: [ RequestsComponent,
                    MessagesHeadComponent,
                    MessagesListComponent,
                    MessagesBoxComponent,
                    NewMessageComponent
                  ],
    providers:    [
    ],
})
export class RequestsMainModule { }
