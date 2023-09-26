var db = require('../db.ts'),
    async = require('async'),
    backhelp = require("./backend_helpers.ts");

var ObjectID = require('mongodb').ObjectID;

var news = require("./news.ts");
var shared = require("./shared.ts");

import {objectMini} from '../models/shared.ts';

exports.version = "0.1.0";

export function put_media(id: string, userId: string, mode: number, type: number, adminFlag: boolean, data, callback) {
    var reqFields: string[];
    var typeName: string;
    var collection: string;
    var verb: number;
    var data_clone;

    if (mode==0) {
      collection = "groups";
    } else if (mode==1) {
      collection = "projects";
    } else if (mode==2) {
      collection = "peoples";
    }

    if (type==0) {
      reqFields = [ "link", "linkConvert", "title" ];
      typeName = (mode==0) ? "mediaItems.talksIds" : "talksIds";
      verb = 1011;
    } else if (type==1) {
      reqFields = [ "embed", "title" ];
      typeName = (mode==0) ? "mediaItems.postersIds" : "postersIds";
      verb = 1012;
    } else if (type==2) {
      reqFields = [ "link", "title" ];
      typeName = (mode==0) ? "mediaItems.pressesIds" : "pressesIds";
      verb = 1013;
    }

    async.waterfall([

      // 1. validate data.
      function (cb) {
        try {
            backhelp.verify(data, reqFields);
        } catch (e) {
            cb(e);
            return;
        }
        cb(null, data);
      },

      // 2. create Media document according to Type.
      function (media_data, cb) {
        data_clone = JSON.parse(JSON.stringify(media_data));

        createMediaDocument(data_clone, type, mode, id, adminFlag, function (err, mediaId) {
          cb(null, mediaId)
        });
      },

      // 3. insert Media ID to a specific Collection (Mode)
      function (mediaId, cb) {
        if (mode==0) {
          db.groups.updateOne(
             {_id: ObjectID(id)},
             {
               $push: { [typeName]: mediaId },
               $set: { ["progress." + (type+17)]: 1}
             },
             { safe: true },
             cb(null, mediaId)
          )
        } else if (mode==1) {
          db.projects.updateOne(
             {_id: ObjectID(id)},
             { $push: { [typeName]: mediaId } },
             { safe: true },
             cb(null, mediaId)
          )
        } else if (mode==2) {
          db.peoples.updateOne(
             {_id: id},
             {
               $push: { [typeName]: mediaId },
               $set: { ["progress." + (type+13)]: 1}
             },
             { safe: true },
             cb(null, mediaId)
          )
        }
      },

      // 4. insert Media ID to Projects Media List
      function (mediaId, cb) {
        if (data_clone.projects) {
          db.projects.updateMany(
             {_id: {$in: data_clone.projects.map(r => ObjectID(r._id))}},
             { $push: { "mediaIds": ObjectID(mediaId) } },
             { multi: true, safe: true },
             cb(null, mediaId)
          )
        } else {
          cb(null, mediaId)
        }
      },

      // 5. insert Media ID to People Media List
      function (mediaId, cb) {
        if (data_clone.presentors) {
          db.peoples.updateMany(
             {_id: {$in: data_clone.presentors.map(r => r._id)}},
             { $push: { "mediaIds": ObjectID(mediaId) } },
             { multi: true, safe: true },
             cb(null, mediaId)
          )
        } else {
          cb(null, mediaId)
        }
      },

      // 7. push News
      function (mediaId, cb) {
        var peoplesIds: string[];
        var link: string;

        if (type==0) {
          peoplesIds = data_clone.presentors.map(x => x._id);
          link = data_clone.link;
        } else if (type==1) {
          peoplesIds = data_clone.authors.map(x => x._id);
          link = data_clone.embed;
        } else if (type==2) {
          peoplesIds = null;
          link = data_clone.link;
        }

        if (mode==0) {
          if (adminFlag && data_clone.ai) {
            cb(null, mediaId)
          } else {
            push_news(userId, verb, mediaId, id, peoplesIds, data_clone.text, link, function (err) {
              cb(err, mediaId)
            })
          }
        } else {
          // news.add_activity(3, userId, verb, mediaId, userId, mediaId, peoplesIds, data_clone.text, link, null, false, function (err) {
          news.add_activity(3, userId, verb, mediaId, null, null, null, data_clone.text, link, null, false, function (err) {
            cb(err, mediaId)
          })
        }

      },
    ],
    function (err, mediaId) {
      if (err) {
        callback(err);
      } else {
        callback(err, err ? null : mediaId);
      }
    });
};

export function push_news(userId: string, verb: number, mediaId: string, id: string, peoplesIds: string[], text: string, link: string, callback) {
  news.add_group_activity(userId, verb, mediaId, id, mediaId, peoplesIds, text, link, null, 3, function (err) {
    callback(err)
  })
}

export function post_media(mediaId: string, type: number, media, callback) {
  var reqFields: string[];
  var collection: string;

  if (type==0) {
    reqFields = [ "link", "linkConvert", "title" ];
  } else if (type==1) {
    reqFields = [ "embed", "title" ];
  } else if (type==2) {
    reqFields = [ "link", "title" ];
  }

  async.waterfall([

      // 1. validate data.
      function (cb) {
          try {
              backhelp.verify(media, reqFields);
          } catch (e) {
              cb(e);
              return;
          }
          cb(null, media);
      },

      // 2. update Media People
      function (media_data, cb) {
        if (type==2) {
          cb(null, media_data)
        } else {
          shared.post_mini((type==0) ? media_data.presentors : media_data.authors, mediaId, null, 5, type, function (err, newsId) {
            cb(err, media_data)
          });
        }
      },

      // 3. update Media Projects
      function (media_data, cb) {
        shared.post_mini(media_data.projects, mediaId, null, 5, 2, function (err, newsId) {
          cb(err, media_data)
        });
      },

      // 4. update Media document
      function (media_data, cb) {
        if (type==0) {
          db.media.updateOne(
             {_id: ObjectID(mediaId)},
             { $set:
               {
                 "title": media_data.title,
                 "location": media_data.location,
                 "date": media_data.date,
                 "text": media_data.text,
                 "link": media_data.link,
                 "linkConvert": media_data.linkConvert,
                 "presentors": media_data.presentors,
                 "projects": media_data.projects.map(r => {r._id = ObjectID(r._id); return r})
               },
             },
             { safe: true },
             cb(null, media_data)
          );
        } else if (type==1) {
          db.media.updateOne(
             {_id: ObjectID(mediaId)},
             { $set:
               {
                 "title": media_data.title,
                 "location": media_data.location,
                 "date": media_data.date,
                 "abstract": media_data.abstract,
                 "embed": media_data.embed,
                 "authors": media_data.authors,
                 "projects": media_data.projects.map(r => {r._id = ObjectID(r._id); return r})
               },
             },
             { safe: true },
             cb(null, media_data)
          );
        } else if (type==2) {
          db.media.updateOne(
             {_id: ObjectID(mediaId)},
             { $set:
               {
                 "title": media_data.title,
                 "source": media_data.source,
                 "abstract": media_data.abstract,
                 "date": media_data.date,
                 "link": media_data.link,
                 "projects": media_data.projects.map(r => {r._id = ObjectID(r._id); return r})
               },
             },
             { safe: true },
             cb(null, mediaId)
          );
        }
      },

  ],
  function (err, mediaId) {
      // 3. convert errors to something we like.
      if (err) {
        callback(err);
      } else {
        callback(err, err ? null : mediaId);
      }
  });

}

export function delete_media(id: string, mediaId: string, mode: number, type: number, callback) {
  var typeName: string;
  var collection: string;

  if (mode==0) {
    collection = "groups";
  } else if (mode==1) {
    collection = "projects";
  } else if (mode==2) {
    collection = "peoples";
  }

  if (type==0) {
    typeName = (mode==0) ? "mediaItems.talksIds" : "talksIds";
  } else if (type==1) {
    typeName = (mode==0) ? "mediaItems.postersIds" : "postersIds";
  } else if (type==2) {
    typeName = (mode==0) ? "mediaItems.pressesIds" : "pressesIds";
  }

  async.series({

      // 1. delete Media specific Collection link
      links: function (cb) {
        if (mode==0) {
          var progress: number = 1;

          db.groups.aggregate([
              { "$match": { '_id': ObjectID(id)}},
              { "$project": {"_id": 0, "type": ["$"+typeName] }}
          ]).next().then(function(item) {
            if (item.type[0].length==1) progress = 0;

            db.groups.updateOne(
               {_id: ObjectID(id)},
               {
                 $set: { ["progress."+(type+17)]: progress },
                 $pull: { [typeName]: ObjectID(mediaId) },
               },
               { multi: false, safe: true },
               cb())

          });

        } else {

          db[collection].updateOne(
            {_id: (mode==2) ? id : ObjectID(id)},
            { $pull: { [typeName]: ObjectID(mediaId) } },
            { multi: false, safe: true },
            cb());

        }
      },

      // 2. delete Media People, Projects Links (+ Notification)
      items: function (cb) {
        db.media
          .find({_id: ObjectID(mediaId)})
          .project({ "_id": 0, "presentors": 1, "projects": 1})
        .next().then(function(item) {

          async.parallel({

            presentors: function (cb) {
              if (item.presentors) {
                db.peoples.updateMany(
                   {_id: {$in: item.presentors.map(r => r._id)}},
                   { $pull: { "mediaIds": ObjectID(mediaId) } },
                   { multi: true, safe: true },
                   cb()
                )
              } else {
                cb()
              }
            },

            projects: function (cb) {
              if (item.projects) {
                db.projects.updateMany(
                   {_id: {$in: item.projects.map(r => ObjectID(r._id))}},
                   { $pull: { "mediaIds": ObjectID(mediaId) } },
                   { multi: true, safe: true },
                   cb()
                )
              } else {
                cb()
              }
            },

          },

          function (err, results) {
              if (err) {
                cb(err);
              } else {
                cb(err, err ? null : results);
              }
          });

        })
      },

      // 3. delete Media Item
      media: function (cb) {
        db.media.deleteOne({ _id: ObjectID(mediaId) },
                              { safe: true },
                              cb());
      },

      // 4. delete Media news
      news: function (cb) {
        if (mode==0) {
          news.remove_activity(id, mediaId, 0, function (err, newsId) {
            cb();
          });
        } else {
          cb();
        }
      }

  },
  function (err, results) {
      // 5. convert errors to something we like.
      if (err) {
        callback(err);
      } else {
        callback(err, err ? null : results);
      }
  });

}

export function delete_people(userId: string, ids: string[], callback) {
  db.media.updateMany(
    { _id: {$in: ids} },
    { $pull: { "presentors": {"_id": userId } } },
    { multi: false, safe: true },
    callback()
  )
}

function createMediaDocument(data, type: number, mode: number, id: string, adminFlag: boolean, callback) {

  if (type==0) {

    db.media.insertOne(
      {
        "title": data.title,
        "location": data.location,
        "date": data.date,
        "text": data.text,
        "link": data.link,
        "linkConvert": data.linkConvert,
        "presentors": data.presentors,
        "projects": data.projects.map(r => {r._id = ObjectID(r._id); return r}),
        "type": 0,

        "ai": (adminFlag && data.ai) ? 1 : 0,

        "groupId": (mode==0) ? ObjectID(id) : null,
        "projectId": (mode==1) ? ObjectID(id) : null,
        "profileId": (mode==2) ? id : null
      },
      { w: 1, safe: true }, function(err, docsInserted) {
        callback(null, docsInserted.insertedId);
      }
    );

  } else if (type==1) {

    db.media.insertOne(
      {
        "title": data.title,
        "location": data.location,
        "date": data.date,
        "abstract": data.abstract,
        "embed": data.embed,
        "authors": data.authors,
        "projects": data.projects,
        "type": 1,

        "groupId": (mode==0) ? ObjectID(id) : null,
        "projectId": (mode==1) ? ObjectID(id) : null,
        "profileId": (mode==2) ? id : null
      },
      { w: 1, safe: true }, function(err, docsInserted) {
        callback(null, docsInserted.insertedId);
      }
    );

  } else if (type==2) {

    db.media.insertOne(
      {
        "title": data.title,
        "source": data.source,
        "abstract": data.abstract,
        "date": data.date,
        "link": data.link,
        "projects": data.projects,
        "type": 2,

        "groupId": (mode==0) ? ObjectID(id) : null,
        "projectId": (mode==1) ? ObjectID(id) : null,
        "profileId": (mode==2) ? id : null
      },
      { w: 1, safe: true }, function(err, docsInserted) {
        callback(null, docsInserted.insertedId);
      }
    );

  }

}

export function media_list(mediaIds: string[], type: number, mini: number, aiStatus: number, callback) {
  var m = { "$match" : {"_id" : { "$in" : mediaIds }, "ai": (aiStatus==1) ? 1 : {$in: [null, 0]} } };
  var a = { "$addFields" : { "__order" : { "$indexOfArray" : [ mediaIds, "$_id" ] } } };
  var s = { "$sort" : { "__order" : 1 } };

  var f;

  if (mini==1) {
    // f = ({ "$project" : {_id: 1, title: 1}});
    f = ({ "$project" : {_id: 1, name: "$title"} });

  } else {

    switch (type) {
      case 0: // talks
        f = ({ "$project" : {_id: 1, title: 1, location: 1, date: 1, text: 1,
                             link: 1, linkConvert: 1, presentors:1, projects: 1,
                             groupId: 1, profileId: 1, projectId: 1
                            }}); break;

      case 1: // posters
        f = ({ "$project" : {_id: 1, title: 1, abstract: 1, authors: 1,
                             location: 1, date: 1, embed:1, projects: 1,
                             groupId: 1, profileId: 1, projectId: 1
                            }}); break;

      case 2: // presses
        f = ({ "$project" : {_id: 1, title: 1, abstract: 1, source: 1, date: 1,
                             link: 1, projects: 1,
                             groupId: 1, profileId: 1, projectId: 1
                            }}); break;

    }
  }

  db.media.aggregate( [ m, a, s, f ] ).toArray(callback);

}

function invalid_media_name() {
    return backhelp.error("invalid_media_name",
                          "Group names can have letters, #s, _ and, -");
}
