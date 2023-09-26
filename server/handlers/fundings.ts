const https = require('https');

var helpers = require('./helpers.ts');
var async = require("async");

var group_data = require("../data/groups.ts");
var people_data = require("../data/peoples.ts");
var funding_data = require("../data/fundings.ts");
var privilege_data = require("../data/privileges.ts");

import { objectMini, Period, groupComplex } from '../models/shared.ts';

var ObjectID = require('mongodb').ObjectID;

exports.version = "0.1.0";

// Pepole Roles: 0 - none
//               1 - PI
//               2 - Coordinator, funded by
//               3 - Speaker, funded by

exports.queryFundings = function (req, res) {
  var getp = req.query;

  async.waterfall([

    function (cb) {
      if (!req.user) {
        cb(null, null);
      } else {
        privilege_data.privilages(req.user.sub, null, 10, function (err, userId, flag) {
          cb(err);
        })
      }
    },

    function (cb) {
      https.get(`https://api.crossref.org/funders?query=` + getp.term + `&mailto=roni.pozner@gmail.com`, (resp) => {
        let data = '';

        // A chunk of data has been recieved.
        resp.on('data', (chunk) => {
          data += chunk;
        });

        // The whole response has been received. Print out the result.
        resp.on('end', () => {
          try{
            var fundings = JSON.parse(data).message.items.map(function(obj) {
              var rObj = obj;
              // rObj['name'] = (obj && obj.title) ? obj.title[0] : null;
              rObj['name'] = obj.name;
              return rObj;
            })
            // console.log('publication1',publications[1])
            cb(null, fundings);
          } catch(e) {
            cb(e);
            return;
          }
        });

      }).on("error", (err) => {
        cb(err) // console.log("Error: " + err.message);
      });
    }

  ],
  function (err, fundings) {
    console.log('fundings',fundings)
    if (err) {
      helpers.send_failure(res, helpers.http_code_for_error(err), err);
    } else {
      helpers.send_success(res, fundings);
    }
  })
}

exports.profileFundings = function (req, res) {
  var getp = req.query;

  async.waterfall([
    // 1. get Profile Fundings
    function (cb) {
      funding_data.profile_fundings(getp.peopleId, function (err, item) {
        cb(err, item.fundings);
      });
    }
  ],
  function (err, fundings) {
    if (err) {
      helpers.send_failure(res, helpers.http_code_for_error(err), err);
    }
    helpers.send_success(res, fundings);
  });
}

exports.fundingsByIds = function (req, res) {
  var getp = req.query;
  var mode = parseInt(getp.mode);
  var type = parseInt(getp.type);
  var mini = parseInt(getp.mini);

  async.waterfall([

    // 1. get fundings ids
    function (cb) {
      switch (mode) {

        case 0: // Group
          if (!ObjectID.isValid(getp.id)) {
            cb(helpers.no_such_item());
            return;
          } else {
            group_data.group_items_ids("fundingsItems", getp.id, function (err, items) {
              cb(err, type ? items.pastFundingsIds : items.currentFundingsIds);
            });
          }
          break;

        case 2: // Group AI
        case 3: // Group AI - Archive
          if (!ObjectID.isValid(getp.id)) {
            cb(helpers.no_such_item());
            return;
          } else {
            privilege_data.privilages(req.user.sub, getp.id, 0, function (err, userId, flag) {
              if (flag) {
                group_data.group_items_ids("fundingsItems", getp.id, function (err, items) {
                  cb(err, type ? items.pastFundingsIds : items.currentFundingsIds);
                });
              } else {
                cb(helpers.invalid_privileges());
              }
            })
          }
          break;

        case 1: // Profile
          if (!getp.id) {
            cb(helpers.no_such_item());
            return;
          } else {
            people_data.get_followings_ids(10, getp.id, null, function (err, items) {
              cb(null, items);
            });
          }
          break;

      }
    },

    // 2. fundings List
    function (ids: string[], cb) {
      funding_data.fundings_list(ids, mini, (mode==2) ? 1 : ((mode==3) ? -1 : 0), function (err, fundings) {
        cb(err, fundings)
      })
    },

    // 3. dress Groups
    function (fundings, cb) {
      if (mini==1) {
        cb(null,fundings)
      } else {
        var arrays = fundings.map(r => r.groupsIds)
        var flatten = [].concat(...arrays)
        group_data.groups_list(flatten, null, null, null, null, 2, true, function (err, items) {
          fundings.forEach(function(funding) {
            funding.groups = [];
            funding.groupsIds.forEach(function(groupId, index) {
              funding.groups[index]=(items.find(item => item._id.toString() == groupId.toString()) || {}).groupIndex
            })
          })
          cb(err,fundings);
        });
      }
    }

  ],
  function (err, fundings) {
    if (err) {
      helpers.send_failure(res, helpers.http_code_for_error(err), err);
    } else {
      helpers.send_success(res, fundings);
    }
  });

}

exports.fundingPut = function (req, res) {
  var getp = req.query;
  var type = parseInt(getp.type);

  async.waterfall([

      // 1. make sure Group ID, Type, Funding Item are valid
      function (cb) {
        if (!ObjectID.isValid(getp.id) || type==null || !req.body) {
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

      // 3. put Funding
      function (userId: string, cb) {
        const adminFlag: boolean = (req.user.scope.indexOf('write:groups')>-1);
        funding_data.put_funding(getp.id, userId, type, adminFlag, req.body, function (err, fundingId) {
          cb(err, fundingId)
        });
      },

  ],
  function (err, fundingId) {
      if (err) {
          helpers.send_failure(res, helpers.http_code_for_error(err), err);
      } else {
          helpers.send_success(res, fundingId);
      }
  });

};

exports.fundingPost = function (req, res) {
  var getp = req.query;

  async.waterfall([

      // 1. make sure Funding ID, Funding Data are valid
      function (cb) {
          if (!ObjectID.isValid(getp.id) || !ObjectID.isValid(getp.itemId) || !req.body) {
            cb(helpers.no_such_item());
            return;
          }
          cb(null);
      },

      // 2. validate Privilages
      function (cb) {
        privilege_data.privilages(req.user.sub, getp.id, 0, function (err, userId, flagGroup) {
          privilege_data.privilages(req.user.sub, getp.itemId, 20, function (err, userId, flagUser) {
            if (flagGroup || flagUser) cb(err); else cb(helpers.invalid_privileges());
          })
        })
      },

      // 3. update Funding
      function (cb) {
        funding_data.post_funding(getp.itemId, req.body, cb);
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

exports.fundingDelete = function (req, res) {
  var getp = req.query;
  var type = parseInt(getp.type);

  async.waterfall([

      // 1. make sure Group ID, Funding ID, Funding Mode are valid
      function (cb) {
        if (!ObjectID.isValid(getp.id) || !ObjectID.isValid(getp.itemId) || type==null) {
          cb(helpers.no_such_item());
          return;
        }
        cb(null);
      },

      // 2. validate Privilages
      function (cb) {
        privilege_data.privilages(req.user.sub, getp.id, 0, function (err, userId, flagGroup) {
          if (flagGroup) cb(err); else cb(helpers.invalid_privileges());
        })
      },

      // 3. delete Funding
      function (cb) {
        funding_data.delete_funding(getp.id, getp.itemId, type, cb);
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

exports.fundingRolesPut = function (req, res) {
  var getp = req.query;
  var type = parseInt(getp.type);

  async.waterfall([

      // 1. make sure Funding ID, Group ID, Roles Data are valid
      function (cb) {
        if (!ObjectID.isValid(getp.fundingId) || !ObjectID.isValid(getp.id) || !req.body) {
          cb(helpers.no_such_item());
          return;
        }
        cb(null);
      },

      // 2. validate Privilages
      function (cb) {
        privilege_data.privilages(req.user.sub, getp.id, 0, function (err, userId, flagGroup) {
          privilege_data.privilages(req.user.sub, getp.fundingId, 20, function (err, userId, flagUser) {
            if (flagGroup || flagUser) cb(err, userId); else cb(helpers.invalid_privileges());
          })
        })
      },

      // 3. put Funding Role
      function (userId: string, cb) {
        funding_data.put_funding_roles(getp.fundingId, getp.id, userId, req.body, function (err, fundingId) {
          cb(err, fundingId)
        });
      }

  ],
  function (err, fundingId) {
      if (err) {
        helpers.send_failure(res, helpers.http_code_for_error(err), err);
      } else {
        helpers.send_success(res, fundingId);
      }
  });

};

exports.fundingRolePost = function (req, res) {
  var getp = req.query;

  async.waterfall([

      // 1. make sure Funding ID, Role Type are valid
      function (cb) {
        if (!ObjectID.isValid(getp.fundingId) || req.body.type==null) {
          cb(helpers.no_such_item());
          return;
        }
        cb(null);
      },

      // 2. validate Privilages
      function (cb) {
        privilege_data.privilages(req.user.sub, getp.fundingId, 20, function (err, userId, flagUser) {
          if (flagUser) cb(err, userId); else cb(helpers.invalid_privileges());
        })
      },

      // 3. update Funding Role
      function (userId: string, cb) {
        funding_data.post_funding_role(getp.fundingId, userId, req.body.type, req.body.description, cb);
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

exports.fundingRoleDelete = function (req, res) {
  var getp = req.query;
  var type = parseInt(getp.type);

  async.waterfall([

      // 1. make sure Funding ID, Role ID (UserID), Group ID, Type are valid
      function (cb) {
        if (!ObjectID.isValid(getp.fundingId) || !getp.roleId || !ObjectID.isValid(getp.id) || type==null) {
          cb(helpers.no_such_item());
          return;
        }
        cb(null);
      },

      // 2. validate Privilages
      function (cb) {
        privilege_data.privilages(req.user.sub, getp.id, 0, function (err, userId, flagGroup) {
          privilege_data.privilages(req.user.sub, getp.fundingId, 20, function (err, userId, flagUser) {
            if (flagGroup || flagUser) cb(err); else cb(helpers.invalid_privileges());
          })
        })
      },

      // 3. delete Funding Role
      function (cb) {
        funding_data.delete_funding_role(getp.fundingId, getp.roleId, type, cb);
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

exports.fundingGroupPut = function (req, res) {
  var getp = req.query;
  console.log('roni')

  async.waterfall([

      // 1. make sure Funding ID, Group ID valid
      function (cb) {
        if (!ObjectID.isValid(getp.fundingId) || !ObjectID.isValid(getp.id)) {
          cb(helpers.no_such_item());
          return;
        }
        cb(null);
      },

      // 2. validate Privilages
      function (cb) {
        privilege_data.privilages(req.user.sub, getp.fundingId, 20, function (err, userId, flagUser) {
          console.log('flagUser',flagUser)
          if (flagUser) cb(err); else cb(helpers.invalid_privileges());
        })
      },

      // 3. add Funding to Group
      function (cb) {
        funding_data.put_funding_group(getp.fundingId, getp.id, cb);
      },

  ],
  function (err) {
      if (err) {
        helpers.send_failure(res, helpers.http_code_for_error(err), err);
      } else {
        helpers.send_success(res);
      }
  });

};

exports.fundingGroupDelete = function (req, res) {
  var getp = req.query;

  async.waterfall([

      // 1. make sure Funding ID, Group ID are valid
      function (cb) {
        if (!ObjectID.isValid(getp.fundingId) || !ObjectID.isValid(getp.id)) {
          cb(helpers.no_such_item());
          return;
        }
        cb(null);
      },

      // 2. validate Privilages
      function (cb) {
        privilege_data.privilages(req.user.sub, getp.fundingId, 20, function (err, userId, flagUser) {
          if (flagUser) cb(err); else cb(helpers.invalid_privileges());
        })
      },

      // 3. delete Funding from Group
      function (cb) {
        funding_data.delete_funding_group(getp.fundingId, getp.id, cb);
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
