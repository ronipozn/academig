import {Component, OnInit, ElementRef, ViewChild} from '@angular/core';
import {Title} from '@angular/platform-browser';
import {ActivatedRoute, Router} from '@angular/router';

import {MissionService} from '../../services/mission-service';
import {contactsPageItems, GroupService} from '../../../shared/services/group-service';
import {Contact, ContactService} from '../../../shared/services/contact-service';

import {SharedService, objectMini} from '../../../shared/services/shared-service';

import {UserService} from '../../../user/services/user-service';
import {ToastService} from '../../../user/services/toast.service';

import {itemsAnimation} from '../../../shared/animations/index';

@Component({
  selector: 'group-contact',
  templateUrl: 'home.html',
  styleUrls: ['home.css'],
  animations: [itemsAnimation],
  host: { '[@itemsAnimation]': '' }
})
export class GroupContactComponent implements OnInit {
  items: contactsPageItems;
  contacts: Contact[];

  streamRetrieved: boolean[] = [];

  stream: number[];
  itemFocus: number;
  dragIndex: number;

  streamFindUs = 0;

  contactIndex: number;
  contactNewFlag: boolean = false;
  contactBuildFlag: boolean = false;

  findUsBuildFlag: boolean = false;
  locationBuildFlag: boolean = false;

  submitFlag: number;
  subject: string;
  message: string;
  action: string;

  fragment: string;

  @ViewChild('scrollFindus', { static: false }) private scrollFindus: ElementRef;
  @ViewChild('scrollAdd', { static: false }) private scrollAdd: ElementRef;

  @ViewChild('toggleSignUpModal', { static: true }) toggleSignUp: ElementRef;

  constructor(private titleService: Title,
              private groupService: GroupService,
              private sharedService: SharedService,
              private contactService: ContactService,
              public missionService: MissionService,
              public userService: UserService,
              private toastService: ToastService,
              private route: ActivatedRoute,
              private _router: Router) {
  }

  async contactOrder(drag: number, drop: number) {
    const itemId: string = this.contacts[drag]._id;

    this.stream[drop] = 3;
    await this.groupService.orderItems(this.missionService.groupId, itemId, 0, 6, null, drag, drop);
    this.stream[drop] = 0;
  }

  ngOnInit() {
    this.streamRetrieved = [false, false];
    this.titleService.setTitle('Contact - ' + this.missionService.groupTitle + ' | Academig');
    this.updatePage()

    this.route.fragment.subscribe(fragment => {
      this.fragment = fragment
      this.scrollFunc()
    });
  }

  scrollFunc() {
    setTimeout(() => {
      try {
        switch (this.fragment) {
           case "findus": this.scrollFindus.nativeElement.scrollIntoView({ behavior: "smooth", block: "center" }); break;
           case "add": this.scrollAdd.nativeElement.scrollIntoView({ behavior: "smooth", block: "center" }); break;
        }
      } catch (e) { }
    }, 1000);
  }

  async updatePage() {
    if (this.missionService.groupId) {
      this.items = await this.groupService.getContactsPageByGroupId(this.missionService.groupId);
      this.streamRetrieved[0] = true;

      this.contacts = await this.contactService.getContacts(2, this.missionService.groupId);
      this.streamRetrieved[1] = true,
      this.stream = new Array(this.contacts.length).fill(0);
    }
  }

  contactSlide(flag: boolean, i: number, newFlag: boolean) {
    this.contactIndex = i;
    this.contactBuildFlag = flag;
    this.contactNewFlag = newFlag;
  }

  async contactUpdate(event) {
    this.contactBuildFlag = false;

    const contact: Contact = {
                              '_id': (this.contactNewFlag) ? null : this.contacts[this.contactIndex]._id,
                              'mode': event.mode,
                              'pic': event.pic,
                              'member': event.member,

                              'title': event.title,
                              'address': event.address,
                              'phone': event.phone,
                              'fax': event.fax,
                              'email': event.email,

                              'ai': event.intelligence ? event.intelligence[0] : null
                             };

    if (this.contactNewFlag == true) {

      this.contacts.push(contact);

      this.stream[this.contacts.length - 1] = 3;
      this.itemFocus = this.contacts.length - 1;

      this.contacts[this.contacts.length - 1]._id = await this.contactService.putContact(2, contact, this.missionService.groupId);
      this.stream[this.contacts.length - 1] = 1,
      this.missionService.groupProgress[22] = 1;

    } else {

      this.contacts[this.contactIndex] = contact;
      this.stream[this.contactIndex] = 3;

      await this.contactService.postContact(2, contact, this.contacts[this.contactIndex]._id, this.missionService.groupId);
      this.stream[this.contactIndex] = 1;

     }

  }

  async contactDelete(i: number) {
    const _id: string = this.contacts[i]._id;

    this.itemFocus = null;
    this.stream[i] = 3;

    await this.contactService.deleteContact(2, _id, this.missionService.groupId);

    this.contacts.splice(i, 1);
    this.stream[i] = 0;
    if (this.contacts.length == 0) this.missionService.groupProgress[22] = 0;
  }

  streamFunc() {
    const loc: number = this.contactNewFlag ? this.contacts.length - 1 : this.contactIndex;
    this.stream[loc] = 0;
  }

  async findUsOp(mode: number, flag: boolean, event) {
    this.findUsBuildFlag = flag;
    if (mode == 1) {

      this.streamFindUs = 3;

      await this.sharedService.deleteTextPic(2, this.missionService.groupId, this.missionService.groupId);

      this.items.findUs = null;
      this.items.findUsPic = null;
      this.items.findUsCaption = null;
      this.streamFindUs = 0;
      this.missionService.groupProgress[21] = 0;

    } else if (mode == 2) {

      this.items.findUs = event.text;
      this.items.findUsPic = event.pic;
      this.items.findUsCaption = event.caption;

      this.streamFindUs = 3;

      await this.sharedService.postTextPic(2, this.missionService.groupId, this.missionService.groupId, event.text, event.pic, event.caption);

      this.streamFindUs = 1;
      this.missionService.groupProgress[21] = 1;

    } else if (mode == 3) {

      this.streamFindUs = 0;

    }

  }

  peopleMessage(i: number) {
    if (this.userService.userId && this.userService.userEmailVerified) {
      const userMessage: objectMini = this.contacts[i].member;
      this.userService.newChannel = {
                                   _id: null,
                                   block: 0,
                                   usersIds: [userMessage._id],
                                   users: [{'_id': userMessage._id,
                                            'name': userMessage.name,
                                            'stage': null,
                                            'pic': userMessage.pic,
                                            'progress': null,
                                            'email': null,
                                            'positions': null,
                                            'followStatus': false,
                                            'views': null,
                                            'followedSize': null,
                                            'publicationsSize': null,
                                            'currentSize': null,
                                            'quote': null,
                                            'currentReading': null
                                           }],
                                   unread: 0,
                                   type: 0,
                                   message: {'_id': null,
                                             'type': null,
                                             'userId': null,
                                             'text': null,
                                             'file': null,
                                             'date': null
                                            }
                                  };

      this._router.navigate(['/messages']);
    } else {
      this.action = "message";
      this.toggleSignUp.nativeElement.click();
    }
  }

  togglePreviewEmail(popover) {
    if (popover.isOpen()) {
      popover.close();
    } else {
      popover.open();
    }
  }

  async contactSend() {
    if (this.userService.userId && this.userService.userEmailVerified) {
      this.submitFlag = 1;
      await this.contactService.putContactMessage(this.missionService.groupId, 0, this.subject, this.message);
      this.toastService.showNotification('bottom', 'left', 'Your message has been sent');
      this.submitFlag = 2;
      this.subject = '';
      this.message = '';
    } else {
      this.action = "message";
      this.toggleSignUp.nativeElement.click();
    }
  }

  async locationOp(mode: number, flag: boolean, event) {
    this.locationBuildFlag = flag;

    if (mode == 2) {
      this.missionService.location = [event.lat, event.lng];
      this.missionService.country = event.country_id;
      this.missionService.state = event.state;
      this.missionService.city = event.city;

      await this.sharedService.updateLocation(1, this.missionService.groupId, event.lat, event.lng, event.country_id, event.state, event.city);
    }
  }

}
