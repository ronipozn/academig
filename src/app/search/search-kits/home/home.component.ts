import {Component, OnInit, Input, ViewChild, ElementRef} from '@angular/core';
import {Title} from '@angular/platform-browser';

import {MatPaginator} from '@angular/material/paginator';
import {Sort, MatSortable, MatSort} from '@angular/material/sort';
import {MatTableDataSource} from '@angular/material/table';

import {PeopleService} from '../../../shared/services/people-service';

// import { MetaService } from '../shared/services/meta-service';

export interface KitData {
  lab: string;
  university: string;
  discipline: string;
  topics: string;
  beginners: string;
  intermediate: string;
  advanced: string;
}

@Component({
  selector: 'home',
  templateUrl: 'home.html',
  styleUrls: ['home.css']
})
export class HomeComponent implements OnInit {
  streamRetrieved: boolean;

  kits: any[];

  displayedColumns: string[] = ['link', 'lab', 'country', 'university', 'discipline', 'topics', 'beginners', 'intermediate', 'advanced'];
  dataSource: MatTableDataSource<KitData>;

  @ViewChild(MatPaginator, {static: true}) paginator: MatPaginator;
  @ViewChild(MatSort, {static: true}) sort: MatSort;

  constructor(private titleService: Title,
              private peopleService: PeopleService,
              // private metaService: MetaService,
             ) {
      this.titleService.setTitle('Academic Papers Kits | Academig');
      // this.metaService.addMetaTags('Academig', 'academia, resarch labs, phd, msc, post-doc, departments, universities', null);
  }

  async ngOnInit() {
    this.kits = await this.peopleService.getPapersKits();

    const dataKits = this.kits.map(
      u => ({
        // pic: u.pic,
        lab: u.groupIndex.group.name,
        labLink: u.groupIndex.group.link,
        university: u.groupIndex.university.name,
        universityLink: u.groupIndex.university.link,
        discipline: u.groupIndex.department.name,
        disciplineLink: u.groupIndex.department.link,
        country: u.country,
        topics: u.topics,
        beginners: u.beginners,
        intermediate: u.intermediate,
        advanced: u.advanced
      })
    )

    this.dataSource = new MatTableDataSource(dataKits);
    this.dataSource.paginator = this.paginator;
    this.dataSource.sort = this.sort;

    this.streamRetrieved = true;
  }

  sortData(sort: Sort) {
    var featured;

    const data = this.kits.slice();
    if (!sort.active || sort.direction === '') {
      featured = data;
      return;
    }

    featured = data.sort((a, b) => {
      const isAsc = sort.direction === 'asc';
      switch (sort.active) {
        case 'lab': return compare(a.lab, b.lab, isAsc);
        case 'country': return compare(a.country, b.country, isAsc);
        case 'university': return compare(a.university, b.university, isAsc);
        case 'discipline': return compare(a.discipline, b.discipline, isAsc);
        case 'beginners': return compare(a.beginners, b.beginners, isAsc);
        case 'intermediate': return compare(a.intermediate, b.intermediate, isAsc);
        case 'advanced': return compare(a.advanced, b.advanced, isAsc);
        // case 'rankTimes': return compare((a.rank || {}).times, (b.rank || {}).times, isAsc);
        default: return 0;
      }
    });

    const dataKits = featured.map(
      u => ({
        lab: u.groupIndex.group.name,
        labLink: u.groupIndex.group.link,
        university: u.groupIndex.university.name,
        universityLink: u.groupIndex.university.link,
        discipline: u.groupIndex.department.name,
        disciplineLink: u.groupIndex.department.link,
        country: u.country,
        topics: u.topics,
        beginners: u.beginners,
        intermediate: u.intermediate,
        advanced: u.advanced
      })
    )

    this.dataSource = new MatTableDataSource(dataKits);
    // this.dataSource.paginator = this.paginator;
    // this.sort.sort(({ id: sort.active, start: sort.direction}) as MatSortable);
    this.dataSource.sort = this.sort;
  }

  applyFilter(event: Event) {
    const filterValue = (event.target as HTMLInputElement).value;
    this.dataSource.filter = filterValue.trim().toLowerCase();

    if (this.dataSource.paginator) {
      this.dataSource.paginator.firstPage();
    }
  }

}

function compare(a: number | string, b: number | string, isAsc: boolean) {
  if (a==null || a==0) return 1 * (isAsc ? 1 : -1);
  if (b==null || b==0) return -1 * (isAsc ? 1 : -1);
  return (a < b ? -1 : 1) * (isAsc ? 1 : -1);
}
