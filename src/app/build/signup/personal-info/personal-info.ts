import {Component, Input, Output, EventEmitter} from '@angular/core';
import {FormGroup} from '@angular/forms';

import {Observable} from 'rxjs';
import {debounceTime, distinctUntilChanged, map} from 'rxjs/operators';

import {Countries, objectMiniPosition} from '../../../shared/services/shared-service';

@Component({
  selector: 'signup-build-personal-info',
  templateUrl: 'personal-info.html',
  styleUrls: ['personal-info.css']
})
export class SignUpBuildPersonalInfoComponent {
  @Input() parentGroup: FormGroup;
  @Input() forkNum: number;
  @Input() userId: string;

  @Input() userPic: string;

  @Output() newStep: EventEmitter <number[]> = new EventEmitter();
  @Output() previousStep: EventEmitter <boolean> = new EventEmitter();
  @Output() picSlide: EventEmitter <boolean> = new EventEmitter();

  errorFlag: boolean[] = [false, false];

  countries = Countries;
  formatter = (x: {name: string}) => x.name;
  // search = (text$: Observable<string>) =>
  //   text$.pipe(
  //     debounceTime(100),
  //     distinctUntilChanged(),
  //     map(term => term.length < 2 ? []
  //       : this.countries.map(r=>r.name).filter(v => v.toLowerCase().indexOf(term.toLowerCase()) > -1).slice(0, 10))
  //   )
  search = (text$: Observable<string>) =>
    text$.pipe(
      debounceTime(100),
      distinctUntilChanged(),
      map(term => term === '' ? []
        : this.countries.filter(v => v.name.toLowerCase().indexOf(term.toLowerCase()) > -1).slice(0, 10))
    )


  onClick(i: number): void {
    this.errorFlag[i] = false;
  }

  picOp() {
    this.picSlide.emit()
  }

  toStep(): void {
    this.errorFlag = [false, false];

    if (this.parentGroup.get('firstName').invalid) {
      this.errorFlag[0] = true;
    }

    if (this.parentGroup.get('lastName').invalid) {
      this.errorFlag[1] = true;
    }

    if (this.errorFlag[0] == false && this.errorFlag[1] == false) {

      const preMembers = this.parentGroup.controls['preMembers'].value;

      const userMe: objectMiniPosition = {
        "_id": preMembers[0]._id,
        "name": this.parentGroup.get('firstName').value + ' ' + this.parentGroup.get('lastName').value,
        "pic": preMembers[0].pic,
        "email": preMembers[0].email,
        "position": preMembers[0].position,
        "startDate": preMembers[0].startDate,
        "endDate": preMembers[0].endDate,
        "active": preMembers[0].active,
        "messageFlag": preMembers[0].messageFlag,
        "message": preMembers[0].message
      }

      this.parentGroup.controls['preMembers'].setValue([userMe]);

      this.newStep.emit([]);
    }
  }

  toPrevious(): void {
    this.previousStep.emit();
  }

}
