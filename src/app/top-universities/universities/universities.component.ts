import {Component, OnInit, ViewChild, ElementRef} from '@angular/core';
import {Title} from '@angular/platform-browser';
import {Router, UrlTree, UrlSegmentGroup, UrlSegment, PRIMARY_OUTLET} from '@angular/router';

import {MatPaginator} from '@angular/material/paginator';
import {Sort, MatSortable, MatSort} from '@angular/material/sort';
import {MatTableDataSource} from '@angular/material/table';

import {UniversityService} from '../../shared/services/university-service';
import {Countries} from '../../shared/services/shared-service';

import {UserService} from '../../user/services/user-service';

import {itemsAnimation} from '../../shared/animations/index';

export interface UniversityData {
  pic: string;
  name: string;
  link: string;
  country: number;
  state: number;
  city: number;
  rankTimes: number;
  rankTop: number;
  rankShanghai: number;
  rankUsNews: number;
  rankFacebook: number;
  rankTwitter: number;
  rankLinkedin: number;
  rankInstagram: number;
  rankYoutube: number;
}

@Component({
  selector: 'universities',
  templateUrl: 'universities.html',
  styleUrls: ['universities.css'],
  animations: [itemsAnimation],
  host: { '[@itemsAnimation]': '' }
})
export class UniversitiesComponent {
  universities: any[];
  sortedUniversities: any[];

  streamRetrieved: boolean;

  countries = Countries;

  mode: number;
  code: number;

  item: string = null;
  state: string = null;
  city: string = null;

  states: string[] = [];
  cities: string[] = [];

  type: number;
  // params: any;
  // name: string;

  visibleColumns: boolean[] = [true, true, true,true, true, true, true, true, true, true];
  nameColumns: string[] = ['', '', 'Location', 'Establish Year', 'Control Type', 'Entity Type', 'Times Higher Education Ranking', 'TopUniversities Ranking', 'ARWU Ranking', 'U.S. News & World Report Ranking','Facebook','Twitter','Linkedin','Instagram','Youtube'];
  displayedColumns: string[] = ['flag', 'name', 'location', 'establish', 'control', 'entity', 'rankTimes', 'rankTop', 'rankShanghai', 'rankUsNews','rankFacebook','rankTwitter','rankLinkedin','rankInstagram','rankYoutube'];
  dataSource: MatTableDataSource<UniversityData>;

  // @ViewChild(MatPaginator, {static: false})
  // set paginator(value: MatPaginator) {
  //   this.dataSource.paginator = value;
  // }
  //
  // @ViewChild(MatSort, {static: false})
  // set sort(value: MatSort) {
  //   this.dataSource.sort = value;
  // }

  // https://stackoverflow.com/questions/48785965/angular-matpaginator-not-working
  @ViewChild(MatPaginator, {static: true}) paginator: MatPaginator;
  @ViewChild(MatSort, {static: true}) sort: MatSort;

  @ViewChild('toggleColumnsModal', { static: true }) toggleColumns: ElementRef;

  constructor(private titleService: Title,
              private universityService: UniversityService,
              private _router: Router,
              public userService: UserService) {
  }

  initCap(s) {
    var result = '';
    if ((typeof (s) === 'undefined') || (s == null)) {
      return result;
    }
    s = s.toLowerCase();
    var words = s.split(' ');
    for (var i = 0; i < words.length; ++i) {
      result += (i > 0 ? ' ' : '') +
        words[i].substring(0, 1).toUpperCase() +
        words[i].substring(1);
    }
    return result;
  }

  ngOnInit() {
    const tree: UrlTree = this._router.parseUrl(this._router.routerState.snapshot.url);
    const g: UrlSegmentGroup = tree.root.children[PRIMARY_OUTLET];
    const s: UrlSegment[] = g.segments;

    if (s[s.length-1].path=='countries') {

      this.titleService.setTitle('Universities by Country | Academig');
      this.type = 1;
      this.streamRetrieved = true;

    } else if (s.length>1) {

      // this.params = {'country': country, 'state': state, "city": city};
      this.item = this.initCap(s[1].path.replace(/_/g, ' '));
      if (s.length==3) this.state = this.initCap(s[2].path.replace(/_/g, ' '));
      if (s.length==4) {
        this.state = (s[2].path=='all') ? null : this.initCap(s[2].path.replace(/_/g, ' '));
        this.city = this.initCap(s[3].path.replace(/_/g, ' '));
      }
      this.type = 0;
      this.mode = 4;
      const countryObj = this.countries[this.countries.findIndex(y => y.name == this.item)];
      this.code = countryObj ? Number(countryObj.id) : null;
      this.titleService.setTitle(this.item + (this.state ? (' '+this.state) : '') + (this.city ? (' '+this.city) : '') + ' Universities | Academig');
      this.updateList();

    } else {

      this.type = 2;
      this.titleService.setTitle('Top Universities | Academig');

      switch (s[s.length-1].path) {

        case "top-universities": this.mode = 2; this.code=null; this.item="World Wide"; break;

        case "top-universities-north-america": this.mode = 3; this.code=0; this.item="North America"; break;
        case "top-universities-south-america": this.mode = 3; this.code=1; this.item="South America"; break;
        case "top-universities-europe": this.mode = 3; this.code=2; this.item="Europe"; break;
        case "top-universities-africa": this.mode = 3; this.code=3; this.item="Africa"; break;
        case "top-universities-asia": this.mode = 3; this.code=4; this.item="Asia"; break;
        case "top-universities-oceania": this.mode = 3; this.code=5; this.item="Oceania"; break;

        case "top-universities-united-states": this.mode = 4; this.code=840; this.item="United States"; break;
        case "top-universities-united-kingdom": this.mode = 4; this.code=826; this.item="United Kingdom"; break;
        case "top-universities-canada": this.mode = 4; this.code=124; this.item="Canada"; break;
        case "top-universities-australia": this.mode = 4; this.code=36; this.item="Australia"; break;
        case "top-universities-ireland": this.mode = 4; this.code=372; this.item="Ireland"; break;
        case "top-universities-germany": this.mode = 4; this.code=276; this.item="Germany"; break;
        case "top-universities-france": this.mode = 4; this.code=250; this.item="France"; break;
        case "top-universities-india": this.mode = 4; this.code=356; this.item="India"; break;
        case "top-universities-china": this.mode = 4; this.code=156; this.item="China"; break;
        case "top-universities-japan": this.mode = 4; this.code=392; this.item="Japan"; break;

        // case "top-english-speaking-universities": this.mode = 2; this.code=0; this.item="English"; break;
        // case "top-arabic-speaking-universities": this.mode = 2; this.code=1; this.item="Arabic"; break;
        // case "top-spanish-speaking-universities": this.mode = 2; this.code=2; this.item="Spanish"; break;

        case "top-universities-facebook": this.mode = 5; this.code=0; this.item="Facebook"; break;
        case "top-universities-twitter": this.mode = 6; this.code=1; this.item="Twitter"; break;
        case "top-universities-linkedin": this.mode = 7; this.code=2; this.item="Linkedin"; break;
        case "top-universities-instagram": this.mode = 8; this.code=3; this.item="Instagram"; break;
        case "top-universities-youtube": this.mode = 9; this.code=4; this.item="Youtube"; break;
      };

      this.updateList();

    }
  }

  async updateList() {
    this.streamRetrieved = false;

    this.universities = await this.universityService.getUniversities('', this.code, this.state ? this.state.replace(/ /g, '_') : '', this.city ? this.city.replace(/ /g, '_') : '', this.mode);

    const dataUniversities = this.universities.map(
      u => ({
        pic: u.pic,
        name: u.name,
        link: u.link,
        country: u.country,
        state: u.state,
        city: u.city,
        establish: u.establish,
        rankTimes: (u.rank && u.rank.times) ? u.rank.times : '-',
        rankTop: (u.rank && u.rank.top) ? u.rank.top : '-',
        rankShanghai: (u.rank && u.rank.shanghai) ? u.rank.shanghai : '-',
        rankUsNews: (u.rank && u.rank.usnews) ? u.rank.usnews : '-',
        rankFacebook: (u.rank && u.rank.facebook) ? u.rank.facebook : '-',
        rankTwitter: (u.rank && u.rank.twitter) ? u.rank.twitter : '-',
        rankLinkedin: (u.rank && u.rank.linkedin) ? u.rank.linkedin : '-',
        rankInstagram: (u.rank && u.rank.instagram) ? u.rank.instagram : '-',
        rankYoutube: (u.rank && u.rank.youtube) ? u.rank.youtube : '-',
      })
    )

    this.dataSource = new MatTableDataSource(dataUniversities);
    this.dataSource.paginator = this.paginator;
    // this.sort.sort(({ id: 'rankTimes', start: 'asc'}) as MatSortable);
    this.dataSource.sort = this.sort;

    if (this.type==0 && this.city==null) {
      if (this.state) { // cities list
        const dataCities: string[] = this.universities.map(u => u.city);
        this.cities = [...new Set(dataCities)];
      } else { // states / regions list
        const dataStates: string[] = this.universities.map(u => u.state).filter(u => (u!=undefined && u!=null));
        this.states = [...new Set(dataStates)];
      }
    }

    this.streamRetrieved = true;
  }

  applyFilter(event: Event) {
    const filterValue = (event.target as HTMLInputElement).value;
    this.dataSource.filter = filterValue.trim().toLowerCase();

    if (this.dataSource.paginator) {
      this.dataSource.paginator.firstPage();
    }
  }

  sortData(sort: Sort) {
    // console.log('sort',sort)
    const data = this.universities.slice();
    if (!sort.active || sort.direction === '') {
      this.sortedUniversities = data;
      return;
    }

    this.sortedUniversities = data.sort((a, b) => {
      const isAsc = sort.direction === 'asc';
      switch (sort.active) {
        case 'name': return compare(a.name, b.name, isAsc);
        case 'location': return compare(a.country, b.country, isAsc);
        case 'rankTimes': return compare((a.rank || {}).times, (b.rank || {}).times, isAsc);
        case 'rankTop': return compare((a.rank || {}).top, (b.rank || {}).top, isAsc);
        case 'rankShanghai': return compare((a.rank || {}).shanghai, (b.rank || {}).shanghai, isAsc);
        case 'rankUsNews': return compare((a.rank || {}).usnews, (b.rank || {}).usnews, isAsc);
        case 'rankFacebook': return compare((a.rank || {}).facebook, (b.rank || {}).facebook, isAsc);
        case 'rankTwitter': return compare((a.rank || {}).twitter, (b.rank || {}).twitter, isAsc);
        case 'rankLinkedin': return compare((a.rank || {}).linkedin, (b.rank || {}).linkedin, isAsc);
        case 'rankInstagram': return compare((a.rank || {}).instagram, (b.rank || {}).instagram, isAsc);
        case 'rankYoutube': return compare((a.rank || {}).youtube, (b.rank || {}).youtube, isAsc);
        default: return 0;
      }
    });

    // console.log('this.sortedUniversities',this.sortedUniversities)

    const dataUniversities = this.sortedUniversities.map(
      u => ({
        pic: u.pic,
        name: u.name,
        link: u.link,
        country: u.country,
        state: u.state,
        city: u.city,
        establish: u.establish,
        rankTimes: (u.rank && u.rank.times) ? u.rank.times : '-',
        rankTop: (u.rank && u.rank.top) ? u.rank.top : '-',
        rankShanghai: (u.rank && u.rank.shanghai) ? u.rank.shanghai : '-',
        rankUsNews: (u.rank && u.rank.usnews) ? u.rank.usnews : '-',
        rankFacebook: (u.rank && u.rank.facebook) ? u.rank.facebook : '-',
        rankTwitter: (u.rank && u.rank.twitter) ? u.rank.twitter : '-',
        rankLinkedin: (u.rank && u.rank.linkedin) ? u.rank.linkedin : '-',
        rankInstagram: (u.rank && u.rank.instagram) ? u.rank.instagram : '-',
        rankYoutube: (u.rank && u.rank.youtube) ? u.rank.youtube : '-',
      })
    )

    this.dataSource = new MatTableDataSource(dataUniversities);
    // console.log('this.dataSource',this.dataSource)
    // this.dataSource.paginator = this.paginator;
    // this.sort.sort(({ id: sort.active, start: sort.direction}) as MatSortable);
    this.dataSource.sort = this.sort;
  }

  columnsOp() {
    this.toggleColumns.nativeElement.click();
  }

}

function compare(a: number | string, b: number | string, isAsc: boolean) {
  // console.log('a',a,'b',b)
  if (a==null || a==0) return 1 * (isAsc ? 1 : -1);
  if (b==null || b==0) return -1 * (isAsc ? 1 : -1);
  return (a < b ? -1 : 1) * (isAsc ? 1 : -1);
}
