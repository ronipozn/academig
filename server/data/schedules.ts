var db = require('../db.ts'),
    async = require('async'),
    backhelp = require("./backend_helpers.ts");

var ObjectID = require('mongodb').ObjectID;
// var ISODate = require('mongodb').ISODdate;

var publication_misc = require("../misc/publications.ts");
var sendgrid_misc = require("../misc/sendgrid.ts");

var publications = require("./publications.ts");
var invites = require("./invites.ts");
var group = require("./groups.ts");
var news = require("./news.ts");

import {objectMiniEmail} from '../models/shared.ts';
var emails = require("../misc/emails.ts");

const algoliasearch = require('algoliasearch');
const client = algoliasearch('TDKUK8VW4T', '5d17934a8722069c0ac47bd6b4ae4bda');

var moment = require('moment');

exports.version = "0.1.0";

export function push_authors(names: string[], authorsEmails: string[], itemId: string, callback) {
  var authorObj: any[] = []

  authorsEmails.forEach((email, i) => {
    if (email && email!=undefined) {
      console.log('name', names[i], 'email', email);
      authorObj.push({
        "name": names[i],
        "email": email,
        "itemId": itemId,
        "count": 2
      })
    }
  });

  if (authorObj.length>0) {
    db.schedules.insertMany(
      authorObj,
      { safe: true },
      callback()
    )
  } else {
    callback()
  }
}

export function inviteSchedule() {
  var author: objectMiniEmail;

  var nextDate: string = moment().subtract(3, 'days');

  db.schedules.aggregate([
    { $match: { $or: [ { "date": { "$exists": false } }, { "date": { $lte : new Date(nextDate) } } ] } },
    { $sample: { size: 4 } },
    { $project: { name: 1, email: 1, authorId: 1, itemId: 1, count: 1 } }
  ]).toArray().then(function(items) {

    // console.log('schedulesItem',items)

    async.forEachOfSeries(items, function (item, key, cb) {

      console.log('scheduleItem',key, item)

      if (process.env.PORT && item) {

        const author: objectMiniEmail = {
          _id: item.authorId, // null,
          name: item.name,
          pic: null,
          email: item.email,
          message: null,
          dates: null
        }

        invites.post_invite(author, item.itemId, 'academig', 11, function (err, authorId) {
          if (item.count==0) {
            db.schedules.deleteOne(
              { _id: ObjectID(item._id) },
              { safe: true },
              cb()
            );
          } else {
            db.schedules.updateOne(
              { _id: ObjectID(item._id) },
              { $set: { "date": new Date(), "authorId": ObjectID(authorId) },
                $inc: { "count": -1 }
              },
              { safe: true },
              cb()
            );
          }
        })

      } else {
        cb()
      }

    }, function (err) {
      // NOTHING
    })

  })
}

// https://stackoverflow.com/questions/51647245/use-gte-and-lte-mongo-operator-if-date-is-in-string-format-in-mongodb
export function jobSchedule() {

  var algoliaIndex = client.initIndex((process.env.PORT) ? 'labs': 'dev_labs');

  async.parallel({

    // 1. find pinned labs & set pin=0
    pinned: function (cb) {
      const nextPinDate: string = moment().add(30, 'days');
      // console.log('nextPindDate',new Date(nextPindDate))

      db.positions
        .find({ "payment": true, "pin": 1, "created_on": { $gte: new Date(nextPinDate) } })
        .project({_id: 1, groupId: 1})
      .toArray().then(function(items) {
        if (items) {
          const groupsIds = items.map(r=>r.groupId.toString());
          const positionsIds = items.map(r=>r._id.toString());
          algoliaIndex.getObjects(groupsIds).then((content) => {
            // attributesToRetrieve: ['firstname', 'lastname']
            // console.log("content.results",content.results)
            async.forEachOf(content.results, function (groupObj, i, callback) {
              if (groupObj) { // before new lab is approved, no algolia object
                const index = groupObj.positions.findIndex(y => y._id == positionsIds[i]);
                if (index>-1) {
                  delete groupObj.positions[index].pin; // groupObj.positions[index].pin = 0;
                  // console.log("groupObj.positions",groupObj.positions)
                  algoliaIndex.partialUpdateObject({
                    objectID: groupsIds[i],
                    positions: groupObj.positions
                  }, (err) => {
                    group.groupMembers(groupsIds[i], 4, function (err, admins) {
                      const adminEmails = admins.map(r => r.personalInfo.email);
                      console.log('adminEmails',adminEmails)
                      // console.log('groupObj',groupObj)
                      emails.pinJobEmail(groupObj.groupIndex.group.link, groupObj.groupIndex.group.name, adminEmails, groupObj.positions[index]._id, groupObj.positions[index].title, groupObj.positions[index].positionName, function (err) {
                        callback(err)
                      })
                    })
                  });
                } else {
                  callback(null)
                }
              } else {
                callback(null)
              }
            }, function (err) {
              console.log('PINNED')
              db.positions.updateMany(
                { "created_on": { $gte: new Date(nextPinDate) }, "payment": true, "pin": 1},
                { $set: { "pin": 0 } },
                { multi: true, safe: true },
                cb(err)
              )
            })
          });
        } else {
          cb();
        }
      });
    },

    // 2. Reminders
    // payment_reminders: function (cb) { // Billing was unsuccessful
    //   db.positions
    //     .find({ "payment": false })
    //     .project({_id: 1, groupId: 1})
    //   .toArray().then(function(items) {
    //     // paymentReminderJobEmail
    //     console.log('PAYMENT REMINDERS', items)
    //     cb();
    //   })
    // },

    // invites_reminders: function (cb) {
    //   db.invites
    //     .find({ "invites.mode": 0 })
    //     .project({groupId: 1})
    //   .toArray().then(function(items) {
    //     // inviteReminderJobEmail
    //     console.log('INVITES REMINDERS', items)
    //     cb();
    //   })
    // }

  },
  function (err) {
    console.log("Job Scheduler DONE")
  });
};

export function publicationsSuggestionSchedule() {
  async.waterfall([

    function (cb) {
      sendgrid_misc.getGroupSuppressions(14620, function (err, emails) {
        cb(err, emails)
      })
    },

    function (emails: string[], cb) {
      db.peoples.aggregate([
        { $match: {
          stage: 2,
          "personalInfo.email": { $nin: emails },
          $or: [ { "publications.suggestions.date": { "$exists": false } }, { "publications.suggestions.date": { $lte : new Date() } } ]
        } },
        { $sample: { size: 1 } },
        { $project: { _id: 1, name: 1, pic: 1, suggestions_id: 1, "personalInfo.email": 1 } }
      ]).next(cb)
    },

    function (user, cb) {
      publication_misc.retrieveSuggestions(1, user._id, function (err, publicationsIds) {
        if (publicationsIds.length>0) {
          publications.publications_list(publicationsIds, null, null, 0, 0, false, function (err, publications) {
            emails.publicationsSuggestionEmail(publications, user._id, user.name, user.personalInfo.email, function (err) {
              db.peoples.updateOne(
                { _id: user._id },
                {
                  $set: { "publications.suggestions.date": new Date() },
                  $push: { "logging.suggestions": {"date": new Date(), "ids": publicationsIds} }
                },
                { safe: true },
                cb(err)
              );
            });
          })
        } else {
          db.peoples.updateOne(
            { _id: user._id },
            {
              $set: { "publications.suggestions.date": new Date() },
              $push: { "logging.suggestions": {"date": new Date(), "ids": null} }
            },
            { safe: true },
            cb(err)
          );
        }
      });
    }

  ],
  function (err, people_id) {
    console.log("Academig Publications Suggestion Scheduler DONE")
  });
}

export function updatesSchedule() {
  async.waterfall([

    function (cb) {
      sendgrid_misc.getGroupSuppressions(9975, function (err, emails) {
        cb(err, emails)
      })
    },

    function (emails: string[], cb) {
      db.peoples.find({stage: 2, "personalInfo.email": { $nin: emails } })
                .project({_id: 1, name: 1, pic: 1, updates_id: 1, "personalInfo.email": 1})
                .toArray(cb)
    },

    function (users, cb) {
      async.eachOfLimit(users, 1, function (user, index, callback) {
        news.news_updates(user._id, user.updates_id, 0, 20, 'timeline', function (err, news) {
          console.log('user._id, ',user._id)
          console.log('updates',news)
          if (err) {
            db.peoples.updateOne(
              { _id: user._id },
              { $set: { "updates_id": (news[0] ? news[0].id: null) } },
              { safe: true },
              callback(err)
            );
          } else if (news.length==0) {
            callback(err)
          } else {
            emails.updatesEmail(news, user.personalInfo.email, function (err) {
              db.peoples.updateOne(
                { _id: user._id },
                {
                  $set: {  "updates_id": (news[0] ? news[0].id: null) },
                  $push: { "logging.updates": {"date": new Date(), "news": news} },
                },
                { safe: true },
                callback(err)
              );
            });
          }
        });
      },
      function (err) {
        cb(err)
      });
    }

  ],
  function (err, people_id) {
    console.log("Academig Updates Scheduler DONE")
  });
};

// private = function (user: objectMini,
                     // membersEmails: string[],
                     // type: number,
                     // parentId: string,
                     // itemId: string,
                     // itemTitle: string,
                     // itemMessage: string,
                     // itemPic: string,
                     // callback) {
//
//   // parentName, itemMessage, , itemType, /{{parentLink}}/{{itemPage}}
//   group_data.get_group_link(parentId, function (err, groupItem) {
//     const groupLink: string = groupItem.groupIndex.university.link + '/' + groupItem.groupIndex.department.link + '/' + groupItem.groupIndex.group.link;
//     let itemType, itemPage: string;
//     switch (type) {
//       case 16000: itemType = "Lab News"; itemPage="private/news"; break;
//       case 16001: itemType = "Lab Comment"; itemPage="private/news"; break;
//       case 16100: itemType = "Lab Meetings"; itemPage="meetings"; break;
//       case 16200: itemType = "Lab Reports"; itemPage="reports"; break;
//       case 16400: itemType = "Lab Chat"; itemPage="chat"; break;
//     }
//     const msg = {
//       to: followersEmails,
//       from: parentName + ' via Academig <support@academig.com>',
//       subject: parentName + ' ' + itemType,
//       category: "New Private",
//       templateId: 'b59fb3e6-4bd2-4a5f-9d7d-31468be143d8',
//       substitutions: {
//         // parentId: parentId,
//         parentName: parentName,
//         parentPic: parentPic,
//         parentLink: parentLink,
//         userId: user._id,
//         userName: user.name,
//         userPic: user.pic,
//         // parentType: 'personal academic website', // can also be Group, Department, University
//         itemId: itemId,
//         itemType: itemType,
//         itemPage: itemPage,
//         itemTitle: itemTitle,
//         itemMessage: itemMessage,
//         itemPic: itemPic || ""
//       },
//     };
//   });
// }
