var helpers = require('./helpers.ts'),
    async = require("async");

var people_data = require("../data/peoples.ts");
var shared_data = require("../data/shared.ts");
var privilege_data = require("../data/privileges.ts");

var university_data = require("../data/universities.ts");
var department_data = require("../data/departments.ts");
var group_data = require("../data/groups.ts");

var publication_data = require("../data/publications.ts");

import { Period } from '../models/shared.ts';

var ObjectID = require('mongodb').ObjectID;

exports.version = "0.1.0";

// peoplesAux.map( function(row, index) {delete(row.positions)});
// var peoplesAuxSliced = peoplesAux.slice.apply(peoplesAux);

exports.peopleCreate = function (req, res) {
  async.waterfall([

    // 1. make sure User Data is valid / make sure User Email doesn't already exist
    function (cb) {
      if (!req.body) {
        cb(helpers.no_such_item());
        return;
      }
      cb();
    },

    // 2. create User Document
    function (cb) {
      people_data.create_people(req.body, function (err, userId) {
        cb(err, userId)
      })
    },

    // 3. Verify Personal Email (flag)
    function (userId: string, cb) {
      if (req.body.email_verified) {
        people_data.tasks_personal_email_verified(userId, function (err) {
          cb(err, userId);
        })
      } else {
        cb(null, userId)
      }
    },

    // 4. retrieve Positions data
    function (userId, cb) {
      people_data.people_actives(userId, true, 9, function (err, userData) {
        cb(err, userData);
      });
    },

  ],
  function (err, userData) {
    if (err) {
      helpers.send_failure(res, helpers.http_code_for_error(err), err);
    } else {
      helpers.send_success(res, userData);
    }
  });
};

exports.peopleDelete = function (req, res) {

  async.waterfall([

    // 1. validate Privilages
    function (cb) {
      privilege_data.privilages(req.user.sub, null, 10, function (err, userId, flag) {
        if (flag) cb(err, userId); else cb(helpers.invalid_privileges());
      })
    },

    // 2. delete User Document
    function (userId: string, cb) {
      people_data.delete_people(userId, function (err) {
        cb(err)
      });
    }

  ],
  function (err, id) {
      if (err) {
        helpers.send_failure(res, helpers.http_code_for_error(err), err);
      } else {
        helpers.send_success(res, id);
      }
  });
};

exports.peopleProfileCreate = function (req, res) {
  var host=req.get('host');

  async.waterfall([

    // 1. make sure Position Data, People ID, Group ID are valid
    // function (cb) {
    //   if (!req.body.position || (req.body.period.mode!=0 && req.body.period.mode!=1) || (req.body.period.mode==0 && !req.body.period.end && !req.body.period.start) || !req.body.group || !req.body.department || !req.body.university) {
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

    // 3. create user site
    function (userId: string, cb) {
      people_data.create_people_profile(host, userId, req.body, function (err) {
        cb(err, userId);
      })
    },

    // 4. retrieve Positions data
    function (userId: string, cb) {
      people_data.people_actives(userId, true, 9, function (err, userData) {
        cb(err, userData);
      });
    },

  ],
  function (err, userData) {
    if (err) {
      helpers.send_failure(res, helpers.http_code_for_error(err), err);
    } else {
      helpers.send_success(res, userData);
    }
  });

};

exports.positionPut = function (req, res) {
  var getp = req.query;

  async.waterfall([

    // 1. make sure Position Data, People ID, Group ID are valid
    function (cb) {
      if (!req.body || !getp.peopleId || !ObjectID.isValid(req.body.groupId)) {
        cb(helpers.no_such_item());
        return;
      }
      cb(null);
    },

    // 2. validate Privilages
    function (cb) {
      privilege_data.privilages(req.user.sub, req.body.groupId, 0, function (err, userId, flag) {
        if (flag || userId==getp.peopleId) cb(err, userId); else cb(helpers.invalid_privileges());
      })
    },

    // 3. create Position
    function (userId: string, cb) {
      people_data.create_position(getp.peopleId, null, req.body, true, null, function (err, id) {
        cb(err, id)
      });
    }

  ],
  function (err, id) {
    if (err) {
      helpers.send_failure(res, helpers.http_code_for_error(err), err);
    } else {
      helpers.send_success(res, id);
    }
  });
};

exports.positionPost = function (req, res) {
  var getp = req.query;

  var type = parseInt(getp.type);

  async.waterfall([

    // 1. make sure the Position Data, People ID, Type are valid
    function (cb) {
      if (!req.body || !req.body._id || type==null) {
        cb(helpers.no_such_item());
        return;
      }
      cb(null);
    },

    // 2. validate Privilages
    function (cb) {
      privilege_data.privilages(req.user.sub, getp.id, ObjectID.isValid(getp.id) ? 0 : 10, function (err, userId, flag) {
        if (flag || userId==req.body._id) cb(err); else cb(helpers.invalid_privileges());
      })
    },

    // 3. update Position
    function (cb) {
      if (ObjectID.isValid(getp.id)) { // Group ID
        people_data.update_position(req.body, getp.id, type, cb)
      } else {
        people_data.update_dummy_position(req.body, cb)
      }
    }

  ],
  function (err, id) {
    if (err) {
      helpers.send_failure(res, helpers.http_code_for_error(err), err);
    } else {
      helpers.send_success(res, id);
    }
  });
};

exports.positionDelete = function (req, res) {
  var getp = req.query;
  var mode = parseInt(getp.mode);

  async.waterfall([

    // 1. make sure People ID, Position ID, Group ID are valid
    function (cb) {
      if (!getp.peopleId || !ObjectID.isValid(getp.itemId) || !ObjectID.isValid(getp.id) || mode==null) {
        cb(helpers.no_such_item());
        return;
      }
      cb(null);
    },

    // 2. validate Privilages
    function (cb) {
      privilege_data.privilages(req.user.sub, getp.id, 0, function (err, userId, flag) {
        if (flag || userId==getp.peopleId) cb(err, userId); else cb(helpers.invalid_privileges());
      })
    },

    // 3. update Position
    function (userId: string, cb) {
      people_data.delete_position(userId, getp.peopleId, getp.itemId, getp.id, mode, getp.end, function (err, id) {
        cb(err, id)
      });
    }

  ],
  function (err, id) {
    if (err) {
      helpers.send_failure(res, helpers.http_code_for_error(err), err);
    } else {
      helpers.send_success(res, id);
    }
  });
};

exports.peoplesByIds = function (req, res) {
  var getp = req.query;
  var mode = parseInt(getp.mode);
  var type = parseInt(getp.type);
  var mini = parseInt(getp.mini);
  var more = parseInt(getp.more);

  var adminFlag: boolean = false;

  var searchCont: number = 0;
  var groupsIds: string[];

  var titleMin: number[] = [100, 150, 200, 211, 400];
  var titleMax: number[] = [149, 199, 210, 399, 499];

  async.waterfall([

    // get user ID (if)
    function (cb) {
      if (!req.user) {
        cb(null, null);
      } else if (mode==1) {
        privilege_data.privilages(req.user.sub, getp.id, 0, function (err, userId, flag) {
          adminFlag = flag;
          cb (err, userId);
        })
      } else {
        privilege_data.privilages(req.user.sub, null, 10, function (err, userId, flag) {
          cb (err, userId);
        })
      }
    },

    function (userId: string, cb) {
      // console.log('req.user',req.user)
      switch (mode) {
        case 0: // User Following List
          people_data.get_followings_ids(9, userId, null, function (err, ids) {
            cb (err, userId, ids);
          });
          break;
        case 1: // Group People
          group_data.group_items_ids("peoplesItems", getp.id, function (err, items) {
            if (type==0) {
              cb(err, userId, items.activesIds);
            } else if (type==1) {
              cb(err, userId, items.visitorsIds);
            } else if (type==2) {
              cb(err, userId, items.alumniIds);
            } else if (type==3) {
              cb(err, userId, items.activesIds.concat(items.alumniIds));
            }
          });
          break;
        // case 2: // Search DELETED
        case 3: // Type A Head
        case 7: // Type A Head (Share)
          people_data.people_typeahead_ids(getp.id, (mode==7) ? userId : getp.parentId, type, function (err, ids) {
            cb (err, userId, ids);
          });
          break;
        case 4: // Blocking List
          people_data.get_followings_ids(11, userId, null, function (err, ids) {
            cb (err, userId, ids);
          });
          break;
        case 5: // People Followed List (not User)
          people_data.get_item_followed_ids(getp.id, type, function (err, ids) {
            cb (err, userId, ids);
          });
          break;
        case 6: // People ID
          cb (null, userId, [getp.id]);
          break;
        case 8: // People Following List (not User)
          people_data.get_followings_ids(9, getp.id, null, function (err, ids) {
            cb (err, userId, ids);
          });
          break;
        case 9: // People Co-authors List (not User)
          shared_data.get_coauthors_ids(getp.id, type, userId, true, function (err, ids) {
            cb (err, userId, ids);
          });
          break;
        case 10: // Suggestions
          people_data.get_suggestions_ids(userId, function (err, ids) {
            cb (err, userId, ids);
          });
          break;
        case 11: // Departments
        case 12: // Departments Random
          // 15 - Search?
          department_data.department_items_ids("groupsItems", getp.id, function (err, groupsIdsTemp) {
            groupsIds = groupsIdsTemp;
            group_data.groups_items_ids("peoplesItems", groupsIdsTemp, function (err, items) {
              const ids: string[] = (items) ? [].concat(...items.map(r => r.activesIds)) : null;
              searchCont = ids ? ids.length : 0;
              if (mode==11) {
                cb (err, userId, ids ? ids.slice(more*10, (more+1)*10-1) : []);
              } else if (mode==12) {
                const idsShuffle = ids ? shuffle(ids) : [];
                cb (err, userId, idsShuffle ? idsShuffle.slice(0, 19) : []);
              }
            })
          });
          break;
        case 13: // Universities
        case 14: // Universities Random
          // 16 - Search?
          university_data.university_departments_ids(getp.id, 1, null, function (err, departments) {
            const departmentsIds = departments.map(r => r._id)
            if (departmentsIds[0]) {
              department_data.departments_items_ids("groupsItems", departmentsIds, function (err, groupsIdsTemp) {
                groupsIds = groupsIdsTemp;

                group_data.groups_items_ids("peoplesItems", groupsIds, function (err, items) {
                  const ids: string[] = (items) ? [].concat(...items.map(r => r.activesIds)) : null;
                  searchCont = ids ? ids.length : 0;
                  if (mode==13) {
                    cb (err, userId, ids ? ids.slice(more*10, (more+1)*10-1) : []);
                  } else if (mode==14) {
                    const idsShuffle = ids ? shuffle(ids) : [];
                    cb (err, userId, ids ? idsShuffle.slice(0, 19) : []);
                  }
                })
              })
            } else {
              cb (err, userId, []);
            }
          });
          break;
        default: {
          cb(null, null)
        }
      }
    },

    // get followings details
    function (userId: string, ids: string[], cb) {
      if (!userId || ids==null || mini==1 || mini==2 || mini==4 || mode==10) {
        cb (null, ids, null);
      } else {
        people_data.get_followings_ids(9, userId, null, function (err, followingsIds) {
          cb (err, ids, followingsIds);
        });
      }
    },

    // get people positions details (for speicifc Group ID if mode==1)
    function (ids, followingsIds, cb) {
      if (ids==null) {
        cb(helpers.no_such_item());
      } else {

        if (ids[0]==null) {

          cb(null, [])

        } else if (mode==11 || mode==13) {

          people_data.peoples_list_department(ids, groupsIds, followingsIds, function (err, peoples) {
            peoples=peoples.filter(r => r.positions[0].titles[0]>=titleMin[type] && r.positions[0].titles[0]<=titleMax[type]);
            searchCont = peoples.length;
            cb(err, peoples)
          })

        } else if (mode==12 || mode==14) {

          people_data.peoples_list_department(ids, groupsIds, followingsIds, function (err, peoples) {
            cb(err, peoples)
          })

        } else {

          people_data.peoples_list(ids, (mode==1) ? getp.id : null, followingsIds, mini, adminFlag, function (err, peoples) {
            if (mini==4) {
              peoples=peoples.filter(r => r.positions[0].status>4);
            } else if (mini==2) {
              peoples=peoples.filter(r => r.positions[0].mode==2).map(r => ({_id: r._id, name: r.name, pic: r.pic}));
            } else if (mini==0) {
              // console.log('peoples',peoples)
              // peoples=peoples.filter(r => r.positions[0].mode>0);
              var currentLength: number;
              peoples.forEach(function(people) {
                people.currentId = (people.library && people.library.current) ? people.library.current[people.library.current.length-1] : null;
                people.currentSize = (people.library && people.library.current) ? people.library.current.length : 0;
              })
            }
            peoples=peoples.filter(r => r._id!="academig");
            cb(err, peoples)
          });

        }

      }
    },

    // dress Groups
    function (peoples, cb) {
      if (mini==1 || mini==2) {
        cb(null,peoples)
      } else {
        var arrays = peoples.map(r => r.positions.map(r=> r.groupId))
        var flatten = [].concat(...arrays)
        var item;
        group_data.groups_list(flatten, null, null, null, null, 2, true, function (err, items) {
          peoples.forEach(function(people) {
            people.positions.forEach(function(position) {
              item = items.find(item => item._id.toString() == position.groupId.toString());
              position.group = item ? item.groupIndex : null;
              delete position.groupId;
            })
          })
          cb(err, peoples);
        });
      }
    },

    // dress Publications
    function (peoples, cb) {
      if (mini==0) {
        var ids: string[] = peoples.map(r => r.currentId)
        var publication;
        publication_data.publications_list(ids, null, null, 5, 0, false, function (err, publications) {
          // console.log('publications',publications)
          if (publications && publications.length>0) {
            peoples.forEach(function(people) {
              // console.log('people',people)
              if (people.currentId) {
                publication = publications.find(publication => publication._id.toString() == people.currentId.toString());
                people.currentReading = publication
                delete people.currentId;
              }
            })
          }
          cb(err, peoples);
        })
      } else {
        cb(null, peoples)
      }
    }

  ],
  function (err, peoples) {
    if (err) {
      helpers.send_failure(res, 500, err);
      return;
    }

    if (mode==2 || (mode>=11 && mode<=14)) {
      peoples.push(searchCont)
    }

    helpers.send_success(res, peoples);
  });
}

// https://stackoverflow.com/questions/2450954/how-to-randomize-shuffle-a-javascript-array
function shuffle(array) {
  var currentIndex = array.length, temporaryValue, randomIndex;

  // While there remain elements to shuffle...
  while (0 !== currentIndex) {

    // Pick a remaining element...
    randomIndex = Math.floor(Math.random() * currentIndex);
    currentIndex -= 1;

    // And swap it with the current element.
    temporaryValue = array[currentIndex];
    array[currentIndex] = array[randomIndex];
    array[randomIndex] = temporaryValue;
  }

  return array;
}

exports.peoplesQueryMini = function (req, res) {
  var getp = req.query;

  async.waterfall([
    function (cb) {
      people_data.peoples_query_ids(req.query.terms.split(","), function (err, peoplesMini) {
        cb(err, peoplesMini);
      });
    }
  ],
  function (err, minis) {
    if (err) {
      helpers.send_failure(res, helpers.http_code_for_error(err), err);
    } else {
      helpers.send_success(res, minis);
    }
  });
};

exports.peopleDataByURL = function (req, res) {
  var getp = req.params;
  async.waterfall([

    // 0. make sure People ID is valid
    function (cb) {
      if (!getp.people) {
        cb(helpers.no_such_item());
        return;
      }
      cb(null);
    },

    // 1. retrieve Group ID
    function (cb) {
      group_data.get_group_id(getp.university, getp.department, getp.group, 1, function (err, groupId, privacy) {
        if (groupId==null) {
          cb(helpers.no_such_item());
        } else {
          cb(null, groupId);
        }
      });
    },

    // 2. retrieve User ID
    function (groupId: string, cb) {
      if (!req.user) {
        cb(null, null, null);
      } else {
        privilege_data.privilages(req.user.sub, null, 10, function (err, userId, flag) {
          cb(err, userId, groupId);
        })
      }
    },

    // 3. retrieve people Data
    function (userId: string, groupId: string, cb) {
      peopleData(userId, groupId, getp.people, (req.user && req.user.scope.indexOf('write:groups')>-1), function (err, profileBasic) {
        if (req.params.people=="academig") profileBasic.positions = null;
        cb(err, profileBasic);
      });
    }

  ],
  function (err, profileBasic) {
    if (err) {
      helpers.send_failure(res, helpers.http_code_for_error(err), err);
    } else if (!profileBasic) {
      helpers.send_failure(res, 403, helpers.no_such_item());
    } else {
      helpers.send_success(res, profileBasic);
    }
  });
};

exports.peopleDataByName = function (req, res) {
  async.waterfall([

    // 0. make sure People ID is valid
    // function (cb) {
    //   if (!ObjectID.isValid(req.params.people)) {
    //     cb(helpers.no_such_item());
    //     return;
    //   }
    //   cb(null);
    // },

    // 1. retrieve User ID
    function (cb) {
      if (!req.user) {
        cb(null, null);
      } else {
        privilege_data.privilages(req.user.sub, null, 10, function (err, userId, flag) {
          cb(err, userId);
        })
      }
    },

    // 2. retrieve people Data
    function (userId: string, cb) {
      peopleData(userId, null, req.params.people, (req.user && req.user.scope.indexOf('write:groups')>-1), function (err, profileBasic) {
        if (req.params.people=="academig") profileBasic.positions = null;
        cb(err, profileBasic);
      });
    },

    // 3. dress Groups
    function (profileBasic, cb) {
      var positionData;

      if (profileBasic && profileBasic.positions) {
        group_data.groups_list(profileBasic.positions.map(r => r.groupId), null, null, null, null, 2, true, function (err, items) {
          profileBasic.positions.forEach(function(position) {
            positionData = items.find(item => item._id.toString() == position.groupId.toString());
            position.stage = positionData.stage;
            position.group = positionData.groupIndex;
            delete position.groupId;
          })
          cb(err, profileBasic);
        });
      } else {
        cb(null, profileBasic);
      }
    }

  ],
  function (err, profileBasic) {
    if (err) {
      helpers.send_failure(res, helpers.http_code_for_error(err), err);
    } else if (!profileBasic) {
      helpers.send_failure(res, 403, helpers.no_such_item());
    } else {
      helpers.send_success(res, profileBasic);
    }
  });
};

function peopleData(userId: string, groupId: string, peopleId: string, adminFlag: boolean, callback) {

  async.waterfall([

    // update Views
    function (cb) {
      shared_data.update_page_views('total', peopleId, 1, userId, function (err) {
        cb(null);
      });
    },

    // 1. get Following IDs
    function (cb) {
      if (userId) {
        people_data.get_followings_ids(9, userId, null, function (err, followingsIds) {
          cb(err, followingsIds);
        });
      } else {
        cb(null, null);
      }
    },

    // 2. get Blocking IDs
    function (followingsIds: string[], cb) {
      if (userId)
        people_data.get_followings_ids(11, userId, null, function (err, blockingsIds) {
          cb(err, followingsIds, blockingsIds);
        });
      else {
        cb(null, null, null);
      }
    },

    // 3. get Profile Plan Info (Flag)
    function (followingsIds: string[], blockingsIds: string[], cb) {
      if (userId==peopleId)
        people_data.user_plan_status(userId, function (err, plan_info) {
          cb(err, followingsIds, blockingsIds, plan_info);
        });
      else {
        cb(null, followingsIds, blockingsIds, null);
      }
    },

    // 4. get Profile Basic details
    function (followingsIds: string[], blockingsIds: string[], plan_info, cb) {
      people_data.people_profile_basic(peopleId, followingsIds, blockingsIds, groupId, adminFlag, function (err, profileBasic) {

        var groupFlag: boolean = false;

        if (groupId && profileBasic.positions[0]) {
          groupFlag = profileBasic.positions.findIndex(r => r.groupId.toString()==groupId.toString())>-1;
          profileBasic.positions = profileBasic.positions.filter(r => (r.status>=4 && r.status<=8));
        }

        if (profileBasic && (!ObjectID.isValid(groupId) || groupFlag)) {
           // (profileBasic._id==userId || profileBasic.stage==2)

          profileBasic.userPlan = plan_info;

          if (!adminFlag) {
            delete profileBasic.marketing;
            delete profileBasic.email;
          }

          if (profileBasic._id!=userId) {
            // delete profileBasic.domain;
            delete profileBasic.names;
          }

          delete profileBasic.stage;
          // delete profileBasic.positions;

          cb(err, profileBasic);

        } else {
          cb(null, null);
        }
      });
    },

  ],
  function (err, profileBasic) {
    callback(err, profileBasic)
  });
};

exports.peopleDetailsById = function (req, res) {
  var getp = req.query;

  async.waterfall([

    // 0. make sure People ID are valid
    function (cb) {
      if (!getp.peopleId) {
      // if (!ObjectID.isValid(getp.peopleId)) {
        cb(helpers.no_such_item());
        return;
      }
      cb(null);
    },

    // 1. retrieve User ID
    function (cb) {
      if (!req.user) {
        cb(null, null);
      } else {
        privilege_data.privilages(req.user.sub, null, 10, function (err, userId, flag) {
          cb(err, userId);
        })
      }
    },

    // 2. get Profile details
    function (userId: string, cb) {
      const adminFlag: boolean = (req.user && req.user.scope.indexOf('write:groups')>-1);
      people_data.people_profile(getp.peopleId, adminFlag, function (err, profile) {
        if (profile.library) {
          profile.folders = []; // profile.folders = Object.keys(profile.library);
          // for (let [key, value] of Object.entries(profile.library)) {
          for (let key of Object.keys(profile.library)) {
            profile.folders.push({"folder": key, "count": profile.library[key].length})
            // profile.folders.push({"folder": key, "count": Array(value).length})
          }
          delete profile.library;
        };
        if (getp.peopleId=="academig") profile.positions = null;
        delete profile.stage;
        cb(err, profile);
      });
    },

    // 5. dress Groups
    function (profile, cb) {
      var positionData;
      group_data.groups_list((profile && profile.positions) ? profile.positions.map(r => r.groupId) : [], null, null, null, null, 2, true, function (err, items) {
        if (profile && profile.positions) {
          profile.positions.forEach(function(position) {
            positionData = items.find(item => item._id.toString() == position.groupId.toString());
            position.stage = positionData.stage;
            position.group = positionData.groupIndex;
            delete position.groupId;
          })
        } else {
          profile.positions = [];
        }
        cb(err,profile);
      });
    }

  ],
  function (err, profile) {
    if (err) {
      helpers.send_failure(res, helpers.http_code_for_error(err), err);
    } else if (!profile) {
      helpers.send_failure(res, 403, helpers.no_such_item());
    } else {
      helpers.send_success(res, profile);
    }
  });
};

exports.publicInfo = function (req, res) {
  var getp = req.query;

  async.waterfall([

    // 1. make sure People ID is valid
    function (cb) {
      if (!getp.id) {
        cb(helpers.no_such_item());
        return;
      }
      cb(null);
    },

    // 2. retrieve People Public Info
    function (cb) {
      people_data.people_info(getp.id, "publicInfo", function (err, info) {
        cb (err, info);
      });
    }

  ],
  function (err, info) {
    if (err) {
      helpers.send_failure(res, helpers.http_code_for_error(err), err);
    } else {
      helpers.send_success(res, info.publicInfo);
    }
  });

};

// %%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%
// %%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%
// %%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%
// %%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%

exports.tablePut = function (req, res) {
  var getp = req.query;
  var mode = parseInt(getp.mode);

  async.waterfall([

    // 1. make sure Table Info, Table Mode are valid
    function (cb) {
      if (!req.body || mode==null) {
        cb(helpers.no_such_item());
        return;
      }
      cb(null);
    },

    // 2. validate Privilages
    function (cb) {
      privilege_data.privilages(req.user.sub, null, 10, function (err, userId, flag) {
        // if (flag) cb(err, userId); else cb(helpers.invalid_privileges());
        if (flag) cb(err, (req.user.scope.indexOf('write:publications')>-1) ? getp.id : userId); else cb(helpers.invalid_privileges());
      })
    },

    // 3. put Profile Table
    function (userId: string, cb) {
      people_data.put_table(req.body, mode, userId, function (err, itemId) {
        cb (err, itemId);
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
};

exports.tablePost = function (req, res) {
  var getp = req.query;
  var mode = parseInt(getp.mode);

  async.waterfall([

      // 1. make sure Table Info, Table Mode are valid
      function (cb) {
        if (!req.body || mode==null) {
          cb(helpers.no_such_item());
          return;
        }
        cb(null);
      },

      // 2. validate Privilages
      function (cb) {
        privilege_data.privilages(req.user.sub, null, 10, function (err, userId, flag) {
          // if (flag) cb(err, userId); else cb(helpers.invalid_privileges());
          if (flag) cb(err, (req.user.scope.indexOf('write:publications')>-1) ? getp.id : userId); else cb(helpers.invalid_privileges());
        })
      },

      // 3. update Profile Table
      function (userId: string, cb) {
        people_data.post_table(req.body, mode, userId, cb);
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

exports.tableDelete = function (req, res) {
  var getp = req.query;
  var mode = parseInt(getp.mode);

  async.waterfall([
      // make sure Item ID, Table Mode are valid
      function (cb) {
        if (!ObjectID.isValid(getp.itemId) || mode==null) {
          cb(helpers.no_such_item());
          return;
        }
        cb(null);
      },

      // 2. validate Privilages
      function (cb) {
        privilege_data.privilages(req.user.sub, null, 10, function (err, userId, flag) {
          // if (flag) cb(err, userId); else cb(helpers.invalid_privileges());
          if (flag) cb(err, (req.user.scope.indexOf('write:publications')>-1) ? getp.id : userId); else cb(helpers.invalid_privileges());
        })
      },

      // 3. delete Profile Table
      function (userId: string, cb) {
        people_data.delete_table(mode, getp.itemId, userId, cb);
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
