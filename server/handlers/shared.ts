var helpers = require('./helpers.ts');
var async = require("async");

var shared_data = require("../data/shared.ts");
var people_data = require("../data/peoples.ts");
var contact_data = require("../data/contacts.ts");
var privilege_data = require("../data/privileges.ts");
var private_data = require("../data/private.ts");
var group_data = require("../data/groups.ts");

const https = require('https');

var ObjectID = require('mongodb').ObjectID;

exports.version = "0.1.0";

exports.domainPut = function (req, res) {
  var getp = req.query;
  var mode = parseInt(getp.mode);

  async.waterfall([

    // 1. validate Privilages
    function (cb) {
      privilege_data.privilages(req.user.sub, getp.id, (mode==0) ? 0 : 10, function (err, userId, flag) {
        if (flag) cb(err, userId); else cb(helpers.invalid_privileges());
      })
    },

    // 2. put Domain Request
    function (userId: string, cb) {
      shared_data.put_domain_request((mode==0) ? getp.id : userId, mode, function (err) {
        cb(err)
      });
    }

  ],
  function (err) {
    if (err) {
      helpers.send_failure(res, helpers.http_code_for_error(err), err);
    } else {
      helpers.send_success(res, null);
    }
  });
}

exports.twitterPost = function (req, res) {
  var getp = req.query;
  var mode = parseInt(getp.mode);

  async.waterfall([

    // 1. make sure Item ID, Feed, Mode are valid
    function (cb) {
      if (((mode==0) ? !ObjectID.isValid(getp.id) : false) || mode==null) {
        cb(helpers.no_such_item());
        return;
      }
      cb(null);
    },

    // 2. validate Privilages
    function (cb) {
      if (mode==2) {
        if (req.user.scope.indexOf('write:departments')>-1) cb(null, null); else cb(helpers.invalid_privileges());
      } else if (mode==3) {
        if (req.user.scope.indexOf('write:universities')>-1) cb(null, null); else cb(helpers.invalid_privileges());
      } else if (mode>=4 && mode<=7) { // items
        if (req.user.scope.indexOf('write:departments')>-1) cb(null, null); else cb(helpers.invalid_privileges());
      } else {
        privilege_data.privilages(req.user.sub, getp.id, (mode==0) ? 0 : 10, function (err, userId, flag) {
          if (flag) cb(err, userId); else cb(helpers.invalid_privileges());
        })
      }
    },

    // 3. update Twitter Link
    function (userId: string, cb) {
      shared_data.post_twitter(req.body.feed, getp.id, userId, mode, cb);
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

exports.queryCoordinates = function (req, res) {

  const YOUR_PRIVATE_TOKEN = `1f56c9df259e81`;
  const SEARCH_STRING: string = req.query.term;

  console.log('SEARCH_STRING',SEARCH_STRING)

  async.waterfall([
    function (cb) {
      https.get(`https://eu1.locationiq.com/v1/search.php?key=` + YOUR_PRIVATE_TOKEN + `&q=` + SEARCH_STRING + `&format=json`, (resp) => {
        let data = '';

        resp.on('data', (chunk) => {
          data += chunk;
        });

        resp.on('end', () => {
          try{
            const coords = JSON.parse(data);
            cb(null, coords);
          } catch(e) {
            cb(e);
            return;
          }
        });

      }).on("error", (err) => {
        cb(err, null)
      });
    }

  ],
  function (err, coords) {
    if (err) {
      helpers.send_failure(res, helpers.http_code_for_error(err), err);
    } else {
      helpers.send_success(res, coords);
    }
  });

}

exports.locationPost = function (req, res) {
  var getp = req.query;
  var mode = parseInt(getp.mode);

  async.waterfall([

    // 1. make sure Item ID, Latitue, Longitude, Mode are valid
    function (cb) {
      if (mode==null || ((mode==0) ? getp.id==null : !ObjectID.isValid(getp.id)) || (mode>0 && (req.body.lat==null || req.body.lng==null))) {
        cb(helpers.no_such_item());
        return;
      }
      cb(null);
    },

    // 2. validate Privilages
    function (cb) {
      if (mode==2) {
        if (req.user.scope.indexOf('write:departments')>-1) cb(null, null); else cb(helpers.invalid_privileges());
      } else if (mode==3) {
        if (req.user.scope.indexOf('write:universities')>-1) cb(null, null); else cb(helpers.invalid_privileges());
      // } else if (mode==1) {
      } else {
        privilege_data.privilages(req.user.sub, getp.id, (mode==1) ? 0 : 10, function (err, userId, flag) {
          if (flag) cb(err, userId); else cb(helpers.invalid_privileges());
        })
      }
    },

    // 3. update Location
    function (userId: string, cb) {
      shared_data.post_location(req.body.lat, req.body.lng, req.body.country, req.body.state, req.body.city, getp.id, userId, mode, cb);
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

exports.titlePost = function (req, res) {
  var getp = req.query;
  var mode = parseInt(getp.mode);

  async.waterfall([

    // 1. make sure Item ID, ID, Title, Mode are valid
    function (cb) {
      if ((!ObjectID.isValid(getp.itemId) && (mode<=2)) || (!ObjectID.isValid(getp.id) && (mode==2)) || !req.body.title || mode==null) {
        cb(helpers.no_such_item());
        return;
      }
      cb(null);
    },

    // 2. validate Privilages
    function (cb) {
      var privilegeMode: number;
      if (mode==0) { // projects
        privilegeMode = 40;
      } else if (mode==1) { // resources
        privilegeMode = 50;
      } else if (mode==2) { // position
        privilegeMode = 0;
      } else if (mode==3) { // people
        privilegeMode = 10;
      }

      privilege_data.privilages(req.user.sub, (mode==2) ? getp.id : getp.itemId, privilegeMode, function (err, userId, flag) {
        if (flag) cb(err, userId); else cb(helpers.invalid_privileges());
      })
    },

    // 3. update Project Title / Resource Title / Profile Name
    function (userId: string, cb) {
      if (mode==3) {
        people_data.post_user_name(req.body.title, userId, cb)
      } else {
        shared_data.post_title(req.body.title, getp.itemId, mode, cb);
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

exports.stagePost = function (req, res) {
  var getp = req.query;
  var mode = parseInt(getp.mode);

  async.waterfall([

    // 1. make sure Parent ID, Mode are valid
    function (cb) {
      if (!ObjectID.isValid(getp.id) || mode==null || (req.body.stage!=false && req.body.stage!=true)) {
        cb(helpers.no_such_item());
        return;
      }
      cb();
    },

    // // 2. validate Privilages
    // function (cb) {
    //   if (mode==2) {
    //     if (req.user.scope.indexOf('write:departments')>-1) cb(null, null); else cb(helpers.invalid_privileges());
    //   } else if (mode==3) {
    //     if (req.user.scope.indexOf('write:universities')>-1) cb(null, null); else cb(helpers.invalid_privileges());
    //   } else {
    //     privilege_data.privilages(req.user.sub, getp.id, (mode==0) ? 0 : 10, function (err, userId, flag) {
    //       if (flag) cb(err, userId); else cb(helpers.invalid_privileges());
    //     })
    //   }
    // },

    // 3. update Institute Stage
    function (cb) {
      shared_data.post_stage(getp.id, mode, req.body.stage, cb);
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

exports.publicInfoPost = function (req, res) {
  var getp = req.query;
  var mode = parseInt(getp.mode);

  async.waterfall([

    // 1. make sure Info Data, Info Mode, are valid
    function (cb) {
      if (!req.body || mode==null) {
        cb(helpers.no_such_item());
        return;
      }
      cb(null);
    },

    // 2. validate Privilages
    function (cb) {
      if (mode==2) {
        if (req.user.scope.indexOf('write:departments')>-1) cb(null, null); else cb(helpers.invalid_privileges());
      } else if (mode==3) {
        if (req.user.scope.indexOf('write:universities')>-1) cb(null, null); else cb(helpers.invalid_privileges());
      } else if (mode>=4 && mode<=7) {
        if (req.user.scope.indexOf('write:departments')>-1) cb(null, null); else cb(helpers.invalid_privileges());
      } else {
        privilege_data.privilages(req.user.sub, getp.id, (mode==1) ? 10 : 0, function (err, userId, flag) {
          if (flag) cb(err, (req.user.scope.indexOf('write:publications')>-1) ? getp.id : userId); else cb(helpers.invalid_privileges());
        })
      }
    },

    // 3. post Social Info
    function (userId: string, cb) {
      shared_data.post_public_info(req.body, (mode==1) ? userId : getp.id, mode, function (err) {
        cb(err, userId);
      });
    },

    // 4. update associated contacts
    function (userId: string, cb) {
      if (mode==1) {
        people_data.people_info(userId, "contactsIds", function (err, item) {
          var updateContact= {"title": 1, // not used
                              "mode": 2,
                              "address": req.body.address,
                              "email": req.body.email,
                              "phone": req.body.phone,
                              "fax": req.body.fax}

          async.forEachOf(item.contactsIds, function(contactId, key, callback) {
            contact_data.post_contact(contactId, updateContact, function (err) {
              callback(err)
            });
          }, function (err) {
            cb(err);
          });
        });
      } else {
        cb()
      }
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

exports.socialInfoPost = function (req, res) {
  var getp = req.query;
  var mode = parseInt(getp.mode);

  async.waterfall([

    // 1. make sure Info Data, Info Mode, are valid
    function (cb) {
      if (!req.body || mode==null) {
        cb(helpers.no_such_item());
        return;
      }
      cb(null);
    },

    // 2. validate Privilages
    function (cb) {
      if (mode==2) {
        if (req.user.scope.indexOf('write:departments')>-1) cb(null, null); else cb(helpers.invalid_privileges());
      } else if (mode==3) {
        if (req.user.scope.indexOf('write:universities')>-1) cb(null, null); else cb(helpers.invalid_privileges());
      } else if (mode>=4 && mode<=7) {
        if (req.user.scope.indexOf('write:departments')>-1) cb(null, null); else cb(helpers.invalid_privileges());
      } else {
        privilege_data.privilages(req.user.sub, getp.id, (mode==1) ? 10 : 0, function (err, userId, flag) {
          if (flag) cb(err, (req.user.scope.indexOf('write:publications')>-1) ? getp.id : userId); else cb(helpers.invalid_privileges());
        })
      }
    },

    // 3. post Social Info
    function (userId: string, cb) {
      shared_data.post_social_info(req.body, (mode==1) ? userId : getp.id, mode, function (err) {
        cb(err);
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

exports.miniPost = function (req, res) {
  var getp = req.query;
  var mode = parseInt(getp.mode);
  var type = parseInt(getp.type);

  async.waterfall([

    // 1. make sure Parent ID, Item ID, Mini Data, Mode, Type are valid
    function (cb) {
      if (!ObjectID.isValid(getp.itemId) || !req.body || mode==null || type==null ||
          (mode!=8 && !ObjectID.isValid(getp.id) || (mode==8 && !getp.id))
         ) {
        cb(helpers.no_such_item());
        return;
      }
      cb(null);
    },

    // 2. validate Privilages
    function (cb) {
      var privilegeMode: number;
      var id: string;
      if (mode==0) { // projects
        privilegeMode = 40;
        id = getp.itemId;
      } else if (mode==1) { // resources
        privilegeMode = 50;
        id = getp.itemId;
      } else if (mode==5) { // media
        privilegeMode = 0; // also 40
        id = getp.id;
      } else if (mode>=7 && mode<=10) { // publications authors
        privilegeMode = 70;
        id = getp.itemId;
      } else if (mode==11) { // deal
        privilegeMode = 90;
        id = getp.id;
      } else { // positions (mode==3)
               // fundings (mode==4)
               // sponsors (mode==6)
        privilegeMode = 0;
        id = getp.id;
      }

      // console.log('privilegeMode',privilegeMode)
      privilege_data.privilages(req.user.sub, id, privilegeMode, function (err, userId, flag) {
        const adminFlag: boolean = (req.user.scope.indexOf('write:groups')>-1);
        if (flag || adminFlag) cb(err, userId); else cb(helpers.invalid_privileges());
      })
    },

    // 3. update Mini
    function (userId: string, cb) {
      shared_data.post_mini(req.body, getp.itemId, userId, mode, type, cb);
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

exports.tagsUpdate = function (req, res) {
  var getp = req.query;
  var mode = parseInt(getp.mode);
  var type = parseInt(getp.type);

  async.waterfall([

      // 1. make sure Parent ID, Item ID, Tags, Mode are valid
      function (cb) {
        if (!req.body || mode==null || mode>9 || mode<0
            // !ObjectID.isValid(getp.itemId) ||
            // ((!ObjectID.isValid(getp.id) && type==0) || (!getp.id && type==1))
           ) {
          cb(helpers.no_such_item());
          return;
        }
        cb(null);
      },

      // 2. validate Privilages
      function (cb) {
        var privilegeMode: number;
        var id: string;
        if (req.user.scope.indexOf('write:groups')>-1) {
          privilegeMode = 10;
          id = getp.itemId;
        } else if (mode==0 || mode==5 || mode==8) { // homePageItemsInterests || openPositions || Alternative Names
          privilegeMode = 0;
          id = getp.id;
        } else if (mode==1 || mode==2 || mode==9) { // researchInterests || recreationalInterests || Alternative Names
          privilegeMode = 10;
          id = getp.id;
        } else if (mode==3) { // resource tags
          privilegeMode = 50;
          id = getp.itemId;
        } else if (mode==6) { // publication tags
          privilegeMode = 70;
          id = getp.itemId;
        }

        privilege_data.privilages(req.user.sub, id, privilegeMode, function (err, userId, flag) {
          if (flag) cb(err); else cb(helpers.invalid_privileges());
        })
      },

      // 3. update Tags
      function (cb) {
        shared_data.post_tags(req.body, mode, getp.itemId, cb);
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

exports.tagsDelete = function (req, res) {
  var getp = req.query;
  var mode = parseInt(getp.mode);
  var type = parseInt(getp.type);

  async.waterfall([

    // 1. make sure Parent ID, Item ID, Mode are valid
    function (cb) {
      if (!req.body || mode==null || mode>9 || mode<0
          // !ObjectID.isValid(getp.itemId) ||
          // ((!ObjectID.isValid(getp.id) && type==0) || (!getp.id && type==1))
         ) {
        cb(helpers.no_such_item());
        return;
      }
      cb(null);
    },

    // 2. validate Privilages
    function (cb) {
      var privilegeMode: number;
      var id: string;

      if (req.user.scope.indexOf('write:groups')>-1) {
        privilegeMode = 10;
        id = getp.itemId;
      } else if (mode==0 || mode==5 || mode==8) { // homePageItemsInterests || openPositions || Alternative Names
        privilegeMode = 0;
        id = getp.id;
      } else if (mode==1 || mode==2 || mode==9) { // researchInterests || recreationalInterests || Alternative Names
        privilegeMode = 10;
        id = getp.id;
      } else if (mode==3) { // resource tags
        privilegeMode = 50;
        id = getp.itemId;
      } else if (mode==6) { // publication tags
        privilegeMode = 70;
        id = getp.itemId;
      }

      privilege_data.privilages(req.user.sub, id, privilegeMode, function (err, userId, flag) {
        if (flag) cb(err); else cb(helpers.invalid_privileges());
      })
    },

    // 3. delete Tags
    function (cb) {
      shared_data.post_tags([], mode, getp.itemId, cb);
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

exports.textUpdate = function (req, res) {
  var getp = req.query;
  var type = parseInt(getp.type);

  async.waterfall([

    // 1. make sure Item ID, Type, Text are valid
    function (cb) {
      if (!ObjectID.isValid(getp.itemId) || type==null || !req.body.text) {
        cb(helpers.no_such_item());
        return;
      }
      cb(null);
    },

    // 2. validate Privilages
    function (cb) {
      var privilageMode: number;
      var id: string;

      // group, open position texts privilege determined by: Group ID
      // project, resource texts privilege determined by: Item ID
      if (type<100) {
        privilageMode = 0; id = getp.id;
      } else if (type<200) {
        privilageMode = 40; id = getp.itemId;
      } else if (type<300) {
        privilageMode = 50; id = getp.itemId;
      } else if (type<400) {
        privilageMode = 0; id = getp.id;
      } else if (type<500) {
        privilageMode = 90; id = getp.id;
      }

      // make sure Group ID is valid for mode==0
      if (privilageMode==0 && !ObjectID.isValid(getp.id)) {
        cb(helpers.no_such_item());
        return;
      }

      privilege_data.privilages(req.user.sub, id, privilageMode, function (err, userId, flag) {
        if (flag) cb(err); else cb(helpers.invalid_privileges());
      })

    },

    // 3. update Text
    function (cb) {
      shared_data.post_text(req.body.text, getp.itemId, type, cb);
    }

  ],
  function (err, results) {
    if (err) {
      helpers.send_failure(res, helpers.http_code_for_error(err), err);
    } else {
      // setTimeout(() => {
      //   helpers.send_success(res, results);
      // }, 3000)
      helpers.send_success(res, results);
    }
  });
};

exports.textDelete = function (req, res) {
  var getp = req.query;
  var type = parseInt(getp.type);

  async.waterfall([

    // 1. make sure Group ID, Type are valid
    function (cb) {
      if (!ObjectID.isValid(getp.itemId) || type==null) {
        cb(helpers.no_such_item());
        return;
      }
      cb(null);
    },

    // 2. validate Privilages
    function (cb) {
      var privilageMode: number;
      var id: string;

      // group, open position texts privilege determined by: Group ID
      // project, resource texts privilege determined by: Item ID
      if (type<100) {
        privilageMode = 0; id = getp.id;
      } else if (type<200) {
        privilageMode = 40; id = getp.itemId;
      } else if (type<300) {
        privilageMode = 50; id = getp.itemId;
      } else if (type<400) {
        privilageMode = 0; id = getp.id;
      } else if (type<500) {
        privilageMode = 90; id = getp.id;
      }

      // make sure Group ID is valid for mode==0
      if (privilageMode==0 && !ObjectID.isValid(getp.id)) {
        cb(helpers.no_such_item());
        return;
      }

      privilege_data.privilages(req.user.sub, id, privilageMode, function (err, userId, flag) {
        if (flag) cb(err); else cb(helpers.invalid_privileges());
      })

    },

    // 3. delete Text
    function (cb) {
      shared_data.post_text(null, getp.itemId, type, cb);
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

exports.quoteUpdate = function (req, res) {
  var getp = req.query;
  var mode = parseInt(getp.mode);

  async.waterfall([

    // 1. make sure Parent ID, Quote, Quoter, Mode are valid
    function (cb) {
      if (
          !req.body.text || !req.body.name || mode==null ||
          (mode==1 && !getp.id || (mode==0 && !ObjectID.isValid(getp.id)))
      ) {
          cb(helpers.no_such_item());
          return;
      }
      cb(null);
    },

    // 2. validate Privilages
    function (cb) {
      privilege_data.privilages(req.user.sub, getp.id, (mode==0) ? 0 : 10, function (err, userId, flag) {
        if (flag) cb(err, ((req.user.scope.indexOf('write:publications')>-1) || mode==0) ? getp.id : userId); else cb(helpers.invalid_privileges());
      })
    },

    // 3. update Quote
    function (id: string, cb) {
      shared_data.post_quote(req.body, id, mode, cb);
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

exports.quoteDelete = function (req, res) {
  var getp = req.query;
  var mode = parseInt(getp.mode);

  async.waterfall([

    // 1. make sure Group ID, Mode are valid
    function (cb) {
      if ((mode==1 && !getp.id || (mode==0 && !ObjectID.isValid(getp.id))) || mode==null) {
        cb(helpers.no_such_item());
        return;
      }
      cb(null);
    },

    // 2. validate Privilages
    function (cb) {
      privilege_data.privilages(req.user.sub, getp.id, (mode==0) ? 0 : 10, function (err, userId, flag) {
        if (flag) cb(err, ((req.user.scope.indexOf('write:publications')>-1) || mode==0) ? getp.id : userId); else cb(helpers.invalid_privileges());
      })
    },

    // 3. delete Quote
    function (id: string, cb) {
      shared_data.post_quote({"text": null, "name": null, "pic": null}, id, mode, cb);
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

exports.linkPut = function (req, res) {
  var getp = req.query;
  var type = parseInt(getp.type);

  async.waterfall([

    // 1. make sure Resource ID and Link are valid
    function (cb) {
      if ((!ObjectID.isValid(getp.id) && type==0) || !req.body) {
        cb(helpers.no_such_item());
        return;
      }
      cb();
    },

    // 2. validate Privilages
    function (cb) {
      privilege_data.privilages(req.user.sub, getp.id, (type==0) ? 50 : 11, function (err, mentorId, flag) {
        if (flag) cb(err, mentorId); else cb(helpers.invalid_privileges());
      })
    },

    // 3. put Link
    function (mentorId: string, cb) {
      shared_data.put_link(req.body, (type==0) ? getp.id : mentorId, type, cb);
    }

  ],
  function (err, linkId) {
    if (err) {
      helpers.send_failure(res, helpers.http_code_for_error(err), err);
    } else {
      helpers.send_success(res, linkId);
    }
  });

}

exports.linkPost = function (req, res) {
  var getp = req.query;
  var type = parseInt(getp.type);

  async.waterfall([

    // 1. make sure Resource ID and Link are valid
    function (cb) {
      if ((!ObjectID.isValid(getp.id) && type==0) || !req.body) {
        cb(helpers.no_such_item());
        return;
      }
      cb();
    },

    // 2. validate Privilages
    function (cb) {
      privilege_data.privilages(req.user.sub, getp.id, (type==0) ? 50 : 11, function (err, mentorId, flag) {
        if (flag) cb(err, mentorId); else cb(helpers.invalid_privileges());
      })
    },

    // 3. update Link
    function (mentorId: string, cb) {
      shared_data.post_link(req.body, (type==0) ? getp.id : mentorId, cb);
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

exports.linkDelete = function (req, res) {
  var getp = req.query;
  var type = parseInt(getp.type);

  async.waterfall([

    // 1. make sure Resource ID and Link ID are valid
    function (cb) {
      if ((!ObjectID.isValid(getp.id) && type==0) && !ObjectID.isValid(getp.itemId)) {
        cb(helpers.no_such_item());
        return;
      }
      cb();
    },

    // 2. validate Privilages
    function (cb) {
      privilege_data.privilages(req.user.sub, getp.id, (type==0) ? 50 : 11, function (err, mentorId, flag) {
        if (flag) cb(err, mentorId); else cb(helpers.invalid_privileges());
      })
    },

    // 3. delete Link
    function (mentorId: string, cb) {
      shared_data.delete_link(getp.itemId, (type==0) ? getp.id : mentorId, cb);
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

exports.affiliationPost = function (req, res) {
  var getp = req.query;
  var mode = parseInt(getp.mode);

  async.waterfall([

    // 1. make sure Parent ID, Affiliation, Mode are valid
    function (cb) {
      if (!ObjectID.isValid(getp.id) || !req.body || mode==null) {
        cb(helpers.no_such_item());
        return;
      }
      cb(null);
    },

    // 2. validate Privilages
    function (cb) {
      if (mode==0) { // universities
        if (req.user.scope.indexOf('write:universities')>-1) cb(); else cb(helpers.invalid_privileges());
      } else if (mode==1) { // departments
        if (req.user.scope.indexOf('write:departments')>-1) cb(); else cb(helpers.invalid_privileges());
      } else if (mode==2) { // groups
        privilege_data.privilages(req.user.sub, getp.id, 0, function (err, userId, flag) {
          if (flag) cb(err); else cb(helpers.invalid_privileges());
        })
      };
    },

    // 3. update Affiliation
    function (cb) {
      shared_data.post_affiliation(req.body, getp.id, mode, cb);
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

exports.coAuthors = function (req, res) {
  // dummy coAuthors
  var getp = req.query;
  var mode = parseInt(getp.mode);

  shared_data.get_coauthors_ids(getp.parentId, mode, null, false, function (err, coAuthorsMini) {
    if (err) {
      helpers.send_failure(res, 500, err);
      return;
    }
    helpers.send_success(res, coAuthorsMini);
  });
}

exports.calendar = function (req, res) {
  var getp = req.query;
  var mode = parseInt(getp.mode);

  async.waterfall([

    // 1. validate Privilages
    function (cb) {
      privilege_data.privilages(req.user.sub, getp.id, (mode==1) ? 0 : 10, function (err, userId, flag) {
        if (flag) cb(err, userId); else cb(helpers.invalid_privileges());
      })
    },

    // 2. get User Labs
    function (userId: string, cb) {
      if (mode==1) {
        cb(null, [ObjectID(getp.id)]);
      } else {
        people_data.get_followings_ids(5, userId, 0, function (err, groupsIds) {
          cb(err, groupsIds);
        });
      }
    },

    // 3. get Labs Calendars
    function (groupsIds: string[], cb) {
      private_data.group_calendar(groupsIds, function (err, calenar) {
        cb (err, calenar);
      });
    }

  ],
  function (err, calenar) {
    if (err) {
      helpers.send_failure(res, helpers.http_code_for_error(err), err);
    } else {
      helpers.send_success(res, calenar);
    }
  });
};
