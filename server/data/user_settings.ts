var db = require('../db.ts'),
    async = require('async'),
    backhelp = require("./backend_helpers.ts");

var ObjectID = require('mongodb').ObjectID;

var news = require("./news.ts");

import {objectMini, groupComplex} from '../models/shared.ts';

export function user_account(userId: string, callback) {
  db.peoples
    .find({_id: userId})
    .project({_id: 0, country: 1, data: 1})
    .next(callback)
}

export function update_data_request(userId: string, callback) {
  db.peoples.updateOne(
     {_id: userId},
     { $set:
       { "data":
        {
          "date": new Date(),
          "flag": 1,
        }
      }
     },
     { safe: true },
     callback()
  )
}

////////////////////////////////////
////////////////////////////////////
////////////////////////////////////
////////////////////////////////////
////////////////////////////////////

export function push_report(mode: number, peopleId: string, type: number, item: objectMini, group: groupComplex, messeage: string, callback) {

  var collection: string;
  var itemId: string;

  switch (mode) {
    case 0: {collection = "groups"; break;}
    case 1: {collection = "peoples"; break;}
    case 2: {collection = "publications"; break;}
    case 3: {collection = "resources"; break;}
    case 4: {collection = "projects"; break;}
    case 5: {collection = "positions"; break;}
  }

  itemId = (mode==0) ? group.group._id : item._id;

  async.waterfall([
      // 1. push report to Admin Panel
      function (cb) {
        db.reports.insertOne(
          {
            "date": new Date(),
            "peopleId": peopleId,
            "type": type,
            "mode": mode,
            "status": 0,
            "group": group,
            "item": item,
            "message": messeage,
          },
          { w: 1, safe: true }, function(err, docsInserted) {
            cb(null, docsInserted.insertedId);
          }
        );
      },

      // 2. push report ID to user
      function (reportId,cb) {
        db.peoples.updateOne(
           { _id: peopleId },
           { $push: { "reportsIds": ObjectID(reportId) } },
           { safe: true },
           cb(null, reportId)
        )
      },

      // 3. push report ID to item
      function (reportId,cb) {
        db[collection].updateOne(
           { _id: (mode==1) ? itemId : ObjectID(itemId) },
           { $push: { "reportedIds": ObjectID(reportId) } },
           { safe: true },
           cb()
        )
      }
  ],
  function (err, reportId) {
    callback(err, null);
  });

}

export function post_library_privacy(mode: number, peopleId: string, callback) {
  db.peoples.updateOne(
    { _id: peopleId },
    { $set: { "libraryPrivacy": mode } },
    { safe: true },
    callback()
  )
}

export function update_report(reply: string, status: number, reportId: string, callback) {
  var collection: string;
  var itemId: string;

  async.waterfall([
    // 1. update report Status and Reply
    function (cb) {
      db.reports.updateOne(
         {_id: ObjectID(reportId)},
         { $set: {
                  "status": status,
                  "reply": reply,
                 }
         },
         { safe: true },
         cb(null)
      )
    },

    // 2. extract Report data
    function (cb) {
      db.reports
        .find({_id: ObjectID(reportId)})
        .project({peopleId: 1, mode: 1, "item._id": 1})
        .next().then(function(report) {
          cb(null, report.peopleId, report.mode, report.item._id)
        });
    },

    // 3. push Notification
    function (peopleId: string, mode: number, itemId: string, cb) {
      news.add_notification("Academig", 13100+mode, itemId, peopleId, peopleId, [], reply, null, null, function (err, newsId) {
        cb(err)
      });
    }
  ],
  function (err) {
    callback(err);
  });

}

export function pull_report(userId: string, reportId: string, callback) {
  async.waterfall([

    // 1. extract Report data
    function (cb) {
      db.reports
        .find({_id: ObjectID(reportId)})
        .project({peopleId: 1, "item._id": 1, "group.group._id":1, mode: 1})
        .next().then(function(report) {
          if (report.mode==0) {
            cb(null, report.peopleId, report.group.group._id, report.mode)
          } else {
            cb(null, report.peopleId, report.item._id, report.mode)
          }
        });
    },

    // 2. pull report ID from user
    function (userId, itemId, mode, cb) {
      var collection: string;
      switch (mode) {
        case 0: {collection = "groups"; break;}
        case 1: {collection = "peoples"; break;}
        case 2: {collection = "publications"; break;}
        case 3: {collection = "resources"; break;}
        case 4: {collection = "projects"; break;}
        case 5: {collection = "positions"; break;}
      }

      db[collection].updateOne(
         { _id: ObjectID(itemId) },
         { $pull: { "reportedIds": ObjectID(reportId) } },
         { safe: true },
         cb(null, userId)
      )
    },

    // 3. pull report ID from item
    function (userId, cb) {
      db.peoples.updateOne(
         { _id: userId },
         { $pull: { "reportsIds": ObjectID(reportId) } },
         { safe: true },
         cb(null)
      )
    },

    // 4. pull report from Admin Panel
    function (cb) {
      db.reports.deleteOne({ _id: ObjectID(reportId) },
                           { safe: true },
                           cb());
    },

  ],
  function (err, reportId) {
    callback(err, null);
  });

}

export function reports(mode: number, reportsIds: string[], callback) {
  if (mode==0) {
    db.reports.find({}).project({}).toArray(callback);
  } else {
    db.reports.find({_id: { $in: reportsIds ? reportsIds : "" }}).project({}).toArray(callback);
  }
}
