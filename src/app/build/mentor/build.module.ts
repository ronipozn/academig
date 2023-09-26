import {NgModule}                                     from '@angular/core';
import {CommonModule}                                 from '@angular/common';
import {RouterModule}                                 from '@angular/router';
import {FormsModule, ReactiveFormsModule}             from '@angular/forms';
import {DatePipe}                                     from '@angular/common';
import {HttpClientModule}                             from '@angular/common/http';

import {BuildComponent}                               from './build.component';

import {ConfirmComponent}                             from './confirm/confirm.component';
//
import {MentorInfoComponent}                          from './mentor-info/mentor-info';
import {MentorSelfAssesComponent}                     from './mentor-self-asses/mentor-self-asses';
import {MentorExperienceExpectationsComponent}        from './mentor-experience-expectations/mentor-experience-expectations';

import {SharedModule}                                 from '../../shared/shared.module';
import {PipesModule}                                  from '../../pipes/pipes.module';;

// import {CustomFormsModule}                            from 'ng2-validation'
// import {NgbModule}                                    from '@ng-bootstrap/ng-bootstrap';
// import {AgmCoreModule}                                from '@agm/core';

import {
  MatStepperModule,
  MatButtonModule,
  MatInputModule,
  MatRippleModule,
  MatFormFieldModule,
  MatTooltipModule,
  MatProgressBarModule,
  MatSelectModule,
  MatSliderModule,
} from '@angular/material';
import { MatDatepickerModule } from '@angular/material/datepicker';

@NgModule({
    imports: [
        CommonModule,
        FormsModule,
        ReactiveFormsModule,
        HttpClientModule,

        // CustomFormsModule,
        // NgbModule,
        // AgmCoreModule.forRoot({apiKey: 'AIzaSyBZAggoJNVAYOGG0neuO_zYJw053wpqzrk'}),

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
        MatSliderModule,

        RouterModule.forChild([
          {path: '', component: BuildComponent},
          {path: 'confirm', component: ConfirmComponent},
        ])
    ],
    declarations: [ BuildComponent,
                    ConfirmComponent,
                    MentorInfoComponent,
                    MentorSelfAssesComponent,
                    MentorExperienceExpectationsComponent
                  ],
    providers:    [
                    DatePipe
                  ]
})
export class MentorBuildModule { }
