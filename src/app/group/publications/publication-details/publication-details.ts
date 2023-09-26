import {Component} from '@angular/core';
import {ActivatedRoute, Router, NavigationEnd} from '@angular/router';
import {Subscription} from 'rxjs/Subscription';

import {MissionService} from '../../services/mission-service';

@Component({
  selector: 'group-publication-details',
  template: `<div class="">
             <publication-details [projId]=projId
                                  [sourceType]=sourceType
                                  [parentId]=parentId
                                  [userId]=missionService.userId
                                  [showEditBtn]=missionService.showEditBtn
                                  (title)="updateBread($event)">
             </publication-details>
             </div>`
})

export class GroupPublicationDetailsComponent {
  navigationSubscription: Subscription;

  projId: string;

  resourceId: string;
  projectId: string;

  parentId: string;
  sourceType: number;

  constructor(private route: ActivatedRoute,
              public missionService: MissionService,
              private router: Router) {
    this.missionService.breadDetailsStream = 3;

    this.navigationSubscription = this.router.events.subscribe((e: any) => {
      if (e instanceof NavigationEnd) {
        this.updatePage()
      }
    });
    this.updatePage();
  }

  ngOnDestroy() {
    if (this.navigationSubscription) this.navigationSubscription.unsubscribe();
    this.missionService.breadDetailsName = null;
  }

  updatePage() {
    this.projId = this.route.snapshot.params['publicationId'];
    this.resourceId = this.route.snapshot.params['resourceId'];
    this.projectId = this.route.snapshot.params['projectId'];

    this.parentId = (this.resourceId) ? this.resourceId : ((this.projectId) ? this.projectId : this.missionService.groupId);
    this.sourceType = (this.resourceId) ? 4 : ((this.projectId) ? 3 : 0);
  }

  updateBread(event) {
    this.missionService.breadDetailsName = event;
    this.missionService.breadDetailsStream = 0;
  }

}
