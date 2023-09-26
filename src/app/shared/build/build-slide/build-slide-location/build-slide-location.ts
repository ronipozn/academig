import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { FormGroup, FormControl, FormArray, Validators } from '@angular/forms';

import { slideInOutAnimation } from '../../../animations/index';
import {Countries, SharedService} from '../../../services/shared-service';

export function determineId(id: any): string {
  if (id.constructor.name === 'array' && id.length > 0) {
    return '' + id[0];
  }
  return '' + id;
}

@Component({
    selector: 'build-slide-location',
    templateUrl: 'build-slide-location.html',
    animations: [slideInOutAnimation],
    host: { '[@slideInOutAnimation]': '' },
    styleUrls: ['build-slide-location.css']
})

export class BuildSlideLocationComponent implements OnInit {
  @Input() lat: string;
  @Input() lng: string;
  @Input() country_id: number;
  @Input() state: string;
  @Input() city: string;
  @Input() name: string;

  @Output() cancel: EventEmitter <boolean> = new EventEmitter(true);
  @Output() update: EventEmitter <any> = new EventEmitter(true);

  formModel: FormGroup;
  submitStatus: boolean = false;
  disableFlag: boolean = false;
  streamRetrieved: boolean = false;

  countries = Countries;

  query: any;

  constructor(private sharedService: SharedService) {
    this.formModel = new FormGroup({
      lat: new FormControl('', Validators.required),
      lng: new FormControl('', Validators.required),
      country_id: new FormControl('', Validators.required),
      state: new FormControl(''),
      city: new FormControl('', Validators.required),
    });
  }

  ngOnInit() {
    this.formModel.controls['lat'].setValue(this.lat ? this.lat : '');
    this.formModel.controls['lng'].setValue(this.lng ? this.lng : '');
    this.formModel.controls['country_id'].setValue(this.country_id ? this.country_id : '');
    this.formModel.controls['state'].setValue(this.state ? this.state : '');
    this.formModel.controls['city'].setValue(this.city ? this.city : '');
  }

  compareIds(id1: any, id2: any): boolean {
    const a1 = determineId(id1);
    const a2 = determineId(id2);
    return a1 === a2;
  }

  async coordGenerate() {
    this.streamRetrieved = false;
    const query = await this.sharedService.queryCoordinates(this.name);
    this.query = query.map(r=>({ "lat": r.lat, "lon": r.lon, "university": r.display_name, "type": r.type }));
    this.streamRetrieved = true;
  }

  onSubmit() {
    if (this.formModel.valid) {
      this.disableFlag = true;
      this.update.emit(this.formModel.value);
    } else {
      this.submitStatus = !this.submitStatus;
    }
  }

  onCancel() {
    this.cancel.emit(false);
  }

}
