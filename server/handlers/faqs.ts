var helpers = require('./helpers.ts');
var async = require("async");

var faq_data = require("../data/faqs.ts");
var group_data = require("../data/groups.ts");
var people_data = require("../data/peoples.ts");
var project_data = require("../data/projects.ts");
var resource_data = require("../data/resources.ts");
var privilege_data = require("../data/privileges.ts");

var ObjectID = require('mongodb').ObjectID;

exports.version = "0.1.0";

exports.faqByIds = function (req, res) {
  var getp = req.query;
  var mode = parseInt(getp.mode);

  async.series({

    validate: function(callback) {
      if (!ObjectID.isValid(getp.id)) {
        callback(helpers.no_such_item());
        return;
      }
      callback(null);
    },

    faqsId: function (callback) {
      switch (mode) {

        case 0: // Group
          group_data.group_items_ids("faqPageItems", getp.id, function (err, items) {
            callback(err, (items || {}).faqs);
          });
          break;

        case 3: // Group AI
        case 4: // Group AI - Arhicve
          privilege_data.privilages(req.user.sub, getp.id, 0, function (err, userId, flag) {
            if (flag) {
              group_data.group_items_ids("faqPageItems", getp.id, function (err, items) {
                callback(err, (items || {}).faqs);
              });
            } else {
              callback(helpers.invalid_privileges());
            }
          })
          break;

        case 1: // Project
          project_data.project_items_ids(3, getp.id, null, function (err, items) {
            callback(err, (items || {}).faqsIds);
          });
          break;

        case 2: // Resource
          resource_data.resource_items_ids(1, getp.id, function (err, items) {
            callback(err, (items || {}).faqsIds);
          });
          break;

      }
    }
  },
  function (err, results) {
    faq_data.faq_list(results ? results.faqsId : [], (mode==3) ? 1 : ((mode==4) ? -1 : 0), function (err, faqs) {
      if (err) {
          helpers.send_failure(res, 500, err);
          return;
      }
      helpers.send_success(res, faqs);
    });
  });
}

exports.faqPut = function (req, res) {
  var getp = req.query;
  var mode = parseInt(getp.mode);

  async.waterfall([

    // 1. make sure Document ID, FAQ Data, Mode are valid
    function (cb) {
      if ((!ObjectID.isValid(getp.id) && mode<3) || !req.body || mode==null) {
        cb(helpers.no_such_item());
        return;
      }
      cb(null);
    },

    // 2. validate Privileges
    function (cb) {
      const privilageModes = [0, 40, 50, 11]
      privilege_data.privilages(req.user.sub, getp.id, privilageModes[mode], function (err, userId, flag) {
        if (flag) cb(err, userId); else cb(helpers.invalid_privileges());
      })
    },

    // 3. put FAQ
    function (userId: string, cb) {
      const adminFlag: boolean = (req.user.scope.indexOf('write:groups')>-1);
      console.log('userId',userId)
      faq_data.put_faq(req.body, (mode==3) ? userId : getp.id, userId, mode, adminFlag, cb);
    }

  ],
  function (err, faqId) {
    if (err) {
      helpers.send_failure(res, helpers.http_code_for_error(err), err);
    } else {
      helpers.send_success(res, faqId);
    }
  });
}

exports.faqPost = function (req, res) {
  var getp = req.query;
  var mode = parseInt(getp.mode);
  async.waterfall([

    // 1. make sure Parent ID, FAQ ID, FAQ Data, Mode are valid
    function (cb) {
      if ((!ObjectID.isValid(getp.id) && mode<3) || !ObjectID.isValid(getp.itemId) || !req.body || mode==null) {
        cb(helpers.no_such_item());
        return;
      }
      cb(null);
    },

    // 2. validate Privilages
    function (cb) {
      const privilageModes = [0, 40, 50, 11]
      privilege_data.privilages(req.user.sub, getp.id, privilageModes[mode], function (err, userId, flag) {
        if (flag) cb(err); else cb(helpers.invalid_privileges());
      })
    },

    // 3. update FAQ
    function (cb) {
      faq_data.post_faq(getp.itemId, req.body, cb);
    }

  ],
  function (err, results) {
    if (err) {
      helpers.send_failure(res, helpers.http_code_for_error(err), err);
    } else {
      helpers.send_success(res, results);
    }
  });
}

exports.faqDelete = function (req, res) {
  var getp = req.query;
  var mode = parseInt(getp.mode);

  async.waterfall([

    // 1. make sure Parent ID, FAQ ID, Mode are valid
    function (cb) {
      if ((!ObjectID.isValid(getp.id) && mode<3) || !ObjectID.isValid(getp.itemId) || mode==null) {
        cb(helpers.no_such_item());
        return;
      }
      cb(null);
    },

    // 2. validate Privilages
    function (cb) {
      const privilageModes = [0, 40, 50, 11]
      privilege_data.privilages(req.user.sub, getp.id, privilageModes[mode], function (err, userId, flag) {
        if (flag) cb(err, userId); else cb(helpers.invalid_privileges());
      })
    },

    // 3. delete FAQ
    function (userId: string, cb) {
      faq_data.delete_faq(getp.itemId, (mode==3) ? userId : getp.id, mode, cb);
    }

  ],
  function (err, results) {
    if (err) {
      helpers.send_failure(res, helpers.http_code_for_error(err), err);
    } else {
      helpers.send_success(res, results);
    }
  });
}
