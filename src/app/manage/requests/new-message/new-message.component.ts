import { Component, Input, Output, EventEmitter } from '@angular/core';

import { MessageService, Message } from '../../../user/services/message.service';
import { UserService } from '../../../user/services/user-service';

declare var uploadcare: any;

@Component({
  selector: 'app-new-message',
  templateUrl: './new-message.component.html',
  styleUrls: ['./new-message.component.scss']
})
export class NewMessageComponent {
  @Output() createMessage: EventEmitter <Message> = new EventEmitter();

  @Input() channelId: string;
  @Input() channelBlock: boolean;

  message: string;
  file: string;

  constructor(private messageService: MessageService,
              private userService: UserService) {
    setTimeout(() => {
      const btn = document.querySelector('.uploadcare--widget__button_type_open');
      btn.innerHTML = '<i class="fa fa-camera"></i>';
      (<HTMLElement>document.querySelector('.uploadcare--widget__text')).style.display = 'none';
      (<HTMLElement>document.querySelector('.uploadcare--widget__button_type_cancel')).style.display = 'none';
      (<HTMLElement>document.querySelector('.uploadcare--widget__button_type_open')).style.background = '#24a2b7';
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
    const wfile = widget.value();

    widget.onChange(function(value) {
      if (value) {
        value.promise().done(function(info) {
          that.newFile(info.cdnUrl)
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
