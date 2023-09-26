import {Component} from '@angular/core';
import {Title} from '@angular/platform-browser';
import {Router, UrlTree, UrlSegmentGroup, UrlSegment, PRIMARY_OUTLET} from '@angular/router';

import {HttpClient} from '@angular/common/http';

import * as moment from 'moment';

@Component({
  selector: 'daily',
  templateUrl: 'daily.html',
  styleUrls: ['daily.css']
})
export class DailyComponent {
  streamRetrieved: boolean;

  data: any;

  moment: any = moment;

  constructor(private titleService: Title,
              private router: Router,
              private _httpClient: HttpClient) {
    this.titleService.setTitle('Academig Daily');
  }

  ngOnInit() {
    this.streamRetrieved = false;

    const tree: UrlTree = this.router.parseUrl(this.router.routerState.snapshot.url);
    const g: UrlSegmentGroup = tree.root.children[PRIMARY_OUTLET];
    const s: UrlSegment[] = g.segments;

    let fileName: string;

    if (s[1].path=='latest') {
      fileName = "academig_daily_" + moment(new Date()).format("YYYY_MM_DD");
    } else {
      fileName = "academig_daily_" + s[1].path + '_' + s[2].path + '_' + s[3].path;
    }

    let path = 'https://academig-daily.s3.amazonaws.com/' + fileName + '.html';

    // https://stackoverflow.com/questions/42033953/access-amazon-s3-using-http-in-angular2
    // https://docs.aws.amazon.com/AmazonS3/latest/dev/cors.html
    https://s3.console.aws.amazon.com/s3/buckets/academig-daily/?region=us-east-1&tab=permissions
    this._httpClient.get(path, {responseType: "text"}).subscribe(
    data => {
      this.data = data;
      this.streamRetrieved = true;
    });
  }
}
