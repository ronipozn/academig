import { NgModule }               from '@angular/core';
import { Routes, RouterModule }   from '@angular/router';

import { UniversitiesComponent }         from './universities/universities.component';

const routes: Routes = [

  // {
  //   path: 'blog',
  //   loadChildren: () => import('./blog/blog.module').then(m => m.BlogModule)
  // },

  {
    path: '',
    component: UniversitiesComponent
  }

];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class TopsRoutingModule { }
