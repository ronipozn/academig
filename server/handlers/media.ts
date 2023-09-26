var helpers = require('./helpers.ts');
var async = require("async");

var emails = require("../misc/emails.ts");

var projects = require('./projects.ts');

var media_data = require("../data/media.ts");
var group_data = require("../data/groups.ts");
var people_data = require("../data/peoples.ts");
var project_data = require("../data/projects.ts");
var privilege_data = require("../data/privileges.ts");
var university_data = require("../data/universities.ts");
var department_data = require("../data/departments.ts");

import { objectMini } from '../models/shared.ts';

var ObjectID = require('mongodb').ObjectID;

exports.version = "0.1.0";

exports.mediaByIds = function (req, res) {
  var getp = req.query;
  var mode = parseInt(getp.mode);
  var type = parseInt(getp.type);
  var mini = parseInt(getp.mini);
  var more = parseInt(getp.more);

  var searchCont: number;

  async.waterfall([

    function (callback) {
      switch (mode) {

        case 1: // Profile
          if (!getp.id || type==null) {
            callback(helpers.no_such_item());
          } else {
            people_data.get_followings_ids(8, getp.id, type, function (err, mediaId) {
              callback (err, mediaId);
            });
          }
          break;

        case 2: // Group
          if (!ObjectID.isValid(getp.id) || type==null) {
            callback(helpers.no_such_item());
          } else {
            group_data.group_items_ids("mediaItems", getp.id, function (err, items) {
              if (type==0) {
                callback(err, (items || {}).talksIds);
              } else if (type==1) {
                callback(err, (items || {}).postersIds);
              } else if (type==2) {
                callback(err, (items || {}).pressesIds);
              }
            });
          }
          break;

        case 6: // Group AI
        case 7: // Group AI - Archive
          if (!ObjectID.isValid(getp.id) || type==null) {
            callback(helpers.no_such_item());
          } else {
            privilege_data.privilages(req.user.sub, getp.id, 0, function (err, userId, flag) {
              if (flag) {
                group_data.group_items_ids("mediaItems", getp.id, function (err, items) {
                  if (type==0) {
                    callback(err, (items || {}).talksIds);
                  } else if (type==1) {
                    callback(err, (items || {}).postersIds);
                  } else if (type==2) {
                    callback(err, (items || {}).pressesIds);
                  }
                });
              } else {
                callback(helpers.invalid_privileges());
              }
            })
          }
          break;

        case 3: // Project
          if (!ObjectID.isValid(getp.id) || type==null) {
            callback(helpers.no_such_item());
          } else {
            project_data.project_items_ids(2, getp.id, type, function (err, items) {
              if (type==0) {
                callback(err, (items || {}).talksIds);
              } else if (type==1) {
                callback(err, (items || {}).postersIds);
              } else if (type==2) {
                callback(err, (items || {}).pressesIds);
              }
            });
          }
          break;

        case 4: // Departments
          if (!getp.id || type==null) {
            callback(helpers.no_such_item());
          } else {
            department_data.department_items_ids("groupsItems", getp.id, function (err, groupsIds) {
              group_data.groups_items_ids("mediaItems", groupsIds, function (err, items) {

                var ids: string[];
                if (type==0) {
                  // ids = (items || {}).talksIds;
                  ids = (items) ? [].concat(...items.map(r => r.positionsIds)) : null;
                } else if (type==1) {
                  // ids = (items || {}).postersIds;
                  ids = (items) ? [].concat(...items.map(r => r.postersIds)) : null;
                } else if (type==2) {
                  // ids = (items || {}).pressesIds;
                  ids = (items) ? [].concat(...items.map(r => r.pressesIds)) : null;
                }

                searchCont = ids ? ids.length : 0;
                callback(err, ids ? ids.slice(more*10, (more+1)*10-1) : []);
              })
            });
          }
          break;

        case 5: // Universities
          if (!getp.id || type==null) {
            callback(helpers.no_such_item());
          } else {
            university_data.university_departments_ids(getp.id, 1, null, function (err, departments) {
              const departmentsIds = departments.map(r => r._id)
              if (departmentsIds[0]) {
                department_data.departments_items_ids("groupsItems", departmentsIds, function (err, groupsIds) {
                  group_data.groups_items_ids("mediaItems", groupsIds, function (err, items) {

                    var ids: string[];
                    if (type==0) {
                      // ids = (items || {}).talksIds;
                      ids = (items) ? [].concat(...items.map(r => r.positionsIds)) : null;
                    } else if (type==1) {
                      // ids = (items || {}).postersIds;
                      ids = (items) ? [].concat(...items.map(r => r.postersIds)) : null;
                    } else if (type==2) {
                      // ids = (items || {}).pressesIds;
                      ids = (items) ? [].concat(...items.map(r => r.pressesIds)) : null;
                    }

                    searchCont = ids ? ids.length : 0;
                    callback(err, ids ? ids.slice(more*10, (more+1)*10-1) : []);

                  })
                })
              } else {
                callback(err, []);
              }
            });
          }
          break;

        default: {
          callback(null, null)
        }
      }
    },

    // 2. media List
    function (ids, cb) {
      media_data.media_list(ids, type, mini, (mode==6) ? 1 : ((mode==7) ? -1 : 0), function (err, medias) {
        cb(err, medias)
      })
    },

    // 3. dress Groups
    function (medias, cb) {
      if (mini==1 || mode==2 || mode==3) {
        cb(null,medias)
      } else {
        group_data.groups_list(medias.map(r => r.groupId), null, null, null, null, 2, true, function (err, items) {
          medias.forEach(function(media) {
            media.group=(items.find(item => item._id.toString() == (media.groupId || {}).toString()) || {}).groupIndex
            delete media.groupId;
          })
          cb(err,medias);
        });
      }
    },

    // 4. dress Profile
    function (medias, cb) {
      people_data.peoples_list(medias.map(r => r.profileId), null, null, 1, null, function (err, items) {
        medias.forEach(function(media) {
          media.profile=items.find(item => item._id == media.profileId)
          delete media.profileId;
        })
        cb(err,medias);
      });
    }

  ],
  function (err, medias) {
    if (err) {
      helpers.send_failure(res, helpers.http_code_for_error(err), err);
    } else {
      if (mode==4 || mode==5) {
        medias.push(searchCont)
      }
      helpers.send_success(res, medias);
    }

  });
}

exports.mediaPut = function (req, res) {
  var getp = req.query;
  var type = parseInt(getp.type);
  var mode = parseInt(getp.mode);

  async.waterfall([
      // 1. make sure Parent ID, Media Data, Type, Mode are valid
      function (cb) {
          if (
              !req.body || type==null || mode==null ||
              ((mode==2 && !getp.id) || (mode<2 && !ObjectID.isValid(getp.id)))
             )
          {
            cb(helpers.no_such_item());
            return;
          }
          cb(null);
      },

      // 2. validate Privilages
      function (cb) {
        privilege_data.privilages(req.user.sub, getp.id, (mode==0) ? 0 : ((mode==1) ? 40 : 10), function (err, userId, flag) {
          if (flag) cb(err, userId); else cb(helpers.invalid_privileges());
        })
      },

      // 3. put Media according to Type
      function (userId: string, cb) {
        const adminFlag: boolean = (req.user.scope.indexOf('write:groups')>-1);
        media_data.put_media(getp.id, userId, mode, type, adminFlag, req.body, function (err, mediaId) {
          cb(err, mediaId)
        });
      }

  ],
  function (err, mediaId) {
      if (err) {
        helpers.send_failure(res, helpers.http_code_for_error(err), err);
      } else {
        helpers.send_success(res, mediaId);
      }
  });

};

exports.mediaPost = function (req, res) {
  var getp = req.query;
  var type = parseInt(getp.type);
  var mode = parseInt(getp.mode);

  async.waterfall([

      // 1. make sure Parent ID, Media ID, Media Data, Type, Mode are valid
      function (cb) {
        if (
            !ObjectID.isValid(getp.itemId) || !req.body || type==null || mode==null ||
            ((mode==2 && !getp.id) || (mode<2 && !ObjectID.isValid(getp.id)))
           ) {
          cb(helpers.no_such_item());
          return;
        }
        cb(null);
      },

      // 2. validate Privilages
      function (cb) {
        privilege_data.privilages(req.user.sub, getp.id, (mode==0) ? 0 : ((mode==1) ? 40 : 10), function (err, userId, flag) {
          if (flag) cb(err); else cb(helpers.invalid_privileges());
        })
      },

      // 3. update Media
      function (cb) {
        media_data.post_media(getp.itemId, type, req.body, cb);
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

exports.mediaDelete = function (req, res) {
  var getp = req.query;
  var type = parseInt(getp.type);
  var mode = parseInt(getp.mode);

  async.waterfall([

      // 1. make sure Parent ID, Media ID, Type, Mode are valid
      function (cb) {
        if (
            !ObjectID.isValid(getp.itemId) || !req.body || type==null || mode==null ||
            ((mode==2 && !getp.id) || (mode<2 && !ObjectID.isValid(getp.id)))
           ) {
            cb(helpers.no_such_item());
            return;
          }
          cb(null);
      },

      // 2. validate Privilages
      function (cb) {
        privilege_data.privilages(req.user.sub, getp.id, (mode==0) ? 0 : ((mode==1) ? 40 : 10), function (err, userId, flag) {
          if (flag) cb(err); else cb(helpers.invalid_privileges());
        })
      },

      // 3. delete Media
      function (cb) {
        media_data.delete_media(getp.id, getp.itemId, mode, type, cb);
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
