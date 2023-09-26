var db = require('../db.ts'),
    async = require('async'),
    backhelp = require("./backend_helpers.ts");

var ObjectID = require('mongodb').ObjectID;

import { complexName, groupComplex, Countries } from '../models/shared.ts';

var emails = require("../misc/emails.ts");
var payments = require("./payments.ts");

var groups = require("./groups.ts");
var peoples = require("./peoples.ts");
var news = require("./news.ts");

var moment = require('moment');

const algoliasearch = require('algoliasearch');
const client = algoliasearch('TDKUK8VW4T', '5d17934a8722069c0ac47bd6b4ae4bda');

exports.version = "0.1.0";

export function change_group_institute(data, groupId: string, currentDepartmentId: string, callback) {
  async.waterfall([

    // 1. update groupIndex
    function (cb) {

      var department: complexName = data.department;
      department._id = ObjectID(department._id);

      var university: complexName = data.university;
      university._id = ObjectID(university._id);

      db.groups.updateOne(
         {_id: ObjectID(groupId)},
         {
           $set: {
             "groupIndex.department": department,
             "groupIndex.university": university
           }
         },
         { safe: true },
         cb()
      )
    },

    // 2. pull from current Department
    function (cb) {
      db.departments.updateOne(
         { _id: ObjectID(currentDepartmentId)},
         { $pull: { "groupsItems": 1 } },
         { safe: true },
         cb()
      )
    },

    // 3. push to new Department
    function (cb) {
      db.departments.updateOne(
         { _id: ObjectID(data.department._id)},
         { $push: { "groupsItems": ObjectID(groupId) } },
         { safe: true },
         cb()
      )
    },

  ],
  function (err) {
    if (err) {
      callback(err);
    } else {
      callback(err, null);
    }
  });
};


export function push_group_approve(groupId: string, callback) {
  db.admin.insertOne(
    {"groupId": groupId},
    { w: 1, safe: true },
    callback()
  );
};

export function researcher_item_marketing(profileId: string, userId: string, msg: string, callback) {
  async.waterfall([

    // 1. Marketing Email
    function (cb) {
      console.log('M_P1')
      peoples.people_email(profileId, function (err, people) {
        // emails.profileMarketingInvite(people.name, people.personalInfo.email, url, pics, profileId, function (err) {
        emails.researcherMarketingInvite(people.name, people.personalInfo.email, null, null, profileId, function (err) {
          cb(err)
        })
      });
    },

    // 2. Update Profile
    function (cb) {
      console.log('M_P2')
      db.peoples.updateOne(
         {_id: profileId},
         {
           $inc: { "marketing.counter": 1 },
           $push: { "dates": new Date() },
           $set: {
             // "marketing.url": url,
             "marketing.text": msg,
             // "marketing.pics": pics,
           }
         },
         { safe: true },
         cb()
      )
    }

  ],
  function (err) {
    console.log('M_P3')
    callback(err);
  });
};

export function group_item_marketing(groupId: string, userId: string, msg: string, callback) {
  async.waterfall([

    // 1. retrieve Group link + OnBehalf Data
    function (cb) {
      console.log('Marketing_G1')
      groups.get_group_marketing(groupId, function(err, groupItem) {
        cb(err, groupItem)
      })
    },

    // 2. Marketing Email (to PI)
    function (groupItem, cb) {
      console.log('Marketing_G2')
      db.groups.findOneAndUpdate(
         { "_id": ObjectID(groupId) },
         {
           $inc: { "marketing.counter": 1 },
           $push: {
             "marketing.dates": new Date(),
             "marketing.user":  userId
           },
           $set: {
             // "marketing.url": url,
             "marketing.text": msg,
             // "marketing.pics": pics
           }
         },
         { projection: { "_id": 0, "marketing.counter" : 1 } }
      )
      .then(function(item) {
        if (item) {
          cb(null, groupItem, item.value.marketing ? item.value.marketing.counter : 0)
        } else {
          cb(null, groupItem)
        }
      })
    },

    // 3. Marketing Email (to PI)
    function (groupItem, counter: string, cb) {
      console.log('Marketing_G3')
      var groupLink = groupItem.groupIndex.university.link + '/' + groupItem.groupIndex.department.link + '/' + groupItem.groupIndex.group.link;
      peoples.peoples_list(groupItem.peoplesItems.activesIds, groupId, null, 5, function (err, peoples) {
        emails.piMarketingInvite(msg,
                                 [groupItem.groupIndex.university.pic], // pics,
                                 peoples[0].name,
                                 peoples[0].positions[0].email.address,
                                 groupLink,
                                 groupItem.groupIndex.group.name,
                                 groupItem.homePageItems.topic,
                                 groupItem.homePageItems.size,
                                 groupItem.homePageItems.establish, // {{items.establish | date: 'MMM y'}}
                                 groupItem.homePageItems.intrests,
                                 groupItem.groupIndex.university.name,
                                 groupItem.socialInfo,
                                 groupItem.publicInfo,
                                 counter,
                                 function (err) {
          cb(err)
        })
      });
    },

    // delete_marketer: function (cbParallel) {
    //   groups.delete_member(userId, groupId, userId, 0, 0, true, function (err) {
    //     console.log('M4')
    //     cbParallel(err)
    //   })
    // }

  ],
  function (err) {
    callback(err);
  });
};

export function universities_list(mode: number, text: string, id: string, flag: string, callback) {

  var collection: string;
  var m = {}, s, p, c;

  var reg = text ? (".*" + text + "*.") : null;

  if (mode==0) {

    collection = "universities";
    if (id) m['country'] = Number(id);

    p = { _id: 1, stage: 1, name: 1, link: 1, pic: 1, dates: 1, country: 1,
          categories: { $size: "$departmentsItems.categories" },
          departments: { $size: "$departmentsItems.departments" } };
    s = { dates : -1 };

  } else if (mode==1) {

    collection = "universities_query";
    if (id) m['country_id'] = id;

    m['academigId'] = { "$exists": ( flag ? true : false )};
    p = { _id: 1, name: 1, url: 1, country_id: 1, academigId: 1 };
    s = { name : 1 };

  }

  if (text) m['name'] = { $regex: new RegExp(reg), $options: 'i' };

  // https://stackoverflow.com/questions/20348093/mongodb-aggregation-how-to-get-total-records-count
  var curFind = db[collection].aggregate(
    [
     { $match: m },
     { $project: p },
     { $sort: s },
     { $facet: {
                // results: [{ $skip: skipPage }, { $limit: perPage }],
                results: [ { $limit: 200 } ],
                totalCount: [ { $count: 'count' } ]
               }
     }
    ]
  );

  curFind.limit(200).toArray().then(function(items) {
    callback(null, items ? items[0].results : null, (items && items[0].totalCount[0]) ? items[0].totalCount[0].count : 0)
  })
}

export function groups_ids(callback) {
  db.admin.find({}).project({_id: 0, groupId: 1}).toArray(callback);
}

export function groups_list(mode: number, groupsIds: string[], callback) {
  // "homePageItems.affiliations": 1
  db.groups
    .find((mode==1) ? { _id: { $in: groupsIds }, stripe_id: { $exists: false } } : { _id: { $in: groupsIds } })
    .project({_id: 1, "papersKit.status": 1, onBehalf: 1, currentWebsite: 1, buildPro: 1, stage: 1, dates: 1, marketing: 1, domain: 1, extScore: 1, intScore: 1, progress: 1, groupIndex: 1, club: 1, interview: 1})
    .toArray(callback);
}

export function positions_list(callback) {
  db.positions
    .find()
    .project({_id: 1, views: 1, feedback: 1, payment: 1, created_on: 1, title: 1, type: 1, position: 1, spotsAvailable: 1,
              stepsDates: 1, stepsEnables: 1, numReferees: 1
            })
    .toArray(callback);
}

export function position_details(positionId: string, callback) {
  db.positions
    .find({_id: ObjectID(positionId)})
    .project({_id: 1, views: 1, groupId: 1, payment: 1, created_on: 1, title: 1, type: 1, position: 1, internalId: 1, description: 1, spotsAvailable: 1,
              note: 1, filter: 1, stepsDates: 1, stepsEnables: 1, gradesRequired: 1, lettersRequired: 1, lettersGuidelines: 1, numReferees: 1,
              apply: 1, stats: 1})
    .next(callback);

    //   db.invites
    //     .find({ "invites.mode": 0 })
    //     .project({groupId: 1})
}

export function position_stats_push(positionId: string, stats: number[][], callback) {
  db.positions.findOneAndUpdate(
    { _id: ObjectID(positionId) },
    { $push: { "stats": stats } },
    { projection: { "groupId": 1, "title": 1, "positionName": 1 } },
    function(err, doc) {
      callback(err, doc.value.groupId, doc.value.title, doc.value.positionName);
    }
  );
}

export function position_stats_update(positionId: string, stat: number, index: number, callback) {
  db.positions.updateOne(
    {_id: ObjectID(positionId)},
    { $set: { ["stats." + index[0] + '.' + index[1]]: stat } },
    { safe: true },
    callback()
  )
}

export function post_candidate_filter_status(positionId: string, peopleId: string, status: number, callback) {
  db.positions.updateOne(
    { _id: ObjectID(positionId), "apply.id": peopleId },
    { $set: {"apply.$.filterStatus": Number(status) } },
    { safe: true },
    callback()
  )
};

export function post_candidate_filter_note(positionId: string, peopleId: string, note: string, callback) {
  db.positions.updateOne(
    { _id: ObjectID(positionId), "apply.id": peopleId },
    { $set: { "apply.$.filter": note } },
    { safe: true },
    callback()
  )
};

export function post_candidate_filter(positionId: string, mode: number, callback) {
  // Filtered candidates 7, 14, 30, 60 days

  db.positions
    // $lte: 13
    .find({"_id": ObjectID(positionId), "filter": true, "apply.filterStatus": { $gte: 11 } })
    .project({_id: 1, groupId: 1, title: 1, positionName: 1, "apply.$": 1})
  .forEach(function(item) {
    if (item==null) {
      callback()
    } else {
      async.forEachOf(item.apply, function (apply, key, cb) {
        console.log('apply',apply)
        db.positions.updateOne(
          { "_id": item._id, "apply.id": apply.id },
          { $set: {
            "apply.$.status": apply.filterStatus,
            "apply.$.filterStatus": 0
          } },
          cb()
        );
      }, function (err) {
        async.waterfall([

          // 1. create progressNotify (if !exist)
          function (cb) {
            groups.get_group_link(item.groupId, function (err, groupObj) {
              cb(err, groupObj.groupIndex, groupObj.peoplesItems.activesIds)
            })
          },

          // 2. update progressNotify
          function (groupIndex: groupComplex, activesIds: string[], cb) {

            const usersIds: string[] = activesIds.concat(item.apply.map(r=>r.id));

            console.log('activesIds',activesIds)
            console.log('usersIds',usersIds)

            const countries = Countries;

            const m = { "$match" : { $and: [{ "_id" : { "$in" : usersIds } }] } };
            const a = { "$addFields" : { "__order" : { "$indexOfArray" : [ usersIds, "$_id" ] } } };
            const s = { "$sort" : { "__order" : 1 } };
            const f = ({ "$project" : {
                        _id: 1, name: 1, pic: 1, stage: 1, country: 1, "personalInfo.email": 1,
                        positions: { $filter: { input: "$positions", as: "position", cond: { $eq: [ "$$position.groupId", ObjectID(groupIndex.group._id) ] } } }
                      }})

            db.peoples.aggregate( [ m, a, s, f ] ).toArray().then(function(users) {
              const admins=users.slice(0,activesIds.length).filter(r => r.positions[0].status>4);
              const adminsEmails: string[] = admins.map(r => r.personalInfo.email);
              var candidates: any[] = [];
              users.slice(activesIds.length).map(function(u, index) {
                console.log('u',u)
                u.countryFlag = u.country ? countries[countries.findIndex(y => y.id == u.country)].code : null,
                candidates[index] = Object.assign({}, u, item.apply[index])
              })
              console.log('users',users)
              console.log('admins',admins)
              console.log('candidates',candidates)
              cb(err, groupIndex, candidates, adminsEmails)
            })
          },

          function (groupIndex: groupComplex, candidates, adminsEmails: string[], cb) {
            var proposals: any[][] = []
            proposals[0] = candidates.filter(r=>r.filterStatus==11);
            proposals[1] = candidates.filter(r=>r.filterStatus==12);
            proposals[2] = candidates.filter(r=>r.filterStatus==13);

            emails.filteredJobEmail(proposals, 7, groupIndex.group.link, groupIndex.group.name, adminsEmails, item.positionId, item.title, item.positionName, function (err) {
              console.log('FILTERED')
              cb(err)
            })
          },

        ],
        function (err) {
          callback(err);
        });
      })
    }
  })
  // , function(err) {
  //   callback(err)
  // });
};

export function peoples_list_by_id(peopleId: string, callback) {
  db.peoples
    .find({ "_id": peopleId, "stage": { $gte: 1 } } )
    .project({_id: 1, name: 1, pic: 1, date: 1, stage: 1, "personalInfo.email": 1, progress: 1, progressNotify: 1, positions: 1})
    .toArray(callback);
}

export function peoples_list(more: number,
                             verifiedFlag: boolean = false,
                             challengesFlag: boolean = false,
                             librariesFlag: boolean = false,
                             domainsFlag: boolean = false,
                             followingsFlag: boolean = false,
                             updatesFlag: boolean = false,
                             suggestionsFlag: boolean = false,
                             callback) {

  // console.log('verifiedFlag',verifiedFlag,'librariesFlag',librariesFlag,'challengesFlag',challengesFlag,'domainsFlag',domainsFlag,'followingsFlag',followingsFlag,'updatesFlag',updatesFlag,'suggestionsFlag',suggestionsFlag)

  let f = { stage: { $gte: (verifiedFlag ? 2 : 1) } };
  let p = { _id: 1, name: 1, pic: 1, date: 1, stage: 1, "personalInfo.email": 1, progress: 1, progressNotify: 1, positions: 1 };

  if (challengesFlag) {
    f['challenge']= { $exists: true };
    p['challenge']=1;
  }

  if (librariesFlag) {
    f['library']= { $exists: true };
    p['library']=1;
  }

  if (domainsFlag) {
    f['domain']= 1;
  }

  if (followingsFlag) {
    f['followings.groupsIds']= { $ne: [] };
    p['followings']=1;
  }

  if (updatesFlag) {
    f['logging.updates']= { $exists: true };
    p['logging.updates']=1;
  }

  if (suggestionsFlag) {
    f['logging.suggestions']= { $exists: true };
    p['logging.suggestions']=1;
  }

  var curFind = db.peoples.find(f).project(p).sort({date:-1});

  curFind.count(function (e, count) {
    console.log('more',more)
    if (more==-1) {
      curFind.toArray().then(function(items) {
        console.log('items',items.length)
       callback(null, items, count)
      });
    } else {
      curFind.skip(more*10).limit(10).toArray().then(function(items) {
       callback(null, items, count)
      });
    }
  });

}

export function data_requests_list(callback) {
  db.peoples
    .find({"data.flag": 1})
    .project({_id: 1, name: 1, data: 1})
    .toArray(callback);
}

// https://stackoverflow.com/questions/36332929/sum-of-unique-values-in-mongodb
export function schedules_stats(callback) {
  db.schedules.aggregate([
    {$group: {_id: "$count", count: {$sum: 1}}},
    {$project: {name: "$_id", count: "$count", _id: 0}}
  ]).toArray(callback);
}

export function publications_list(callback) {
  db.publications_marketing
    .find({ })
    .project({_id: 1, publicationId: 1, dates: 1, adminId: 1})
    .toArray(callback);
}

export function publications_list_date(queryDate: Date, callback) {
  var currentDay: string = moment(queryDate).startOf('day');
  var nextDay: string = moment(currentDay).add(1, 'days');

  db.publications_marketing
    .find({ "dates.0": { "$gte": new Date(currentDay), "$lt": new Date(nextDay) } })
    .project({ _id: 1, publicationId: 1, dates: 1, adminId: 1 })
    .sort({ _id: -1 })
    .toArray(callback);
}
// .limit(50)

// export function publications_list_sample(sample: number, callback) {
//   db.publications_marketing.aggregate([
//     { $match: { $or: [ {"dates.1": { "$exists": false } }, {"dates.2": { "$exists": false } } ] } },
//     { $sample: { size: 1 } },
//     { $project: { _id: 1, publicationId: 1, dates: 1, adminId: 1 } }
//   ]).toArray().then(function(items) {
//     if (items[0]._id) {
//       db.publications_marketing.updateOne(
//          { _id: ObjectID(items[0]._id) },
//          { $push: { "dates": new Date() } },
//          { safe: true },
//          callback(null, items)
//       )
//     } else {
//       callback(null, null)
//     }
//   })
// }

export function publications_details(publicationsIds: string[], callback) {
  var m = { "$match" : {"_id" : { "$in" : publicationsIds } } };
  var a = { "$addFields" : { "__order" : { "$indexOfArray" : [ publicationsIds, "$_id" ] } } };
  var s = { "$sort" : { "__order" : 1 } };
  var f = { "$project" : { _id: 1, title: 1, doi: 1, authors: 1, date: 1, abstractPic: 1, "journal.name": 1 } };

  db.publications.aggregate( [ m, a, s, f ] ).toArray(callback);
}

export function put_publication_marketing(adminId: string, publicationId: string, callback) {
  db.publications_marketing.insertOne(
    {
     "publicationId": publicationId,
     "dates": [new Date()],
     "adminId": adminId
    },
    { w: 1, safe: true }, function(err, docsInserted) {
      callback(null, docsInserted.insertedId);
    }
  );
};

export function delete_publication_marketing(publicationId: string, callback) {
  db.publications_marketing.deleteOne({ "publicationId": ObjectID(publicationId) }, { safe: true }, callback());
};

export function trends_submit_list(callback) {
  db.trends.aggregate( [
   { $replaceRoot: { newRoot: "$submit" } }
  ]).toArray(callback);
}

export function podcasts_submit_list(callback) {
  db.podcasts.aggregate( [
   { $replaceRoot: { newRoot: "$submit" } }
  ]).toArray(callback);
}

export function events_submit_list(callback) {
  db.events.aggregate( [
   { $replaceRoot: { newRoot: "$submit" } }
  ]).toArray(callback);
}

export function apps_submit_list(callback) {
  db.apps.aggregate( [
   // { $unwind: "$grades" },
   // { $match: { "grades.grade" : { $gte: 90 } } },
   { $replaceRoot: { newRoot: "$submit" } }
  ]).toArray(callback);
}

export function loggings_list(callback) {
  db.logging
    .find()
    .project({_id: 1, userId: 1, date: 1, itemId: 1, type: 1, message: 1})
    .toArray(callback);
}

export function contacts_messages_list(callback) {
  db.peoples
    .find({"messages": { $exists: true }})
    .project({_id: 1, messages: 1})
    .toArray(callback);
}

export function claims_requests_list(callback) {
  db.claims
    .find({ })
    .project({ })
    .toArray(callback);
}

export function progessUpdate(peopleId: string, mode: number, type: number, callback) {

  async.waterfall([

    // 1. create progressNotify (if !exist)
    function (cb) {
      db.peoples.updateOne(
        { "_id": peopleId, "progressNotify.0": { "$exists": false } },
        { "$set": { "progressNotify": [0,0,0,0,0,0] } },
        { safe: true },
        cb()
      )
    },

    // 2. update progressNotify
    function (cb) {
      db.peoples.updateOne(
        { _id: peopleId },
        { $inc: { ["progressNotify." + type]: 1 } },
        { safe: true },
        cb()
      )
    }

  ],
  function (err) {
    if (err) {
      callback(err);
    } else {
      callback(err, null);
    }
  });

}

////////////////////////////////////
////////////////////////////////////
////////////// Mentors /////////////
////////////////////////////////////
////////////////////////////////////

export function mentors_list(callback) {
  // var m = { "$match" : { "mentor.status": 1 } };
  var m = { "$match" : { } };
  var f = ({ "$project" : {
    // name: 1, link: 1, pic: 1,
    userId: 1,
    status: 1,
    emails: 1
  }})

  db.mentors.aggregate( [ m, f ] ).toArray(callback);
}

export function post_mentor_status(mentorId: string, status: number, callback) {
  async.waterfall([

    // 1. update Activate Status
    function (cb) {
      db.mentors.findOneAndUpdate(
        { _id: ObjectID(mentorId), "status": { $lte: status } },
        { $set: { "status": status } },
        { projection: { "userId": 1, "expertises": 1, "toolkits": 1, "availability": 1, "ongoing": 1 } }
      )
      .then(function(item) {
        if (status==3 && item.value) {
          db.peoples.findOneAndUpdate(
            { _id: item.value.userId },
            { $set: { "progress.8": 1 } },
            { projection: { "name": 1, "pic": 1, "positions": 1 } }
          )
          .then(function(user) {
            const object = [{
              objectID: mentorId,
              userId: item.value.userId,
              name: user.value.name,
              pic: user.value.pic,

              positions: user.value.positions,
              // startDate

              // language

              description: item.value.description,
              expertises: item.value.expertises,
              toolkits: item.value.toolkits,

              availability: {
                price: item.value.price,
                durations: item.value.durations,
                times: item.value.times,
                days: item.value.days,
                tools: item.value.tools,
                availability: item.value.availability,
              },

              ongoing: {
                price: item.value.days,
                hours: item.value.hours
              }

              // sessionsCount
              // reviewsCount
              // rating

              // country: app.country,
              // state: app.state ? app.state : null,
              // city: app.city ? app.city : null,
              // _geoloc: (app.location && app.location[0]) ? { lat: app.location[0], lng: app.location[1] } : { lat: '', lng: '' }
            }];
            client.initIndex((process.env.PORT) ? 'mentors': 'dev_mentors').addObjects(object, (err, content) => {
              cb(err, item.value.userId, "Rony Pozner", "roni.pozner@gmail.com")
            });
          })
        } else {
          cb(null, null, null, null)
        }
      })
    },

    // 2. Send Confirmation Email to Submission
    function (userId: string, userName: string, userEmail: string, cb) {
      if (userId) {
        emails.mentorStatusEmail(status, userId, userName, userEmail, function (err) {
          cb(err)
        });
      } else {
        cb()
      }
    }

  ],
  function (err) {
    if (err) {
      callback(err);
    } else {
      callback(err, null);
    }
  });
}

////////////////////////////////////
////////////////////////////////////
/////////////// Deals //////////////
////////////////////////////////////
////////////////////////////////////

export function deals_list(callback) {

  var m = { "$match" : { $and: [ { "deal.status": {$gte: 0} }, { "deal.status": {$lte: 3} } ] } };

  var f = ({ "$project" : {
        name: 1, link: 1, pic: 1,
        status: "$deal.status",
        emails: 1,
        dateStart: "$deal.dateStart",
        dateEnd: "$deal.dateEnd",
        plansTotal: "$deal.plansTotal",
        codesTotal: "$deal.codesTotal",
        codesRemain: { $size: "$deal.codes" }
      }})

  // var g = ({ $group: { buys: "$deal.buys" } });

  db.apps.aggregate( [ m, f ] ).toArray(callback);
}

export function post_deal_status(dealId: string, status: number, date: Date, callback) {
  switch (status) {
    case 1: deal_activate(dealId, function (err) { callback(err) }); break;
    case 2: deal_extend(dealId, date, function (err) { callback(err) }); break;
    case 3: deal_end(dealId, function (err) { callback(err) }); break;
    default: callback();
  }
}

export function deal_activate(dealId: string, callback) {
  async.waterfall([

    // 1. update Activate Status
    function (cb) {
      console.log('deal_activate1')
      db.apps.findOneAndUpdate(
         { "_id": ObjectID(dealId), "deal.status": { $eq: 0 } },
         { $set: { "deal.status": 1 } },
         { projection: { "name": 1, "deal": 1 } }
      )
      .then(function(item) {
        client.initIndex((process.env.PORT) ? 'apps': 'dev_apps').partialUpdateObject({
          objectID: dealId,
          deal: {
            status: 1,
            type: item.value.deal.type,
            price_reduced: item.value.deal.plans[0].price_reduced,
            price_full: item.value.deal.plans[0].price_full,
          }
        }, (err, content) => {
          // console.log('item',item)
         cb(err, item.value.name, item.value.deal.plans[0].price_reduced)
        });
      })
    },

    // 2. create Stripe Deal Product + Price (3% Comission)
    function (name: string, price: number, cb) {
      console.log('deal_activate2', name, price)
      payments.create_product(name, function (err, product) {
        // console.log('product',product)
        payments.create_pricing(product.id, price, function (err, pricing) {
          // console.log('pricing',pricing)
          db.apps.updateOne(
            { _id: ObjectID(dealId) },
            { $set: {
                "deal.stripe": {
                  "productId": product.id,
                  "pricingId": pricing.id
                }
              }
            },
            { safe: true },
            cb()
          )
        })
      })
    },

    // 3. Send Confirmation Email to Founders
    function (cb) {
      emails.dealStatusEmail(1, null, function (err) {
        cb(err)
      });
    }

  ],
  function (err) {
    if (err) {
      callback(err);
    } else {
      callback(err, null);
    }
  });
}

export function deal_extend(dealId: string, date: Date, callback) {
  async.waterfall([

    // 1. Extend Date
    function (cb) {
      db.apps.findOneAndUpdate(
         { "_id": ObjectID(dealId) },
         { $set: {  "deal.status": 2, "deal.dateEnd": date } },
         { projection: { "deal": 1 } }
      )
      .then(function(item) {
        client.initIndex((process.env.PORT) ? 'apps': 'dev_apps').partialUpdateObject({
          objectID: dealId,
          deal: {
            status: 2,
            dateEnd: item.value.deal.dateEnd
          }
        }, (err, content) => {
         cb(err)
        });
      })
    },

    // 2. Send Confirmation Email to Founders
    function (cb) {
      console.log('deal_extend2')
      emails.dealStatusEmail(2, null, function (err) {
        cb(err)
      });
    }
  ],
  function (err) {
    if (err) {
      callback(err);
    } else {
      callback(err, null);
    }
  });
}

export function deal_end(dealId: string, callback) {
  async.waterfall([

    // 1. update End Status
    function (cb) {
      db.apps.findOneAndUpdate(
         { "_id": ObjectID(dealId), "deal.status": { $gte: 1 } },
         { $set: { "deal.status": 3 } },
         { projection: { "deal": 1 } }
      )
      .then(function(item) {
        client.initIndex((process.env.PORT) ? 'apps': 'dev_apps').partialUpdateObject({
          objectID: dealId,
          deal: {
            status: 3
          }
        }, (err, content) => {
         cb(err)
        });
      })
    },

    // 2. TBD: Archive stripe product

    // 3. Send Confirmation Email to Founders
    function (cb) {
      emails.dealStatusEmail(3, null, function (err) {
        cb(err)
      });
    }

  ],
  function (err) {
    if (err) {
      callback(err);
    } else {
      callback(err, null);
    }
  });
}
