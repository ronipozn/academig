import {Component, Input} from '@angular/core';
import {Relation} from '../../../services/group-service';
import {titlesTypes} from '../../../services/people-service';

@Component({
  selector: 'relation-info',
  templateUrl: 'relation-info.html'
})
export class RelationInfoComponent {
  @Input() relation: Relation;
  @Input() stage: number;

  titlesSelect = titlesTypes;

}
