import {Component, Input} from '@angular/core';
import {Router} from '@angular/router';

// import {MissionService} from '../../services/mission-service';
// import {SharedService} from '../../../shared/services/shared-service';

@Component({
  selector: 'settings-account',
  templateUrl: 'account.html',
  styleUrls: ['account.css']
})
export class AccountComponent {
  streamRetrieved: boolean;

  constructor(private router: Router,
              // public sharedService: SharedService
             ) { }

  ngOnInit() { }

  // async toogleStage() {
  //   await this.sharedService.postStage(this.missionService.universityId, this.account.stage, 0);
  // }

}
