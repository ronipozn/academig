var helpers = require('./helpers.ts');
var departments = require('./departments.ts');
var async = require("async");

var emails = require("../misc/emails.ts");

var people_data = require("../data/peoples.ts");
var group_data = require("../data/groups.ts");
var galleries_data = require("../data/galleries.ts");
var privilege_data = require("../data/privileges.ts");
var shared_data = require("../data/shared.ts");

var university_data = require("../data/universities.ts");
var department_data = require("../data/departments.ts");

import { objectMini } from '../models/shared.ts';

var ObjectID = require('mongodb').ObjectID;

exports.galleriesByIds = function (req, res) {
  var getp = req.query;
  var mode = parseInt(getp.mode);
  var more = parseInt(getp.more);
  var searchCont: number;

  async.waterfall([

    // 1. get Galleries IDs
    function (cb) {
      switch (mode) {

        case 1: // User Profile
          if (!getp.id) {
            cb(helpers.no_such_item());
          } else {
            people_data.get_followings_ids(19, getp.id, null, function (err, galleiresId) {
              cb(err, galleiresId);
            });
          }
          break;

        case 2: // Group
          if (!ObjectID.isValid(getp.id)) {
            cb(helpers.no_such_item());
          } else {
            group_data.group_items_ids("eventsItems", getp.id, function (err, items) {
              cb(err, items.eventsIds);
            });
          }
          break;

        case 7: // Group AI
        case 8: // Group AI - Archive
          if (!ObjectID.isValid(getp.id)) {
            cb(helpers.no_such_item());
          } else {
            privilege_data.privilages(req.user.sub, getp.id, 0, function (err, userId, flag) {
              if (flag) {
                group_data.group_items_ids("eventsItems", getp.id, function (err, items) {
                  cb(err, items.eventsIds);
                });
              } else {
                cb(helpers.invalid_privileges());
              }
            })
          }
          break;

        case 3: // Departments
        case 4: // Departments (Search)
          department_data.department_items_ids("groupsItems", getp.id, function (err, groupsIds) {
            group_data.groups_items_ids("eventsItems", groupsIds, function (err, items) {

              // const ids = (items || {}).eventsIds;
              const ids = (items) ? [].concat(...items.map(r => r.eventsIds)) : null;

              if (more==null) {
                cb(helpers.no_such_item());
              } else if (mode==3) {
                searchCont = ids ? ids.length : 0;
                cb(err, ids ? ids.slice(more*10, (more+1)*10-1) : []);
              } else if (mode==4) {
                shared_data.search_ids_by_ids(getp.text, null, 6, more, ids, function (err, eventsIds, count) {
                  searchCont = count;
                  cb(err, eventsIds);
                });
              }
            })
          })
          break;

        case 5: // Universities
        case 6: // Universities (Search)
          university_data.university_departments_ids(getp.id, 1, null, function (err, departments) {
            const departmentsIds = departments.map(r => r._id)
            if (departmentsIds[0]) {
              department_data.departments_items_ids("groupsItems", departmentsIds, function (err, groupsIds) {
                group_data.groups_items_ids("eventsItems", groupsIds, function (err, items) {

                  // const ids = (items || {}).eventsIds;
                  const ids = (items) ? [].concat(...items.map(r => r.eventsIds)) : null;

                  if (more==null) {
                    cb(helpers.no_such_item());
                  } else if (mode==5) {
                    searchCont = ids ? ids.length : 0;
                    cb (err, ids ? ids.slice(more*10, (more+1)*10-1) : []);
                  } else if (mode==6) {
                    shared_data.search_ids_by_ids(getp.text, null, 6, more, ids, function (err, eventsIds, count) {
                      searchCont = count;
                      cb(err, eventsIds);
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

    // 2. get Galleries
    function (galleriesIds, cb) {
      galleries_data.galleries_list(galleriesIds, (mode==7) ? 1 : ((mode==8) ? -1 : 0), function (err, galleries) {
        cb(err, galleries)
      })
    },

    // 3. dress Groups
    function (galleries, cb) {
      if (galleries) {
        group_data.groups_list(galleries.map(r => r.groupId), null, null, null, null, 2, true, function (err, items) {
          galleries.forEach(function(gallery) {
            gallery.group=(items.find(item => item._id.toString() == (gallery.groupId || {}).toString()) || {}).groupIndex
            delete gallery.groupId;
          })
          cb(err,galleries);
        });
      } else {
        cb(null,galleries);
      }
    },

  ],
  function (err, galleries) {
    if (err) {
      helpers.send_failure(res, helpers.http_code_for_error(err), err);
    } else {
      if (mode==3 || mode==4 || mode==5 || mode==6) {
        galleries.push(searchCont)
      }
      helpers.send_success(res, galleries);
    }
  });
};

exports.galleryPut = function (req, res) {
  var getp = req.query;
  var mode = parseInt(getp.mode);

  async.waterfall([

      // 1. make sure Parent ID, Gallery Item are valid
      function (cb) {
        if (
            !req.body || !req.body.pics[0] ||
            ((mode==1 && !getp.id) || (mode==2 && !ObjectID.isValid(getp.id)))
           )
        {
         cb(helpers.no_such_item());
         return;
        }
        cb();
      },

      // 2. validate Privilages
      function (cb) {
        privilege_data.privilages(req.user.sub, getp.id, (mode==2) ? 3 : 10, function (err, userId, flag) {
          if (flag) cb(err, userId); else cb(helpers.invalid_privileges());
        })
      },

      // 3. put Gallery
      function (userId: string, cb) {
        const adminFlag: boolean = (req.user.scope.indexOf('write:groups')>-1);
        galleries_data.put_gallery(getp.id, userId, mode, adminFlag, req.body, function (err, galleryId) {
          cb(err, galleryId)
        });
      }

  ],
  function (err, galleryId) {
      if (err) {
        helpers.send_failure(res, helpers.http_code_for_error(err), err);
      } else {
        helpers.send_success(res, galleryId);
      }
  });

};

exports.galleryPost = function (req, res) {
  var getp = req.query;
  var mode = parseInt(getp.mode);

  async.waterfall([

      // make sure Parent ID, Gallery Data are valid
      function (cb) {
        if (
            !req.body || mode==null ||
            ((mode==1 && !getp.id) || (mode==2 && !ObjectID.isValid(getp.id)))
           ) {
          cb(helpers.no_such_item());
          return;
        }
        cb(null);
      },

      // 2. validate Privilages
      function (cb) {
        privilege_data.privilages(req.user.sub, getp.id, (mode==2) ? 3 : 10, function (err, userId, flag) {
          if (flag) cb(err); else cb(helpers.invalid_privileges());
        })
      },

      // 3. update Gallery
      function (cb) {
        galleries_data.post_gallery(req.body, cb);
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

exports.galleryDelete = function (req, res) {
  var getp = req.query;
  var mode = parseInt(getp.mode);

  async.waterfall([

    // make sure Parent ID, Gallery ID are valid
    function (cb) {
      if (
          !ObjectID.isValid(getp.itemId) || !req.body || mode==null ||
          ((mode==1 && !getp.id) || (mode==2 && !ObjectID.isValid(getp.id)))
         ) {
        cb(helpers.no_such_item());
        return;
      }
      cb(null);
    },

    // 2. validate Privilages
    function (cb) {
      privilege_data.privilages(req.user.sub, getp.id, (mode==2) ? 3 : 10, function (err, userId, flag) {
        if (flag) cb(err); else cb(helpers.invalid_privileges());
      })
    },

    // 3. delete Gallery
    function (cb) {
      galleries_data.delete_gallery(getp.id, getp.itemId, mode, cb);
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

exports.galleryDetailsById = function (req, res) {
  var getp = req.query;
  async.waterfall([

    function (cb) {
      if (!req.params || !ObjectID.isValid(req.params.galleryId))
        cb(helpers.no_such_item());
      else {
        cb(null)
      }
    },

    // 1. get the gallery details
    function (cb) {
      galleries_data.gallery_details(req.params.galleryId, function (err, gallery) {
        // console.log('gallery_details',getp.parentId)

        if (!ObjectID.isValid(getp.parentId) || (gallery || {}).groupId==getp.parentId) {
          cb(err, gallery);
        } else {
          cb(err, null);
        }
      })
    },

  ],
  function (err, gallery) {
    if (err) {
      helpers.send_failure(res, helpers.http_code_for_error(err), err);
    } else if (!gallery) {
      helpers.send_failure(res, 403, helpers.no_such_item());
    } else {
      helpers.send_success(res, gallery);
    }
  });
};
