import { trigger, state, animate, transition, style } from '@angular/animations';

export const itemsAnimation =
  trigger('itemsAnimation', [

    state('active', style({opacity: 1})),

    transition('void => active', [
      style({opacity: 0}),
      animate('400ms ease-in')
    ])
  ])

  // state('void', style({transform: 'translateX(-100%) scale(0)'})),
  // state('new',style({transform: 'translateX(0) scale(1) opacity: 1'})),
  // state('active', style({opacity: 1, transform: 'scale(1)'})),
  // transition('void => new', [
  //   style({transform: 'scale(0.8)'}),
  //   animate('1000ms ease-in')
  // ]),
  // transition('* => void', [
  //   animate(600, keyframes([
  //      style({opacity: 1}),
  //      style({opacity: 0})
  //   ]))
  // ]),
  // transition('* => void', [
  //   animate(200, style({transform: 'translateX(0) scale(0)'}))
  // ])

  // state('new', style({opacity: 1, transform: 'scale(1)'})),
  // transition('void => new', [
  //   style({opacity: 0, transform: 'scale(0)'}),
  //   animate('200ms ease-in')
  // ]),
