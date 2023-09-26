import {Component, OnInit, Input, ViewChild, ElementRef} from '@angular/core';
import {Title} from '@angular/platform-browser';

import {MatPaginator} from '@angular/material/paginator';
import {Sort, MatSortable, MatSort} from '@angular/material/sort';
import {MatTableDataSource} from '@angular/material/table';

import {PeopleService} from '../../shared/services/people-service';

import {environment} from '../../../environments/environment';
// import { MetaService } from '../shared/services/meta-service';

export interface FeaturedData {
  name: string;
  params: string;
  type: string;
  entries: number;
}

export interface TypesdData {
  label: string;
  icon: string;
}

@Component({
  selector: 'home',
  templateUrl: 'home.html',
  styleUrls: ['home.css']
})
export class HomeComponent implements OnInit {
  streamRetrieved: boolean;

  featured: FeaturedData[] = [];

  // , 'save'
  displayedColumns: string[] = ['name', 'type', 'entries'];
  dataSource: MatTableDataSource<FeaturedData>;

  typesData: TypesdData[] = [
    { label: 'Institutes', icon: 'account_balance' },
    { label: 'Labs', icon: 'supervised_user_circle'},
    { label: 'Companies', icon: 'business' },
    { label: 'Researchers', icon: 'face' },
    { label: 'Trends', icon: 'trending_up' },
    { label: 'Podcasts', icon: 'graphic_eq' },
    { label: 'Events', icon: 'event' },
    { label: 'Apps', icon: 'computer' },
    { label: 'Quotes', icon: 'format_quote' },
    { label: 'Papers Kits', icon: 'bookmark' }
  ];

  @ViewChild(MatPaginator, {static: true}) paginator: MatPaginator;
  @ViewChild(MatSort, {static: true}) sort: MatSort;

  constructor(private titleService: Title,
              private peopleService: PeopleService,
              // private metaService: MetaService,
             ) {
      this.titleService.setTitle('Featured Searches | Academig');
      // this.metaService.addMetaTags('Academig', 'academia, resarch labs, phd, msc, post-doc, departments, universities', null);
  }

  async ngOnInit() {
    this.featured = await this.peopleService.getFeatured();

    const dataFeatured = this.featured.filter(r=>r.name!=null).map(
      u => ({
        name: u.name,
        params: u.params,
        type: u.type,
        icon: this.typesData.filter(t => t.label==u.type)[0].icon,
        entries: u.entries,
      })
    )

    this.dataSource = new MatTableDataSource(dataFeatured);
    this.dataSource.paginator = this.paginator;
    this.dataSource.sort = this.sort;

    this.streamRetrieved = true;
  }

  sortData(sort: Sort) {
    var featured: FeaturedData[];

    const data = this.featured.slice();
    if (!sort.active || sort.direction === '') {
      featured = data;
      return;
    }

    featured = data.sort((a, b) => {
      const isAsc = sort.direction === 'asc';
      switch (sort.active) {
        case 'name': return compare(a.name, b.name, isAsc);
        case 'type': return compare(a.type, b.type, isAsc);
        case 'entries': return compare(a.entries, b.entries, isAsc);
        // case 'rankTimes': return compare((a.rank || {}).times, (b.rank || {}).times, isAsc);
        default: return 0;
      }
    });

    const dataFeatured = featured.filter(r=>r.name!=null).map(
      u => ({
        name: u.name,
        params: u.params,
        type: u.type,
        icon: this.typesData.filter(t => t.label==u.type)[0].icon,
        entries: u.entries,
      })
    )

    this.dataSource = new MatTableDataSource(dataFeatured);
    // this.dataSource.paginator = this.paginator;
    // this.sort.sort(({ id: sort.active, start: sort.direction}) as MatSortable);
    this.dataSource.sort = this.sort;
  }

}

function compare(a: number | string, b: number | string, isAsc: boolean) {
  if (a==null || a==0) return 1 * (isAsc ? 1 : -1);
  if (b==null || b==0) return -1 * (isAsc ? 1 : -1);
  return (a < b ? -1 : 1) * (isAsc ? 1 : -1);
}

// {
//   "name": "Stem cells research labs established in the last year",
//   "params": {'country': 'Israel', 'disciplines': 'Chemistry'},
//   "entries": 32
// },
// {
//   "name": "Small resarch labs (1-5 people) with Nature publication in the last 3 years",
//   "params": {'country': 'Israel', 'disciplines': 'Chemistry'},
//   "entries": 105
// },
// {
//   "name": "Chemistry research labs from Israel",
//   "params": {'country': 'Israel', 'disciplines': 'Chemistry'},
//   "type": "Labs",
//   "entries": 32
// },
// {
//   "name": "Small resarch labs (6-10 people) in life sciences world wide",
//   "params": {'size': '1', 'disciplines': 'Life Sciences'},
//   "type": "Labs",
//   "entries": 64
// }
