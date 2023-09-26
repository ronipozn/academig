import {Component, Input, Output, EventEmitter} from '@angular/core';
import {FormGroup, FormControl} from '@angular/forms';
import {AuthService} from '../../../auth/auth.service';

import {titlesTypes} from '../../../shared/services/people-service';
import {itemsAnimation} from '../../../shared/animations/index';

@Component({
  selector: 'signup-build-welcome',
  templateUrl: 'welcome.html',
  styleUrls: ['welcome.css'],
  animations: [itemsAnimation],
  host: { '[@itemsAnimation]': '' }
})
export class SignUpBuildWelcomeComponent {
  @Input() parentGroup: FormGroup;
  @Input() userName: string;
  @Input() forkNum: number;
  @Input() marketingFromDepartmentFlag: boolean = false;

  @Output() newStep: EventEmitter <number[]> = new EventEmitter();
  @Output() previousStep: EventEmitter <boolean> = new EventEmitter();

  titlesSelect = titlesTypes;

  stage: number = 0;
  labType: number = 0;

  adminFlag: boolean = false;

  constructor(private authService: AuthService) { }

  ngOnInit() {
    this.authService.token.subscribe(token => this.adminFlag = this.authService.userHasScopes(token, ['write:groups']));

    this.stage = (this.forkNum==1 || this.forkNum==3 || this.forkNum==5 || this.forkNum==8 || this.marketingFromDepartmentFlag) ? 1 : 0;
    this.labType = (this.forkNum==4 || this.forkNum==5 || this.forkNum==7) ? 1 : 0;
  }

  toStepPI(event): void {
    this.newStep.emit([1, (this.labType==1) ? 4 : 0]);
  }

  toStepMember(event): void {
    this.newStep.emit([1, 2]);
  }

  toStepMarketing(event): void {
    this.newStep.emit([1, (this.labType==1) ? 7 : 6]);
  }

  toStepPosition(i: number): void { // or personal
    this.newStep.emit([1, i]);
  }

  onType(type: number) {
    this.labType = type;
    this.stage = 1;
  }

}
