import {Component, OnInit, ViewChild} from '@angular/core';
import {Title} from '@angular/platform-browser';

import {MatPaginator} from '@angular/material/paginator';
import {Sort, MatSortable, MatSort} from '@angular/material/sort';
import {MatTableDataSource} from '@angular/material/table';

import {PeopleService} from '../../../shared/services/people-service';

// import { MetaService } from '../shared/services/meta-service';

import {departmentsItems, Department, CreateDepartment, UniversityService} from '../../../shared/services/university-service';
import {SharedService} from '../../../shared/services/shared-service';
import {MissionService} from '../../services/mission-service';

export interface DepartmentData {
  name: string;
  link: string;
  total: number;
  year: number;
  rank: number;
  // degrees
  // program duration
}

@Component({
  selector: 'university-departments',
  templateUrl: 'home.html',
  styleUrls: ['home.css']
})
export class UniversityDepatmentsComponent {
  unitNewFlag: boolean = false;
  unitBuildFlag: boolean = false;
  unitIndex: number;

  csvBuildFlag: boolean = false;
  streamCsv: number;

  departmentBuildFlag: boolean = false;
  departmentNewFlag: boolean = false;
  departmentIndex: number;

  streamRetrieved: boolean = false;
  departmentsItems: departmentsItems;

  streamUnits: number[] = [];
  streamDepartments: number[] = [];

  // displayedColumns: string[] = ['name', 'total', 'year', 'rank'];
  displayedColumns: string[] = ['name', 'total'];
  dataSources: MatTableDataSource<DepartmentData>[] = [];

  @ViewChild(MatPaginator, {static: true}) paginator: MatPaginator;
  @ViewChild(MatSort, {static: true}) sort: MatSort;

  icons: string[] = ['exact_sciences',
                     'life_sciences',
                     'engineering',
                     'social_sciences',
                     'humanities',
                     'interdisciplinary_studies',
                     'religious_studies',
                     // 'torah_studies',
                     'department_general',
                     'department_general'];

  constructor(private titleService: Title,
              private sharedService: SharedService,
              private universityService: UniversityService,
              public missionService: MissionService) {}

  ngOnInit() {
    if (this.missionService.universityId) {
      this.titleService.setTitle('Departments - ' + this.missionService.universityName + ' | Academig');
      this.updatePage()
    }
  }

  async updatePage() {
    this.streamRetrieved = false;
    this.departmentsItems = await this.universityService.getUnitsAndDepartments(this.missionService.universityId);
    console.log('departmentsItems',this.departmentsItems)

    this.streamUnits = new Array(this.departmentsItems.categories.length).fill(0);
    this.streamDepartments = new Array(this.departmentsItems.departments.length).fill(0);

    let dataKits;

    this.departmentsItems.categories.forEach((category, index) => {
      category.empty = true;
      if (this.departmentsItems.departments.findIndex(r => r.categoryId == category.id)>-1) category.empty = false;
      dataKits = this.departmentsItems.departments.filter(r => r.categoryId==category.id).map(
        u => ({
          name: u.name,
          link: u.link,
          // total: 5, // Lab Size
          // year: 2015, // Founded Year
          // rank: 1
          // department head
          // number of people
        })
      )
      this.dataSources[index] = new MatTableDataSource(dataKits);
      this.dataSources[index].paginator = this.paginator;
      this.dataSources[index].sort = this.sort;
    })

    this.streamRetrieved = true;
  }

  unitSlide(flag: boolean, cIndex: number, newFlag: boolean) {
    this.unitIndex = cIndex;
    this.unitBuildFlag = flag;
    this.unitNewFlag = newFlag;
  }

  async unitUpdate(event) {
    this.unitBuildFlag = false;

    if (this.unitNewFlag == true) {

      this.departmentsItems.categories.push({
                                             'id': null,
                                             'name': event.name,
                                             'icon': event.icon,
                                             'empty': true
                                           });

      const insertIndex = this.departmentsItems.categories.length - 1;

      this.streamUnits[insertIndex] = 3;
      this.departmentsItems.categories[insertIndex].id = await this.universityService.putUnit(event.name, event.icon, this.missionService.universityId);

      this.streamUnits[insertIndex] = 1

    } else {

      this.departmentsItems.categories[this.unitIndex].name = event.name;
      this.departmentsItems.categories[this.unitIndex].icon = event.icon;
      this.streamUnits[this.unitIndex] = 3;
      await this.universityService.postUnit(event.name, event.icon, this.departmentsItems.categories[this.unitIndex].id, this.missionService.universityId);

      this.streamUnits[this.unitIndex] = 1

     }
  }

  async unitDelete(cIndex: number) {
    const _id = this.departmentsItems.categories[cIndex].id;
    this.streamUnits[cIndex] = 3;

    await this.universityService.deleteUnit(_id, this.missionService.universityId);

    this.departmentsItems.categories.splice(cIndex, 1);
    this.streamUnits[cIndex] = 0;
  }

  departmentSlide(flag: boolean, uIndex: number, dIndex: number, newFlag: boolean) {
    this.unitIndex = uIndex;
    this.departmentIndex = dIndex;
    this.departmentBuildFlag = flag;
    this.departmentNewFlag = newFlag;
  }

  async departmentUpdate(event) {
    const unitIndexNew = event.unit;
    let updateIndex: number;

    this.departmentBuildFlag = false;

    if (this.departmentNewFlag) {

      const createDepartment: CreateDepartment = {
                                                  'name': event.department,
                                                  'link': event.link,
                                                  'pic': event.pic,
                                                  'website': event.website,
                                                  'description': event.description,
                                                  'source': event.source,
                                                 };

      const department: Department = {
                                      '_id':  null,
                                      'categoryId': this.departmentsItems.categories[event.unit].id,
                                      'name': event.department,
                                      'link': event.link,
                                      'pic': event.pic
                                     };

      this.departmentsItems.departments.push(department);

      var unitIndex = this.departmentsItems.categories.findIndex(r => r.id == department.categoryId);

      this.departmentsItems.categories[unitIndex].empty = false;

      var loc = this.departmentsItems.departments.length-1;

      // this.itemFocus = loc;
      this.streamDepartments[loc] = 3;
      this.departmentsItems.departments[loc]._id = await this.universityService.putDepartment(createDepartment, this.missionService.universityId, this.departmentsItems.categories[event.unit].id);
      this.streamDepartments[loc] = 1;

    } else {

      const currentId = this.departmentsItems.departments[this.departmentIndex].categoryId;

      this.departmentsItems.departments[this.departmentIndex].categoryId = this.departmentsItems.categories[event.unit].id;

      const unitEmpty = this.departmentsItems.departments.findIndex(r => r.categoryId == currentId) == -1;
      if (unitEmpty) this.departmentsItems.categories[this.unitIndex].empty = true;

      this.departmentsItems.categories[event.unit].empty = false;

      this.streamDepartments[loc] = 3;
      await this.universityService.postDepartment(this.missionService.universityId, this.departmentsItems.departments[this.departmentIndex]._id, this.departmentsItems.departments[this.departmentIndex].categoryId);
      this.streamDepartments[loc] = 1;

    }

  }

  async csvOp(mode: number, flag: boolean, file) {
    this.csvBuildFlag = flag;

    if (mode == 2) {
      this.streamCsv = 3;
      await this.sharedService.uploadCSV(file, this.missionService.universityId, null, null, 1);
      this.streamCsv = 1;
    }
  }

  streamUnitsFunc() {
    if (this.unitNewFlag == true) {
      this.streamUnits[this.streamUnits.length-1] = 0;
    } else {
      this.streamUnits[this.unitIndex] = 0;
    }
  }

  streamCsvFunc() {
    this.streamCsv = 0;
  }

  streamResourcesFunc() {
    this.streamDepartments[this.streamDepartments.length-1] = 0;
  }

}
