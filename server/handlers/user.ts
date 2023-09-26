var helpers = require('./helpers.ts'),
    async = require("async"),
    stream = require('getstream');

var people_data = require("../data/peoples.ts");
var contact_data = require("../data/contacts.ts");
var shared_data = require("../data/shared.ts");
var messages_data = require("../data/messages.ts");
var privilege_data = require("../data/privileges.ts");
var invitess_data = require("../data/invites.ts");

var university_data = require("../data/universities.ts");
var department_data = require("../data/departments.ts");
var group_data = require("../data/groups.ts");

var compare_data = require("../data/compare.ts");

var emails = require("../misc/emails.ts");

import { objectMini, groupComplex, complexName, Quote, Period } from '../models/shared.ts';

var ObjectID = require('mongodb').ObjectID;

if (process.env.PORT) { // Production
  var client = stream.connect('3njpb9nj64v7', 'asvu8udev5q8s5edh8aatvmfbrnceecyyjfk6uy8ap33u3ahk8gg3kkk4zunqpgw', '33276');
} else { // Development
  var client = stream.connect('64f8ncgpc5vv', 'zb5tmfz52g5624cmqksemdasgqg9h98xfyu69688hgaejqt6hr67q6by9wswjhyh', '36378');
}

exports.version = "0.1.0";

exports.getUser = function (req, res) {
  async.waterfall([

    // 1. get user positions and status
    function (cb) {
      console.log('G1')
      const statusLte: number = (req.user.scope.indexOf('write:universities')>-1) ? 3 : 9;
      people_data.people_actives(req.user.sub, false, statusLte, function (err, people) {
        cb(err, people);
      });
    },

    // 2. compare groups data
    function (people, cb) {
      console.log('G2')
      if (people && people.compareIds && people.compareIds[0]) {
        compare_data.groups_compare_init(people.compareIds, function (err, groupsCompare) {
          people.compare = groupsCompare
          // console.log('people',people)
          cb(err, people);
        });
      } else {
        cb (null, people);
      }
    },

    // 3. get Unread Messages Count
    function (people, cb) {
      console.log('G3')
      if (people) {
        delete people.compareIds;
        messages_data.unread_sum(people.channelsIds, people._id, function (err, unread) {
          delete people.channelsIds;
          people.unread = unread;
          cb(err, people);
        });
      } else {
        cb(null, null);
      }
    },

    // 4. get Unseen Notification Count
    function (people, cb) {
      console.log('G4')
      if (people) {
        var notification = client.feed("notification", people._id);
        notification.get({ limit: 1 }).then(activitiesSuccess).catch(activitiesError);
      } else {
        cb(null,people)
      }

      function activitiesSuccess(successData) {
        people["unseen"]=successData.unseen;
        cb(null,people)
      }

      function activitiesError(errorData) {
        console.log('errorData',errorData)
        cb(null,people)
        // cb(errorData,null)
      }
    },

    // 5. generate getStream User Token
    function (people, cb) {
      console.log('G5')
      if (people) {
        const userToken = client.createUserToken(people._id);
        console.log('getStream userToken',userToken)
        people["token"]=userToken;
        cb(null, people)
      } else {
        cb(null, people)
      }
    }

  ],
  function (err, people) {
    if (err) {
      helpers.send_failure(res, helpers.http_code_for_error(err), err);
    } else {
      helpers.send_success(res, people);
    }
  });
}

exports.folderPut = function (req, res) {
  async.waterfall([

    // 1. make sure Item ID, Folder are valid
    function (cb) {
      console.log('folderPut',req.body)
      if (!req.body || !ObjectID.isValid(req.body.itemId) || !req.body.folder) {
        cb(helpers.no_such_item());
        return;
      }
      cb(null);
    },

    // 2. validate Privilages
    function (cb) {
      privilege_data.privilages(req.user.sub, null, 10, function (err, userId, flag) {
        if (flag) cb(err, userId); else cb(helpers.invalid_privileges());
      })
    },

    // 3. set Library Folder
    function (userId: string, cb) {
      people_data.set_library_folder(userId, req.body.itemId, req.body.folder, function (err, folderId) {
        cb(err, folderId);
      });
    }

  ],
  function (err, folderId) {
    if (err) {
      helpers.send_failure(res, helpers.http_code_for_error(err), helpers.no_such_item());
    } else {
      helpers.send_success(res, folderId);
    }
  });
};

exports.folderDelete = function (req, res) {
  var getp = req.query;
  var type = parseInt(getp.type);

  async.waterfall([

    // 1. make sure Item ID, Folder are valid
    function (cb) {
      if (((!req.body || !ObjectID.isValid(getp.itemId) || !getp.folder) && type==0) || (!getp.folder && type==1) || (type!=0 && type!=1)) {
        cb(helpers.no_such_item());
        return;
      }
      cb(null);
    },

    // 2. validate Privilages
    function (cb) {
      privilege_data.privilages(req.user.sub, null, 10, function (err, userId, flag) {
        if (flag) cb(err, userId); else cb(helpers.invalid_privileges());
      })
    },

    // 3. unset Library Folder
    function (userId: string, cb) {
      if (type==0) {
        people_data.pull_library_folder(userId, getp.itemId, getp.folder, function (err) {
          cb(err);
       });
      } else {
        people_data.unset_library_folder(userId,  getp.folder, function (err) {
          cb(err);
       });
      }
    }

  ],
  function (err) {
    if (err) {
      helpers.send_failure(res, helpers.http_code_for_error(err), helpers.no_such_item());
    } else {
      helpers.send_success(res, null);
    }
  });
};


exports.readFolderPost = function (req, res) {
  async.waterfall([

    // 1. make sure Item ID, Folder are valid
    function (cb) {
      if (!req.body || !ObjectID.isValid(req.body.itemId) || !req.body.folder) {
        cb(helpers.no_such_item());
        return;
      }
      cb(null);
    },

    // 2. validate Privilages
    function (cb) {
      privilege_data.privilages(req.user.sub, null, 10, function (err, userId, flag) {
        if (flag) cb(err, userId); else cb(helpers.invalid_privileges());
      })
    },

    // 3. post Read Folder
    function (userId: string, cb) {
      people_data.post_read_folder(userId, req.body.itemId, req.body.folder, function (err) {
        cb(err);
      });
    }

  ],
  function (err) {
    if (err) {
      helpers.send_failure(res, helpers.http_code_for_error(err), helpers.no_such_item());
    } else {
      helpers.send_success(res, null);
    }
  });
};

exports.readFolderDelete = function (req, res) {
  var getp = req.query;
  var type = parseInt(getp.type);

  async.waterfall([

    // 1. make sure Item ID, Folder ID are valid
    function (cb) {
      if (!ObjectID.isValid(getp.itemId) || !ObjectID.isValid(getp.folderId)) {
        cb(helpers.no_such_item());
        return;
      }
      cb();
    },

    // 2. validate Privilages
    function (cb) {
      privilege_data.privilages(req.user.sub, null, 10, function (err, userId, flag) {
        if (flag) cb(err, userId); else cb(helpers.invalid_privileges());
      })
    },

    // 3. delete Read Folder
    function (userId: string, cb) {
      people_data.pull_read_folder(userId, getp.itemId, getp.folderId, function (err) {
        cb(err);
     });
    }

  ],
  function (err) {
    if (err) {
      helpers.send_failure(res, helpers.http_code_for_error(err), helpers.no_such_item());
    } else {
      helpers.send_success(res, null);
    }
  });
};

exports.challengePut = function (req, res) {
  var getp = req.query;

  async.waterfall([

    // 1. make sure Goal is valid
    function (cb) {
      console.log('challengePut', getp.goal)
      if (!getp.goal || getp.goal<=0) {
        cb(helpers.no_such_item());
        return;
      }
      cb(null);
    },

    // 2. validate Privilages
    function (cb) {
      privilege_data.privilages(req.user.sub, null, 10, function (err, userId, flag) {
        if (flag) cb(err, userId); else cb(helpers.invalid_privileges());
      })
    },

    // 3. set Library Folder
    function (userId: string, cb) {
      people_data.toggle_challenge(true, userId, getp.goal, function (err) {
        cb (err);
      });
    }

  ],
  function (err) {
    if (err) {
      helpers.send_failure(res, helpers.http_code_for_error(err), helpers.no_such_item());
    } else {
      helpers.send_success(res, null);
    }
  });
};

exports.challengeDelete = function (req, res) {
  async.waterfall([

    // 1. validate Privilages
    function (cb) {
      console.log('challengeDelete')
      privilege_data.privilages(req.user.sub, null, 10, function (err, userId, flag) {
        if (flag) cb(err, userId); else cb(helpers.invalid_privileges());
      })
    },

    // 2. unset Challenge
    function (userId: string, cb) {
      people_data.toggle_challenge(false, userId, null, function (err) {
        cb (err);
      });
    }

  ],
  function (err) {
    if (err) {
      helpers.send_failure(res, helpers.http_code_for_error(err), helpers.no_such_item());
    } else {
      helpers.send_success(res, null);
    }
  });
};

exports.wallPost = function (req, res) {
  var getp = req.query;
  var state = parseInt(getp.state);
  var index = parseInt(getp.index);

  async.waterfall([

    // 1. make sure Item ID, Mode are valid
    function (cb) {
      if ((state<0 || state>1) || (index<0 || index>3) ) {
        cb(helpers.no_such_item());
        return;
      }
      cb(null);
    },

    // 2. validate Privilages
    function (cb) {
      privilege_data.privilages(req.user.sub, null, 10, function (err, userId, flag) {
        if (flag) cb(err, userId); else cb(helpers.invalid_privileges());
      })
    },

    // 3. toggle Wall
    function (userId: string, cb) {
      people_data.toggle_wall(userId, index, state, function (err, itemId) {
        cb (err, itemId);
      });
    }

  ],
  function (err, itemId) {
    if (err) {
      helpers.send_failure(res, helpers.http_code_for_error(err), helpers.no_such_item());
    } else {
      helpers.send_success(res, itemId);
    }
  });
};

exports.followPut = function (req, res) {
  var getp = req.query;
  var mode = parseInt(getp.mode);
  var type = parseInt(getp.type);

  async.waterfall([

    // 1. make sure Item ID, Mode are valid
    function (cb) {
      if (!req.body || mode==null || ((!ObjectID.isValid(req.body.itemId) && (mode<9 || mode==12)) || (!req.body.itemId && (mode==9 || mode==11)))) {
        cb(helpers.no_such_item());
        return;
      }
      cb(null);
    },

    // 2. validate Privilages
    function (cb) {
      privilege_data.privilages(req.user.sub, null, 10, function (err, userId, flag) {
        if (flag) cb(err, userId); else cb(helpers.invalid_privileges());
      })
    },

    // 3. set Following / Blocking
    function (userId: string, cb) {
      if (mode==12) {
        people_data.toggle_compare_ids(true, userId, req.body.itemId, function (err, itemId) {
          cb (err, itemId);
        });
      } else if (mode==11) {
        people_data.toggle_blocking_ids(true, userId, req.body.itemId, function (err, itemId) {
          cb (err, itemId);
        });
      } else {
        people_data.toggle_followings_ids(true, mode, userId, type, req.body.itemId, function (err, itemId) {
          cb (err, itemId);
        });
      }
    }

  ],
  function (err, itemId) {
    if (err) {
      helpers.send_failure(res, helpers.http_code_for_error(err), helpers.no_such_item());
    } else {
      helpers.send_success(res, itemId);
    }
  });
};

exports.followDelete = function (req, res) {
  var getp = req.query;
  var mode = parseInt(getp.mode);
  var type = parseInt(getp.type);

  async.waterfall([
    // 1. make sure Item ID, Mode are valid
    function (cb) {
      // if (!req.body || mode==null || ((!ObjectID.isValid(getp.itemId) && mode<9) || (!getp.itemId && mode==9))) {
      if (!req.body || mode==null || ((!ObjectID.isValid(getp.itemId) && (mode<9 || mode==12)) || (!getp.itemId && (mode==9 || mode==11)))) {
        cb(helpers.no_such_item());
        return;
      }
      cb(null);
    },

    // 2. validate Privilages
    function (cb) {
      privilege_data.privilages(req.user.sub, null, 10, function (err, userId, flag) {
        if (flag) cb(err, userId); else cb(helpers.invalid_privileges());
      })
    },

    // 3. unset Following / Blocking
    function (userId: string, cb) {
      if (mode==12) {
        people_data.toggle_compare_ids(false, userId, getp.itemId, function (err, itemId) {
          cb (err, itemId);
        });
      } else if (mode==11) {
        people_data.toggle_blocking_ids(false, userId, getp.itemId, function (err, itemId) {
          cb (err, itemId);
        });
      } else {
        people_data.toggle_followings_ids(false, mode, userId, type, getp.itemId, function (err, itemId) {
          cb (err, itemId);
        });
      };
    },
  ],
  function (err, itemId) {
    if (err) {
      helpers.send_failure(res, helpers.http_code_for_error(err), err);
    } else {
      helpers.send_success(res, itemId);
    }
  });

};

exports.sharePut = function (req, res) {
  var getp = req.query;
  var mode = parseInt(getp.mode);

  async.waterfall([

    // 1. make sure Share Info, Mode are valid
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
        if (flag) cb(err, userId); else cb(helpers.invalid_privileges());
      })
    },

    // 3. send Share
    function (userId: string, cb) {
      people_data.put_share(req.body, mode, userId, function (err, itemId) {
        cb (err, itemId);
      });
    }

  ],
  function (err, itemId) {
    if (err) {
      helpers.send_failure(res, helpers.http_code_for_error(err), helpers.no_such_item());
    } else {
      helpers.send_success(res, itemId);
    }
  });
};

exports.skipPut = function (req, res) {
  var getp = req.query;
  var mode = parseInt(getp.mode);

  async.waterfall([

    // 1. validate Privilages
    function (cb) {
      privilege_data.privilages(req.user.sub, null, 10, function (err, userId, flag) {
        if (flag) cb(err, userId); else cb(helpers.invalid_privileges());
      })
    },

    // 2. put Skip
    function (userId: string, cb) {
      people_data.put_profile_skip(userId, function (err) {
        cb(err);
      });
    }

  ],
  function (err) {
    if (err) {
      helpers.send_failure(res, helpers.http_code_for_error(err), helpers.no_such_item());
    } else {
      helpers.send_success(res);
    }
  });
};

exports.emailVerify = function (req, res) {
  var getp = req.query;

  async.waterfall([

    // 1. make sure User ID is valid
    function (cb) {
      if ((req.protocol+"://"+req.get('host'))==("http://"+req.get('host'))) {
        // console.log("Domain is matched. Information is from Authentic email");
        cb(null);
        return;
      } else {
        res.end("<h1>Request is from unknown source</h1>");
      }
    },

    // 2. validate Privilages
    function (cb) {
      privilege_data.privilages(req.user.sub, null, 10, function (err, userId, flag) {
        if (flag) cb(err, userId); else cb(helpers.invalid_privileges());
      })
    },

    // 3. verify random Hash
    function (userId: string, cb) {
      people_data.verify_hash(userId, getp.token, function (err, groupLink) {
        cb(err, groupLink);
      });
    }

  ],
  function (err, groupLink) {
    if (err) {
      helpers.send_failure(res, helpers.http_code_for_error(err), err);
    } else {
      helpers.send_success(res, groupLink);
    }
  });
};

exports.privateReport = function (req, res) {
  var getp = req.query;

  async.waterfall([

    // make sure People ID, Group ID are valid
    function (cb) {
      if (!getp.peopleId || !ObjectID.isValid(getp.id)) {
        cb(helpers.no_such_item());
        return;
      }
      cb(null);
    },

    // 2. validate Privilages
    function (cb) {
      privilege_data.privilages(req.user.sub, getp.id, 3, function (err, userId, flag) {
        if (flag || userId==getp.peopleId) cb(err, userId); else cb(helpers.invalid_privileges());
      })
    },

    // 3. update Personal Email State
    function (userId: string, cb) {
      people_data.people_reports(getp.peopleId, getp.id, function (err, reports) {
        cb (err, reports);
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

exports.deletePrivateReport = function (req, res) {
  var getp = req.query;

  async.waterfall([

    // 1. make sure Item ID are valid
    function (cb) {
      if (!ObjectID.isValid(getp.itemId)) {
        cb(helpers.no_such_item());
        return;
      }
      cb(null);
    },

    // 2. validate Privilages
    function (cb) {
      privilege_data.privilages(req.user.sub, null, 10, function (err, userId, flag) {
        if (flag) cb(err, userId); else cb(helpers.invalid_privileges());
      })
    },

    // 3. delete Private Report
    function (userId: string, cb) {
      people_data.delete_private_report(getp.itemId, userId, cb);
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

exports.followingsById = function (req, res) {
  var getp = req.query;

  async.waterfall([

    // get user ID (if)
    function (cb) {
      if (!req.user) {
        cb(null, null);
      } else {
        privilege_data.privilages(req.user.sub, null, 10, function (err, userId, flag) {
          cb(err, userId);
        })
      }
    },

    // get followings details
    function (userId: string, cb) {
      if (!userId) {
        cb(null, null);
      } else {
        people_data.get_followings(userId, function (err, followingsIds) {
          cb(err, followingsIds);
        });
      }
    }

  ],
  function (err, followingsIds) {
    if (err) {
      helpers.send_failure(res, 500, err);
      return;
    }

    helpers.send_success(res, followingsIds);
  });
}

exports.changeState = function (req, res) {
  var getp = req.query;
  var stage = parseInt(req.body);

  async.waterfall([

    // 1. validate Privilages
    function (cb) {
      privilege_data.privilages(req.user.sub, null, 10, function (err, userId, flag) {
        if (flag) cb(err, userId); else cb(helpers.invalid_privileges());
      })
    },

    // 2. update Personal Email State
    function (userId: string, cb) {
      people_data.tasks_personal_email_verified(userId, function (err) {
        cb(err, userId);
      })
    },

    // 3. retrieve Positions data
    function (userId, cb) {
      const statusLte: number = (req.user.scope.indexOf('write:universities')>-1) ? 3 : 9;
      people_data.people_actives(userId, true, statusLte, function (err, userData) {
        cb(err, userData);
      });
    }

  ],
  function (err, userData) {
    if (err) {
      helpers.send_failure(res, helpers.http_code_for_error(err), err);
    } else {
      helpers.send_success(res, userData);
    }
  });
};
