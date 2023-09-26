import {Component, OnInit, Input, DoCheck, IterableDiffers} from '@angular/core';

@Component({
    selector: 'people-progress',
    templateUrl: 'progress.html',
    styleUrls: ['progress.css']
})
export class PeopleProgressComponent implements OnInit {
  @Input() source: number;
  @Input() peopleId: string;
  @Input() profileProgress: boolean[];

  progress: boolean[];

  differ: any;
  taskLeft: number;
  taskNum: number;
  profileScore: number;
  taskScore: number[] = [10, // Profile Picture - 0 vv
                         5,  // Research Interests - 1 vv
                         10,  // About Me - 2 vv
                         10,  // Positions and Degrees - 3 vv
                         5,  // Cover Picture - 4 vv
                         0,  // Site Flow - 5 xxxxxx
                         10, // Publications - 6 vv
                         10, // News - 7 vv
                         // Follow
                         5,  // Resource - 8 vv
                         5,  // Project - 9 vv
                         5,  // Funding - 10 v
                         5,  // Teaching - 11 vv
                         5,  // Gallery - 12 vv
                         5,  // Talk - 13 vv
                         5,  // Poster - 14 vv
                         5   // Press - 15 vv
                         ];
  taskIcon: string[] = ['user-circle-o', // Profile Picture
                        'tags', // Research Interests
                        'font', // About Me
                        'graduation-cap', // Positions and Degrees
                        'home', // Cover Picture
                        null, // Site Flow
                        'book', // Publications
                        'feed', // News
                        // Follow
                        'wrench', // Resource
                        'cubes', // Project
                        'money', // Funding
                        'graduation-cap', // Teaching
                        'picture-o', // Gallery
                        'microphone', // Talk
                        'object-group', // Poster
                        'newspaper-o'  // Press
                       ];

  constructor(private differs:  IterableDiffers) {
    this.differ = differs.find([]).create(null);
  }

  ngOnInit () {
    // console.log('this.profileProgress',this.profileProgress)
    this.taskNum = this.profileProgress.findIndex(r => r == false);
  }

  ngDoCheck() {
    this.progress = this.profileProgress.concat(Array(16-this.profileProgress.length).fill(0)).map(r => r==null ? false : r);
    this.progress[3] = true;
    this.progress[5] = true;
    // this.progress[8] = true; Follow

    const change = this.differ.diff(this.progress);
    if (change) {
      // console.log('ngDoCheck Profile Progress')
      this.calcScore();
      this.changeTask();
    }

  }

  calcScore() {
    this.profileScore = 0;
    for (let i = 0; i < this.progress.length; i++) {
      this.profileScore += Number(this.progress[i]) * this.taskScore[i];
    }

    // claculate remaining tasks
    this.taskLeft = (this.progress.length) - this.progress.filter(v => v).length
    // console.log(this.taskLeft)
  }

  changeTask() {
    // find the next False in the array (cyclic)

    let reverseArr = this.progress;
    reverseArr = [...reverseArr].reverse() // reverse array

    // console.log(this.taskNum, this.progress.length-1-reverseArr.findIndex(r => r==false))

    if (this.taskNum == (this.progress.length - 1 - reverseArr.findIndex(r => r == false))) { // find the last false
      this.taskNum = this.progress.findIndex(r => r == false);
    } else {
      this.taskNum += 1 + this.progress.slice(this.taskNum + 1).findIndex(r => r == false);
    }

    // console.log(this.finishedTaskFlags.reduce(function(r,a,i){return r+a*this.taskScore[i]},0));
  }

}
