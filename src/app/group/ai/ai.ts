import {Component, OnInit, ElementRef, ViewChild} from '@angular/core';
import {Title} from '@angular/platform-browser';

import {MissionService} from '../services/mission-service';

import {AuthService} from '../../auth/auth.service';

import {itemsAnimation} from '../../shared/animations/index';

@Component({
  selector: 'group-ai',
  templateUrl: 'ai.html',
  styleUrls: ['ai.css'],
  animations: [itemsAnimation],
  host: { '[@itemsAnimation]': '' }
})
export class GroupAIComponent implements OnInit {
  archiveRetrieve: boolean = false;
  archiveToggle: boolean = false;

  adminFlag: boolean = false;

  @ViewChild('toggleArchiveModal', { static: true }) toggleArchive: ElementRef;

  constructor(private titleService: Title,
              private authService: AuthService,
              public missionService: MissionService) {
  }

  ngOnInit() {
    if (this.missionService.groupId) {
      this.authService.token.subscribe(token => this.adminFlag = this.authService.userHasScopes(token, ['write:groups']));
      this.titleService.setTitle('Lab Suggestions - ' + this.missionService.groupTitle + ' | Academig');
    }
  };

  openArchiveModalFunc() {
    this.archiveRetrieve = false;
    this.archiveToggle=!this.archiveToggle;
    this.toggleArchive.nativeElement.click();
    this.archiveRetrieve = true;
  }

}
