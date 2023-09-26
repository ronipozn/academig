import {Component, OnInit, OnDestroy} from '@angular/core';
import {Title} from '@angular/platform-browser';
import {ActivatedRoute} from '@angular/router';
import {Subscription} from 'rxjs/Subscription';

import { AuthService } from '../../auth/auth.service';

@Component({
  selector: 'blog-post-view',
  styleUrls: ['./blog-post-view.css'],
  templateUrl: './blog-post-view.html'
})
export class BlogPostViewComponent implements OnInit, OnDestroy {
  private sub: Subscription;

  post: string;
  pageId: string;

  isAuthenticated: boolean;

  constructor(private route: ActivatedRoute,
              private authService: AuthService) { }

  async ngOnInit() {
    this.authService.isAuthenticated.subscribe(value => {
      this.isAuthenticated = value;
    });

    this.sub = this.route.params.subscribe(params => {
      this.post = './assets/blog/post/' +  params['id'] + '.md';
      this.pageId = params['id'];
    });
  }

  ngAfterViewInit() {
    var script = document.createElement("script");
    script.src = "//talk.hyvor.com/web-api/embed";
    script.async = true;
    window['HYVOR_TALK_WEBSITE'] = 1171; // DO NOT CHANGE THIS
    window['HYVOR_TALK_CONFIG'] = {
      url: false,
      id: false
    };
    document.body.appendChild(script);
  }

  ngOnDestroy() {
    if (this.sub) this.sub.unsubscribe();
  }

}
