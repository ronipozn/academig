var helpers = require('./helpers.ts');
var async = require("async");

var trend_data = require("../data/trends.ts");
var shared_data = require("../data/shared.ts");
var privilege_data = require("../data/privileges.ts");

var ObjectID = require('mongodb').ObjectID;

exports.version = "0.1.0";

exports.trendDataByURL = function (req, res) {
  var getp = req.params;

  async.waterfall([

    // 1. get Trend ID
    function (cb) {
      trend_data.trend_id(getp.trend, function (err, trendId) {
        if (trendId==null) {
          cb("No such trend", null);
        } else {
          cb(null, trendId);
        }
      });
    },

    // 2. get Trend details
    function (trendId: string, cb) {
      trend_data.trend_details(trendId, function (err, trend) {
        cb(err, trend);
        // cb(err, trendId, trend);
      });
    },

    // 3. get Counters
    // function (trendId: string, trend, cb) { }

  ],
  function (err, trend) {
    if (err) {
      helpers.send_failure(res, helpers.http_code_for_error(err), err);
    } else {
      helpers.send_success(res, trend);
    }
  });
}

exports.trendHomePage = function (req, res) {
  var getp = req.query;

  if (!ObjectID.isValid(getp.id)) {
    helpers.send_success(res, []);
    return;
  }

  trend_data.trend_home_items(getp.id, function (err, page_items) {
    if (err) {
      helpers.send_failure(res, 500, err);
      return;
    }
    helpers.send_success(res, page_items);
  });
};

exports.trendDelete = function (req, res) {
  var getp = req.query;

  async.waterfall([

    // make sure Trend ID is valid
    function (cb) {
      if (!ObjectID.isValid(getp.id)) {
        cb(helpers.no_such_item());
        return;
      }
      cb();
    },

    // delete Trend
    function (cb) {
      trend_data.delete_trend(getp.id, cb);
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
      trend_data.put_submit_trend(userId, req.body, function (err) {
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
