import {Component, Input, Output, EventEmitter} from '@angular/core';

@Component({
  selector: 'settings-theme',
  templateUrl: 'theme.html',
  styleUrls: ['theme.css']
})
export class ThemeComponent {

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

  sub_length: number[] = [0, 5, 13, 18, 21]

  updateThemeValue(i: number): void {
    // this.parentGroup.controls['theme'].setValue(this.sub_length[i])
  }

}
