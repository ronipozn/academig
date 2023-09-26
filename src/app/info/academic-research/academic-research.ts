import {Component, OnInit} from '@angular/core';
import {Title} from '@angular/platform-browser';

import {AuthService} from '../../auth/auth.service';

import Auth0Client from '@auth0/auth0-spa-js/dist/typings/Auth0Client';

@Component({
  selector: 'academic-research',
  templateUrl: 'academic-research.html',
  styleUrls: ['academic-research.css']
})
export class AcademicResearchComponent implements OnInit {
  isAuthenticated: boolean;

  private auth0Client: Auth0Client;

  constructor(private titleService: Title,
              public authService: AuthService) {
    this.titleService.setTitle('Academig Pro | Academig');
  }

  async ngOnInit() {
    this.auth0Client = await this.authService.getAuth0Client();

    this.authService.isAuthenticated.subscribe(value => {
      this.isAuthenticated = value
    });
  }

  async login() {
    await this.auth0Client.loginWithRedirect({});
  }

}
