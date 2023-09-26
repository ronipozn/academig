var helpers = require('./helpers.ts');
var async = require("async");

var groups = require('./groups.ts');
var peoples = require('./peoples.ts');

var group_data = require("../data/groups.ts");
var people_data = require("../data/peoples.ts");
var collaboration_data = require("../data/collaborations.ts");
var privilege_data = require("../data/privileges.ts");

var ObjectID = require('mongodb').ObjectID;

import { objectMini, Period } from '../models/shared.ts';

exports.version = "0.1.0";

exports.collaborationsByIds = function (req, res) {
  var getp = req.query;
  var type = parseInt(getp.type);
  var mini = parseInt(getp.mini);

  async.waterfall([

    // get user ID (if)
    function (cb) {
      if (!req.user) {
        cb(null, null);
      } else {
        privilege_data.privilages(req.user.sub, null, 10, function (err, userId, flag) {
          cb (err, userId);
        })
      }
    },

    // get Collaborations IDs for requsted case by Group ID
    function (userId: string, cb) {
      if (!ObjectID.isValid(getp.id) || type==null) {
        cb(helpers.no_such_item());
      } else {
        group_data.group_items_ids("collaborationsItems", getp.id, function (err, items) {
          if (type==0) {
            cb(err, userId, items.currentIds);
          } else if (type==1) {
            cb(err, userId, items.pastIds);
          } else if (type==2) {
            cb(err, userId, items.currentIds.concat(items.pastIds));
          } else if (type==3) {
            cb(err, userId, items.approveIds);
          }
        });
      }
    },

    // get user followings Group IDs
    function (userId: string, collaborationsIds: string[], cb) {
      if (!userId) {
        cb(null, null, collaborationsIds, null);
      } else {
        people_data.get_followings_ids(4, userId, null, function (err, followingIds) {
          cb (err, userId, collaborationsIds, followingIds);
        });
      }
    },

    // get user positions relations
    function (userId: string, collaborationsIds: string[], followingIds: string[], cb) {
      if (!userId) {
          cb (null, collaborationsIds, followingIds, null);
      } else {
        people_data.people_group_relations(userId, function (err, relations) {
          cb (err, collaborationsIds, followingIds, relations);
        });
      }
    },

    // get admins followings group IDs
    function (collaborationsIds: string[], followingIds: string[], relations, cb) {
      if (!relations) {
          cb (null, collaborationsIds, followingIds, null, null);
      } else {
        var adminGroupsIds = relations.positions.map(x => ObjectID(x.groupId))
        group_data.get_admin_followings_ids(adminGroupsIds, function (err, followingsAdminIds) {
          cb (err, collaborationsIds, followingIds, relations, followingsAdminIds);
        });
      }
    },

    // get Collaborations Info
    function (collaborationsIds: string[], followingIds: string[], relations, followingsAdminIds: string[], cb) {
      collaboration_data.collaborations_list(collaborationsIds, mini, function (err, collaborations) {
        // const collaboratorGroupId = collaborations.map(r => ObjectID(r.groupsIds[1]));
        const collaboratorGroupsIds = collaborations.map(r => ObjectID(r.groupsIds.filter(r => r!=ObjectID(getp.id))[0]));
        cb (err, collaboratorGroupsIds, followingIds, followingsAdminIds, relations, collaborations);
      });
    },

    // get groups partial data + add collaboration deatils
    function (collaboratorGroupIds: string[], followingIds: string[], followingsAdminIds: string[], relations, collaborations, cb) {
      group_data.groups_list(collaboratorGroupIds, followingIds, followingsAdminIds, relations, collaborations, mini, false, function (err, groups) {
        cb(err, groups)
      });
    }

  ],
  function (err, groups) {
    if (err) {
      helpers.send_failure(res, 500, err);
      return;
    }
    helpers.send_success(res, groups);
  });
}

exports.collaborationPut = function (req, res) {
  var getp = req.query;
  var type = parseInt(getp.type);

  async.waterfall([

      // 1. make sure Group ID, Collaboration Item, Collaboration Type are valid
      function (cb) {
        if (!ObjectID.isValid(getp.id) || !req.body || type==null) {
          cb(helpers.no_such_item());
          return;
        }
        cb(null);
      },

      // 2. validate Privilages
      function (cb) {
        privilege_data.privilages(req.user.sub, getp.id, 0, function (err, userId, flag) {
          if (flag) cb(err, userId); else cb(helpers.invalid_privileges());
        })
      },

      // 3. put Collaboration
      function (userId: string, cb) {
        const adminFlag: boolean = (req.user.scope.indexOf('write:groups')>-1);
        collaboration_data.put_collaboration(getp.id, userId, type, adminFlag, req.body, function (err, collaborationId) {
          cb(err, collaborationId)
        });
      }

  ],
  function (err, collaborationId) {
      if (err) {
        helpers.send_failure(res, helpers.http_code_for_error(err), err);
      } else {
        helpers.send_success(res, collaborationId);
      }
  });

};

exports.collaborationPost = function (req, res) {
  var getp = req.query;

  async.waterfall([

      // 1. make sure Collaboration ID, Group ID, Collaboration Data are valid
      function (cb) {
        if (!ObjectID.isValid(getp.itemId) || !ObjectID.isValid(getp.id) || !req.body) {
          cb(helpers.no_such_item());
          return;
        }
        cb(null);
      },

      // 2. validate Privilages
      function (cb) {
        privilege_data.privilages(req.user.sub, getp.itemId, 30, function (err, userId, flag) {
          if (flag) cb(err); else cb(helpers.invalid_privileges());
        })
      },

      // 3. update Collaboration
      function (cb) {
        collaboration_data.post_collaboration(getp.itemId, getp.groupId, req.body, cb);
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

exports.collaborationDelete = function (req, res) {
  var getp = req.query;
  var type = parseInt(getp.type);
  var mode = parseInt(getp.mode);

  async.waterfall([

      // 1. make sure the group ID, Collaboration ID, Type, Mode are valid
      function (cb) {
        if (!ObjectID.isValid(getp.id) || !ObjectID.isValid(getp.itemId) || type==null || mode==null) {
          cb(helpers.no_such_item());
          return;
        }
        cb(null);
      },

      // 2. validate Privilages
      function (cb) {
        privilege_data.privilages(req.user.sub, getp.itemId, 30, function (err, userId, flag) {
          if (flag) cb(err, userId); else cb(helpers.invalid_privileges());
        })
      },

      // 3. delete Collaboration
      function (userId: string, cb) {
        if (mode==0) { // Delete
          collaboration_data.delete_collaboration(getp.id, userId, getp.itemId, type, 0, cb);
        } else if (mode==1) { // End
          collaboration_data.end_collaboration(getp.id, userId, getp.itemId, cb);
        } else if (mode==2) { // Approve
          collaboration_data.approve_collaboration(getp.id, userId, getp.itemId, cb);
        } else if (mode==3) { // Decline
          collaboration_data.delete_collaboration(getp.id, userId, getp.itemId, type, 1, cb);
        }
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

/////////////////////////////////////////////
/////////////////////////////////////////////
///////////////// Sponsors //////////////////
/////////////////////////////////////////////
/////////////////////////////////////////////

exports.sponsorsByIds = function (req, res) {
  var getp = req.query;
  var type = parseInt(getp.type);
  var mini = parseInt(getp.mini);

  async.series({
    sponsorsIds: function (callback) {
      group_data.group_items_ids("sponsorsItems", getp.id, function (err, items) {
        callback (null, type ? items.governments : items.industries);
      });
    }
  },
  function (err, results) {
    collaboration_data.sponsors_list(results.sponsorsIds, function (err, sponsors) {
      if (err) {
        helpers.send_failure(res, 500, err);
        return;
      }
      helpers.send_success(res, sponsors);
    });
  });
}

exports.sponsorPut = function (req, res) {
  var getp = req.query;
  var type = parseInt(getp.type);

  async.waterfall([

      // 1. make sure Group ID, Sponsor Item, Type are valid
      function (cb) {
        if (!ObjectID.isValid(getp.id) || !req.body || type==null) {
          cb(helpers.no_such_item());
          return;
        }
        cb(null);
      },

      // 2. validate Privilages
      function (cb) {
        privilege_data.privilages(req.user.sub, getp.id, 0, function (err, userId, flag) {
          if (flag) cb(err); else cb(helpers.invalid_privileges());
        })
      },

      // 3. put Sponsor
      function (cb) {
        collaboration_data.put_sponsor(getp.id, type, req.body, function (err, sponsorId) {
          cb(err, sponsorId)
        });
      }

  ],
  function (err, sponsorId) {
      if (err) {
        helpers.send_failure(res, helpers.http_code_for_error(err), err);
      } else {
        helpers.send_success(res, sponsorId);
      }
  });

};

exports.sponsorPost = function (req, res) {
  var getp = req.query;

  async.waterfall([

      // 1. make sure Group ID, Sponsor ID, Sponsor Data are valid
      function (cb) {
        if (!ObjectID.isValid(getp.id) ||  !ObjectID.isValid(getp.itemId) || !req.body) {
          cb(helpers.no_such_item());
          return;
        }
        cb(null);
      },

      // 2. validate Privilages
      function (cb) {
        privilege_data.privilages(req.user.sub, getp.id, 0, function (err, userId, flag) {
          if (flag) cb(err); else cb(helpers.invalid_privileges());
        })
      },

      // 3. update Sponsor
      function (cb) {
        collaboration_data.post_sponsor(getp.itemId, req.body, cb);
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

exports.sponsorDelete = function (req, res) {
  var getp = req.query;
  var type = parseInt(getp.type);

  async.waterfall([

      // 1. make sure Group ID, Sponsor ID, Sponsor Type are valid
      function (cb) {
        if (!ObjectID.isValid(getp.id) || !ObjectID.isValid(getp.itemId) || type==null) {
          cb(helpers.no_such_item());
          return;
        }
        cb(null);
      },

      // 2. validate Privilages
      function (cb) {
        privilege_data.privilages(req.user.sub, getp.id, 0, function (err, userId, flag) {
          if (flag) cb(err); else cb(helpers.invalid_privileges());
        })
      },

      // 3. update Sponsor
      function (cb) {
        collaboration_data.delete_sponsor(getp.id, getp.itemId, getp.type, cb);
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
