import {Directive, ElementRef, AfterViewInit, Input} from '@angular/core';

@Directive({
  selector: '[itemAutofocus]'
})
export class AutofocusDirective implements AfterViewInit {

  @Input('itemAutofocus') itemFocus: boolean;

  constructor(private el: ElementRef) { }

  // @Input() newItem: boolean;

  ngAfterViewInit() {
    // console.log('AutoFocus',this.itemFocus)
    if (this.itemFocus) {
      this.el.nativeElement.scrollIntoView();
      window.scrollBy(0, -400);
    }
  }
}

// import { Directive, OnInit, ElementRef } from '@angular/core';
//
// @Directive({
//   selector: '[itemAutofocus]'
// })
// export class AutofocusDirective implements OnInit {
//
//   constructor(private elementRef: ElementRef) { };
//
//   ngOnInit(): void {
//     this.elementRef.nativeElement.focus();
//   }
//
// }
