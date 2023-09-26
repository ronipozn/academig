import {Component, OnInit, ViewChild, ElementRef} from '@angular/core';
import {Title} from '@angular/platform-browser';
import {ActivatedRoute} from '@angular/router';

import {MissionService} from '../../services/mission-service';
import {faqPageItems, GroupService} from '../../../shared/services/group-service';
import {FAQ, FaqService} from '../../../shared/services/faq-service';

import {itemsAnimation} from '../../../shared/animations/index';

@Component({
  selector: 'group-faq',
  templateUrl: 'home.html',
  styleUrls: ['home.css'],
  animations: [itemsAnimation],
  host: { '[@itemsAnimation]': '' }
})
export class GroupFAQComponent implements OnInit {
  faqs: FAQ[];

  streamRetrieved: boolean;

  itemFocus: number;
  dragIndex: number;
  streamFAQ: number[];

  faqIndex: number;
  faqNewFlag = false;
  faqBuildFlag = false;

  fragment: string;

  @ViewChild('scrollAdd', { static: false }) private scrollAdd: ElementRef;

  constructor(private route: ActivatedRoute,
              private titleService: Title,
              private faqService: FaqService,
              private groupService: GroupService,
              public missionService: MissionService) {
  }

  async ngOnInit() {
    if (this.missionService.groupId) {
      this.titleService.setTitle('Questions - ' + this.missionService.groupTitle + ' | Academig');
      this.streamRetrieved = false;

      this.faqs = await this.faqService.getFAQ(this.missionService.groupId, 0);

      this.streamRetrieved = true;
      this.streamFAQ = new Array(this.faqs.length).fill(0);

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

  faqSlide(flag: boolean, i: number, newFlag: boolean) {
    this.faqIndex = i;
    this.faqBuildFlag = flag;
    this.faqNewFlag = newFlag;
  }

  async faqUpdate(event) {
    this.faqBuildFlag = false;

    const faq: FAQ = {
                      '_id': (this.faqNewFlag) ? null : this.faqs[this.faqIndex]._id,
                      'question': event.question,
                      'answer': event.answer,
                      'ai': event.intelligence ? event.intelligence[0] : null
                     };

    if (this.faqNewFlag == true) {

      this.faqs.push(faq);
      const loc = this.faqs.length - 1;

      this.streamFAQ[loc] = 3;
      this.itemFocus = loc;

      this.faqs[loc]._id = await this.faqService.putFAQ(faq, this.missionService.groupId, 0);

      this.streamFAQ[loc] = 1;
      this.missionService.groupProgress[20] = 1;

    } else {

      this.faqs[this.faqIndex] = faq;
      this.streamFAQ[this.faqIndex] = 3;

      await this.faqService.postFAQ(faq, faq._id, this.missionService.groupId, 0);

      this.streamFAQ[this.faqIndex] = 1;

    }
  }

  async faqDelete(i: number) {
    this.streamFAQ[i] = 3;

    await this.faqService.deleteFAQ(this.faqs[i]._id, this.missionService.groupId, 0);

    this.faqs.splice(i, 1);
    this.streamFAQ[i] = 0;
    if (this.faqs.length == 0) this.missionService.groupProgress[20] = 0;
  }

  async faqOrder(drag: number, drop: number) {
    this.streamFAQ[drop] = 3;
    const itemId: string = this.faqs[drag]._id;
    await this.groupService.orderItems(this.missionService.groupId, itemId, 0, 7, null, drag, drop);
    this.streamFAQ[drop] = 0;
  }

  faqStreamFunc() {
    if (this.faqNewFlag == true) {
      this.streamFAQ[this.faqs.length - 1] = 0;
    } else {
      this.streamFAQ[this.faqIndex] = 0;
    }
  }

}
