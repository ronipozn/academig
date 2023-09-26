var db = require('../db.ts');

var ObjectID = require('mongodb').ObjectID;

const algoliasearch = require('algoliasearch');
const client = algoliasearch('TDKUK8VW4T', '5d17934a8722069c0ac47bd6b4ae4bda');

exports.version = "0.1.0";

export function group_account(groupId: string, callback) {
  var m = { "$match" : {"_id" : ObjectID(groupId) } };
  var f = ({
             "$project" : {
               "_id": 0, "rank": 1, "unit": 1, "buildPro": 1, "club": 1, "interview": 1, "dates": 1, "membersCount": 1,
               "privacy": 1,
               "seminarsPrivacy": "$futureMeetingsItems.privacy",
               "kitPrivacy": "$papersKit.privacy",
               "intrests": "$homePageItems.intrests",
               "size": "$homePageItems.size",
               "establish": "$homePageItems.establish",
               "topic": "$homePageItems.topic"
             }
          });

  db.groups.aggregate([m, f]).next(callback);
}

export function update_privacy(groupId: string, type: number, mode: number, callback) {
  let typeName: string;
  switch (type) {
    case 0: typeName = "privacy"; break;
    case 1: typeName = "futureMeetingsItems.privacy"; break;
    case 2: typeName = "papersKit.privacy"; break;
  }

  db.groups.updateOne(
    { _id: ObjectID(groupId) },
    { $set: {[typeName]: mode } },
    { safe: true },
    callback()
  )
}

export function update_data(groupId: string, data: any, callback) {
  db.groups.updateOne(
    { _id: ObjectID(groupId) },
    { $set:
      {
        "homePageItems.topic": data.topic,
        "homePageItems.establish": data.establish,
        "homePageItems.size": Number(data.size)
      }
    }, function(err, res) {
      const algoliaIndex = client.initIndex((process.env.PORT) ? 'labs': 'dev_labs');
      algoliaIndex.partialUpdateObject({
        objectID: groupId,
        size: data.size ? Number(data.size) : null,
        establish: data.establish ? new Date(data.establish).getFullYear() : null,
        topic: data.topic
      }, (err, content) => {
        callback(err);
      });
    }
  )
}

export function group_notifications(groupId: string, callback) {
  var m = { "$match" : {"_id" : ObjectID(groupId) } };
  var f = ({ "$project" : {"subscribe": 1} });

  db.groups.aggregate( [ m, f ] ).next(callback);
}

export function toggle_notifications(groupId: string, index: number, state: number, callback) {
  db.groups.updateOne(
    { _id: ObjectID(groupId) },
    { $set: { ["subscribe."+index]: state } },
    { safe: true },
    callback()
  )
}
