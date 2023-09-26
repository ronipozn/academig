import {Component, OnInit, Input, ViewChild, ElementRef} from '@angular/core';
import {DomSanitizer} from '@angular/platform-browser';
import {Title} from '@angular/platform-browser';
import {Observable, of} from 'rxjs';

import {ViewportScroller} from '@angular/common';

import {NewsService} from '../../../shared/services/news-service';
import {SharedService} from '../../../shared/services/shared-service';
import {MissionService} from '../../services/mission-service';

import {DealType, DealService} from '../../services/deal-service';
import {Time, TimerService} from '../../services/timer-service';
// import {ProductType, PodcastType, EventType} from '../../services/item-service';

import * as moment from 'moment';

@Component({
  selector: 'item-deal',
  templateUrl: 'deal.html',
  styleUrls: ['deal.css']
})
export class DealComponent implements OnInit {
  streamRetrieved: boolean;

  backgroundBuildFlag: boolean = false;
  clipBuildFlag: boolean = false;
  tldrBuildFlag: boolean = false;
  blockBuildFlag: boolean = false;
  dealBuildFlag: boolean = false;
  planBuildFlag: boolean = false;
  peopleBuildFlag: boolean = false;

  streamBackground: number = 0;
  streamClip: number = 0;
  streamTldr: number = 0;
  streamBlock: number[];
  streamDeal: number = 0;
  streamPlan: number = 0;
  streamBuy: number = 0;

  quantityNum: number;
  blockNum: number;
  planIndex: number;
  codeIndex: number;

  cover: string;
  description: string;
  longDescription: string;

  tldr: string[] = [];
  clip: any;
  blocks: any[] = [];
  deal: any;
  plans: any[] = [];

  dealType = DealType;

  moment: any = moment;

  time1$: Observable<Time>;

  @ViewChild('scrollPlans', { static: false }) private scrollPlans: ElementRef;

  constructor(public missionService: MissionService,
              private dealService: DealService,
              private timerService: TimerService,
              private sanitizer: DomSanitizer,
              private newsService: NewsService,
              private sharedService: SharedService,
              private titleService: Title,
              private viewportScroller: ViewportScroller) { }

  ngOnInit() {
    this.updatePage()
  }

  async updatePage() {
    this.streamRetrieved = false;

    const item: any = await this.dealService.getDealDetails(this.missionService.id);

    if (item && item.status!=null) {
      this.deal = {
        "status": item.status,
        "type": item.type,
        "dateStart": item.dateStart,
        "dateEnd": item.dateEnd,
        "webinarLink": item.webinarLink,
        "webinarDate": item.webinarDate,
        "terms": item.terms,
        "features": item.features,
        "plansTotal": item.plansTotal,
        "codesTotal": item.codesTotal
      };

      if (item.dateEnd) this.time1$ = this.timerService.timer(new Date(item.dateEnd))

      this.codeIndex = 2; // default
      this.longDescription = item.longDescription;
      this.cover = item.cover;
      this.clip = item.clip;
      this.streamBlock = new Array(5).fill(0);

      this.tldr = item.tldr;
      this.blocks = item.blocks;

      this.plans = new Array(Number(item.plansTotal)).fill({features: null, price_reduced: null, price_full: null});
      if (item.plans) {
        this.plans.forEach((plan, index) => {
          if (item.plans[index]) this.plans[index]=item.plans[index]
        });
      }

      this.blocks = new Array(Number(5)).fill({text: null, pic: null, caption: null});
      if (item.blocks) {
        this.blocks.forEach((block, index) => {
          if (item.blocks[index]) this.blocks[index]=item.blocks[index]
        });
      }

      this.streamRetrieved = true;

      // console.log('item',item)
      // console.log('plans',this.plans)

      // const title: string = this.titlesTypes[this.position.position] + ' - ' + this.position.title;
      // this.titleService.setTitle(title + ' | Academig'),
      // this.metaService.addMetaTags(position.description ? position.description.slice(0,160) : null, position.tags ? position.tags.toString() : null, title);
      // this.metaService.getMetaTags();

    } else {
      this.deal = {
        "status": 0,
        "type": null,
        "dateStart": null,
        "dateEnd": null,
        "webinarLink": null,
        "webinarDate": null,
        "terms": null,
        "features": null,
        "plansTotal": null,
        "codesTotal": null
      };
      this.blocks = new Array(5).fill({text: null, pic: null, caption: null});
      this.streamRetrieved = true;
      // this.title.emit('[Deal not available]');
    };

  }

  // The Six-Figure Freelancers Accelerator is an online program that teaches consultants and creatives the fundamentals of building a freelance business.
  // https://appsumo2.b-cdn.net/media/cache/f5/65/f565e71822fcc75e3509697eb6e4d5e8.jpg
  async backgroundOp(mode: number, flag: boolean, event) {
    this.backgroundBuildFlag = flag;

    if (mode == 2) {
      this.longDescription = event.text;
      this.cover = event.link;
      this.streamBackground = 3;
      await this.sharedService.postTextPic(14, this.missionService.id, null, event.text, event.link, null);
      this.streamBackground = 0;
    }
  }

  async clipOp(mode: number, flag: boolean, event) {
    this.clipBuildFlag = flag;

    if (mode == 2) {
      this.clip = {"text": event.text, "link": this.sanitizer.bypassSecurityTrustResourceUrl(event.link)};
      this.streamClip = 3;
      await this.sharedService.postTextPic(15, this.missionService.id, null, event.text, event.link, null);
      this.streamClip = 0;
    }
  }

  async tldrOp(mode: number, flag: boolean, event) {
    this.tldrBuildFlag = flag;

    if (mode == 2) {
      this.tldr = [event.feature_1, event.alternative_to, event.feature_2, event.best_for];
      this.streamTldr = 3;
      await this.dealService.putTldr(this.missionService.id, 3, this.tldr);
      this.streamTldr = 0;
    }
  }

  async blockOp(num: number, mode: number, flag: boolean, event) {
    this.blockBuildFlag = flag;

    if (mode == 0) {
      this.blockNum = num;
    } else if (mode == 2) {
      this.blocks[this.blockNum] = {"text": event.text, "pic": event.pic, "caption": event.caption};
      this.streamBlock[this.blockNum] = 3;
      await this.sharedService.postTextPic(16+this.blockNum, this.missionService.id, this.missionService.id, event.text, event.pic, event.caption);
      this.streamBlock[this.blockNum] = 0;
    }
  }

  async dealOp(mode: number, flag: boolean, event) {
    this.dealBuildFlag = flag;
    if (mode == 2) {

      this.deal = {
        status: 0,
        type: event.type,
        dateStart: event.dateStart,
        dateEnd: event.dateEnd,

        webinarLink: event.webinarLink,
        webinarDate: event.webinarDate,

        terms: event.terms,
        features: event.features,

        plansTotal: event.plansTotal,
        codesTotal: event.codesTotal
      }

      this.time1$ = this.timerService.timer(new Date(event.dateEnd))

      this.plans = new Array(3).fill({features: null, price_reduced: null, price_full: null});
      this.streamDeal = 3;
      await this.dealService.putDeal(this.missionService.id, 3, this.deal);
      this.streamDeal = 0;
    }
  }

  async planOp(mode: number, index: number, flag: boolean, event) {
    this.planBuildFlag = flag;
    if (mode==0) {
      this.planIndex = index

    } else if (mode == 2) {

      this.plans[this.planIndex] = {
        features: event.features, // .split("\n")
        price_reduced: event.reducedPrice,
        price_full: event.fullPrice,
      };

      // console.log('event',event)
      // console.log('plans',this.plans)

      this.streamPlan = 3;
      await this.dealService.putPlan(this.missionService.id, 3, (this.planIndex==2) ? this.codeIndex : this.planIndex, this.plans[this.planIndex]);
      this.streamPlan = 0;
    }
  }

  async buyOp(quantity: number, event) {
    this.quantityNum = quantity;
    this.streamBuy = 3;
    const plan = await this.dealService.postStripeBuy(this.missionService.id, quantity);
    stripe.redirectToCheckout({
      sessionId: plan.id
    }).then(function (result) {
      this.router.navigate(result.success_url);
    });
    // this.streamBuy = 0;
  }

  ngAfterViewInit() {
    var script = document.createElement("script");
    script.src = "//talk.hyvor.com/web-api/embed";
    script.async = true;
    window['HYVOR_TALK_WEBSITE'] = 1171; // DO NOT CHANGE THIS
    window['HYVOR_TALK_CONFIG'] = {
      url: false,
      id: false
    };
    document.body.appendChild(script);
  }

  scrollToPlans() {
    this.scrollPlans.nativeElement.scrollIntoView({ behavior: "smooth", block: "center" });
  }

  scrollTop() {
    this.viewportScroller.scrollToPosition([0, 0]);
    // this.scrollAdd.nativeElement.scrollIntoView({ behavior: "smooth", block: "center" });
  }

}
