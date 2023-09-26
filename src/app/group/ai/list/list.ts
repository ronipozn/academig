import {Component, Input, Output, EventEmitter, OnInit} from '@angular/core';

import {MissionService} from '../../services/mission-service';
import {Group, GroupService} from '../../../shared/services/group-service';

import {Topic, Project, ProjectService} from '../../../shared/services/project-service';
import {Publication, PublicationService} from '../../../shared/services/publication-service';
import {Funding, FundingService} from '../../../shared/services/funding-service';
import {OpenPosition, OpenPositionService} from '../../../shared/services/position-service';
import {Resource, ResourceService} from '../../../shared/services/resource-service';
import {Gallery, GalleryService} from '../../../shared/services/gallery-service';
import {Outreach, OutreachService} from '../../../shared/services/outreach-service';
import {Teaching, TeachingService} from '../../../shared/services/teaching-service';
import {Talk, Poster, Press, MediaService} from '../../../shared/services/media-service';
import {FAQ, FaqService} from '../../../shared/services/faq-service';
import {Contact, ContactService} from '../../../shared/services/contact-service';

import {People, PeopleService} from '../../../shared/services/people-service';

import {SettingsService} from '../../../shared/services/settings-service';

import {itemsAnimation} from '../../../shared/animations/index';

@Component({
  selector: 'group-ai-list',
  templateUrl: 'list.html',
  styleUrls: ['list.css'],
  animations: [itemsAnimation],
  host: { '[@itemsAnimation]': '' }
})
export class GroupAIListComponent implements OnInit {
  @Input() archiveFlag: boolean;
  @Input() adminFlag: boolean;

  @Input() set archiveToggle(value: boolean) {
    this.updatePage();
  }

  @Output() archiveBtnClick: EventEmitter <boolean> = new EventEmitter();

  itemCount: number = -1;

  streamRetrieved: boolean[];
  streamRetrievedTopic: boolean[];
  streamRetrievedTotal: boolean;

  streamTopicSuggestion: number = 0;

  topics: Topic[] = [];
  projects: Project[][];
  publications: Publication[] = [];
  fundings: Funding[] = [];
  positions: OpenPosition[] = [];
  resources: Resource[] = [];
  galleries: Gallery[] = [];
  outreachs: Outreach[] = [];
  teachings: Teaching[] = [];
  talks: Talk[] = [];
  posters: Poster[] = [];
  presses: Press[] = [];
  faqs: FAQ[] = [];
  contacts: Contact[] = [];
  collaborations: Group[] = [];

  streamTopics: number[];
  streamProjects: number[];
  // streamPublications: number[];
  streamFundings: number[];
  streamPositions: number[];
  streamResources: number[];
  streamGalleries: number[];
  streamOutreachs: number[];
  streamTeachings: number[];
  streamTalk: number[];
  streamPoster: number[];
  streamPress: number[];
  streamFAQ: number[];
  streamContacts: number[];

  streamTopicsSuggestion: number[];
  streamProjectsSuggestion: number[];
  // streamPublicationsSuggestion: number[];
  streamFundingsSuggestion: number[];
  streamPositionsSuggestion: number[];
  streamResourcesSuggestion: number[];
  streamGalleriesSuggestion: number[];
  streamOutreachsSuggestion: number[];
  streamTeachingsSuggestion: number[];
  streamTalkSuggestion: number[];
  streamPosterSuggestion: number[];
  streamPressSuggestion: number[];
  streamFAQSuggestion: number[];
  streamContactsSuggestion: number[];

  constructor(private projectService: ProjectService,
              private publicationService: PublicationService,
              private fundingService: FundingService,
              private openPositionService: OpenPositionService,
              private resourceService: ResourceService,
              private galleryService: GalleryService,
              private outreachService: OutreachService,
              private teachingService: TeachingService,
              private mediaService: MediaService,
              private faqService: FaqService,
              private contactService: ContactService,
              private groupService: GroupService,
              private settingsService: SettingsService,
              public missionService: MissionService) {
  }

  ngOnInit() {
    if (this.archiveFlag==false && this.missionService.groupId) {
      this.updatePage();
    }
  };

  retreivedStatus(): boolean {
    let x: boolean = true;
    let count: number = 0;

    for (let _j = 0; _j <= 11; _j++) { if (this.streamRetrieved[_j]==false) x=false; }

    if (x==true && this.streamRetrievedTotal==false) {

      this.projects.forEach((project, index) => {
        count+=project.length;
      });

      // this.positions.length +
      count+=
        this.fundings.length + this.resources.length + this.outreachs.length +
        this.teachings.length + this.contacts.length + this.galleries.length + this.faqs.length +
        this.talks.length + this.posters.length + this.presses.length;

      this.itemCount = count;
      this.streamRetrievedTotal = true;
    }

    return x;
  }

  openArchiveModalFunc() {
    this.archiveBtnClick.emit(true);
  }

  updatePage() {
    this.streamRetrieved = new Array(13).fill(false);
    this.streamRetrievedTotal = false;

    this.topics = [];
    this.projects = [[]];
    this.publications = [];
    this.fundings = [];
    this.positions = [];
    this.resources = [];
    this.galleries = [];
    this.outreachs = [];
    this.teachings = [];
    this.talks = [];
    this.posters = [];
    this.presses = [];
    this.faqs = [];
    this.contacts = [];
    this.collaborations = [];

    if (this.archiveFlag) {
      this.getProjects();
    } else {
      this.getTopics();
    }

    this.getPublications();
    this.getFundings();
    this.getPositions();
    this.getResources();
    this.getOutreachs();
    this.getTeachings();
    this.getGalleries();
    this.getMedia();
    this.getFAQ();
    this.getContacts();
  }

  async decisionProjectsFunc(i: number, event: number[]) {
    const j: number = event[0];
    const action: number = event[1];
    const itemId: string = this.projects[i][j]._id;

    if (action==2) {
      await this.groupService.intelligenceNotification(this.missionService.groupId, itemId, 0, this.itemCount);
    } else {
      await this.groupService.intelligenceDecision(this.missionService.groupId, itemId, action, 0);
      this.projects[i].splice(j,1);
    }
  }

  async suggestionFunc(event: number[], mode: number) {
    const index: number = event[0];
    const action: number = event[1];

    let itemId: string;

    switch (mode) {
      // case 0: itemId = this.projects[index]._id; break;
      // case 1: itemId = this.publications[index]._id; break;
      case 2: itemId = this.fundings[index]._id; this.streamFundingsSuggestion[index]=3; break;
      case 3: itemId = this.positions[index]._id; this.streamPositionsSuggestion[index]=3; break;
      case 4: itemId = this.resources[index]._id; this.streamResourcesSuggestion[index]=3; break;
      case 12: itemId = this.outreachs[index]._id; this.streamOutreachsSuggestion[index]=3; break;
      case 5: itemId = this.teachings[index]._id; this.streamTeachingsSuggestion[index]=3; break;
      case 6: itemId = this.galleries[index]._id; this.streamGalleriesSuggestion[index]=3; break;
      case 7: itemId = this.faqs[index]._id; this.streamFAQSuggestion[index]=3; break;
      case 8: itemId = this.talks[index]._id; this.streamTalkSuggestion[index]=3; break;
      case 9: itemId = this.posters[index]._id; this.streamPosterSuggestion[index]=3; break;
      case 10: itemId = this.presses[index]._id; this.streamPressSuggestion[index]=3; break;
      case 11: itemId = this.contacts[index]._id; this.streamContactsSuggestion[index]=3; break;
      case 20: itemId = this.topics[index]._id; this.streamTopicsSuggestion[index]=3; break;
    }

    if (action==2) { // send email (and notification)
      await this.groupService.intelligenceNotification(this.missionService.groupId, itemId, mode, this.itemCount);
      switch (mode) {
        // case 0: itemId = this.projects[index]._id; break;
        // case 1: itemId = this.publications[index]._id; break;
        case 2: this.streamFundingsSuggestion[index]=0; break;
        case 3: this.streamPositionsSuggestion[index]=0; break;
        case 4: this.streamResourcesSuggestion[index]=0; break;
        case 12: this.streamOutreachsSuggestion[index]=0; break;
        case 5: this.streamTeachingsSuggestion[index]=0; break;
        case 6: this.streamGalleriesSuggestion[index]=0; break;
        case 7: this.streamFAQSuggestion[index]=0; break;
        case 8: this.streamTalkSuggestion[index]=0; break;
        case 9: this.streamPosterSuggestion[index]=0; break;
        case 10: this.streamPressSuggestion[index]=0; break;
        case 11: this.streamContactsSuggestion[index]=0; break;
        case 20: this.streamTopicsSuggestion[index]=0; break;
      }
    } else {
      await this.groupService.intelligenceDecision(this.missionService.groupId, itemId, action, mode);
      switch (mode) {
        // case 0: this.projects.splice(index,1); break;
        // case 1: this.publications.splice(index,1); break;
        case 2: this.fundings.splice(index,1); break;
        case 3: this.positions.splice(index,1); break;
        case 4: this.resources.splice(index,1); break;
        case 12: this.outreachs.splice(index,1); break;
        case 5: this.teachings.splice(index,1); break;
        case 6: this.galleries.splice(index,1); break;
        case 7: this.faqs.splice(index,1); break;
        case 8: this.talks.splice(index,1); break;
        case 9: this.posters.splice(index,1); break;
        case 10: this.presses.splice(index,1); break;
        case 11: this.contacts.splice(index,1); break;
        case 20: {
          this.topics[index].ai = (action==1) ? false : true; break;
          if (action==1) this.missionService.topics.push(this.topics[index]);
        }
      }
    }

  }

  async getTopics() {
    var link: string;

    this.topics = await this.projectService.getTopics(0, this.missionService.groupId);

    this.streamRetrieved[12] = true;
    this.streamTopics = new Array(this.topics.length).fill(0);
    this.streamTopicsSuggestion = new Array(this.teachings.length).fill(0);
    this.streamRetrievedTopic = new Array(this.topics.length).fill(false);
    this.projects = new Array(this.topics.length);

    if (this.topics.length==0) {
      this.streamRetrieved[0] = true;
      this.retreivedStatus();
    } else {
      this.topics.forEach((topic, index) => {
        link = topic.name.replace(/ /g,"_").toLowerCase();
        topic.ai = (this.missionService.topics.findIndex(r => r.name==topic.name)>-1) ? false : true;
        this.getProjectsTopics(link, index)
      });
    }
  }

  async getProjectsTopics(link: string, index: number) {
    this.projects[index] = await this.projectService.getProjects(this.archiveFlag ? 10 : 9, this.missionService.groupId, 3, 0, link);
    this.streamRetrievedTopic[index] = true;
    this.streamRetrieved[0] = true;
    this.streamProjects = new Array(this.projects.length).fill(0);
    this.streamProjectsSuggestion = new Array(this.projects.length).fill(0);
    this.retreivedStatus();
  }

  async getProjects() {
    this.projects = new Array(1);
    this.projects[0] = await this.projectService.getProjects(this.archiveFlag ? 10 : 9, this.missionService.groupId, 2, 0, null);
    this.streamRetrieved[0] = true;
    this.streamProjects = new Array(this.projects.length).fill(0);
    this.streamProjectsSuggestion = new Array(this.projects.length).fill(0);
    this.retreivedStatus();
  }

  async getPublications() {
    // this.publications = await this.fundingService.getPublications(2, this.missionService.groupId, 0);
    this.streamRetrieved[1] = true;
    // this.streamPublications = new Array(this.publications.length).fill(0);
  }

  async getFundings() {
    this.fundings = await this.fundingService.getFundings(this.missionService.groupId, 0, this.archiveFlag ? 3 : 2);
    this.streamRetrieved[2] = true;
    this.streamFundings = new Array(this.fundings.length).fill(0);
    this.streamFundingsSuggestion = new Array(this.fundings.length).fill(0);
    this.retreivedStatus();
  }

  async getPositions() {
    this.positions = await this.openPositionService.getPositions(this.archiveFlag ? 8 : 7, this.missionService.groupId);
    this.streamRetrieved[3] = true;
    this.streamPositions = new Array(this.positions.length).fill(0);
    this.streamPositionsSuggestion = new Array(this.positions.length).fill(0);
    this.retreivedStatus();
  }

  async getResources() {
    this.resources = await this.resourceService.getResources<Resource>(this.archiveFlag ? 14 : 13, this.missionService.groupId, null, 0);
    this.streamRetrieved[4] = true,
    this.streamResources = new Array(this.resources.length).fill(0);
    this.streamResourcesSuggestion = new Array(this.resources.length).fill(0);
    this.retreivedStatus();
  }

  async getOutreachs() {
    this.outreachs = await this.outreachService.getOutreachs(this.archiveFlag ? 9 : 8, this.missionService.groupId, 0);
    this.streamRetrieved[12] = true;
    this.streamOutreachs = new Array(this.outreachs.length).fill(0);
    this.streamOutreachsSuggestion = new Array(this.outreachs.length).fill(0);
    this.retreivedStatus();
  }

  async getTeachings() {
    this.teachings = await this.teachingService.getTeachings(this.archiveFlag ? 9 : 8, this.missionService.groupId, 0);
    this.streamRetrieved[5] = true;
    this.streamTeachings = new Array(this.teachings.length).fill(0);
    this.streamTeachingsSuggestion = new Array(this.teachings.length).fill(0);
    this.retreivedStatus();
  }

  async getGalleries() {
    this.galleries = await this.galleryService.getGalleries(this.missionService.groupId, this.archiveFlag ? 8 : 7);
    this.streamRetrieved[6] = true;
    this.streamGalleries = new Array(this.galleries.length).fill(0);
    this.streamGalleriesSuggestion = new Array(this.galleries.length).fill(0);
    this.retreivedStatus();
  }

  async getFAQ() {
    this.faqs = await this.faqService.getFAQ(this.missionService.groupId, this.archiveFlag ? 4 : 3);
    this.streamRetrieved[7] = true;
    this.streamFAQ = new Array(this.faqs.length).fill(0);
    this.streamFAQSuggestion = new Array(this.faqs.length).fill(0);
    this.retreivedStatus();
  }

  getMedia() {
    this.mediaFunc(0);
    this.mediaFunc(1);
    this.mediaFunc(2);
  }

  async getContacts() {
    this.contacts = await this.contactService.getContacts(this.archiveFlag ? 4 : 3, this.missionService.groupId);
    this.streamRetrieved[11] = true;
    this.streamContacts = new Array(this.contacts.length).fill(0);
    this.streamContactsSuggestion = new Array(this.contacts.length).fill(0);
    this.retreivedStatus();
  }

  async mediaFunc(tabNum: number) {
    const data = await this.mediaService.getMedia(this.archiveFlag ? 7 : 6, this.missionService.groupId, tabNum);

    if (tabNum == 0) this.talks = data;
    if (tabNum == 1) this.posters = data;
    if (tabNum == 2) this.presses = data;

    if (tabNum == 0) this.streamTalk = new Array(this.talks.length).fill(0);
    if (tabNum == 1) this.streamPoster = new Array(this.posters.length).fill(0);
    if (tabNum == 2) this.streamPress = new Array(this.presses.length).fill(0);

    if (tabNum == 0) this.streamTalkSuggestion = new Array(this.talks.length).fill(0);
    if (tabNum == 0) this.streamPosterSuggestion = new Array(this.posters.length).fill(0);
    if (tabNum == 0) this.streamPressSuggestion = new Array(this.presses.length).fill(0);

    this.streamRetrieved[tabNum+8] = true;
    this.retreivedStatus();
  }

  streamFunc() {
    //  this.streamFAQ[this.faqIndex] = 0;
  }

  async planUpdate(period: number) {
    const mode: number = 1; // User / Lab / Company / Department
    const type: number = 2; // Free / Lab PRO / AI PRO
    // const period: number = 0; // Monthly / Yearly
    const plan = await this.settingsService.postStripeSubscribe(mode, period, type, null, this.missionService.groupId);
    stripe.redirectToCheckout({
      sessionId: plan.id
    }).then(function (result) {});
  }

}
