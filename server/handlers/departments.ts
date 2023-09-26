var helpers = require('./helpers.ts');
var async = require("async");

var university_data = require("../data/universities.ts");
var department_data = require("../data/departments.ts");
var group_data = require("../data/groups.ts");

import {complexName} from '../models/shared.ts';

var ObjectID = require('mongodb').ObjectID;

exports.version = "0.1.0";

exports.departmentDataByURL = function (req, res) {
  var getp = req.params;

  async.waterfall([

    // 1. get Department ID
    function (cb) {
      department_data.department_id(getp.university, getp.department, 1, function (err, departmentId) {
        if (departmentId==null) {
        // if (departmentId==null || (getp.university=="company" && (req.user.scope.indexOf('write:groups')==-1))) {
          cb("No such department",null);
        } else {
          cb(null, departmentId);
        }
      });
    },

    // 2. get Department details
    function (departmentId, cb) {
      department_data.departments_list([departmentId], 1, function (err, department) {
        cb(err, department[0]);
      });
    },

    // 3. get Counters
    function (department, cb) {
      group_data.groups_multi_items_ids(department.groupsItems, function (err, counters) {
        department.counters = counters
        cb(err, department);
      })
    }

  ],
  function (err, department) {
    if (err) {
      helpers.send_failure(res, helpers.http_code_for_error(err), err);
    } else {
      helpers.send_success(res, department);
    }
  });
}

exports.departmentContactsPage = function (req, res) {
  var getp = req.query;

  department_data.department_page_items("contactsPageItems", getp.id, function (err, page_items) {
    if (err) {
        helpers.send_failure(res, 500, err);
        return;
    }
    helpers.send_success(res, page_items);
  });
};

exports.departmentBuild = function (req, res) {
  var getp = req.query;

  async.waterfall([

    // 1. get University ComplexName
    function (cb) {
      console.log('D1')
      university_data.university_details_category(ObjectID(getp.id), ObjectID(getp.itemId), function (err, university) {
        let type: number = 0;
        if (university.departmentsItems.categories) {
          switch (university.departmentsItems.categories[0].name) {
            case 'Programs': type = 1; break;
            case 'Centers': type = 2; break;
            default: type = 0;
          }
        }
        cb(err, university, type);
      });
    },

    // 2. create Department
    function (university, type, cb) {
      console.log('D2')
      department_data.createDepartmentAdmin(req.body, university, type, function (err, departmentId) {
        cb(err, departmentId);
      })
    },

    // 3. update University
    function (departmentId, cb) {
      console.log('D3')
      university_data.updateUniversityAdmin(req.body, getp.id, departmentId, getp.itemId, function (err) {
        cb(err, departmentId);
      })
    },

  ],
  function (err, departmentId: string) {
    if (err) {
      helpers.send_failure(res, helpers.http_code_for_error(err), err);
    } else {
      helpers.send_success(res, departmentId);
    }
  });
};

exports.departmentHomePage = function (req, res) {
  var getp = req.query;

  if (!ObjectID.isValid(getp.id)) {
    helpers.send_success(res, []);
    return;
  }

  department_data.department_home_items(getp.id, function (err, page_items) {
    if (err) {
      helpers.send_failure(res, 500, err);
      return;
    }
    helpers.send_success(res, page_items);
  });
};

exports.departmentPost = function (req, res) {
  var getp = req.query;

  async.waterfall([
    // make sure the Unit Number, University ID, Department ID are valid
    function (cb) {
      if (req.body.itemId==null || !ObjectID.isValid(getp.id) || !ObjectID.isValid(getp.departmentId)) {
        cb(helpers.no_such_item());
        return;
      }
      cb(null);
    },

    function (cb) {
      university_data.updateDepartmentUnitAdmin(getp.id, getp.departmentId, req.body.itemId, cb);
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

exports.departmentDelete = function (req, res) {
  var getp = req.query;

  async.waterfall([
    // make sure the Department ID is valid
    function (cb) {
      if (!ObjectID.isValid(getp.id)) {
        cb(helpers.no_such_item());
        return;
      }
      cb(null);
    },

    function (cb) {
      department_data.delete_department(getp.id, cb);
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

exports.departmentAccountById = function (req, res) {
  var getp = req.query;

  if (!ObjectID.isValid(getp.id)) {
    helpers.send_failure(res, 500, null);
    return;
  }

  department_data.department_account(getp.id, function (err, account) {
    if (err) {
      helpers.send_failure(res, 500, err);
      return;
    }
    helpers.send_success(res, account);
  });
}
