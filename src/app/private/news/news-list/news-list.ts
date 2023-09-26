import {Component, Input, Output, EventEmitter, ViewChild, ElementRef} from '@angular/core';
import {ActivatedRoute} from '@angular/router';

import {privateNews, CreateNews, UpdateNews, PrivateService} from '../../../shared/services/private-service';
import {UserService} from '../../../user/services/user-service';

import {itemsAnimation} from '../../../shared/animations/index';

@Component({
  selector: 'private-news-list',
  templateUrl: 'news-list.html',
  animations: [itemsAnimation],
  host: { '[@itemsAnimation]': '' }
})
export class PrivateNewsListComponent {
  @Input() groupId: string;
  @Input() sourceType: number; // 0 - regular, 1 - wall
  @Input() userStatus: number;

  @Output() progress: EventEmitter <boolean> = new EventEmitter(true);

  newses: privateNews[] = [];

  newsBuildFlag = false;

  newsIndex: number;
  newsNewFlag = false;

  commentIndex: number;
  newsCommentFlag = false;

  streamRetrieved = false;
  streamNews: number[] = [];
  streamComments: number[][];

  fragment: string;

  @ViewChild('scrollAdd', { static: false }) private scrollAdd: ElementRef;

  constructor(private route: ActivatedRoute,
              public userService: UserService,
              public privateService: PrivateService) { }

  async ngOnInit() {
    this.streamRetrieved = false;

    this.newses = await this.privateService.getPrivateNews(this.groupId);

    this.streamRetrieved = true;
    this.newses.map(m => m.comments = []);
    this.streamNews = new Array(this.newses.length).fill(0);
    this.streamComments = [[0]];

    this.route.fragment.subscribe(fragment => {
      this.fragment = fragment
      this.scrollFunc()
    });
  }

  scrollFunc() {
    setTimeout(() => {
      try {
        switch (this.fragment) {
           case "add": this.scrollAdd.nativeElement.scrollIntoView({ behavior: "smooth", block: "center" }); break;
        }
      } catch (e) { }
    }, 1000);
  }

  async showComments(i: number) {
    const data = await this.privateService.getPrivateComments(this.newses[i]._id, this.groupId);
    this.newses[i].comments = this.newses[i].comments.concat(data);
    this.streamComments[i] = new Array(this.newses[i].comments.length).fill(0);
  }

  newsSlide(flag: boolean, i: number, newFlag: boolean) {
    this.newsCommentFlag = false;

    this.newsIndex = i;
    this.newsBuildFlag = flag;
    this.newsNewFlag = newFlag;
  }

  newsComment(flag: boolean, i: number, newFlag: boolean, c: number) {
    this.newsCommentFlag = true;

    this.newsIndex = i;
    this.commentIndex = c;

    this.newsBuildFlag = flag;
    this.newsNewFlag = newFlag;
  }

  async newsUpdate(event) {
    this.newsBuildFlag = false;

    if (this.newsNewFlag == true) {

      const createNews: CreateNews = {
                                      'actorId': this.userService.userId,
                                      'verb': 0,
                                      'objectId': null,
                                      'text': event.text,
                                      'pic': event.pic,
                                     };

      const news: privateNews = {
                                 '_id': null,
                                 'actor': {'_id': this.userService.userId, 'name': this.userService.userName, 'pic': this.userService.userPic},
                                 'verb': 0,
                                 'object': null,
                                 'time': new Date(),
                                 'text': event.text,
                                 'pic': event.pic,
                                 'numComments': 0,
                                 'comments': []
                                };

      if (this.newsCommentFlag == true) {
        // this.newses[this.newsIndex].comments.unshift(news);
        this.newses[this.newsIndex].comments.push(news);
        const newCommentIndex: number = this.newses[this.newsIndex].comments.length - 1;
        this.streamComments[this.newsIndex][newCommentIndex] = 3;

        const data = await this.privateService.putComment(createNews, this.newses[this.newsIndex]._id, this.groupId);

        this.newses[this.newsIndex].comments[this.newses[this.newsIndex].comments.length - 1]._id = data;
        this.streamComments[this.newsIndex][newCommentIndex] = 0;
        this.newses[this.newsIndex].numComments += 1;

      } else {

        this.newses.unshift(news);
        this.streamNews[0] = 3;

        this.newses[0]._id = await this.privateService.putNews(createNews, this.groupId);
        this.streamNews[0] = 1;
        this.progress.emit(true);

      }

    } else {

      const updateNews: UpdateNews = {
                                      'verb': 0,
                                      'objectId': null,
                                      'text': event.text,
                                      'pic': event.pic
                                     };

      if (this.newsCommentFlag == true) {

        this.newses[this.newsIndex].comments[this.commentIndex].text = event.text;
        this.newses[this.newsIndex].comments[this.commentIndex].pic = event.pic;
        this.streamComments[this.newsIndex][this.commentIndex] = 3;

        await this.privateService.postComment(updateNews, this.newses[this.newsIndex].comments[this.commentIndex]._id, this.newses[this.newsIndex]._id, this.groupId);
        this.streamComments[this.newsIndex][this.commentIndex] = 0;

      } else {

        this.newses[this.newsIndex].text = event.text;
        this.newses[this.newsIndex].pic = event.pic;
        this.streamNews[this.newsIndex] = 3;

        await this.privateService.postNews(updateNews, this.newses[this.newsIndex]._id, this.groupId);
        this.streamNews[this.newsIndex] = 1;

      }

    }

  }

  async newsDelete(i: number) {
    this.streamNews[i] = 3;

    await this.privateService.deleteNews(this.newses[i]._id, this.groupId);

    this.newses.splice(i, 1);
    this.streamNews[i] = 0;

    if (this.newses.length == 0) this.progress.emit(false);
  }

  async commentDelete(i: number, c: number) {
    this.streamComments[i][c] = 3;

    await this.privateService.deleteComment(this.newses[i].comments[c]._id, this.newses[i]._id, this.groupId);

    this.newses[i].comments.splice(c, 1);
    this.streamComments[i][c] = 0;
    this.newses[i].numComments -= 1;
  }

  animationDone() {
    let loc: number
    loc = this.newsNewFlag ? 0 : this.newsIndex;
    this.streamNews[loc] = 0;
  }

}
