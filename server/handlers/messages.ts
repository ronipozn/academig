var helpers = require('./helpers.ts');
var async = require("async");

var messages_data = require("../data/messages.ts");
var people_data = require("../data/peoples.ts");
var group_data = require("../data/groups.ts");
var resource_data = require("../data/resources.ts");
var privilege_data = require("../data/privileges.ts");

import { objectMini } from '../models/shared.ts';
import { ChannelUser } from '../models/messages.ts';

var ObjectID = require('mongodb').ObjectID;

exports.channels = function (req, res) {
  var getp = req.query;
  var mode = parseInt(getp.mode);

  async.waterfall([

    // 1. get Channels IDs (+Security)
    function (cb) {
      if (mode==0) { // one-to-one
        privilege_data.privilages(req.user.sub, null, 10, function (err, userId, flag) {
          people_data.people_info(userId, "channelsIds", function (err, channelsItems) {
            cb(err, userId, channelsItems.channelsIds);
          });
        })
      } else if (mode==1) { // group chat
        privilege_data.privilages(req.user.sub, getp.id, 3, function (err, userId, flag) {
          if (flag) {
            group_data.group_page_items("channelId", getp.id, function (err, channelId) {
              cb(err, userId, [channelId]);
            });
          } else {
            cb(helpers.invalid_privileges());
          }
        })
      // } else if (mode==2) { // resource requests
      //   privilege_data.privilages(req.user.sub, getp.id, 50, function (err, userId, flag) {
      //     if (flag) {
      //       resource_data.channel_items(getp.id, function (err, channelsIds) {
      //         cb(err, userId, channelsIds);
      //       });
      //     } else {
      //       cb(helpers.invalid_privileges());
      //     }
      //   })
      }
    },

    // 2. get Channels
    function (userId: string, channelsIds, cb) {
      if (channelsIds) {
        messages_data.channels_func(userId, channelsIds, mode, function (err, channels) {
          cb(err, channels);
        });
      } else {
        cb(null, []);
      }
    }

    // // 2. get Channels Data
    // function (userId: string, channelsIds, cb) {
    //   if (channelsIds) {
    //     messages_data.channels_list(channelsIds, function (err, channels) {
    //       cb(err, userId, channels);
    //     });
    //   } else {
    //     cb(null, []);
    //   }
    // },

    // // 3. get Blocked IDs list of User
    // function (userId: string, channels, cb) {
    //   if (mode==0) { // one-to-one
    //     people_data.get_followings_ids(12, userId, null, function (err, blockedIds) {
    //       cb (err, userId, channels, blockedIds ? blockedIds.map(id => id.toString()) : null);
    //     });
    //   } else { // group chat
    //     cb (null, userId, channels, null);
    //   }
    // },

    // // 4. dress Peoples (exclude originator)
    // function (userId: string, channels, blockedIds, cb) {
    //   var users, userMe: ChannelUser[];
    //
    //   async.forEachOf(channels, function (channel, key, callback) {
    //     userMe = channel.users.filter(r=>r._id==userId)
    //     users = channel.users.filter(r=>r._id!=userId);
    //
    //     channel["unread"]=userMe[0] ? userMe[0].unread : 0;
    //     channel["block"]=(blockedIds && users[0]) ? (blockedIds.findIndex(id => id==users[0]._id)>-1) : false;
    //
    //     people_data.peoples_list(users.map(r=>r._id), null, null, 0, null, function (err, peoples) {
    //       var arrays = peoples.map(r => r.positions.map(r=> r.groupId))
    //       var flatten = [].concat(...arrays)
    //       group_data.groups_list(flatten, null, null, null, null, 2, true, function (err, items) {
    //         peoples.forEach(function(people) {
    //           people.positions.forEach(function(position) {
    //             position.group=items.find(item => item._id.toString() == position.groupId.toString()).groupIndex
    //             delete position.groupId;
    //           })
    //         })
    //         // cb(err,peoples);
    //         channel["users"]=peoples;
    //         callback();
    //       });
    //     });
    //
    //   }, function (err) {
    //     cb(err, channels);
    //   });
    // }

  ],
  function (err, channels) {
    if (err) {
      helpers.send_failure(res, helpers.http_code_for_error(err), err);
    } else {
      helpers.send_success(res, channels);
    }
  });
}

exports.channelPut = function (req, res) {
  var getp = req.query;

  async.waterfall([

    // 1. make sure Channel Item is valid
    function (cb) {
      if (!req.body) {
        cb(helpers.no_such_item());
        return;
      }
      cb(null);
    },

    // 2. validate Privilages
    function (cb) {
      privilege_data.privilages(req.user.sub, null, 10, function (err, userId, flag) {
        if (flag) cb(err, userId); else cb(helpers.invalid_privileges());
      })
    },

    // 3. put Channel
    function (userId: string, cb) {
      messages_data.put_channel(userId, req.body, function (err, channelId) {
        cb(err, channelId)
      });
    }

  ],
  function (err, channelId) {
    if (err) {
      helpers.send_failure(res, helpers.http_code_for_error(err), err);
    } else {
      helpers.send_success(res, channelId);
    }
  });

};

exports.channelPost = function (req, res) {
  var getp = req.query;

  var mode = parseInt(getp.mode);
  var type = parseInt(getp.type);

  async.waterfall([

    // 1. make sure Channel Item and Post Parameters are valid
    function (cb) {
      if (!ObjectID.isValid(getp.id) || mode<0 || mode>1 || (type!=0 && type!=1 && type!=5)) {
        cb(helpers.no_such_item());
        return;
      }
      cb();
    },

    // 2. validate Privilages
    function (cb) {
      privilege_data.privilages(req.user.sub, getp.id, 60, function (err, userId, flag) {
        if (flag) cb(err, userId); else cb(helpers.invalid_privileges());
      })
    },

    // 3. put Channel
    function (userId: string, cb) {
      messages_data.post_channel(getp.id, userId, mode, type, function (err) {
        cb(err)
      });
    }

  ],
  function (err) {
    if (err) {
      helpers.send_failure(res, helpers.http_code_for_error(err), err);
    } else {
      helpers.send_success(res);
    }
  });

};

exports.channelDelete = function (req, res) {
  var getp = req.query;

  async.waterfall([

    // 1. make sure the Channel ID is valid
    function (cb) {
      if (!ObjectID.isValid(getp.id)) {
        cb(helpers.no_such_item());
        return;
      }
      cb(null);
    },

    // 2. validate Privilages
    function (cb) {
      privilege_data.privilages(req.user.sub, getp.id, 60, function (err, userId, flag) {
        if (flag) cb(err, userId); else cb(helpers.invalid_privileges());
      })
    },

    // 3. delete Channel
    function (userId: string, cb) {
      messages_data.delete_channel(getp.id, userId, function (err, id) {
        cb(err)
      });
    },

  ],
  function (err, channelId) {
    if (err) {
      helpers.send_failure(res, helpers.http_code_for_error(err), err);
    } else {
      helpers.send_success(res, channelId);
    }
  });

};

exports.messages = function (req, res) {
  var getp = req.query;

  var mode = parseInt(getp.mode);

  async.waterfall([

    // 1. make sure Channel ID is valid
    function (cb) {
      if (!ObjectID.isValid(getp.id)) {
        cb(helpers.no_such_item());
        return;
      }
      cb(null);
    },

    // 2. validate Privilages
    function (cb) {
      privilege_data.privilages(req.user.sub, getp.id, 60, function (err, userId, flag) {
        if (flag) cb(err, userId); else cb(helpers.invalid_privileges());
      })
    },

    // 3. reset Unread counter
    function (userId: string, cb) {
      messages_data.unread_reset(getp.id, userId, function (err) {
        cb(err, userId);
      });
    },

    // 4. get Channel Messages Data
    function (userId: string, cb) {
      messages_data.messages_list(getp.id, userId, mode, function (err, data) {
        cb(err, data.messages);
      });
    },

  ],
  function (err, messages) {
    if (err) {
      helpers.send_failure(res, helpers.http_code_for_error(err), err);
    } else {
      helpers.send_success(res, messages);
    }
  });
}

exports.messagePut = function (req, res) {
  var getp = req.query;

  var mode = parseInt(getp.mode);

  async.waterfall([

    // 1. make sure Message Item, Channel ID are valid
    function (cb) {
      if (!req.body.message || !ObjectID.isValid(getp.id)) {
        cb(helpers.no_such_item());
        return;
      }
      cb(null);
    },

    // 2. validate Privilages
    function (cb) {
      privilege_data.privilages(req.user.sub, getp.id, 60, function (err, userId, flag) {
        if (flag) cb(err, userId); else cb(helpers.invalid_privileges());
      })
    },

    // 3. put Message
    function (userId: string, cb) {
      messages_data.put_message(req.body.message, getp.id, userId, getp.groupId, req.body.ids, mode, function (err, messageId) {
        cb(err, messageId)
      });
    }

  ],
  function (err, messageId) {
    if (err) {
      helpers.send_failure(res, helpers.http_code_for_error(err), err);
    } else {
      helpers.send_success(res, messageId);
    }
  });

};

exports.messageDelete = function (req, res) {
  var getp = req.query;

  async.waterfall([

    // 1. make sure Channel ID, Message ID are valid
    function (cb) {
      if (!ObjectID.isValid(getp.id) || !ObjectID.isValid(getp.messageId)) {
        cb(helpers.no_such_item());
        return;
      }
      cb(null);
    },

    // 2. validate Privilages
    function (cb) {
      privilege_data.privilages(req.user.sub, getp.id, 60, function (err, userId, flag) {
        if (flag) cb(err); else cb(helpers.invalid_privileges());
      })
    },

    // 3. delete Message Asset
    function (cb) {
      messages_data.delete_message_pic(getp.id, getp.messageId, function (err, id) {
        cb(err)
      });
    },

    // 4. delete Message
    function (cb) {
      messages_data.delete_message(getp.id, getp.messageId, function (err, id) {
        cb(err)
      });
    }

  ],
  function (err) {
    if (err) {
      helpers.send_failure(res, helpers.http_code_for_error(err), err);
    } else {
      helpers.send_success(res);
    }
  });

};
