// // https://stackoverflow.com/questions/45638450/angular2-using-directive-to-execute-function-in-component-losing-scope
// transformGroups = (groups) => {
//   this.streamCompare = new Array(groups.length).fill(0);
//   this.compareStatuses = groups.map(r => this.userService.userCompareGroups.map(u => u.groupIndex.group._id).indexOf(r.objectID)>-1);
//   this.groupsIds = groups.map(r => r.groupIndex.group._id); // for unCompare
//
//   this.streamFollow = new Array(groups.length).fill(0);
//   this.groupsFollow = (this.userService.userFollowings && this.userService.userFollowings.groupsIds) ? groups.map(r => this.userService.userFollowings.groupsIds.indexOf(r.objectID)>-1) : new Array(groups.length).fill(false);
//
//   this.groupsSelected = new Array(groups.length).fill(false);
//   this.previewStatuses = new Array(groups.length).fill(false);
//   this.groupsSelectedLen = 0;
//
//   const adminGroupsLength = this.userService.userPositions ? this.userService.userPositions.length : 0;
//   this.streamAdminFollow = Array(groups.length).fill(0).map(() => new Array(adminGroupsLength).fill(0));
//   // this.groupsAdminFollow = groups.map(r => this.userService.userFollowings.groupsIds.indexOf(r.objectID)>-1) : new Array(groups.length).fill(false);
//   this.groupsAdminFollow =  Array(groups.length).fill(0).map(() => new Array(adminGroupsLength).fill(0));
//
//   groups.forEach((group, j) => {
//     group.positions = group.positions ? group.positions.filter(
//       r => this.userService.searchRefinements.positions.includes(this.titlesTypes[r.position])
//     ) : null;
//   })
//   this.groupsStandouts = groups.map(r => Math.max(r.positions ? r.positions.map(r => r.standout) : null));
//   this.streamRetrieved=true;
//   return groups
// }
//
// async itemFollow(i: number, mode: number, itemId: string) {
//   // console.log("iii",i,mode,itemId)
//
//   if (this.userService.userId==null) {
//
//     this.toggleSignUp.nativeElement.click();
//
//   } else {
//
//     let newState: boolean;
//     let followIndex: number;
//
//     let addFlag: boolean = false;
//
//     const j: number = (mode == 5) ? 9 : mode;
//     const m: number = (mode == 3) ? 2 : 0;
//
//     switch (mode) {
//       // case 0: newState=!this.publications[i].followStatus; break;
//       case 1: {
//         newState = !this.resourcesFollow[i];
//         addFlag = this.userService.toggleFollow(newState, itemId, 1);
//         break;
//       }
//       case 2: {
//         newState = !this.projectsFollow[i];
//         addFlag = this.userService.toggleFollow(newState, itemId, 2);
//         break;
//       }
//       // case 3: newState = (this.positions[i].apply[0].status == 1) ? false : true; break;
//       case 4: {
//         newState = !this.groupsFollow[i];
//         addFlag = this.userService.toggleFollow(newState, itemId, 4);
//         break;
//       }
//       case 5: {
//         newState = !this.peoplesFollow[i];
//         addFlag = this.userService.toggleFollow(newState, itemId, 5);
//         break;
//       }
//     }
//
//     if (addFlag) {
//       this.streamFollow[i] = 3;
//       await this.peopleService.toggleFollow(j, m, itemId, newState);
//       switch (mode) {
//         // case 0: this.publications[i].followStatus=newState; break;
//         case 1: this.resourcesFollow[i] = newState; break;
//         case 2: this.projectsFollow[i] = newState; break;
//         // case 3: this.positions[i].apply[0].status = newState ? 1 : 0; break;
//         case 4: this.groupsFollow[i] = newState; break;
//         case 5: this.peoplesFollow[i] = newState; break;
//       }
//       this.streamFollow[i] = 0;
//     } else {
//       this.upgradeMode = 1;
//       this.toggleUpgrade.nativeElement.click();
//     }
//   }
//
// }
//
// async groupAdminFollow(index: number[], groupId: string) {
//   // index[0] - follow as
//   // index[1] - group to follow
//   const adminGroupId: string = this.userService.userPositions[index[0]].group.group._id;
//   let toFollow: boolean;
//   toFollow = !this.groupsAdminFollow[index[1]][index[0]];
//   this.streamAdminFollow[index[1]][index[0]] = 3;
//   await this.groupService.toggleFollow(adminGroupId, groupId, toFollow);
//   this.groupsAdminFollow[index[1]][index[0]] = toFollow;
//   this.streamAdminFollow[index[1]][index[0]] = 0;
// }
//
// peopleMessage(userMessage: People) {
//   this.userService.newChannel = { _id: null, block: 0, usersIds: [userMessage._id], users: [userMessage], unread: 0, type: 0, message: {_id: null, type: null, userId: null, text: null, file: null, date: null } };
//   this._router.navigate(['/messages']);
// }
