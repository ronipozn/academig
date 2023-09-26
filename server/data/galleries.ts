var db = require('../db.ts'),
    async = require('async'),
    backhelp = require("./backend_helpers.ts");

var ObjectID = require('mongodb').ObjectID;

var moment = require('moment');

var peoples = require("./peoples.ts");
var news = require("./news.ts");
var shared = require("../data/shared.ts");
var pics = require("../data/pics.ts");

import {CreateNews, UpdateNews, privateNews} from '../models/private.ts';
import {settingsReports, currentReport} from '../models/private.ts';
import {settingsMeetings, privateMeeting} from '../models/private.ts';
import {Gallery} from '../models/galleries.ts';

exports.versin = "0.1.0";

export function put_gallery(groupId: string, userId: string, mode: number, adminFlag: boolean, gallery: Gallery, callback) {
  var data_clone;

  async.waterfall([

    // 1. validate data.
    function (cb) {
      try {
        const reqFields: string[] = ["date", "title", "description", "pics"];
        backhelp.verify(gallery, reqFields);
      } catch (e) {
        cb(e);
        return;
      }
      cb(null, gallery);
    },

    // 2. create Gallery document
    function (gallery_data, cb) {
      data_clone = JSON.parse(JSON.stringify(gallery_data));
      createGalleryDocument(data_clone, mode, (mode==2) ? groupId : userId, adminFlag, function (err, galleryId) {
        cb(err, data_clone, galleryId)
      });
    },

    // 3. insert Gallery ID to Group
    function (data_clone, galleryId, cb) {
      if (mode==1) {
        db.peoples.updateOne(
           {_id: groupId},
           { $push: { "galleriesIds": galleryId },
             $set: { "progress.12": 1}
           },
           { safe: true },
           cb(null, data_clone, galleryId)
        )
      } else if (mode==2) {
        db.groups.updateOne(
           {_id: ObjectID(groupId)},
           { $push: { "eventsItems.eventsIds": galleryId },
             $set: { "progress.27": 1} },
           { safe: true },
           cb(null, data_clone, galleryId)
        )
      } else {
        cb(null, data_clone, galleryId)
      }
    },

    // 4. insert Pics to Gallery Document
    function (data_clone, galleryId, cb) {
      pics.put_showcase(data_clone.pics, 2, galleryId, function (err, picsIds) {
        cb(err, data_clone, galleryId, picsIds.concat([galleryId]))
      });
    },

    // 5. push News
    function (data_clone, galleryId, ids, cb) {
      var text =  data_clone.title + ': ' + data_clone.description;
      if (mode==1) {
        // news.add_activity(3, userId, 1016, galleryId, userId, userId, [], text, data_clone.pics[0].pic, null, false, function (err) {
        news.add_activity(3, userId, 1016, galleryId, null, null, [], text, data_clone.pics[0].pic, null, false, function (err) {
          cb(err, ids)
        })
      } else if (mode==2) {
        if (adminFlag && data_clone.ai) {
          cb(null, ids)
        } else {
          push_news(userId, galleryId, groupId, text, data_clone.pics[0].pic, function (err) {
            cb(err, ids)
          })
        }
      }
    }
  ],
  function (err, ids: string[]) {
    if (err) {
      callback(err);
    } else {
      callback(err, err ? null : ids);
    }
  });
};

export function push_news(userId: string, galleryId: string, groupId: string, text: string, pic: string, callback) {
  news.add_group_activity(userId, 1016, galleryId, groupId, groupId, [], text, pic, null, 3, function (err, newsId) {
    callback(err)
  })
}

export function post_gallery(gallery: Gallery, callback) {
  async.waterfall([

    // 1. validate data.
    function (cb) {
        try {
            const reqFields: string[] = [ "title" ];
            backhelp.verify(gallery, reqFields);
        } catch (e) {
            cb(e);
            return;
        }
        cb(null, gallery);
    },

    // 2. update Gallery
    function (gallery_data, cb) {
      db.events.updateOne(
         {_id: ObjectID(gallery._id) },
         { $set:
           {
             "date": gallery.date,
             "title": gallery.title,
             "description": gallery.description,
           },
         },
         { safe: true },
         cb(null, gallery._id)
      )
    }

  ],
  function (err, galleryId) {
    // 3. convert errors to something we like.
    if (err) {
      callback(err);
    } else {
      callback(err, err ? null : galleryId);
    }
  });
};

export function delete_gallery(parentId: string, galleryId: string, mode: number, callback) {
  async.series({

    // 1. delete Gallery Group Links
    links: function (cb) {
      var progress: number = 1;

      if (mode==1) {
        db.peoples.aggregate([
            { "$match": { '_id': parentId } },
            { "$project": {'_id': 0, 'galleriesIds': 1 }}
        ]).next().then(function(item) {
          if (item.galleriesIds.length==1) progress = 0;
          db.groups.updateOne(
             {_id: parentId},
             { $set: { "progress.12": progress },
              $pull: { "galleriesIds": ObjectID(galleryId) } },
             { multi: false, safe: true },
             cb())
        });
      } else if (mode==2) {
        db.groups.aggregate([
            { "$match": { '_id': ObjectID(parentId)}},
            { "$project": {'_id': 0, 'eventsItems.eventsIds': 1 }}
        ]).next().then(function(item) {
          if (item.eventsItems.eventsIds.length==1) progress = 0;
          db.groups.updateOne(
             {_id: ObjectID(parentId)},
             { $set: { "progress.27": progress },
              $pull: { "eventsItems.eventsIds": ObjectID(galleryId) } },
             { multi: false, safe: true },
             cb())
        });
      } else {
        cb()
      }
    },

    // 2. delete Pics
    pics: function (cb) {
      db.events
        .find({_id: ObjectID(galleryId)})
        .project({ "_id": 0, "pics": 1})
      .next().then(function(item) {
        pics.delete_pic_gallery(item.pics[0].pic, function(err) {
          cb(err)
        })
      })
    },

    // 3. delete Gallery
    gallery: function (cb) {
      db.events.deleteOne({ _id: ObjectID(galleryId) },
                            { safe: true },
                            cb());
    }

  },
  function (err, results) {
    // 4. convert errors to something we like.
    if (err) {
      callback(err);
    } else {
      callback(err, err ? null : results);
    }
  });
}

function createGalleryDocument(data, mode: number, parentId: string, adminFlag: boolean, callback) {
  db.events.insertOne(
    {
      "title": data.title,

      "profileId": (mode==1) ? parentId : null,
      "groupId": (mode==2) ? ObjectID(parentId) : null,

      "ai": (adminFlag && data.ai) ? 1 : 0,

      "date": new Date(data.date),
      "description": data.description,
    },
    { w: 1, safe: true }, function(err, docsInserted) {
      callback(null, docsInserted.insertedId);
    }
  );
}

export function galleries_list(galleriesIds: string[], aiStatus: number, callback) {
  if (galleriesIds) {
    var m = { "$match" : {"_id" : { "$in" : galleriesIds }, "ai": (aiStatus==1) ? 1 : {$in: [null, 0]} } };
    var a = { "$addFields" : { "__order" : { "$indexOfArray" : [ galleriesIds, "$_id" ] } } };
    var s = { "$sort" : { "__order" : 1 } };
    // var f = ({ "$project" : { _id: 1, title: 1, date: 1, description: 1, groupId: 1, "pics": { $slice: [ "$pics", 1 ] } } });
    var f = ({ "$project" : { _id: 1, title: 1, date: 1, description: 1, groupId: 1, "pics": 1 } });

    db.events.aggregate( [ m, a, s, f ] ).toArray(callback);
  } else {
    callback()
  }
}

export function gallery_details(galleryId: string, callback) {
  const m = { _id: ObjectID(galleryId) };
  const p = { _id: 1, groupId: 1, profileId: 1, date: 1, title: 1, description: 1, pics: 1, names: 1 };

  db.events.find(m).project(p).next(callback);
}
