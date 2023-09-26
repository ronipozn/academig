var helpers = require('./helpers.ts');
var async = require("async");

var app_data = require("../data/apps.ts");
var people_data = require("../data/peoples.ts");
var privilege_data = require("../data/privileges.ts");

var ObjectID = require('mongodb').ObjectID;

exports.version = "0.1.0";

exports.appsByIds = function (req, res) {
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
      people_data.get_followings_ids(60, userId, null, function (err, followingsIds) {
        cb(err, followingsIds);
      });
    },

    // 3. Apps List
    function (followingsIds, cb) {
      app_data.apps_list(followingsIds, followingsIds, function (err, apps) {
        cb(err, apps)
      })
    }

  ],
  function (err, apps) {
    if (err) {
      helpers.send_failure(res, helpers.http_code_for_error(err), err);
    } else {
      helpers.send_success(res, apps);
    }
  });
}

exports.appDataByURL = function (req, res) {
  var getp = req.params;

  async.waterfall([

    // 1. get App ID
    function (cb) {
      app_data.app_id(getp.app, function (err, appId) {
        if (appId==null) {
          cb("No such app", null);
        } else {
          cb(null, appId);
        }
      });
    },

    // 2. get user ID (Flag)
    function (appId: string, cb) {
      if (!req.user) {
        cb(null, null, appId);
      } else {
        privilege_data.privilages(req.user.sub, null, 10, function (err, userId, flag) {
          cb(null, userId, appId);
        })
      }
    },

    // 3. get followings IDs
    function (userId: string, appId: string, cb) {
      people_data.get_followings_ids(60, userId, null, function (err, followingsIds) {
        cb(err, appId, followingsIds);
      });
    },

    // 4. get App details
    function (appId: string, followingsIds: string[], cb) {
      app_data.app_details(appId, followingsIds, function (err, app) {
        cb(err, app);
      });
    },

    // 3. get Counters
    // function (appId: string, app, cb) { }

  ],
  function (err, app) {
    if (err) {
      helpers.send_failure(res, helpers.http_code_for_error(err), err);
    } else {
      helpers.send_success(res, app);
    }
  });
}

exports.appHomePage = function (req, res) {
  var getp = req.query;

  if (!ObjectID.isValid(getp.id)) {
    helpers.send_success(res, []);
    return;
  }

  app_data.app_home_items(getp.id, function (err, page_items) {
    if (err) {
      helpers.send_failure(res, 500, err);
      return;
    }
    helpers.send_success(res, page_items);
  });
};

exports.appDelete = function (req, res) {
  var getp = req.query;

  async.waterfall([

    // make sure App ID is valid
    function (cb) {
      if (!ObjectID.isValid(getp.id)) {
        cb(helpers.no_such_item());
        return;
      }
      cb();
    },

    // delete App
    function (cb) {
      app_data.delete_app(getp.id, cb);
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
      app_data.put_submit_app(userId, req.body, function (err) {
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
