var db = require('../db.ts'),
    async = require('async'),
    backhelp = require("./backend_helpers.ts");

var ObjectID = require('mongodb').ObjectID;

var moment = require('moment');

var peoples = require("./peoples.ts");
var news = require("./news.ts");
var shared = require("../data/shared.ts");
var pics = require("./pics.ts");

import {CreateNews, UpdateNews, privateNews} from '../models/private.ts';
import {settingsReports, currentReport} from '../models/private.ts';
import {settingsMeetings, privateMeeting} from '../models/private.ts';

exports.versin = "0.1.0";

// ************** ************** **************
// ************** ************** **************
// **************** Group News ****************
// ************** ************** **************
// ************** ************** **************

export function member_id_by_news_id(newsId: string, callback) {

  db.news
    .find({ _id: ObjectID(newsId) })
    .project({ _id: 0, "actor": 1 })
    .next().then(function(item) {
      callback(null, item ? item.actor : null)
    });
}

export function put_news(groupId: string, createNews: CreateNews, callback) {
  var data_clone;

  async.waterfall([
      // 1. validate data.
      function (cb) {
          try {
            const reqFields: string[] = [ "actorId", "verb", "text" ];
              backhelp.verify(createNews, reqFields);
          } catch (e) {
              cb(e);
              return;
          }
          cb(null, createNews);
      },

      // 2. create News document
      function (news_data, cb) {
        data_clone = JSON.parse(JSON.stringify(news_data));

        createNewsDocument(data_clone, function (err, newsId) {
          cb(null, newsId)
        });
      },

      // 3. insert News ID to Group collection
      function (newsId, cb) {
        db.groups.updateOne(
           {_id: ObjectID(groupId)},
           {
             $push: {
                "newsItems.newsIds": {
                   $each: [ newsId ],
                   $position: 0
                }
             },
             $set: { "progress.26": 1}
           },
           { safe: true },
           cb(null, newsId)
        )
      },

      // 4. push News
      function (newsId, cb) {
        news.add_group_notifications(createNews.actorId, 16000, groupId, groupId, groupId, [], createNews.text, null, createNews.pic, 3, function (err) {
          cb(err, newsId)
        })
      }
  ],
  function (err, newsId) {
      if (err) {
        callback(err);
      } else {
        callback(err, err ? null : newsId);
      }
  });

}

export function post_news(itemId: string, updateNews: UpdateNews, callback) {

  async.waterfall([

      // 1. validate data.
      function (cb) {
          try {
              const reqFields: string[] = [ "text" ];
              backhelp.verify(updateNews, reqFields);
          } catch (e) {
              cb(e);
              return;
          }
          cb(null, updateNews);
      },

      // 2. update News document
      function (news_data, cb) {
        pics.delete_pic("news", "pic", itemId, news_data.pic, false, function(err) {
          db.news.updateOne(
             {_id: ObjectID(itemId)},
             { $set:
               {
                 "text": news_data.text,
                 "pic": news_data.pic
               },
             },
             { safe: true },
             cb(null, itemId)
          );
        })
      }

  ],
  function (err, itemId) {
      // 3. convert errors to something we like.
      if (err) {
        callback(err);
      } else {
        callback(err, err ? null : itemId);
      }
  });

}

export function delete_news(groupId: string, newsId: string, callback) {
  async.series({

      // 1. delete News Group Link
      links: function (cb) {
        var progress: number = 1;
        db.groups.aggregate([
            { "$match": { '_id': ObjectID(groupId)}},
            { "$project": {'_id': 0, 'newsItems.newsIds': 1 }}
        ]).next().then(function(item) {
          if (item.newsItems.newsIds.length==1) progress = 0;
          db.groups.updateOne(
             {_id: ObjectID(groupId)},
             {
               $set: { "progress.26": progress },
               $pull: { "newsItems.newsIds": ObjectID(newsId) },
             },
             { multi: false, safe: true },
             cb())
        });
      },

      // 2. delete News Asset
      delete_pic: function (cb) {
        db.news
          .find({ _id: ObjectID(newsId) })
          .project({ _id: 0, "pic": 1 })
          .next().then(function(item) {
            pics.delete_pic_direct(item.pic, function(err) {
              cb()
            })
          });
      },

      // 3. delete News Item
      delete_news: function (cb) {
        db.news.deleteOne({ _id: ObjectID(newsId) },
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

export function comment_id_by_news_id(newsId: string, commentId: string, callback) {
  db.news
    .find({ _id: ObjectID(newsId), ["comments._id"]: ObjectID(commentId) })
    .project({ _id: 0, "comments._id": 1 })
    .next().then(function(item) {
      callback(null, item.comments[0].actor)
    });
}

export function put_comment(groupId: string, newsId: string, createNews: CreateNews, callback) {
  var data_clone;

  async.waterfall([
      // 1. validate data.
      function (cb) {
          try {
            const reqFields: string[] = [ "actorId", "verb", "text" ];
              backhelp.verify(createNews, reqFields);
          } catch (e) {
              cb(e);
              return;
          }
          cb(null, createNews);
      },

      // 2. create Comment
      function (news_data, cb) {
        data_clone = JSON.parse(JSON.stringify(news_data));

        const comment: privateNews =  {"_id": ObjectID(),
                                       "actor": data_clone.actorId,
                                       "verb": data_clone.verb,
                                       "object": null,
                                       "time": new Date(),
                                       "text": data_clone.text,
                                       "pic": data_clone.pic,
                                       "comments": []};

        db.news.updateOne(
           {_id: ObjectID(newsId)},
           {
             $push: {
                "comments": comment
                // "comments": {
                //    $each: [comment],
                //    $position: 0
                // }
             }
           },
           { safe: true },
           cb(null, comment._id)
        )
      },

      // 3. push Comment News
      function (commentId, cb) {
        news.add_group_notifications(data_clone.actorId, 16001, groupId, groupId, groupId, [], data_clone.text, null, data_clone.pic, 3, function (err) {
          cb(err, commentId)
        })
      }

  ],
  function (err, commentId) {
      if (err) {
        callback(err);
      } else {
        callback(err, err ? null : commentId);
      }
  });

}

export function post_comment(commentId: string, newsId: string, updateNews: UpdateNews, callback) {
  var currentPic;

  async.waterfall([

      // 1. validate data.
      function (cb) {
          try {
              const reqFields: string[] = [ "text" ];
              backhelp.verify(updateNews, reqFields);
          } catch (e) {
              cb(e);
              return;
          }
          cb(null, updateNews);
      },

      // 2. delete asset
      function (news_data, cb) {
        db.news
          .find({_id: ObjectID(newsId), "comments._id": ObjectID(commentId)})
          .project({ "comments.$.pic": 1 })
          .next().then(function(item) {
            currentPic = item.comments[0].pic
            if (currentPic && currentPic!=news_data.pic) {
              pics.delete_pic_direct(currentPic, function(err) {
                cb(err, news_data)
              })
            } else {
              cb(null, news_data)
            }
         })
      },

      // 3. update Comment
      function (news_data, cb) {
        db.news.updateOne(
           {_id: ObjectID(newsId), "comments._id": ObjectID(commentId)},
           { $set:
             {
               "comments.$.text": news_data.text,
               "comments.$.pic": news_data.pic,
             },
           },
           { safe: true },
           cb(null, commentId)
        );
      }

  ],
  function (err, commentId) {
      // 3. convert errors to something we like.
      if (err) {
        callback(err);
      } else {
        callback(err, err ? null : commentId);
      }
  });

}

export function delete_comment(commentId: string, newsId: string, callback) {
  async.series({

      // 1. delete Comment Asset
      delete_pic: function (cb) {
        db.news
          .find({_id: ObjectID(newsId), "comments._id": ObjectID(commentId)})
          .project({ "comments.$.pic": 1 })
        .next().then(function(item) {
          pics.delete_pic_direct(item.comments[0].pic, function(err) {
            cb(err)
          })
        })
      },

      // 2. delete Comment Item
      delete_comment: function (cb) {
        db.news.updateOne(
          { _id: ObjectID(newsId)},
          { $pull: { "comments": {"_id": ObjectID(commentId) } } },
          { multi: false, safe: true },
          cb()
        );
      }

  },
  function (err, results) {
      // 3. convert errors to something we like.
      if (err) {
        callback(err);
      } else {
        callback(err, err ? null : results);
      }
  });

}

function createNewsDocument(data, callback) {

  db.news.insertOne(
    {
      "actor": data.actorId,
      "verb": data.verb,
      // "object": data.object,
      "time": new Date(),
      "text": data.text,
      "pic": data.pic,
      "numComments": 0,
      "comments": []
    },
    { w: 1, safe: true }, function(err, docsInserted) {
      callback(null, docsInserted.insertedId);
    }
  );

}

export function news_list(newsIds, callback) {
  var m = { "$match" : {"_id" : { "$in" : newsIds } } };
  var a = { "$addFields" : { "__order" : { "$indexOfArray" : [ newsIds, "$_id" ] } } };
  var s = { "$sort" : { "__order" : 1 } };

  var f = ({ "$project" : {
                           _id: 1, actor: 1, verb: 1, object: 1, time: 1, text: 1, pic: 1,
                           numComments: { $size: "$comments" }
                           // , comments: 1
                          }
          });

  db.news.aggregate( [ m, a, s, f ] ).toArray(callback);
}

export function comments_list(newsId, callback) {
  var m = { "$match" : {_id : ObjectID(newsId) } };
  var f = { "$project" : {_id: 0, comments: 1 } };

  db.news.aggregate( [ m, f ] ).next(callback);
}

// ************** ************** **************
// ************** ************** **************
// **************** Group Kits ****************
// ************** ************** **************
// ************** ************** **************

export function group_papers_kit(flag: boolean, groupId: string, callback) {
  db.groups
    .find(
      {
        _id: ObjectID(groupId),
        $or: [
          {"papersKit.privacy": { $exists: false }},
          {"papersKit.privacy": (flag==true) ? {$in: [0, 1]} : {$in: [1]}}
        ]
      }
    )
    .project({"papersKit": 1, _id: 0})
  .next().then(function(item) {
    callback(null, item ? item["papersKit"] : null)
  });
}


// ************** ************** **************
// ************** ************** **************
// ************** Group Meetings **************
// ************** ************** **************
// ************** ************** **************

export function group_meetings(type: number, flag: boolean, groupId: string, callback) {
  const meetingsitems: string = type ? "pastMeetingsItems" : "futureMeetingsItems";

  db.groups
    .find(
      {
        _id: ObjectID(groupId),
        $or: [
          {"futureMeetingsItems.privacy": { $exists: false }},
          {"futureMeetingsItems.privacy": (flag==true) ? {$in: [0, 1]} : {$in: [1]}}
        ]
      }
    )
    .project({[meetingsitems]: 1, _id: 0})
  .next().then(function(item) {
    callback(null, item ? item[meetingsitems] : null)
  });
}

export function member_id_by_meeting_id(groupId: string, meetingId: string, type: number, callback) {
  var key;

  if (type==0) {
    key = "futureMeetingsItems.meetings._id"
  } else {
    key = "pastMeetingsItems.meetings._id"
  }

  db.groups
    .find({ _id: ObjectID(groupId), [key]: meetingId })
    .project({ _id: 0, "futureMeetingsItems.meetings.$.presenter._id": 1 })
    .next().then(function(item) {
      callback(null, item.futureMeetingsItems.meetings[0].presenter._id)
    });
}

export function put_meetings(groupId: string, userId: string, settings: settingsMeetings, meetings: privateMeeting[], callback) {
  async.waterfall([

    // 1. validate data.
    function (cb) {
        try {
            // const reqFields: string[] = [ "location", "time", "startDate", "duration", "howOften", "howToAdd", "day", "order", "participants" ];
            // const reqFields: string[] = [ "location", "time", "startDate", "duration", "howOften", "howToAdd", "day", "participants" ];
            const reqFields: string[] = [ "location", "time", "startDate", "endDate", "howOften", "howToAdd", "day", "participants" ];
            // secondDay
            backhelp.verify(settings, reqFields);
        } catch (e) {
            cb(e);
            return;
        }
        cb(null);
    },

    // 2. set Meetings Settings and Schedule
    function (cb) {
      db.groups.updateOne(
         {_id: ObjectID(groupId)},
         {
           $set: {
             "futureMeetingsItems.settings": settings,
             "futureMeetingsItems.meetings": meetings,
             "progress.24": 1
           }
         },
         { safe: true },
         cb()
      )
    },

    // 3. push News
    function (cb) {
      // news.add_group_notifications(userId, 16100, groupId, groupId, groupId, [], meetings[0].location, new Date(meetings[0].date).toDateString(), null, 3, function (err) {
      news.add_group_activity(userId, 16100, groupId, groupId, groupId, [], meetings[0].location, new Date(meetings[0].date).toDateString(), null, 3, function (err) {
        cb(err)
      })
    }

  ],
  function (err) {
      // 4. convert errors to something we like.
      if (err) {
        callback(err);
      } else {
        callback(err, null);
      }
  });
};

export function delete_meetings(groupId: string, userId: string, meetingId: number, callback) {
  async.waterfall([

    // 1. Delete all future Assets
    function (cb) {
      db.groups
        .find({_id: ObjectID(groupId)})
        .project({ "futureMeetingsItems.meetings._id": 1, "futureMeetingsItems.meetings.files": 1 })
      .next().then(function(item) {
        async.forEachOf(item.futureMeetingsItems.meetings, function (meeting, key, cb) {
          pics.delete_pic_gallery(meeting.files, function(err) {
            cb(err)
          })
        }, function (err) {
          cb(err)
        })
      })
    },

    // 2. Delete all future meetings
    function (cb) {
      db.groups.updateOne(
         { _id: ObjectID(groupId) },
         {
           $pull: { "futureMeetingsItems.meetings": { "_id": { $ne: meetingId } } },
           $set: {
            "futureMeetingsItems.settings": null,
            "progress.24": 0
           }
         },
         { safe: true },
         cb(null)
      );
    },

    // 2. push News
    function (cb) {
      news.add_group_notifications(userId, 16107, groupId, groupId, groupId, [], null, null, null, 3, function (err) {
        cb(err)
      })
    }

  ],
  function (err) {
      callback(err);
  });
};

export function put_meeting_single(meeting: privateMeeting, groupId: string, userId: string, callback) {
  async.waterfall([

    // 1. validate data.
    function (cb) {
        try {
            const reqFields: string[] = [ "_id", "date", "location", "presenter", "activeFlag" ];
            backhelp.verify(meeting, reqFields);
        } catch (e) {
            cb(e);
            return;
        }
        cb(null, meeting);
    },

    // 2. delete current Assets
    function (meeting_data, cb) {
      db.groups
        .find({_id: ObjectID(groupId), "futureMeetingsItems.meetings._id": meeting._id })
        .project({ "futureMeetingsItems.meetings.$.files": 1 })
      .next().then(function(item) {
        var currentFile = item.futureMeetingsItems.meetings[0].files;
        if (currentFile && currentFile!=meeting.files) {
          pics.delete_pic_gallery(currentFile, function(err) {
             cb(err, meeting_data)
          })
        } else {
          cb(null, meeting_data)
        }
      })
    },

    // 3. update Meeting
    function (meeting_data, cb) {
      db.groups.updateOne(
         {_id: ObjectID(groupId), "futureMeetingsItems.meetings._id": meeting._id },
         { $set: { "futureMeetingsItems.meetings.$": meeting } },
         { safe: true },
         cb(null)
      );
    },

    // 3. notification if 1st meeting
    function (cb) {
      db.groups.aggregate([
      { $match: {"_id": ObjectID(groupId)} },
      { $project: {current: { $arrayElemAt: [ "$futureMeetingsItems.meetings", 0 ] } } }
      ]).next().then(function(item) {
        if (item && item.current._id==meeting._id) {
          news.add_group_notifications(userId, 16105, groupId, groupId, groupId, [], meeting.topic, new Date(meeting.date).toDateString(), null, 3, function (err) {
            cb(err)
          })
        } else {
          cb(null)
        }
      })
    }

  ],
  function (err) {
      // 4. convert errors to something we like.
      if (err) {
        callback(err);
      } else {
        callback(err, null);
      }
  });
}

export function post_meeting_single(groupId: string, userId: string, meetingId: number, type: number, callback) {
  async.waterfall([

    // 1. Cancel / Resume Meeting
    function (cb) {
      db.groups.updateOne(
        {_id: ObjectID(groupId), "futureMeetingsItems.meetings._id": meetingId },
        { $set: { "futureMeetingsItems.meetings.$.activeFlag": (type ? true : false) } },
        { safe: true },
        cb(null)
      );
    },

    // 2. notification if 1st meeting
    function (cb) {
      db.groups.aggregate([
      { $match: {"_id": ObjectID(groupId)} },
      { $project: {current: { $arrayElemAt: [ "$futureMeetingsItems.meetings", 0 ] } } }
      ]).next().then(function(item) {
        if (item.current._id==meetingId) {
          news.add_group_notifications(userId, 16106, groupId, groupId, groupId, [], new Date(item.current.date).toDateString(), type, null, 3, function (err) {
            cb(err)
          })
        } else {
          cb(null)
        }
      })
    }

  ],
  function (err, results) {
      if (err) {
        callback(err);
      } else {
        callback(err, null);
      }
  });
};

export function delete_meeting_single(groupId: string, userId: string, meetingId: number, type: number, callback) {
  var key: string;

  if (type==0) {
    key = "futureMeetingsItems.meetings"
  } else {
    key = "pastMeetingsItems.meetings"
  }

  async.waterfall([

    // 1. notification if 1st meeting
    function (cb) {
      if (type==0) {
        db.groups.aggregate([
        {
          $match: {"_id": ObjectID(groupId)}
        },
        {
          $project: {
            current: { $arrayElemAt: [ "$futureMeetingsItems.meetings", 0 ] },
            next: { $arrayElemAt: [ "$futureMeetingsItems.meetings", 1 ] },
          }
        }
        ]).next().then(function(item) {
          if (item && item.current._id==meetingId) {
            news.add_group_notifications(userId, 16104, groupId, groupId, groupId, [], new Date(item.current.date).toDateString(), item.next ? new Date(item.next.date).toDateString() : null, null, 3, function (err) {
              cb(err)
            })
          } else {
            cb(null)
          }
        })
      } else {
        cb(null)
      }
    },

    // 2. Delete Assets
    function (cb) {
      db.groups
        .find({ _id: ObjectID(groupId), [key+"._id"]: meetingId })
        .project({ _id: 0, "futureMeetingsItems.meetings.$": 1 })
      .next().then(function(item) {
        pics.delete_pic_gallery(item.futureMeetingsItems.meetings[0].files, function(err) {
          cb(err)
        })
      });
    },

    // 3. Delete Meeting
    function (cb) {
      db.groups.updateOne(
         { _id: ObjectID(groupId) },
         { $pull: { [key]: {"_id": meetingId } } },
         { safe: true },
         cb(null)
      );
    }

  ],
  function (err) {
      if (err) {
        callback(err);
      } else {
        callback(err, null);
      }
  });
};

export function meetingsScheduler() {
  var text: string;

  async.waterfall([

    // 1. find expired first Meetings
    function (cb) {
      db.groups.aggregate([
      {
        $match: {"futureMeetingsItems.meetings.0.date": { $exists: true } }
        // $match: {"futureMeetingsItems.meetings.0.location": "Ulman" }
        // $match: {"futureMeetingsItems.meetings.0.date": {$lt: new Date().toISOString()} }
      },
      {
        $project: {current: { $arrayElemAt: [ "$futureMeetingsItems.meetings", 0 ] }, next: { $arrayElemAt: [ "$futureMeetingsItems.meetings", 1 ] } }
      }
      ]).toArray(cb)
    },

    // 2. move current "passed" meeting to past list
    function (groups, cb) {

      async.forEachOf(groups, function (group, key, callback) {

        if (moment(group.current.date).isBetween(moment().subtract(1, 'days'), moment())) {
          // one day before the next meeting - notify all group members
          text =  group.current.location + '. ' + group.current.presenter.name + ' presenting: ' + group.current.title;
          news.add_group_notifications(group._id, 16103, group._id, group._id, group._id, [], text, new Date(group.current.date).toDateString(), null, 3, function (err) {
          });

        } else if (moment(group.current.date).isBefore(moment())) {
          // Current meeting date has just passed.

          async.waterfall([
              // 1. Notify current speaker
              function (cb) {
                news.add_notification(group._id, 16101, group._id, group.current.presenter._id, group._id, [], group.current.topic, null, null, function (err) {
                  cb(err)
                });
              },

              // 2. Notify next speaker
              function (cb) {
                if (group.next) {
                  news.add_notification(group._id, 16102, group._id, group.next.presenter._id, group._id, [], group.next.location, new Date(group.next.date).toDateString(), null, function (err) {
                    cb(err)
                  });
                } else {
                  cb()
                }
              },

              // 3. Move meeting to past
              function (cb) {
                db.groups.updateOne(
                   {_id: ObjectID(group._id)},
                   {
                     $pop: { "futureMeetingsItems.meetings": -1 },
                     $push: { "pastMeetingsItems.meetings": group.current }
                   },
                   { safe: true },
                   cb()
                )
              }

            ],
            function (err) {
              if (err) {
                callback(err)
              } else {
                callback(null)
              }
            });
        }

        // callback();

      }, function (err) {
        cb(err);
      });
    }

    // 3. push News
    // function (projectId, cb) {
    // }

  ],
  function (err) {

  });
};

// ************** ************** **************
// ************** ************** **************
// ************** Group Reports ***************
// ************** ************** **************
// ************** ************** **************

export function put_reports(userId: string, groupId: string, settings: settingsReports, date: Date, callback) {

  async.waterfall([

    // 1. validate data.
    function (cb) {
        try {
            const reqFields: string[] = [ "howOften", "duration", "day", "time", "whoSee", "whoSubmit" ];
            backhelp.verify(settings, reqFields);
        } catch (e) {
            cb(e);
            return;
        }
        cb(null, settings);
    },

    // 2. create Report Settings
    function (settings_data, cb) {
      db.groups.updateOne(
         {_id: ObjectID(groupId)},
         {
           $set: {
             "reportsItems.settings": settings_data,
             "reportsItems.currentReport": {
                                            "submissionDate": date,
                                            "notification": 0,
                                            "whoSee": settings_data.whoSee,
                                            "whoSubmit": settings_data.whoSubmit
                                           },
             "progress.25": 1
           }
         },
         { safe: true },
         cb()
      )
    },

    // 3. push News
    function (cb) {
      news.add_group_notifications(userId, 16200, groupId, groupId, groupId, [], new Date(date).toDateString(), null, null, 3, function (err) {
        cb(err)
      })
    }

  ],
  function (err) {
      // 4. convert errors to something we like.
      callback(err);
  });
};

export function post_reports(groupId: string, userId: string, settings: settingsReports, callback) {
  async.waterfall([

    // 1. validate data.
    function (cb) {
      try {
          const reqFields: string[] = [ "howOften", "duration", "day", "time", "whoSee", "whoSubmit" ];
          backhelp.verify(settings, reqFields);
      } catch (e) {
          cb(e);
          return;
      }
      cb(null, settings);
    },

    // 2. update Report Settings
    function (settings_data, cb) {
      db.groups.updateOne(
         {_id: ObjectID(groupId)},
         { $set: { "reportsItems.settings": settings_data } },
         { safe: true },
         cb()
      )
    }

  ],
  function (err) {
      callback(err);
  });
};

export function delete_reports(groupId: string, userId: string, callback) {
  async.series({

    // 1. delete all Assets
    assets: function (cb) {
      db.groups
        .find({_id: ObjectID(groupId)})
        .project({ "reportsItems.currentReport.whoSubmit.file": 1 })
      .next().then(function(item) {
        async.forEachOf(item.reportsItems.currentReport.whoSubmit, function (who, key, cb) {
          pics.delete_pic_direct(who.file, function(err) {
            cb(err)
          })
        }, function (err) {
          cb(err)
        })
      })
    },

    // 2. delete Reports Schedule
    report: function (cb) {
      db.groups.updateOne(
        {_id: ObjectID(groupId)},
        {
          $set: {
           "reportsItems.settings": "",
           "reportsItems.currentReport": "",
           "progress.25": 0
          }
        },
        { multi: false, safe: true },
        cb()
      )
    },

    // 3. push news
    news: function (cb) {
      news.add_group_notifications(userId, 16205, groupId, groupId, groupId, [], null, null, null, 3, function (err) {
        cb(err)
      })
    }

  },
  function (err) {
    // 4. convert errors to something we like.
    if (err) {
      callback(err);
    } else {
      callback(err, null);
    }
  });

}

export function post_report_single(report: currentReport, groupId: string, userId: string, type: number, callback) {
  report.notification = 0;

  async.waterfall([

    // 1. validate data.
    function (cb) {
      try {
          const reqFields: string[] = [ "submissionDate", "whoSee", "whoSubmit" ];
          backhelp.verify(report, reqFields);
      } catch (e) {
          cb(e);
          return;
      }
      cb(null, report);
    },

    // 2. delete all current Assets
    function (report_data, cb) {
      db.groups
        .find({_id: ObjectID(groupId)})
        .project({ "reportsItems.currentReport.whoSubmit.file": 1 })
      .next().then(function(item) {
        async.forEachOf(item.reportsItems.currentReport.whoSubmit, function (who, key, cb) {
          pics.delete_pic_direct(who.file, function(err) {
            cb(err)
          })
        }, function (err) {
          cb(err, report_data)
        })
      })
    },

    // 3. update Current Report
    function (report_data, cb) {
      db.groups.updateOne(
         {_id: ObjectID(groupId)},
         { $set: { "reportsItems.currentReport": report } },
         { safe: true },
         cb(null, report_data.submissionDate)
      )
    },

    // 4. push News
    function (submissionDate, cb) {
      news.add_group_notifications(userId, (type==0) ? 16204 : (type==2 ? 16206 : 16203), groupId, groupId, groupId, [], new Date(submissionDate).toDateString(), null, null, 3, function (err) {
        cb(err)
      })
    }

  ],
  function (err) {
      callback(err);
  });
}

export function put_report_submit(title: string, current: string, next: string, delay: string, file: string, groupId: string, userId: string, callback) {
  async.waterfall([

    // 1. delete current File
    function (cb) {
      db.groups
        .find({_id: ObjectID(groupId), "reportsItems.currentReport.whoSubmit._id": userId })
        .project({ "reportsItems.currentReport.whoSubmit.$.file": 1 })
      .next().then(function(item) {
        var currentFile = item.reportsItems.currentReport.whoSubmit[0].file;
        if (currentFile && currentFile!=file) {
          pics.delete_pic_direct(currentFile, function(err) {
             cb()
          })
        } else {
          cb()
        }
      })
    },

    // 2. push User Submit
    function (cb) {
      db.groups.updateOne(
        {_id: ObjectID(groupId), "reportsItems.currentReport.whoSubmit._id": userId },
        {
           $set: {
             "reportsItems.currentReport.whoSubmit.$.title": title,
             "reportsItems.currentReport.whoSubmit.$.current": current,
             "reportsItems.currentReport.whoSubmit.$.next": next,
             "reportsItems.currentReport.whoSubmit.$.delay": delay,
             "reportsItems.currentReport.whoSubmit.$.file": file,
             "reportsItems.currentReport.whoSubmit.$.submitStatus": 1
           }
        },
        { safe: true },
        cb(null)
      )
    }

  ],
  function (err) {
      // 2. convert errors to something we like.
      if (err) {
        callback(err);
      } else {
        callback(err, null);
      }
  });
};

export function delete_report_submit(groupId: string, userId: string, type: number, callback) {
  async.waterfall([

    // 1. Delete Assets
    function (cb) {
      db.groups
        .find({ _id: ObjectID(groupId), "reportsItems.currentReport.whoSubmit._id": userId })
        .project({ _id: 0, "reportsItems.currentReport.whoSubmit.$": 1 })
      .next().then(function(item) {
        pics.delete_pic_direct(item.reportsItems.currentReport.whoSubmit[0].file, function(err) {
          cb(err)
        })
      });
    },

    // 2. delete / skip / resume User Submit
    function (cb) {
      db.groups.updateOne(
         { _id: ObjectID(groupId), "reportsItems.currentReport.whoSubmit._id": userId },
         {
           $set: {
             "reportsItems.currentReport.whoSubmit.$.title": "",
             "reportsItems.currentReport.whoSubmit.$.file": "",
             "reportsItems.currentReport.whoSubmit.$.submitStatus": (type==2) ? type : 0
           }
         },
         { safe: true },
         cb(null)
      )
    }
  ],
  function (err) {
    // 2. convert errors to something we like.
    if (err) {
      callback(err);
    } else {
      callback(err, null);
    }
  });
};

export function put_report_remind(data, adminId: string, groupId: string, callback) {
  const peoplesids = JSON.parse(JSON.stringify(data));

  async.forEachOf(peoplesids, function (peopleId, key, cb) {
    news.add_notification(adminId, 16201, groupId, peopleId, groupId, [], "Please submit your report at: " + groupId, null, null, function (err) {
      cb(err)
    });
  }, function (err, results) {
    if (err) {
      callback(err);
    } else {
      callback(null);
    }
  })
}

export function put_report_finalize(data, groupId: string, callback) {
  const reports = JSON.parse(JSON.stringify(data));
  var peopleId: string;
  // var reportsIds: string[] = [];

  async.forEachOf(reports, function (report, key, callback) {
    peopleId=report._id;
    report._id=ObjectID();
    report.groupId=ObjectID(report.groupId);
    // reportsIds.push(report._id);

    db.peoples.updateOne(
       {_id: peopleId},
       {
         $push: {
            "reports": {
               $each: [ report ],
               $position: 0
            }
         }
       },
       { safe: true },
       callback()
    )
  }, function (err) {
    if (err) {
      callback(err);
    } else {
      callback(null);
    }
  })
}

export function reportScheduler() {
  async.waterfall([

    // 1. find expired Reports
    function (cb) {
      db.groups.aggregate([
        { $match: {"reportsItems.currentReport.submissionDate": {$lt: new Date().toISOString()} } },
        { $project: {current: "$reportsItems.currentReport", _id: 1} }
      ]).toArray(cb)
    },

    // 2. push Finalize Reminder News
    function (reports, cb) {
      async.forEachOf(reports, function (report, key, callback) {
        async.forEachOf(report.current.whoSee, function (who, key, callback) {
          // report._id is groupID

          if (report.current.notification==0) {
            news.add_notification(report._id, 16202, report._id, who._id, report._id, [], report.current.submissionDate, null, null, function (err) {
              db.groups.updateOne(
                {_id: ObjectID(report._id)},
                { $set: { "reportsItems.currentReport.notification": 1 } },
                { safe: true },
                callback(err)
              )
            });
          } else {
            callback()
          }

        }, function (err) {
          callback(err);
        });

      }, function (err) {
        cb(err);
      });

    }
  ],
  function (err, eventId) {

  });
};

// ************** ************** **************
// ************** ************** **************
// *************** Group Calendar *************
// ************** ************** **************
// ************** ************** **************

export function group_calendar(ids: string[], callback) {
  async.waterfall([

    // 1. get Meetings & Reports
    function (cb) {
      var m = { "$match" : { "_id" : { "$in" : ids} } };
      var f = { "$project" : { _id: 1, "peoplesItems.activesIds": 1, groupIndex: 1, report: "$reportsItems.currentReport", meetings: { $slice: [ "$futureMeetingsItems.meetings", 3 ] } } };

      db.groups.aggregate( [ m, f ] ).toArray(cb)
    },

    // 2. get Birthdays & Vacations
    function (tasks, cb) {
      const activesIds = [].concat(...tasks.map(r => r.peoplesItems.activesIds))
      var m = { "$match" : { "_id" : { "$in" : activesIds } } };
      var f = { "$project" : { _id: 1, name: 1, birthday: "$personalInfo.birthday", vacations: "$personalInfo.vacations" } };

      db.peoples.aggregate( [ m, f ] ).toArray().then(function(personal) {
        tasks.forEach((task, index) => { delete task.peoplesItems });
        cb(null, {"tasks": tasks, "personal": personal})
      });
    },

  ],
  function (err, calendar) {
    if (err) {
      callback(err);
    } else {
      callback(null, calendar)
    }
  });

}

// ************** ************** **************
// ************** ************** **************
// *************** Personal Info **************
// ************** ************** **************
// ************** ************** **************

export function post_info(info, userId: string, type: number, callback) {
  db.peoples.updateOne(
    {_id: userId},
    { $set:
       {
         "personalInfo.phone": info.phone,
         "personalInfo.address": info.address,
         "personalInfo.birthday": info.birthday,
         // "personalInfo.kids": info.kids,
         "personalInfo.kids": null,
         "personalInfo.vacations": info.vacations,
       },
    },
    { safe: true },
    // callback(null, info.kids.map(r => r._id))
    callback(null, [])
  )
}

// ************** ************** **************


function invalid_private_name() {
    return backhelp.error("invalid_private_name",
                          "Private names can have letters, #s, _ and, -");
}
