// https://www.algolia.com/doc/api-reference/widgets/configure/angular/
// https://github.com/algolia/angular-instantsearch/blob/09351132253d83fd5a0eee5a2ac627fa853b36ac/examples/dev-novel/custom-widgets.ts#L36-L57

import {Component, Input, OnInit, Output, EventEmitter} from '@angular/core';
import {FormGroup, FormArray} from '@angular/forms';

import {PeopleService} from '../../../shared/services/people-service';
import {UserService} from '../../../user/services/user-service';

import {environment} from '../../../../environments/environment';

import algoliasearch from 'algoliasearch/lite';

const searchClient = algoliasearch(
  'TDKUK8VW4T',
  '73303e9badf36767a06c37395b6a3693'
);

@Component({
  selector: 'signup-build-follow',
  templateUrl: 'follow.html',
  styleUrls: ['follow.css']
})
export class SignUpBuildFollowComponent implements OnInit {
  @Input() parentGroup: FormGroup;
  @Input() forkNum: number;
  @Input() topics: string[] = [];

  @Output() newStep: EventEmitter <number[]> = new EventEmitter();
  @Output() previousStep: EventEmitter <boolean> = new EventEmitter();

  config_labs = {
    indexName: 'labs', //environment.algolia.labs,
    searchClient
  };

  groupsIds: string[];
  query: string[];

  arrayControl: FormArray;

  streamRetrieved: boolean;

  constructor(private peopleService: PeopleService,
              private userService: UserService) { }

  ngOnInit() {
    this.streamRetrieved = false;
    this.query= this.parentGroup.get('interests').value.concat(this.parentGroup.get('topic').value,[this.parentGroup.get('department').value.name])
    // console.log('interests',this.parentGroup.get('interests').value)
    // console.log('topic',this.parentGroup.get('topic').value)
    // console.log('department',this.parentGroup.get('department').value)
    // console.log('query',this.query)
    this.parentGroup.controls['groupsToggle'].valueChanges.subscribe((value: string) => {
      this.arrayControl = this.parentGroup.get('groupsToggle') as FormArray;
    });
  }

  toStep(): void {
    const toggle: boolean[] = this.parentGroup.get('groupsToggle').value;
    const filteredIds: string[] = this.groupsIds.filter((id, index, arr) => {
      return toggle[index];
    })
    this.parentGroup.get('groupsIds').setValue(filteredIds);
    this.newStep.emit([]);
  }

  toPrevious(): void {
    this.previousStep.emit();
  }

  transformGroups = (groups) => {
    // console.log('groups',groups)
    this.groupsIds = groups.map(r => r.groupIndex.group._id);
    this.streamRetrieved = true;
    if (groups.length==0) this.newStep.emit([]);
    return groups
  }

}
