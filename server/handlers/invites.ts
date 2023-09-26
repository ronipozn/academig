var helpers = require('./helpers.ts');
var async = require("async");

var invites_data = require("../data/invites.ts");
var privilege_data = require("../data/privileges.ts");

var ObjectID = require('mongodb').ObjectID;

exports.version = "0.1.0";

exports.colleaguePost = function (req, res) {
  var getp = req.query;

  async.waterfall([

      // 1. make sure Message, Email are valid
      function (cb) {
        if (!req.body.message || getp.email==null) {
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

      // 3. Colleague Invite
      function (userId: string, cb) {
        invites_data.post_colleague(req.body.message, getp.email, userId, cb);
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

exports.invitePost = function (req, res) {
  var getp = req.query;
  var mode = parseInt(getp.mode);

  async.waterfall([

    // 1. make sure Item ID, Mini Data, Mode are valid
    function (cb) {
      if (!ObjectID.isValid(getp.itemId) || !req.body || mode==null) {
        cb(helpers.no_such_item());
        return;
      }
      cb(null);
    },

    // 2. validate Privilages
    function (cb) {
      var privilegeMode: number;
      var id: string;

      if (mode==11 && req.user.scope.indexOf('write:publications')>-1) {
        privilegeMode = 10;
        id = getp.itemId;
      } else if (mode>=7 && mode<=10) { // publications authors
        privilegeMode = 70;
        id = getp.itemId;
      } else {
        cb(helpers.no_such_item());
      }

      privilege_data.privilages(req.user.sub, id, privilegeMode, function (err, userId, flag) {
        if (flag) cb(err, (mode==11) ? 'academig' : userId); else cb(helpers.invalid_privileges());
      })
    },

    // 3. Item Invite
    function (userId: string, cb) {
      // console.log('Item Invite',userId,mode)
      invites_data.post_invite(req.body, getp.itemId, userId, mode, function (err, authorId) {
        cb(err, authorId);
      })
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

exports.pullInvites = function (req, res) {
  var getp = req.query;
  var mode = parseInt(getp.mode);

  async.waterfall([

    // 1. validate Privilages
    function (cb) {
      privilege_data.privilages(req.user.sub, null, 10, function (err, userId, flag) {
        if (flag) cb(err, userId); else cb(helpers.invalid_privileges());
      })
    },

    // 2. pull all invites by mode
    function (userId, cb) {
      invites_data.pull_invites_by_mode(userId, mode, function (err) {
        cb(err);
      })
    },
  ],
  function (err) {
    if (err) {
      helpers.send_failure(res, helpers.http_code_for_error(err), err);
    } else {
      helpers.send_success(res, null);
    }
  });

};

exports.suggestPost = function (req, res) {
  var getp = req.query;
  var mode = parseInt(getp.mode);

  async.waterfall([

      // 1. make sure Item ID, Mini Data are valid
      function (cb) {
        if (!ObjectID.isValid(getp.itemId) || !req.body) {
          cb(helpers.no_such_item());
          return;
        }
        cb(null);
      },

      // 2. validate Privilages
      function (cb) {
        var privilegeMode: number;
        var id: string;

        if (req.user.scope.indexOf('write:publications')>-1) {
          privilegeMode = 10;
          id = getp.itemId;
        }

        privilege_data.privilages(req.user.sub, id, privilegeMode, function (err, userId, flag) {
          if (flag) cb(err, userId); else cb(helpers.invalid_privileges());
        })
      },

      // 3. Item Suggest
      function (userId: string, cb) {
        invites_data.post_suggest(req.body, getp.itemId, userId, mode, cb);
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
