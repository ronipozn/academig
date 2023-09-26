import {Component, OnInit, ViewChild, ElementRef} from '@angular/core';
import {Title} from '@angular/platform-browser';
// import {Router} from '@angular/router';

import {UserService} from '../user/services/user-service';

import {itemsAnimation} from '../shared/animations/index';

@Component({
    selector: 'following',
    templateUrl: 'following.html',
    styleUrls: ['following.css'],
    animations: [itemsAnimation],
    host: { '[@itemsAnimation]': '' }
})
export class FollowingComponent implements OnInit {
  navLinks: any[];

  activeLink: string;

  @ViewChild('scrollPage', { static: false }) private scrollPage: ElementRef;

  constructor(private titleService: Title,
              // private router: Router,
              public userService: UserService) {

    this.navLinks = [
        {
        //   label: 'Institutes',
        //   link: './institutes',
        //   icon: 'account_balance',
        //   sum: (this.userService.userFollowings.institutesIds || []).length
        // }, {
        //   label: 'Departments',
        //   link: './departments',
        //   icon: 'apartment',
        //   sum: (this.userService.userFollowings.departmentsIds || []).length
        // }, {
          label: 'Labs',
          link: './labs',
          icon: 'supervised_user_circle'
        }, {
          label: 'Companies',
          link: './companies',
          icon: 'business'
        }, {
          label: 'Researchers',
          link: './researchers',
          icon: 'face'
        // }, {
        //   label: 'Mentors',
        //   link: './mentors',
        //   icon: 'hearing'
        // }, {
        //     label: 'Projects',
        //     link: './projects',
        //     icon: 'construction'
        }, {
          label: 'Services',
          link: './services',
          icon: 'construction'
        }, {
          label: 'Podcasts',
          link: './podcasts',
          icon: 'graphic_eq'
        }, {
          label: 'Events',
          link: './events',
          icon: 'event'
        }, {
          label: 'Apps',
          link: './apps',
          icon: 'computer'
        }
    ];
  }

  ngOnInit() {
    this.titleService.setTitle('My Following | Academig');
    // this.router.events.subscribe((e: any) => {
    //   this.scrollPage.nativeElement.scrollIntoView({ behavior: "auto", block: "center" });
    // });
  }
}
