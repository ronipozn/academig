import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';

import { slideInOutAnimation } from '../../../shared/animations/index';

@Component({
    selector: 'calendar-build',
    templateUrl: 'calendar-build.html',
    animations: [slideInOutAnimation],
    host: { '[@slideInOutAnimation]': '' },
    styleUrls: ['calendar-build.css']
})

export class PrivateCalendarBuildComponent implements OnInit {
  @Input() groupId: string;
  @Output() save: EventEmitter <boolean> = new EventEmitter(true);

  constructor(
      private route: ActivatedRoute,
      private router: Router,
      // private productService: ProductService,
      // private pubSubService: PubSubService
    ) { }

  ngOnInit() {}

  saveButton() {
    this.save.emit(false);
      // save product
      // this.productService.save(this.product);

      // redirect to users view
      // this.router.navigate(['products']);

      // publish event so list controller can refresh
      // this.pubSubService.publish('products-updated');
  }

}
