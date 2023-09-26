var helpers = require('./helpers.ts');
var async = require("async");

var emails = require("../misc/emails.ts");

var mentor_data = require("../data/mentors.ts");
var faq_data = require("../data/faqs.ts");
var people_data = require("../data/peoples.ts");
var shared_data = require("../data/shared.ts");
// var messages_data = require("../data/messages.ts");
var privilege_data = require("../data/privileges.ts");

var ObjectID = require('mongodb').ObjectID;

exports.version = "0.1.0";

exports.mentorsByIds = function (req, res) {
  var getp = req.query;
  var mentorsIds;

  async.waterfall([

    // 1. validate Privilages
    function (cb) {
      if (!req.user) {
        cb(null, null);
      } else {
        privilege_data.privilages(req.user.sub, null, 10, function (err, userId, flag) {
          if (flag) cb(err, flag, userId); else cb(helpers.invalid_privileges());
        })
      }
    },

    // 2. get mentors ids
    function (adminFlag: boolean, userId: string, ids: string[], cb) {
      if (!userId) {
        cb(null, null, null, ids, null);
      } else {
        people_data.get_followings_ids(70, userId, null, function (err, ids) {
          cb(err, adminFlag, userId, ids);
        });
      }
    },

    // 3. get Mentors List
    function (adminFlag: boolean, userId: string, ids: string[], cb) {
      mentor_data.mentors_list(ids, userId, adminFlag, function (err, mentors) {
        // cb(err, userId, mentors)
        cb(err, mentors)
      })
    },

    // // 4. dress Channel
    // function (userId: string, mentors, cb) {
    //   if ((mode==11 || mode==12) && userId) {
    //     if (mode==11) {
    //       const channelsIds = mentors.map(r=>r.requests).map(r => r[0].channelId);
    //       messages_data.channels_func(userId, channelsIds, 2, function (err, channels) {
    //         mentors.forEach((mentor, index) => {
    //           mentor.channels=[channels[index]]
    //           delete mentor.requests;
    //         });
    //         cb(err, mentors);
    //       });
    //     } else {
    //       const channelsIds = mentors[0].requests ? mentors[0].requests.map(r => r.channelId) : [];
    //       messages_data.channels_func(userId, channelsIds, 2, function (err, channels) {
    //         channels.map((channel, i) => {
    //           channel.type = mentors[0].requests[i].type;
    //         });
    //         mentors[0].channels=channels;
    //         delete mentors[0].requests;
    //         cb(err, mentors);
    //       });
    //     }
    //   } else {
    //     cb(null, mentors);
    //   }
    // },

    // 8. dress Profiles
    function (mentors, cb) {
      people_data.peoples_list(mentors.map(r => r.profileId), null, null, 1, null, function (err, items) {
        mentors.forEach(function(mentor) {
          mentor.profile=items.find(item => item._id == mentor.profileId)
          delete mentor.profileId;
        })
        cb(err,mentors);
      });
    }

  ],
  function (err, mentors) {
    if (err) {
      helpers.send_failure(res, helpers.http_code_for_error(err), err);
    } else {
      helpers.send_success(res, mentors);
    }
  });

}

//////////////////////////////////////////////
//////////////////////////////////////////////
//////////////////////////////////////////////
//////////////////////////////////////////////

exports.mentorDetailsById = function (req, res) {
  var getp = req.query;

  async.waterfall([

    function (cb) {
      if (!req.params || !req.params.mentorId) {
        cb(helpers.no_such_item());
        return;
      }
      cb(null);
    },

    // 1. get Following IDs
    function (cb) {
      if (!req.user) {
        cb(null, null, null);
      } else {
        privilege_data.privilages(req.user.sub, null, 10, function (err, userId, flag) {
          cb(err, flag, userId);
        })
      }
    },

    // 2. get the mentor details
    function (adminFlag: boolean, userId: string, cb) {
      mentor_data.mentor_details(req.params.mentorId, adminFlag, userId, function (err, mentor) {
        cb(err, mentor);
      })
    },

    // 3. get FAQ details
    function (mentor, cb) {
      if (mentor) {
        if (mentor.faqsIds.length>0) {
          faq_data.faq_list(mentor.faqsIds, 0, function (err, faqs) {
            delete mentor.faqsIds;
            mentor.faqs = faqs;
            cb(err, mentor);
          });
        } else {
          mentor.faqs = [];
          delete mentor.faqsIds;
          cb(null, mentor);
        }
      } else {
        cb(null, null);
      }
    }

  ],
  function (err, mentor) {
    if (err) {
      helpers.send_failure(res, helpers.http_code_for_error(err), err);
    } else if (!mentor) {
      helpers.send_failure(res, 403, helpers.no_such_item());
    } else {
      helpers.send_success(res, mentor);
    }
  });
};

//////////////////////////////////////////////
//////////////////////////////////////////////
//////////////////////////////////////////////
//////////////////////////////////////////////

exports.mentorPut = function (req, res) {
  var getp = req.query;
  var mode = parseInt(getp.mode);

  async.waterfall([

    // 1. validate Privilages
    function (cb) {
      privilege_data.privilages(req.user.sub, null, 10, function (err, userId, flag) {
        if (flag) cb(err, userId); else cb(helpers.invalid_privileges());
      })
    },

    // 2. put Mentor & Send Invite
    function (userId: string, cb) {
      people_data.people_email(userId, function (err, user) {
        mentor_data.put_mentor(userId, user.personalInfo.email, user.firstName, user.lastName, function (err, mentorId) {
          cb(err, mentorId)
        })
      })
    }

  ],
  function (err) {
    if (err) {
      helpers.send_failure(res, helpers.http_code_for_error(err), err);
    } else {
      helpers.send_success(res, null);
    }
  });
};

exports.mentorPost = function (req, res) {
  var getp = req.query;
  var mode = parseInt(getp.mode);

  async.waterfall([

    // 1. make sure Mentor ID, Mode are valid
    function (cb) {
      if (mode==null) {
        cb(helpers.no_such_item());
        return;
      }
      cb();
    },

    // 2. validate Privilages
    function (cb) {
      privilege_data.privilages(req.user.sub, null, 11, function (err, mentorId, flag) {
        if (flag) cb(err, mentorId); else cb(helpers.invalid_privileges());
      })
    },

    // 3. post Position
    function (mentorId: string, cb) {
      mentor_data.post_mentor(mentorId, mode, function (err, mentorId) {
        cb(err, mentorId)
      });
    }

  ],
  function (err, mentorId) {
    if (err) {
      helpers.send_failure(res, helpers.http_code_for_error(err), err);
    } else {
      helpers.send_success(res, mentorId);
    }
  });

};

exports.mentorDelete = function (req, res) {
  var getp = req.query;
  var type = parseInt(getp.type);

  async.waterfall([

    // 1. validate Privilages
    function (cb) {
      privilege_data.privilages(req.user.sub, null, 11, function (err, mentorId, flag) {
        if (flag) cb(err, mentorId); else cb(helpers.invalid_privileges());
      })
    },

    // 2. delete Mentor
    function (mentorId: string, cb) {
      mentor_data.delete_mentor(getp.id, mentorId, cb);
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

//////////////////////////////////////////////
//////////////////////////////////////////////
//////////////////////////////////////////////
//////////////////////////////////////////////

exports.availabilityPost = function (req, res) {
  var getp = req.query;

  async.waterfall([

    // 1. make sure Mentor ID and Link are valid
    function (cb) {
      if (!req.body) {
        cb(helpers.no_such_item());
        return;
      }
      cb();
    },

    // 2. validate Privilages
    function (cb) {
      privilege_data.privilages(req.user.sub, null, 11, function (err, mentorId, flag) {
        if (flag) cb(err, mentorId); else cb(helpers.invalid_privileges());
      })
    },

    // 3. update Availability
    function (mentorId: string, cb) {
      mentor_data.post_availability(req.body, mentorId, cb);
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

exports.ongoingPost = function (req, res) {
  var getp = req.query;

  async.waterfall([

    // 1. make sure Mentor ID and Link are valid
    function (cb) {
      if (!req.body) {
        cb(helpers.no_such_item());
        return;
      }
      cb();
    },

    // 2. validate Privilages
    function (cb) {
      privilege_data.privilages(req.user.sub, null, 11, function (err, mentorId, flag) {
        if (flag) cb(err, mentorId); else cb(helpers.invalid_privileges());
      })
    },

    // 3. update Ongoing
    function (mentorId: string, cb) {
      mentor_data.post_ongoing(req.body, mentorId, cb);
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

//////////////////////////////////////////////
//////////////////////////////////////////////
//////////////////////////////////////////////
//////////////////////////////////////////////

exports.expertisePut = function (req, res) {
  var getp = req.query;
  var type = parseInt(getp.type);

  async.waterfall([

    // 1. make sure Resource ID and Link are valid
    function (cb) {
      if (!req.body || type==null) {
        cb(helpers.no_such_item());
        return;
      }
      cb();
    },

    // 2. validate Privilages
    function (cb) {
      privilege_data.privilages(req.user.sub, null, 11, function (err, mentorId, flag) {
        if (flag) cb(err, mentorId); else cb(helpers.invalid_privileges());
      })
    },

    // 3. put Expertise / Toolkit
    function (mentorId: string, cb) {
      mentor_data.put_expertise(req.body, mentorId, type, cb);
    }

  ],
  function (err, expertiseId) {
    if (err) {
      helpers.send_failure(res, helpers.http_code_for_error(err), err);
    } else {
      helpers.send_success(res, expertiseId);
    }
  });

}

exports.expertisePost = function (req, res) {
  var getp = req.query;
  var type = parseInt(getp.type);

  async.waterfall([

    // 1. make sure Expertise ID and Expertise are valid
    function (cb) {
      if (!req.body || type==null) {
        cb(helpers.no_such_item());
        return;
      }
      cb();
    },

    // 2. validate Privilages
    function (cb) {
      privilege_data.privilages(req.user.sub, null, 11, function (err, mentorId, flag) {
        if (flag) cb(err, mentorId); else cb(helpers.invalid_privileges());
      })
    },

    // 3. update Expertise / Toolkit
    function (mentorId: string, cb) {
      mentor_data.post_expertise(req.body, mentorId, type, cb);
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

exports.expertiseDelete = function (req, res) {
  var getp = req.query;
  var type = parseInt(getp.type);

  async.waterfall([

    // 1. make sure Expertise ID are valid
    function (cb) {
      if (!ObjectID.isValid(getp.id) || type==null) {
        cb(helpers.no_such_item());
        return;
      }
      cb();
    },

    // 2. validate Privilages
    function (cb) {
      privilege_data.privilages(req.user.sub, null, 11, function (err, mentorId, flag) {
        if (flag) cb(err, mentorId); else cb(helpers.invalid_privileges());
      })
    },

    // 3. delete Expertise / Toolkit
    function (mentorId: string, cb) {
      mentor_data.delete_expertise(getp.id, mentorId, type, cb);
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

//////////////////////////////////////////////
//////////////////////////////////////////////
//////////////////////////////////////////////
//////////////////////////////////////////////

exports.submitPut = function (req, res) {
  var getp = req.query;

  async.waterfall([

    // 1. validate Privilages
    function (cb) {
      privilege_data.privilages(req.user.sub, null, 10, function (err, userId, flag) {
        if (flag) cb(err, userId); else cb(helpers.invalid_privileges());
      })
    },

    // 2. put Submit
    function (userId: string, cb) {
      mentor_data.put_submit_mentor(userId, req.body, function (err) {
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
};

//////////////////////////////////////////////
//////////////////////////////////////////////
//////////////////////////////////////////////
//////////////////////////////////////////////

// exports.sessionsPost = function (req, res) {
//   var getp = req.query;
//
//   async.waterfall([
//
//     // 1. make sure Mentor ID and Link are valid
//     function (cb) {
//       if (!ObjectID.isValid(getp.id) || !req.body.message) {
//         cb(helpers.no_such_item());
//         return;
//       }
//       cb();
//     },
//
//     // 2. validate Privilages
//     function (cb) {
//       privilege_data.privilages(req.user.sub, null, 10, function (err, userId, flag) {
//         cb(err, userId);
//       })
//     },
//
//     // 3. push Sessions
//     function (userId: string, cb) {
//       mentor_data.post_session(req.body.message, userId, getp.id, cb);
//     }
//
//   ],
//   function (err, results) {
//     if (err) {
//       helpers.send_failure(res, helpers.http_code_for_error(err), err);
//     } else {
//       helpers.send_success(res, results);
//     }
//   });
// }
