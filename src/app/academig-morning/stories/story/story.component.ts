import {Component, OnInit, Input} from '@angular/core';
import {Title} from '@angular/platform-browser';
import {Router, UrlTree, UrlSegmentGroup, UrlSegment, PRIMARY_OUTLET} from '@angular/router';

// import {SubmitApp} from '../../services/app-service';
import {MorningService} from '../../services/morning-service';

import * as moment from 'moment';

@Component({
  selector: 'story',
  templateUrl: 'story.html',
  styleUrls: ['story.css']
})
export class StoryComponent implements OnInit {
  streamRetrieved: boolean;

  story: any;

  url: string;
  urlCopyFlag: boolean = false;

  moment: any = moment;

  constructor(private titleService: Title,
              private router: Router,
              private morningService: MorningService,
              // private metaService: MetaService,
             ) {
      this.titleService.setTitle('Academig Morning');
      // this.metaService.addMetaTags('Academig', 'academia, resarch labs, phd, msc, post-doc, departments, universities', null);
  }

  ngOnInit() {
    this.updatePage();
  }

  async updatePage() {
    this.streamRetrieved = false;

    const tree: UrlTree = this.router.parseUrl(this.router.routerState.snapshot.url);
    const g: UrlSegmentGroup = tree.root.children[PRIMARY_OUTLET];
    const s: UrlSegment[] = g.segments;

    this.url = 'https://www.academig.com/morning/stories/' + s[2].path + '/' + s[3].path + '/' + s[4].path + '/' + s[5].path;

    // const resource: ResourceDetails = await this.newsletterService.getStoryDetails();
    const story = await this.morningService.getStoryDetails(s[2].path, s[3].path, s[4].path, s[5].path);

    if (story) {

      this.story = story;
      this.titleService.setTitle(story.topic + ' | Academig');
      // this.metaService.addMetaTags(resource.description ? resource.description.slice(0,160) : null, resource.tags ? resource.tags.toString() : null, resource.name);
      this.streamRetrieved = true;

      // this.streamFollow = 0;
      // this.adminFlag = this.showEditBtn;
      // this.title.emit(this.resource.name);

    } else {

      this.story = null,
      this.streamRetrieved = true;
      // this.title.emit('[Story not available]');

    }
  }

  // https://stackoverflow.com/questions/49102724/angular-5-copy-to-clipboard
  copyMessage(val: string){
    const selBox = document.createElement('textarea');
    selBox.style.position = 'fixed';
    selBox.style.left = '0';
    selBox.style.top = '0';
    selBox.style.opacity = '0';
    selBox.value = val;
    document.body.appendChild(selBox);
    selBox.focus();
    selBox.select();
    document.execCommand('copy');
    document.body.removeChild(selBox);
    this.urlCopyFlag = true;
  }

}
