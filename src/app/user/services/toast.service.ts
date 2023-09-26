import { Injectable } from '@angular/core';

import {UserService} from './user-service';

declare const $: any;

@Injectable()
export class ToastService {
  client: any;
  userSession: any;
  devFlag: boolean;

  constructor(public userService: UserService) {

  }

  showNotification(from: any, align: any, message: string) {
      // const type = ['', 'info', 'success', 'warning', 'danger', 'rose', 'primary'];
      const type = ['info'];

      const color = Math.floor((Math.random() * 6) + 1);

      $.notify({
          icon: 'notifications',
          // message: 'Welcome to <b>Material Dashboard</b> - a beautiful dashboard for every web developer.'
          message: message
      }, {
          type: type[color],
          timer: 3000,
          placement: {
              from: from,
              align: align
          },
          template: '<div data-notify="container" class="col-xs-11 col-sm-3 alert alert-{0} alert-with-icon" role="alert">' +
            '<button mat-raised-button type="button" aria-hidden="true" class="close" data-notify="dismiss">  <i class="material-icons">close</i></button>' +
            '<i class="material-icons" data-notify="icon">notifications</i> ' +
            '<span data-notify="title">{1}</span> ' +
            '<span data-notify="message">{2}</span>' +
            '<div class="progress" data-notify="progressbar">' +
              '<div class="progress-bar progress-bar-{0}" role="progressbar" aria-valuenow="0" aria-valuemin="0" aria-valuemax="100" style="width: 0%;"></div>' +
            '</div>' +
            '<a href="{3}" target="{4}" data-notify="url"></a>' +
          '</div>'
      });
  }

}
