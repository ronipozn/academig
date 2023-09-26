import {Component, Input} from '@angular/core';

@Component({
  selector: 'card-brand',
  template: `<img *ngIf="card.brand=='amex'" height="22" src="./assets/img/cards/amex.png">
             <img *ngIf="card.brand=='diners'" height="22" src="./assets/img/cards/diners.png">
             <img *ngIf="card.brand=='discover'" height="22" src="./assets/img/cards/discover.png">
             <img *ngIf="card.brand=='jcb'" height="22" src="./assets/img/cards/jcb.png">
             <img *ngIf="card.brand=='mastercard'" height="22" src="./assets/img/cards/mastercard.png">
             <img *ngIf="card.brand=='unionpay'" height="22" src="./assets/img/cards/union.png">
             <img *ngIf="card.brand=='visa'" height="22" src="./assets/img/cards/visa.png">
             <span *ngIf="!smallFlag">{{card.brand | uppercase}}-{{card.last4}}</span>
             <p *ngIf="smallFlag" class="small">{{card.brand | uppercase}}-{{card.last4}}</p>`
})
export class CardComponent {

  @Input() card: any;
  @Input() smallFlag = true;

  constructor() {}

}
