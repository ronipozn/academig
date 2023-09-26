import {NgModule}       from '@angular/core';
import {CommonModule}   from '@angular/common';
import {RouterModule}     from '@angular/router';
import {FormsModule, ReactiveFormsModule} from '@angular/forms';

import {ColleaguesComponent} from './colleagues.component';
import {DepartmentComponent} from './department/department.component';
import {GoogleComponent} from './google/google.component';
import {FacebookComponent} from './facebook/facebook.component';
import {ResearchGateComponent} from './researchgate/researchgate.component';

import {SharedModule} from '../shared/shared.module';

@NgModule({
    imports: [
        CommonModule,
        SharedModule,
        FormsModule,
        ReactiveFormsModule,
        RouterModule.forChild([
          {path: '',                component: ColleaguesComponent,
            children: [
              {path: '',                  redirectTo: 'department', pathMatch: 'full'},
              {path: 'department',        component: DepartmentComponent},
              {path: 'google',            component: GoogleComponent},
              {path: 'facebook',          component: FacebookComponent},
              {path: 'researchgate',      component: ResearchGateComponent}
          ]}
        ])
    ],
    declarations: [ ColleaguesComponent,
                    DepartmentComponent,
                    GoogleComponent,
                    FacebookComponent,
                    ResearchGateComponent
                    ],
    providers:    [ ],
})
export class ColleaguesMainModule { }
