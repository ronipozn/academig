var helpers = require('./helpers.ts');
var async = require("async");

var deal_data = require("../data/deals.ts");
var people_data = require("../data/peoples.ts");
var privilege_data = require("../data/privileges.ts");

var ObjectID = require('mongodb').ObjectID;

exports.version = "0.1.0";

exports.dealsByIds = function (req, res) {
  var getp = req.query;

  async.waterfall([

    // 1. validate Privilages
    function (cb) {
      privilege_data.privilages(req.user.sub, null, 10, function (err, userId, flag) {
        if (flag) cb(err, userId); else cb(helpers.invalid_privileges());
      })
    },

    // 2. get deals ids
    function (userId: string, cb) {
      people_data.get_followings_ids(80, userId, null, function (err, dealsIds) {
        cb(err, userId, dealsIds);
      });
    },

    // 3. deals List
    function (userId: string, dealsIds: string[], cb) {
      if (dealsIds && dealsIds.length>0) {
        deal_data.deals_list(userId, dealsIds, function (err, deals) {
          cb(err, deals)
        });
      } else {
        cb(null, [])
      }
    },

  ],
  function (err, deals) {
    if (err) {
      helpers.send_failure(res, helpers.http_code_for_error(err), err);
    } else {
      helpers.send_success(res, deals);
    }
  });
};

exports.dealDetailsById = function (req, res) {
  var getp = req.query;

  async.waterfall([

    function (cb) {
      if (!req.params || !ObjectID.isValid(req.params.itemId))
        cb(helpers.no_such_item());
      else {
        cb(null)
      }
    },

    // 1. get Privilages
    function (cb) {
      if (!req.user) {
        cb(null, false, null);
      } else {
        privilege_data.privilages(req.user.sub, req.params.itemId, 90, function (err, userId, flag) {
          cb(err, flag, userId);
        })
      }
    },

    // 2. get the deal details
    function (adminFlag: boolean, userId: string, cb) {
      deal_data.deal_details(req.params.itemId, adminFlag, userId, function (err, deal) {
        console.log('adminFlag',adminFlag)
        console.log('deal',deal)
        cb(err, deal);
      })
    }

  ],
  function (err, deal) {
    if (err) {
      helpers.send_failure(res, helpers.http_code_for_error(err), err);
    } else if (!deal) {
      helpers.send_failure(res, 403, helpers.no_such_item());
    } else {
      helpers.send_success(res, deal);
    }
  });
};

///////////////////////////////////////////////////
///////////////////////////////////////////////////
///////////////////////////////////////////////////
///////////////////////////////////////////////////

exports.tldrPut = function (req, res) {
  var getp = req.query;

  async.waterfall([

    // 1. TBD: check array.length==4

    // 2. validate Privilages
    function (cb) {
      console.log('TLDR1')
      privilege_data.privilages(req.user.sub, getp.id, 90, function (err, userId, flag) {
        if (flag) {
          cb(err, userId);
        } else if (req.user.scope.indexOf('write:groups')>-1) {
          cb(err, getp.peopleId);
        } else {
          cb(helpers.invalid_privileges());
        }
      })
    },

    // 3. put Submit
    function (userId: string, cb) {
      console.log('TLDR2',req.body)
      deal_data.put_tldr(getp.id, req.body, function (err) {
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

exports.dealPut = function (req, res) {
  var getp = req.query;

  async.waterfall([

    // 1. validate Privilages
    function (cb) {
      privilege_data.privilages(req.user.sub, null, 10, function (err, userId, flag) {
        if (flag) cb(err, userId); else cb(helpers.invalid_privileges());
      })
    },

    // 2. put Deal
    function (userId: string, cb) {
      deal_data.put_deal(getp.id, req.body, function (err) {
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

exports.planPut = function (req, res) {
  var getp = req.query;

  async.waterfall([

    // 1. validate Privilages
    function (cb) {
      privilege_data.privilages(req.user.sub, null, 10, function (err, userId, flag) {
        if (flag) cb(err, userId); else cb(helpers.invalid_privileges());
      })
    },

    // 2. put Plan
    function (userId: string, cb) {
      console.log('req.body',req.body)

      deal_data.put_deal_plan(getp.id, getp.index, req.body, function (err) {
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
