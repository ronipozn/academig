import {Component, Input} from '@angular/core';
import {Router} from '@angular/router';

import {objectMini, groupComplex} from '../../shared/services/shared-service';
import {titlesTypes} from '../../shared/services/people-service';

import {NGXLogger} from 'ngx-logger';

@Component({
  selector: 'notification-item',
  templateUrl: 'notification-item.html',
  styleUrls: ['notification-item.css']
})
export class NotificationItemComponent {
  @Input() actor: any; //objectMini;
  @Input() verb: number;
  @Input() object: any; //objectMini;
  @Input() target: groupComplex;
  @Input() members: objectMini[];

  @Input() time: string;
  @Input() text: string;
  @Input() link: string;
  @Input() pic: string;

  @Input() is_read: boolean;
  @Input() is_seen: boolean;

  picItem: string; // actor
  type = 0;
  titlesSelect = titlesTypes;
  verbDigits: number[] = [];

  constructor(
    private router: Router,
    private logger: NGXLogger
  ) { }

  ngOnInit() {

    this.verbDigits[0] = Number(('' + this.verb)[0]);
    this.verbDigits[1] = Number(('' + this.verb)[1]);
    this.verbDigits[2] = Number(('' + this.verb)[2]);
    this.verbDigits[3] = Number(('' + this.verb)[3]);
    this.verbDigits[4] = Number(('' + this.verb)[4]);

    if (this.actor) {

      if (this.actor.pic) {
        this.picItem = this.actor.pic;
      } else {
        this.picItem = this.actor.group.pic;
      }

    } else if ((this.verb[0] == 1 && this.verb[1] == 5) || this.verb[0] == 3 || this.verb == 16202 ||
               (this.verb[0] == 1 && this.verb[1] == 3 && this.verb[2] == 1)) {

      this.picItem = './assets/img/academig.jpg';

    } else {

      this.picItem = null;

    }

  }

  navigateFunc() {
    const v: number = Number(this.verb);
    const r100: number = Math.round(v/100);
    const r1000: number = Math.round(v/1000);
    this.logger.debug('verb',v);
    this.logger.debug('r100',r100);
    this.logger.debug('r1000',r1000);

    // switch (Number(this.verb)) {
    switch (true) {

      case (v==1001): case (v==6001): this.router.navigate(['/publications/', this.object._id]); break;
      case (v==1002): case (v==6002): case (v==9001): case (v==9002): this.router.navigate(['/services/', this.object._id]); break;
      case (v==1003): case (v==6003): case (v==9501): case (v==9502): this.router.navigate(['/projects/', this.object._id]); break;
      case (v==1004): this.router.navigate(['/', this.object.university.link, this.object.department.link, this.object.group.link, 'collaborations']); break;
      case (v==1005): case (v==6004): this.router.navigate(['/positions/', this.object._id]); break;
      case (v==1006): this.router.navigate(['/', this.object.university.link, this.object.department.link, this.object.group.link, 'fundings']); break;

      case (v==1500): this.router.navigate(['/', this.object.university.link, this.object.department.link, this.object.group.link]); break;

      case (v==1011): case (v==1012): case (v==1013): // Go to Talk / Poster / Press
        this.router.navigate(['/', this.actor.university.link, this.actor.department.link, this.actor.group.link, 'media']); break;

      case (v==3000): case (v==3001): case (v==6000): // Lab Profile
        this.router.navigate(['/', this.object.university.link, this.object.department.link, this.object.group.link]); break;
        // this.router.navigate(['/', this.actor.university.link, this.actor.department.link, this.actor.group.link]); break;

      case (v==4000): case (v==4100): case (v==4500): case (v==4600): // Go to lab' people request
        this.router.navigate(['/', this.actor.university.link, this.actor.department.link, this.actor.group.link, 'people']); break;

      case (v==10000): case (v==10001): // Go to Collaboration Request / Collaboration
        this.router.navigate(['/', this.object.university.link, this.object.department.link, this.object.group.link, 'collaborations']); break;

      case (v==11000): case (v==11001): // Go to Funding Request / Funding
        this.router.navigate(['/', this.object.university.link, this.object.department.link, this.object.group.link, 'fundings']); break;

      case (v==15000): // Take the tour [routerLink]="['tour']"
        this.router.navigate(['./features']); break;

      case (v==16100): case (v==16104): this.router.navigate(['/', this.object.university.link, this.object.department.link, this.object.group.link, 'private','meetings']); break;
      case (v==16101): case (v==16102): case (v==16103): this.router.navigate(['/', this.actor.university.link, this.actor.department.link, this.actor.group.link, 'private','meetings']); break;
      case (v==16000): case (v==16001): this.router.navigate(['/', this.object.university.link, this.object.department.link, this.object.group.link, 'private','news']); break;
      case (v==16300): this.router.navigate(['/', this.object.university.link, this.object.department.link, this.object.group.link, 'private','events']); break;
      case (v==16400): this.router.navigate(['/', this.object.university.link, this.object.department.link, this.object.group.link, 'private','chat']); break;

      // verbDigits[0]==1 && verbDigits[1]==6 && verbDigits[2]==2
      case (r100==162):
        this.router.navigate(['/', this.object.university.link, this.object.department.link, this.object.group.link, 'private','reports']); break;

      // verbDigits[0]==1 && verbDigits[1]==3 && verbDigits[2]==1
      case (r100==131):
        this.router.navigate(['/', 'settings', 'report-and-block']); break;

      case (r1000==13):
        switch (this.verbDigits[4]) {
          case 0: this.router.navigate(['/', this.object.university.link, this.object.department.link, this.object.group.link]); break;
          case 1: this.router.navigate(['/','people', this.object._id]); break;
          case 2: this.router.navigate(['/','publications', this.object._id]); break;
          case 3: this.router.navigate(['/','services', this.object._id]); break;
          case 4: this.router.navigate(['/','projects', this.object._id]); break;
          case 5: this.router.navigate(['/','jobs', this.object._id]); break;
        }

      case (r1000==5):
        this.router.navigate(['/', this.object.university.link, this.object.department.link, this.object.group.link]); break;

      default:
        break;
    }
  }

}
