import {Component, Input} from '@angular/core';
// import {ActivatedRoute} from '@angular/router';

@Component({
  selector: 'info-pricing',
  templateUrl: 'pricing.html',
  styleUrls: ['pricing.css']
})
export class InfoPricingComponent {
  source: number = 0;
  mode: number = 0;

  constructor() { }
  // constructor(private route: ActivatedRoute) { }

  ngOnInit() {
    this.mode = 0;
    this.source = 2;
    // this.route.fragment.subscribe((fragment: string) => {
    //   this.source = 0;
    //   if (fragment=="researchers") {
    //     this.mode = 0;
    //     this.source = 2;
    //   } else if (fragment=="labs") {
    //     this.mode = 1;
    //     this.source = 2;
    //   } else if (fragment=="companies") {
    //     this.mode = 2;
    //     this.source = 2;
    //   } else if (fragment=="departments") {
    //     this.mode = 3;
    //     this.source = 2;
    //   }
    // })
  }

}
