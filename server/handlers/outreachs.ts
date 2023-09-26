var helpers = require('./helpers.ts');
var async = require("async");

var emails = require("../misc/emails.ts");

var group_data = require("../data/groups.ts");
var people_data = require("../data/peoples.ts");
var outreach_data = require("../data/outreachs.ts");
var shared_data = require("../data/shared.ts");
var privilege_data = require("../data/privileges.ts");

var university_data = require("../data/universities.ts");
var department_data = require("../data/departments.ts");

import { Period, objectMini } from '../models/shared.ts';

var ObjectID = require('mongodb').ObjectID;

exports.version = "0.1.0";

exports.outreachsByIds = function (req, res) {
  var getp = req.query;
  var mode = parseInt(getp.mode);
  var type = parseInt(getp.type); // also serve as More
  var searchCont: number;

  async.waterfall([

    // 1. validate Privilages
    function (cb) {
      if (!req.user && mode!=8 && mode!=9) {
        cb(null, null);
      } else {
        privilege_data.privilages(req.user.sub, getp.id, (mode==8 || mode==9) ? 0 : 10, function (err, userId, flag) {
          if (flag) cb(err, userId); else cb(helpers.invalid_privileges());
        })
      }
    },

    // 2. get outreachs ids
    function (userId: string, cb) {
      switch (mode) {
        case 1: // Group
        case 8: // Group AI
        case 9: // Group AI - Archive
          if (!ObjectID.isValid(getp.id)) {
            cb(helpers.no_such_item());
          } else {
            group_data.group_items_ids("outreachsItems", getp.id, function (err, items) {
              cb(err, items ? items.outreachsIds : []);
            });
          }
          break;
        case 2: // Profile
          if (!getp.id) {
            cb(helpers.no_such_item());
          } else {
            people_data.get_followings_ids(21, getp.id, null, function (err, outreachsIds) {
              cb(err, outreachsIds);
            });
          }
          break;
        // case 3: // Search
        case 4: // Departments
        case 5: // Departments (Search)
          department_data.department_items_ids("groupsItems", getp.id, function (err, groupsIds) {
            group_data.groups_items_ids("outreachsItems", groupsIds, function (err, items) {

              const ids: string[] = items ? [].concat(...items.map(r => r.outreachsIds)) : null;

              if (type==null) {
                cb(helpers.no_such_item());
              } else if (mode==4) {
                searchCont = ids ? ids.length : 0;
                cb(err, ids ? ids.slice(type*10, (type+1)*10-1) : []);
              } else if (mode==5) {
                shared_data.search_ids_by_ids(getp.text, userId, 6, type, ids, function (err, outreachsIds, count) {
                  searchCont = count;
                  cb(err, outreachsIds);
                });
              }
            })
          })
          break;
        case 6: // Universities
        case 7: // Universities (Search)
          university_data.university_departments_ids(getp.id, 1, null, function (err, departments) {
            const departmentsIds = departments.map(r => r._id)
            if (departmentsIds[0]) {
              department_data.departments_items_ids("groupsItems", departmentsIds, function (err, groupsIds) {
                group_data.groups_items_ids("outreachsItems", groupsIds, function (err, items) {

                  const ids: string[] = items ? [].concat(...items.map(r => r.outreachsIds)) : null;

                  if (type==null) {
                    cb(helpers.no_such_item());
                  } else if (mode==6) {
                    searchCont = ids ? ids.length : 0;
                    cb (err, ids ? ids.slice(type*10, (type+1)*10-1) : []);
                  } else if (mode==7) {
                    shared_data.search_ids_by_ids(getp.text, userId, 6, type, ids, function (err, outreachsIds, count) {
                      searchCont = count;
                      cb(err, outreachsIds);
                    });
                  }
                })
              })
            } else {
              cb (err, []);
            }
          });
          break;
        default: {
          cb(null, null)
        }
      }
    },

    // 3. outreachs List
    function (ids, cb) {
      if (ids) {
        outreach_data.outreachs_list(ids, (mode==8) ? 1 : ((mode==9) ? -1 : 0), function (err, outreachs) {
          cb(err, outreachs)
        })
      } else {
        cb(null, [])
      }
    },

    // 4. dress Groups
    function (outreachs, cb) {
      if (mode>=4 || mode<=7) {
        group_data.groups_list(outreachs.map(r => r.groupId), null, null, null, null, 2, true, function (err, items) {
          outreachs.forEach(function(outreach) {
            outreach.group=(items.find(item => item._id.toString() == (outreach.groupId || {}).toString()) || {}).groupIndex
            delete outreach.groupId;
          })
          cb(err, outreachs);
        });
      } else {
        cb(null, outreachs);
      }
    },

  ],
  function (err, outreachs) {
    if (err) {
      helpers.send_failure(res, helpers.http_code_for_error(err), err);
    } else {
      if (mode==3 || mode==4 || mode==5 || mode==6 || mode==7) {
        outreachs.push(searchCont)
      }
      helpers.send_success(res, outreachs);
    }
  });
}

exports.outreachPut = function (req, res) {
  var getp = req.query;
  var type = parseInt(getp.type);

  async.waterfall([

    // 1. make sure Outreach Item, Type, Parent ID are valid
    function (cb) {
      if ( !req.body || (type<2 && !ObjectID.isValid(req.body.parentId)) ) {
        cb(helpers.no_such_item());
        return;
      }
      cb(null);
    },

    // 2. validate Privilages
    function (cb) {
      privilege_data.privilages(req.user.sub, req.body.parentId, (type==2) ? 10 : 0, function (err, userId, flag) {
        if (flag) cb(err, userId); else cb(helpers.invalid_privileges());
      })
    },

    // 3. put Outreach
    function (userId: string, cb) {
      const adminFlag: boolean = (req.user.scope.indexOf('write:groups')>-1);
      outreach_data.put_outreach(userId, type, adminFlag, req.body, function (err, outreachId) {
        cb(err, outreachId)
      });
    }

  ],
  function (err, outreachId) {
    if (err) {
      helpers.send_failure(res, helpers.http_code_for_error(err), err);
    } else {
      helpers.send_success(res, outreachId);
    }
  });

};

exports.outreachPost = function (req, res) {
  var getp = req.query;
  var type = parseInt(getp.type);

  async.waterfall([
    // 1. make sure Parent ID, Outreach ID, Outreach Data are valid
    function (cb) {
      if (!req.body || type==null ||
          ((!ObjectID.isValid(getp.id) && type<2) || (!getp.id && type==2))
         ) {
        cb(helpers.no_such_item());
        return;
      }
      cb(null);
    },

    // 2. validate Privilages
    function (cb) {
      privilege_data.privilages(req.user.sub, getp.id, (type==2) ? 10 : 0, function (err, userId, flag) {
        if (flag) cb(err); else cb(helpers.invalid_privileges());
      })
    },

    // 3. update Outreach
    function (cb) {
      outreach_data.post_outreach(req.body, type, cb);
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

exports.outreachDelete = function (req, res) {
  var getp = req.query;
  var type = parseInt(getp.type);

  async.waterfall([

    // 1. make sure Parent ID, Outreach ID, Outreach Type are valid
    function (cb) {
      if (!ObjectID.isValid(getp.itemId) || type==null ||
          ((!ObjectID.isValid(getp.id) && type<2) || (!getp.id && type==2))
         ) {
        cb(helpers.no_such_item());
        return;
      }
      cb(null);
    },

    // 2. validate Privilages
    function (cb) {
      privilege_data.privilages(req.user.sub, getp.id, (type==2) ? 10 : 0, function (err, userId, flag) {
        if (flag) cb(err, userId); else cb(helpers.invalid_privileges());
      })
    },

    // 3. delete Outreach
    function (userId: string, cb) {
      outreach_data.delete_outreach(getp.id, userId, getp.itemId, type, cb);
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
