import {Component} from '@angular/core';
import {ActivatedRoute, Router, NavigationEnd} from '@angular/router';
import {Subscription} from 'rxjs/Subscription';

import {UserService} from '../../../user/services/user-service';

import {MissionService} from '../../services/mission-service';

@Component({
  selector: 'profile-gallery-details',
  template: `<div class="">
             <gallery-details [projId]=projId
                              [userId]=userService.userId
                              [sourceType]=0
                              [showEditBtn]=missionService.meFlag>
             </gallery-details>
             </div>`
})
export class ProfileGalleryDetailsComponent {
  navigationSubscription: Subscription;
  projId: string;

  constructor(private route: ActivatedRoute,
              private router: Router,
              public missionService: MissionService,
              public userService: UserService) {
    this.navigationSubscription = this.router.events.subscribe((e: any) => {
      if (e instanceof NavigationEnd) {
        this.updatePage()
      }
    });
    this.updatePage();
  }

  ngOnDestroy() {
    if (this.navigationSubscription) this.navigationSubscription.unsubscribe();
  }

  updatePage() {
    this.projId = this.route.snapshot.params['galleryId'];
  }

}
