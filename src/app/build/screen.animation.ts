import { trigger, state, animate, transition, style } from '@angular/animations';

export const screenAnimation =
  trigger('screenAnimation', [

    state('void', style({opacity: 0, transform: 'translateY(3%)'})),
    state('notActive', style({opacity: 0, transform: 'translateY(3%)'})),
    state('active', style({opacity: 1, transform: 'translateY(0)'})),

    // transition('active => notActive', [
    //   animate('.5s ease-out')
    // ]),

    transition('notActive => active', [
      animate('.5s ease-in')
    ]),

    transition('void => appear', [
      animate('.5s ease-in')
    ]),

  ])
