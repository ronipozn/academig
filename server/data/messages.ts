var db = require('../db.ts'),
    async = require('async'),
    backhelp = require("./backend_helpers.ts");

var ObjectID = require('mongodb').ObjectID;
// var Pusher = require('pusher');

var server = require('../../server.ts');

var groups = require("./groups.ts");
var peoples = require("./peoples.ts");
var news = require("./news.ts");
var shared = require("./shared.ts");
var pics = require("./pics.ts");

import { Message, ChannelUser } from '../models/messages.ts';

// const pusher = new Pusher({
//   appId: '485988',
//   key: '562fc24342c58e11a061',
//   secret: '16a76a502acf8f630efc',
// });

exports.versin = "0.1.0";

export function put_channel(userId: string, ids: string[], callback) {
  // var channels;

  async.waterfall([

    // 1. validate data.
    function (cb) {
      try {
        if (ids.findIndex(i => i==userId)==-1) {
          throw exports.error("missing_user_channel_put",userId);
        }
      } catch (e) {
        cb(e);
        return;
      }
      cb(null, ids);
    },

    // 2. check channel existent
    function (ids: string[], cb) {
      db.channels.findOne( // limit size of 2
        { "users._id": { $all: ids }, "mode": 0 }
        // { "users._id": { $all: ids }, "type": 0 }
      ).then(function(item) {
        // console.log('item',item)
        cb(null,
           (item==null) ? ids : null,
           (item==null) ? null : item._id);
      })
    },

    // 3. create Channel
    function (ids: string[], existChannelId: string, cb) {
      if (ids) {
        createChannelDocument(ids, null, 0, function (err, channelId) {
          cb(err, ids, channelId)
        });
      } else {
        cb(null, null, existChannelId)
      }
    },

    // 4. push Channel ID to associated users
    function (ids: string[], channelId: string, cb) {
      if (ids) {
        async.forEachOf(ids, function (id, key, callback) {
          db.peoples.updateOne(
             {_id: id},
             {
              $push: {
                 "channelsIds": {
                    $each: [ ObjectID(channelId) ],
                    $position: 0
                 }
              }
             },
             { safe: true },
             callback()
          )
        }, function (err) {
          cb(err, channelId);
        })
      } else {
        cb(null, channelId)
      }
    },

  ],
  function (err, channelId) {
      if (err) {
        callback(err);
      } else {
        callback(err, err ? null : channelId);
      }
  });
};

export function post_channel(channelId: string, userId: string, mode: number, type: number, callback) {
  if (mode==0) { // user requested
    db.channels.updateOne(
       { _id: ObjectID(channelId), "users._id": userId },
       { $set: { "users.$.type": type } },
       { safe: true },
       callback()
    )
  } else if (mode==1) { // service owners
    db.channels.findOne(
       {_id: ObjectID(channelId)},
       {_id: 0, "parentId": 1}
    ).then(function(item) {
      db.resources.updateOne(
        {_id: ObjectID(item.parentId), "requests.channelId": ObjectID(channelId)},
        { $set: { "requests.$.type": type } },
        { safe: true },
        callback()
      )
    })
  } else {
    callback()
  }
};

export function delete_channel(channelId: string, userId: string, callback) {
  // console.log('channelId',channelId,userId)
  // var m = { "$match": {"_id" : ObjectID(channelId) } };
  // var f = { "$project": { count: { $size: "$messages" } } };
  db.channels.updateOne(
     {_id: ObjectID(channelId), "users._id": userId},
     { $set: { "users.$.first": 0 } },
     { safe: true },
     callback()
  )
  // });
};

export function put_member(channelId: string, userId: string, callback) {
  var channels;

  async.waterfall([
      // 1. push new User ID to Channel ID
      function (cb) {
        db.channels.updateOne(
          {_id: ObjectID(channelId)},
          { $push: { "users": {"_id": userId, "unread": 0 } } },
          { safe: true },
          cb()
        );
      }
  ],
  function (err, channelId) {
      if (err) {
        callback(err);
      } else {
        callback(err, err ? null : channelId);
      }
  });
};

export function delete_member(channelId: string, userId: string, callback) {
  var channels;

  async.waterfall([
      // 1. pull new User ID from Channel ID
      function (cb) {
        db.channels.updateOne(
          {_id: ObjectID(channelId)},
          { $pull: { "users": {"_id": userId } } },
          { safe: true },
          cb()
        );
      }
  ],
  function (err, channelId) {
      if (err) {
        callback(err);
      } else {
        callback(err, err ? null : channelId);
      }
  });
};

export function put_message(message: Message, channelId: string, userId: string, groupId: string, absentIds: string[], mode: number, callback) {
  async.waterfall([
      // 1. validate data.
      function (cb) {
        try {
            const reqFields: string[] = [ "type", "userId", "date" ];
            backhelp.verify(message, reqFields);
            if (message.type==0) {
              const reqFields: string[] = [ "text" ];
            } else {
              const reqFields: string[] = [ "file" ];
            }
            backhelp.verify(message, reqFields);
        } catch (e) {
            cb(e);
            return;
        }
        cb(null, message);
      },

      // 2. push Message
      function (message, cb) {
        message._id = ObjectID();

        db.channels.updateOne(
           { _id: ObjectID(channelId) },
           {
             $push: { "messages": message },
             $inc: { "users.0.first": -1, "users.1.first": -1 }
           },
           { safe: true },
           cb(null, message._id)
        )
      },

      // 3. push Message Notification (only if the other person is not binded to this channel)
      function (messagelId, cb) {
        // console.log('absentIds',absentIds)
        if (absentIds[0]) {
          var channel = 'private-notifications-'+absentIds[0];

          if (mode==0) {
            var eventData = {
                              'channel_name': 'presence-chat-'+channelId,
                              'initiated_by': userId,
                              'chat_with'   : absentIds[0]
                            };

            server.message_notification(channel, eventData, function(err, item) {
              cb(err,messagelId)
            });

          } else if (mode==1) {
            var eventData = {
                              'channel_name': 'presence-group-'+channelId,
                              'initiated_by': userId,
                              'chat_with'   : absentIds[0]
                            };

            news.add_group_notifications(userId, 16400, groupId, groupId, groupId, [], (message.type==0) ? message.text : null, (message.type==0) ? null : message.file, null, 3, function (err) {
              cb(err, messagelId)
            })
          }

        } else {
          cb(null, messagelId)
        }
      },

      // 4. increase Unread count (only if other person is not binded to this channel)
      function (messagelId, cb) {
        if (absentIds[0]) {
          db.channels.updateOne(
             { _id: ObjectID(channelId), "users._id": { $in: absentIds.map(r => r) } },
             { $inc: { "users.$.unread": 1 } },
             { safe: true },
             cb(null, messagelId)
          )
        } else {
          cb(null, messagelId)
        }
      }

  ],
  function (err, messagelId) {
      if (err) {
        callback(err);
      } else {
        callback(err, err ? null : messagelId);
      }
  });
};

export function delete_message(channelId: string, messageId: string, callback) {
  db.channels.updateOne(
    {_id: ObjectID(channelId), "messages._id": ObjectID(messageId)},
      { $set:
        {
         "messages.$.text": "",
         "messages.$.file": "",
         "messages.$.type": 10,
        },
    },
    { safe: true },
    callback()
  )
};

export function delete_message_pic(channelId: string, messageId: string, callback) {
  db.channels
    .find({_id: ObjectID(channelId), "messages._id": ObjectID(messageId)})
    .project({ "messages.$.file": 1 })
  .next().then(function(item) {
    pics.delete_pic_direct(item.messages[0].file, function(err) {
      callback()
    })
  })
};

export function createChannelDocument(ids: string[], parentId: string, mode: number, callback) {

  var users: ChannelUser[] = [];

  ids.forEach((id, index) => {
    users[index]= {"_id": id,
                   "unread": 0,
                   "first": 0,
                   "type": 0}
  });

  db.channels.insertOne(
    {
      "users": users,
      "parentId": parentId,
      "mode": mode, // 0 - 1on1 chat
                    // 1 - group request
                    // 2 - service request
      "messages": [],
    },
    { w: 1, safe: true }, function(err, docsInserted) {
      callback(null, docsInserted.insertedId);
    }
  );

}

export function channels_func(userId: string, channelsIds: string[], mode: number, callback) {
  async.waterfall([

    // 1. get Channels Data
    function (cb) {
      if (channelsIds) {
        channels_list(channelsIds, function (err, channels) {
          cb(err, channels);
        });
      } else {
        cb(null, []);
      }
    },

    // 2. get Blocked IDs list of User
    function (channels, cb) {
      if (mode==0) { // one-to-one
        peoples.get_followings_ids(12, userId, null, function (err, blockedIds) {
          cb (err, channels, blockedIds ? blockedIds.map(id => id.toString()) : null);
        });
      } else { // group chat / service requests
        cb (null, channels, null);
      }
    },

    // 3. dress Peoples (exclude originator)
    function (channels, blockedIds, cb) {
      var users, userMe: ChannelUser[];

      async.forEachOf(channels, function (channel, key, callback) {
        userMe = channel.users.filter(r=>r._id==userId)
        users = channel.users.filter(r=>r._id!=userId);

        channel["unread"]=userMe[0] ? userMe[0].unread : 0;
        channel["type"]=userMe[0] ? userMe[0].type : 0;
        channel["block"]=(blockedIds && users[0]) ? (blockedIds.findIndex(id => id==users[0]._id)>-1) : false;

        peoples.peoples_list(users.map(r=>r._id), null, null, 0, null, function (err, peoples) {
          var arrays = peoples.map(r => r.positions.map(r=> r.groupId))
          var flatten = [].concat(...arrays)
          groups.groups_list(flatten, null, null, null, null, 2, true, function (err, items) {
            peoples.forEach(function(people) {
              people.positions.forEach(function(position) {
                position.group=items.find(item => item._id.toString() == position.groupId.toString()).groupIndex
                delete position.groupId;
              })
            })
            channel["users"]=peoples;
            callback();
          });
        });

      }, function (err) {
        cb(err, channels);
      });
    }

  ],
  function (err, channels) {
    if (err) {
      callback(err);
    } else {
      callback(err, channels);
    }
  });
}

function channels_list(channelsIds: string[], callback) {
  var m = { "$match" : {"_id" : { "$in" : channelsIds } } };
  var a = { "$addFields" : { "__order" : { "$indexOfArray" : [ channelsIds, "$_id" ] } } };
  var s = { "$sort" : { "__order" : 1 } };
  var f = ({ "$project" : { _id: 1, users: 1, message: { $arrayElemAt: [ "$messages", -1 ] }} });

  db.channels.aggregate( [ m, a, s, f ] ).toArray(callback);
}

export function messages_list(channelId: string, userId: string, mode: number, callback) {
  console.log('channelId',channelId)
  console.log('userId',userId)

  db.channels
    .find({ "_id": ObjectID(channelId), "users._id": userId })
    .project({ "_id": 0, "users.$.first": 1 })
  .next().then(function(item) {

    var m = { "$match": { "_id": ObjectID(channelId) } };
    var f;

    if (mode==0) {
      f = { "$project": { messages: { $slice: [ "$messages", item.users[0].first ] } } };
    } else {
      f = { "$project": { messages: 1 } };
    }

    db.channels.aggregate( [ m, f ] ).next(callback);
  });

  // var m = { "$match": {"_id" : ObjectID(channelId) }, "users._id": ObjectID("5abcab28162fd645824a8d45") };
  // var u = { "$unwind" : '$users' };
  // var g = { "$group": {  first: {$sum :1} } };
  // var f = { "$project": { messages: { $slice: [ "$messages", "$users.$.first" ] } } };
  // var f = { "$project": { messages: "$users.0.first" } };

  // db.channels.aggregate( [ m, f ] ).next(callback);
}

export function unread_reset(channelId: string, userId: string, callback) {
  db.channels.updateOne(
     {_id: ObjectID(channelId), "users._id": userId},
     { $set: { "users.$.unread": 0 } },
     { safe: true },
     callback()
  )
}

export function unread_sum(channelsIds: string[], userId: string, callback) {

  async.waterfall([
    function (cb) {
      if (channelsIds) {

        db.channels.aggregate(
           [
             {
               $match: {"_id" : { "$in" : channelsIds.map(r => ObjectID(r)) } }
             },
             {
               $project:
                 {
                  _id: 0,
                  user: {
                            $filter: {
                              input: "$users",
                              as: "users",
                              cond: { $eq: [ "$$users._id", userId ] }
                            },
                          }
                 }
             }
           ]
        ).next().then(function(items) {
          if (items) {
            callback(null, items.user.map(r=>r.unread).reduce((a, b) => a + b, 0));
          } else {
            callback(null)
          }
        });

      } else {

        cb(null, 0);

      }
    }

  ],
  function (err, unread) {
      if (err) {
        callback(err);
      } else {
        callback(err, err ? null : unread);
      }
  });
};

function invalid_channel_name() {
    return backhelp.error("invalid_channel_name",
                          "Channel names can have letters, #s, _ and, -");
}
