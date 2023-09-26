var helpers = require('./helpers.ts');
var async = require("async");

var publication_data = require("../data/publications.ts");
var resource_data = require("../data/resources.ts");
var project_data = require("../data/projects.ts");
var position_data = require('../data/positions.ts');

var group_data = require("../data/groups.ts");

import { groupComplex, complexName, Analytics } from '../models/shared.ts';

exports.overallAnalyticsById = function (req, res) {
  var getp = req.query;

  group_data.group_items_ids("analyticsItems", getp.id, function (err, items) {
    if (err) {
      helpers.send_failure(res, 500, err);
      return;
    }
    setTimeout(() => {
      helpers.send_success(res, items);
    }, 300)
  });
}

exports.analyticsById = function (req, res) {
  var getp = req.query;
  var type = parseInt(getp.type);
  var mediaId;

  async.waterfall([
    function (callback) {
      switch (type) {
        case 1: // Publications
          group_data.group_items_ids("publicationsItems", getp.id, function (err, items) {
            callback (null, items.publicationsIds);
          });
          break;
        case 2: // Resources
          group_data.group_items_ids("resourcesItems", getp.id, function (err, items) {
            callback (null, items.resourcesIds);
          });
          break;
        case 3: // Projects
          group_data.group_items_ids("projectsItems", getp.id, function (err, items) {
            callback (null, items.currentProjectsIds);
          });
          break;
        case 4: // Positions
          group_data.group_items_ids("positionsItems", getp.id, function (err, items) {
            callback (null, items.positionsIds);
          });
          break;
      }
    },
    function (itemsIds, callback) {
      console.log('itemsIds',itemsIds)

      switch (type) {
        case 1: // Publications
          publication_data.publications_analytics(itemsIds, callback)
          break;
        case 2: // Resources
          resource_data.resources_analytics(itemsIds, callback)
          break;
        case 3: // Projects
          project_data.projects_analytics(itemsIds, callback)
          break;
        case 4: // Positions
          position_data.positions_analytics(itemsIds, callback)
          break;
      }
    }
  ],
  function (err, results) {
    console.log('res',results)
    if (err) {
        helpers.send_failure(res, 500, err);
        return;
    }
    helpers.send_success(res, results);
  });
}

// for (let resourcesGroup of this.resourcesItems.resourcesGroups) {
//   this.resourcesIds = this.resourcesIds.concat(resourcesGroup.resourcesIds);
// }

// this.resourcesAnalytics = this.resourceService.getResourcesAnalyticsByIds(this.resourcesIds);
// this.projectsAnalytics = this.projectService.getProjectsAnalyticsByIds(this.projectsItems.projectsIds);
// this.positionsAnalytics = this.positionService.getPositionsAnalyticsByIds(this.positionsItems.positionsIds);

// .map(r => new ResourceAnalytics(r.id, r.title, r.views, r.downloads));
// .map(r => new ProjectAnalytics(r.id, r.title, r.views,null));
// .map(r => new PositionAnalytics(r.id, r.title, r.views, r.applied));

// *************** Group Analytics ***************

// All Number arrays: Yesterday
                   // 7 Days
                   // 30 Days
                   // 12 Months
                   // All Time

// export class analyticsItems {
//   constructor(
//     public groups: groupPrivateAnalytic[],
//     public fields: Analytics[],
//     public positions: Analytics[]
//   ) {}
// }

export class groupPrivateAnalytic {
  constructor(
    public groupComplex: groupComplex,
    public views: number[],
  ){}
}

// var groupsDB = [
//   {
//     "id": 1000000,
//     "analyticsItems": [{
//       groups:
//         [
//           new groupPrivateAnalytic(new groupComplex(new complexName("Donnelly Lab","donnellylab","mit_physics_2",1000001),
//                                                     new complexName("Neuroscience","neuroscience",null,1000000),
//                                                     new complexName("MIT","mit",null,1000000),
//                                                    ), [5,9, 26, 126, 512]),
//           new groupPrivateAnalytic(new groupComplex(new complexName("Dourmashkin Group","dourmashkingroup","mit_physics_3",1000002),
//                                                     new complexName("Neuroscience","neuroscience",null,1000000),
//                                                     new complexName("MIT","mit",null,1000000),
//                                                    ), [25, 39, 48, 98, 112]),
//           new groupPrivateAnalytic(null, [5, 15, 35, 55, 1002]),
//         ],
//       fields:
//         [
//           new Analytics(1, "Nano Medicine", [3, 9, 13, 18, 32],null),
//           new Analytics(2, "Nano Virology", [6, 9, 13, 15, 18],null),
//           new Analytics(3, "Nano Immunity", [11, 19, 29, 38, 52],null),
//           new Analytics(0, "Not listed", [16, 19, 22, 25, 28],null),
//         ],
//       positions:
//         [
//           new Analytics(1, "Undergraduates", [2, 3, 4, 5, 6],null),
//           new Analytics(2, "Graduates", [11, 22, 33, 44, 55],null),
//           new Analytics(3, "Post-Docs", [4, 25, 33, 54, 61],null),
//           new Analytics(0, "Not listed", [10, 20, 30, 50, 80],null),
//         ],
//     }]
//   },
//   {
//     "id": 1000001,
//     "analyticsItems": [null]
//   },
//   {
//     "id": 1000002,
//     "analyticsItems": [null]
//   },
//   {
//     "id": 1000003,
//     "analyticsItems": [null]
//   },
//   {
//     "id": 1000004,
//     "analyticsItems": [null]
//   },
//   {
//     "id": 1000005,
//     "analyticsItems": [null]
//   },
//   {
//     "id": 1000006,
//     "analyticsItems": [null]
//   },
//   {
//     "id": 1000007,
//     "analyticsItems": [null]
//   },
//   {
//     "id": 1000008,
//     "analyticsItems": [null]
//   },
//   {
//     "id": 1000009,
//     "analyticsItems": [null]
//   },
//   {
//     "id": 1000010,
//     "analyticsItems": [null]
//   },
//   {
//     "id": 1000011,
//     "analyticsItems": [null]
//   }
// ];
