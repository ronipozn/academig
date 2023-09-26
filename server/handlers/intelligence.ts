var helpers = require('./helpers.ts');
var async = require("async");

var intelligence_data = require("../data/intelligence.ts");
var privilege_data = require("../data/privileges.ts");

import { objectMini } from '../models/shared.ts';

var ObjectID = require('mongodb').ObjectID;

exports.version = "0.1.0";

exports.intelligenceNotification = function (req, res) {
  var getp = req.query;
  var mode = parseInt(getp.mode);
  var total = parseInt(getp.total);

  async.waterfall([

    // 1. make sure Parent ID, Item ID, Mode, Action are valid
    function (cb) {
      if (mode==null || total==null || !ObjectID.isValid(getp.id) || !ObjectID.isValid(getp.itemId)) {
        cb(helpers.no_such_item());
        return;
      }
      cb();
    },

    // 2.
    function (cb) {
      privilege_data.privilages(req.user.sub, getp.id, 0, function (err, userId, flag) {
        if (flag) cb(err, userId); else cb(helpers.invalid_privileges());
      })
    },

    // 3.
    function (userId: string, cb) {
      intelligence_data.post_intelligence_notification(userId, getp.id, getp.itemId, total, mode, function (err) {
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
  })
}

exports.intelligenceDecision = function (req, res) {
  var getp = req.query;
  var mode = parseInt(getp.mode);
  var action = parseInt(getp.action);

  async.waterfall([

    // 1. make sure Parent ID, Item ID, Mode, Action are valid
    function (cb) {
      if (mode==null || (action!=0 && action!=1) || !ObjectID.isValid(getp.id) || !ObjectID.isValid(getp.itemId)) {
        cb(helpers.no_such_item());
        return;
      }
      cb();
    },

    // 2.
    function (cb) {
      if (!req.user) {
        cb(null, null);
      } else {
        privilege_data.privilages(req.user.sub, getp.id, 0, function (err, userId, flag) {
          if (flag) cb(err, userId); else cb(helpers.invalid_privileges());
        })
      }
    },

    // 3.
    function (userId: string, cb) {
      console.log('mode',mode,'action',action,'id',getp.id,'itemId',getp.itemId)
      if (mode==20) {
        intelligence_data.post_intelligence_decision_topic(getp.id, getp.itemId, action, function (err) {
          cb(err);
        })
      } else {
        intelligence_data.post_intelligence_decision(userId, getp.itemId, action, mode, function (err) {
          cb(err);
        })
      }
    }

  ],
  function (err) {
    if (err) {
      helpers.send_failure(res, helpers.http_code_for_error(err), err);
    } else {
      helpers.send_success(res, null);
    }
  })
}
