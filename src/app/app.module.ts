import { BrowserModule }                    from '@angular/platform-browser';
import { NgModule }                         from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { BrowserAnimationsModule }          from '@angular/platform-browser/animations';
import { HttpClientModule }                 from '@angular/common/http';

import { AppRoutingModule }                 from './app-routing.module';
import { AppComponent }                     from './app.component';

import { CallbackComponent }                from './callback/callback.component';
import { LoadingComponent }                 from './loading/loading.component';
import { VerifyComponent }                  from './verify/verify.component';
import { ProfileAuthComponent }             from './profile_auth/profile.component';

import { AppNavbarLoggedComponent }         from './navbar/navbar-logged/navbar-logged';
import { AppNavbarUnloggedComponent }       from './navbar/navbar-unlogged/navbar-unlogged';
import { SidebarComponent }                 from './navbar/sidebar/sidebar.component';

import { NotificationsComponent }           from './notifications/notifications.component';
import { NotificationItemComponent }        from './navbar/notification-item/notification-item';

import { NgAisModule }                      from 'angular-instantsearch';
import { LandingComponent }                 from './landing/landing.component';
import { LandingRefinementListComponent }   from './landing/refinementList.component';
import { LandingCurrentRefinements }        from './landing/currentRefinements.component';
import { ProgressBoxComponent }             from './progress-box/progress-box.component';
import { CompareBoxComponent }              from './compare-box/compare-box.component';
import { ReadBoxComponent, ReadBoxDialog }  from './read-box/read-box.component';

import { PeopleService }                    from './shared/services/people-service';
import { NewsService }                      from './shared/services/news-service';

import { CloseMenuDirectiveNav }            from './navbar/close-menu-nav.directive';

import { PipesModule }                      from './pipes/pipes.module';;
import { UserModule }                       from './user/user.module';
import { InfoModule }                       from './info/info.module';
import { FooterModule }                     from './footer/footer.module';
import { SignUpBuildModule }                from './build/signup//build.module';

import { Angulartics2Module }               from 'angulartics2';
import { Angulartics2GoogleAnalytics }      from 'angulartics2/ga';
import { CustomFormsModule }                from 'ng2-validation'
// import { DisqusModule }                     from 'ngx-disqus';
import { NgbModule }                        from '@ng-bootstrap/ng-bootstrap';
// import { PdfViewerModule }                  from 'ng2-pdf-viewer';
import { ClickOutsideModule}                from 'ng-click-outside';
import { CookieModule }                     from 'ngx-cookie';
import { LoggerModule, NgxLoggerLevel }     from 'ngx-logger';

import {environment} from '../environments/environment';

import {
  MatAutocompleteModule,
  MatButtonModule,
  MatButtonToggleModule,
  MatCardModule,
  MatCheckboxModule,
  MatChipsModule,
  MatDialogModule,
  MatExpansionModule,
  MatGridListModule,
  MatIconModule,
  MatInputModule,
  MatListModule,
  MatMenuModule,
  MatNativeDateModule,
  MatPaginatorModule,
  MatProgressBarModule,
  MatProgressSpinnerModule,
  MatRadioModule,
  MatRippleModule,
  MatSelectModule,
  MatSidenavModule,
  MatSliderModule,
  MatSlideToggleModule,
  MatSnackBarModule,
  MatSortModule,
  MatTableModule,
  MatTabsModule,
  MatToolbarModule,
  MatTooltipModule,
  MatStepperModule,
} from '@angular/material';
import { MatDatepickerModule } from '@angular/material/datepicker';

@NgModule({
  exports: [
    MatAutocompleteModule,
    MatButtonModule,
    MatButtonToggleModule,
    MatCardModule,
    MatCheckboxModule,
    MatChipsModule,
    MatStepperModule,
    MatDatepickerModule,
    MatDialogModule,
    MatExpansionModule,
    MatGridListModule,
    MatIconModule,
    MatInputModule,
    MatListModule,
    MatMenuModule,
    MatNativeDateModule,
    MatPaginatorModule,
    MatProgressBarModule,
    MatProgressSpinnerModule,
    MatRadioModule,
    MatRippleModule,
    MatSelectModule,
    MatSidenavModule,
    MatSliderModule,
    MatSlideToggleModule,
    MatSnackBarModule,
    MatSortModule,
    MatTableModule,
    MatTabsModule,
    MatToolbarModule,
    MatTooltipModule
  ]
})
export class MaterialModule {}

@NgModule({
  declarations: [
    AppComponent,

    CallbackComponent,
    LoadingComponent,
    VerifyComponent,

    NotificationsComponent,
    NotificationItemComponent,

    ProfileAuthComponent,

    AppNavbarLoggedComponent,
    AppNavbarUnloggedComponent,
    SidebarComponent,

    LandingComponent,
    LandingRefinementListComponent,
    LandingCurrentRefinements,
    ProgressBoxComponent,
    CompareBoxComponent,
    ReadBoxComponent,
    ReadBoxDialog,
    CloseMenuDirectiveNav
  ],
  imports: [
    NgAisModule.forRoot(),
    BrowserModule.withServerTransition({ appId: 'serverApp' }),
    FormsModule,
    HttpClientModule,
    ReactiveFormsModule,
    BrowserAnimationsModule,
    MatTooltipModule,
    SignUpBuildModule,
    UserModule.forRoot(),
    InfoModule,
    FooterModule,
    PipesModule,
    AppRoutingModule,
    LoggerModule.forRoot(
      {
        serverLoggingUrl: `${environment.apiUrl}api/logs`,
        level: environment.logLevel,
        serverLogLevel: environment.serverLogLevel,
      }
    ),
    CustomFormsModule,
    Angulartics2Module.forRoot([Angulartics2GoogleAnalytics]),
    CookieModule.forRoot(),
    // DisqusModule.forRoot('academig'),
    NgbModule,
    // PdfViewerModule,
    ClickOutsideModule
  ],
  providers: [],
  entryComponents: [
    ReadBoxDialog
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
