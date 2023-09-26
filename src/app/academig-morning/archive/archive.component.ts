import {Component, OnInit, Input} from '@angular/core';
import {Title} from '@angular/platform-browser';

import {MatTableDataSource} from '@angular/material/table';

import algoliasearch from 'algoliasearch/lite';

import {AuthService} from '../../auth/auth.service';

const searchClient = algoliasearch(
  'TDKUK8VW4T',
  '73303e9badf36767a06c37395b6a3693'
);

import * as moment from 'moment';

import {environment} from '../../../environments/environment';
// import { MetaService } from '../shared/services/meta-service';

export interface ArchiveElement {
  topic: string;
  sub_topic: string;
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
    indexName: environment.algolia.morning,
    searchClient,
  };

  adminFlag: boolean;
  streamRetrieved: boolean;

  moment: any = moment;

  constructor(private titleService: Title,
              private authService: AuthService
              // private metaService: MetaService,
             ) {
    this.titleService.setTitle('Academig Morning');
  }

  ngOnInit() {
    this.streamRetrieved = false;

    this.authService.token.subscribe(token => {
      this.adminFlag = this.authService.userHasScopes(token, ['write:groups']);
    });
  }

  transformArchive = (data) => {
    // ArchiveElement
    let dataKits = data.map(
      u => ({
        topic: u.topic,
        sub_topic: u.sub_topic,
        date: u.date,
      })
    )
    this.dataSource = new MatTableDataSource(dataKits);
    this.streamRetrieved = true;
    return data
  }

}
