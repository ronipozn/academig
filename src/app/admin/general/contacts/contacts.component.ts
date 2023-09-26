import {Component, OnInit} from '@angular/core';
import {Title} from '@angular/platform-browser';
import {Subscription} from 'rxjs/Subscription';

import {ContactMessages, AdminService} from '../../../shared/services/admin-service';

@Component({
    selector: 'contacts',
    templateUrl: 'contacts.html'
})
export class ContactsComponent implements OnInit {
  streamRetrieved: boolean;

  streamPublications: number[];

  contacts: ContactMessages[];

  constructor(private titleService: Title,
              private adminService: AdminService) {

    this.titleService.setTitle('Admin Contacts Messages - Academig');
    this.streamRetrieved = false;
  }

  ngOnInit() {
    this.updateList();
  }

  async updateList() {
    this.streamRetrieved = false;
    this.contacts = await this.adminService.getContactsMessages();
    this.streamRetrieved = true;
  }

}
