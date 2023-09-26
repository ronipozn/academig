import {Component} from '@angular/core';
import {ActivatedRoute, Router, NavigationEnd} from '@angular/router';
import {Subscription} from 'rxjs/Subscription';

import {MissionService} from '../../services/mission-service';

@Component({
  selector: 'group-position-details',
  template: `<position-details *ngIf="missionService.showPage"
                               [projId]=projId
                               [sourceType]=0
                               [userStatus]=missionService.userStatus
                               [showEditBtn]=missionService.showEditBtn
                               [parentId]=missionService.groupId
                               [userId]=missionService.userId
                               (title)="updateBread($event)">
             </position-details>`
})

export class GroupPositionDetailsComponent {
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
    this.projId = this.route.snapshot.params['positionId'];
  }

  updateBread(event) {
    this.missionService.breadDetailsName = event;
    this.missionService.breadDetailsStream = 0;
  }

}
