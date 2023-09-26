import {Component, Input} from '@angular/core';
import {FormGroup, FormControl, FormBuilder} from '@angular/forms';

import {MissionService} from '../../services/mission-service';
import {SettingsService} from '../../../shared/services/settings-service';

@Component({
  selector: 'settings-tools',
  templateUrl: 'tools.html'
})
export class ToolsComponent {
  @Input() seminarsPrivacy: number;
  @Input() kitPrivacy: number;

  streamPrivacy: number[] = [0, 0];
  form: FormGroup;

  constructor(public missionService: MissionService,
              public settingsService: SettingsService,
              private fb: FormBuilder) { }

  ngOnInit() {
    this.form = this.fb.group({
      seminars: new FormControl(this.seminarsPrivacy ? this.seminarsPrivacy.toString() : "0"),
      kit: new FormControl(this.kitPrivacy ? this.kitPrivacy.toString() : "0")
    });
  }

  async privacyOp(type: number) {
    if (this.form.valid) {
      this.streamPrivacy[type] = 3;
      await this.settingsService.postGroupPrivacy(this.missionService.groupId, type+1, (type==0) ? this.form.value.seminars : this.form.value.kit);
      this.streamPrivacy[type] = 1;
    }
  }

}
