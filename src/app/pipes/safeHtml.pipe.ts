import {Pipe, PipeTransform} from '@angular/core';
import {DomSanitizer} from '@angular/platform-browser';

@Pipe({name: 'safeHtml'})
export class SafePipe implements PipeTransform {

  constructor(private sanitizer: DomSanitizer) {}

  transform(value: any) {
    // remove <p> and </p> from value
    // return this.sanitizer.bypassSecurityTrustHtml(value.slice(3, -4));
    return this.sanitizer.bypassSecurityTrustHtml(value);

    // return this.sanitizer.bypassSecurityTrustStyle(style);
    // return this.sanitizer.bypassSecurityTrustXxx(style); - see docs
  }
}
