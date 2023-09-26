import {Component} from '@angular/core';
import {Router, ActivatedRoute, NavigationEnd} from '@angular/router';
import {Subscription} from 'rxjs/Subscription';

import {UserService} from '../user/services/user-service';

@Component({
  selector: 'wall-details',
  templateUrl: 'details.html',
})
export class DetailsComponent {
  navigationSubscription: Subscription;

  projId: string;

  resourceId: string;
  projectId: string;

  parentId: string;
  sourceType: number;

  constructor(private router: Router,
              private route: ActivatedRoute,
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

    // console.log('this.projId',this.projId)

    this.parentId = (this.resourceId) ? this.resourceId : ((this.projectId) ? this.projectId : null);
    this.sourceType = (this.resourceId) ? 4 : ((this.projectId) ? 3 : 1);
  }

}
