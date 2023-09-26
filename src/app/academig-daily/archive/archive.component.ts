import {Component, OnInit, Input} from '@angular/core';
import {Title} from '@angular/platform-browser';

import {MatTableDataSource} from '@angular/material/table';

import {AuthService} from '../../auth/auth.service';

import algoliasearch from 'algoliasearch/lite';

const searchClient = algoliasearch(
  'TDKUK8VW4T',
  '73303e9badf36767a06c37395b6a3693'
);

import * as moment from 'moment';

import {environment} from '../../../environments/environment';
// import { MetaService } from '../shared/services/meta-service';

export interface ArchiveElement {
  headline: string;
  sub_headline: string;
  date: string;
  // date: Date;
}

@Component({
  selector: 'archive',
  templateUrl: 'archive.html',
  styleUrls: ['archive.css']
})
export class ArchiveComponent implements OnInit {
  displayedColumns: string[] = ['name', 'date'];
  dataSource: MatTableDataSource<ArchiveElement>;

  config_morning = {
    indexName: environment.algolia.daily,
    searchClient,
  };

  adminFlag: boolean;
  streamRetrieved: boolean;

  moment: any = moment;

  constructor(private titleService: Title,
              private authService: AuthService,
              // private metaService: MetaService,
             ) {
    this.titleService.setTitle('Academig Daily');
  }

  ngOnInit() {
    this.streamRetrieved = false;

    this.authService.token.subscribe(token => {
      this.adminFlag = this.authService.userHasScopes(token, ['write:departments']);
    });
  }

  transformArchive = (data) => {
    // ArchiveElement
    let dataKits = data.map(
      u => ({
        headline: u.headline,
        sub_headline: u.sub_headline,
        date: u.date,
      })
    )
    this.dataSource = new MatTableDataSource(dataKits);
    this.streamRetrieved = true;
    return data
  }

}
