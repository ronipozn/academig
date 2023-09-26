var db = require('../db.ts'),
    async = require('async'),
    backhelp = require("./backend_helpers.ts");

var ObjectID = require('mongodb').ObjectID;

var news = require("./news.ts");

import {Teaching} from '../models/teachings.ts';

exports.version = "0.1.0";

export function put_teaching(userId: string, type: number, adminFlag: boolean, teaching: Teaching, callback) {
  var data_clone;

  var key: string;
  var collection: string;

  async.waterfall([

    // 1. validate data.
    function (cb) {
      try {
        const reqFields: string[] = ["name", "description", "period", "role"];
        backhelp.verify(teaching, reqFields);
      } catch (e) {
        cb(e);
        return;
      }
      cb(null, teaching);
    },

    // 2. create Teaching document
    function (teaching_data, cb) {
      data_clone = JSON.parse(JSON.stringify(teaching_data));

      createTeachingDocument(data_clone, type, adminFlag, function (err, teachingId) {
        cb(null, teachingId)
      });
    },

    // 3. insert Teaching ID in a specific Collection
    function (teachingId, cb) {
      if (type==2) {
        db.peoples.updateOne(
           { _id: userId },
           {
             $push: { "teachingsIds": teachingId },
             $set: { "progress.11": 1}
           },
           { safe: true },
           cb(null, teachingId)
        )
      } else {
        const key = (type==0) ? "teachingsItems.currentTeachingsIds" : "teachingsItems.pastTeachingsIds";

        db.groups.updateOne(
           {_id: ObjectID(data_clone.parentId)},
           {
             $push: { [key]: teachingId },
             $set: { "progress.28": 1}
           },
           { safe: true },
           cb(null, teachingId)
        )
      }
    },

    // 4. push News
    function (teachingId, cb) {
      var text =  data_clone.name + ': ' + data_clone.description;
      if (type==2) {
        // news.add_activity(3, userId, 1008, teachingId, userId, userId, [], text, "", null, false, function (err) {
        news.add_activity(3, userId, 1008, teachingId, null, null, [], text, "", null, false, function (err) {
          cb(err, teachingId)
        })
      } else if (type==0 || type==1) {
        if (adminFlag && data_clone.ai) {
          cb(null, teachingId)
        } else {
          push_news(userId, teachingId, data_clone.parentId, text, function (err) {
            cb(err, teachingId)
          })
        }
      }
    }

  ],
  function (err, teachingId) {
    if (err) {
      callback(err);
    } else {
      callback(err, err ? null : teachingId);
    }
  });

}

export function push_news(userId: string, teachingId: string, parentId: string, text: string, callback) {
  news.add_group_activity(userId, 1008, teachingId, parentId, parentId, [], text, "", null, 3, function (err) {
    callback(err)
  })
}

export function post_teaching(teaching: Teaching, type: number, callback) {

  async.waterfall([

    // 1. validate data.
    function (cb) {
        try {
            const reqFields: string[] = ["name", "period", "role", "description"];
            backhelp.verify(teaching, reqFields);
        } catch (e) {
            cb(e);
            return;
        }
        cb(null, teaching);
    },

    // 2. update Teaching document
    function (teaching_data, cb) {
      db.teachings.updateOne(
         {_id: ObjectID(teaching_data._id)},
         { $set:
           {
             "name": teaching_data.name,
             "pic": teaching_data.pic,
             "period": teaching_data.period,
             "location": teaching_data.location,
             "role": teaching_data.role,
             "description": teaching_data.description,
             "university": (type==2) ? teaching_data.university : null,
           },
         },
         { safe: true },
         cb(null, teaching_data._id)
      );

    }

  ],
  function (err, teachingId) {
      if (err) {
        callback(err);
      } else {
        callback(err, err ? null : teachingId);
      }
  });

}

export function delete_teaching(parentId: string, userId: string, teachingId: string, type: number, callback) {

  async.series({

    // 1. delete Teaching Group Links / Profile Links
    links: function (cb) {
      if (type==2) {

        db.peoples.updateOne(
           { _id: userId },
           { $pull: { "teachingsIds": ObjectID(teachingId) } },
           { safe: true },
           cb(null, teachingId)
        )

      } else {

        var progress: number = 1;

        db.groups
          .find({_id: ObjectID(parentId)})
          .project({_id: 0, "teachingsItems.currentTeachingsIds": 1, "teachingsItems.pastTeachingsIds": 1})
        .next().then(function(item) {
          const key = (type==0) ? "teachingsItems.currentTeachingsIds" : "teachingsItems.pastTeachingsIds";

          if (
              (type==0 && item.teachingsItems.currentTeachingsIds.length==1 && item.teachingsItems.pastTeachingsIds.length==0)
              ||
              (type==1 && item.teachingsItems.currentTeachingsIds.length==0 && item.teachingsItems.pastTeachingsIds.length==1)
          ) {
            progress = 0;
          }

          db.groups.updateOne(
             {_id: ObjectID(parentId)},
             {
               $set: { "progress.28": progress },
               $pull: { [key]: ObjectID(teachingId) },
             },
             { multi: false, safe: true },
             cb()
          )
        })
      };
    },

    // 3. delete Teaching Followers Links (+ Notification)
    // followers: function (cb) {
    //   peoples.delete_followings_ids("teachings", "teachingsIds", teachingId, true, function (err) {
    //     cb(err)
    //   });
    // },

    // 4. delete Teaching Item
    teaching: function (cb) {
      db.teachings.deleteOne({ _id: ObjectID(teachingId) },
                            { safe: true },
                            cb());
    },

    // 5. remove Teaching news
    // news: function (cb) {
    //   if (type==2) {
    //     cb()
    //   } else {
    //     news.remove_activity(parentId, projectId, 0, function (err) {
    //       cb(err);
    //     });
    //   }
    // }

  },
  function (err, results) {
    if (err) {
      callback(err);
    } else {
      callback(err, err ? null : results);
    }
  });

}

function createTeachingDocument(data, type: number, adminFlag: boolean, callback) {
  db.teachings.insertOne(
    {
      "name": data.name,
      "pic": data.pic,
      "description": data.description,
      "id": data.id,
      "location": data.location,
      "role": data.role,
      "period": data.period,
      "university": (type==2) ? data.university : null,

      "groupId": (type<2) ? ObjectID(data.parentId) : null,
      "profileId": (type==2) ? data.parentId : null,

      "ai": (adminFlag && data.ai) ? 1 : 0,

      "views": [0,0,0,0,0],
      "followedIds": [],
    },
    { w: 1, safe: true }, function(err, docsInserted) {
      callback(null, docsInserted.insertedId);
    }
  );
}

export function teachings_list(teachingsIds: string[], aiStatus: number, callback) {
  var m = { "$match" : {"_id" : { "$in" : teachingsIds }, "ai": (aiStatus==1) ? 1 : {$in: [null, 0]} } };
  var a = { "$addFields" : { "__order" : { "$indexOfArray" : [ teachingsIds, "$_id" ] } } };
  var s = { "$sort" : { "__order" : 1 } };

  var f = ({ "$project" : {
                           _id: 1, name: 1, pic: 1, role: 1, location: 1, university: 1,
                           description: 1, id: 1, period: 1, groupId: 1, profileId: 1
                          }
          });

  db.teachings.aggregate( [ m, a, s, f ] ).toArray(callback);
}
