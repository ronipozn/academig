import {Component, OnInit} from '@angular/core';
import {Title} from '@angular/platform-browser';
import {FormBuilder, FormArray, FormGroup, FormControl, Validators} from '@angular/forms';
import {ViewportScroller} from '@angular/common';
import {BreakpointObserver, Breakpoints} from '@angular/cdk/layout';

import {Router, ActivatedRoute} from '@angular/router';
import {UrlTree, UrlSegmentGroup, UrlSegment, PRIMARY_OUTLET} from '@angular/router';

import {CustomValidators} from 'ng2-validation';

import {screenAnimation} from '../screen.animation';

import {UserService} from '../../user/services/user-service';
import {SharedService} from '../../shared/services/shared-service';
import {Price, CreateResource, ResourceService} from '../../shared/services/resource-service';
import {SubmitMentor, MentorService} from '../../shared/services/mentor-service';

function universityValidator(control: FormControl): {[key: string]: any} {
  const value: string = control.value._id || '';
  const valid = value;
  return valid ? null : {ssn: true};
}

@Component({
    selector: 'service-build',
    templateUrl: 'build.html',
    animations: [screenAnimation],
    host: { '[@screenAnimation]': '' },
    styleUrls: ['build.css']
})
export class BuildComponent implements OnInit {
  profileId: string;
  validFlag: boolean = true;

  submitFlag: boolean = false;
  submitStatus: boolean[] = [false, false];
  streamRetrieved: boolean = false;

  firstInvalid: string[] = [];
  isLinear: boolean = false;

  firstFormGroup: FormGroup;
  secondFormGroup: FormGroup;
  thirdFormGroup: FormGroup;

  feedbackSelect: string[] = ["Search Engine", "Social Media (Facebook, Twitter, Linkedin, etc.)", "Friend or Co-worker", "Podcast", "Email", "Website", "Blog", "Conference or Trade-show", "Other"];

  smallScreen: boolean;

  constructor(
      private router: Router,
      private activatedRoute: ActivatedRoute,
      private breakpointObserver: BreakpointObserver,
      private _formBuilder: FormBuilder,
      private titleService: Title,
      private viewportScroller: ViewportScroller,
      public sharedService: SharedService,
      public mentorService: MentorService,
      public resourceService: ResourceService,
      public userService: UserService) {
    this.titleService.setTitle('Become A Mentor | Academig');

    breakpointObserver.observe([
      Breakpoints.XSmall,
      Breakpoints.Small
    ]).subscribe(result => {
      this.smallScreen = result.matches;
    });
  }

  updateNavigation() {
    const tree: UrlTree = this.router.parseUrl(this.router.routerState.snapshot.url);
    const g: UrlSegmentGroup = tree.root.children[PRIMARY_OUTLET];
    const s: UrlSegment[] = g ? g.segments : [];
    this.profileId = (s.length>1) ? s[1].path : null;

  }

  async ngOnInit() {
    this.updateNavigation();

    if (this.profileId==null || (this.profileId!=this.userService.userId)) this.validFlag=false;
    // TBD mentorFlag

    this.streamRetrieved = false;

    // contactEmail: new FormControl('', Validators.required),
    // twitter: new FormControl(''),
    // firstName: new FormControl(this.labFlag ? this.userService.buildGroupJob.firstName : this.capitalizeFirstLetter(''), (this.userService.userId==null) ? Validators.required : null), // FIX
    // lastName: new FormControl(this.capitalizeFirstLetter(''), (this.userService.userId==null) ? Validators.required : null), // FIX
    // startDate: new FormControl('', Validators.required),

    this.firstFormGroup = this._formBuilder.group({
      first_name: new FormControl(null, Validators.required),
      last_name: new FormControl(null, Validators.required),
      linkedin: new FormControl(null, Validators.required),
      position: new FormControl(null, Validators.required),
      experience: new FormControl(null, Validators.required),
      charging: new FormControl(null, Validators.required),
      charing_importance: new FormControl(null, Validators.required),
      pitch: new FormControl(null, Validators.required),
      price_hour: new FormControl(null, Validators.required),
      charging_terms: new FormControl(null, Validators.required),
      background_terms: new FormControl(null, Validators.required),
      // standout: new FormControl(0),
    });

    this.secondFormGroup = this._formBuilder.group({
      academic_writing: new FormControl(null, Validators.required),
    });

    this.thirdFormGroup = this._formBuilder.group({
      hours: new FormControl(null, Validators.required),
      past_mentoring: new FormControl(null, Validators.required),
      communication_tool: new FormControl(null, Validators.required),
      description: new FormControl(null, Validators.required),
      mindset: new FormControl(null, Validators.required),
      desired_topic: new FormControl(null, Validators.required),
      out_of_the_box: new FormControl(null, Validators.required),
      content: new FormControl(null, Validators.required),

      feedback: new FormControl(null)
    });

    // MentorsClub:
    // clubStatus: new FormControl(false),
    // clubEmail: new FormControl(''),
    // clubEmailSame: new FormControl(false),
    // clubPhone: new FormControl(''),
    // clubAddress: new FormControl(''),
    // clubTime: new FormControl(''),

    this.streamRetrieved = true;
  }

  async onSubmit() {
    this.submitFlag = true;
    if (this.userService.userId) this.mentorPut();
    this.router.navigate(['confirm'], { relativeTo: this.activatedRoute });
  }

  async mentorPut(): Promise<any> {
    const submitMentor: SubmitMentor = {
      first_name: this.firstFormGroup.value.first_name,
      last_name: this.firstFormGroup.value.last_name,
      linkedin: this.firstFormGroup.value.linkedin,
      position: this.firstFormGroup.value.position,
      experience: this.firstFormGroup.value.experience,
      charging: this.firstFormGroup.value.charging,
      charing_importance: this.firstFormGroup.value.charing_importance,
      pitch: this.firstFormGroup.value.pitch,
      price_hour: this.firstFormGroup.value.price_hour,
      charging_terms: this.firstFormGroup.value.charging_terms,
      background_terms: this.firstFormGroup.value.background_terms,

      academic_writing: this.secondFormGroup.value.background_terms,

      hours: this.thirdFormGroup.value.background_terms,
      past_mentoring: this.thirdFormGroup.value.background_terms,
      communication_tool: this.thirdFormGroup.value.background_terms,
      description: this.thirdFormGroup.value.background_terms,
      mindset: this.thirdFormGroup.value.background_terms,
      desired_topic: this.thirdFormGroup.value.background_terms,
      out_of_the_box: this.thirdFormGroup.value.background_terms,
      content: this.thirdFormGroup.value.background_terms,

      // standout: this.thirdFormGroup.value.standout,
      feedback: this.thirdFormGroup.value.feedback,
    }

    const mentorId = await this.mentorService.putSubmitMentor(submitMentor);
  }

  capitalizeFirstLetter(string) {
    return string.charAt(0).toUpperCase() + string.slice(1);
  }

  onContinue(i: number) {
    this.submitStatus[i] = true;
    this.findInvalidControls(i);
  }

  // https://stackoverflow.com/questions/57731339/how-does-matstepper-triggers-the-error-state-for-a-step
  findInvalidControls(i: number) {
    const controls = this.firstFormGroup.controls;
    var err: string;
    var modified: string;

    this.firstInvalid = [];
    for (const name in controls) {
      if (controls[name].invalid) {
        modified = name;
        switch (name) {
          case "category": modified="Service Category"; break;
          case "description": modified="Service Description"; break;
          case "group": modified="Lab Name"; break;
          case "website": modified="Lab\'s Website URL"; break;
          case "contactEmail": modified="Lab\'s Contact Email"; break;

          case "position": modified="Current Education or Position"; break;
          case "firstName": modified="First Name"; break;
          case "lastName": modified="Last Name"; break;
          case "startDate": modified="Start Date"; break;
          case "instituteEmail": modified="Institute Email"; break;

          case "secondPosition": modified="Principal Investigator Position"; break;
          case "secondFirstName": modified="Principal Investigator First Name"; break;
          case "secondLastName": modified="Principal Investigator Last Name"; break;
          case "secondStartDate": modified="Principal Investigator Start Date"; break;
          case "secondInstituteEmail": modified="Principal Investigator Institute Email"; break;

          case "interviewEmail": modified="Interview Email"; break;
          case "clubEmail": modified="Club Email"; break;
        }

        console.log('name',name)
        console.log('controls[name]',controls[name])

        if (name=="request") {
          // https://stackoverflow.com/questions/46926182/property-controls-does-not-exist-on-type-abstractcontrol-angular-4
          err = 'How to request info is ' + (((controls[name] as FormGroup).controls['direct'].errors.required) ? 'required' : 'invalid');
        } else {
          err = modified + ' is ' + ((controls[name].errors.required==true) ? 'required' : 'invalid');
        }

        this.firstInvalid.push(err)
      }
    }
    if (this.firstInvalid.length>0) this.viewportScroller.scrollToPosition([0, 0]);
  }
}
