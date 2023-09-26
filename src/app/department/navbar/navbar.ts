import {Component, OnInit, Input} from '@angular/core';
import {Router, ActivatedRoute} from '@angular/router';

import {MissionService} from '../services/mission-service';

import {departmentComplex} from '../../shared/services/department-service';

@Component({
  selector: 'department-navbar',
  templateUrl: 'navbar.html',
  styleUrls: ['navbar.css']
})
export class NavbarComponent {
  @Input() departmentIndex: departmentComplex;
  @Input() departmentType: number;
  @Input() departmentStage: number;

  @Input() authFlag: boolean;

  @Input() activePath: string;

  searchItems: string[] = ['Labs', 'People', 'Publications', 'Services', 'Projects', 'Teaching', 'Jobs', 'Media', 'Galleries'];
  searchLinks: string[] = ['labs', 'people', 'publications', 'services', 'projects', 'teaching', 'jobs', 'media', 'galleries'];
  // searchIcons: string[] = ['supervised_user_circle', 'face',   'library_books', 'ballot',   'build',    'create',   'assignment', 'local_movies', 'photo_album'];

  searchText: string;
  searchType = 2;

  modifiedPath: string;

  typeNames = ['DEPARTMENT', 'PROGRAM', 'CENTER']

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
