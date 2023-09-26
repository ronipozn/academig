import {Component} from '@angular/core';
import {ActivatedRoute, Router, NavigationEnd} from '@angular/router';
import {Subscription} from 'rxjs/Subscription';

import {MissionService} from '../../services/mission-service';

@Component({
  selector: 'group-project-details',
  template: `<project-details *ngIf="missionService.showPage"
                              [projId]=projId
                              [userId]=missionService.userId
                              [sourceType]=0
                              [parentId]=missionService.groupId
                              [groupStage]=missionService.groupStage
                              [showEditBtn]=missionService.showEditBtn
                              (title)="updateBread($event)">
             </project-details>`
})
export class GroupProjectDetailsComponent {
  navigationSubscription: Subscription;
  projId: string;

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
    this.projId = this.route.snapshot.params['projectId'];
  }

  updateBread(event) {
    this.missionService.breadDetailsName = event;
    this.missionService.breadDetailsStream = 0;
  }

}
