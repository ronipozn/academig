import {Component, OnInit, Input, Output, EventEmitter} from '@angular/core';
import {Router, ActivatedRoute} from '@angular/router';

@Component({
  selector: 'item-navbar',
  templateUrl: 'navbar.html',
  styleUrls: ['navbar.css']
})
export class NavbarComponent {
  @Input() name: string;
  @Input() link: string;
  @Input() pic: string;

  @Input() type: number;

  @Input() btnEditFlag: boolean;

  @Input() streamFollow: number;
  @Input() followStatus: boolean;
  @Input() compareFlag: boolean;

  @Output() buttonFollowClick: EventEmitter <boolean> = new EventEmitter();
  // @Output() buttonCompareClick: EventEmitter <boolean> = new EventEmitter();

  searchItems: string[] = ['Team', 'Galleries'];
  searchLinks: string[] = ['team', 'galleries'];

  modifiedPath: string;

  typeName = [
    'Trend',
    'Podcast',
    'Event',
    'App',
  ]

  typeIcon = [
    'trending_up',
    'graphic_eq',
    'event',
    'computer',
  ]

  constructor(private _router: Router,
              private activatedRoute: ActivatedRoute) {}

  ngOnInit() {}

  selectChange(value: string) {
    // console.log('value',value)
    this._router.navigate([value], { relativeTo: this.activatedRoute });
  }

  toggleFollowFunc() {
    this.buttonFollowClick.emit();
  }

  // toggleCompareFunc() {
  //   this.buttonCompareClick.emit();
  // }

}
