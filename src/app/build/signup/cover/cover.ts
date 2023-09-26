import {Component, OnInit, Input, Output, EventEmitter} from '@angular/core';
import {FormGroup} from '@angular/forms';

@Component({
  selector: 'signup-build-cover',
  templateUrl: 'cover.html',
  styleUrls: ['cover.css']
})
export class SignUpBuildCoverComponent implements OnInit {
  @Input() parentGroup: FormGroup;
  @Input() subPicIndex: number[];
  @Input() forkNum: number;
  @Input() coverPic: string;

  @Output() newStep: EventEmitter <number[]> = new EventEmitter();
  @Output() previousStep: EventEmitter <boolean> = new EventEmitter();

  @Output() picSlide: EventEmitter <boolean> = new EventEmitter();
  @Output() picDelete: EventEmitter <boolean> = new EventEmitter();

  disciplines: string[] = ['Humanities', 'Social Sciences', 'Natural Sciences', 'Exact Sciences', 'Applied Sciences']
  disciplinesTags: string[] = ['Humanities', 'SocialSciences', 'NaturalSciences', 'ExactSciences', 'AppliedSciences']

  sub_disciplines: string[][] =
  [
    ['Arts', 'History', 'Languages and Literature', 'Philosophy', 'Theology'],
    ['Anthropology', 'Archaeology', 'Economics', 'Human Geography', 'Law', 'Political Science', 'Psychology', 'Sociology'],
    ['Biology', 'Chemistry', 'Earth Sciences', 'Space Sciences', 'Physics'],
    ['Computer Science', 'Mathematics', 'Statistics'],
    ['Chemical Engineering', 'Civil Engineering', 'Educational Technology', 'Electrical Engineering', 'Materials Engineering', 'Mechanical Engineering', 'Systems Science', 'Medicine and Health']
  ]

  sub_pics: string[][] =
  [
    ['Arts', 'History', 'Literature', 'Philosophy', 'Theology'],
    ['Anthropology', 'Archaeology', 'Economics', 'Human', 'Law', 'Political', 'Psychology', 'Sociology'],
    ['Biology', 'Chemistry', 'Earth', 'Space', 'Physics'],
    ['Computer', 'Mathematics', 'Statistics'],
    ['Chemical', 'Civil', 'Educational', 'Electrical', 'Materials', 'Mechanical', 'Systems', 'Medicine']
  ]

  sub_length: number[] = [0, 5, 13, 18, 21, 29];

  selectedTab: number;
  selectedPic: number;
  selectedIndex: number;

  labType: number;

  ngOnInit(): void {
    this.labType = (this.forkNum==4 || this.forkNum==5 || this.forkNum==7) ? 1 : 0;

    const i = this.parentGroup.controls['theme'].value;

    for (let _j = 0; _j < this.sub_length.length-2; _j++) {
      if (i>=this.sub_length[_j] && i<this.sub_length[_j+1]) {
        this.selectedTab = _j;
      }
    }

    this.selectedPic = i - this.sub_length[this.selectedTab];
    this.selectedIndex = this.parentGroup.controls['themeIndex'].value;
  }

  toStep(): void {
    this.newStep.emit([]);
  }

  toPrevious(): void {
    this.previousStep.emit();
  }

  updateThemeValue(i: number): void {
    this.parentGroup.controls['theme'].setValue(this.sub_length[i])
  }

  picOp() {
    this.picSlide.emit()
  }

  picDeleteOp() {
    this.picDelete.emit()
  }

  updateThemeIndex(i: number, j: number, mode: number): void {
    var l = this.sub_length[i]+j;

    if (mode==1 && this.subPicIndex[l]==2) {
      this.subPicIndex[l]=0;
    } else if (mode==-1 && this.subPicIndex[l]==0) {
      this.subPicIndex[l]=2;
    } else {
      this.subPicIndex[l]+=mode;
    }

    this.parentGroup.controls['themeIndex'].setValue(this.subPicIndex[l]);
  }

}
