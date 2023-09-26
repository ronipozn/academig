import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import {RouterModule} from '@angular/router';
import {FormsModule} from '@angular/forms';

import {MessagesComponent} from './messages.component';
import {MessagesHeadComponent } from './messages-head/messages-head.component';
import {MessagesBoxComponent } from './messages-box/messages-box.component';
import {NewMessageComponent } from './new-message/new-message.component';

import {SharedModule} from '../shared/shared.module';
import {PipesModule} from '../pipes/pipes.module';;

@NgModule({
    imports: [
        CommonModule,
        SharedModule,
        FormsModule,
        PipesModule,
        RouterModule.forChild([
          {path: '', component: MessagesComponent}
        ])
    ],
    declarations: [ MessagesComponent,
                    MessagesBoxComponent,
                    NewMessageComponent,
                    MessagesHeadComponent
                  ],
    providers:    [
    ],
})
export class MessagesMainModule { }
