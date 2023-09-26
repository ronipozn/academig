import {Component, ViewChild, ElementRef} from '@angular/core';
import {Title} from '@angular/platform-browser';
import {Router} from '@angular/router';

import {AuthService} from '../../../auth/auth.service';

import Auth0Client from '@auth0/auth0-spa-js/dist/typings/Auth0Client';

@Component({
  selector: 'labs',
  templateUrl: 'labs.html',
  styleUrls: ['labs.css']
})
export class LabsComponent {

  private auth0Client: Auth0Client;

  @ViewChild('scrollAI', { static: true }) private scrollContainer: ElementRef;

  constructor(private titleService: Title,
              private router: Router,
              public authService: AuthService) {
    this.titleService.setTitle('For Labs | Academig');
  }

  async ngOnInit() {
    this.auth0Client = await this.authService.getAuth0Client();
  }

  async login() {
    await this.auth0Client.loginWithRedirect({});
  }

  scrollBuild() {
    this.scrollContainer.nativeElement.scrollIntoView({ behavior: "smooth", block: "start" });
  }

  pricingClick() {
    this.router.navigate(['/pricing'], { fragment: 'labs' });
  }

}
