var db = require('../db.ts'),
    async = require('async'),
    backhelp = require("./backend_helpers.ts");

var ObjectID = require('mongodb').ObjectID;

var news = require("./news.ts");

import {Outreach} from '../models/outreachs.ts';

exports.version = "0.1.0";

export function put_outreach(userId: string, type: number, adminFlag: boolean, outreach: Outreach, callback) {
  var data_clone;

  var key: string;
  var collection: string;

  async.waterfall([

    // 1. validate data.
    function (cb) {
      try {
        const reqFields: string[] = ["name", "description"];
        backhelp.verify(outreach, reqFields);
      } catch (e) {
        cb(e);
        return;
      }
      cb(null, outreach);
    },

    // 2. create Outreach document
    function (outreach_data, cb) {
      console.log('outreach_data',outreach_data)
      data_clone = JSON.parse(JSON.stringify(outreach_data));
      createOutreachDocument(data_clone, type, adminFlag, function (err, outreachId) {
        cb(err, outreachId)
      });
    },

    // 3. insert Outreach ID in a specific Collection
    function (outreachId, cb) {
      if (type==2) {
        db.peoples.updateOne(
           { _id: userId },
           {
             $push: { "outreachsIds": outreachId },
             $set: { "progress.14": 1}
           },
           { safe: true },
           cb(null, outreachId)
        )
      } else {
        db.groups.updateOne(
          {_id: ObjectID(data_clone.parentId)},
            {
              $push: { "outreachsItems.outreachsIds": outreachId },
              $set: { "progress.29": 1}
            },
          { safe: true },
          cb(null, outreachId)
        )
      }
    },

    // 4. push News
    function (outreachId, cb) {
      var text =  data_clone.name + ': ' + data_clone.description;
      if (type==2) {
        // news.add_activity(3, userId, 1008, outreachId, null, null, [], text, "", null, false, function (err) {
        //   cb(err, outreachId)
        // })
        cb(null, outreachId)
      } else if (type==0 || type==1) {
        if (adminFlag && data_clone.ai) {
          cb(null, outreachId)
        } else {
          push_news(userId, outreachId, data_clone.parentId, text, function (err) {
            cb(err, outreachId)
          })
        }
      }
    }

  ],
  function (err, outreachId) {
    if (err) {
      callback(err);
    } else {
      callback(err, err ? null : outreachId);
    }
  });

}

export function push_news(userId: string, outreachId: string, parentId: string, text: string, callback) {
  news.add_group_activity(userId, 1008, outreachId, parentId, parentId, [], text, "", null, 3, function (err) {
    callback(err)
  })
}

export function post_outreach(outreach: Outreach, type: number, callback) {

  async.waterfall([

    // 1. validate data.
    function (cb) {
        try {
            const reqFields: string[] = ["name", "period"];
            backhelp.verify(outreach, reqFields);
        } catch (e) {
            cb(e);
            return;
        }
        cb(null, outreach);
    },

    // 2. update Outreach document
    function (outreach_data, cb) {
      db.outreachs.updateOne(
         {_id: ObjectID(outreach_data._id)},
         { $set:
           {
             "name": outreach_data.name,
             "link": outreach_data.link,
             "pic": outreach_data.pic,
             "caption": outreach_data.caption,
             "clip": outreach_data.clip,
             "period": outreach_data.period,
             "location": outreach_data.location,
             "description": outreach_data.description
           },
         },
         { safe: true },
         cb(null, outreach_data._id)
      );

    }

  ],
  function (err, outreachId) {
      if (err) {
        callback(err);
      } else {
        callback(err, err ? null : outreachId);
      }
  });

}

export function delete_outreach(parentId: string, userId: string, outreachId: string, type: number, callback) {

  async.series({

    // 1. delete Outreach Group Links / Profile Links
    links: function (cb) {
      if (type==2) {

        db.peoples.updateOne(
           { _id: userId },
           { $pull: { "outreachsIds": ObjectID(outreachId) } },
           { safe: true },
           cb(null, outreachId)
        )

      } else {

        var progress: number = 1;

        db.groups
          .find({_id: ObjectID(parentId)})
          .project({_id: 0, "outreachsItems.outreachsIds": 1})
        .next().then(function(item) {

          if (item.outreachsItems.outreachsIds.length==1) progress = 0;

          db.groups.updateOne(
             {_id: ObjectID(parentId)},
             {
               $set: { "progress.29": progress },
               $pull: { "outreachsItems.outreachsIds": ObjectID(outreachId) },
             },
             { multi: false, safe: true },
             cb()
          )
        })
      };
    },

    // 3. delete Outreach Item
    outreach: function (cb) {
      db.outreachs.deleteOne({ _id: ObjectID(outreachId) },
                            { safe: true },
                            cb());
    },

    // 4. remove Outreach news
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

function createOutreachDocument(data, type: number, adminFlag: boolean, callback) {
  db.outreachs.insertOne(
    {
      "name": data.name,
      "link": data.link,
      "pic": data.pic,
      "caption": data.caption,
      "clip": data.clip,
      "description": data.description,
      "location": data.location,
      "period": data.period,

      "groupId": (type<2) ? ObjectID(data.parentId) : null,
      "profileId": (type==2) ? data.parentId : null,

      "ai": (adminFlag && data.ai) ? 1 : 0,

      "views": [0,0,0,0,0]
    },
    { w: 1, safe: true }, function(err, docsInserted) {
      callback(null, docsInserted.insertedId);
    }
  );
}

export function outreachs_list(outreachsIds: string[], aiStatus: number, callback) {
  var m = { "$match" : {"_id" : { "$in" : outreachsIds }, "ai": (aiStatus==1) ? 1 : {$in: [null, 0]} } };
  var a = { "$addFields" : { "__order" : { "$indexOfArray" : [ outreachsIds, "$_id" ] } } };
  var s = { "$sort" : { "__order" : 1 } };

  var f = ({ "$project" : {
                           _id: 1, name: 1, link: 1, pic: 1, caption: 1, clip: 1,
                           location: 1, description: 1, period: 1, groupId: 1,
                           // profileId: 1
                          }
          });

  db.outreachs.aggregate( [ m, a, s, f ] ).toArray(callback);
}
