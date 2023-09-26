import {Component, Input} from '@angular/core';
import {Subscription} from 'rxjs/Subscription';
import {Router, ActivatedRoute} from '@angular/router';

import {MissionService} from '../../../services/mission-service';
import {ItemService} from '../../../services/item-service';

@Component({
  selector: 'settings-delete',
  templateUrl: 'delete.html'
})
export class DeleteComponent {
  streamDelete = true;

  constructor(public router: Router,
              public activatedRoute: ActivatedRoute,
              public missionService: MissionService,
              private itemService: ItemService) {}

  async deleteFunc() {
    this.streamDelete = false;
    await this.itemService.deleteItem(this.missionService.type+4, this.missionService.id);
    this.streamDelete = true;
    this.router.navigate(['/'], { relativeTo: this.activatedRoute });
  }

}
