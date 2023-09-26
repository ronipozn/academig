import {Component} from '@angular/core';
import {Router, ActivatedRoute, NavigationEnd} from '@angular/router';
import {Subscription} from 'rxjs/Subscription';

import {UserService} from '../../../user/services/user-service';

import {MissionService} from '../../services/mission-service';

@Component({
  selector: 'profile-project-details',
  template: `<div class="">
             <project-details [projId]=projId
                              [parentId]=missionService.peopleId
                              [userId]=userService.userId
                              [sourceType]=5
                              [showEditBtn]=false>
             </project-details>
             </div>`,
})
export class ProfileProjectDetailsComponent {
  navigationSubscription: Subscription;
  projId: string;

  constructor(private router: Router,
              private route: ActivatedRoute,
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
    this.navigationSubscription.unsubscribe();
  }

  updatePage() {
    this.projId = this.route.snapshot.params['projectId'];
  }

}
