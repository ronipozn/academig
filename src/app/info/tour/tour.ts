import {Component} from '@angular/core';
import {Title} from '@angular/platform-browser';

import {AuthService} from '../../auth/auth.service';

import Auth0Client from '@auth0/auth0-spa-js/dist/typings/Auth0Client';

@Component({
  selector: 'tour',
  templateUrl: 'tour.html',
  styleUrls: ['tour.css']
})
export class TourComponent {

  private auth0Client: Auth0Client;

  constructor(private titleService: Title,
              public authService: AuthService) {
    this.titleService.setTitle('Tour | Academig');
  }

  async ngOnInit() {
    this.auth0Client = await this.authService.getAuth0Client();
  }

  async login() {
    await this.auth0Client.loginWithRedirect({});
  }

  stepsGroups: string[] = [
    'Sign Up',
    'Follow the Wizard',
    'Add Publications',
    'Invite Members',
    'Add Content',
    'Choose Design',
    'Magic',
    'Open Positions',
    'Lab Productivity',
    'Live',
    'The Big Picture',
    'Domain',
    'Time to celebrate',
    'Follow'
  ];

  iconsGroups: string[] = [
    'sign-in',
    'list-ul',
    'book',
    'users',
    'align-left',
    'paint-brush',
    'magic',
    'exchange',
    'line-chart',
    'play',
    'university',
    'globe',
    'trophy',
    'rss'
  ];

  devGroups: boolean[] = [
    false,
    false,
    false,
    false,
    false,
    true,
    false,
    false,
    false,
    false,
    false,
    true,
    false,
    false
  ];

  textsGroups: string[] = [
    'Create an account and you are moments away from building your new lab profile or accepting your lab invite.',

    'Follow the smart wizard and your your lab profile will be ready in no time, including all the info that you\'ve just entered.',

    'Your publications are already waiting for you. Go to your publications page and accept or reject our suggestions for you.',

    'Go to the people page and start inviting your lab members. Once they are in, they can help you maintain and update the profile with fresh content.',

    'Using our laser foucsed dedicated academic tools, you can add everything from news, resarch projects, services to teaching, funding, collaborations, galleries, and so much more.',

    'We have a few different themes for you to choose from, and you can also control the fonts, the colors and some general styling. If you have a request for a design we don\'t currently offer, don\'t hesitate to contact us and make a request.',

    'Click the magic wand button and our smart algorithms will search for new content for your profile. We extract content from your existing website, academic social profiles, publications, and more.',

    'If there are vacancies in the group, you can add them in the positions page. You can also manage the applications right here in your lab profile.',

    'Your lab has a dedicated place for managing the lab meetings, reports, internal communications and for sharing personal information. If you like to see more stuff here, don\'t hestitate to contact us with any request.',

    'We will go over your site, and if everything seems to be OK, it will be go live in a few hours. We will email you once your site goes live.',

    'Your lab profile is automatically included in the department page of your university inside Academig.',

    'You can attach your own custom domain with your new shiny lab profile. You can even replace your current lab site in your institute website. We will help you with that.',

    'In gratitude for joining Academig, we will send your lab our special gifts package to show our appreciation. We will coordinate with you the best time and date for delivery.',

    'Now its time to follow other research labs profiles and researchers profiles. If you do not find one or more of your colleagues, just invite them to join Academig.'
  ]

  // letter, stickers, cake to seminars, lab photographers

  stepsPersonal: string[] = [
    'Sign Up',
    'Choose Type',
    'Follow the Wizard',
    'CV',
    'Add Publications',
    'Add Content',
    'Choose Design',
    'Magic',
    'Domain',
    'Follow'
  ];

  iconsPersonal: string[] = [
    'sign-in',
    'map-signs',
    'list-ul',
    'id-card',
    'book',
    'align-left',
    'paint-brush',
    'magic',
    'globe',
    'rss'
  ];

  devPersonal: boolean[] = [
    false,
    false,
    false,
    false,
    false,
    false,
    true,
    true,
    true,
    false
  ];

  textsPersonal: string[] = [
    'Create an account and you are moments away from building your new personal academic website.',
    'Choose building a personal website. Don\'t worry, you can always build your lab website later on.',
    'Follow the smart wizard and your your website will be ready in no time, including all the info that you\'ve just entered.',
    'Update your home page with your positions, experience, honors, etc',
    'Your publications are already waiting for you. Go to your publications page and accept or reject our suggestions for you.',
    'Using our super dedicated academic tools, you can add everything from news, resarch projects, services to teaching, funding, collaborations, galleries, and so much more.',
    'We have a few different themes for you to choose from, and you can also control the fonts, the colors and some general styling. If you have a request for a design we don\'t currently offer, don\'t hesitate to contact us and make a request.',
    'Click the magic wand button and our smart algorithms will search for new content for your website. We extract content from your existing website, academic social profiles, publications, and more.',
    'You can attach your own custom domain with your new shiny website. You can even replace your current site in your institute website. We will help you with that.',
    'Now its time to follow other labs websites and personal academic websites. If you do not find one or more of your colleagues, just invite them to join Academig.'
  ]

}
