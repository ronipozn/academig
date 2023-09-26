import {Component, Input, OnInit} from '@angular/core';

import {FormGroup, FormControl, Validators} from '@angular/forms';

import {UserService} from '../../user/services/user-service';
import {SettingsService} from '../../shared/services/settings-service';
import {Folder} from '../../shared/services/publication-service';
import {objectMini} from '../../shared/services/shared-service';

@Component({
  selector: 'settings-library',
  templateUrl: 'library.html',
  styleUrls: ['library.css']
})
export class LibraryComponent {
  streamPrivacy: number = 0;

  formModel: FormGroup;

  libraryPrivacy: string[] = ['Public', 'Private'];

  userRead: number = 0;

  constructor(public userService: UserService,
              public settingsService: SettingsService) {
    if (this.userService.userFolders) {
      const userFolder: Folder = this.userService.userFolders.find(r=>r.folder=="read");
      this.userRead = userFolder ? userFolder.count : 0;
    } else {
      this.userRead = 0;
    }
    this.formModel = new FormGroup({
      privacy: new FormControl(0, Validators.required)
    });
  }

  animationDone() {
    this.streamPrivacy = 0;
  }

  async onSubmit() {
    if (this.formModel.valid) {
      this.streamPrivacy = 3;
      await this.settingsService.postLibraryPrivacy(this.formModel.value.privacy);
      this.streamPrivacy = 1;
    }
  }

}
