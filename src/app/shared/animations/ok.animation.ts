import { trigger, state, animate, transition, style, keyframes } from '@angular/animations';

export const okAnimation =
  trigger('okAnimation', [
    state('active', style({opacity: 0})),
    transition('void => active', [
      style({opacity: 0}),
      animate(600, keyframes([
         style({opacity: 1}),
         style({opacity: 0})
      ]))
    ]),
  ])
