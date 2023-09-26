import { Component, Input, Output, EventEmitter } from '@angular/core';

import { MessageService, Message } from '../../../user/services/message.service';
import { UserService } from '../../../user/services/user-service';

declare var uploadcare: any;

@Component({
  selector: 'chat-new-message',
  templateUrl: './chat-new-message.component.html',
  styleUrls: ['./chat-new-message.component.scss']
})
export class ChatNewMessageComponent {
  @Output() createMessage: EventEmitter <Message> = new EventEmitter();

  @Input() channelId: string;

  message: string;
  file: string;

  constructor(private messageService: MessageService,
              private userService: UserService) {
    setTimeout(() => {
      const btn = document.querySelector('.uploadcare--widget__button_type_open');
      btn.innerHTML = '<i class="fa fa-camera"></i>';
      (<HTMLElement>document.querySelector('.uploadcare--widget__text')).style.display = 'none';
      (<HTMLElement>document.querySelector('.uploadcare--widget__button_type_cancel')).style.display = 'none';
      (<HTMLElement>document.querySelector('.uploadcare--widget__button_type_open')).style.background = '#01A4ED';
      // document.querySelector('.uploadcare--widget__text').style.display = 'none';
      // document.querySelector('.uploadcare--widget__button_type_cancel').style.display = 'none';
    }, 100);
  }

  newFile(file: string): void {
    this.messageService.send({_id: null,
                              type: 1,
                              userId: this.userService.userId,
                              text: '',
                              file: file,
                              date: new Date()});

    this.createMessage.emit({_id: null,
                         type: 1,
                         userId: this.userService.userId,
                         text: '',
                         file: file,
                         date: new Date()});
  }

  newMessage(text: string): void {
    if (text) {

      this.messageService.send({_id: null,
                                type: 0,
                                userId: this.userService.userId,
                                text: text,
                                file: '',
                                date: new Date()});

      this.createMessage.emit({_id: null,
                               type: 0,
                               userId: this.userService.userId,
                               text: text,
                               file: '',
                               date: new Date()});

      this.message = '';
    }
  }

  ngAfterViewInit() {
    const that = this;
    const widget = uploadcare.Widget('#file');

    widget.onChange(function(value) {
      if (value) {
        value.promise().done(function(info) {
          that.newFile(info.cdnUrl)
          widget.value(null);
        });
      } else {
        that.file = '';
      }
    });

    widget.onUploadComplete(() => {
      widget.value(null);
    });
  }

}
