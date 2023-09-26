var helpers = require('./helpers.ts');
var async = require("async");

var university_data = require("../data/universities.ts");
var department_data = require("../data/departments.ts");
var group_data = require("../data/groups.ts");
var shared_data = require("../data/shared.ts");

var ObjectID = require('mongodb').ObjectID;

exports.version = "0.1.0";

exports.universitiesByIds = function (req, res) {
  var getp = req.query;
  var mode = parseInt(getp.mode);

  async.waterfall([
    // get universities data
    function (cb) {
      university_data.universities_list(mode, getp.id, getp.state, getp.city, function (err, universities) {
        // count) {
        cb(err, universities)
          // count);
      });
    }
  ],
  function (err, universities) {
    // count) {
    if (err) {
      helpers.send_failure(res, 500, err);
      return;
    }
    // universities.push(count)
    helpers.send_success(res, universities);
  });
}

exports.universityDataByURL = function (req, res) {
  var getp = req.params;

  async.waterfall([

    // 1. get University ID
    function (cb) {
      university_data.university_id(getp.university, 1, function (err, universityId) {
        if (universityId==null) {
        // if (universityId==null || (getp.university=="company" && (req.user.scope.indexOf('write:groups')==-1))) {
          cb("No such university",null);
        } else {
          // console.log('universityId',universityId)
          cb(null, universityId);
        }
      });
    },

    // 2. get University details
    function (universityId: string, cb) {
      university_data.university_details(universityId, 1, function (err, university) {
        cb(err, universityId, university);
      });
    },

    // 3. get Counters
    function (universityId: string, university, cb) {
      university_data.university_departments_ids(universityId, 1, null, function (err, departments) {
        const departmentsIds = departments.map(r => r._id);
        if (departmentsIds[0]) {
          department_data.departments_items_ids("groupsItems", departmentsIds, function (err, groupsIds) {
            group_data.groups_multi_items_ids(groupsIds, function (err, counters) {
              // programs
              counters[0] = departmentsIds.length;
              university.counters = counters;
              cb(err, university);
            })
          })
        } else {
          university.counters = [0, 0, 0, 0, 0, 0, 0, 0, 0];
          cb(err, university);
        }
      })
    }

  ],
  function (err, university) {
    if (err) {
      helpers.send_failure(res, helpers.http_code_for_error(err), err);
    } else {
      helpers.send_success(res, university);
    }
  });
}

exports.universityBuild = function (req, res) {
  async.waterfall([

    // 1. create University
    function (cb) {
      university_data.createUniversitySkeleton(req.body, function (err, universityId) {
        cb(err, universityId);
      })
    },

    // 2. create academigID in UniversityQuery document (conditional)
    function (university_id: string, cb) {
      if (req.body._id) {
        console.log('req.body._id',req.body._id)
        university_data.university_activate(req.body._id, university_id, req.body.name, function (err) {
          cb(err, university_id)
        });
      } else {
        console.log('university_id',university_id)
        university_data.university_query_add(university_id, req.body.name, req.body.url, req.body.country_id, function (err) {
          cb(err, university_id)
        });
      }
    },

  ],
  function (err, universityId: string) {
    if (err) {
      helpers.send_failure(res, helpers.http_code_for_error(err), err);
    } else {
      helpers.send_success(res, universityId);
    }
  });
};

exports.universityHomePage = function (req, res) {
  var getp = req.query;

  if (!ObjectID.isValid(getp.id)) {
    helpers.send_success(res, []);
    return;
  }

  university_data.university_home_items(getp.id, function (err, page_items) {
    if (err) {
      helpers.send_failure(res, 500, err);
      return;
    }
    helpers.send_success(res, page_items);
  });
};

//////////////////////////////////////

exports.universitiesQuery = function (req, res) {
  var getp = req.query;

  async.waterfall([
    // 1. get Universities Details
    function (cb) {
      university_data.universities_query(getp.query, 0, function (err, universities) {
        cb(err, universities);
      });
    }
  ],
  function (err, universities) {
    if (err) {
      helpers.send_failure(res, helpers.http_code_for_error(err), err);
    }
    helpers.send_success(res, universities);
  });
}

exports.universityQueryDelete = function (req, res) {
  var getp = req.query;

  async.waterfall([

    function (cb) {
      university_data.university_query_delete(getp.id, function (err) {
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

//////////////////////////////////////

exports.departmentsByIds = function (req, res) {
  var getp = req.query;
  var mode = parseInt(getp.mode);

  if ((!ObjectID.isValid(getp.id)) && mode==1) {

    helpers.send_success(res, []);

  } else {

    university_data.university_departments_ids(getp.id, mode, getp.query, function (err, departmentsItems) {
      if (err) {
        helpers.send_failure(res, 500, err);
        return;
      }
      helpers.send_success(res, departmentsItems);
    });

  }
}

exports.universityContactsPage = function (req, res) {
  var getp = req.query;

  university_data.university_page_items("contactsPageItems", getp.id, function (err, page_items) {
    if (err) {
      helpers.send_failure(res, 500, err);
      return;
    }
    helpers.send_success(res, page_items);
  });
};

exports.universityDelete = function (req, res) {
  var getp = req.query;

  async.waterfall([
    // make sure the University ID is valid
    function (cb) {
      if (!ObjectID.isValid(getp.id)) {
        cb(helpers.no_such_item());
        return;
      }
      cb(null);
    },

    function (cb) {
      university_data.delete_university(getp.id, cb);
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

exports.universityAccountById = function (req, res) {
  var getp = req.query;

  if (!ObjectID.isValid(getp.id)) {
    helpers.send_failure(res, 500, null);
    return;
  }

  university_data.university_account(getp.id, function (err, account) {
    if (err) {
      helpers.send_failure(res, 500, err);
      return;
    }
    helpers.send_success(res, account);
  });
}

// %%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%
// %%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%
// %%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%
// %%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%

exports.unitPut = function (req, res) {
  var getp = req.query;

  async.waterfall([

    // 1. make sure University ID, Unit Name are valid
    function (cb) {
      if (!ObjectID.isValid(getp.id) || !req.body.name || req.body.icon==null) {
        cb(helpers.no_such_item());
        return;
      }
      cb();
    },

    // 2. validate Privilages
    // function (cb) {
    //   privilege_data.privilages(req.user.sub, getp.id, 0, function (err, userId, flag) {
    //     if (flag) cb(err); else cb(helpers.invalid_privileges());
    //   })
    // },

    // 3. put Unit
    function (cb) {
      university_data.put_unit(req.body.name, req.body.icon, getp.id, cb);
    }

  ],
  function (err, unitId) {
    if (err) {
      helpers.send_failure(res, helpers.http_code_for_error(err), err);
    } else {
      helpers.send_success(res, unitId);
    }
  });

};

exports.unitPost = function (req, res) {
  var getp = req.query;
  var index = parseInt(getp.index);

  async.waterfall([

    // 1. make sure University ID, Unit Name are valid
    function (cb) {
      if (!ObjectID.isValid(getp.id) || !req.body.name || req.body.icon==null || !req.body.id) {
        cb(helpers.no_such_item());
        return;
      }
      cb();
    },

    // 2. validate Privilages
    // function (cb) {
    //   privilege_data.privilages(req.user.sub, getp.id, 0, function (err, userId, flag) {
    //     if (flag) cb(err); else cb(helpers.invalid_privileges());
    //   })
    // },

    // 3. post Unit
    function (cb) {
      university_data.post_unit(req.body.name, req.body.icon, req.body.id, getp.id, cb);
    }

  ],
  function (err, unitId) {
      if (err) {
        helpers.send_failure(res, helpers.http_code_for_error(err), err);
      } else {
        helpers.send_success(res, unitId);
      }
  });

};

exports.unitDelete = function (req, res) {
  var getp = req.query;
  var index = parseInt(getp.index);

  async.waterfall([

    // 1. make sure University ID, Unit ID and unit are valid
    function (cb) {
      if (!ObjectID.isValid(getp.id) || !ObjectID.isValid(getp.itemId)) {
        cb(helpers.no_such_item());
        return;
      }
      cb();
    },

    // 2. validate Privilages
    // function (cb) {
    //   privilege_data.privilages(req.user.sub, getp.id, 0, function (err, userId, flag) {
    //     if (flag) cb(err); else cb(helpers.invalid_privileges());
    //   })
    // },

    // 3. delete unit
    function (cb) {
      university_data.delete_unit(getp.id, getp.itemId, cb);
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

// %%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%
// %%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%
// %%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%
// %%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%

exports.rankPost = function (req, res) {
  var getp = req.query;
  var mode = parseInt(getp.mode);

  async.waterfall([
    function (cb) {
      shared_data.post_rank(req.body, getp.id, mode, cb);
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
