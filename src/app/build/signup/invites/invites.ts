import {Component, Input, Output, EventEmitter} from '@angular/core';
import {FormGroup} from '@angular/forms';

import {Publication} from '../../../shared/services/publication-service';

@Component({
  selector: 'signup-build-invites',
  templateUrl: 'invites.html',
  styleUrls: ['invites.css']
})
export class SignUpBuildInvitesComponent {
  @Input() parentGroup: FormGroup;
  @Input() publications: Publication[];
  @Input() streamPublications: number[];
  @Input() streamSuggestions: number[];
  @Input() userId: string;

  @Output() newStep: EventEmitter <number[]> = new EventEmitter();
  @Output() previousStep: EventEmitter <boolean> = new EventEmitter();

  @Output() btnAccpet: EventEmitter <[string, number]> = new EventEmitter();
  @Output() btnReject: EventEmitter <[string, number]> = new EventEmitter();

  typesFlag: boolean[] = [true, true, true, true, true, true];

  toStep(): void {
    this.newStep.emit([2]);
  }

  toPrevious(): void {
    this.previousStep.emit();
  }

  btnAccpetFunc(event): void {
    this.btnAccpet.emit(event);
  }

  btnRejectFunc(event): void {
    this.btnReject.emit(event);
  }
}
