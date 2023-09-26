import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { FormGroup, FormControl, FormArray, Validators } from '@angular/forms';

import { AuthService } from '../../../../auth/auth.service';

import { UserService } from '../../../../user/services/user-service';

import { slideInOutAnimation } from '../../../../shared/animations/index';

import { FAQ } from '../../../services/faq-service';

@Component({
    selector: 'build-slide-faq',
    templateUrl: 'build-slide-faq.html',
    animations: [slideInOutAnimation],
    host: { '[@slideInOutAnimation]': '' },
    styleUrls: ['build-slide-faq.css']
})

export class BuildSlideFAQComponent implements OnInit {
  @Input() faq: FAQ;
  @Input() newFlag: boolean;

  @Output() cancel: EventEmitter <boolean> = new EventEmitter(true);
  @Output() update: EventEmitter <{question: string, answer: string}> = new EventEmitter(true);

  submitStatus: boolean = false;
  disableFlag: boolean = false;
  formModel: FormGroup;

  adminFlag: boolean = false;

  constructor(
    public userService: UserService,
    private authService: AuthService
  ) {
    this.formModel = new FormGroup({
      question: new FormControl('', Validators.required),
      answer: new FormControl('', Validators.required),
    });

  }

  ngOnInit() {
    this.authService.token.subscribe(token => {
      this.adminFlag = this.authService.userHasScopes(token, ['write:groups'])
      if (this.adminFlag && this.newFlag) this.formModel.addControl('intelligence', new FormArray([new FormControl()]));
    });

    if (!this.newFlag) {
      this.formModel.setValue({
        question: this.faq.question,
        answer: this.faq.answer,
      });
    }
  }

  onSubmit() {
    if (this.formModel.valid) {
      this.disableFlag = true;
      this.update.emit(this.formModel.value);
    } else {
      this.submitStatus = !this.submitStatus;
    }
  }

  onCancel() {
    this.cancel.emit(false);
  }

}
