import { Injectable } from '@angular/core';
import createAuth0Client from '@auth0/auth0-spa-js';
import Auth0Client from '@auth0/auth0-spa-js/dist/typings/Auth0Client';
import { BehaviorSubject } from 'rxjs';

import * as jwt_decode from "jwt-decode";

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  isAuthenticated = new BehaviorSubject(false);
  profile = new BehaviorSubject<any>(null);
  token = new BehaviorSubject<any>(null);

  private auth0Client: Auth0Client;

  // openid profile email
  requestedScopes = 'write:reports read:reports write:publications read:publications write:peoples read:peoples write:groups read:groups write:departments read:departments delete:departments write:universities read:universities delete:universities';

  // Auth0 application configuration
  config = {
    domain: "academig.eu.auth0.com",
    client_id: "jEW2WutsRBNBz88e5XgjRPedbmRL98iC",
    redirect_uri: `${window.location.origin}/callback`,
    audience: "https://api.academig.com",
    // login: true,
    scope: this.requestedScopes
  };

  // Gets the Auth0Client instance.
  async getAuth0Client(): Promise<Auth0Client> {
    if (!this.auth0Client) {
      this.auth0Client = await createAuth0Client(this.config);

      // Provide the current value of isAuthenticated
      this.isAuthenticated.next(await this.auth0Client.isAuthenticated());

      // Whenever isAuthenticated changes, provide the current value of `getUser`
      this.isAuthenticated.subscribe(async isAuthenticated => {
        if (isAuthenticated) {
          this.profile.next(await this.auth0Client.getUser());
          return;
        }
        this.profile.next(null);
      });

      this.isAuthenticated.subscribe(async isAuthenticated => {
        if (isAuthenticated) {
          this.token.next(await this.auth0Client.getTokenSilently());
          return;
        }
        this.token.next(null);
      });

    }

    return this.auth0Client;
  }

  userHasScopes(token: string, scopes: Array<string>): boolean {
    try{
      const grantedScopes = jwt_decode(token).scope;
      return scopes.every(scope => grantedScopes.includes(scope));
    }
    catch(Error){
      return null;
    }
  }

}
