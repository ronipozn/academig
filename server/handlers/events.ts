var helpers = require('./helpers.ts');
var async = require("async");

var event_data = require("../data/events.ts");
var people_data = require("../data/peoples.ts");
var privilege_data = require("../data/privileges.ts");

var ObjectID = require('mongodb').ObjectID;

exports.version = "0.1.0";

exports.eventsByIds = function (req, res) {
  // var getp = req.query;
  async.waterfall([
    // 1. validate Privilages
    function (cb) {
      privilege_data.privilages(req.user.sub, null, 10, function (err, userId, flag) {
        if (flag) cb(err, userId); else cb(helpers.invalid_privileges());
      })
    },

    // 2. get followings IDs
    function (userId: string, cb) {
      people_data.get_followings_ids(50, userId, null, function (err, followingsIds) {
        cb(err, followingsIds);
      });
    },

    // 3. Events List
    function (followingsIds, cb) {
      event_data.events_list(followingsIds, followingsIds, function (err, events) {
        cb(err, events)
      })
    }

  ],
  function (err, events) {
    if (err) {
      helpers.send_failure(res, helpers.http_code_for_error(err), err);
    } else {
      helpers.send_success(res, events);
    }
  });
}

exports.eventDataByURL = function (req, res) {
  var getp = req.params;

  async.waterfall([

    // 1. get Event ID
    function (cb) {
      event_data.event_id(getp.event, function (err, eventId) {
        if (eventId==null) {
          cb("No such event", null);
        } else {
          cb(null, eventId);
        }
      });
    },

    // 2. get user ID (Flag)
    function (eventId: string, cb) {
      if (!req.user) {
        cb(null, null, eventId);
      } else {
        privilege_data.privilages(req.user.sub, null, 10, function (err, userId, flag) {
          cb(null, userId, eventId);
        })
      }
    },

    // 3. get followings IDs
    function (userId: string, eventId: string, cb) {
      people_data.get_followings_ids(50, userId, null, function (err, followingsIds) {
        cb(err, eventId, followingsIds);
      });
    },

    // 4. get Event details
    function (eventId: string, followingsIds: string[], cb) {
      event_data.event_details(eventId, followingsIds, function (err, event) {
        cb(err, event);
        // cb(err, eventId, event);
      });
    },

    // 3. get Counters
    // function (eventId: string, event, cb) { }

  ],
  function (err, event) {
    if (err) {
      helpers.send_failure(res, helpers.http_code_for_error(err), err);
    } else {
      helpers.send_success(res, event);
    }
  });
}

exports.eventHomePage = function (req, res) {
  var getp = req.query;

  if (!ObjectID.isValid(getp.id)) {
    helpers.send_success(res, []);
    return;
  }

  event_data.event_home_items(getp.id, function (err, page_items) {
    if (err) {
      helpers.send_failure(res, 500, err);
      return;
    }
    helpers.send_success(res, page_items);
  });
};

exports.eventDelete = function (req, res) {
  var getp = req.query;

  async.waterfall([

    // make sure Event ID is valid
    function (cb) {
      if (!ObjectID.isValid(getp.id)) {
        cb(helpers.no_such_item());
        return;
      }
      cb();
    },

    // delete Event
    function (cb) {
      event_data.delete_event(getp.id, cb);
    }

  ],
  function (err, results) {
    if (err) {
      helpers.send_failure(res, helpers.http_code_for_error(err), err);
    } else {
      helpers.send_success(res, results);
    }
  });
};

exports.submitPut = function (req, res) {
  var getp = req.query;

  async.waterfall([

    // 1. validate Privilages
    function (cb) {
      privilege_data.privilages(req.user.sub, null, 10, function (err, userId, flag) {
        if (flag) cb(err, userId); else cb(helpers.invalid_privileges());
      })
    },

    // 2. put Submit
    function (userId: string, cb) {
      event_data.put_submit_event(userId, req.body, function (err) {
        cb(err)
      });
    }

  ],
  function (err) {
    if (err) {
      helpers.send_failure(res, helpers.http_code_for_error(err), err);
    } else {
      helpers.send_success(res, null);
    }
  });

};
