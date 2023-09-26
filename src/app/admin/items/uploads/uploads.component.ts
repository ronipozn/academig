import {Component, OnInit} from '@angular/core';

import {SharedService} from '../../../shared/services/shared-service';

@Component({
    selector: 'uploads',
    templateUrl: 'uploads.html'
})
export class ItemsUploadsComponent implements OnInit {
  streamRetrieved: boolean[] = [true, true, true, true];
  csvBuildFlag: boolean = false;

  type: number;
  typeNames: string[] = ["Trends", "Podcasts", "Events", "Apps"];

  files: string[] = [];
  statuses: number[] = [];
  current: number;

  constructor(private sharedService: SharedService) { }

  ngOnInit() {}

  csvOp(mode: number, type: number, flag: boolean, filesEvent) {
    let status: number;

    this.csvBuildFlag = flag;

    if (mode == 0) {
      this.type = type;

    } else if (mode == 2) {
      this.streamRetrieved[this.type] = false;

      this.files = [];
      this.statuses = [];
      this.current = 0;

      const filesCount = filesEvent.substring(filesEvent.lastIndexOf("~") + 1,filesEvent.lastIndexOf("/"));
      // const filesCount = filesEvent[filesEvent.length - 2];

      for (let _i = 0; _i < filesCount; _i++) {
        this.files[_i] = filesEvent + 'nth/' + _i + '/';
      }

      this.files.push('empty');

      this.files.forEach((file, i) => {
        setTimeout(() => {
          if (i<filesCount) {
            this.uploadOp(file, i);
          }
          this.current = i;
        }, i * 1000);
      });

      this.streamRetrieved[this.type] = true;
    }
  }

  async uploadOp(file: string, i: number) {
    const s: number = await this.sharedService.uploadCSV(file, null, null, null, this.type+4);
    this.statuses[i] = s;
  }

}
