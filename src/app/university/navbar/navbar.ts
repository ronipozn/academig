import {Component, OnInit, Input} from '@angular/core';
import {Router, ActivatedRoute} from '@angular/router';

import {MissionService} from '../services/mission-service';

@Component({
  selector: 'university-navbar',
  templateUrl: 'navbar.html',
  styleUrls: ['navbar.css']
})
export class NavbarComponent {
  @Input() name: string;
  @Input() link: string;
  @Input() pic: string;

  @Input() authFlag: boolean;

  @Input() activePath: string;

  searchItems: string[] = ['Departments', 'People', 'Publications', 'Services', 'Projects', 'Teaching', 'Jobs',  'Media', 'Galleries'];
  searchLinks: string[] = ['departments', 'people', 'publications', 'services', 'projects', 'teaching', 'jobs',  'media', 'galleries'];
s
  searchText: string;
  searchType = 0;

  modifiedPath: string;

  constructor(public missionService: MissionService,
              private _router: Router,
              private activatedRoute: ActivatedRoute) {}

  ngOnInit() {
    this.searchType = this.missionService.searchType;
    if (this.activePath) {
      this.modifiedPath = this.activePath;
    } else {
      this.modifiedPath = '.';
    }
  }

  onSearchType(selectValue: number) {
    this.searchType = selectValue;
    this.missionService.searchType = selectValue;
  }

  onSearch() {
    this.missionService.searchFlag = true;
    this.missionService.searchText = this.searchText;
    this._router.navigate([this.searchLinks[this.searchType]], { relativeTo: this.activatedRoute });
  }

  routeLinks(i: number) {
    this.missionService.searchFlag = false;
    // this._router.navigate([this.searchLinks[i]], { relativeTo: this.activatedRoute });
  }

  selectChange(value: string) {
    // console.log('value',value)
    this._router.navigate([value], { relativeTo: this.activatedRoute });
  }

}
