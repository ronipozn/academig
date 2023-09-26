var helpers = require('./helpers.ts');
var async = require("async");

var group_data = require("../data/groups.ts");
var group_create_data = require("../data/groups_create.ts");

var people_data = require("../data/peoples.ts");
var position_data = require("../data/positions.ts");
var shared_data = require("../data/shared.ts");
var privilege_data = require("../data/privileges.ts");

var university_data = require("../data/universities.ts");
var department_data = require("../data/departments.ts");

var ObjectID = require('mongodb').ObjectID;

exports.version = "0.1.0";

exports.positionsByIds = function (req, res) {
  var getp = req.query;
  var mode = parseInt(getp.mode);
  var type = parseInt(getp.type); // also serve as More
  var positionsIds;
  var searchCont: number;

  async.waterfall([

    // 1. validate Privilages
    function (cb) {
      if (!req.user && mode!=7 && mode!=8) {
        cb(null, null, null);
      } else {
        // privilege_data.privilages(req.user.sub, getp.id, (mode==7 || mode==8) ? 0 : 10, function (err, userId, flag) {
        privilege_data.privilages(req.user.sub, getp.id, 0, function (err, userId, flag) {
          if (flag || (mode!=7 && mode!=8)) cb(err, flag, userId); else cb(helpers.invalid_privileges());
        })
      }
    },

    // 2. get positions ids
    function (adminFlag: boolean, userId: string, cb) {
      switch (mode) {
        case 0: // User Wall
          if (!userId || type==null) {
            cb(null, null, null, null);
          } else {
            people_data.get_followings_ids(3, userId, type, function (err, positionsIds) {
              cb(err, adminFlag, userId, positionsIds);
            });
          }
          break;
        case 1: // Group
        case 7: // Group AI
        case 8: // Group AI - Archive
          if (!ObjectID.isValid(getp.id)) {
            cb(helpers.no_such_item());
          } else {
            group_data.group_items_ids("positionsItems", getp.id, function (err, items) {
              cb(err, adminFlag, userId, items.positionsIds);
            });
          }
          break;
        case 3: // Departments
        case 4: // Departments (Search)
          department_data.department_items_ids("groupsItems", getp.id, function (err, groupsIds) {
            group_data.groups_items_ids("positionsItems", groupsIds, function (err, items) {

              // const ids = (items || {}).positionsIds;
              const ids: string[] = (items) ? [].concat(...items.map(r => r.positionsIds)) : null;

              if (type==null) {
                cb(helpers.no_such_item());
              } else if (mode==3) {
                searchCont = ids ? ids.length : 0;
                cb(err, adminFlag, userId, ids ? ids.slice(type*10, (type+1)*10-1) : []);
              } else if (mode==4) {
                shared_data.search_ids_by_ids(getp.text, userId, 5, type, ids, function (err, projectsIds, count) {
                  searchCont = count;
                  cb(err, adminFlag, userId, projectsIds);
                });
              }
            })
          });
          break;
        case 5: // Universities
        case 6: // Universities (Search)
          university_data.university_departments_ids(getp.id, 1, null, function (err, departments) {
            const departmentsIds = departments.map(r => r._id)
            if (departmentsIds[0]) {
              department_data.departments_items_ids("groupsItems", departmentsIds, function (err, groupsIds) {
                group_data.groups_items_ids("positionsItems", groupsIds, function (err, items) {

                  // const ids = (items || {}).positionsIds;
                  const ids: string[] = (items) ? [].concat(...items.map(r => r.positionsIds)) : null;

                  if (type==null) {
                    cb(helpers.no_such_item());
                  } else if (mode==5) {
                    searchCont = ids ? ids.length : 0;
                    cb (err, adminFlag, userId, ids ? ids.slice(type*10, (type+1)*10-1) : []);
                  } else if (mode==6) {
                    shared_data.search_ids_by_ids(getp.text, userId, 5, type, ids, function (err, positionsIds, count) {
                      searchCont = count;
                      cb(err, adminFlag, userId, positionsIds);
                    });
                  }
                })
              })
            } else {
              cb(err, adminFlag, userId, []);
            }
          });
          break;
        }
      },

      // 3. positions List
      function (adminFlag: boolean, userId: string, ids: string[], cb) {
        position_data.positions_list(ids, userId, 0, (mode==7) ? 1 : ((mode==8) ? -1 : 0), adminFlag, function (err, positions) {
          cb(err, positions)
        })
      },

      // 4. dress Groups
      function (positions, cb) {
        group_data.groups_list(positions.map(r => r.groupId), null, null, null, null, 2, true, function (err, items) {
          // console.log('items',items)
          positions.forEach(function(position) {
            position.group=items.find(item => item._id.toString() == position.groupId.toString()).groupIndex
            delete position.groupId;
          })
          cb(err,positions);
        });
      }

    ],
    function (err, positions) {
      if (err) {
        helpers.send_failure(res, helpers.http_code_for_error(err), err);
      } else {
        if (mode==2 || mode==3 || mode==4 || mode==5 || mode==6) {
          positions.push(searchCont)
        }
        helpers.send_success(res, positions);
      }
    });

}

exports.positionLabPut = function (req, res) {
  var host=req.get('host');

  var getp = req.query;

  async.waterfall([

    // 1. make sure Group Item, Position Item are valid
    function (cb) {
      if (!req.body.group || !req.body.position) {
        cb(helpers.no_such_item());
        return;
      }
      cb();
    },

    // 2. validate Privilages
    function (cb) {
      if (!req.user) {
        cb(null, null);
      } else {
        privilege_data.privilages(req.user.sub, null, 10, function (err, userId, flag) {
          if (flag) cb(err, userId); else cb(helpers.invalid_privileges());
        })
      }
    },

    // 3. put Group
    function (userId: string, cb) {
      group_create_data.create_group(req.body.group, host, userId, function (err, dummyUser) {
        // console.log('dummyUser',dummyUser,'position',dummyUser.positions[0].group)
        cb(err, userId, dummyUser._id, dummyUser.positions[0].group.group._id)
      });
    },

    // 4. put Position
    function (userId: string, dummyId: string, groupId: string, cb) {
      position_data.put_position(userId, groupId, false, req.body.position, function (err, positionId) {
        // console.log('dummyId',dummyId)
        cb(err, groupId, positionId, dummyId)
      });
    }

  ],
  function (err, groupId: string, positionId: string, dummyId: string) {
    if (err) {
      helpers.send_failure(res, helpers.http_code_for_error(err), err);
    } else {
      helpers.send_success(res, [groupId, positionId, dummyId]);
    }
  });

};

exports.positionPut = function (req, res) {
  var getp = req.query;

  async.waterfall([

    // 1. make sure Group ID, Position Item are valid
    function (cb) {
      console.log('Position1')
      if (!ObjectID.isValid(getp.id) || !req.body) {
        cb(helpers.no_such_item());
        return;
      }
      cb();
    },

    // 2. validate Privilages
    function (cb) {
      console.log('Position2')
      privilege_data.privilages(req.user.sub, getp.id, 0, function (err, userId, flag) {
        if (flag) cb(err, userId); else cb(helpers.invalid_privileges());
      })
    },

    // 3. put Position
    function (userId: string, cb) {
      console.log('Position3')
      const adminFlag: boolean = (req.user.scope.indexOf('write:groups')>-1);
      position_data.put_position(userId, getp.id, adminFlag, req.body, function (err, positionId) {
        cb(err, positionId)
      });
    }

  ],
  function (err, positionId) {
    if (err) {
      helpers.send_failure(res, helpers.http_code_for_error(err), err);
    } else {
      helpers.send_success(res, positionId);
    }
  });

};

exports.positionPost = function (req, res) {
  var getp = req.query;
  var mode = parseInt(getp.mode);

  async.waterfall([

    // 1. make sure Group ID, Position ID, Mode are valid
    function (cb) {
      if (!ObjectID.isValid(getp.id) || !ObjectID.isValid(getp.itemId) || (mode!=0 && mode!=1 && mode!=2) || mode==null) {
        cb(helpers.no_such_item());
        return;
      }
      cb();
    },

    // 2. validate Privilages
    function (cb) {
      privilege_data.privilages(req.user.sub, getp.itemId, 80, function (err, userId, flag) {
        if (flag) cb(err, userId); else cb(helpers.invalid_privileges());
      })
    },

    // 3. post Position
    function (userId: string, cb) {
      // const adminFlag: boolean = (req.user.scope.indexOf('write:groups')>-1);
      position_data.post_position(userId, getp.id, getp.itemId, mode, function (err, positionId) {
        cb(err, positionId)
      });
    }

  ],
  function (err, positionId) {
    if (err) {
      helpers.send_failure(res, helpers.http_code_for_error(err), err);
    } else {
      helpers.send_success(res, positionId);
    }
  });

};

exports.positionGeneralPost = function (req, res) {
  var getp = req.query;

  async.waterfall([

    // 1. make sure Group ID, Position ID, Position General Data are valid
    function (cb) {
      if (!ObjectID.isValid(getp.id) || !ObjectID.isValid(getp.itemId) || !req.body) {
        cb(helpers.no_such_item());
        return;
      }
      cb(null);
    },

    // 2. validate Privilages
    function (cb) {
      privilege_data.privilages(req.user.sub, getp.itemId, 80, function (err, userId, flag) {
        if (flag) cb(err); else cb(helpers.invalid_privileges());
      })
    },

    // 3. update Position General
    function (cb) {
      position_data.post_general(getp.id, getp.itemId, req.body, cb);
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

exports.positionLettersPost = function (req, res) {
  var getp = req.query;

  async.waterfall([

      // 1. make sure Group ID, Position ID, Position Letters Data are valid
      function (cb) {
        if (!ObjectID.isValid(getp.id) || !ObjectID.isValid(getp.itemId) || !req.body) {
          cb(helpers.no_such_item());
          return;
        }
        cb(null);
      },

      // 2. validate Privilages
      function (cb) {
        privilege_data.privilages(req.user.sub, getp.itemId, 80, function (err, userId, flag) {
          if (flag) cb(err); else cb(helpers.invalid_privileges());
        })
      },

      // 3. update Position Letters
      function (cb) {
        position_data.post_letters(getp.itemId, req.body, cb);
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

exports.positionDeadlinesPost = function (req, res) {
  var getp = req.query;

  async.waterfall([

      // 1. make sure Group ID, Position ID, Position Deadlines Data are valid
      function (cb) {
        if (!ObjectID.isValid(getp.id) || !ObjectID.isValid(getp.itemId) || !req.body) {
          cb(helpers.no_such_item());
          return;
        }
        cb(null);
      },

      // 2. validate Privilages
      function (cb) {
        privilege_data.privilages(req.user.sub, getp.itemId, 80, function (err, userId, flag) {
          if (flag) cb(err); else cb(helpers.invalid_privileges());
        })
      },

      // 3. update Position Deadlines
      function (cb) {
        position_data.post_deadlines(getp.itemId, getp.id, req.body, cb);
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

exports.positionDelete = function (req, res) {
  var getp = req.query;

  async.waterfall([

      // 1. make sure Group ID, Position ID are valid
      function (cb) {
        if (!ObjectID.isValid(getp.id) || !ObjectID.isValid(getp.itemId)) {
          cb(helpers.no_such_item());
          return;
        }
        cb(null);
      },

      // 2. validate Privilages
      function (cb) {
        privilege_data.privilages(req.user.sub, getp.itemId, 80, function (err, userId, flag) {
          if (flag) cb(err, userId); else cb(helpers.invalid_privileges());
        })
      },

      // 3. delete Position
      function (userId: string, cb) {
        position_data.delete_position(getp.id, userId, getp.itemId, cb);
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

exports.positionDetailsById = function (req, res) {
  var getp = req.query;

  async.waterfall([

    function (cb) {
      if (!req.params || !ObjectID.isValid(req.params.positionId))
        cb(helpers.no_such_item());
      else {
        cb(null)
      }
    },

    // 1. get Privilages && Following IDs
    function (cb) {
      if (!req.user) {
        cb(null, false, null);
      } else {
        privilege_data.privilages(req.user.sub, req.params.positionId, 80, function (err, userId, flag) {
          cb(err, flag, userId);
        })
        // people_data.get_followings_ids(3, userId, 3, function (err, followingsIds) {
      }
    },

    // 2. get the position details
    function (adminFlag: boolean, userId: string, cb) {
      position_data.position_details(req.params.positionId, adminFlag, userId, function (err, position) {
        if (!ObjectID.isValid(getp.parentId) || (position || {}).groupId==getp.parentId) {
          cb(err, position);
        } else {
          cb(err, null);
        }
        // positionStatus.appliedDate
      })
    },

    // 3. dress Group
    function (position, cb) {
      var positionModified = position;
      group_data.groups_list(position ? [position.groupId] : [], null, null, null, null, 2, true, function (err, item) {
        if (positionModified) {
          positionModified.group=item[0].groupIndex
          positionModified.affiliations=item[0].affiliations
          positionModified.country=item[0].country,
          positionModified.state=item[0].state,
          positionModified.city=item[0].city,
          positionModified.location=item[0].location
          delete positionModified.groupId;
        }
        cb(err,positionModified);
      });
    }

  ],
  function (err, position) {
    if (err) {
      helpers.send_failure(res, helpers.http_code_for_error(err), err);
    } else if (!position) {
      helpers.send_failure(res, 403, helpers.no_such_item());
    } else {
      helpers.send_success(res, position);
    }
  });
};

// %%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%
// %%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%
// %%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%
// %%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%

exports.positionStatsById = function (req, res) {
  var getp = req.query;

  async.waterfall([

    function (cb) {
      if (!req.params || !ObjectID.isValid(req.params.positionId))
        cb(helpers.no_such_item());
      else {
        cb(null)
      }
    },

    // 1. validate Privilages
    function (cb) {
      privilege_data.privilages(req.user.sub, req.params.positionId, 80, function (err, userId, flag) {
        if (flag) cb(err); else cb(helpers.invalid_privileges());
      });
    },

    // 2. get the position stats
    function (cb) {
      position_data.position_stats(req.params.positionId, function (err, stats) {
        cb(err, stats);
      })
    },

  ],
  function (err, stats) {
    if (err) {
      helpers.send_failure(res, helpers.http_code_for_error(err), err);
    } else if (!stats) {
      helpers.send_failure(res, 403, helpers.no_such_item());
    } else {
      helpers.send_success(res, stats);
    }
  });
};

// %%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%
// %%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%
// %%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%
// %%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%

exports.positionProposalsById = function (req, res) {
  var getp = req.query;

  async.waterfall([

    function (cb) {
      if (!req.params || !ObjectID.isValid(req.params.positionId))
        cb(helpers.no_such_item());
      else {
        cb(null)
      }
    },

    // 1. validate Privilages
    function (cb) {
      privilege_data.privilages(req.user.sub, req.params.positionId, 80, function (err, userId, flag) {
        if (flag) cb(err); else cb(helpers.invalid_privileges());
      });
    },

    // 2. get the position proposals
    function (cb) {
      position_data.position_proposals(req.params.positionId, function (err, proposals) {
        cb(err, proposals);
      })
    },

    // 3. dress Profiles
    function (proposals, cb) {
      people_data.peoples_list(proposals.map(r => r.id), null, null, 1, null, function (err, items) {
        proposals.forEach(function(proposal) {
          proposal.profile=items.find(item => item._id == proposal.id)
          // delete proposal.id;
        })
        cb(err,proposals);
      });
    }

  ],
  function (err, proposals) {
    if (err) {
      helpers.send_failure(res, helpers.http_code_for_error(err), err);
    } else if (!proposals) {
      helpers.send_failure(res, 403, helpers.no_such_item());
    } else {
      helpers.send_success(res, proposals);
    }
  });
};

// %%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%
// %%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%
// %%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%
// %%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%

exports.applyPut = function (req, res) {
  var getp = req.query;
  var mode = parseInt(getp.mode);

  async.waterfall([

    // 1. make sure Position ID, Mode, Apply Item are valid
    function (cb) {
      if (!ObjectID.isValid(getp.id) || mode==null || !req.body) {
        cb(helpers.no_such_item());
        return;
      }
      cb(null);
    },

    // 2. validate Privilages
    function (cb) {
      privilege_data.privilages(req.user.sub, getp.id, 10, function (err, userId, flag) {
        if (flag) cb(err, userId); else cb(helpers.invalid_privileges());
      })
    },

    // 3. put Poisiotn Apply
    function (userId: string, cb) {
      position_data.put_apply(userId, mode, getp.id, req.body, function (err, positionId) {
        cb(err, positionId)
      });
    }

  ],
  function (err, positionId) {
    if (err) {
      helpers.send_failure(res, helpers.http_code_for_error(err), err);
    } else {
      helpers.send_success(res, positionId);
    }
  });

};

exports.applyPost = function (req, res) {
  var getp = req.query;
  var mode = parseInt(getp.mode);

  async.waterfall([

    // 1. make sure Position ID, Apply Item are valid
    function (cb) {
      if (!ObjectID.isValid(getp.id) || (!req.body && mode==0)) {
        cb(helpers.no_such_item());
        return;
      }
      cb(null);
    },

    // 2. validate Privilages
    function (cb) {
      privilege_data.privilages(req.user.sub, getp.id, 10, function (err, userId, flag) {
        if (flag) cb(err, userId); else cb(helpers.invalid_privileges());
      })
    },

    // 3. post Position Apply
    function (userId: string, cb) {
      position_data.post_apply(userId, getp.id, mode, req.body, function (err, positionId) {
        cb(err, positionId)
      });
    }

  ],
  function (err, positionId) {
    if (err) {
      helpers.send_failure(res, helpers.http_code_for_error(err), err);
    } else {
      helpers.send_success(res, positionId);
    }
  });

};

exports.candidateStagePost = function (req, res) {
  var getp = req.query;
  var stage = parseInt(getp.stage);

  async.waterfall([

    // 1. make sure Position ID, Candidate Item are valid
    function (cb) {
      if (!ObjectID.isValid(getp.id) || getp.peopleId==null || stage==null) {
        cb(helpers.no_such_item());
        return;
      }
      cb(null);
    },

    // 2. validate Privilages
    function (cb) {
      privilege_data.privilages(req.user.sub, getp.id, 80, function (err, userId, flag) {
        if (flag) cb(err, userId); else cb(helpers.invalid_privileges());
      })
    },

    // 3. post Position Candidate
    function (userId: string, cb) {
      position_data.post_candidate_stage(userId, getp.id, getp.peopleId, stage, function (err, positionId) {
        cb(err)
      });
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

exports.candidateNotePost = function (req, res) {
  var getp = req.query;

  async.waterfall([

    // 1. make sure Position ID, Candidate Item are valid
    function (cb) {
      if (!ObjectID.isValid(getp.id) || getp.peopleId==null || !req.body.note) {
        cb(helpers.no_such_item());
        return;
      }
      cb(null);
    },

    // 2. validate Privilages
    function (cb) {
      privilege_data.privilages(req.user.sub, getp.id, 80, function (err, userId, flag) {
        if (flag) cb(err, userId); else cb(helpers.invalid_privileges());
      })
    },

    // 3. post Position Candidate
    function (userId: string, cb) {
      position_data.post_candidate_note(getp.id, getp.peopleId, req.body.note, function (err, positionId) {
        cb(err)
      });
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

// %%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%
// %%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%
// %%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%
// %%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%

exports.positionPostingPreview = function (req, res) {
  var getp = req.query;

  async.waterfall([

    // 1. validate Privilages
    function (cb) {
      if (!ObjectID.isValid(getp.universityId)) {
        helpers.send_failure(res, 500, null);
        return;
      }
      cb();
    },

    // 2. get University details
    function (cb) {
      // if (getp.universityId) {
        university_data.university_details(ObjectID(getp.universityId), 1, function (err, university) {
          cb(err, university);
        });
      // }
    },

    // 3. get Department details
    function (university, cb) {
      if (ObjectID.isValid(getp.departmentId)) {
        department_data.department_account(ObjectID(getp.departmentId), function (err, department) {
          cb(err, department, university);
        });
      } else {
        cb(null, null, university);
      }
    },

  ],
  function (err, department, university) {
    const preview = {
      department: department,
      university: university
    };

    // console.log('preview',preview)

    if (err) {
      helpers.send_failure(res, helpers.http_code_for_error(err), err);
    } else {
      helpers.send_success(res, preview);
    }
  });
}
