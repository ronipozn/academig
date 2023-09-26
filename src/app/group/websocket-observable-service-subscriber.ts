// import { platformBrowserDynamic } from '@angular/platform-browser-dynamic';
// import { NgModule, Component }      from '@angular/core';
// import { BrowserModule } from '@angular/platform-browser';
//
// import {WebSocketService} from "../shared/services/websocket-observable-service";
//
// @Component({
//   selector: 'roni',
//   providers: [ WebSocketService ],
//   template: ` {{messageFromServer}}<br>
//        <button class="btn btn-sm "(click)="sendMessageToServer()">Send msg to Server</button>
//   `})
// export class WebSocketComponent {
//
//   messageFromServer: string;
//
//   constructor(private wsService: WebSocketService) {
//
//       this.wsService.createObservableSocket("ws://localhost:8085")
//         .subscribe(
//             data => {
//               this.messageFromServer = data;
//             },
//             err => console.log( err),
//             () =>  console.log( 'The observable stream is complete')
//         );
//   }
//
//     sendMessageToServer(){
//         console.log("Sending message to WebSocket server");
//
//         this.wsService.sendMessage("Hello from client");
//     }
// }
