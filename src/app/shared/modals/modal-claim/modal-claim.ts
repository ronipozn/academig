import {Component, Input, Output, EventEmitter, OnInit, OnDestroy} from '@angular/core';

import {objectMini, SharedService} from '../../services/shared-service';

import {AuthService} from '../../../auth/auth.service';
import Auth0Client from '@auth0/auth0-spa-js/dist/typings/Auth0Client';

@Component({
    selector: 'modal-claim',
    templateUrl: 'modal-claim.html',
    styleUrls: ['modal-claim.css']
})
export class ModalClaimComponent implements OnInit {
  @Input() mode: number; // 0 - group
                         // 2 - publication
  @Input() userId: string;
  @Input() item: objectMini;

  @Output() closeModal: EventEmitter <boolean> = new EventEmitter();

  private auth0Client: Auth0Client;

  streamRetrieved: boolean = true;
  btnsDisabled = false;

  name: string = '';
  message: string = '';

  constructor(
    private sharedService: SharedService,
    private authService: AuthService
  ) { }

  async ngOnInit() {
    this.auth0Client = await this.authService.getAuth0Client();
    // switch (this.mode) {
    //    case 0: this.itemType = 'publication'; break;
    //    default: console.log('Invalid choice');
    // }
  }

  async login() {
    await this.auth0Client.loginWithRedirect({
      redirect_uri: `${window.location.origin}/callback`,
      // appState: { target: this.router.url }
    });
  }

  async sendClaim() {
    this.streamRetrieved = false;
    this.btnsDisabled = true;

    await this.sharedService.putClaim(this.mode, this.item._id, this.name, this.message);

    this.streamRetrieved = true;
    this.btnsDisabled = false;
    this.closeModal.emit(true);
    this.message = '';
    this.name = '';

    // err
    // this.message = '';

  }
}
