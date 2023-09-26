var helpers = require('./helpers.ts');
var async = require("async");

var loggings_data = require("../data/loggings.ts");
var privilege_data = require("../data/privileges.ts");

// Convert from Email to Admin Page:
// * users deleted
// * labs deleted
// * followersEmails roni.pozner@gmail.com
// * support.ts contactPut
// * emails.ts groupRequestEmail, to, bcc
// * DepartmentRequestComponent

var ObjectID = require('mongodb').ObjectID;

exports.version = "0.1.0";

exports.loggingPut = function (req, res) {
  var getp = req.query;
  var type = parseInt(getp.type);

  async.waterfall([

    // 1. validate Privilages
    function (cb) {
      if (req.user) {
        privilege_data.privilages(req.user.sub, null, 10, function (err, userId, flag) {
          if (flag) cb(err, userId); else cb(helpers.invalid_privileges());
        })
      } else {
        cb(null, null);
      }
    },

    // 2. Logging
    function (userId: string, cb) {
      loggings_data.put_logging(userId, type, getp.id, req.body.message, cb);
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
