import {Component} from '@angular/core';
import {Title} from '@angular/platform-browser';
import {Router} from '@angular/router';

import {AuthService} from '../../../auth/auth.service';

import Auth0Client from '@auth0/auth0-spa-js/dist/typings/Auth0Client';

@Component({
  selector: 'companies',
  templateUrl: 'companies.html',
  styleUrls: ['companies.css']
})
export class CompaniesComponent {

  private auth0Client: Auth0Client;

  constructor(private titleService: Title,
              private router: Router,
              public authService: AuthService) {
    this.titleService.setTitle('For Companies | Academig');
  }

  async ngOnInit() {
    this.auth0Client = await this.authService.getAuth0Client();
  }

  async login() {
    await this.auth0Client.loginWithRedirect({});
  }

  pricingClick() {
    this.router.navigate(['/pricing'], { fragment: 'companies' });
  }

}
