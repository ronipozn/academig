import { Injectable, isDevMode } from '@angular/core';
import { environment } from '../../../environments/environment';

import {UserService} from './user-service';

import * as stream from 'getstream';

const APP_TOKEN = 'ejafvxbtfbz6';
const APP_ID = '24870';

@Injectable()
export class StreamService {
  // client: stream.Client;
  client: any;
  userSession: any;
  devFlag: boolean;

  constructor(public userService: UserService) {
    this.devFlag = isDevMode();
  }

  public initializeStream(userSessionToken: string): void {
    // https://github.com/GetStream/stream-js/blob/master/CHANGELOG 4.0.0
    if (this.devFlag==false) { // production
      this.client = stream.connect('3njpb9nj64v7', userSessionToken, '33276');
    } else {
      this.client = stream.connect('64f8ncgpc5vv', userSessionToken, '36378');
    }
  }

  ////////////////////////////
  /////////// Clap ///////////
  ////////////////////////////

  public putClap(activityId: string) {
    this.client.reactions.add("claps", activityId
    ).then(function(data) {
      // console.log('cool')
    })
    .catch(function(reason) {
      console.log('reason',reason.error)
    });
  }

  public deleteClaps(activityId: string) {
    // console.log('activityId',activityId)
    this.client.reactions.delete(activityId
    ).then(function(data) {
      // console.log('cool')
    })
    .catch(function(reason) {
      console.log('reason',reason.error)
    });
  }

  ////////////////////////////
  ////////// Comment /////////
  ////////////////////////////

  public putComment(activityId: string, text: string, pic: string) {
    this.client.reactions.add("comments", activityId,
        {"text": text, "pic": pic}
        // ,["notification:thierry"]
    ).then(function(data) {
      // console.log('cool')
    })
    .catch(function(reason) {
      console.log('reason',reason.error)
    });
  }

}
