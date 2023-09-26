import { Injectable } from '@angular/core';
import { Router, CanActivate, UrlTree, UrlSegmentGroup, UrlSegment, PRIMARY_OUTLET } from '@angular/router';

@Injectable()
export class LabGuardService implements CanActivate {

  constructor(public router: Router) {}

  canActivate(): boolean {
    const tree: UrlTree = this.router.parseUrl(this.router.routerState.snapshot.url);
    const g: UrlSegmentGroup = tree.root.children[PRIMARY_OUTLET];
    const s: UrlSegment[] = g ? g.segments : [];

    // console.log('s',s)
    // console.log('s1',s[0].path)
    // console.log('s2',s[0].path=="company")

    if (s[0] && s[0].path=="company") {
      return false;
    }
    return true;
  }

}
