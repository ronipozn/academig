import {Component, Input, Output, EventEmitter} from '@angular/core';
import {FormGroup} from '@angular/forms';

@Component({
  selector: 'user-info',
  templateUrl: 'user-info.html',
  styleUrls: ['user-info.css']
})
export class UserInfoComponent {
  @Input() parentGroup: FormGroup;
  @Input() userId: string;
  @Input() submitStatus: boolean;

  emailValid: boolean;

  positionSelect = [{display: 'Full Professor', value: 100},
                    {display: 'Associate Professor', value: 101},
                    {display: 'Assistant Professor', value: 102},
                    {display: 'Professor Emeritus', value: 103},
                   ];

  educationSelect = [{display: 'Postdoc', value: 201},

                     {display: 'Ph.D.', value: 301},

                     {display: 'M.Sc.', value: 300},

                     {display: 'B.A.Sc.', value: 400},
                     {display: 'B.Sc.', value: 401},
                     {display: 'B.A.', value: 402},

                     {display: 'Assistant Researcher', value: 160},

                     {display: 'Director', value: 150},
                     // {display: 'Research Chair', value: 151},
                     {display: 'Lab Technician', value: 152},
                     {display: 'Lab Assistant', value: 153},
                     {display: 'Lab Secretary', value: 154},
                     {display: 'Lab Manager', value: 156},
                     {display: 'Senior Staff', value: 155},
                     {display: 'Research Assistant Professor', value: 157},

                     // {display: 'Licensed Engineer', value: 302},
                    ];

  ngOnInit() {
  // this.subscription =
    this.parentGroup.controls['secondInstituteEmail'].valueChanges.subscribe(data => {
      this.emailValidatelFunc()
    })
  }

  sameFunc() {
    this.parentGroup.controls['emailSame'].value ? this.parentGroup.controls['instituteEmail'].disable() : this.parentGroup.controls['instituteEmail'].enable();
    if (this.parentGroup.controls['emailSame'].value) this.parentGroup.controls['instituteEmail'].setValue('')
  }

  emailValidatelFunc() {
   if (this.parentGroup.controls['instituteEmail'].value!='' && this.parentGroup.controls['instituteEmail'].value==this.parentGroup.controls['secondInstituteEmail'].value) {
     this.emailValid = false;
   } else {
     this.emailValid = true;
   }
  }

}
