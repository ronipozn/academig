import {Component, OnInit, ViewChild, ElementRef} from '@angular/core';
import {Title} from '@angular/platform-browser';
import {Router} from '@angular/router';

import {MissionService} from '../services/mission-service';

import {itemsAnimation} from '../../shared/animations/index';
import {SettingsService} from '../../shared/services/settings-service';

@Component({
    selector: 'private',
    templateUrl: 'private.html',
    styleUrls: ['private.css'],
    animations: [itemsAnimation],
    host: { '[@itemsAnimation]': '' }
})
export class PrivateComponent implements OnInit {

  @ViewChild('scrollPage', { static: false }) private scrollPage: ElementRef;

  stepsGroups: string[] = [
    'Lab Reports',
    // 'Lab News',
    // 'Existing prospecting solutions are expensive, cumbersome, and manual',
    'Lab Chat',
    'Lab Seminars',
    'Lab Assignments',
    'Lab Calendar',
    'Lab Polls',
    'Lab Papers Kit',
    'Personal Info',
    'AI'
  ];

  iconsGroups: string[] = [
    'insert_chart_outlined',
    // 'rss_feed',
    // 'chat_bubble_outline',
    'all_out',
    'post_add',
    'event',
    'poll',
    'bookmarks',
    'face',
    'cog'
  ];

  textsGroups: string[] = [
    'Private weekly lab report.',
    // 'Private news for lab members.',
    // 'Other solutions are built on top of an empty database and rely on the user to import prospects and data. They don’t provide dynamic information, track buy signals, or alert you of new prospects.',
    'Private chat for lab members.',
    'Fully featured seminars scheduler.',
    'Fully featured assignments scheduler.',
    'Private calendar for lab members.',
    'Private polls for lab members.',
    'Papers kit for lab members.',
    'Personal info for lab members.',
    'Auto-suggest of new content items for your lab profile.'
  ]

  constructor(private router: Router,
              private settingsService: SettingsService,
              private titleService: Title,
              public missionService: MissionService) {}

  ngOnInit() {
    this.titleService.setTitle('Private - ' + this.missionService.groupTitle + ' | Academig');

    if (this.missionService.planNumber>0) {
      this.router.events.subscribe((e: any) => {
        this.scrollPage.nativeElement.scrollIntoView({ behavior: "auto", block: "center" });
      });
    }
  }

  async planUpdate(period: number) {
    const mode: number = 1; // User / Lab / Company / Department
    const type: number = 1; // Free / PRO
    // const period: number = 0; // Monthly / Yearly
    const plan = await this.settingsService.postStripeSubscribe(mode, period, type, null, this.missionService.groupId);
    stripe.redirectToCheckout({
      sessionId: plan.id
    }).then(function (result) {});
  }

}
