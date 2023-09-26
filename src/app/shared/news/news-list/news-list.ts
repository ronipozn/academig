import {Component, Input, OnInit, ElementRef, ViewChild, Output, EventEmitter} from '@angular/core';
import {Subscription} from 'rxjs/Subscription';
import {Router} from '@angular/router';

import {News, Comment, NewsService} from '../../services/news-service';
import {Followings, PeopleService} from '../../services/people-service';
import {GroupCompareMini} from '../../services/group-service';
import {groupComplex} from '../../services/shared-service';

import {UserService} from '../../../user/services/user-service';
import {StreamService} from '../../../user/services/stream.service';

import Auth0Client from '@auth0/auth0-spa-js/dist/typings/Auth0Client';
import {AuthService} from '../../../auth/auth.service';

@Component({
  selector: 'news-list',
  templateUrl: 'news-list.html'
})
export class NewsListComponent implements OnInit {
  @Input() newses: News[] = [];
  @Input() userId: string;
  @Input() followings: Followings;
  @Input() streamRetrieved: boolean;

  @Input() sourceType: number = 0; // 0 - Wall
                                   // 1 - Department
                                   // 2 - University
                                   // 3 - Group News Page
                                   // 4 - Profile News Page
                                   // 5 - Resource
                                   // 6 - Project
                                   // 7 - Group / Profile Home

  @Output() buttonEditNewsClick: EventEmitter <number> = new EventEmitter();
  @Output() buttonDeleteNewsClick: EventEmitter <number> = new EventEmitter();
  @Output() buttonMoreNewsClick: EventEmitter <boolean> = new EventEmitter();

  followingsClone: Followings;

  compareStatuses: boolean[] = [];

  streamCompare: number = 0;

  subscriptionUnCompare: Subscription;
  subscriptionClap: Subscription;

  pdfSlideFlag: boolean = false;
  pdfTitle: string;
  pdfFileName: string;

  signupAction: string;

  newsBuildFlag: boolean = false;

  // streamNews: number[] = [];

  @ViewChild('toggleShareModal', { static: true }) toggleShare: ElementRef;
  @ViewChild('toggleSignUpModal', { static: true }) toggleSignUp: ElementRef;
  @ViewChild('toggleCompareModal', { static: true }) toggleCompare: ElementRef;

  shareFlag: boolean = false;

  private auth0Client: Auth0Client;

  constructor(
    private router: Router,
    private authService: AuthService,
    public userService: UserService,
    public newsService: NewsService,
    public peopleService: PeopleService,
    public streamService: StreamService
  ) {
    this.subscriptionUnCompare = userService.searchUnCompareAnnounced$.subscribe(
      item => {
        const compareIndex: number = this.newses.map(r => ((r.object as any as groupComplex).group ? (r.object as any as groupComplex).group._id : null)).indexOf(item._id)
        if (compareIndex>-1) this.compareStatuses[compareIndex]=false;
    });
  }

  async ngOnInit() {
    // this.auth0Client = await this.authService.getAuth0Client();

    // const newobj = {...original, prop: newOne} to immutably add another prop to original and store as a new object.
    this.followingsClone = {...this.followings}
    if (this.userService.userCompareGroups[0]) this.compareStatuses = this.newses.map(r => this.userService.userCompareGroups.map(u => u.groupIndex.group._id).indexOf((r.object as any as groupComplex).group ? (r.object as any as groupComplex).group._id : null)>-1);
  }

  async login() {
    // await this.auth0Client.loginWithRedirect({});
    await this.auth0Client.loginWithRedirect({
      redirect_uri: `${window.location.origin}/callback`,
      appState: { target: this.router.url }
    });
  }

  buttonMoreNewsFunc(): void {
    this.buttonMoreNewsClick.emit(true);
  }

  buttonEditNewsFunc(i: number): void {
    this.buttonEditNewsClick.emit(i);
  }

  buttonDeleteNewsFunc(i: number): void {
    this.buttonDeleteNewsClick.emit(i);
  }

  newComment(i: number, text: string, pic: string) {
    this.streamService.putComment(this.newses[i].id, text, pic)
  }

  editComment(i: number, text: string, pic: string) {
    // this.streamService.postComment(this.newses[i].id, text, pic)
  }

  deleteComment(i: number) {
    // this.streamService.deleteComment(this.newses[i].id, text, pic)
  }

  async itemFollow(i: number, mode: number) {
    let itemId: string;

    const j: number = (mode == 5) ? 9 : mode;
    const m: number = (mode == 3) ? 2 : 0;

    var toFollow: boolean;
    var followIndex: number;

    // console.log('this.followingsClone.publicationsIds',this.followingsClone.publicationsIds)

    switch (mode) {
      case 0:  // publications
        itemId = this.newses[i].object._id;
        followIndex = this.followingsClone.publicationsIds.findIndex(x => x == itemId);
        toFollow = (followIndex==-1);
        if (toFollow)
          this.followingsClone.publicationsIds.push(itemId);
        else
          this.followingsClone.publicationsIds = this.followingsClone.publicationsIds.filter(x => x != itemId);
        break;
      case 1: // resources
        itemId = this.newses[i].object._id;
        followIndex = this.followingsClone.resourcesIds.findIndex(x => x == itemId);
        toFollow = (followIndex==-1);
        if (toFollow)
          this.followingsClone.resourcesIds.push(itemId);
        else
          this.followingsClone.resourcesIds = this.followingsClone.resourcesIds.filter(x => x != itemId);
        break;
      case 2: // projects
        itemId = this.newses[i].object._id;
        followIndex = this.followingsClone.projectsIds.findIndex(x => x == itemId);
        toFollow = (followIndex==-1);
        if (toFollow)
          this.followingsClone.projectsIds.push(itemId);
        else
          this.followingsClone.projectsIds = this.followingsClone.projectsIds.filter(x => x != itemId);
        break;
      case 3:  // positions
        itemId = this.newses[i].object._id;
        followIndex = this.followingsClone.positionsIds.findIndex(x => x == itemId);
        toFollow = (followIndex==-1);
        if (toFollow)
          this.followingsClone.positionsIds.push(itemId);
        else
          this.followingsClone.positionsIds = this.followingsClone.positionsIds.filter(x => x != itemId);
        break;
      case 4:  // groups
        const groupIndex: groupComplex = this.newses[i].object as any as groupComplex;
        itemId = groupIndex.group._id;
        followIndex = this.followingsClone.groupsIds.findIndex(x => x == itemId);
        toFollow = (followIndex==-1);
        if (toFollow)
          this.followingsClone.groupsIds.push(itemId);
        else
          this.followingsClone.groupsIds = this.followingsClone.groupsIds.filter(x => x != itemId);
        break;
      case 5: // peoples
        itemId = this.newses[i].actor._id;
        followIndex = this.followingsClone.peoplesIds.findIndex(x => x == itemId);
        toFollow = (followIndex==-1);
        if (toFollow)
          this.followingsClone.peoplesIds.push(itemId);
        else
          this.followingsClone.peoplesIds = this.followingsClone.peoplesIds.filter(x => x != itemId);
        break;
    }

    await this.peopleService.toggleFollow(j, m, itemId, toFollow);
  }

  async groupCompare(i: number) {
    const groupIndex: groupComplex = this.newses[i].object as any as groupComplex;
    const itemId: string = groupIndex.group._id;
    const compareFlag: boolean = this.compareStatuses[i];

    if (compareFlag || this.userService.userCompareGroups.length<5) {

      if (compareFlag) {
        const compareIndex: number = this.userService.userCompareGroups.map(r => r.groupIndex.group._id).indexOf(itemId);
        if (compareIndex > -1) this.userService.userCompareGroups.splice(compareIndex, 1);
      } else {
        const groupCompare: GroupCompareMini = {
          "_id": groupIndex.group._id,
          "pic": groupIndex.group.pic,
          "groupIndex": groupIndex,
          "country": null,
          "city": null,
        }
        this.userService.userCompareGroups.push(groupCompare);
      }

      // this.streamCompare = 3;

      await this.peopleService.toggleFollow(12, 0, itemId, !compareFlag);
      this.compareStatuses[i]=!this.compareStatuses[i];

    } else {

      this.toggleCompare.nativeElement.click();

    }

  }

  itemClap(i: number) {
    // this.subscriptionClap =
    this.streamService.putClap(this.newses[i].id)
    // .subscribe(
    //   result => { },
    //   err => console.log('Can\'t clap. Error code: %s, URL: %s, Error: %s, Message: %s', err.status, err.url, err.error, err.message),
    //   () => { }
    // );
  }

  itemUnClap(i: number) {
    for (const clap of  this.newses[i].own_reactions.claps) {
      this.streamService.deleteClaps(clap.id)
    }
  }

  openItmeShare() {
    this.toggleShare.nativeElement.click();
    this.shareFlag = true;
  }

  closeItmeShare() {
    this.toggleShare.nativeElement.click();
    this.shareFlag = false;
  }

  openSignUpModal(action: string) {
    this.signupAction = action;
    this.toggleSignUp.nativeElement.click();
  }

  pdfSlide(flag: boolean, event) {
   this.pdfSlideFlag = flag;
   if (flag == true) {
     this.pdfTitle = event.title;
     this.pdfFileName = event.fileName;
   }
  }

  ngOnDestroy() {
    if (this.subscriptionUnCompare) this.subscriptionUnCompare.unsubscribe();
    if (this.subscriptionClap) this.subscriptionClap.unsubscribe();
  }

}
