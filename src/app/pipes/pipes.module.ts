import { NgModule }     from '@angular/core';

import { CapitalizePipe } from './capitalize.pipe';
import { SanitizerPipe } from './sanitizer.pipe';
import { FileExtensionPipe } from './extension.pipe';

import { SafePipe } from './safeHtml.pipe';
import { AcronymPipe } from './acronym.pipe';
import { MomentPipe } from './moment.pipe';
import { ZeronizePipe } from './zeronize.pipe';
import { URLizePipe } from './urlize.pipe';
import { CountryPipe } from './country.pipe';
import { FlagPipe } from './flag.pipe';
import { TruncatePipe } from './truncate.pipe';
import { RankPipe } from './rank.pipe';
import { LinkHttpPipe } from './http.pipe';
import { DepartmentIconPipe } from './department.pipe';

@NgModule({
  imports: [
    // dep modules
  ],
  declarations: [
    AcronymPipe,
    CapitalizePipe,
    CountryPipe,
    FileExtensionPipe,
    FlagPipe,
    MomentPipe,
    SafePipe,
    SanitizerPipe,
    TruncatePipe,
    URLizePipe,
    ZeronizePipe,
    RankPipe,
    LinkHttpPipe,
    DepartmentIconPipe
  ],
  exports: [
    CapitalizePipe,
    SanitizerPipe,
    FileExtensionPipe,
    SafePipe,
    AcronymPipe,
    MomentPipe,
    ZeronizePipe,
    URLizePipe,
    CountryPipe,
    FlagPipe,
    TruncatePipe,
    RankPipe,
    LinkHttpPipe,
    DepartmentIconPipe
  ]
})
export class PipesModule {}
