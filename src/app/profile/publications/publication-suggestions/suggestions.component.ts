import {Component, Input, OnDestroy, Output, EventEmitter, ElementRef, ViewChild} from '@angular/core';
import {Title} from '@angular/platform-browser';
import {Router, ActivatedRoute} from '@angular/router';
import {FormGroup, FormControl, Validators } from '@angular/forms';

import {Folder, CreatePublication, Publication, PublicationService} from '../../../shared/services/publication-service';
import {People, PeopleService} from '../../../shared/services/people-service';

import {objectMini, SharedService} from '../../../shared/services/shared-service';
import {MissionService} from '../../services/mission-service';

import {UserService} from '../../../user/services/user-service';
import {AuthService} from '../../../auth/auth.service';

import {itemsAnimation} from '../../../shared/animations/index';

@Component({
  selector: 'profile-publications-suggestions',
  templateUrl: 'suggestions.html',
  styleUrls: ['suggestions.css'],
  animations: [itemsAnimation],
  host: { '[@itemsAnimation]': '' }
})
export class ProfilePublicationSuggestionsComponent {
  projId: string;

  streamPublicationsSuggestions: number[];
  streamPublicationsSuggestionsFolder: number[];
  streamPublicationsRejected: number[];
  streamPublicationsRejectedFolder: number[];

  publicationsSuggestions: Publication[];
  publicationsRejected: Publication[];

  streamRetrieved: boolean[];

  streamSuggestions: number = 0;

  adminFlag: boolean = false;

  suggestions: any;

  primaryNameInitial: string;

  constructor(private titleService: Title,
              private publicationService: PublicationService,
              private peopleService: PeopleService,
              private sharedService: SharedService,
              private authService: AuthService,
              public userService: UserService,
              public missionService: MissionService,
              private _router: Router,
              private route: ActivatedRoute) {}

  ngOnInit() {
    this.projId = this.missionService.peopleId;
    this.streamRetrieved = [false, false, false, false, false];
    this.titleService.setTitle('Publications - ' + this.missionService.peopleName + ' | Academig');

    var primaryNameArray: string[] = this.missionService.peopleName.replace(/\./g,' ').replace(/\_/g,' ').replace(/\-/g,' ').split(' ');
    primaryNameArray[0] = primaryNameArray[0][0];
    this.primaryNameInitial = titleCase(primaryNameArray.join(' '))

    this.authService.token.subscribe(token => {
       this.adminFlag = this.authService.userHasScopes(token, ['write:publications'])
      if (this.missionService.meFlag || this.adminFlag) {
        this.streamSuggestions = 3;
        this.updateSuggestions();
        this.updateRejected();
        this.streamSuggestions = 1;
      }
    });
  }

  async updateSuggestions() {
    this.publicationsSuggestions = await this.publicationService.getPublications(7, this.projId, 0);
    this.streamRetrieved[1] = true;
    this.streamPublicationsSuggestions = new Array(this.publicationsSuggestions.length).fill(0);
    this.streamPublicationsSuggestionsFolder = new Array(this.publicationsSuggestions.length).fill(0);
  }

  async updateRejected() {
    this.publicationsRejected = await this.publicationService.getPublications(17, this.projId, 0);
    this.streamRetrieved[2] = true;
    this.streamPublicationsRejected = new Array(this.publicationsRejected.length).fill(0);
    this.streamPublicationsRejectedFolder = new Array(this.publicationsRejected.length).fill(0);
  }

  // this.streamSuggestions = 0;

  async suggestionDecision(event, action: number) {
    // streamPublicationsFolder array is not Sorted
    // publications array is sorted

    // event[0] - itemId
    // event[1] - item location "on the screen"

    const i: number = this.publicationsSuggestions.findIndex(x => x._id == event[0]);

    this.streamPublicationsSuggestions[event[1]] = 3;

    this.suggestions = await this.publicationService.decisionSuggestion(this.projId, event[0], action, 1);

    if (action==0) {
      // this.publications.push(this.publicationsSuggestions[i]);
      // this.publicationToggle = !this.publicationToggle;
    } else if (action==1) {
      var x = this.publicationsSuggestions[i].authors.findIndex(a => a._id==this.projId);
      if (x>-1) {
        this.publicationsSuggestions[i].authors[x]._id = null;
        this.publicationsSuggestions[i].authors[x].pic = null;
      }
      this.publicationsRejected.push(this.publicationsSuggestions[i]);
    }

    this.publicationsSuggestions.splice(i, 1);
    this.streamPublicationsSuggestions[event[1]] = 0;
  }


}

function titleCase(str) {
   var splitStr = str.toLowerCase().split(' ');
   for (var i = 0; i < splitStr.length; i++) {
       // You do not need to check if i is larger than splitStr length,
       // as your for does that for you. Assign it back to the array
       splitStr[i] = splitStr[i].charAt(0).toUpperCase() + splitStr[i].substring(1);
   }
   return splitStr.join(' ');
}
