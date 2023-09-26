import { Directive, ElementRef, Input, HostListener } from "@angular/core";

@Directive({
    selector: "[menuNavClose]"
})
export class CloseMenuDirectiveNav {
    @Input()
    public menu: any;

    constructor(private element: ElementRef) { }

    @HostListener("click")
    private onClick() {
        this.menu.classList.remove("show");
    }
}
