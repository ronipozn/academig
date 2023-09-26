import {Component, OnInit} from '@angular/core';
import {Title} from '@angular/platform-browser';

import {AuthService} from '../../auth/auth.service';

import Auth0Client from '@auth0/auth0-spa-js/dist/typings/Auth0Client';

@Component({
  selector: 'sign-up',
  templateUrl: 'sign-up.html',
  styleUrls: ['sign-up.css']
})
export class SignUpComponent implements OnInit {
  isAuthenticated: boolean;

  private auth0Client: Auth0Client;

  constructor(private titleService: Title,
              public authService: AuthService) {
    this.titleService.setTitle('Signup | Academig');
  }

  async ngOnInit() {
    this.auth0Client = await this.authService.getAuth0Client();
  }

  async login() {
    await this.auth0Client.loginWithRedirect({});
  }

}
