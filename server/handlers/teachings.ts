var helpers = require('./helpers.ts');
var async = require("async");

var emails = require("../misc/emails.ts");

var group_data = require("../data/groups.ts");
var people_data = require("../data/peoples.ts");
var teaching_data = require("../data/teachings.ts");
var shared_data = require("../data/shared.ts");
var privilege_data = require("../data/privileges.ts");

var university_data = require("../data/universities.ts");
var department_data = require("../data/departments.ts");

import { Period, objectMini } from '../models/shared.ts';

var ObjectID = require('mongodb').ObjectID;

exports.version = "0.1.0";

exports.teachingsByIds = function (req, res) {
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

    // 2. get teachings ids
    function (userId: string, cb) {
      switch (mode) {
        // case 0: // User Wall
        //   if (!userId || type==null) {
        //     callback(null, null);
        //   } else {
        //     people_data.get_followings_ids(3, userId, type, function (err, teachingsIds) {
        //       callback (err, teachingsIds);
        //     });
        //   }
        //   break;
        case 1: // Group
        case 8: // Group AI
        case 9: // Group AI - Archive
          if (!ObjectID.isValid(getp.id)) {
            cb(helpers.no_such_item());
          } else {
            group_data.group_items_ids("teachingsItems", getp.id, function (err, items) {
              cb(err, (type==1) ? items.pastTeachingsIds : items.currentTeachingsIds);
            });
          }
          break;
        case 2: // Profile
          if (!getp.id) {
            cb(helpers.no_such_item());
          } else {
            people_data.get_followings_ids(16, getp.id, null, function (err, teachingsIds) {
              cb(err, teachingsIds);
            });
          }
          break;
        case 4: // Departments
        case 5: // Departments (Search)
          department_data.department_items_ids("groupsItems", getp.id, function (err, groupsIds) {
            group_data.groups_items_ids("teachingsItems", groupsIds, function (err, items) {

              var ids: string[];
              if (items) {
                const currentIds: string[] = [].concat(...items.map(r => r.currentTeachingsIds));
                const pastIds: string[] = [].concat(...items.map(r => r.pastTeachingsIds));
                ids = currentIds.concat(pastIds);
              } else {
                ids = null;
              }

              if (type==null) {
                cb(helpers.no_such_item());
              } else if (mode==4) {
                searchCont = ids ? ids.length : 0;
                cb(err, ids ? ids.slice(type*10, (type+1)*10-1) : []);
              } else if (mode==5) {
                shared_data.search_ids_by_ids(getp.text, userId, 6, type, ids, function (err, teachingsIds, count) {
                  searchCont = count;
                  cb(err, teachingsIds);
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
                group_data.groups_items_ids("teachingsItems", groupsIds, function (err, items) {
                  // console.log('items',items)

                  var ids: string[];
                  if (items) {
                    const currentIds: string[] = [].concat(...items.map(r => r.currentTeachingsIds));
                    const pastIds: string[] = [].concat(...items.map(r => r.pastTeachingsIds));
                    ids = currentIds.concat(pastIds);
                  } else {
                    ids = null;
                  }

                  if (type==null) {
                    cb(helpers.no_such_item());
                  } else if (mode==6) {
                    searchCont = ids ? ids.length : 0;
                    cb (err, ids ? ids.slice(type*10, (type+1)*10-1) : []);
                  } else if (mode==7) {
                    shared_data.search_ids_by_ids(getp.text, userId, 6, type, ids, function (err, teachingsIds, count) {
                      searchCont = count;
                      cb(err, teachingsIds);
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

    // 3.
    // followingsIds: function (callback) {
    //   if (!ObjectID.isValid(userId)) {
    //     callback(null, null);
    //   } else {
    //     people_data.get_followings_ids(3, userId, 2, function (err, followingsIds) {
    //       callback (err, followingsIds);
    //     });
    //   }
    // }

    // 4. teachings List
    function (ids, cb) {
      // teaching_data.teachings_list(results.teachingsIds, results.followingsIds, 0, function (err, teachings) {
      teaching_data.teachings_list(ids, (mode==8) ? 1 : ((mode==9) ? -1 : 0), function (err, teachings) {
        cb(err, teachings)
      })
    },

    // 5. dress Groups
    function (teachings, cb) {
      group_data.groups_list(teachings.map(r => r.groupId), null, null, null, null, 2, true, function (err, items) {
        teachings.forEach(function(teaching) {
          teaching.group=(items.find(item => item._id.toString() == (teaching.groupId || {}).toString()) || {}).groupIndex
          delete teaching.groupId;
        })
        cb(err,teachings);
      });
    },

    // 6. dress Profile
    function (teachings, cb) {
      people_data.peoples_list(teachings.map(r => r.profileId), null, null, 1, null, function (err, items) {
        teachings.forEach(function(teaching) {
          teaching.profile=items.find(item => item._id == teaching.profileId)
          delete teaching.profileId;
        })
        cb(err,teachings);
      });
    }

  ],
  function (err, teachings) {
    if (err) {
      helpers.send_failure(res, helpers.http_code_for_error(err), err);
    } else {
      if (mode==3 || mode==4 || mode==5 || mode==6 || mode==7) {
        teachings.push(searchCont)
      }
      helpers.send_success(res, teachings);
    }
  });
}

exports.teachingPut = function (req, res) {
  var getp = req.query;
  var type = parseInt(getp.type);

  async.waterfall([

    // 1. make sure Teaching Item, Type, Parent ID are valid
    function (cb) {
      if (!req.body || type==null ||
          ((type==2 && !req.body.parentId) || (type<=1 && !ObjectID.isValid(req.body.parentId)))
         ) {
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

    // 3. put Teaching
    function (userId: string, cb) {
      const adminFlag: boolean = (req.user.scope.indexOf('write:groups')>-1);
      teaching_data.put_teaching(userId, type, adminFlag, req.body, function (err, teachingId) {
        cb(err, teachingId)
      });
    }

  ],
  function (err, teachingId) {
    if (err) {
      helpers.send_failure(res, helpers.http_code_for_error(err), err);
    } else {
      helpers.send_success(res, teachingId);
    }
  });

};

exports.teachingPost = function (req, res) {
  var getp = req.query;
  var type = parseInt(getp.type);

  async.waterfall([
    // 1. make sure Parent ID, Teaching ID, Teaching Data are valid
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

    // 3. update Teaching
    function (cb) {
      teaching_data.post_teaching(req.body, type, cb);
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

exports.teachingDelete = function (req, res) {
  var getp = req.query;
  var type = parseInt(getp.type);

  async.waterfall([

    // 1. make sure Parent ID, Teaching ID, Teaching Type are valid
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

    // 3. delete Teaching
    function (userId: string, cb) {
      teaching_data.delete_teaching(getp.id, userId, getp.itemId, type, cb);
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

// exports.teachingDetailsById = function (req, res) {
//
// };
