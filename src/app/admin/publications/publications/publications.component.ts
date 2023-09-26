import {Component, OnInit} from '@angular/core';
import {Title} from '@angular/platform-browser';
import {Subscription} from 'rxjs/Subscription';

import {UserService} from '../../../user/services/user-service';
import {PublicationService, CreatePublication} from '../../../shared/services/publication-service';
import {PublicationMarketing, AdminService} from '../../../shared/services/admin-service';
import {InviteService} from '../../../shared/services/invite-service';

@Component({
    selector: 'publications',
    templateUrl: 'publications.html'
})
export class PublicationsComponent implements OnInit {
  streamRetrieved: boolean[];

  streamPublications: number[];

  publicationBuildFlag: boolean = false;
  publicationIndex: number;

  reInviteCount: number = 0;
  usersCount: number = 0;
  inviteCount: number = 0;
  inviteGoal: number = 50;

  // publicationBuild: PublicationAdmin;

  dois: string[];

  publicationsMarketing: PublicationMarketing[];
  userId: string;

  inviteFlag: boolean = false;
  inviteIndex: number;

  queryDate: string;

  journalsUnique: string[];
  adminsUnique: string[];

  adminsNames: string[];
  adminsTotalCounts: number[];
  adminsTotalPublications: number[];
  adminsInvitesCounts: number[] = [];

  constructor(private titleService: Title,
              private publicationService: PublicationService,
              private adminService: AdminService,
              private userService: UserService,
              private inviteService: InviteService) {

    this.titleService.setTitle('Admin Publications - Academig');
    this.streamRetrieved = [false, false, false, true];
    this.userId = this.userService.userId;
  }

  ngOnInit() {
    var dateobj = new Date();
    this.queryDate = dateobj.toISOString().substr(0,10);
    this.updateList();
  }

  updateJournals() {
    var journals = this.publicationsMarketing.map(r => r.journal).map(r=> r ? r.name : 'null');
    this.journalsUnique  = Array.from(new Set(journals));
  }

  updateAdmins() {
    // https://stackoverflow.com/questions/5667888/counting-the-occurrences-frequency-of-array-elements
    var admins = this.publicationsMarketing.map(r => r.adminId);
    var counts = this.countDuplicates(admins, this.adminsInvitesCounts);

    // console.log('counts',counts)

    this.adminsNames = counts[0];
    this.adminsTotalCounts = counts[1];
    this.adminsTotalPublications = counts[2];

    // ES6: let acc = admins.reduce((acc, val) => acc.set(val, 1 + (acc.get(val) || 0)), new Map());
  }

  updateAuthorsPlacements() {
    var authors = this.publicationsMarketing.map(r => r.authors);
    // console.log('authors',authors)
    // this.journalsUnique  = Array.from(new Set(journals));
  }

  async updateList() {
    this.streamRetrieved[0] = false;

    this.publicationsMarketing = await this.adminService.getPublications(this.queryDate, 0);

    var authors = this.publicationsMarketing.map(r => r.authors);
    var reInvites: number[];

    if (authors[0]) {

      authors.forEach((singePublicationAuthors, index) => {
        if (singePublicationAuthors) this.adminsInvitesCounts[index]=singePublicationAuthors.filter(r => r.email).length;
      });

      this.inviteCount = [].concat(...authors).filter(r => r ? r.email : null).length;
      this.usersCount = [].concat(...authors).filter(r => r ? r.pic : null).length;

      // reInvites = [].concat(...authors).filter(r=> r ? r.dates : null).map(r => (3-(r.dates ? r.dates.length : 3)));
      reInvites = [].concat(...authors).filter(r=> r ? r.dates : null).map(r => (4-(r.dates ? r.dates.length : 4)));
      if (reInvites[0]!=null) this.reInviteCount = reInvites.reduce((x, y) => x + y);

    } else {

      this.inviteCount = 0;
      this.usersCount = 0;
      this.reInviteCount = 0;
      this.adminsInvitesCounts = [];

    }

    this.streamPublications = new Array(this.publicationsMarketing.length).fill(0);

    this.streamRetrieved[0] = true;
    this.streamRetrieved[2] = true;
    this.updateJournals();
    this.updateAdmins();
    this.updateAuthorsPlacements();
    // console.log('queryDate',this.queryDate)
  }

  async publicaitionMarketingAll() {
    this.streamRetrieved[2] = false;
    await this.adminService.publicaitionMarketingAll(this.queryDate);
    this.streamRetrieved[2] = true;
  }

  publicationSlide(mode: number, flag: boolean) {
    this.publicationBuildFlag = flag;
    this.dois = this.publicationsMarketing.map(r => r.doi);

    // // 0: Cancel
    // if (mode==1) { // View publication
    //   this._router.navigate([this.publications[this.publications.length-1]._id], { relativeTo: this.route });
    // }
  }

  async publicationUpdate(event) {
    const createPublication: CreatePublication = {'type': event.type,
                                                  'title': event.title,
                                                  'parentId': null,
                                                  'folders': null,
                                                  'date': event.date,
                                                  'authors': event.authors,
                                                  'publisher': event.publisher,
                                                  'abstract': event.abstract,
                                                  'abstractPic': event.abstractPic,
                                                  'url': event.url,
                                                  'tags': event.tags,
                                                  'doi': event.doi,
                                                  "projects": event.projects,
                                                  'fundings': event.fundings,
                                                  'pdf': event.pdf,
                                                  'pdfMode': event.pdfMode,

                                                  'journal': event.journal,
                                                  'abbr': event.abbr,
                                                  'volume': event.volume,
                                                  'issue': event.issue,
                                                  'pages': event.pages,
                                                  'edition': event.edition,

                                                  'referencesCount': event.referencesCount,
                                                  'citationsCount': event.citationsCount,

                                                  'ai': null
                                                 };

    const publication: PublicationMarketing = {'_id': null,
                                               'dates': [new Date()],
                                               'adminId': this.userId,
                                               'title': event.title,
                                               'doi': event.doi,
                                               'date': event.date,
                                               'authors': event.authors,
                                               'abstractPic': event.abstractPic,
                                               'journal': event.journal
                                              };

    this.publicationsMarketing.unshift(publication);
    this.streamPublications[0] = 3;

    this.publicationsMarketing[0]._id = await this.adminService.putPublicationMarketing(createPublication);
    this.streamPublications[0] = 0,
    this.updateJournals(),
    this.updateAdmins()
  }

  async publicationDelete(index: number) {
    const _id: string = this.publicationsMarketing[index]._id;
    this.streamPublications[index]=3;

    await this.adminService.deletePublicationMarketing(_id);

    this.publicationsMarketing.splice(index, 1);
    this.streamPublications[index]=0;
  }

  async inviteOp(mode: number, index: number, inviteIndex: number, flag: boolean, event) {
    this.inviteFlag = flag;
    this.inviteIndex = inviteIndex;
    this.publicationIndex = index;

    if (mode == 2) {
      this.streamRetrieved[3] = false;

      this.publicationsMarketing[index].authors[inviteIndex] = event[0];

      await this.inviteService.authorInvite(11, this.publicationsMarketing[index]._id, event[0]);

      this.inviteCount++;

      if (this.publicationsMarketing[index].authors[inviteIndex].dates) {
        this.publicationsMarketing[index].authors[inviteIndex].dates.push(new Date());
      } else {
        this.publicationsMarketing[index].authors[inviteIndex].dates = [new Date()];
      }

      this.streamRetrieved[3] = true;

    }
  }

  animationDone(i: number): void {
    this.streamPublications[i] = 0;
  }

  countDuplicates(names: string[], invites: number[]): [string[], number[], number[]] {

    // var arrNew = arr.slice(0).sort();
    // var arrNew = arr.slice(0).sort();

    var a = [], b = [], c = [], prev;
    var list = [];

    for (var j = 0; j < names.length; j++)
      list.push({'name': names[j], 'invite': invites[j]});

    //2) sort:
    list.sort(function(a, b) {
      return ((a.name < b.name) ? -1 : ((a.name == b.name) ? 0 : 1));
    });

    //3) separate them back out:
    for (var k = 0; k < list.length; k++) {
      names[k] = list[k].name;
      invites[k] = list[k].invite;
    }

    //3) sum counts:
    for (var i = 0; i < names.length; i++) {
        if ( names[i] !== prev ) {
            a.push(names[i]);
            // b.push(1);
            b.push(invites[i]);
            c.push(1);
        } else {
            // b[b.length-1]++;
            b[b.length-1]+=invites[i];
            c[b.length-1]+=1;
        }
        prev = names[i];
    }

    return [a, b, c];
  }

}
