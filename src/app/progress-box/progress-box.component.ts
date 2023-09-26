import {Component, OnInit, Input, DoCheck, IterableDiffers} from '@angular/core';

@Component({
    selector: 'progress-box',
    templateUrl: 'progress.html',
    styleUrls: ['progress.css']
})
export class ProgressBoxComponent implements OnInit {
  @Input() source: number;
  @Input() peopleId: string;
  @Input() profileProgress: boolean[];

  progress: boolean[];

  differ: any;
  taskLeft: number;
  taskNum: number;
  profileScore: number;


  tasks = [
    {
      "points": 10,
      "icon": 'user-circle-o',
      'title': 'Add your research interests',
      'description': 'When did you start your Post Doc at Peskin Lab. Add it now.'
    }
  ]

  // 1. Add your research interests (skips)
  // 2. Add your profile picture: You have listed your job! Now add a profile photo to help others recognize you. (skips)
  // 3. Academic Labs Jobs Alerts / Academic Apps Deals Alerts / Academic Mentors Alerts (skips)
  // 4. Build Lab Profile / Join Existing Lab (skips)
  // 5. Introduce yourself (skips)
  // 6. Build your network: Start with people you know, like colleagues, friends, and family – aim for 30 to start. (Find Connections)
  //                        1 connection! A bigger network means more opportunities can find you. 30’s a good start. (Keep Connecting)
  // 6. Approve your publications (skips)
  // 7. Continue adding experiences and skills to showcase your accomplishments: (skips) Positions and Degrees => Projects => Funding => Teaching => Gallery => Talk => Poster => Press
  // 8. Add your contact data => Add your social data
  // 8. Become A Mentor (skips)
  // 9. Interview (skips)
  // 10. Improve your academic profile
  // 11. Add challange => Add to your reading library


  taskScore: number[] = [10, // Profile Picture - 0        vvvvvvvvvvvvvvvvvv
                         5,  // Research Interests - 1     vvvvvvvvvvvvvvvvvv
                         10, // About Me - 2 vv            vvvvvvvvvvvvvvvvvv
                         10, // Positions and Degrees - 3  vvvvvvvv
                         5,  // Cover Picture - 4          xxxxxxxxxxxxxxxxxx
                         0,  // Site Flow - 5              xxxxxxxxxxxxxxxxxx
                         10, // Publications - 6           vvvvvvvv
                         10, // News - 7                   vv
                         // Follow                         vvvvvvvvvvvvvvvvvv
                         5,  // Resource - 8               xxxxxxxxxxxxxxxxxx
                         5,  // Project - 9                xxxxxxxxxxxxxxxxxx
                         5,  // Funding - 10               vv
                         5,  // Teaching - 11              vv
                         5,  // Gallery - 12               vv
                         5,  // Talk - 13                  vv
                         5,  // Poster - 14                vv
                         5   // Press - 15                 vv
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
    this.profileProgress = [false,false,true,false,false];
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
