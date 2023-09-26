var helpers = require('./helpers.ts');
var async = require("async");

var pics_data = require("../data/pics.ts");
var people_data = require("../data/peoples.ts");
var contact_data = require("../data/contacts.ts");
var privilege_data = require("../data/privileges.ts");

var ObjectID = require('mongodb').ObjectID;

exports.picsUpdate = function (req, res) {
  var getp = req.query;
  var mode = parseInt(getp.mode);

  async.waterfall([

      // 1. make sure Item ID, Pics, Mode are valid
      function (cb) {
        if (!req.body || mode==null || (mode==1 && !ObjectID.isValid(getp.id) || (mode==0 && !getp.id))) {
          cb(helpers.no_such_item());
          return;
        }
        cb(null);
      },

      // 2. validate Privilages
      function (cb) {
        privilege_data.privilages(req.user.sub, getp.id, (mode==1) ? 0 : 10, function (err, userId, flag) {
          if (flag) cb(err); else cb(helpers.invalid_privileges());
        })
      },

      // 3. update Pics
      function (cb) {
        pics_data.post_pics(req.body[0], mode, getp.id, function (err, pic) {
          cb (err);
        });
      },

      // 4. update associated Contacts Items (mode==0)
      function (cb) {
        if (mode==0) {
          people_data.people_info(getp.id, "contacts", function (err, info) {
            var updateContact;
            async.each(info.contacts, function(contactId, callback) {
              updateContact = {
                               "title": 1, // not used
                               "mode": 3,
                               "pic": req.body[0]
                              }
              contact_data.post_contact(contactId, updateContact, callback);
            });
            cb (err, null);
          });
        } else {
          cb (null)
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

exports.picsDelete = function (req, res) {
  var getp = req.query;
  var mode = parseInt(getp.mode);

  async.waterfall([

      // 1. make sure Item ID, Mode are valid
      function (cb) {
        if ((mode==1 && !ObjectID.isValid(getp.id) || (mode==0 && !getp.id)) || mode==null) {
          cb(helpers.no_such_item());
          return;
        }
        cb(null);
      },

      // 2. validate Privilages
      function (cb) {
        privilege_data.privilages(req.user.sub, getp.id, (mode==1) ? 0 : 10, function (err, userId, flag) {
          if (flag) cb(err); else cb(helpers.invalid_privileges());
        })
      },

      // 3. delete Pic link
      function (cb) {
        pics_data.post_pics(null, mode, getp.id, cb);
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

exports.textpicUpdate = function (req, res) {
  var getp = req.query;
  var mode = parseInt(getp.mode);
  var id: string;

  async.waterfall([

    // 1. make sure Item ID, Text, Pic, Mode are valid
    function (cb) {
      if (!req.body || mode==null ||
          mode!=20 && (
            ((mode==1 || mode==6 || mode==8 || mode==13) && !getp.itemId) ||
            (mode!=1 && mode!=8 && mode!=6 && mode!=13 && !ObjectID.isValid(getp.itemId))
          )
         ) {
        cb(helpers.no_such_item());
        return;
      }
      cb(null);
    },

    // 2. validate Privilages
    function (cb) {
      var privilageMode: number;

      if (mode==0) { // project background --
        privilageMode = 40; id = getp.itemId;
      } else if (mode==1) { // people background --
        privilageMode = 10; id = getp.itemId;
      } else if (mode==2) { // group find us --
        privilageMode = 0; id = getp.id;
      } else if (mode==3) { // resource background --
        privilageMode = 50; id = getp.itemId;
      } else if (mode==6) { // research topic layMan --
        privilageMode = 0; id = getp.id;
      } else if (mode>=7 && mode<=10) { // publication abstract --
        privilageMode = ((req.user.scope.indexOf('write:publications')>-1) ? 10 : 70); id = getp.itemId;
      } else if (mode==11 && req.user.scope.indexOf('write:publications')>-1) { // publication abstract --
        privilageMode = 10; id = getp.itemId;
      } else if (mode==12) { // resource description --
        privilageMode = 50; id = getp.itemId;
      } else if (mode==13) { // research topic background --
        privilageMode = 0; id = getp.id;
      } else if (mode>=14 && mode<=19) {
        privilageMode = 90; id = getp.id; // Deal
      } else if (mode==20) { // mentor introduction --
        privilageMode = 11; id = getp.id;
      }

      // make sure ID is valid
      // if (((mode==2 || mode==7 || mode==9 || mode==10) && !ObjectID.isValid(getp.id)) || ((mode==6 || mode==13) || !getp.id)) {
      //   cb(helpers.no_such_item());
      // }

      if (mode==4) { // department find us
        id = getp.itemId;
        if (req.user.scope.indexOf('write:departments')>-1) cb(null, null); else cb(helpers.invalid_privileges());
      } else if (mode==5) { // university find us
        id = getp.itemId;
        if (req.user.scope.indexOf('write:universities')>-1) cb(null, null); else cb(helpers.invalid_privileges());
      } else if (mode>=0 && mode<=19) {
        privilege_data.privilages(req.user.sub, id, privilageMode, function (err, userId, flag) {
          if (flag) cb(err, null); else cb(helpers.invalid_privileges());
        })
      } else if (mode==20) {
        privilege_data.privilages(req.user.sub, null, 11, function (err, mentorId, flag) {
          if (flag) cb(err, mentorId); else cb(helpers.invalid_privileges());
        })
      } else {
        cb(helpers.invalid_privileges());
      }

    },

    // 3. update Text+Pic
    function (mentorId: string, cb) {
      // pics_data.post_textpic(req.body.text, req.body.pic, req.body.caption, mode, (mode>=7 && mode<=10) ? getp.itemId : id, getp.itemId, cb);
      pics_data.post_textpic(req.body.text, req.body.pic, req.body.caption, mode, (mode==20) ? mentorId : id, getp.itemId, cb);
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

exports.textpicDelete = function (req, res) {
  var getp = req.query;
  var mode = parseInt(getp.mode);
  var id: string;

  async.waterfall([

    // 1. make sure Item ID, Mode are valid
    function (cb) {
      if (mode==null ||
          mode!=20 && (
            ((mode==1 || mode==6 || mode==8 || mode==13) && !getp.itemId) ||
            (mode!=1 && mode!=8 && mode!=6 && mode!=13 && !ObjectID.isValid(getp.itemId))
          )
         ) {
        cb(helpers.no_such_item());
        return;
      }
      cb(null);
    },

    // 2. validate Privilages
    function (cb) {
      var privilageMode: number;

      if (mode==0) { // project background
        privilageMode = 40; id = getp.itemId;
      } else if (mode==1) { // people background
        privilageMode = 10; id = getp.itemId;
      } else if (mode==2) { // group contact
        privilageMode = 0; id = getp.id;
      } else if (mode==3) { // resource background
        privilageMode = 50; id = getp.itemId;
      } else if (mode==6) { // group layMan
        privilageMode = 0; id = getp.id;
      } else if (mode>=7 && mode<=10) { // publication abstract
        privilageMode = ((req.user.scope.indexOf('write:publications')>-1) ? 10 : 70); id = getp.itemId;
      } else if (mode==11 && req.user.scope.indexOf('write:publications')>-1) {
        privilageMode = 10; id = getp.itemId;
      } else if (mode==12) { // resource description
        privilageMode = 50; id = getp.itemId;
      } else if (mode==13) { // research topic background --
        privilageMode = 0; id = getp.id;
      } else if (mode>=14 && mode<=19) {
        privilageMode = 90; id = getp.id; // Deal
      } else if (mode==20) { // mentor introduction --
        privilageMode = 11; id = getp.id;
      }

      // make sure ID is valid
      // if ((mode==2 || mode==6 || mode==7 || mode==9 || mode==10) && !ObjectID.isValid(getp.id)) {
      //   cb(helpers.no_such_item());
      // }

      // department contacts
      if (mode==4) {
        id = getp.itemId;
        if (req.user.scope.indexOf('write:departments')>-1) cb(); else cb(helpers.invalid_privileges());
      // university contacts
      } else if (mode==5) {
        id = getp.itemId;
        if (req.user.scope.indexOf('write:universities')>-1) cb(); else cb(helpers.invalid_privileges());
      } else if (mode>=0 && mode<=19) {
        privilege_data.privilages(req.user.sub, id, privilageMode, function (err, userId, flag) {
          if (flag) cb(err, null); else cb(helpers.invalid_privileges());
        })
      } else if (mode==20) {
        privilege_data.privilages(req.user.sub, null, 11, function (err, mentorId, flag) {
          if (flag) cb(err, mentorId); else cb(helpers.invalid_privileges());
        })
      } else {
        cb(helpers.invalid_privileges());
      }

    },

    // 3. delete Text+Pic
    function (mentorId: string, cb) {
      pics_data.post_textpic(null, null, null, mode, (mode==20) ? mentorId : id, getp.itemId, cb);
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

exports.showcasePut = function (req, res) {
  var getp = req.query;
  var mode = parseInt(getp.mode);

  async.waterfall([

      // make sure Parent ID (Condition), Item ID, Elements Data, Mode are valid
      function (cb) {
        if ((mode!=3 && mode!=6 && !ObjectID.isValid(getp.id)) || !ObjectID.isValid(getp.itemId) || !req.body || mode==null) {
          cb(helpers.no_such_item());
          return;
        }
        cb(null);
      },

      // 2. validate Privilages
      function (cb) {
        var privilegeMode: number;

        if (mode==0) { // Project
          privilegeMode = 40;
        } else if (mode==1) { // Resource
          privilegeMode = 50;
        } else if (mode==2) { // Group
          privilegeMode = 3;
        } else if (mode==3) { // Profile
          privilegeMode = 10;
        } else if (mode==6) { // Publication
          privilegeMode = 70;
        // } else { // Other
          // privilegeMode = 3; // FIX
        }

        if (mode==6 && req.user.scope.indexOf('write:publications')>-1) { // universities
          cb();
        } else if (mode==5) { // universities
          if (req.user.scope.indexOf('write:universities')>-1) cb(); else cb(helpers.invalid_privileges());
        } else if (mode==4) { // departments
          if (req.user.scope.indexOf('write:departments')>-1) cb(); else cb(helpers.invalid_privileges());
        } else {
          // privilege_data.privilages(req.user.sub, (mode==2 || mode==3) ? getp.id : getp.itemId, (mode==0) ? 40 : ((mode==1) ? 50 : ((mode==3) ? 10 : 3)), function (err, userId, flag) {
          privilege_data.privilages(req.user.sub, (mode==2 || mode==3) ? getp.id : getp.itemId, privilegeMode, function (err, userId, flag) {
            if (flag) cb(err); else cb(helpers.invalid_privileges());
          })
        }
      },

      // 3. put Showcase
      function (cb) {
        pics_data.put_showcase(req.body, mode, getp.itemId, cb);
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

exports.showcasePost = function (req, res) {
  var getp = req.query;
  var mode = parseInt(getp.mode);

  async.waterfall([

      // 1. make sure Parent ID (Condition), Item ID, Element Data, Mode are valid
      function (cb) {
        if ((mode!=3 && mode!=6 && !ObjectID.isValid(getp.id)) || !ObjectID.isValid(getp.itemId) || !req.body || mode==null) {
          cb(helpers.no_such_item());
          return;
        }
        cb(null);
      },

      // 2. validate Privilages
      function (cb) {
        var privilegeMode: number;

        if (mode==0) { // Project
          privilegeMode = 40;
        } else if (mode==1) { // Resource
          privilegeMode = 50;
        } else if (mode==2) { // Group
          privilegeMode = 3;
        } else if (mode==3) { // Profile
          privilegeMode = 10;
        } else if (mode==6) { // Publication
          privilegeMode = 70;
        }

        if (mode==6 && req.user.scope.indexOf('write:publications')>-1) { // universities
          cb();
        } else if (mode==5) { // universities
          if (req.user.scope.indexOf('write:universities')>-1) cb(); else cb(helpers.invalid_privileges());
        } else if (mode==4) { // departments
          if (req.user.scope.indexOf('write:departments')>-1) cb(); else cb(helpers.invalid_privileges());
        } else {
          privilege_data.privilages(req.user.sub, (mode==2 || mode==3) ? getp.id : getp.itemId, privilegeMode, function (err, userId, flag) {
            if (flag) cb(err); else cb(helpers.invalid_privileges());
          })
        }
      },

      // 3. update Showcase Element
      function (cb) {
        pics_data.post_showcase(req.body, mode, getp.itemId, cb);
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

exports.showcaseDelete = function (req, res) {
  var getp = req.query;
  var mode = parseInt(getp.mode);

  async.waterfall([

      // 1. make sure Parent ID (Condition), Item ID, Element ID, Mode are valid
      function (cb) {
        if ((mode!=3 && mode!=6 && !ObjectID.isValid(getp.id)) || !ObjectID.isValid(getp.itemId) || !ObjectID.isValid(getp.elementId) || mode==null) {
          cb(helpers.no_such_item());
          return;
        }
        cb(null);
      },

      // 2. validate Privilages
      function (cb) {
        var privilegeMode: number;

        if (mode==0) { // Project
          privilegeMode = 40;
        } else if (mode==1) { // Resource
          privilegeMode = 50;
        } else if (mode==2) { // Group
          privilegeMode = 3;
        } else if (mode==3) { // Profile
          privilegeMode = 10;
        } else if (mode==6) { // Publication
          privilegeMode = 70;
        }

        if (mode==6 && req.user.scope.indexOf('write:publications')>-1) { // universities
          cb();
        } else if (mode==5) { // universities
          if (req.user.scope.indexOf('write:universities')>-1) cb(); else cb(helpers.invalid_privileges());
        } else if (mode==4) { // departments
          if (req.user.scope.indexOf('write:departments')>-1) cb(); else cb(helpers.invalid_privileges());
        } else {
          privilege_data.privilages(req.user.sub, (mode==2 || mode==3) ? getp.id : getp.itemId, privilegeMode, function (err, userId, flag) {
            if (flag) cb(err); else cb(helpers.invalid_privileges());
          })
        }
      },

      // 3. delete Showcase Element
      function (cb) {
        pics_data.delete_showcase(getp.itemId, getp.elementId, mode, cb);
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

exports.picsInfo = function (req, res) {
  var getp = req.query;
  var mode = parseInt(getp.mode);

  async.waterfall([

    // 1. make sure Parent ID (Condition), Item ID, Element ID, Mode are valid
    // function (cb) {
    //   if ((mode!=3 && mode!=6 && !ObjectID.isValid(getp.id)) || !ObjectID.isValid(getp.itemId) || !ObjectID.isValid(getp.elementId) || mode==null) {
    //     cb(helpers.no_such_item());
    //     return;
    //   }
    //   cb(null);
    // },
    //
    // // 2. validate Privilages
    // function (cb) {
    //   var privilegeMode: number;
    //
    //   if (mode==0) { // Project
    //     privilegeMode = 40;
    //   } else if (mode==1) { // Resource
    //     privilegeMode = 50;
    //   } else if (mode==2) { // Group
    //     privilegeMode = 3;
    //   } else if (mode==3) { // Profile
    //     privilegeMode = 10;
    //   } else if (mode==6) { // Publication
    //     privilegeMode = 70;
    //   }
    //
    //   if (mode==6 && req.user.scope.indexOf('write:publications')>-1) { // universities
    //     cb();
    //   } else if (mode==5) { // universities
    //     if (req.user.scope.indexOf('write:universities')>-1) cb(); else cb(helpers.invalid_privileges());
    //   } else if (mode==4) { // departments
    //     if (req.user.scope.indexOf('write:departments')>-1) cb(); else cb(helpers.invalid_privileges());
    //   } else {
    //     privilege_data.privilages(req.user.sub, (mode==2 || mode==3) ? getp.id : getp.itemId, privilegeMode, function (err, userId, flag) {
    //       if (flag) cb(err); else cb(helpers.invalid_privileges());
    //     })
    //   }
    // },

    // 3. get Showcase Element
    function (cb) {
      pics_data.get_group_files_info(getp.elementId, function (err, element) {
        cb(err, element);
      })
    }

  ],
  function (err, element) {
    if (err) {
      helpers.send_failure(res, helpers.http_code_for_error(err), err);
    } else {
      helpers.send_success(res, element);
    }
  });
};
