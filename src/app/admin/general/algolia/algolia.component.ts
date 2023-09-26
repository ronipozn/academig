import {Component, OnDestroy} from '@angular/core';
import {Title} from '@angular/platform-browser';

import {AdminService} from '../../../shared/services/admin-service';

@Component({
    selector: 'algolia',
    templateUrl: 'algolia.html'
})
export class AlgoliaComponent {
  streamRetrieved: boolean[] = [true,true,true,true,true,true,true];

  constructor(private titleService: Title,
              private adminService: AdminService) {

    this.titleService.setTitle('Admin Algolia - Academig');
  }

  async updateAlgolia(i: number) {
    this.streamRetrieved[i] = false;

    await this.adminService.postAlgolia(i);

    this.streamRetrieved[i] = true;
  }

}
