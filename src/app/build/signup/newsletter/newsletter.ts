import {Component, Input, Output, EventEmitter} from '@angular/core';
import {FormGroup, FormArray} from '@angular/forms';

@Component({
  selector: 'signup-build-newsletter',
  templateUrl: 'newsletter.html',
  styleUrls: ['newsletter.css']
})
export class SignUpBuildNewsletterComponent {
  @Input() parentGroup: FormGroup;

  @Output() newStep: EventEmitter <number[]> = new EventEmitter();
  @Output() previousStep: EventEmitter <boolean> = new EventEmitter();

  arrayControl: FormArray;

  toStep(): void {
    this.newStep.emit([]);
  }

  toPrevious(): void {
    this.previousStep.emit();
  }

  ngOnInit() {
    this.parentGroup.controls['subscribe'].valueChanges.subscribe((value: string) => {
      this.arrayControl = this.parentGroup.get('subscribe') as FormArray;
      // console.log('111',this.arrayControl.at(0).value);
    });
  }

  topics: string[] = [
    "The digest email",
    "Academig Launchpad emails",
    "Academig updates",
    "News and special events"
  ];

  topicsIcon: string[] = [
    "rss",
    "rocket",
    "refresh",
    "newspaper-o"
  ];

  topicsExplain: string[] = [
    "Get updates from labs and departments that you follow or belong to.",
    "A two-week welcome series for learning the ins and outs of Academig.",
    "Product updates and new feature announcements.",
    "The Academig newsletter, invites to online and in-person events, and weekly updates from research labs",
  ];
}
