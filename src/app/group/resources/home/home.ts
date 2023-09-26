import {Component, OnInit, ViewChild, ElementRef} from '@angular/core';
import {Title} from '@angular/platform-browser';
import {ActivatedRoute} from '@angular/router';

import {MissionService} from '../../services/mission-service';
import {resourcesPageItems, GroupService} from '../../../shared/services/group-service';
import {PeopleService} from '../../../shared/services/people-service';
import {Price, CreateResource, Resource, ResourceService} from '../../../shared/services/resource-service';

import {SharedService} from '../../../shared/services/shared-service';

import {UserService} from '../../../user/services/user-service';

import {itemsAnimation} from '../../../shared/animations/index';

@Component({
  selector: 'group-resources',
  templateUrl: 'home.html',
  styleUrls: ['home.css'],
  animations: [itemsAnimation],
  host: { '[@itemsAnimation]': '' }
})
export class GroupResourcesComponent implements OnInit {
  items: resourcesPageItems;
  resources: Resource[];

  streamRetrieved: boolean[] = [];
  counterPointer: number[] = [];
  showButton: boolean[] = [];

  backgroundBuildFlag = false;

  // categoryNewFlag = false;
  // categoryBuildFlag = false;
  // categoryIndex: number;

  streamBackground = 0;
  streamResources: number[];
  streamResourcesFollow: number[];
  // streamCategories: number[];

  // itemFocus: number;
  // dragIndex: number;

  fragment: string;

  @ViewChild('scrollBackground', { static: false }) private scrollBackground: ElementRef;
  @ViewChild('scrollAdd', { static: false }) private scrollAdd: ElementRef;

  constructor(public route: ActivatedRoute,
              public titleService: Title,
              public groupService: GroupService,
              public peopleService: PeopleService,
              public resourceService: ResourceService,
              public userService: UserService,
              public sharedService: SharedService,
              public missionService: MissionService) { }

  async updatePage() {
    this.items = await this.groupService.getResourcesPageByGroupId(this.missionService.groupId);

    this.counterPointerFunc(this.items),
    // this.streamCategories = new Array(this.items.categories.length).fill(0);
    this.streamRetrieved[0] = true;

    const resources = await this.resourceService.getResources<Resource>(2, this.missionService.groupId, null, 0);

    if (resources) {
      this.resources = resources;
      this.streamResources = new Array(this.resources.length).fill(0);
      this.streamResourcesFollow = new Array(this.resources.length).fill(0);
    } else {
      this.resources = [];
    }

    this.streamRetrieved[1] = true;
  }

  ngOnInit() {
    if (this.missionService.groupId) {
      this.titleService.setTitle('Services - ' + this.missionService.groupTitle + ' | Academig');
      this.streamRetrieved = [false, false];
      this.updatePage()

      this.route.fragment.subscribe(fragment => {
        this.fragment = fragment
        this.scrollFunc()
      });
    }

    // this.subscriptionRouter = this.router.events.subscribe((event) => {
    //   if ((event instanceof NavigationEnd)) {
    //     this.updatePage()
    //   }
    // });
  }

  scrollFunc() {
    setTimeout(() => {
      try {
        switch (this.fragment) {
           case "background": this.scrollBackground.nativeElement.scrollIntoView({ behavior: "smooth", block: "center" }); break;
           case "add": this.scrollAdd.nativeElement.scrollIntoView({ behavior: "smooth", block: "center" }); break;
        }
      } catch (e) { }
    }, 1000);
  }

  buttonOver(showStatus: boolean, i: number) {
    if (this.missionService.showEditBtn) {
      this.showButton[i] = showStatus;
    }
  }

  counterPointerFunc(r: resourcesPageItems) {
    this.counterPointer[0] = 0;
    const index = 0;
    // r.categories.forEach((item, index) => {
      // this.counterPointer[index + 1] = this.counterPointer[index] + item.countIds;
      this.counterPointer[1] = this.counterPointer[0] + r.categories[0].countIds;
    // });
  }

  async backgroundOp(mode: number, flag: boolean, event) {
    this.backgroundBuildFlag = flag;

    if (mode == 1) {

      this.streamBackground = 3;

      await this.sharedService.deleteText(this.missionService.groupId, this.missionService.groupId, 3);

      this.items.background = null;
      this.missionService.groupProgress[6] = 0;
      this.streamBackground = 0;

    } else if (mode == 2) {

      this.items.background = event.text
      this.streamBackground = 3;

      await this.sharedService.postText(event.text, this.missionService.groupId, this.missionService.groupId, 3);

      this.streamBackground = 1;
      this.missionService.groupProgress[6] = 1;

    } else if (mode == 3) {

      this.streamBackground = 0;

    }
  }

  async resourceFollow(cIndex: number, rIndex: number) {
    const followIndex: number = this.counterPointer[cIndex] + rIndex;
    const _id: string = this.resources[followIndex]._id;
    const toFollow: boolean = !this.resources[followIndex].followStatus;
    this.streamResourcesFollow[followIndex] = 3;
    await this.peopleService.toggleFollow(1, 0, _id, toFollow);
    this.userService.toggleFollow(toFollow, _id, "resource");
    this.resources[followIndex].followStatus = toFollow;
    this.streamResourcesFollow[followIndex] = 0;
  }

  // async resourceOrder(drag: number, drop: number, bagName: string) {
  //   let modeNum: number
  //   let itemId: string
  //
  //   const cIndex: number = parseInt(bagName.slice(-1));
  //
  //   const dragIndex: number = this.counterPointer[cIndex] + drag;
  //   const dropIndex: number = this.counterPointer[cIndex] + drop;
  //   // [this.resources[dragIndex], this.resources[dropIndex]] = [this.resources[dropIndex], this.resources[dragIndex]];
  //   // this.resources.swap( dragIndex, dropIndex )
  //   // this.resources = Object.assign([], this.resources, {[dragIndex]: this.resources[dropIndex], [dropIndex]: this.resources[dragIndex})
  //
  //   itemId = this.resources[dragIndex]._id;
  //   this.streamResources[dragIndex] = 3;
  //   await this.groupService.orderItems(this.missionService.groupId, itemId, 0, 1, null, dragIndex, dropIndex);
  //   this.streamResources[dragIndex] = 0;
  // }

  // streamCategoriesFunc() {
  //   if (this.categoryNewFlag == true) {
  //     this.streamCategories[this.itemFocus] = 0;
  //   } else {
  //     this.streamCategories[this.categoryIndex] = 0;
  //   }
  // }

  // categorySlide(flag: boolean, cIndex: number, newFlag: boolean) {
  //   this.categoryIndex = cIndex;
  //   this.categoryBuildFlag = flag;
  //   this.categoryNewFlag = newFlag;
  // }

  // categoryUpdate(event) {
  //   let updateIndex: number
  //   this.categoryBuildFlag = false;
  //
  //   if (this.categoryNewFlag == true) {
  //
  //     this.items.categories.push({
  //                                 '_id': null,
  //                                 'title': event.text,
  //                                 'countIds': 0
  //                               });
  //
  //     const insertIndex = this.items.categories.length - 1;
  //
  //     this.streamCategories[insertIndex] = 3;
  //     this.itemFocus = insertIndex;
  //
  //     this.subscriptionCategoryPut = this.resourceService.putCategory(event.text, this.missionService.groupId).subscribe(
  //       data => {
  //                this.items.categories[insertIndex]._id = data;
  //              },
  //       err => {
  //               console.log('Can\'t Create Category. Error code: %s, URL: %s, Error: %s, Message: %s', err.status, err.url, err.error, err.message),
  //               this.streamCategories[insertIndex] = 2;
  //             },
  //       () => {
  //               this.streamCategories[insertIndex] = 1,
  //               this.counterPointer[insertIndex + 1] = this.counterPointer[insertIndex];
  //             }
  //     );
  //
  //   } else {
  //
  //     updateIndex = this.categoryIndex;
  //     this.items.categories[updateIndex] = {
  //                                           '_id': this.items.categories[updateIndex]._id,
  //                                           'title': event.text,
  //                                           'countIds': this.items.categories[updateIndex].countIds
  //                                          };
  //
  //     this.streamCategories[updateIndex] = 3;
  //
  //     this.subscriptionCategoryPost = this.resourceService.postCategory(event.text, updateIndex, this.missionService.groupId).subscribe(
  //       result => {},
  //       err => {
  //               console.log('Can\'t Update Category. Error code: %s, URL: %s, Error: %s, Message: %s', err.status, err.url, err.error, err.message),
  //               this.streamCategories[updateIndex] = 2;
  //             },
  //       () => {
  //               this.streamCategories[updateIndex] = 1;
  //             }
  //     );
  //
  //    }
  //
  // }

  // categoryDelete(cIndex: number) {
  //   this.itemFocus = null;
  //
  //   const _id = this.items.categories[cIndex]._id;
  //   this.streamCategories[cIndex] = 3;
  //
  //   this.subscriptionCategoryDelete = this.resourceService.deleteCategory(cIndex, _id, this.missionService.groupId).subscribe(
  //     result => {},
  //     err => {
  //             console.log('Can\'t Delete Resource. Error code: %s, URL: %s, Error: %s, Message: %s', err.status, err.url, err.error, err.message);
  //             this.streamCategories[cIndex] = 2;
  //           },
  //     () => {
  //             this.items.categories.splice(cIndex, 1);
  //             // this.items.categories[cIndex].countIds--;
  //             this.streamCategories[cIndex] = 0;
  //             this.buttonOver(false, 0)
  //
  //             for (let _j = cIndex + 1; _j < this.items.categories.length; _j++) {
  //               this.counterPointer[_j]--;
  //             }
  //
  //           }
  //   );
  // }

}

// interface Array<T> {
//     swap(a: number, b: number): void;
// }
//
// Array.prototype.swap = function (a: number, b: number) {
//     if (a < 0 || a >= this.length || b < 0 || b >= this.length) {
//         return
//     }
//
//     const temp = this[a];
//     this[a] = this[b];
//     this[b] = temp;
// }
