import { Directive, ElementRef, Input, HostListener } from "@angular/core";

@Directive({
    selector: "[menuClose]"
})
export class CloseMenuDirective {
    @Input()
    public menu: any;

    constructor(private element: ElementRef) { }

    @HostListener("click")
    private onClick() {
        this.menu.classList.remove("show");
    }
}
