import {NgModule}     from '@angular/core';
import {CommonModule} from '@angular/common';
import {RouterModule} from '@angular/router';
import {FormsModule, ReactiveFormsModule} from '@angular/forms';
import {DatePipe} from '@angular/common';
import {HttpClientModule} from '@angular/common/http';

import {BuildComponent} from './build.component';

import {ConfirmComponent} from './confirm/confirm.component';
import {CancelComponent} from './cancel/cancel.component';

import {PositionInfoComponent} from './position-info/position-info';
import {GroupInfoComponent} from './group-info/group-info';
import {GroupLogoComponent} from './group-info/logo/logo';
import {UserInfoComponent} from './user-info/user-info';
import {PIInfoComponent} from './pi-info/pi-info';

import {StandOutComponent} from './stand-out/stand-out';
import {ExtrasComponent} from './extras/extras';
import {ExtrasLabComponent} from './extras-lab/extras';

import {PreviewComponent} from './preview/preview';
import {PreviewItemComponent} from './preview/item/item';
import {PreviewDetailsComponent} from './preview/details/details';
// import {PreviewProfileComponent} from './preview/profile/profile';

// PaymentComponent

import {SharedModule} from '../../shared/shared.module';
import {PipesModule} from '../../pipes/pipes.module';;

import {CustomFormsModule} from 'ng2-validation'

import {NgbModule} from '@ng-bootstrap/ng-bootstrap';
import {AgmCoreModule} from '@agm/core';

import {LabsizePipe} from './preview/labsize.pipe';
import {NamePipe} from './preview/name.pipe';

import {
  MatStepperModule,
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
        HttpClientModule,

        CustomFormsModule,
        NgbModule,
        AgmCoreModule.forRoot({apiKey: 'AIzaSyBZAggoJNVAYOGG0neuO_zYJw053wpqzrk'}),

        SharedModule,
        PipesModule,

        MatStepperModule,
        MatButtonModule,
        MatInputModule,
        MatRippleModule,
        MatFormFieldModule,
        MatTooltipModule,
        MatProgressBarModule,
        MatSelectModule,
        MatDatepickerModule,

        RouterModule.forChild([
          {path: '', component: BuildComponent},
          {path: 'confirm/:positionId', component: ConfirmComponent},
          {path: 'cancel', component: CancelComponent}
        ])
    ],
    declarations: [ BuildComponent,

                    ConfirmComponent,
                    CancelComponent,

                    PositionInfoComponent,
                    GroupInfoComponent,
                    GroupLogoComponent,
                    UserInfoComponent,
                    PIInfoComponent,

                    StandOutComponent,
                    ExtrasComponent,
                    ExtrasLabComponent,

                    PreviewComponent,
                    PreviewItemComponent,
                    PreviewDetailsComponent,

                    LabsizePipe,
                    NamePipe
                  ],
    providers:    [
                    DatePipe
                  ],
})
export class JobBuildModule { }
