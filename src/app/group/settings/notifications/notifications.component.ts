import {Component, Input, Output, EventEmitter} from '@angular/core';
import {FormGroup, FormArray, FormControl} from '@angular/forms';

import {MissionService} from '../../services/mission-service';
import {SettingsService} from '../../../shared/services/settings-service';

@Component({
  selector: 'settings-notifications',
  templateUrl: 'notifications.html',
  styleUrls: ['notifications.css']
})
export class NotificationsComponent {
  streamRetrieved: boolean;
  notifications: number[];

  formSubscribe: FormGroup;
  arrayControl: FormArray;

  constructor(public missionService: MissionService,
              public settingsService: SettingsService) {
    this.formSubscribe = new FormGroup({
      subscribe: new FormArray([
                                new FormControl(false),
                                new FormControl(false),
                              ])
    });
  }

  topics: string[] = [
    "Activate Suggestions",
    "Publications Suggestions"
  ];
  topicsIcon: string[] = [
    "magic",
    "file-text-o",
  ];
  topicsExplain: string[] = [
    "Get action items and new content suggestions for your " + this.missionService.groupTypeTitle.toLowerCase() + " profile.",
    "Get suggestions for your " + this.missionService.groupTypeTitle.toLowerCase() + " profile publications."
  ];

  async ngOnInit() {
    this.groupNotifications();
  }

  async groupNotifications() {
    this.streamRetrieved = false;
    this.notifications = await this.settingsService.getGroupNotifications(this.missionService.groupId);
    for (let _j = 0; _j <= 1; _j++) {
      (<FormArray>this.formSubscribe.controls["subscribe"]).at(_j).setValue((this.notifications==null) ? false : (this.notifications[_j] ? true : false));
    }
    this.streamRetrieved = true;
  }

  async toogleNotification(i: number) {
    this.notifications[i] = Number(!this.notifications[i]);
    await this.settingsService.toogleGroupNotifications(this.missionService.groupId, i, this.notifications[i]);
    // this.notifications = await this.settingsService.toogleNotifications(this.missionService.groupId, value);
  }

}
