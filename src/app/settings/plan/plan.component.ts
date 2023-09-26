import {Component} from '@angular/core';
import {UserService} from '../../user/services/user-service';

@Component({
  selector: 'settings-plan',
  templateUrl: 'plan.html'
})
export class PlanComponent {

  constructor(public userService: UserService) { }

}
