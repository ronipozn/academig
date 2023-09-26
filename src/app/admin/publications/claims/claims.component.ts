import {Component, OnInit} from '@angular/core';
import {Title} from '@angular/platform-browser';
import {Subscription} from 'rxjs/Subscription';

import {ItemClaim, AdminService} from '../../../shared/services/admin-service';

@Component({
    selector: 'claims',
    templateUrl: 'claims.html'
})
export class PublicationsClaimsComponent implements OnInit {
  streamRetrieved: boolean[];

  streamPublications: number[];

  claims: ItemClaim[];

  constructor(private titleService: Title,
              private adminService: AdminService) {

    this.titleService.setTitle('Admin Claim Authorship - Academig');
    this.streamRetrieved = [false];
  }

  ngOnInit() {
    this.updateList();
  }

  async updateList() {
    this.streamRetrieved[0] = false;

    this.claims = await this.adminService.getItemsClaims();

    this.streamRetrieved[0] = true;
  }

}
