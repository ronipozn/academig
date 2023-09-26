import {Component, Input, Output, EventEmitter} from '@angular/core';
import {FormGroup, FormArray, FormControl} from '@angular/forms';
import {Subscription} from 'rxjs/Subscription';

import {SettingsService} from '../../shared/services/settings-service';
import {UserService} from '../../user/services/user-service';

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

  constructor(public settingsService: SettingsService,
              public userService: UserService) {
    this.formSubscribe = new FormGroup({
      subscribe: new FormArray([
                                new FormControl(false),
                                new FormControl(false),
                                new FormControl(false),
                                new FormControl(false),
                                new FormControl(false),
                                new FormControl(false)
                              ])
    });
  }

  topics: string[] = [
    "Academig Onboarding Series",
    "Academig Daily",
    "Academig Morning",
    "Academig Blog and Product Updates",
    "Academig Updates: Personalized Alerts from your Research Circle",
    "Academig Publications Suggestions"
  ];

  topicsIcon: string[] = [
    "rocket",
    "newspaper-o",
    "globe",
    "lightbulb-o",
    "bell-o",
    "file-text-o"
  ];

  topicsExplain: string[] = [
    "A welcome series for learning the ins and outs of Academig.",
    "Academig advanced-level newsletter, must-read articles for academics, human-curated from hundreds of academic blogs.",
    "The Academig weekly newsletter.",
    "Product updates and new feature announcements.",
    "Notifications related to your Academig activities, like jobs alerts, saved search alerts, messages and notifications from labs that you follow or belong to.",
    "Notifications related to your Academig publications list."
  ];

  ngOnInit() {
    this.userNotifications();
    // this.formSubscribe.controls['subscribe'].valueChanges.subscribe((value: boolean[]) => {
    //   this.arrayControl = this.formSubscribe.get('subscribe') as FormArray;
    //   console.log('value',value)
    //   if (this.formSubscribe.get('subscribe').dirty) this.toogleNotification(value);
    // });
  }

  async userNotifications() {
    this.streamRetrieved = false;
    this.notifications = await this.settingsService.getUserNotifications();
    for (let _j = 0; _j <= 5; _j++) {
      (<FormArray>this.formSubscribe.controls["subscribe"])
        .at(_j)
        .setValue(
          (this.notifications==null) ? false :
            (this.notifications[_j] ? true : false)
        );
    }
    this.streamRetrieved = true;
  }

  async toogleNotification(i: number) {
    this.notifications[i] = Number(!this.notifications[i]);
    await this.settingsService.toogleNotification(i, this.notifications[i]);
  }

}
