var helpers = require('./helpers.ts');
var async = require("async");

var privilege_data = require("../data/privileges.ts");
var shared_data = require("../data/shared.ts");

var group_data = require("../data/groups.ts");
var group_create_data = require("../data/groups_create.ts");
var group_approve_data = require("../data/groups_approve.ts");

var people_data = require("../data/peoples.ts");
var department_data = require("../data/departments.ts");
var collaboration_data = require("../data/collaborations.ts");
var contests_data = require("../data/contests.ts");

import { groupComplex, Period, Affiliation } from '../models/shared.ts';
import { Category } from '../models/resources.ts';
import { FAQ } from '../models/faqs.ts';
import { Collaboration } from '../models/collaborations.ts';
import { CreatePosition } from '../models/peoples.ts';

var ObjectID = require('mongodb').ObjectID;

exports.version = "0.1.0";

exports.groupCreate = function (req, res) {
  var host=req.get('host');

  async.waterfall([

    // 1. make sure Group Data exist
    function (cb) {
      if (!req.body) {
        cb(helpers.no_such_item());
        return;
      }
      cb(null);
    },

    // 2. get user ID (if)
    function (cb) {
      if (!req.user) {
        cb(null, null);
      } else {
        privilege_data.privilages(req.user.sub, null, 10, function (err, userId, flag) {
          cb(err, userId);
        })
      }
    },

    // 3. create Group
    function (userId: string, cb) {
      group_create_data.create_group(req.body, host, userId, cb);
    }

  ],
  function (err, items) {
    if (err) {
      helpers.send_failure(res, helpers.http_code_for_error(err), err);
    } else {
      helpers.send_success(res, items);
    }
  });
};

exports.groupMiniUpdate = function (req, res) {
  var getp = req.query;
  var mode = parseInt(getp.mode);

  async.waterfall([

    // 1. make sure Item ID, Text, Pic are valid
    function (cb) {
      if (!ObjectID.isValid(getp.id) || !req.body) {
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

    // 3. update Group
    function (cb) {
      group_data.post_group_mini(req.body.text, req.body.pic, getp.id, cb);
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

exports.createMember = function (req, res) {
  var getp = req.query;
  var type = parseInt(getp.type);

  async.waterfall([

    // 1. make sure Member Data is valid
    function (cb) {
      if (!req.body) {
        cb(helpers.no_such_item());
        return;
      }
      cb(null);
    },

    // 2. validate Privilages
    function (cb) {
      privilege_data.privilages(req.user.sub, req.body.groupId, (req.body.mode==0) ? 0 : 10, function (err, userId, flag) {
        if (flag) cb(err, (req.user.scope.indexOf('write:groups')>-1) ? "academig" : userId); else cb(helpers.invalid_privileges());
      })
    },

    // 3. create Member
    function (userId: string, cb) {
      if (req.body.groupId) {

        const adminFlag: boolean = (req.user.scope.indexOf('write:groups')>-1);
        group_data.create_member(req.body, userId, getp.id, type, adminFlag, cb);

      } else {

        const positon: CreatePosition = {
          'titles': req.body.titles,
          'period': req.body.period,
          'groupComplex': req.body.group
        }

        people_data.create_dummy_position(userId, positon, function (err, positionId, groupComplex) {
          cb(err, {"_id": positionId, "group": groupComplex});
        })
      }
    }

  ],
  function (err, results) {
    console.log("results",results)
    if (err) {
      helpers.send_failure(res, helpers.http_code_for_error(err), err);
    } else {
      helpers.send_success(res, results);
    }
  });
};

exports.updateMember = function (req, res) {
  var getp = req.query;
  var type = parseInt(getp.type);
  var mode = parseInt(getp.mode);

  async.waterfall([

      // 1. make sure Group ID, People Type / Category, Mode, Type are valid
      function (cb) {
          if (!ObjectID.isValid(getp.id) || !req.body || mode==null || type==null) {
            cb(helpers.no_such_item());
            return;
          }
          cb(null);
      },

      // 2. validate Privilages
      function (cb) {
        privilege_data.privilages(req.user.sub, getp.id, 0, function (err, userId, flag) {
          if (flag) {
            cb(err, userId, true, false)
          } else if (userId==req.body._id) {
            cb(err, userId, false, false)
          } else if (req.user.scope.indexOf('write:groups')>-1) {
            cb(err, req.body._id, false, true)
          } else {
            cb(helpers.invalid_privileges());
          }
        })
      },

      // 3. update Member
      function (userId: string, groupSuperAdminFlag: boolean, adminFlag: boolean, cb) {
        group_data.update_member(req.body, userId, getp.id, type, mode, groupSuperAdminFlag, adminFlag, cb);
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

exports.moveMember = function (req, res) {
  var getp = req.query;

  var category = parseInt(getp.category);
  var type = parseInt(getp.type);
  var mode = parseInt(getp.mode);
  var action = parseInt(getp.action);
  var insert = parseInt(getp.insert);

  async.waterfall([

      // 1. make sure Group ID, People ID, Category, Type, Mode, Action are valid
      function (cb) {
        if (!ObjectID.isValid(getp.id) || !getp.peopleId || category==null || type==null || mode==null || action==null) {
          cb(helpers.no_such_item());
          return;
        }

        if ((mode==2 || mode==3) && insert==null) {
          cb(helpers.no_such_item());
          return;
        }

        cb(null);
      },

      // 2. validate Privilages
      function (cb) {
        privilege_data.privilages(req.user.sub, getp.id, 0, function (err, userId, flag) {
          if (flag || userId==getp.peopleId) {
            cb(err, userId);
          } else if (req.user.scope.indexOf('write:groups')>-1) {
            cb(err, getp.peopleId);
          } else {
            cb(helpers.invalid_privileges());
          }
        })
      },

      // 3. delete / move Member
      function (userId: string, cb) {
        if ((mode==2 || mode==3) && (action==0 || action==2)) {
          group_data.delete_and_move_member(userId, getp.id, getp.peopleId, category, insert, type, getp.end, cb);
        } else {
          group_data.delete_member(userId, getp.id, getp.peopleId, category, type, true, cb);
        }
      },

  ],
  function (err, results) {
      if (err) {
        helpers.send_failure(res, helpers.http_code_for_error(err), err);
      } else {
        helpers.send_success(res, results);
      }
  });
};

exports.changeState = function (req, res) {
  var getp = req.query;

  async.waterfall([

    // 1. make sure Group ID, State Data are valid
    function (cb) {
      if (!ObjectID.isValid(getp.id) || !req.body) {
        cb(helpers.no_such_item());
        return;
      }
      cb(null)
    },

    // 2. validate Privilages
    function (cb) {
      privilege_data.privilages(req.user.sub, getp.id, 0, function (err, userId, flag) {
        if (flag) cb(err, userId); else cb(helpers.invalid_privileges());
      })
    },

    // 3. get Group Current Stage
    function (userId: string, cb) {
      group_create_data.get_current_stage(getp.id, function (err, stage) {
        cb(err, userId, stage);
      })
    },

    // 4. change Group Stage
    function (userId: string, stage: number, cb) {
      group_approve_data.change_stage(req.body, getp.id, userId, stage, false, cb);
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

exports.changeWelcomeState = function (req, res) {
  var getp = req.query;

  async.waterfall([

    // 1. make sure Group ID, State Data are valid
    function (cb) {
      if (!ObjectID.isValid(getp.id)) {
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

    // 3. update Welcome Modal stage
    function (cb) {
      group_create_data.change_welcome_stage(0, getp.id, cb);
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

exports.itemsOrder = function (req, res) {
  var getp = req.query;
  var obj = parseInt(getp.obj);
  var mode = parseInt(getp.mode);
  var type = parseInt(getp.type);

  async.waterfall([

    // 1. make sure Parent ID, Item ID, Mode, Drag, Drop are valid
    function (cb) {
      if (!ObjectID.isValid(getp.id) || !ObjectID.isValid(getp.itemId) || mode==null || type==null || obj==null || req.body.drag==null || req.body.drop==null) {
        cb(helpers.no_such_item());
        return;
      }
      cb(null);
    },

    // 2. validate Privilages
    function (cb) {
      privilege_data.privilages(req.user.sub, getp.id, (obj==0) ? 0 : ((obj==1) ? 40 : 50), function (err, userId, flag) {
        if (flag) cb(err); else cb(helpers.invalid_privileges());
      })
    },

    // 3. update Items Order
    function (cb) {
      if (obj==0 && mode==9) {
        group_data.items_topics_order(getp.id, getp.itemId, req.body.drag, req.body.drop, cb);
      } else if (obj==0 && mode==2) {
        group_data.items_projects_order(getp.id, getp.topicId, getp.itemId, type, req.body.drag, req.body.drop, cb);
      } else {
        group_data.items_order(getp.id, getp.itemId, obj, mode, type, req.body.drag, req.body.drop, cb);
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

exports.groupHomePage = function (req, res) {
  var getp = req.query;

  if (!ObjectID.isValid(getp.id)) {
    helpers.send_success(res, []);
    return;
  }

  group_data.group_home_items(getp.id, function (err, page_items) {

    if (page_items.affiliations[0].title=='company') page_items.affiliations=null;

    if (err) {
      helpers.send_failure(res, 500, err);
      return;
    }
    helpers.send_success(res, page_items);
  });
};

exports.affiliationPut = function (req, res) {
  var getp = req.query;

  async.waterfall([

    // 1. make sure Group ID, Affiliation are valid
    function (cb) {
        if (!ObjectID.isValid(getp.id) || !req.body) {
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

    // 3. put Affiliation
    function (cb) {
        group_data.put_affiliation(req.body, getp.id, cb);
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

exports.affiliationDelete = function (req, res) {
  var getp = req.query;

  async.waterfall([

    // 1. make sure Group ID, Item ID are valid
    function (cb) {
      if (!ObjectID.isValid(getp.id) || !ObjectID.isValid(getp.itemId)) {
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

    // 3. delete Affiliation
    function (cb) {
      group_data.delete_affiliation(getp.itemId, getp.id, cb);
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

exports.groupPeoplesPage = function (req, res) {
  var getp = req.query;

  if (!ObjectID.isValid(getp.id)) {
    helpers.send_success(res, []);
    return;
  }

  group_data.group_page_items("peoplesPageItems", getp.id, function (err, page_items) {
    if (err) {
      helpers.send_failure(res, 500, err);
      return;
    }
    helpers.send_success(res, page_items);
  });

};

exports.groupPublicationsPage = function (req, res) {
  var getp = req.query;

  if (!ObjectID.isValid(getp.id)) {
    helpers.send_success(res, []);
    return;
  }

  group_data.group_page_items("publicationsPageItems", getp.id, function (err, page_items) {
    if (err) {
      helpers.send_failure(res, 500, err);
      return;
    }
    helpers.send_success(res, page_items);
  });
};

exports.groupResourcesPage = function (req, res) {
  var getp = req.query;

  if (!ObjectID.isValid(getp.id)) {
    helpers.send_success(res, []);
    return;
  }

  group_data.group_page_items("resourcesPageItems", getp.id, function (err, page_items) {
    shared_data.update_page_views('resources', getp.id, 0, null, function (err) {
      if (err) {
        helpers.send_failure(res, 500, err);
        return;
      }
      helpers.send_success(res, page_items);
    })
  });
};

exports.groupProjectsPage = function (req, res) {
  var getp = req.query;

  if (!ObjectID.isValid(getp.id)) {
    helpers.send_success(res, []);
    return;
  }

  group_data.group_page_items("projectsPageItems", getp.id, function (err, page_items) {
    shared_data.update_page_views('projects', getp.id, 0, null, function (err) {
      if (err) {
        helpers.send_failure(res, 500, err);
        return;
      }
      helpers.send_success(res, page_items);
    })
  });
};

exports.groupCollaborationsPage = function (req, res) {
  var getp = req.query;

  if (!ObjectID.isValid(getp.id)) {
    helpers.send_success(res, []);
    return;
  }

  group_data.group_page_items("collaborationsPageItems", getp.id, function (err, page_items) {
    if (err) {
        helpers.send_failure(res, 500, err);
        return;
    }
    helpers.send_success(res, page_items);
  });
};

exports.groupPositionsPage = function (req, res) {
  var getp = req.query;

  if (!ObjectID.isValid(getp.id)) {
    helpers.send_success(res, []);
    return;
  }

  group_data.group_page_items("positionsPageItems", getp.id, function (err, page_items) {
    if (err) {
        helpers.send_failure(res, 500, err);
        return;
    }
    helpers.send_success(res, page_items);
  });
};

exports.groupContactsPage = function (req, res) {
  var getp = req.query;

  if (!ObjectID.isValid(getp.id)) {
    helpers.send_success(res, []);
    return;
  }

  group_data.group_contact_items(getp.id, function (err, contact_items) {
    if (err) {
        helpers.send_failure(res, 500, err);
        return;
    }
    helpers.send_success(res, contact_items);
  });
};

///////////////////////////////////////////////////////////////////////
///////////////////////////////////////////////////////////////////////
///////////////////////////////////////////////////////////////////////
///////////////////////////////////////////////////////////////////////
///////////////////////////////////////////////////////////////////////
///////////////////////////////////////////////////////////////////////

exports.groupsByIds = function (req, res) {
  var getp = req.query;
  var mode = parseInt(getp.mode);
  var mini = parseInt(getp.mini);
  var type = parseInt(getp.type);

  var adminFlag: boolean = false;
  var searchCont: number;

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

    function (userId: string, cb) {
      if (!ObjectID.isValid(getp.id) && (mode==1 || mode==2 || mode==3 || mode==5 || mode==7 || mode==8)) {
        cb(null, userId, 9);
      } else {
        cb(null, userId, mode);
      }
    },

    // get Groups IDs for requsted case
    function (userId: string, caseMode: number, callback) {
      switch (caseMode) {
        case 0: // User Following List
          people_data.get_followings_ids(4, userId, null, function (err, groupsFollowingIds) {
            callback (err, userId, groupsFollowingIds);
          });
          break;
        case 11: // People Following List (not User)
          people_data.get_followings_ids(4, getp.id, null, function (err, groupsFollowingIds) {
            callback (err, userId, groupsFollowingIds);
          });
          break;
        case 1: // Department Groups List
          adminFlag = true;
          department_data.department_items_ids("groupsItems", getp.id, function (err, groupsIds) {
            callback (err, userId, groupsIds);
          });
          break;
        case 2: // Group Following List
          group_data.group_items_ids("networkItems", getp.id, function (err, items) {
            callback (err, userId, type ? items.followersIds : items.followingIds);
          });
          break;
        case 3: // Group Collaborations List
          group_data.group_items_ids("collaborationsItems", getp.id, function (err, items) {
            if (type==0) {
              callback(err, userId, items.currentIds);
            } else if (type==1) {
              callback(err, userId, items.pastIds);
            } else if (type==2) {
              callback(err, userId, items.currentIds.concat(items.pastIds));
            }
          });
        case 4: // User Group Relations List
          adminFlag = true;
          people_data.get_followings_ids(5, userId, type, function (err, groupsIds) {
            callback (err, userId, groupsIds);
          });
          break;
        case 5: // Group ID. Used in:
                //           1. Wall: Private Area
                //           2. Group: Create Collaboration
          callback (null, userId, [ObjectID(getp.id)]);
          break;
        // case 6: // Search DELETED
        // case 10: // DELETED
        case 7: // Type A Head
          group_data.group_typeahead_ids(getp.term, [ObjectID(getp.id)], function (err, groupsIds) {
            callback (err, userId, groupsIds);
          });
          break;
        case 8: // Type A Head + (Filter existing Collaborations)
          group_data.group_items_ids("collaborationsItems", getp.id, function (err, items) {
            const collaborationsIds = items.currentIds.concat(items.pastIds);
            collaboration_data.collaborations_list(collaborationsIds, mini, function (err, collaborations) {
              const groupsIds = collaborations.map(r => ObjectID(r.groupsIds[1])).concat(ObjectID(getp.id));
              group_data.group_typeahead_ids(getp.term, groupsIds, function (err, groupsIds) {
                callback (err, userId, groupsIds);
              });
            });
          });
          break;
        case 9:
         callback(null, userId, [])
      }
    },

    // get user followings group IDs
    function (userId: string, groupsIds: string[], cb) {
      if (!userId) {
          cb (null, userId, groupsIds, []);
      } else {
        people_data.get_followings_ids(4, userId, null, function (err, followingIds) {
          cb (err, userId, groupsIds, followingIds);
        });
      }
    },

    // get user positions relations
    function (userId: string, groupsIds, followingIds, cb) {
      if (!userId) {
          cb (null, groupsIds, followingIds, null);
      } else {
        people_data.people_group_relations(userId, function (err, relations) {
          // console.log('relations',relations)
          cb (err, groupsIds, followingIds, relations);
        });
      }
    },

    // get admins followings group Ids
    function (groupsIds, followingIds, relations, cb) {
      if (!relations) {
          cb (null, groupsIds, followingIds, relations, []);
      } else {
        var adminGroupsIds = relations.positions.filter(r => r.status<=7).map(r => ObjectID(r.groupId))
        group_data.get_admin_followings_ids(adminGroupsIds, function (err, followingsAdminIds) {
          cb (err, groupsIds, followingIds, relations, followingsAdminIds);
        });
      }
    },

    // assemble groups data (construct User data with isGroup)
    function (groupsIds, followingIds, relations, followingsAdminIds, cb) {
      group_data.groups_list(groupsIds, followingIds, followingsAdminIds, relations, null, mini, adminFlag, function (err, groups) {
        cb(err, groups);
      });
    }

  ],
  function (err, groups) {
    if (err) {
      helpers.send_failure(res, 500, err);
      return;
    }

    if (mode==6) {
      groups.push(searchCont)
    }

    helpers.send_success(res, groups);
  });
}

exports.groupDataByURL = function (req, res) {
  var getp = req.params;

  async.waterfall([

    // 1. get Group ID
    function (cb) {
      console.log('G1')
      group_data.get_group_id(getp.university, getp.department, getp.group, 1, function (err, groupId, privacy) {
        if (groupId==null) {
          cb(helpers.no_such_item());
        } else {
          cb(null, groupId, privacy);
        }
      });
    },

    // 2. get user ID (Flag)
    function (groupId: string, privacy: number, cb) {
      console.log('G2')
      if (!req.user) {
        if (privacy==0) {
          cb(helpers.no_such_item());
        } else {
          cb(null, null, groupId);
        }
      } else {
        // privilege_data.privilages(req.user.sub, null, 10, function (err, userId, flag) {
        privilege_data.privilages(req.user.sub, groupId, 3, function (err, userId, flag) {
          if (flag==false && privacy==0) {
            cb(helpers.no_such_item());
          } else {
            cb(null, userId, groupId);
          }
        })
      }
    },

    // 3. update Group Views
    function (userId: string, groupId: string, cb) {
      console.log('G3')
      shared_data.update_page_views('total', groupId, 0, null, function (err) {
        cb(err, userId, groupId);
      });
    },

    // 4. get user followings Group IDs
    function (userId: string, groupId: string, cb) {
      console.log('G4')
      if (!userId) {
        cb(null, userId, groupId, []);
      } else {
        people_data.get_followings_ids(4, userId, null, function (err, followingIds) {
          cb(err, userId, groupId, followingIds);
        });
      }
    },

    // 5. get User Relations details
    function (userId: string, groupId: string, followingIds: string[], cb) {
      console.log('G5')
      if (!userId) {
        cb(null, userId, groupId, followingIds, null);
      } else {
        people_data.people_group_relations(userId, function (err, relations) {
          cb(err, userId, groupId, followingIds, relations);
        });
      }
    },

    // 6. get PI name
    function (userId: string, groupId: string, followingIds:string[], relations, cb) {
      console.log('G6')
      group_data.groupMembersRaw(groupId, 4, function (err, admins) {
        const admin = admins.filter(r => r.positions[0].status==6)[0];
        cb(err, userId, groupId, followingIds, relations, (admin ? admin.name : null), (admin ? admin.positions[0].titles[0] : null))
      })
    },

    // 7. get Contest Status (Flag)
    function (userId: string, groupId: string, followingIds:string[], relations, piPrimaryName: string, piTitle: number, cb) {
      console.log('G7')
      const memberFlag: boolean = relations ? relations.positions.findIndex(r => (r.status>=4 && r.status<=7))>-1 : false;
      if (memberFlag) {
        contests_data.contestFlag(groupId, function (err, contest) {
          console.log('contest',contest)
          cb(err, userId, groupId, followingIds, relations, piPrimaryName, piTitle, contest)
        })
      } else {
        cb(null, userId, groupId, followingIds, relations, piPrimaryName, piTitle, null)
      }
    },

    // 8. get Group Partial Data
    function (userId: string, groupId: string, followingIds:string[], relations, piPrimaryName: string, piTitle: number, contest: any, cb) {
      console.log('G8')
      group_data.groups_list([groupId], followingIds, [], relations, null, 4, true, function (err, groupsAux) {

        if (groupsAux[0].stage==2 || (groupsAux[0].stage!=2 && groupsAux[0].relation.status>=5) || (req.user && req.user.scope.indexOf('read:groups'))) {

          groupsAux[0].piName = piPrimaryName;
          groupsAux[0].piTitle = piTitle;
          groupsAux[0].contest = contest;
          if ((req.user && req.user.scope.indexOf('write:groups')>-1)==false) groupsAux[0].marketing = null;

          const topics = groupsAux[0].topics;
          groupsAux[0].topics = topics ? topics.filter(r => r.ai!=1).map(r => ({"_id": r._id, "name": r.name, "count": r.currentProjectsIds.length+r.pastProjectsIds.length})) : [];

          groupsAux[0].progress[24] = groupsAux[0].progress[24]*groupsAux[0].seminarsPrivacy;
          groupsAux[0].seminarsPrivacy = null;
          groupsAux[0].progress[30] = groupsAux[0].progress[30]*groupsAux[0].kitPrivacy;
          groupsAux[0].kitPrivacy = null;

          if (groupsAux[0].relation.status!=6) {
            groupsAux[0].domain = null;
            groupsAux[0].extScore = null;
            groupsAux[0].intScore = null;
            groupsAux[0].plan = null;
            groupsAux[0].buildPro = null;
          }

          cb(err, groupsAux[0]);

        } else {
          cb(null, null);
        }

      });
    }

  ],
  function (err, group) {
    console.log('err',err)
    if (err) {
      helpers.send_failure(res, 500, err);
      return;
    }
    helpers.send_success(res, group);
  });
}

exports.topicsByIds = function (req, res) {
  var getp = req.query;
  var mode = parseInt(getp.mode);

  async.series({

    validate: function(callback) {
      if (!ObjectID.isValid(getp.id) && mode!=0 && mode!=1) {
        callback(helpers.no_such_item());
        return;
      }
      callback(null);
    },

    topics: function (callback) {
      privilege_data.privilages(req.user.sub, getp.id, 0, function (err, userId, flag) {
        if (flag) {
          group_data.group_items_ids("topicsItems", getp.id, function (err, items) {
            // var topics;
            // if (mode==0) {
            const topics = items ? items.filter(r => r.ai>-1).map(r => ({"_id": r._id, "name": r.name, "count": r.currentProjectsIds.length+r.pastProjectsIds.length})) : [];
            // } else {
            //   topics = items ? items.filter(r => r.ai==-1).map(r => ({"_id": r._id, "name": r.name, "count": r.currentProjectsIds.length+r.pastProjectsIds.length})) : [];
            // }
            callback(err, topics);
          });
        } else {
          callback(helpers.invalid_privileges());
        }
      })
    }
  },
  function (err, results) {
    if (err) {
      helpers.send_failure(res, 500, err);
      return;
    }
    helpers.send_success(res, results.topics);
  });
}

exports.groupExist = function (req, res) {
  var getp = req.query;

  async.waterfall([
    function (cb) {
      if (ObjectID.isValid(getp.departmentId) && ObjectID.isValid(getp.universityId)) {
        group_data.get_group_exist(getp.universityId, getp.departmentId, getp.group, function (err, groupId) {
          cb(err, groupId ? 1 : 0);
        });
      } else {
        cb(null, 0);
      }
    },
  ],
  function (err, groupId) {
    if (err) {
      helpers.send_failure(res, 500, err);
      return;
    }
    helpers.send_success(res, groupId);
  });
}

exports.followPut = function (req, res) {
  var getp = req.query;

  async.waterfall([

    // 1. make sure Actor Group ID, Target Group ID are valid
    function (cb) {
      if (!ObjectID.isValid(getp.actorGroupId) || !ObjectID.isValid(req.body.targetGroupId)) {
        cb(helpers.no_such_item());
        return;
      }
      cb(null);
    },

    // 2. validate Privilages
    function (cb) {
      privilege_data.privilages(req.user.sub, getp.actorGroupId, 0, function (err, userId, flag) {
        if (flag) cb(err, userId); else cb(helpers.invalid_privileges());
      })
    },

    // 3. toggle Follow
    function (userId: string, cb) {
      async.parallel({
        follow: function (callback) {
          group_data.toggle_followings_ids(true, 0, userId, getp.actorGroupId, req.body.targetGroupId, true, function (err) {
            callback(err);
          });
        },
        followed: function (callback) {
          group_data.toggle_followings_ids(true, 1, userId, req.body.targetGroupId, getp.actorGroupId, true, function (err) {
            callback(err);
          });
        }
      },
      function (err) {
        cb(err)
      });
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

exports.followDelete = function (req, res) {
  var getp = req.query;

  async.waterfall([

    // 1. make sure Actor Group ID, Target Group ID are valid
    function (cb) {
      if (!ObjectID.isValid(getp.actorGroupId) || !ObjectID.isValid(getp.targetGroupId)) {
        cb(helpers.no_such_item());
        return;
      }
      cb(null);
    },

    // 2. validate Privilages
    function (cb) {
      privilege_data.privilages(req.user.sub, getp.actorGroupId, 0, function (err, userId, flag) {
        if (flag) cb(err, userId); else cb(helpers.invalid_privileges());
      })
    },

    // 3. toggle Follow
    function (userId: string, cb) {
      async.parallel({
        follow: function (callback) {
          group_data.toggle_followings_ids(false, 0, userId, getp.actorGroupId, getp.targetGroupId, true, function (err) {
            callback(err);
          });
        },
        followed: function (callback) {
          group_data.toggle_followings_ids(false, 1, userId, getp.targetGroupId, getp.actorGroupId, true, function (err) {
            callback(err);
          });
        }
      },
      function (err) {
        cb(err)
      });
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
