import {Component, OnInit, OnDestroy, ElementRef, ViewChild} from '@angular/core';
import {Title} from '@angular/platform-browser';
import {Router, ActivatedRoute} from '@angular/router';
import {Subscription} from 'rxjs/Subscription';

import {MissionService} from '../../services/mission-service';
import {GroupSize, CompanySize, homePageItems, Group, GroupService} from '../../../shared/services/group-service';
import {People, PeopleService, titlesTypes} from '../../../shared/services/people-service';
import {News, NewsService} from '../../../shared/services/news-service';
import {Publication, PublicationService} from '../../../shared/services/publication-service';

import {UserService} from '../../../user/services/user-service';
import {SharedService, Quote, Affiliation, objectMini} from '../../../shared/services/shared-service';

import {itemsAnimation} from '../../../shared/animations/index';

@Component({
  selector: 'group-home',
  templateUrl: 'home.html',
  styleUrls: ['home.css'],
  animations: [itemsAnimation],
  host: { '[@itemsAnimation]': '' }
})
export class GroupHomeComponent implements OnInit {
  items: homePageItems;
  newses: News[] = [];

  streamRetrieved: boolean[] = [];

  labFlag: boolean;

  showButton: boolean = false;
  backgroundBuildFlag: boolean = false;
  backgroundPicBuildFlag: boolean = false;
  quoteBuildFlag: boolean = false;
  tagsBuildFlag: boolean = false;

  affiliationIndex: number;
  affiliationNewFlag: boolean = false;
  affiliationBuildFlag: boolean = false;

  streamBackground: number = 0;
  streamBackgroundPic: number = 0;
  streamQuote: number = 0;
  streamTags: number = 0;

  shortBackground: string;

  groupsFollowersLength: number;
  peoplesFollowingLength: number;

  streamAffiliation: number[];
  affiliationBuild: Affiliation;

  publications: Publication[];

  streamPublications: number[];
  streamPublicationsFolder: number[];

  itemFocus: number;

  toggleJournals: boolean = false;

  topicArrayFlag: boolean;
  companyFlag: boolean;

  action: string;

  sizeRange: string;
  groupSize = GroupSize;
  companySize = CompanySize;

  fragment: string;

  titlesSelect = titlesTypes;

  yearUniqs: any;

  toggleRank = [false, false, false, false]
  textRank = [
    'The Times Higher Education World University Rankings are the only global performance tables that judge research-intensive universities across all their core missions: teaching, research, knowledge transfer and international outlook. We use 13 carefully calibrated performance indicators to provide the most comprehensive and balanced comparisons, trusted by students, academics, university leaders, industry and governments. The performance indicators are grouped into five areas: teaching (the learning environment); research (volume, income and reputation); citations (research influence); international outlook (staff, students and research); and industry income (knowledge transfer).',
    'ARWU considers every university that has any Nobel Laureates, Fields Medalists, Highly Cited Researchers, or papers published in Nature or Science. In addition, universities with significant amount of papers indexed by Science Citation Index-Expanded (SCIE) and Social Science Citation Index (SSCI) are also included. In total, more than 1800 universities are actually ranked and the best 1000 are published.',
    'The QS World University Rankings continue to enjoy a remarkably consistent methodological framework, compiled using six simple metrics that we believe effectively capture university performance. Since faculty area normalization was introduced in 2015 to ensure that institutions specialising in Life Sciences and Natural Sciences were not unduly advantaged, we have avoided fundamental changes. In doing so, we aim to ensure that year-on-year comparisons remain valid, and that unnecessary volatility is minimized. Thus, universities continue to be evaluated according to the following six metrics: 1. Academic Reputation 2. Employer Reputation 3. Faculty/Student Ratio 4. Citations per faculty 5. International Faculty Ratio 6. International Student Ratio',
    'These institutions from the U.S. and more than 60 other countries have been ranked based on 13 indicators that measure their academic research performance and their global and regional reputations. Students can use these rankings to explore the higher education options that exist beyond their own countries\' borders and to compare key aspects of schools\' research missions. These are the world\'s top 1,250 universities.'
  ]

  @ViewChild('toggleSignUpModal', { static: true }) toggleSignUp: ElementRef;
  @ViewChild('toggleClaimModal', { static: true }) toggleClaim: ElementRef;

  @ViewChild('scrollBackground', { static: true }) private scrollBackground: ElementRef;
  @ViewChild('scrollQuote', { static: true }) private scrollQuote: ElementRef;
  @ViewChild('scrollInterests', { static: true }) private scrollInterests: ElementRef;

  constructor(public missionService: MissionService,
              public userService: UserService,
              private titleService: Title,
              private router: Router,
              private route: ActivatedRoute,
              private groupService: GroupService,
              private peopleService: PeopleService,
              private newsService: NewsService,
              private publicationService: PublicationService,
              private sharedService: SharedService) {
  }

  async ngOnInit() {
    if (this.missionService.showPage) {
      this.streamRetrieved = [false, false, false, false, false, false, false, false, false];
      this.titleService.setTitle(this.missionService.groupTitle + ' | Academig');

      this.labFlag = !(this.missionService.onBehalf==4 || this.missionService.onBehalf==5 || this.missionService.onBehalf==7);
      this.items = await this.sharedService.getHomePage(this.missionService.groupId, 2);

      this.items.fundings = this.items.fundings.filter(r=>r!="");
      this.items.journals = this.items.journals.filter(r=>r!="");

      let m;
      const regex = /^.*?[\.!\?](?:\s|$)/;
      if ((m = regex.exec(this.items.background))!==null) {
        this.shortBackground = m[0].replace(/<\/?[^>]+(>|$)/g, "");
      }

      this.topicArrayFlag = Array.isArray(this.items.topic);
      this.companyFlag = this.missionService.groupIndex.university.name=='company';

      if (this.items.size!=null) {
        this.sizeRange = this.labFlag ? this.groupSize[this.groupSize.findIndex(y => y.id == this.items.size)].name : this.companySize[this.companySize.findIndex(y => y.id == this.items.size)].name;
      }

      if (this.items.affiliations) {
        if (this.items.affiliations[1].pic==null) this.items.affiliations[1].pic = this.items.affiliations[0].pic;
        this.streamAffiliation = new Array(this.items.affiliations.length).fill(0);
      }

      this.streamRetrieved[0] = true;

      this.updatePublications();
      this.updateNews();

      this.route.fragment.subscribe(fragment => {
        this.fragment = fragment
        this.scrollFunc()
      });

    }
  }

  scrollFunc() {
    setTimeout(() => {
      try {
        switch (this.fragment) {
          case "background": this.scrollBackground.nativeElement.scrollIntoView({ behavior: "smooth", block: "center" }); break;
          case "quote": this.scrollQuote.nativeElement.scrollIntoView({ behavior: "smooth", block: "center" }); break;
          case "interests": this.scrollInterests.nativeElement.scrollIntoView({ behavior: "smooth", block: "center" }); break;
        }
        // document.querySelector('#' + this.fragment).scrollIntoView({ behavior: "smooth", block: "center" });
      } catch (e) { }
    }, 1000);
  }

  scrollFullBackground() {
    this.scrollBackground.nativeElement.scrollIntoView({ behavior: "smooth", block: "center" });
  }

  followrsOp(l: number, mode: number) {
    if (mode==0) {
      this.groupsFollowersLength = l;
    } else {
      this.peoplesFollowingLength = l;
    }
  }

  async updateNews() {
    if (this.missionService.groupStage==2) {
      const newses = await this.newsService.getNews(102, 0, this.missionService.groupId);
      if (newses) this.newses = newses;
    }
    this.streamRetrieved[7] = true;
  }

  async updatePublications() {
    const publications = await this.publicationService.getPublications(9, this.missionService.groupId, 0);

    const yearArrays = publications.map(r => (new Date(r.date)).getFullYear());
    const yearFlatten = [].concat(...yearArrays);
    this.yearUniqs = yearFlatten.reduce((acc, val) => {
      acc[val] = acc[val] === undefined ? 1 : acc[val] += 1;
      return acc;
    }, {});

    this.publications = publications.slice(0,2);

    this.streamPublications = new Array(this.publications.length).fill(0);
    this.streamPublicationsFolder = new Array(this.publications.length).fill(0);
    this.streamRetrieved[8] = true;
  }

  buttonOver(showStatus: boolean) {
    if (this.missionService.showEditBtn) {
      this.showButton = showStatus;
    }
  }

  async backgroundPicOp(mode: number, flag: boolean, file: string) {
    this.backgroundPicBuildFlag = flag;

    if (mode == 1) {

      this.streamBackgroundPic = 3;

      await this.sharedService.deletePic(1, this.missionService.groupId);

      this.items.pic = null,
      this.missionService.groupProgress[0] = 1;
      this.streamBackgroundPic = 0;

    } else if (mode == 2) {

      this.items.pic = file;
      this.missionService.groupProgress[0] = 0;
      this.streamBackgroundPic = 3;

      await this.sharedService.postPic(1, this.missionService.groupId, [file]);

      this.streamBackgroundPic = 0;

    } else if (mode == 3) {

      this.streamBackgroundPic = 0;

    }

  }

  async backgroundOp(mode: number, flag: boolean, event) {
    this.backgroundBuildFlag = flag;
    if (mode == 1) {

      this.streamBackground = 3;

      await this.sharedService.deleteText(this.missionService.groupId, this.missionService.groupId, 0);

      this.items.background = null
      this.missionService.groupProgress[1] = 0;
      this.streamBackground = 0;

    } else if (mode == 2) {

      let m;
      const regex = /^.*?[\.!\?](?:\s|$)/;
      this.items.background = event.text
      if ((m = regex.exec(this.items.background))!==null) {
        this.shortBackground = m[0];
      }

      this.streamBackground = 3;

      await this.sharedService.postText(event.text, this.missionService.groupId, this.missionService.groupId, 0);

      this.missionService.groupProgress[1] = 1;
      this.streamBackground = 1;

    } else if (mode == 3) {

      this.streamBackground = 0;

    }

  }

  async quoteOp(mode: number, flag: boolean, event) {
    this.quoteBuildFlag = flag;

    if (mode == 1) {

      this.streamQuote = 3;

      await this.sharedService.deleteQuote(this.missionService.groupId, 0);

      this.items.quote.text = null;
      this.items.quote.name = null
      this.items.quote.pic = null
      this.missionService.groupProgress[2] = 0;
      this.streamQuote = 0;

    } else if (mode == 2) {

      this.items.quote.text = event.text
      this.items.quote.name = event.name
      this.items.quote.pic = event.pic
      this.streamQuote = 3;

      const quote: Quote =
        {
         'text': event.text,
         'name': event.name,
         'pic': event.pic
        };

      await this.sharedService.postQuote(quote, this.missionService.groupId, 0);

      this.missionService.groupProgress[2] = 1;
      this.streamQuote = 1;

    } else if (mode == 3) {

      this.streamQuote = 0;

    }

  }

  async tagsOp(mode: number, flag: boolean, event) {
    this.tagsBuildFlag = flag;
    if (mode == 1) {

      this.streamTags = 3;

      await this.sharedService.deleteTags(0, this.missionService.groupId, this.missionService.groupId);

      this.items.intrests = [];
      this.missionService.groupProgress[3] = 0;
      this.streamTags = 0;

    } else if (mode == 2) {

      this.items.intrests = event
      this.streamTags = 3;

      await this.sharedService.postTags(0, this.items.intrests, this.missionService.groupId, this.missionService.groupId);

      this.missionService.groupProgress[3] = 1;
      this.streamTags = 1;

    } else if (mode == 3) {

      this.streamTags = 0;

    }

  }

  tagClickOp(i: number) {
    this.userService.searchText = this.items.intrests[i];
    // this.userService.searchSelected = 0;
    this.router.navigate(['./search', this.labFlag ? 'labs' : 'services']);
  }

  affiliationSlide(flag: boolean, i: number, newFlag: boolean) {
    this.affiliationBuild = (newFlag) ? null : this.items.affiliations[i];
    this.affiliationIndex = i;
    this.affiliationNewFlag = newFlag;
    this.affiliationBuildFlag = flag;
  }

  async affiliationUpdate(event) {
    this.affiliationBuildFlag = false;

    const affiliation: Affiliation = {
                                      '_id': (this.affiliationNewFlag) ? null : this.items.affiliations[this.affiliationIndex]._id,
                                      'title': event.title,
                                      'abbr': null,
                                      'description': event.description,
                                      'source': event.source,
                                      'externalLink': event.externalLink,
                                      'pic': event.pic
                                     };

    if (this.affiliationNewFlag == true) {

      this.items.affiliations.push(affiliation);
      this.itemFocus = this.items.affiliations.length - 1;
      this.streamAffiliation[this.items.affiliations.length - 1] = 3;
      this.items.affiliations[this.items.affiliations.length - 1]._id = await this.sharedService.putAffiliation(affiliation, this.missionService.groupId);
      this.streamAffiliation[this.items.affiliations.length - 1] = 1;

    } else {

      this.items.affiliations[this.affiliationIndex] = affiliation;
      this.streamAffiliation[this.affiliationIndex] = 3;
      await this.sharedService.postAffiliation(affiliation, this.missionService.groupId, 2);
      this.streamAffiliation[this.affiliationIndex] = 1;

    }

  }

  async affiliationDelete(flag: boolean, i: number) {
    this.streamAffiliation[i] = 3;
    await this.sharedService.deleteAffiliation(this.items.affiliations[i]._id, this.missionService.groupId);
    this.items.affiliations.splice(i, 1);
    this.streamAffiliation[i] = 0;
  }

  affiliationStreamFunc() {
    if (this.affiliationNewFlag == true) {
      this.streamAffiliation[this.items.affiliations.length - 1] = 0;
    } else {
      this.streamAffiliation[this.affiliationIndex] = 0;
    }
  }

  groupClaim() {
    // if (this.userService.userEmailVerified) {
      this.toggleClaim.nativeElement.click();
    // } else {
    //   this.action = "claim";
    //   this.toggleSignUp.nativeElement.click();
    // }
  }

  closeClaimModalFunc() {
    this.toggleClaim.nativeElement.click();
  }

}
