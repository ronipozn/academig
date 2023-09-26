import {Component, Input} from '@angular/core';
import {FormGroup} from '@angular/forms';

@Component({
  selector: 'pi-info',
  templateUrl: 'pi-info.html',
  styleUrls: ['pi-info.css']
})
export class PIInfoComponent {
  @Input() parentGroup: FormGroup;
  @Input() submitStatus: boolean;

  emailValid: boolean;

  positionSelect = [{display: 'Full Professor', value: 100},
                    {display: 'Associate Professor', value: 101},
                    {display: 'Assistant Professor', value: 102},
                    {display: 'Professor Emeritus', value: 103},
                   ];

  ngOnInit() {
    // this.subscription =
    this.parentGroup.controls['instituteEmail'].valueChanges.subscribe(data => {
      this.emailValidatelFunc()
    })
  }

  emailValidatelFunc() {
   if (this.parentGroup.controls['secondInstituteEmail'].value!='' && this.parentGroup.controls['instituteEmail'].value==this.parentGroup.controls['secondInstituteEmail'].value) {
     this.emailValid = false;
   } else {
     this.emailValid = true;
   }
  }

}
