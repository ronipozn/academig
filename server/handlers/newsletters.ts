var helpers = require('./helpers.ts');
var async = require("async");

var newsletter_data = require("../data/newsletter.ts");
var privilege_data = require("../data/privileges.ts");
var people_data = require("../data/peoples.ts");

import { objectMini } from '../models/shared.ts';

exports.version = "0.1.0";

exports.dailyPut = function (req, res) {
  var getp = req.query;

  newsletter_data.put_daily(req.body, function (err) {
    if (err) {
      helpers.send_failure(res, helpers.http_code_for_error(err), err);
    } else {
      helpers.send_success(res);
    }
  });
};

exports.storyPut = function (req, res) {
  async.waterfall([

    function (cb) {
      if (!req.user) {
        cb(null, null);
      } else {
        privilege_data.privilages(req.user.sub, null, 10, function (err, userId, flag) {
          cb(err, userId);
        })
      }
    },

    function (userId: string, cb) {
      people_data.peoples_list([userId], null, null, 1, null, function (err, items) {
        cb(err,items[0]);
      });
    },

    function (userMini: objectMini, cb) {
      newsletter_data.put_story(userMini, req.body, function (err) {
        cb(err);
      });
    }

  ],
  function (err) {
    if (err) {
      helpers.send_failure(res, helpers.http_code_for_error(err), err);
    } else {
      helpers.send_success(res);
    }
  })
};

// %%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%
// %%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%
// %%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%
// %%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%


exports.storyDetails = function (req, res) {
  var getp = req.query;

  async.waterfall([

    function (cb) {
      if (!req.params || !req.params.storyId || getp.year==null || getp.month==null || getp.day==null) {
        cb(helpers.no_such_item());
        return;
      }
      cb(null);
    },

    function (cb) {
      if (!req.user) {
        cb(null, null);
      } else {
        privilege_data.privilages(req.user.sub, null, 10, function (err, userId, flag) {
          cb(err, userId);
        })
      }
    },

    function (userId: string, cb) {
      newsletter_data.story_details(userId, getp.year, getp.month, getp.day, req.params.storyId, function (err, story) {
        cb(err, story);
      })
    }

  ],
  function (err, story) {
    if (err) {
      helpers.send_failure(res, helpers.http_code_for_error(err), err);
    } else {
      helpers.send_success(res, story);
    }
  })
}
