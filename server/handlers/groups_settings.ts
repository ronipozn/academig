var helpers = require('./helpers.ts');
var async = require("async");

var group_settings_data = require("../data/groups_settings.ts");
var privilege_data = require("../data/privileges.ts");

import {objectMini} from '../models/shared.ts';

var ObjectID = require('mongodb').ObjectID;

exports.version = "0.1.0";

exports.account = function (req, res) {
  var getp = req.query;

  async.waterfall([

    // 1. make sure Group ID
    function (cb) {
      if (!ObjectID.isValid(getp.id)) {
        cb(helpers.no_such_item());
        return;
      }
      cb(null);
    },

    // 2. validate Privilages
    function (cb) {
      privilege_data.privilages(req.user.sub, getp.id, 0, function (err, userId, flag) {
        if (flag) cb(err); else cb(helpers.invalid_privileges());
      })
    },

    // 3. update Items Order
    function (cb) {
      group_settings_data.group_account(getp.id, function (err, account) {
        cb(err, account)
      })
    }

  ],
  function (err, account) {
    if (err) {
      helpers.send_failure(res, helpers.http_code_for_error(err), err);
    } else {
      helpers.send_success(res, account);
    }
  });

}

exports.privacyPost = function (req, res) {
  var getp = req.query;
  var type = parseInt(getp.type);
  var mode = parseInt(getp.mode);

  async.waterfall([

    // 1. validate Privilages
    function (cb) {
      privilege_data.privilages(req.user.sub, getp.id, 0, function (err, userId, flag) {
        if (flag) cb(err, userId); else cb(helpers.invalid_privileges());
      })
    },

    // 2. update Privacy
    function (userId: string, cb) {
      group_settings_data.update_privacy(getp.id, type, mode, function (err) {
        cb(err);
      })
    }

  ],
  function (err) {
    if (err) {
      helpers.send_failure(res, helpers.http_code_for_error(err), err);
    } else {
      helpers.send_success(res, null);
    }
  });
}

exports.dataPost = function (req, res) {
  var getp = req.query;

  async.waterfall([

    // 1. make sure Group Size
    function (cb) {
      if (!ObjectID.isValid(getp.id) || req.body.size==null) {
        cb(helpers.no_such_item());
        return;
      }
      cb(null);
    },

    // 2. validate Privilages
    function (cb) {
      privilege_data.privilages(req.user.sub, getp.id, 0, function (err, userId, flag) {
        if (flag) cb(err, userId); else cb(helpers.invalid_privileges());
      })
    },

    // 3. update Data
    function (userId: string, cb) {
      group_settings_data.update_data(getp.id, req.body, function (err) {
        cb(err);
      })
    }

  ],
  function (err) {
    if (err) {
      helpers.send_failure(res, helpers.http_code_for_error(err), err);
    } else {
      helpers.send_success(res, null);
    }
  });
}

//////////////////////////////////////
//////////////////////////////////////
///////// Group Notifications ////////
//////////////////////////////////////
//////////////////////////////////////

exports.notifications = function (req, res) {
  var getp = req.query;

  async.waterfall([

    // 1. validate Privilages
    function (cb) {
      privilege_data.privilages(req.user.sub, getp.id, 0, function (err, userId, flag) {
        if (flag) cb(err); else cb(helpers.invalid_privileges());
      })
    },

    // 2. get Notifications Status
    function (cb) {
      group_settings_data.group_notifications(getp.id, function (err, item) {
        cb(err, item.subscribe ? item.subscribe : [1,1]);
      });
    }

  ],
  function (err, notifications) {
    if (err) {
      helpers.send_failure(res, helpers.http_code_for_error(err), err);
    } else {
      helpers.send_success(res, notifications);
    }
  });

}

exports.notificationsPost = function (req, res) {
  var getp = req.query;

  var index = parseInt(getp.index);
  var state = parseInt(getp.state);

  async.waterfall([

    // 1. make sure Notifciation Flag is valid
    function (cb) {
      if (index<0 || index>1 || state<0 || state>1) {
        cb(helpers.no_such_item());
        return;
      }
      cb();
    },

    // 2. validate Privilages
    function (cb) {
      privilege_data.privilages(req.user.sub, getp.id, 0, function (err, userId, flag) {
        if (flag) cb(err); else cb(helpers.invalid_privileges());
      })
    },

    // 3. update Notifications
    function (cb) {
      group_settings_data.toggle_notifications(getp.id, index, state, cb);
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
