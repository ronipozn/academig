var helpers = require('./helpers.ts'),
    async = require("async"),
    stream = require('getstream');

var search_data = require("../data/searches.ts");
var privilege_data = require("../data/privileges.ts");
var people_data = require("../data/peoples.ts");

var emails = require("../misc/emails.ts");

import { objectMini, groupComplex, complexName, Quote, Period } from '../models/shared.ts';

var ObjectID = require('mongodb').ObjectID;

exports.version = "0.1.0";

exports.papers_kits = function (req, res) {
  async.waterfall([
    // get ALL papers_kits
    function (cb) {
      search_data.papers_kits(function (err, papers_kits) {
        cb(err, papers_kits);
      });
    }
  ],
  function (err, papers_kits) {
    if (err) {
      helpers.send_failure(res, helpers.http_code_for_error(err), err);
    } else {
      helpers.send_success(res, papers_kits);
    }
  });
}

exports.featured = function (req, res) {
  async.waterfall([
    // get Featured Searches and Lists
    function (cb) {
      search_data.featured(function (err, featured) {
        cb(err, featured);
      });
    }
  ],
  function (err, featured) {
    if (err) {
      helpers.send_failure(res, helpers.http_code_for_error(err), err);
    } else {
      helpers.send_success(res, featured);
    }
  });
}

exports.searches = function (req, res) {

  async.waterfall([

    // 1. validate Privilages
    function (cb) {
      privilege_data.privilages(req.user.sub, null, 10, function (err, userId, flag) {
        if (flag) cb(err, userId); else cb(helpers.invalid_privileges());
      })
    },

    // 2. get Searches
    function (userId: string, cb) {
      search_data.searches(userId, function (err, searches) {
        cb(err, searches);
      });
    }

  ],
  function (err, searches) {
    if (err) {
      helpers.send_failure(res, helpers.http_code_for_error(err), err);
    } else {
      helpers.send_success(res, searches);
    }
  });
}

exports.searchPut = function (req, res) {
  var getp = req.query;

  console.log('title',getp.title)
  console.log('refinements',req.body)

  async.waterfall([

    // 1. make sure Refinements, Title are valid
    function (cb) {
      if (!req.body || getp.title==null) {
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

    // 3. put Search
    function (userId: string, cb) {
      search_data.put_search(userId, getp.title, getp.query, req.body, function (err, itemId) {
        cb(err, itemId);
      });
    }

  ],
  function (err, itemId) {
    if (err) {
      helpers.send_failure(res, helpers.http_code_for_error(err), helpers.no_such_item());
    } else {
      helpers.send_success(res, itemId);
    }
  });
};

exports.searchDelete = function (req, res) {
  var getp = req.query;

  async.waterfall([

    // 1. make sure Item ID is valid
    function (cb) {
      if (!ObjectID.isValid(getp.id)) {
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

    // 3. delete Search
    function (userId: string, cb) {
      search_data.delete_search(userId, getp.id, function (err) {
        cb (err, getp.id);
      });
    }

  ],
  function (err, itemId) {
    if (err) {
      helpers.send_failure(res, helpers.http_code_for_error(err), err);
    } else {
      helpers.send_success(res, itemId);
    }
  });
}

exports.searchExport = function (req, res) {
  var getp = req.query;

  async.waterfall([

    // 1. make sure Item ID, Mode are valid
    // function (cb) {
    //   if (!ObjectID.isValid(getp.id)) {
    //     cb(helpers.no_such_item());
    //     return;
    //   }
    //   cb(null);
    // },

    // 2. validate Privilages
    function (cb) {
      privilege_data.privilages(req.user.sub, null, 10, function (err, userId, flag) {
        if (flag) cb(err, userId); else cb(helpers.invalid_privileges());
      })
    },

    // validate Plan and Retrieve Email (Flag)
    function (userId: string, cb) {
      people_data.people_plan(userId, function (err, user) {
        cb(err, user.plan);
      })
    },

    // 3. export Search
    function (plan: number, cb) {
      search_data.export_search(getp.query, req.body, plan, function (err, hits) {
        cb(err, hits);
      });
    }

  ],
  function (err, hits) {
    if (err) {
      helpers.send_failure(res, helpers.http_code_for_error(err), err);
    } else {
      helpers.send_success(res, hits);
    }
  });

};
