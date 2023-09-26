import {Component, Input, Output, OnInit, EventEmitter} from '@angular/core';
import {FormGroup} from '@angular/forms';

@Component({
  selector: 'signup-build-current-website',
  templateUrl: 'current-website.html',
  styleUrls: ['current-website.css']
})
export class SignUpBuildCurrentWebsiteComponent implements OnInit {
  @Input() parentGroup: FormGroup;
  @Input() forkNum: number;

  @Output() newStep: EventEmitter <number[]> = new EventEmitter();
  @Output() previousStep: EventEmitter <boolean> = new EventEmitter();

  errorFlag = false; ;

  ngOnInit() {
    this.checkCurrentWebsite()
  }

  onType(type: number) {
    this.parentGroup.get('currentWebsite').setValue(type);
  }

  toStep(): void {
    this.errorFlag = false; ;

    if (this.parentGroup.get('currentWebsite').invalid) {
      this.errorFlag = true;
    } else {
      this.newStep.emit([]);
    }
  }

  toPrevious(): void {
    this.previousStep.emit();
  }

  checkCurrentWebsite(): void {
    if (this.parentGroup.get('currentWebsite').value.length) {
      this.parentGroup.controls['allowSendEmails'].enable();
    } else {
      this.parentGroup.controls['allowSendEmails'].disable();
    }
  }

}
