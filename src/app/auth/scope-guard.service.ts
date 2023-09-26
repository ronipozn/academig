import { Injectable } from '@angular/core';
import {
  CanActivate,
  ActivatedRouteSnapshot,
  RouterStateSnapshot,
  UrlTree,
  Router
} from '@angular/router';
import { AuthService } from './auth.service';

@Injectable({
  providedIn: 'root'
})
export class ScopeGuardService implements CanActivate {
  constructor(private authService: AuthService, private router: Router) {}

  async canActivate(
    next: ActivatedRouteSnapshot,
    state: RouterStateSnapshot
  ): Promise<boolean | UrlTree> {
    const client = await this.authService.getAuth0Client();
    const isAuthenticated = await client.isAuthenticated();

    if (isAuthenticated) {
      return true;
    }

    client.loginWithRedirect({
      redirect_uri: `${window.location.origin}/callback`,
      appState: { target: state.url }
    });

    return false;
  }
}


// import { Injectable } from '@angular/core';
// import { Router, CanActivate, ActivatedRouteSnapshot } from '@angular/router';
// import { AuthService } from './auth.service';
//
// @Injectable()
// export class ScopeGuardService implements CanActivate {
//
//   constructor(public auth: AuthService, public router: Router) {
//   }
//
//   canActivate(route: ActivatedRouteSnapshot): boolean {
//
//     const scopes = (route.data as any).expectedScopes;
//
//     if (!this.auth.isAuthenticated() || !this.auth.userHasScopes(scopes)) {
//       this.router.navigate(['']);
//       return false;
//     }
//     return true;
//   }
//
// }
