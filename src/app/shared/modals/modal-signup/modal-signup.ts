import {Component, Input} from '@angular/core';
import {Router} from '@angular/router';

import {UserService} from '../../../user/services/user-service';

import {AuthService} from '../../../auth/auth.service';
import Auth0Client from '@auth0/auth0-spa-js/dist/typings/Auth0Client';

@Component({
    selector: 'modal-signup',
    templateUrl: 'modal-signup.html'
})
export class ModalSignupComponent {
  @Input() action: string;
  @Input() itemText: string;
  @Input() mode: number = 0 ; // 0: signup
                              // 1: verify email

  private auth0Client: Auth0Client;

  constructor(
    private router: Router,
    public userService: UserService,
    public authService: AuthService
  ) { }

  async ngOnInit() {
    this.auth0Client = await this.authService.getAuth0Client();
  }

  async login() {
    await this.auth0Client.loginWithRedirect({
      redirect_uri: `${window.location.origin}/callback`,
      appState: { target: this.router.url }
    });
  }

}
