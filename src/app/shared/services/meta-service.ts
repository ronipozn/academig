// https://www.concretepage.com/angular/angular-meta-service-for-meta-tags
// https://gist.github.com/lancejpollard/1978404
// https://metatags.io/

// University + SubPages
// Department + SubPages
// Lab / Company + SubPages
// Researcher + SubPages

// Project
// Service
// Open Position
// Publications

// Landing x3
// Features
// How It Works
// Blog
// About
// Pricing x3
// Legal x2

import { Injectable } from '@angular/core';
import { Meta } from '@angular/platform-browser';

@Injectable({
   providedIn: 'root'
})
export class MetaService {

  constructor(private meta: Meta) { }

  addMetaTags(description: string, keywords: string, ogTitle: string) {
    this.meta.addTags([
      {name: 'description', content: description},
      {name: 'keywords', content: keywords}, // 'TypeScript, Angular'
      {name: 'robots', content: 'INDEX, FOLLOW'},
      {httpEquiv: 'Content-Type', content: 'text/html'},
      {charset: 'UTF-8'},
      {property: 'og:title', content: ogTitle},
      {property: 'og:type', content: "website"},
      // {name: 'date', content: '2018-06-02', scheme: 'YYYY-MM-DD'},
      // {name: 'author', content: 'ABCD'},
    ]);
  }

  getMetaTags() {
    let metaEl: HTMLMetaElement = this.meta.getTag('name=description');
    let metaKy: HTMLMetaElement = this.meta.getTag('name=keywords');
    // console.log('meta', metaEl, metaKy);
    // let els: HTMLMetaElement[] = this.meta.getTags('name');
    // els.forEach(el => console.log('meta',el));
  }

  updateMetaTags() {
    // this.meta.updateTag({name: 'description', content: 'Updated: Title and Meta tags examples'});
    // this.meta.updateTag({httpEquiv: 'Content-Type', content: 'application/json'}, 'httpEquiv= "Content-Type"');
    // this.meta.updateTag({name: 'robots', content: 'NOINDEX, NOFOLLOW'});
    // this.meta.updateTag({name: 'keywords', content: 'JavaScript, Angular'});
    // this.meta.updateTag({name: 'date', content: '2018-06-03', scheme: 'YYYY-MM-DD'});
    // this.meta.updateTag({name: 'author', content: 'VXYZ'});
    // this.meta.updateTag({charset: 'UTF-16'}, 'charset= "UTF-8"');
    // this.meta.updateTag({property: 'og:title', content: "My Text2"});
    // this.meta.updateTag({property: 'og:type', content: "website"});
  }

  removeMetaTags() {
    //Using removeTag
    this.meta.removeTag('name = "description"');
    this.meta.removeTag('name= "keywords"');
    this.meta.removeTag('name = "viewport"');
    this.meta.removeTag('name = "robots"');

    //Using removeTagElement
    let author: HTMLMetaElement = this.meta.getTag('name = "author"');
    this.meta.removeTagElement(author);
    let date: HTMLMetaElement = this.meta.getTag('name = "date"');
    this.meta.removeTagElement(date);
    let contentType: HTMLMetaElement = this.meta.getTag('httpEquiv = "Content-Type"');
    this.meta.removeTagElement(contentType);
    let charset: HTMLMetaElement = this.meta.getTag('charset');
    this.meta.removeTagElement(charset);
    let ogTitle: HTMLMetaElement = this.meta.getTag('property = "og:title"');
    this.meta.removeTagElement(ogTitle);
    let ogType: HTMLMetaElement = this.meta.getTag('property = "og:type"');
    this.meta.removeTagElement(ogType);
  }

}
