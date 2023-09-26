import {Component, Input, OnInit, Output, EventEmitter} from '@angular/core';
import {FormGroup} from '@angular/forms';

@Component({
  selector: 'signup-build-topics',
  templateUrl: 'topics.html',
  styleUrls: ['topics.css']
})
export class SignUpBuildTopicsComponent implements OnInit {
  @Input() parentGroup: FormGroup;
  @Input() forkNum: number;
  @Input() topics: string[] = [];

  @Output() newStep: EventEmitter <number[]> = new EventEmitter();
  @Output() previousStep: EventEmitter <boolean> = new EventEmitter();

  topicSelections: string[];

  constructor() { }

  ngOnInit() { }

  // https://stackoverflow.com/questions/51147864/how-to-limit-angular-material-multiple-select-items-to-n-items
  topicsChanged() {
    if (this.parentGroup.get('topic').value.length < 6) {
      this.topicSelections = this.parentGroup.get('topic').value;
    } else {
      this.parentGroup.get('topic').setValue(this.topicSelections);
    }
  }

  toStep(): void {
    // this.errorFlag = [false, false, false, false];
    this.newStep.emit([]);
  }

  toPrevious(): void {
    this.previousStep.emit();
  }

}
