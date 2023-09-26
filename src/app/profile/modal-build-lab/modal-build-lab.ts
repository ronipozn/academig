import {Component, Input, Output, EventEmitter} from '@angular/core';

import {UserService} from '../../user/services/user-service';
import {Position, Education} from '../../shared/services/people-service';

@Component({
    selector: 'modal-build-lab',
    templateUrl: 'modal-build-lab.html'
})
export class ModalBuildLabComponent {
  @Input() positionBuild: Position;
  @Input() educationBuild: Education;
  @Input() mode: boolean;

  @Output() buildWebsiteClick: EventEmitter <{_id: string, mode: boolean}> = new EventEmitter(true);

  constructor(
    public userService: UserService,
  ) { }

  onBuild() {
    this.buildWebsiteClick.emit({_id: (this.mode) ? this.educationBuild._id : this.positionBuild._id , mode: this.mode});
  }

}
