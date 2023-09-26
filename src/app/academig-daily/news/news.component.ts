import {Component, OnInit, Input} from '@angular/core';
import {Title} from '@angular/platform-browser';
import {Router} from '@angular/router';

import algoliasearch from 'algoliasearch/lite';

const searchClient = algoliasearch(
  'TDKUK8VW4T',
  '73303e9badf36767a06c37395b6a3693'
);

import {environment} from '../../../environments/environment';
// import { MetaService } from '../shared/services/meta-service';

@Component({
  selector: 'news',
  templateUrl: 'news.html',
  styleUrls: ['news.css']
})
export class NewsComponent implements OnInit {
  config_morning = {
    indexName: environment.algolia.news,
    searchClient,
  };

  streamRetrieved: boolean;
  // adNum: number;

  constructor(private titleService: Title,
              private _router: Router
              // private metaService: MetaService,
             ) {
      this.titleService.setTitle('Academig Daily');
      // this.metaService.addMetaTags('Academig', 'academia, resarch labs, phd, msc, post-doc, departments, universities', null);
  }

  ngOnInit() {
    this.streamRetrieved = false;
  }

  transformNews = (news) => {
    // this.adNum = getRandomInt(2, news.length);
    this.streamRetrieved = true;
    news.map(r=>r.topic.replace(/ /g,"_").toLowerCase());
    return news
  }

}

// function getRandomInt(min, max) {
//   min = Math.ceil(min);
//   max = Math.floor(max);
//   return Math.floor(Math.random() * (max - min)) + min; // The maximum is exclusive and the minimum is inclusive
// }
