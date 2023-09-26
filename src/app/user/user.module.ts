import { NgModule, ModuleWithProviders } from '@angular/core';

import { UserService } from './services/user-service';
import { ActionsService } from './services/actions.service';
import { MessageService, MessagesSortService } from './services/message.service';
import { PusherService } from './services/pusher.service';
import { StreamService } from './services/stream.service';
import { ToastService } from './services/toast.service';

@NgModule({})
export class UserModule {
  static forRoot(): ModuleWithProviders { // STATIC
    return {
      ngModule: UserModule,
      providers: [UserService,
                  ActionsService,
                  MessageService,
                  PusherService,
                  StreamService,
                  ToastService,
                  MessagesSortService
                 ]
    };
  }
}
