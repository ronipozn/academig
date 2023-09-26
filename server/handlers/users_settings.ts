var helpers = require('./helpers.ts');
var async = require("async");
var request = require("request");

var group_data = require("../data/groups.ts");
var people_data = require("../data/peoples.ts");
var user_settings_data = require("../data/user_settings.ts");
var privilege_data = require("../data/privileges.ts");

var sendgrid = require("../misc/sendgrid.ts");

import { objectMini, groupComplex } from '../models/shared.ts';

const sgMail = require('@sendgrid/mail');
sgMail.setApiKey(process.env.SENDGRID_API_KEY);

var ObjectID = require('mongodb').ObjectID;

exports.version = "0.1.0";

////////////////////////////////////
////////////////////////////////////
//////////// User Account //////////
////////////////////////////////////
////////////////////////////////////

exports.account = function (req, res) {
  async.waterfall([

    // 1. validate Privilages
    function (cb) {
      privilege_data.privilages(req.user.sub, null, 10, function (err, userId, flag) {
        if (flag) cb(err, userId); else cb(helpers.invalid_privileges());
      })
    },

    function (userId: string, cb) {
      user_settings_data.user_account(userId, function (err, account) {
        cb(err, account)
      });
    }

  ],
  function (err, data) {
    if (err) {
      helpers.send_failure(res, helpers.http_code_for_error(err), err);
    } else {
      helpers.send_success(res, data);
    }
  });

}

exports.dataPost = function (req, res) {
  async.waterfall([

    // 1. validate Privilages
    function (cb) {
      privilege_data.privilages(req.user.sub, null, 10, function (err, userId, flag) {
        if (flag) cb(err, userId); else cb(helpers.invalid_privileges());
      })
    },

    // 2. set Data request
    function (userId: string, cb) {
      user_settings_data.update_data_request(userId, function (err) {
        cb(err, userId)
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
}

exports.emailPost = function (req, res) {
  var host=req.get('host');

  var getp = req.query;
  var email = req.body.email;

  async.waterfall([

    // 1. make sure Group ID, Email are valid
    function (cb) {
      if (!ObjectID.isValid(getp.groupId) || email==null) {
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

    // 3. set Email & Stage = 0
    function (userId: string, cb) {
      people_data.update_institute_email(userId, getp.groupId, email, function (err) {
        cb(err, userId)
      });
    },

    // 4. create Hash document
    function (userId: string, cb) {
      people_data.create_hash(userId, getp.groupId, function (err, hash) {
        cb(err, hash)
      });
    },

    // 5. send Verification email
    function (hash, cb) {
      var link="http://"+host+"/verify?token="+hash;
      const msg = {
        to: email,
        from: 'support@academig.com',
        subject: "Academig: Please confirm your Email account",
        // text: 'Join Pozner Lab',
        html: '<h2>Academig</h2>' +
              'Please Click on the link to verify your email.<br><a href='+link+'>Click here to verify</a>' +
              '<p><b>Thank you, Academig</b></p>'
      };
      sgMail.send(msg, (err, result) => {
        if (err) {
          cb(err);
        } else {
          cb();
        }
      });
    },

  ],
  function (err) {
    if (err) {
      helpers.send_failure(res, helpers.http_code_for_error(err), err);
    } else {
      helpers.send_success(res);
    }
  });
}

exports.resetPassword = function (req, res) {
  var getp = req.query;

  privilege_data.privilages(req.user.sub, null, 10, function (err, userId, flag) {
    people_data.people_email(userId, function (err, user) {
      console.log('user',user)
      var options = { method: 'POST',
        url: 'https://academig.eu.auth0.com/dbconnections/change_password',
        headers: { 'content-type': 'application/json' },
        body:
         { client_id: 'jEW2WutsRBNBz88e5XgjRPedbmRL98iC',
           email: user.personalInfo.email,
           connection: 'Username-Password-Authentication' },
        json: true };

      request(options, function (error, response, body) {
        if (error) {
          helpers.send_failure(res, 500, error);
          return;
        }
        helpers.send_success(res, body);
        // console.log(body);
      });
    })
  })
}

////////////////////////////////////
////////////////////////////////////
//////// User Notifications ////////
////////////////////////////////////
////////////////////////////////////

exports.notifications = function (req, res) {
  async.waterfall([

    // 1. validate Privilages
    function (cb) {
      privilege_data.privilages(req.user.sub, null, 10, function (err, userId, flag) {
        if (flag) cb(err, userId); else cb(helpers.invalid_privileges());
      })
    },

    // 2. get Notifications
    function (userId: string, cb) {
      let notifications: number[] = [1,1,1,1,1,1];
      people_data.people_email(userId, function (err, user) {
        sendgrid.getContactSuppressions(user.personalInfo.email, function (err, suppressions) {
          if (suppressions.filter(r => r.id == 8844)[0].suppressed) notifications[0]=0; // Academig OnBoarding (Academig Launchpad)
          if (suppressions.filter(r => r.id == 8842)[0].suppressed) notifications[1]=0; // Academig Daily
          if (suppressions.filter(r => r.id == 9974)[0].suppressed) notifications[2]=0; // Academig Morning
          if (suppressions.filter(r => r.id == 8843)[0].suppressed) notifications[3]=0; // Product Updates
          if (suppressions.filter(r => r.id == 9975)[0].suppressed) notifications[4]=0; // Academig Updates (Notifications)
          if (suppressions.filter(r => r.id == 14620)[0].suppressed) notifications[5]=0; // Academig Publications Suggestions
          cb(err, notifications);
        });

      })
    }

  ],
  function (err, notifications) {
    // console.log('err',err)
    // console.log('notifications',notifications)
    if (err) {
      helpers.send_failure(res, helpers.http_code_for_error(err), err);
    } else {
      helpers.send_success(res, notifications);
    }
  });
}

exports.notificationsPost = function (req, res) {
  var getp = req.query;

  var index = parseInt(getp.index);
  var state = parseInt(getp.state);

  async.waterfall([

    // 1. make sure Notifciation Flag is valid
    function (cb) {
      if (index<0 || index>5) {
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

    // 3. update SendGrid Lists
    function (userId: string, cb) {
      const groupSuppressionsIds: number[] = [8844,8842,9974,8843,9975,14620];
      people_data.people_email(userId, function (err, user) {
        // if (index==4) {
          // console.log('index',index,'state',state)
        if (state) {
          sendgrid.deleteSuppressions(groupSuppressionsIds[index], user.personalInfo.email, function (err) { cb(err) })
        } else {
          sendgrid.postSuppressions(groupSuppressionsIds[index], [user.personalInfo.email], function (err) { cb(err) })
        }
      })

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

////////////////////////////////////
////////////////////////////////////
//////////// User Reports //////////
////////////////////////////////////
////////////////////////////////////

exports.reports = function (req, res) {

  async.waterfall([

    // 1. validate Privilages
    function (cb) {
      privilege_data.privilages(req.user.sub, null, 10, function (err, userId, flag) {
        if (flag) cb(err, userId); else cb(helpers.invalid_privileges());
      })
    },

    // 2. get Reports IDs
    function (userId: string, cb) {
      people_data.people_info(userId, "reportsIds", function (err, reports) {
        cb(err, reports.reportsIds);
      });
    },

    // 3. get Reports
    function (reportsIds, cb) {
      user_settings_data.reports(1, reportsIds, function (err, reports) {
        cb(err, reports);
      });
    },

  ],
  function (err, reports) {
    if (err) {
      helpers.send_failure(res, helpers.http_code_for_error(err), err);
    } else {
      helpers.send_success(res, reports);
    }
  });

}

exports.reportPut = function (req, res) {
  var getp = req.query;
  var mode = parseInt(getp.mode);
  var type = parseInt(getp.type);

  async.waterfall([

    // 1. make sure Report ID, Report Reply, Report Status are valid
    function (cb) {
      if (!req.body || mode==null || type==null || (!req.body.item && mode!=0) || (!req.body.group && mode==0)) {
        cb(helpers.no_such_item());
        return;
      }
      cb(null);
    },

    // 2. validate Privilages
    function (cb) {
      if (!req.user) {
        cb(null, null);
      } else {
        privilege_data.privilages(req.user.sub, null, 10, function (err, userId, flag) {
          cb (err, userId);
        })
      }
    },

    // 3. update Report
    function (userId: string, cb) {
      user_settings_data.push_report(mode, userId, type, req.body.item, req.body.group, req.body.message, function (err, itemId) {
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

exports.reportPost = function (req, res) {
  var getp = req.query;
  var status = parseInt(getp.status);

  async.waterfall([

    // 1. make sure Report ID, Report Reply, Report Status are valid
    function (cb) {
      if (!ObjectID.isValid(getp.itemId) || !req.body.reply || status==null) {
        cb(helpers.no_such_item());
        return;
      }
      cb(null);
    },

    // 2. validate Privilages
    function (cb) {
      privilege_data.privilages(req.user.sub, null, 10, function (err, userId, flag) {
        if (flag) cb(err); else cb(helpers.invalid_privileges());
      })
    },

    // 3. update Report
    function (cb) {
      user_settings_data.update_report(req.body.reply, status, getp.itemId, cb);
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

exports.reportDelete = function (req, res) {
  var getp = req.query;

  async.waterfall([

    // 1. make sure Report ID is valid
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

    // 3. pull Report
    function (userId: string, cb) {
      user_settings_data.pull_report(userId, getp.itemId, cb);
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

////////////////////////////////////
////////////////////////////////////
//////////// User Block ////////////
////////////////////////////////////
////////////////////////////////////

exports.blocks = function (req, res) {

  async.waterfall([

    // 2. validate Privilages
    function (cb) {
      privilege_data.privilages(req.user.sub, null, 10, function (err, userId, flag) {
        if (flag) cb(err, userId); else cb(helpers.invalid_privileges());
      })
    },

    // 2. get Blocks IDs
    function (userId: string, cb) {
      people_data.people_info(userId, "blockingIds", function (err, block) {
        cb(null, block.blockingIds);
      });
    },

    // 3. dress Blocks IDs
    function (blockingIds, cb) {
      var blocks: objectMini[] = [];

      async.forEachOf(blockingIds, function (id, key, callback) {
        people_data.peoples_list([id], null, null, 1, null, function (err, people) {
          blocks[key]=people[0];
          callback();
        });
      }, function (err) {
        cb(err, blocks);
      });
    }

  ],
  function (err, blocks) {
    if (err) {
      helpers.send_failure(res, helpers.http_code_for_error(err), err);
    } else {
      helpers.send_success(res, blocks);
    }
  });
};

// exports.blockDelete = function (req, res) {
//   var getp = req.query;
//
//   async.waterfall([
//
//       // make sure the User ID, Block ID are valid
//       function (cb) {
//         if (!ObjectID.isValid(getp.userId) || !ObjectID.isValid(getp.itemId)) {
//           cb(helpers.no_such_item());
//           return;
//         }
//         cb(null);
//       },
//
//       function (cb) {
//         user_settings_data.pull_block(getp.userId, getp.itemId, cb);
//       }
//
//   ],
//   function (err, results) {
//       if (err) {
//         helpers.send_failure(res, helpers.http_code_for_error(err), err);
//       } else {
//         helpers.send_success(res, results);
//       }
//   });
// };

////////////////////////////////////
////////////////////////////////////
//////////// User Block ////////////
////////////////////////////////////
////////////////////////////////////

exports.libraryPrivacy = function (req, res) {
  var getp = req.query;
  var mode = parseInt(getp.mode);

  async.waterfall([

    // 1. make sure Mode is valid
    function (cb) {
      if (mode==null || mode<0 || mode>1) {
        cb(helpers.no_such_item());
        return;
      }
      cb(null);
    },

    // 2. validate Privilages
    function (cb) {
      if (!req.user) {
        cb(null, null);
      } else {
        privilege_data.privilages(req.user.sub, null, 10, function (err, userId, flag) {
          cb (err, userId);
        })
      }
    },

    // 3. update Library Privacy
    function (userId: string, cb) {
      user_settings_data.post_library_privacy(mode, userId, function (err) {
        cb (err);
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
