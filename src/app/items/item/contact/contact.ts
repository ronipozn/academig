import {Component, OnInit} from '@angular/core';
import {Title} from '@angular/platform-browser';

import {MissionService} from '../../services/mission-service';
import {contactsPageItems, DepartmentService} from '../../../shared/services/department-service';
import {Contact, ContactService} from '../../../shared/services/contact-service';

import {SharedService} from '../../../shared/services/shared-service';

@Component({
  selector: 'item-contact',
  templateUrl: 'contact.html',
  styleUrls: ['contact.css']
})
export class ContactComponent {
  items: contactsPageItems;
  contacts: Contact[];

  streamRetrieved: boolean[] = [];

  stream: number[];
  itemFocus: number;
  streamFindUs = 0;

  contactIndex: number;
  contactNewFlag = false;
  contactBuildFlag = false;

  findUsBuildFlag = false;

  constructor(public titleService: Title,
              public departmentService: DepartmentService,
              public contactService: ContactService,
              public sharedService: SharedService,
              public missionService: MissionService) {
  }

  ngOnInit() {
    this.streamRetrieved = [false, false];
    this.titleService.setTitle('Contact - ' + this.missionService.name + ' | Academig');
    // this.updatePage()
  }

  // async updatePage() {
  //   if (this.missionService.id) {
  //     this.items = await this.departmentService.getContactsPageByid(this.missionService.id);
  //     this.streamRetrieved[1] = true;
  //
  //     this.contacts = await this.contactService.getContacts(1, this.missionService.id);
  //     this.streamRetrieved[0] = true;
  //     this.stream = new Array(this.contacts.length).fill(0);
  //   }
  // }

  contactSlide(flag: boolean, i: number, newFlag: boolean) {
    this.contactIndex = i;
    this.contactBuildFlag = flag;
    this.contactNewFlag = newFlag;
  }

  async contactUpdate(event) {
    this.contactBuildFlag = false;

    const contact: Contact = {
                              '_id': (this.contactNewFlag) ? null : this.contacts[this.contactIndex]._id,
                              'mode': 0,
                              'pic': event.pic,
                              'member': event.member,

                              'title': event.title,
                              // 'building': event.building,
                              // 'room': event.room,
                              'address': event.address,
                              'phone': event.phone,
                              'fax': event.fax,
                              'email': event.email,

                              'ai': null
                             };

    if (this.contactNewFlag == true) {

      this.contacts.push(contact);

      this.stream[this.contacts.length - 1] = 3;
      this.itemFocus = this.contacts.length - 1;

      this.contacts[this.contacts.length - 1]._id = await this.contactService.putContact(1, contact, this.missionService.id);
      this.stream[this.contacts.length - 1] = 1;

    } else {

      this.contacts[this.contactIndex] = contact;
      this.stream[this.contactIndex] = 3;

      await this.contactService.postContact(1, contact, this.contacts[this.contactIndex]._id, this.missionService.id);
      this.stream[this.contactIndex] = 1;

     }

  }

  async contactDelete(i: number) {
    const _id: string = this.contacts[i]._id;

    this.itemFocus = null;
    this.stream[i] = 3;

    await this.contactService.deleteContact(1, _id, this.missionService.id);

    this.contacts.splice(i, 1);
    this.stream[i] = 0;
  }

  streamFunc() {
    const loc: number = this.contactNewFlag ? this.contacts.length - 1 : this.contactIndex;
    this.stream[loc] = 0;
  }

  async findUsOp(mode: number, flag: boolean, event) {
    this.findUsBuildFlag = flag;

    if (mode == 1) {

      this.streamFindUs = 3;

      await this.sharedService.deleteTextPic(4, this.missionService.id, this.missionService.id);

      this.items.findUs = null;
      this.items.findUsPic = null;
      this.items.findUsCaption = null;
      this.streamFindUs = 0;

     } else if (mode == 2) {

      this.items.findUs = event.text;
      this.items.findUsPic = event.pic;
      this.items.findUsCaption = event.caption;

      this.streamFindUs = 3;

      await this.sharedService.postTextPic(4, this.missionService.id, this.missionService.id, event.text, event.pic, event.caption);

      this.streamFindUs = 1;

     } else if (mode == 3) {

      this.streamFindUs = 0;

     }

  }

}
