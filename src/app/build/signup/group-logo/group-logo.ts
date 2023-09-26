import {Component, OnInit, Input, Output, NgZone, EventEmitter} from '@angular/core';
import {FormGroup} from '@angular/forms';

@Component({
  selector: 'signup-build-group-logo',
  templateUrl: 'group-logo.html',
  styleUrls: ['group-logo.css']
})
export class SignUpBuildGroupLogoComponent implements OnInit {
  @Input() parentGroup: FormGroup;
  @Input() groupPic: string;
  @Input() userId: string;
  @Input() forkNum: number;

  @Output() newStep: EventEmitter <number[]> = new EventEmitter();
  @Output() previousStep: EventEmitter <boolean> = new EventEmitter();

  @Output() picSlide: EventEmitter <boolean> = new EventEmitter();
  @Output() picDelete: EventEmitter <boolean> = new EventEmitter();

  title: string;
  acronym: string;
  picBuildFlag = false;

  labType: number;

  ngOnInit(): void {
    const groupName = this.parentGroup.get('group').value;
    const matches = groupName.match(/\b(\w)/g);
    this.acronym = matches.join('').substring(0, 2).toUpperCase();
    this.labType = (this.forkNum==4 || this.forkNum==5 || this.forkNum==7) ? 1 : 0;
  }

  picOp() {
    this.picSlide.emit()
  }

  picDeleteOp() {
    this.picDelete.emit()
  }

  toStep(): void {
    this.newStep.emit([]);
  }

  toPrevious(): void {
    this.previousStep.emit();
  }

}
