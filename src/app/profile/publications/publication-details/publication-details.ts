import {Component} from '@angular/core';
import {Router, ActivatedRoute, NavigationEnd} from '@angular/router';
import {Subscription} from 'rxjs/Subscription';

import {UserService} from '../../../user/services/user-service';

import {MissionService} from '../../services/mission-service';

@Component({
  selector: 'profile-publication-details',
  template: `<div class="">
               <publication-details [projId]=projId
                                    [parentId]=parentId
                                    [userId]=userService.userId
                                    [showEditBtn]=missionService.meFlag
                                    [sourceType]=sourceType>
               </publication-details>
             </div>`
})
export class ProfilePublicationDetailsComponent {
  navigationSubscription: Subscription;

  projId: string;

  resourceId: string;
  projectId: string;

  parentId: string;
  sourceType: number;

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
    this.projId = this.route.snapshot.params['publicationId'];
    this.resourceId = this.route.snapshot.params['resourceId'];
    this.projectId = this.route.snapshot.params['projectId'];

    this.parentId = (this.resourceId) ? this.resourceId : ((this.projectId) ? this.projectId : this.missionService.peopleId);
    this.sourceType = (this.resourceId) ? 4 : ((this.projectId) ? 3 : 5);

    // console.log('this.resourceId', this.resourceId)
    // console.log('this.projectId', this.projectId)
  }

}
