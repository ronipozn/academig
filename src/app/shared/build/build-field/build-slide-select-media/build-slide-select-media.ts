import {Component, Input, OnInit} from '@angular/core';
import {FormGroup, FormControl, FormArray} from '@angular/forms';

import {objectMini} from '../../../services/shared-service';
import {MediaService} from '../../../services/media-service';

@Component({
  selector: 'build-slide-select-media',
  templateUrl: 'build-slide-select-media.html'
})
export class BuildSlideSelectMediaComponent implements OnInit {
  @Input() groupId: string;
  // @Input() title: string;
  @Input() type: number;
  @Input() itemSmall: boolean;

  @Input() parentGroup: FormGroup;
  @Input() controlName: string;

  mediaMinis: objectMini[] = [];
  picHover: string = null;
  // mediaNames: string[];
  streamRetrieved: boolean;

  constructor(private mediaService: MediaService) {}

  picHoverFunc(i: number): void {
    this.picHover = (i == -1) ? null : '(' + this.mediaMinis[i].name + ')'
  }


  ngOnInit() {
    this.streamRetrieved = false;

    this.parentGroup.addControl(this.controlName,
      new FormArray([
        new FormControl()
      ]),
    );

    this.mediaFunc()
  }

  async mediaFunc() {
    this.mediaMinis = await this.mediaService.getMedia(2, this.groupId, this.type, 1);

    this.streamRetrieved = true;

    const mediaForm = this.parentGroup.get(this.controlName) as FormArray;

    for (let _j = 0; _j < this.mediaMinis.length; _j++) {
      if (_j > 0) { mediaForm.push(new FormControl()); }
    }
  }

}
