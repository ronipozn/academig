import {Component} from '@angular/core';
import {Title} from '@angular/platform-browser';
import {Router, UrlTree, UrlSegmentGroup, UrlSegment, PRIMARY_OUTLET} from '@angular/router';

import {HttpClient} from '@angular/common/http';

import * as moment from 'moment';

@Component({
  selector: 'morning',
  templateUrl: 'morning.html',
  styleUrls: ['morning.css']
})
export class MorningComponent {
  streamRetrieved: boolean = false;

  data: any;

  moment: any = moment;

  constructor(private titleService: Title,
              private router: Router,
              private _httpClient: HttpClient) {
    this.titleService.setTitle('Academig Morning');
  }

  ngOnInit() {
    this.streamRetrieved = false;

    const tree: UrlTree = this.router.parseUrl(this.router.routerState.snapshot.url);
    const g: UrlSegmentGroup = tree.root.children[PRIMARY_OUTLET];
    const s: UrlSegment[] = g.segments;

    let fileName: string;

    if (s[1].path=='latest') {
      fileName = "academig_daily_template_" + moment(new Date()).format("YYYY_MM_DD");
    } else {
      fileName = "academig_daily_template_" + s[1].path + '_' + s[2].path + '_' + s[3].path;
    }

    fileName = "academig_daily_template";
    
    let path = 'assets/newsletter/' + fileName + '.html';

    this._httpClient.get(path, {responseType: "text"}).subscribe(
    data => {
      this.data = data;
    });
  }
}
