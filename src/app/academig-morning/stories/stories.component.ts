import {Component, OnInit, Input} from '@angular/core';
import {Title} from '@angular/platform-browser';

import algoliasearch from 'algoliasearch/lite';

const searchClient = algoliasearch(
  'TDKUK8VW4T',
  '73303e9badf36767a06c37395b6a3693'
);

import {environment} from '../../../environments/environment';
// import { MetaService } from '../shared/services/meta-service';

@Component({
  selector: 'stories',
  templateUrl: 'stories.html',
  styleUrls: ['stories.css']
})
export class StoriesComponent implements OnInit {
  config_morning = {
    indexName: environment.algolia.stories,
    searchClient,
  };

  streamRetrieved: boolean;

  constructor(private titleService: Title,
              // private metaService: MetaService,
             ) {
    this.titleService.setTitle('Academig Morning');
    // this.metaService.addMetaTags('Academig', 'academia, resarch labs, phd, msc, post-doc, departments, universities', null);
  }

  ngOnInit() {
    this.streamRetrieved = false;
  }

  transformNews = (news) => {
    this.streamRetrieved = true;
    return news
  }

}
