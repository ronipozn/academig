import {Component, Input, OnInit} from '@angular/core';
import {Position, People, titlesTypes} from '../../services/people-service';

@Component({
  selector: 'people-item-cloud',
  templateUrl: 'people-item-cloud.html',
  styleUrls: ['people-item-cloud.css'],
})
export class PeopleItemCloudComponent implements OnInit {
  @Input() people: People;

  titlesSelect = titlesTypes;

  description: string = "";

  ngOnInit() {
    for (const position of this.people.positions) {
      this.description += this.titlesSelect[position.titles[0]] + ' at ' + position.group.group.name + '. '
    }
  }
}
