import {NgModule}     from '@angular/core';
import {CommonModule} from '@angular/common';
import {RouterModule} from '@angular/router';
import {FormsModule} from '@angular/forms';

import {HelpComponent} from './help.component';
import {NavbarComponent} from './navbar/navbar';

import {HelpCenterComponent} from './help-center/help.component';

@NgModule({
    imports: [
        CommonModule,
        FormsModule,
        RouterModule.forChild([
          {path: '', component: HelpComponent,
            children: [
              {path: '',                     component: HelpCenterComponent}
            ]
          }
    ])],
    declarations: [ HelpComponent,
                    NavbarComponent,
                    HelpCenterComponent,
                    ],
    providers:    [
    ],
})
export class HelpMainModule { }
