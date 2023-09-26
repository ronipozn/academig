import { NgModule }                         from '@angular/core';
import { CommonModule }                     from '@angular/common';
import { RouterModule }                     from '@angular/router';
import { FormsModule }                      from '@angular/forms';

import { TopsRoutingModule }                from './tops-routing.module';

import { SharedModule }                     from '../shared/shared.module';
import { PipesModule }                      from '../pipes/pipes.module';
import { FooterModule }                     from '../footer/footer.module';

import { MaterialModule }                   from '../app.module';

import { UniversitiesComponent }            from './universities/universities.component';
import { UniversityMapComponent }           from './universities/map/map.component';

@NgModule({
    imports: [
      TopsRoutingModule,

      CommonModule,
      FormsModule,

      SharedModule,
      MaterialModule,
      PipesModule,
      FooterModule
    ],
    declarations: [
                    UniversitiesComponent,
                    UniversityMapComponent
                  ],
    providers:    [],
})
export class TopUniversitiesMainModule { }
