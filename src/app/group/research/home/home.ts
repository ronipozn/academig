import {Component, OnInit, ViewChild, ElementRef} from '@angular/core';
import {Title} from '@angular/platform-browser';
import {ActivatedRoute} from '@angular/router';

import {MissionService} from '../../services/mission-service';
import {GroupService} from '../../../shared/services/group-service';
import {Topic, ProjectService} from '../../../shared/services/project-service';

import {itemsAnimation} from '../../../shared/animations/index';

@Component({
  selector: 'group-research',
  templateUrl: 'home.html',
  styleUrls: ['home.css'],
  animations: [itemsAnimation],
  host: { '[@itemsAnimation]': '' }
})
export class GroupResearchComponent implements OnInit {
  streamRetrieved: boolean;

  itemFocus: number;
  dragIndex: number;
  streamTopics: number[] = [];

  topicIndex: number;
  topicNewFlag = false;
  topicBuildFlag = false;

  topics: Topic[];

  fragment: string;

  @ViewChild('scrollAdd', { static: false }) private scrollAdd: ElementRef;

  constructor(public route: ActivatedRoute,
              private titleService: Title,
              private groupService: GroupService,
              private projectService: ProjectService,
              public missionService: MissionService) { }

  ngOnInit() {
    if (this.missionService.groupId) {
      this.titleService.setTitle('Research Topics - ' + this.missionService.groupTitle + ' | Academig');
      this.topics = this.missionService.topics.slice(0);
      this.streamTopics = new Array(this.topics.length).fill(0);

      this.route.fragment.subscribe(fragment => {
        this.fragment = fragment
        this.scrollFunc()
      });
    }
  }

  scrollFunc() {
    setTimeout(() => {
      try {
        switch (this.fragment) {
           case "add": this.scrollAdd.nativeElement.scrollIntoView({ behavior: "smooth", block: "center" }); break;
        }
      } catch (e) { }
    }, 1000);
  }

  topicSlide(flag: boolean, i: number, newFlag: boolean) {
    this.topicIndex = i;
    this.topicBuildFlag = flag;
    this.topicNewFlag = newFlag;
  }

  async topicUpdate(event) {
    this.topicBuildFlag = false;

    const topic: Topic = {
                          '_id': (this.topicNewFlag) ? null : this.topics[this.topicIndex]._id,
                          'name': event.name,
                          'count': (this.topicNewFlag) ? 0 : this.topics[this.topicIndex].count,
                          'ai': event.intelligence ? event.intelligence[0] : null
                         };

    if (this.topicNewFlag == true) {

      this.missionService.topics.push(topic);
      this.topics.push(topic);

      const loc = this.topics.length - 1;

      this.streamTopics[loc] = 3;
      this.itemFocus = loc;

      this.topics[loc]._id = await this.projectService.putTopic(topic.name, topic.ai, this.missionService.groupId);
      this.streamTopics[loc] = 1;

    } else {

      this.missionService.topics[this.topicIndex] = topic;
      this.topics[this.topicIndex] = topic;

      this.streamTopics[this.topicIndex] = 3;

      await this.projectService.postTopic(topic.name, topic._id, this.missionService.groupId);
      this.streamTopics[this.topicIndex] = 1;
    }

  }

  async topicDelete(i: number) {
    this.streamTopics[i] = 3;

    await this.projectService.deleteTopic(this.topics[i]._id, this.missionService.groupId);

    this.missionService.topics.splice(i, 1),
    this.topics.splice(i, 1),
    this.streamTopics[i] = 0;
  }

  async topicOrder(drag: number, drop: number) {
    this.streamTopics[drop] = 3;
    const itemId: string = this.missionService.topics[drag]._id;
    const tmp: Topic = this.missionService.topics[drag];

    await this.groupService.orderItems(this.missionService.groupId, itemId, 0, 9, null, drag, drop);

    this.missionService.topics.splice(drag, 1);
    this.missionService.topics.splice(drop, 0, tmp);
    this.streamTopics[drop] = 0;
  }

  topicStreamFunc() {
    if (this.topicNewFlag == true) {
      this.streamTopics[this.topics.length - 1] = 0;
    } else {
      this.streamTopics[this.topicIndex] = 0;
    }
  }

}
