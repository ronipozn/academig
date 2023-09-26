import {Component, OnInit, OnDestroy} from '@angular/core';
import {Router, NavigationEnd} from '@angular/router';
import {UrlTree, UrlSegmentGroup, UrlSegment, PRIMARY_OUTLET} from '@angular/router';
import {Subscription} from 'rxjs/Subscription';

@Component({
    selector: 'submit-main',
    templateUrl: 'submit-main.html',
    styleUrls: ['submit-main.css'],
})
export class SubmitComponent implements OnInit, OnDestroy {
  subscriptionRouter: Subscription;
  currentItem: string = null;

  constructor(public router: Router) { }

  async ngOnInit() {
    this.subscriptionRouter = this.router.events.subscribe((event) => {
      if (event instanceof NavigationEnd) {
        this.updateNavigation()
      }
      // window.scrollTo(0, 0)
    });
    this.updateNavigation()
  }

  async updateNavigation() {
    const tree: UrlTree = this.router.parseUrl(this.router.routerState.snapshot.url);
    const g: UrlSegmentGroup = tree.root.children[PRIMARY_OUTLET];
    const s: UrlSegment[] = g.segments;
    this.currentItem = s[0].path
  }

  ngOnDestroy() {
    if (this.subscriptionRouter) this.subscriptionRouter.unsubscribe();
  }

}
