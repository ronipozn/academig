import { NgModule }               from '@angular/core';
import { Routes, RouterModule }   from '@angular/router';

import { CallbackComponent }      from './callback/callback.component';
import { VerifyComponent }        from './verify/verify.component';
import { NotificationsComponent } from './notifications/notifications.component';

import { ProfileAuthComponent }   from './profile_auth/profile.component';

import { AuthGuard }              from './auth/auth.guard';

const routes: Routes = [

  {
    path: '#',
    redirectTo: '/',
    pathMatch: 'prefix'
  },

  {
    path: 'home',
    redirectTo: '/',
    pathMatch: 'prefix'
  },

  {
    path: 'verify',
    component: VerifyComponent,
    canActivate: [AuthGuard]
  },

  {
    path: 'notifications',
    component: NotificationsComponent,
    canActivate: [AuthGuard]
  },

  {
    path: '',
    loadChildren: () => import('./wall/wall.module').then(m => m.WallModule),
    // loadChildren: () => import('./handle.module').then(m => m.HandlerModule)
  },

  {
    path: 'admin',
    loadChildren: () => import('./admin/admin.module').then(m => m.AdminModule),
    canActivate: [AuthGuard] // FIX: DELETE
    // canActivate: [ScopeGuard], data: { expectedScopes: ['read:groups']} // UNMARK
  },

  {
    path: 'help',
    loadChildren: () => import('./help/help.module').then(m => m.HelpMainModule)
  },

  {
    path: 'blog',
    loadChildren: () => import('./blog/blog.module').then(m => m.BlogModule)
  },

  {
    path: 'daily',
    loadChildren: () => import('./academig-daily/daily.module').then(m => m.DailyMainModule)
  },

  {
    path: 'morning',
    loadChildren: () => import('./academig-morning/morning.module').then(m => m.MorningMainModule),
  },

  {
    path: 'post-job',
    loadChildren: () => import('./build/position/build.module').then(m => m.JobBuildModule),
  },

  {
    path: 'post-service',
    loadChildren: () => import('./build/service/build.module').then(m => m.ServiceBuildModule),
  },

  {
    path: 'become-mentor',
    loadChildren: () => import('./build/mentor/build.module').then(m => m.MentorBuildModule),
  },

  {
    path: 'compare',
    loadChildren: () => import('./compare/compare.module').then(m => m.CompareMainModule)
  },

  {
    path: 'invite-colleagues',
    loadChildren: () => import('./colleagues/colleagues.module').then(m => m.ColleaguesMainModule)
  },

  {
    path: 'following',
    loadChildren: () => import('./following/following.module').then(m => m.FollowingMainModule)
  },

  {
    path: 'messages',
    loadChildren: () => import('./messages/messages.module').then(m => m.MessagesMainModule),
    canActivate: [AuthGuard]
  },

  {
    path: 'search',
    loadChildren: () => import('./search/search.module').then(m => m.SearchMainModule)
  },

  {
    path: 'settings',
    loadChildren: () => import('./settings/settings.module').then(m => m.SettingsMainModule),
    canActivate: [AuthGuard]
  },

  // {path: 'user-activity',       loadChildren: './activity/activity.module#ActivityMainModule'},

  {
    path: 'relations',
    loadChildren: () => import('./manage/relations/relations.module').then(m => m.RelationsMainModule),
    canActivate: [AuthGuard]
  },

  {
    path: 'calendar',
    loadChildren: () => import('./manage/calendar/calendar.module').then(m => m.CalendarMainModule),
    canActivate: [AuthGuard],
    runGuardsAndResolvers: 'paramsChange'
  },

  {
    path: 'mentors',
    loadChildren: () => import('./manage/mentors/mentors.module').then(m => m.MentorsMainModule),
    canActivate: [AuthGuard],
    runGuardsAndResolvers: 'paramsChange'
  },

  {
    path: 'manage-services',
    loadChildren: () => import('./manage/requests/requests.module').then(m => m.RequestsMainModule),
    canActivate: [AuthGuard],
    runGuardsAndResolvers: 'paramsChange'
  },

  {
    path: 'manage-applications',
    loadChildren: () => import('./manage/applications/applications.module').then(m => m.ApplicationsMainModule),
    canActivate: [AuthGuard],
    runGuardsAndResolvers: 'paramsChange'
  },

  {
    path: 'manage-deals',
    loadChildren: () => import('./manage/deals/deals.module').then(m => m.DealsMainModule),
    canActivate: [AuthGuard],
    runGuardsAndResolvers: 'paramsChange'
  },

  {
    path: 'featured',
    loadChildren: () => import('./featured/featured.module').then(m => m.FeaturedMainModule),
  },

  { path: 'trends', loadChildren: () => import('./items/items.module').then(m => m.ItemsMainModule) },
  { path: 'podcasts', loadChildren: () => import('./items/items.module').then(m => m.ItemsMainModule) },
  { path: 'events', loadChildren: () => import('./items/items.module').then(m => m.ItemsMainModule) },
  { path: 'apps', loadChildren: () => import('./items/items.module').then(m => m.ItemsMainModule) },

  { path: 'countries', loadChildren: () => import('./top-universities/top.module').then(m => m.TopUniversitiesMainModule) },

  { path: 'top-universities', loadChildren: () => import('./top-universities/top.module').then(m => m.TopUniversitiesMainModule) },
  { path: 'top-universities-north-america', loadChildren: () => import('./top-universities/top.module').then(m => m.TopUniversitiesMainModule) },
  { path: 'top-universities-south-america', loadChildren: () => import('./top-universities/top.module').then(m => m.TopUniversitiesMainModule) },
  { path: 'top-universities-europe', loadChildren: () => import('./top-universities/top.module').then(m => m.TopUniversitiesMainModule) },
  { path: 'top-universities-africa', loadChildren: () => import('./top-universities/top.module').then(m => m.TopUniversitiesMainModule) },
  { path: 'top-universities-asia', loadChildren: () => import('./top-universities/top.module').then(m => m.TopUniversitiesMainModule) },
  { path: 'top-universities-oceania', loadChildren: () => import('./top-universities/top.module').then(m => m.TopUniversitiesMainModule) },

  { path: 'top-universities-united-states', loadChildren: () => import('./top-universities/top.module').then(m => m.TopUniversitiesMainModule) },
  { path: 'top-universities-united-kingdom', loadChildren: () => import('./top-universities/top.module').then(m => m.TopUniversitiesMainModule) },
  { path: 'top-universities-canada', loadChildren: () => import('./top-universities/top.module').then(m => m.TopUniversitiesMainModule) },
  { path: 'top-universities-australia', loadChildren: () => import('./top-universities/top.module').then(m => m.TopUniversitiesMainModule) },
  { path: 'top-universities-ireland', loadChildren: () => import('./top-universities/top.module').then(m => m.TopUniversitiesMainModule) },
  { path: 'top-universities-germany', loadChildren: () => import('./top-universities/top.module').then(m => m.TopUniversitiesMainModule) },
  { path: 'top-universities-france', loadChildren: () => import('./top-universities/top.module').then(m => m.TopUniversitiesMainModule) },
  { path: 'top-universities-india', loadChildren: () => import('./top-universities/top.module').then(m => m.TopUniversitiesMainModule) },
  { path: 'top-universities-china', loadChildren: () => import('./top-universities/top.module').then(m => m.TopUniversitiesMainModule) },

  { path: 'top-universities-facebook', loadChildren: () => import('./top-universities/top.module').then(m => m.TopUniversitiesMainModule) },
  { path: 'top-universities-twitter', loadChildren: () => import('./top-universities/top.module').then(m => m.TopUniversitiesMainModule) },
  { path: 'top-universities-linkedin', loadChildren: () => import('./top-universities/top.module').then(m => m.TopUniversitiesMainModule) },
  { path: 'top-universities-instagram', loadChildren: () => import('./top-universities/top.module').then(m => m.TopUniversitiesMainModule) },
  { path: 'top-universities-youtube', loadChildren: () => import('./top-universities/top.module').then(m => m.TopUniversitiesMainModule) },

  {
    path: 'callback',
    component: CallbackComponent
  },

  { path: 'publications/:publicationId', loadChildren: () => import('./details/details.module').then(m => m.DetailsModule), runGuardsAndResolvers: 'paramsChange' },

  { path: 'people/:profileId', loadChildren: () => import('./profile/profile.module').then(m => m.ProfileModule), runGuardsAndResolvers: 'paramsChange' },

  { path: 'country/:countryId/:stateId/:cityId', loadChildren: () => import('./top-universities/top.module').then(m => m.TopUniversitiesMainModule), runGuardsAndResolvers: 'paramsChange' },
  { path: 'country/:countryId/:stateId', loadChildren: () => import('./top-universities/top.module').then(m => m.TopUniversitiesMainModule), runGuardsAndResolvers: 'paramsChange' },
  { path: 'country/:countryId', loadChildren: () => import('./top-universities/top.module').then(m => m.TopUniversitiesMainModule), runGuardsAndResolvers: 'paramsChange' },

  // {
  //   path: 'country/:countryId/:stateId/:cityId',
  //   loadChildren: () => import('./search/search.module').then(m => m.SearchMainModule),
  //   runGuardsAndResolvers: 'paramsChange'
  // },
  // {
  //   path: 'country/:countryId/:stateId',
  //   loadChildren: () => import('./search/search.module').then(m => m.SearchMainModule),
  //   runGuardsAndResolvers: 'paramsChange'
  // },
  // {
  //   path: 'country/:countryId',
  //   loadChildren: () => import('./search/search.module').then(m => m.SearchMainModule),
  //   runGuardsAndResolvers: 'paramsChange'
  // },

  {
    path: ':universityId',
    loadChildren: () => import('./university/university.module').then(m => m.UniversityMainModule)
  }

];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
