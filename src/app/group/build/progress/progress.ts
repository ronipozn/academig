import {Component, OnInit, Input, DoCheck, IterableDiffers} from '@angular/core';

@Component({
    selector: 'group-build-progress',
    templateUrl: 'progress.html',
    styleUrls: ['progress.css']
})
export class GroupBuildProgressComponent implements OnInit {
  @Input() contestItem: any;
  @Input() groupProgress: number[];
  @Input() groupTypeTitle: string;

  @Input() groupStage: number; // not used yet

  activeIndex: number = 0;

  timeleft: number;

  differ: any;
  taskLeft: number;
  taskNum: number;
  groupScore: number; // emit updates

  progress: number[];

  // Lab Points:
  // Build lab profile +7
  // Invite lab members +2
  // Add lab publications +5
  // Add lab projects / positions / services / teaching / galleries / media / faq / funding / collaborations / news +3
  // Social share

  totalPages: number;
  tasksActive = [];
  tasksDone = [];

  tasks = [
    {
      'name': 'Cover picture',
      'description': 'Add your lab best cover picture',
      'points': 3,
      'icon': 'home',
      'link': '.',
      'fragment': 'cover',
      'once': true,
      'active': true,
      'index': 0
    },
    {
      'name': 'Background',
      'description': 'Add your best background description of your lab',
      'points': 3,
      'icon': 'font',
      'link': '.',
      'fragment': 'background',
      'once': true,
      'active': true,
      'index': 1
    },
    {
      'name': 'Quote',
      'description': 'Add the quote that most resonates with your lab',
      'points': 3,
      'icon': 'quote-left',
      'link': '.',
      'fragment': 'quote',
      'once': true,
      'active': true,
      'index': 2
    },
    {
      // Participate in topics that matter to your page by adding hashtags
      'name': 'Research interests',
      'description': 'Add the research fields that most matter to your lab',
      'points': 3,
      'icon': 'tags',
      'link': '.',
      'fragment': 'interests',
      'once': true,
      'active': true,
      'index': 3
    },
    {
      'name': 'Lab contact info',
      'description': 'Share your lab contact info, address, email and phone',
      'points': 4,
      'icon': 'font',
      'link': '.',
      'fragment': 'contact-info',
      'once': true,
      'active': true,
      'index': 29
    },
    {
      'name': 'Lab social info',
      'description': 'Share your lab social info, linkedin, twitter, scholar and more',
      'points': 4,
      'icon': 'font',
      'link': '.',
      'fragment': 'social-info',
      'once': true,
      'active': true,
      'index': 30
    },
    {
      'name': 'Invite lab people',
      'description': 'Invite your lab members, both active and alumni',
      'points': 4,
      'icon': 'users',
      'link': 'people',
      'fragment': 'invite',
      'once': false,
      'active': true,
      'index': 4
    },
    {
      'name': 'Add publication',
      'description': 'Add your lab publications',
      'points': 4,
      'icon': 'book',
      'link': 'publications',
      'fragment': 'add',
      'once': true,
      'active': true,
      'index': 5
    },
    // {
    //   'name': 'Projects background',
    //   'description': 'Share background about your lab research projects',
    //   'points': 3,
    //   'icon': 'font',
    //   'link': 'projects',
    //   'once': true,
    //   'active': false,
    // },
    // {
    //   'name': 'Project layman background',
    //   'description': 'Explain your lab research in layman terms',
    //   'points': 3,
    //   'icon': 'font',
    //   'link': 'projects',
    //   'once': true,
    //   'active': false,
    // },
    // {
    //   'name': 'Add project',
    //   'description': 'Publish your lab research projects',
    //   'points': 3,
    //   'icon': 'font',
    //   'link': 'projects',
    //   'once': true,
    //   'active': false,
    // },
    {
      'name': 'Add research fields',
      'description': 'Add your lab research field',
      'points': 4,
      'icon': 'cubes',
      'link': 'research-topics',
      'fragment': 'add',
      'once': false,
      'active': true,
      'index': 31
    },
    {
      'name': 'How to collaborate with us',
      'description': 'Expain how your lab normally conduct collaborations',
      'points': 3,
      'icon': 'font',
      'link': 'collaborations',
      'fragment': 'howto',
      'once': true,
      'active': true,
      'index': 12
    },
    {
      'name': 'Add collaboration',
      'description': 'Publish your lab collaborations, past and present',
      'points': 4,
      'icon': 'share-alt',
      'link': 'collaborations',
      'fragment': 'add',
      'once': false,
      'active': true,
      'index': 11
    },
    {
      'name': 'Add funding',
      'description': 'Publish your lab funding data, past and present',
      'points': 4,
      'icon': 'money',
      'link': 'funding',
      'fragment': 'add',
      'once': false,
      'active': true,
      'index': 13
    },
    {
      'name': 'Why join us',
      'description': 'Share the best reasons to join your lab',
      'points': 2,
      'icon': 'font',
      'link': 'jobs',
      'fragment': 'whyjoin',
      'once': true,
      'active': true,
      'index': 14
    },
    {
      'name': 'About diversity',
      'description': 'Publish your lab diversity statement',
      'points': 2,
      'icon': 'font',
      'link': 'jobs',
      'fragment': 'diversity',
      'once': true,
      'active': true,
      'index': 15
    },
    {
      'name': 'Add open position',
      'description': 'Add and manage your lab job offers',
      'points': 4,
      'icon': 'exchange',
      'link': 'jobs',
      'fragment': 'add',
      'once': false,
      'active': true,
      'index': 16
    },
    {
      'name': 'Services background',
      'description': 'Share background about your lab main services, equipment and procedures',
      'points': 3,
      'icon': 'font',
      'link': 'services',
      'fragment': 'background',
      'once': true,
      'active': true,
      'index': 6
    },
    {
      'name': 'Add service',
      'description': 'Publish your lab services',
      'points': 4,
      'icon': 'wrench',
      'link': 'services',
      'fragment': 'add',
      'once': false,
      'active': true,
      'index': 7
    },
    {
      'name': 'Add teaching',
      'description': 'Publish the lab teaching experience, past and present',
      'points': 3,
      'icon': 'graduation-cap',
      'link': 'teaching',
      'fragment': 'add',
      'once': false,
      'active': true,
      'index': 28
    },
    {
      'name': 'Add gallery',
      'description': 'Add your lab photo galleries for extra engagements',
      'points': 3,
      'icon': 'image',
      'link': 'gallery',
      'fragment': 'add',
      'once': false,
      'active': true,
      'index': 27
    },
    {
      'name': 'Add talk',
      'description': 'Share your lab talks, attach clip and information',
      'points': 4,
      'icon': 'microphone',
      'link': 'media',
      'fragment': 'talk',
      'once': false,
      'active': true,
      'index': 17
    },
    {
      'name': 'Add poster',
      'description': 'Share your lab posters, attach pdfs and information',
      'points': 4,
      'icon': 'object-group',
      'link': 'media',
      'fragment': 'poster',
      'once': false,
      'active': true,
      'index': 18
    },
    {
      'name': 'Add press',
      'description': 'Share your lab press release',
      'points': 4,
      'icon': 'newspaper-o',
      'link': 'media',
      'fragment': 'press',
      'once': false,
      'active': true,
      'index': 19
    },
    {
      'name': 'Add FAQ',
      'description': 'Help visitors by adding your lab\' frequently asked questions',
      'points': 4,
      'icon': 'question',
      'link': 'faq',
      'fragment': 'add',
      'once': false,
      'active': true,
      'index': 20
    },
    {
      'name': 'Find us information',
      'description': 'Add Find Us instructions for your lab',
      'points': 3,
      'icon': 'address-card-o',
      'link': 'contact',
      'fragment': 'findus',
      'once': true,
      'active': true,
      'index': 21
    },
    {
      'name': 'Add contact',
      'description': 'List your lab contact personal with details',
      'points': 4,
      'icon': 'address-card-o',
      'link': 'contact',
      'fragment': 'add',
      'once': false,
      'active': true,
      'index': 22
    },
    {
      'name': 'Add public lab news',
      'description': 'Share important lab events with the lab followers',
      'points': 2,
      'icon': 'feed',
      'link': 'news',
      'fragment': 'add',
      'once': false,
      'active': true,
      'index': 32
    },
    // {
    //   'name': 'Follow 5 labs',
    //   'description': 'Follow labs is a great way to keep tracl with your field',
    //   'points': 5,
    //   'icon': 'puzzle-piece',
    //   'link': 'network',
    //   'once': true,
    //   'active': true,
    //   'index': 23
    // },
    {
      'name': 'Add seminars schedule',
      'description': 'Manange your lab seminars with this handy schedule tool',
      'points': 3,
      'icon': 'clock-o',
      'link': 'seminars',
      'fragment': 'manage',
      'once': true,
      'active': true,
      'index': 25
    },
    {
      'name': 'Add reports schedule',
      'description': 'Manange your lab periodic reports with the report tool',
      'points': 3,
      'icon': 'clock-o',
      'link': 'tools/reports',
      'fragment': 'manage',
      'once': true,
      'active': true,
      'index': 26
    },
    {
      'name': 'Add private lab news',
      'description': 'Communicate privately with your lab members',
      'points': 3,
      'icon': 'feed',
      'link': 'tools/news',
      'fragment': 'add',
      'once': true,
      'active': true,
      'index': 24
    },
    // {
    //   'name': 'Lab interview',
    //   'description': 'Conduct an interview with us to increase your lab popularity and visibility',
    //   'points': 12,
    //   'icon': 'font',
    //   'link': 'interview',
    //   'once': true,
    //   'active': true,
    //   'index': 33
    // },
  ]

  // taskScore: number[];
  // taskIcon: string[];

  constructor(private differs: IterableDiffers) {
    this.differ = differs.find([]).create(null);
  }

  ngOnInit () {
    // var sum = this.taskScore.reduce((x, y) => x + y);
    this.taskNum = -1;

    if (this.contestItem) {
      this.timeleft = Math.floor((new Date(this.contestItem.deadline).getTime()-Date.now())/1000);
    }
  }

  ngDoCheck() {
    this.progress = this.groupProgress.slice(0, 29);

    const change = this.differ.diff(this.progress);
    if (change) {
      this.calcActive();
      this.changeTask();
    }
  }

  calcActive() {
    this.groupScore = 7;
    this.tasksActive = [];
    this.tasksDone = [
      {
        'name': 'Build lab profie',
        'points': 7,
        'icon': 'feed',
        'link': null,
        'once': true,
        'active': false
      }
    ];

    var progressIndex: number

    for (let i = 0; i < this.tasks.length; i++) {
      progressIndex = this.tasks[i].index;
      // this.groupScore += Number(this.progress[progressIndex]) * this.tasks[i].points;
      if (this.tasks[i].active==true) {
        if (this.progress[progressIndex]==0 || this.tasks[i].once==false) {
          this.tasksActive.push(this.tasks[i])
          this.totalPages = Math.ceil(this.tasksActive.length/3);
        }
        if (this.progress[progressIndex]==1) {
          this.tasksDone.push(this.tasks[i])
          this.groupScore += this.tasks[i].points;
        }
      }
    }

    // calculate remaining tasks
    this.taskLeft = (this.progress.length) - this.progress.filter(v => v).length;
  }

  changeIndex(i: number) {
    // if ((this.activeIndex+1)>(this.tasksActive.length/3)) {
    //   this.activeIndex = 0;
    // } else {
      this.activeIndex += i
    // }
    // if (i+1<this.tasksActive.length/3) ? this.activeIndex+1 : 0;
  }

  changeTask() {
    // find the next False in the array (cyclic)
    let reverseArr = this.progress;
    reverseArr = [...reverseArr].reverse() // reverse array

    if (this.taskNum == (this.progress.length - 1 - reverseArr.findIndex(r => r == 0))) {
      this.taskNum = this.progress.findIndex(r => r == 0);
    } else {
      this.taskNum += 1 + this.progress.slice(this.taskNum + 1).findIndex(r => r == 0);
    }

    // console.log(this.finishedTaskFlags.reduce(function(r,a,i){return r+a*this.taskScore[i]},0));
  }

}

// 0	Home	Cover Photo	x
// 1	Home	Background Text	x
// 2	Home	Quote	x
// 3	Home	Research Interests	x
// 4	People	Add people	x (just me for now)
// 5	Publications	Add publication	x
// 6	Services	Background text	x
// 7	Services	Add Serviuce	x
// 8	Projects	Background text	x
// 9	Projects	Layman text	x
// 10	Projects	Add Project	x
// 11	Collaborations	Add Collaboration
// 12	Collaborations	How to collaborate with us	x
// 13	Fundings	Add Funding	x
// 14	Projects	Why Join Us text	x
// 15	Projects	About Diversity text	x
// 16	Positions	Add Open Position
// 17	Media	Add Talk	x
// 18	Media	Add Poster	x
// 19	Media	Add Press Release	x
// 20	Question	Add FAQ	x
// 21	Contact	Find Us text	x
// 22	Contact	Add Contact	x
// 23	Groups	Follow 5 groups
// 24	Private	Add Private news	x
// 25	Private	Seminars Schedule	x
// 26	Private	Reports Schedule	x
// 27	Private	Add Gallery	x
// 28	Private	Add Teaching	x
// 29	Info Public
// 30	Info Social
// 31	Topic	Add Research Field
// 32	News Add Public News
// 33	Interview	Schedule Interview







// <div class="card mt-0">
//   <div class="card-body">
//     <i class="fa fa-{{taskIcon[taskNum]}}"></i>
//     <h5 *ngIf="taskLeft>0" class="mb-0" [ngSwitch]="taskNum">
//       <span *ngSwitchCase="0"><a [routerLink]="['.']"><b>cover picture</b></a></span>
//       <span *ngSwitchCase="1"><a [routerLink]="['.']"><b>background</b></a></span>
//       <span *ngSwitchCase="2"><a [routerLink]="['.']"><b>quote</b></a></span>
//       <span *ngSwitchCase="3"><a [routerLink]="['.']"><b>research interests</b></a></span>
//       <span *ngSwitchCase="4"><a [routerLink]="['./people']"><b>members</b></a></span>
//       <span *ngSwitchCase="5"><a [routerLink]="['./publications']"><b>publications</b></a></span>
//       <span *ngSwitchCase="6"><a [routerLink]="['./services']"><b>Services background</b></a> </span>
//       <span *ngSwitchCase="7"><a [routerLink]="['./services']"><b>First service</b></a> </span>
//       <span *ngSwitchCase="8"><a [routerLink]="['./projects']"><b>Projects background</b></a></span>
//       <span *ngSwitchCase="9"><a [routerLink]="['./projects']"><b>Project layman background</b></a></span>
//       <span *ngSwitchCase="10"><a [routerLink]="['./projects']"><b>First project</b></a></span>
//       <span *ngSwitchCase="11"><a [routerLink]="['./collaborations']"><b>Collaboration</b></a></span>
//       <span *ngSwitchCase="12"><a [routerLink]="['./collaborations']"><b>How to collaborate with us</b></a></span>
//       <span *ngSwitchCase="13"><a [routerLink]="['./fundings']"><b>First funding</b></a></span>
//       <span *ngSwitchCase="14"><a [routerLink]="['./jobs']"><b>Why Join Us</b></a></span>
//       <span *ngSwitchCase="15"><a [routerLink]="['./jobs']"><b>About Diversity</b></a></span>
//       <span *ngSwitchCase="16"><a [routerLink]="['./jobs']"><b>First open position</b></a></span>
//       <span *ngSwitchCase="17"><a [routerLink]="['./media']"><b>Talk</b></a></span>
//       <span *ngSwitchCase="18"><a [routerLink]="['./media']"><b>Poster</b></a></span>
//       <span *ngSwitchCase="19"><a [routerLink]="['./media']"><b>Press</b></a></span>
//       <span *ngSwitchCase="20"><a [routerLink]="['./questions']"><b>FAQ</b></a></span>
//       <span *ngSwitchCase="21"><a [routerLink]="['./contact']"><b>Find us information</b></a></span>
//       <span *ngSwitchCase="22"><a [routerLink]="['./contact']"><b>Contact</b></a></span>
//       <span *ngSwitchCase="23"><a [routerLink]="['./network']"><b>Follow 5 labs</b></a></span>
//       <span *ngSwitchCase="24"><a [routerLink]="['./tools/meetings']"><b>Seminars schedule</b></a></span>
//       <span *ngSwitchCase="25"><a [routerLink]="['./tools/reports']"><b>Reports schedule</b></a></span>
//       <span *ngSwitchCase="26"><a [routerLink]="['./tools/news']"><b>Private news</b></a></span>
//       <span *ngSwitchCase="27"><a [routerLink]="['./gallery']"><b>First gallery</b></a></span>
//       <span *ngSwitchCase="28"><a [routerLink]="['./teaching']"><b>First teaching</b></a></span>
//       <span *ngSwitchCase="29"><a [routerLink]="['./news']"><b>First public news</b></a></span>
//       <span *ngSwitchCase="30"> Num of followers bigget than 5 </span>
//       and go up to {{groupScore+taskScore[taskNum]}}%.
//     </h5>
//   </div>
// </div>
// 0 x 1 x 2 x 3 x 4 x 5 x 6 x 7 x
// 8 x 9 x 10 x 11 x 12 x 13 x 14 x
// 15 x 16 x 17 x 18 x 19 x 20 x 21 x
// 22 x 23 24 25 26 27
