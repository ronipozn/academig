import {Component, Input, Output, EventEmitter} from '@angular/core';
import {FormGroup, FormControl, Validators} from '@angular/forms';
import {Router, NavigationEnd} from '@angular/router';

import {UserService} from '../../../user/services/user-service';
import {objectMini} from '../../../shared/services/shared-service';
import {PeopleService} from '../../services/people-service';

@Component({
    selector: 'modal-share',
    templateUrl: 'modal-share.html'
})
export class ModalShareComponent {
  @Input() mode: number; // 0 - group
                         // 1 - people
                         // 2 - publication
                         // 3 - resource
                         // 4 - project
                         // 5 - position
  @Input() itemId: string;
  @Input() flag = false;

  @Output() closeModal: EventEmitter <boolean> = new EventEmitter();

  userId: string;

  streamRetrieved = true;
  btnsDisabled = false;
  alertFlag = false;

  submitStatus = false;
  formModel: FormGroup;
  members: objectMini[][] = [[]];

  membersSelected: any;

  constructor(
    public userService: UserService,
    public peopleService: PeopleService,
    public router: Router
  ) {
    this.formModel = new FormGroup({
      name: new FormControl(''),
    });

    if (userService.userId) {
      this.userId = userService.userId;
    }
  }

  membersFunc(event, i: number) {
    this.members[i] = event;
  }

  alertFunc(event, i: number) {
    this.alertFlag = false;
  }

  async onSubmit() {
    let ids: string[] = [];

    if (this.formModel.valid) {
      this.members.forEach((member, i) => {
        this.formModel.value['members' + i] = member.filter((elem, j, arr) => this.formModel.value['members' + i][j] === true).map(x => x._id);
        ids = ids.concat(this.formModel.value['members' + i]);
      });

      if (this.formModel.value.name._id) ids = ids.concat(this.formModel.value.name._id);

      ids = this.uniq(ids);

      if (ids.length > 0) {

        this.streamRetrieved = false;
        this.btnsDisabled = true;

        await this.peopleService.putShare(this.mode, ids, this.itemId);

        this.streamRetrieved = true;
        this.btnsDisabled = false;
        this.closeModal.emit(true);

      } else {

        this.alertFlag = true;

      }

    } else {
      this.submitStatus = !this.submitStatus;
    }
  }

  uniq(a) {
    return a.sort().filter(function(item, pos, ary) {
        return !pos || item != ary[pos - 1];
    })
  }

}
