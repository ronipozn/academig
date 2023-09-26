var db = require('../db.ts'),
    async = require('async'),
    backhelp = require("./backend_helpers.ts");

var ObjectID = require('mongodb').ObjectID;

var groups = require("./groups.ts");
var group_delete_data = require("./groups_delete.ts");

var universities = require("./universities.ts");
var peoples = require("./peoples.ts");
var positions = require("./positions.ts");
var news = require("./news.ts");
var searches = require("./searches.ts");
var emails = require("../misc/emails.ts");

import {groupComplex, complexName, Rank, Countries} from '../models/shared.ts';

const algoliasearch = require('algoliasearch');
const client = algoliasearch('TDKUK8VW4T', '5d17934a8722069c0ac47bd6b4ae4bda');

exports.version = "0.1.0";

export function change_stage(data, groupId: string, userId: string, stage: number, adminFlag: boolean, callback) {
  const universityId = data.university ? data.university._id : null;
  const departmentId = data.department ? data.department._id : null;

  const welcome: number = (data.newStage==2) ? 1 : 0;
  var deleteDepartment: number = 0;
  var groupLink: string;
  var popFlag: number;

  if (stage==3 || data.newStage==3 || stage==9 || data.newStage==9) { // to On Hold (set by User / Admin)
    popFlag = 4;
  } else {
    if (data.newStage==0) { // Under Review (1) => New (0)
      popFlag = (stage==-1) ? 0 : 1;
    } else if (data.newStage==1 || data.newStage==2) { // New (0) => Under Review (1) => Published (2)
      popFlag = 2;
    } else if (data.newStage==6 || data.newStage==8 || data.newStage==11) { // Published (2) => Delete (6) // Under Review (1) => Admin Decline (8) // Published (0) => PI Reject Invitation (11)
      popFlag = 3;
    } else if (data.newStage==5) { // Build from Scratch (5)
      popFlag = 5;
    } else if (data.newStage==7) { // Under Review (1) => Admin Improve (7)
      popFlag = 7;
    } else if (data.newStage==10) { // Under Review (0) => PI Approve Invitation (10)
      popFlag = 8;
    }
  }

  console.log('currentStage',stage,'newStage',data.newStage,'adminFlag',adminFlag)

  async.series({
    // Not Parallel in order to delete University Instance
    // before deleting Univeristy Document, notify before deleting Group (etc)

    notify: function (cb) {
      console.log('C1')

      if (stage!=3 && stage!=9 && (data.newStage==0 || data.newStage==2 || data.newStage==6 || data.newStage==7 || data.newStage==8 || data.newStage==10 || data.newStage==11)) {

        // at this point there are only super admins (except for Delete)
        groups.get_group_link(groupId, function(err, groupItem) {
          groups.groupMembers(groupId, 1, function (err, peoples) {
            async.forEachOf(peoples, function (people, key, callback) {

              async.series({

                news: function (cb) { // News: new research lab profile
                  console.log('C1.1')
                  if ((people.positions[0].mode==2 || adminFlag) && data.newStage==2 && key==0) { // Put news only Once and only after Academig Approve
                    news.add_activity(0, people._id, 1000, groupId, groupId, groupId, [], groupItem.homePageItems.background, groupItem.homePageItems.intrests, groupItem.homePageItems.pic, false, function (err) {
                      cb(err)
                    });
                  } else {
                    cb()
                  }
                },

                follow: function (cb) {
                  console.log('C1.2')
                  if (data.newStage==2) {
                    news.follow_many(groupId, people._id, function (err) {
                      cb(err)
                    })
                  } else {
                    cb()
                  }
                },

                notification: function (cb) {
                  console.log('C1.3')
                  if (data.newStage==2) { // Admin approve
                    news.add_notification("Academig", 3000, groupId, people._id, people._id, [], data.text, null, null, function (err, newsId) { cb(err) })
                  } else if (data.newStage==6) { // User delete
                    news.add_notification(userId, 1200, people._id, people._id, people._id, [], data.text, groupItem.groupIndex.group.name, null, function (err, newsId) { cb(err) })
                  } else if (data.newStage==7) { // Admin imrpvoe
                    news.add_notification("Academig", 3001, groupId, people._id, people._id, [], data.text, null, null, function (err, newsId) { cb(err) })
                  } else if (data.newStage==8) { // Admin decline
                    news.add_notification("Academig", 3002, people._id, people._id, people._id, [], data.text, groupItem.groupIndex.group.name, null, function (err, newsId) { cb(err) })
                  // } else if (data.newStage==9) { // Admin delete
                    // news.add_notification("Academig", 3003, groupId, people._id, null, [], data.text, groupItem.groupIndex.group.name, null, function (err, newsId) { cb(err) })
                  } else {
                    cb()
                  }
                },

                email: function (cb) {
                  console.log('C1.4')

                  groupLink = groupItem.groupIndex.university.link + '/' + groupItem.groupIndex.department.link + '/' + groupItem.groupIndex.group.link;

                  if (data.newStage==2) {

                    if (stage==-1) { // Built For You

                      if (adminFlag) {
                        emails.builtGroupEmail(groupLink,
                                               groupItem.groupIndex.group.name,
                                               groupItem.groupIndex.university.link + '/' + groupItem.groupIndex.department.link,
                                               groupItem.groupIndex.department.name,
                                               groupItem.groupIndex.university.name,
                                               data.text,
                                               people.personalInfo.email,
                                               people.name,
                        function (err) {
                          cb(err)
                        })
                      } else {
                        cb()
                      }

                    // if ((groupItem.onBehalf==8 || groupItem.onBehalf==9) && key==0) { // Job Posting
                    // } else if ((groupItem.onBehalf==2 || groupItem.onBehalf==3) && key==0) { // On Behalf
                    } else if ((groupItem.onBehalf==2 || groupItem.onBehalf==3) && people.positions[0].status==6) { // On Behalf

                      // emails.piOnBehalfInvite(peoples[1].name,
                      //                         peoples[1].pic,
                      //                         peoples[1]._id,
                      //                         peoples[1].positions[0].email.address,
                      //                         peoples[1].positions[0].titles[0],
                      //                         peoples[1].positions[0].period.start,
                      emails.piOnBehalfInvite(people.name,
                                              people.pic,
                                              people._id,
                                              people.positions[0].email.address,
                                              people.positions[0].titles[0],
                                              people.positions[0].period.start,
                                              people.name,
                                              people.positions[0].email.address,
                                              groupLink,
                                              groupItem.groupIndex.group.name,
                                              groupItem.groupIndex.university.name,
                      function (err) {
                        cb(err)
                      })

                    } else if (groupItem.onBehalf!=6 && groupItem.onBehalf!=7) { // Group Accepted

                      emails.createGroupEmail(data.newStage,
                                              data.text,
                                              people.personalInfo.email,
                                              people.name,
                                              people.positions[0].titles[0],
                                              groupItem.groupIndex.group.name,
                                              groupItem.groupIndex.department.name,
                                              groupItem.groupIndex.university.name,
                                              groupLink,
                                              groupItem.groupIndex.university.link + '/' + groupItem.groupIndex.department.link,
                      function (err) {
                        cb(err)
                      })

                    } else {
                      cb()
                    }

                  } else if (data.newStage==6) {

                    if ((groupItem.onBehalf==6 || groupItem.onBehalf==7) && adminFlag) {
                      cb()
                    } else {
                      const actorName: string = peoples.find(r => r._id==userId).name;
                      emails.deleteGroupEmail(actorName, people.name, groupItem.groupIndex.group.name, (people._id==userId), 0, people.personalInfo.email, function (err) { cb(err) })
                    }

                  } else if ((data.newStage==10 || data.newStage==11) && people._id!=userId) {

                    const actorName: string = peoples.find(r => r._id==userId).name;
                    emails.piOnBehalfResponse(actorName, groupItem.groupIndex.group.name, (data.newStage==10) ? 0 : 1, people.personalInfo.email, function (err) { cb(err) })

                  } else {
                    cb()
                  }

                }

              },
              function (err, results) {
                callback(err);
              })

            }, function (err) {
              cb(err);
            });
          });
        });
      } else {
        cb();
      }
    },

    group: function (cb) {
      console.log('C2',popFlag)

      // FIX: merge
      if (popFlag==0) {
        db.groups
          .find({_id: ObjectID(groupId)})
          .project({_id: 0, "stage": 1})
        .next().then(function(item) {
          if (item.stage==-1) {
            db.groups.updateOne(
               { _id: ObjectID(groupId) },
               { $set: { "stage": data.newStage, "welcome": welcome } },
               { safe: true }
             ).then(function(item) {
               // groups.delete_member(userId, groupId, "Academig", 0, 0, false, function (err) { // FIX?
                 cb()
               // });
             })
           } else {
             cb()
           }
        })

      } else if (popFlag==1) {
        db.groups.updateOne(
           { _id: ObjectID(groupId) },
           { $set: { "stage": data.newStage, "welcome": welcome }, $pop: { "dates": 1 } },
           { safe: true },
           cb()
        )

      } else if (popFlag==2) {

        const labCompany: number = (data.university.name=='company') ? 1 : 0;
        const department: complexName = { "_id": departmentId, "name": data.department.name, "link": data.department.link, "pic": data.department.pic };
        const university: complexName = { "_id": universityId, "name": data.university.name, "link": data.university.link, "pic": data.university.pic };

        update_algolia(groupId, department, university, labCompany, groupLink, data.newStage, welcome, function (err, id) {
          cb(err)
        });

      } else if (popFlag==3) { // Delete
        db.groups.updateOne(
          { _id: ObjectID(groupId) },
          { $set: {"stage": data.newStage} },
          { safe: true },
        ).then(function(item) {
          group_delete_data.delete_group(groupId, userId, function (err, id) {
            cb(err)
          });
        })

      } else if (popFlag==4) { // On Hold
        db.groups.updateOne(
          { _id: ObjectID(groupId) },
          { $set: {"stage": data.newStage} },
          { safe: true },
          cb()
        )

      } else if (popFlag==5) { // From Scratch
        db.groups.updateOne(
          { _id: ObjectID(groupId) },
          { $set: {"stage": data.newStage} },
          { safe: true },
        ).then(function(item) {
          group_delete_data.from_scratch_group(groupId, userId, function (err, id) {
            cb(err)
          });
        })

      } else if (popFlag==7) { // Improve
        db.groups.updateOne(
          { _id: ObjectID(groupId) },
          {
            $set: {"stage": data.newStage},
            $pop: { "dates": 1 }
          },
          { safe: true },
          cb()
        )

      } else {
        cb();
      }
    },

    groupInstance: function (cb) {
      console.log('3')
      if (popFlag==3) {
        db.departments.updateOne(
          {_id: ObjectID(departmentId)},
          { $pull: { groupsItems: ObjectID(groupId) } },
          { safe: true },
          cb()
        )
      } else {
        cb();
      }
    },

    departmentDocument: function (cb) {
      console.log('4')
      if (welcome==1 && departmentId) {
        news.follow_feed(groupId, departmentId, 4, 0, function (err, newsId) {
          cb(err);
        });
      } else if (popFlag==3 && departmentId) {
        db.departments
          .find({_id: ObjectID(departmentId)})
          .project({_id: 0, "departmentIndex.department.link": 1})
        .next().then(function(item) {
          db.departments.deleteOne(
             { _id: ObjectID(departmentId), stage: 0, groupsItems: {$size: 0}},
             { safe: true }, function(err, docsRemoved) {
               deleteDepartment = docsRemoved.deletedCount;
               cb(err);
             }
          )
        });
      } else {
        cb();
      }
    },

    departmentInstance: function (cb) {
      console.log('5')
      if (popFlag==3 && deleteDepartment==1) {
        db.universities.updateOne(
          { _id: ObjectID(universityId) },
          { $pull: { ['departmentsItems.departments']: { "_id": ObjectID(departmentId) } } },
          { safe: true },
          cb()
        )
      } else {
        cb();
      }
    },

    universityDocument: function (cb) {
      console.log('6', data.universityDescription)

      if (welcome==1 && departmentId && universityId) {
        news.follow_feed(groupId, universityId, 4, 0, function (err) {
          db.universities.updateOne(
           { $and: [ {"_id": ObjectID(universityId)}, {"departmentsItems.departments._id": ObjectID(departmentId)} ]},
           { $set: {
              "stage": 1,
              "departmentsItems.departments.$.stage": 1,
             }
           },
           { safe: true }
           ).then(function(item) {
             db.universities_query.updateOne(
                { "academigId": ObjectID(universityId) },
                { $set: {
                    "name": data.university.name,
                    "link": data.university.link
                  }
                },
                { safe: true },
                cb(err)
             )
           })
        });

      } else if (popFlag==3 && universityId) {
        cb();

      } else {
        cb();
      }
    }

  },
  function (err, results) {
    callback(err, null);
  });
}

export function update_algolia(groupId: string, department: complexName, university: complexName, labCompany: number, groupLink: string, newStage: number, welcome: number, callback) {
  // TBD
  db.groups.findOneAndUpdate(
    { _id: ObjectID(groupId) },
    {
      $set: {
        "stage": newStage,
        "welcome": welcome
      },
      $push: {
        "dates": new Date()
      }
    },
    function(err, doc) {
      const item = doc.value;
      const countries = Countries;

      const groupIndex: groupComplex = {
        "group": item.groupIndex.group,
        "department": department,
        "university": university,
      };

      universities.universities_rank([ObjectID(university._id)], function (err, ranksObj) {

        const rankObj = ranksObj[0].rank;

        const rank: Rank = Object.assign(
          (rankObj && rankObj.times) ? {"times": rankObj.times} : {},
          (rankObj && rankObj.shanghai) ? {"shanghai": rankObj.shanghai} : {},
          (rankObj && rankObj.top) ? {"top": rankObj.top} : {},
          (rankObj && rankObj.usnews) ? {"usnews": rankObj.usnews} : {},
          (item.rank && item.rank.facebook) ? {"facebook": item.rank.facebook} : {},
          (item.rank && item.rank.twitter) ? {"twitter": item.rank.twitter} : {},
          (item.rank && item.rank.linkedin) ? {"linkedin": item.rank.linkedin} : {},
          (item.rank && item.rank.instagram) ? {"instagram": item.rank.instagram} : {},
          (item.rank && item.rank.youtube) ? {"youtube": item.rank.youtube} : {},
        )

        peoples.peoples_list(item.peoplesItems.activesIds, groupId, null, 6, true, function (err, peoplesObj) {

          var unshiftFlag: boolean = false;

          peoplesObj.forEach((people, index) => {
            if (index==0 && people.positions[0].titles[0]>=150) unshiftFlag = true;
            people.title = peoples.titlesTypes(people.positions[0].titles[0]);
            delete people.positions
          })

          if (unshiftFlag) peoplesObj.unshift([]);

          positions.positions_list(item.positionsItems.positionsIds, null, 2, 0, true, function (err, positions) {
            // projects.projects_list(item.peoplesItems.activesIds, groupId, null, 1, function (err, peoples) {
            // resources.resources_list(item.peoplesItems.activesIds, groupId, null, 1, function (err, peoples) {

            // if (positions.standout==3) position["pin"] = 1;
            // console.log('homePageItems',item.homePageItems)

            const object = [{
              objectID: groupId,
              dates: [new Date()],
              name: item.groupIndex.group.name,
              pic: item.homePageItems.pic,
              groupIndex: groupIndex,
              interests: item.homePageItems.intrests,
              topic: item.homePageItems.topic,
              score: item.score,
              rank: rank,
              size: item.homePageItems.size ? Number(item.homePageItems.size) : null,
              establish: item.homePageItems.establish ? new Date(item.homePageItems.establish).getFullYear() : null,
              peoples: peoplesObj,
              positions: positions,
              // projects: projects,
              // resources: resources,
              country: item.country ? countries[countries.findIndex(y => y.id == item.country)].name : null,
              state: item.state ? item.state : null,
              city: item.city ? item.city : null,
              _geoloc: (item.location && item.location[0]) ? { lat: item.location[0], lng: item.location[1] } : { lat: '', lng: '' }
            }];

            var algoliaIndex;

            if (labCompany) {
              algoliaIndex = client.initIndex((process.env.PORT) ? 'companies': 'dev_companies');
            } else {
              algoliaIndex = client.initIndex((process.env.PORT) ? 'labs': 'dev_labs');
            }

            algoliaIndex.addObjects(object, (err, content) => {
              searches.query_search('lab', groupId, groupLink, object[0].country, object[0].state, object[0].city, item.groupIndex.university.name, item.groupIndex.department.name, item.groupIndex.group.name, object[0].size, object[0].establish, object[0].interests, [], function (err) {
                callback(err);
              })
            });

          });
        });
      });

    }
  )
}
