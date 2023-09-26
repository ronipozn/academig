var db = require('../db.ts');
var helpers = require('./helpers.ts');
var async = require("async");

var group_data = require("../data/groups.ts");
var group_create_data = require("../data/groups_create.ts");
var group_approve_data = require("../data/groups_approve.ts");

var people_data = require("../data/peoples.ts");
var news_data = require("../data/news.ts");
var publication_data = require("../data/publications.ts");

var admin_data = require("../data/admin.ts");
var newsletter_data = require("../data/newsletter.ts");
var user_settings_data = require("../data/user_settings.ts");
var privilege_data = require("../data/privileges.ts");
var invites_data = require("../data/invites.ts");

var sendgrid = require("../misc/sendgrid.ts");

var emails = require("../misc/emails.ts");

import { objectMini, objectMiniEmail, groupComplex, complexName, Period } from '../models/shared.ts';

var ObjectID = require('mongodb').ObjectID;

exports.version = "0.1.0";

exports.universities = function (req, res) {
  var getp = req.query;
  var mode = parseInt(getp.mode);
  var flag = parseInt(getp.flag);

  async.waterfall([
    // get universities data
    function (cb) {
      admin_data.universities_list(mode, getp.text, getp.id, flag, function (err, universities, count) {
        cb(err, universities, count);
      });
    }
  ],
  function (err, universities, count) {
    if (err) {
      helpers.send_failure(res, 500, err);
      return;
    }
    universities.push(count)
    helpers.send_success(res, universities);
  });
}

// %%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%
// %%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%
// %%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%
// %%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%

exports.changeState = function (req, res) {
  var getp = req.query;
  // console.log('req.user',req.user); // from JWT

  async.waterfall([

    // Check Group ID, State data are valid
    function (cb) {
      if (!ObjectID.isValid(getp.groupId) || !req.body) {
        cb(helpers.no_such_item());
        return;
      }
      cb(null)
    },

    // 2. validate Privilages
    function (cb) {
      privilege_data.privilages(req.user.sub, null, 10, function (err, userId, flag) {
        if (flag) cb(err, userId); else cb(helpers.invalid_privileges());
      })
    },

    // 3. get Group Crurent Stage
    function (userId: string, cb) {
      group_create_data.get_current_stage(getp.groupId, function (err, stage) {
        cb(err, userId, stage);
      })
    },

    // 4. change group stage
    function (userId: string, stage: number, cb) {
      group_approve_data.change_stage(req.body, getp.groupId, userId, stage, true, cb);
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

exports.changeInstitute = function (req, res) {
  var getp = req.query;
  // console.log('req.user',req.user); // from JWT

  async.waterfall([

    // Check Group ID, State data are valid
    function (cb) {
      if (!ObjectID.isValid(getp.groupId) || !req.body) {
        cb(helpers.no_such_item());
        return;
      }
      cb(null)
    },

    // 2. validate Privilages
    function (cb) {
      privilege_data.privilages(req.user.sub, null, 10, function (err, userId, flag) {
        if (flag) cb(err, userId); else cb(helpers.invalid_privileges());
      })
    },

    // 3. current department
    function (userId: string, cb) {
      group_data.get_group_link(getp.groupId, function (err, group) {
        cb(err, group.groupIndex.department._id)
      });
    },

    // 4. change group institutee
    function (currentDepartmentId: string, cb) {
      admin_data.change_group_institute(req.body, getp.groupId, currentDepartmentId, cb);
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

exports.groups = function (req, res) {
  var getp = req.query;
  var mode = parseInt(getp.mode);

  async.waterfall([

    // 1. get groupsIds (* add filtering capabilities)
    function (cb) {
      admin_data.groups_ids(function (err, groupArr) {
        cb(err, groupArr.map(r => ObjectID(r.groupId)));
      });
    },

    // 2. get groups data
    function (groupsIds, cb) {
      admin_data.groups_list(mode, groupsIds, function (err, groups) {
        cb(err, groups);
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
},

exports.emailsStats = function (req, res) {
  var getp = req.query;

  async.waterfall([

    function (cb) {
      group_data.groupMembers(getp.id, 2, function (err, peoples) {
        cb(err, peoples)
      })
    },

    function (peoples, cb) {
      // async.eachSeries(authors, function (author, next) {
      async.forEachOf(peoples, function (people, keyP, callback) {
        const email = people.personalInfo.email;

        sendgrid.statsEmail(email, function (err, emails) {
          people.emails = emails;
          callback(err);
        });

      }, function (err) {
        cb(err, peoples)
      })
    }

  ],
  function (err, peoples) {
    if (err) {
      helpers.send_failure(res, 500, err);
      return;
    }
    helpers.send_success(res, peoples);
  });
}

// %%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%
// %%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%
// %%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%
// %%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%

exports.peoples = function (req, res) {
  var getp = req.query;
  var more = parseInt(getp.more);

  var flag = parseInt(getp.flag);
  var challenges = parseInt(getp.challenges);
  var libraries = parseInt(getp.libraries);
  var domains = parseInt(getp.domains);
  var followings = parseInt(getp.followings);
  var lib = parseInt(getp.updates);
  var updates = parseInt(getp.updates);
  var suggestions = parseInt(getp.suggestions);

  var searchCont: number = 0;
  var searchContVerified: number = 0;

  async.waterfall([

    // 1. get ALL peoples data (add filtering capabilities)
    function (cb) {
      admin_data.peoples_list(more, flag, challenges, libraries, domains, followings, updates, suggestions, function (err, peoples, count) {
        searchCont = count;
        cb(err, peoples);
      });
    },

    // 2. dress Positions Groups
    function (peoples, cb) {
      var arrays = peoples.map(r => r.positions.map(r=> r.groupId))
      var flatten = [].concat(...arrays)
      group_data.groups_list(flatten, null, null, null, null, 2, true, function (err, items) {
        peoples.forEach(function(people) {
          people.positions.forEach(function(position) {
            const item = items.find(item => item._id.toString() == position.groupId.toString());
            position.group = item ? item.groupIndex : null;
            delete position.groupId;
          })
        })
        cb(err,peoples);
      });
    },

    // 3. dress Followings Groups
    function (peoples, cb) {
      if (followings) {
        var arrays = peoples.map(r => r.followings.groupsIds)
        var flatten = [].concat(...arrays)
        var group;
        group_data.groups_list(flatten, null, null, null, null, 2, true, function (err, groupItems) {
          peoples.forEach(function(item) {
            item.groups = [];
            item.followings.groupsIds.forEach(function(groupId, index) {
              group = groupItems.find(item => item._id.toString() == groupId.toString());
              if (group && group.groupIndex.group.link!="academig") item.groups[index]=group.groupIndex;
              // item.groupsIds = item.followings.groupsIds;
              delete item.followings;
            })
          })
          cb(err,peoples);
        });
      } else {
        cb(null,peoples);
      }
    }

  ],
  function (err, peoples) {
    if (err) {
      helpers.send_failure(res, 500, err);
      return;
    }
    peoples.push(searchCont)
    helpers.send_success(res, peoples);
  });
}

exports.newsUpdates = function (req, res) {
  var getp = req.query;

  async.waterfall([

    function (cb) {
      db.peoples.find({_id: getp.id}).project({_id: 1, updates_id: 1}).next(cb)
    },

    function (user, cb) {
      console.log("user",user)
      news_data.news_updates(user._id, user.updates_id, 0, 20, 'timeline', function (err, news) {
        console.log('news',news)
        cb(err, news)
      })
    }

  ],
  function (err, news) {
    if (err) {
      helpers.send_failure(res, helpers.http_code_for_error(err), err);
    } else {
      helpers.send_success(res, news);
    }
  });
}

// %%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%
// %%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%
// %%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%
// %%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%

exports.itemMarketing = function (req, res) {
  var getp = req.query;
  var mode = parseInt(getp.mode);

  async.waterfall([

    // 1. Check Group ID is valid
    function (cb) {
      if (mode==1 && !ObjectID.isValid(getp.id)) {
        cb(helpers.no_such_item());
        return;
      }
      cb(null)
    },

    // 2. validate Privilages
    function (cb) {
      privilege_data.privilages(req.user.sub, null, 10, function (err, userId, flag) {
        if (flag) cb(err, userId); else cb(helpers.invalid_privileges());
      })
    },

    // 3. marketing
    function (userId: string, cb) {
      if (mode==0) {
        admin_data.researcher_item_marketing(getp.id, userId, req.body.msg, cb);
      } else if (mode==1) {
        admin_data.group_item_marketing(getp.id, userId, req.body.msg, cb);
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
};

// %%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%
// %%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%
// %%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%
// %%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%

exports.positions = function (req, res) {
  // var getp = req.query;
  // var mode = parseInt(getp.mode);

  async.waterfall([

    // 1. get positions items data
    function (cb) {
      admin_data.positions_list(function (err, positions) {
        cb(err, positions);
      });
    }

  ],
  function (err, positions) {
    if (err) {
      helpers.send_failure(res, 500, err);
      return;
    }
    helpers.send_success(res, positions);
  });
},

exports.positionDetailsById = function (req, res) {
  async.waterfall([

    function (cb) {
      if (!req.params || !ObjectID.isValid(req.params.positionId))
        cb(helpers.no_such_item());
      else {
        cb(null)
      }
    },

    // 1. get position details data
    function (cb) {
      admin_data.position_details(req.params.positionId, function (err, position) {
        cb(err, position);
      });
    },

    // 2. get group data
    function (position, cb) {
      admin_data.groups_list(0, [position.groupId], function (err, groups) {
        position.group=groups[0];
        cb(err, position);
      });
    }

  ],
  function (err, position) {
    if (err) {
      helpers.send_failure(res, 500, err);
      return;
    }
    helpers.send_success(res, position);
  });
},

exports.positionStatPush = function (req, res) {
  var getp = req.body;

  async.waterfall([

    function (cb) {
      if (!req.params || !ObjectID.isValid(req.params.positionId))
        cb(helpers.no_such_item());
      else {
        cb(null)
      }
    },

    // 1. push position stats row
    function (cb) {
      admin_data.position_stats_push(req.params.positionId, getp.stats, function (err, groupId, positionTitle, positionName) {
        cb(err, groupId, positionTitle, positionName);
      });
    },

    // 2. email admins
    function (groupId: string, positionTitle: string, positionName: string, cb) {
      group_data.get_group_link(groupId, function (err, groupObj) {
        group_data.groupMembers(groupId, 4, function (err, admins) {
          const adminEmails: string[] = admins.map(r => r.personalInfo.email);
          emails.statsJobEmail(getp.stats, groupObj.groupIndex.group.link, groupObj.groupIndex.group.name, adminEmails, req.params.positionId, positionTitle, positionName, function (err) {
            cb(err);
          });
        });
      });
    }

  ],
  function (err) {
    if (err) {
      helpers.send_failure(res, 500, err);
      return;
    }
    helpers.send_success(res);
  });
},

exports.positionStatUpdate = function (req, res) {
  var getp = req.body;

  async.waterfall([

    function (cb) {
      if (!req.params || !ObjectID.isValid(req.params.positionId) ||
          getp.stat[0]==null || getp.stat[1]==null || getp.stat[2]==null || getp.stat.length!=3 ||
          getp.index[0]==null || getp.index[1]==null || getp.index.length!=2
         )
        cb(helpers.no_such_item());
      else {
        cb(null)
      }
    },

    // 1. push position stas specific index
    function (cb) {
      admin_data.position_stats_update(req.params.positionId, getp.stat, getp.index, function (err) {
        cb(err);
      });
    }

  ],
  function (err) {
    if (err) {
      helpers.send_failure(res, 500, err);
      return;
    }
    helpers.send_success(res);
  });
},

// %%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%
// %%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%
// %%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%
// %%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%

exports.schedules = function (req, res) {
  var getp = req.query;

  async.waterfall([
    function (cb) {
      admin_data.schedules_stats(function (err, stats) {
        cb(err, stats);
      });
    }
  ],
  function (err, stats) {
    console.log("stats",stats)
    if (err) {
      helpers.send_failure(res, 500, err);
      return;
    } else {
      helpers.send_success(res, stats);
    }
  });
}

exports.publicationsMarketing = function (req, res) {
  var getp = req.query;

  var mode = parseInt(getp.mode);

  async.waterfall([
    // 1. get publications marketing list (By Date)
    function (cb) {
      if (mode==0) {
        admin_data.publications_list_date(getp.date, function (err, publicationsAdmin) {
          cb(err, publicationsAdmin);
        });
      } else {
        admin_data.publications_list(function (err, publicationsAdmin) {
          cb(err, publicationsAdmin);
        });
      }
    },

    // 2. get publications details
    function (publicationsAdmin, cb) {
      admin_data.publications_details(publicationsAdmin.map(r => ObjectID(r.publicationId)), function (err, publicationsDetails) {
        let detailsMerge = [];
        publicationsAdmin.map(r => ({"adminId": r.adminId, "dates": r.dates})).forEach((item, i) => {
          detailsMerge.push(Object.assign({}, item, publicationsDetails[i]));
        });
        cb(err, detailsMerge);
      });
    }

  ],
  function (err, detailsMerge) {
    if (err) {
      helpers.send_failure(res, 500, err);
      return;
    }
    helpers.send_success(res, detailsMerge);
  });
}

exports.publicationReinviteAll = function (req, res) {
  var getp = req.query;

  var authors: objectMiniEmail;

  async.waterfall([

    function (cb) {
      if (!req.body) {
        cb(helpers.no_such_item());
        return;
      }
      cb(null);
    },

    // 1. validate Privilages
    function (cb) {
      privilege_data.privilages(req.user.sub, null, 10, function (err, userId, flag) {
        if (flag) cb(err, userId); else cb(helpers.invalid_privileges());
      })
    },

    // 2. get publications marketing list (By Date)
    function (userId: string, cb) {
      // admin_data.publications_list_sample(2, function (err, publications2) {
        // console.log('publications2',publications2)
        admin_data.publications_list_date(getp.date, function (err, publications) {
          // console.log('publications',publications)
          cb(err, userId, publications);
        });
      // });
    },

    // 3. get publications details
    function (userId: string, publications, cb) {
      admin_data.publications_details(publications.map(r => ObjectID(r.publicationId)), function (err, publicationsDetails) {
        cb(err, userId, publicationsDetails);
      });
    },

    // 4. Publications Invite
    function (userId: string, publications, cb) {
      async.forEachOf(publications, function (publication, keyP, callback) {
        authors = publication.authors.filter(r => r.email).filter(r=>ObjectID.isValid(r._id))
        async.eachSeries(authors, function (author, next) {
          setTimeout(function () {
            invites_data.post_invite(author, publication._id, userId, 7, function (err) {
              next(err)
            });
          }, 1000);
        }, function (err) {
          callback(err)
        })

      }, function (err) {
        cb(err)
      })
    }

  ],
  function (err, publicationMarketingId) {
    if (err) {
      helpers.send_failure(res, helpers.http_code_for_error(err), err);
    } else {
      helpers.send_success(res, publicationMarketingId);
    }
  });

};

exports.publicationPut = function (req, res) {
  var getp = req.query;

  async.waterfall([
      function (cb) {
        if (!req.body) {
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

      // 3. put Publication
      function (userId: string, cb) {
        // publication_data.put_publication(userId, 4, false, req.body, function (err, publicationId) {
        publication_data.put_publication("academig", 4, false, req.body, function (err, publicationId) {
          cb(err, userId, publicationId)
        });
      },

      // 4. put Publication Marketing
      function (userId: string, publicationId: string, cb) {
        admin_data.put_publication_marketing(userId, publicationId, function (err, publicationMarketingId) {
          // cb(err, publicationMarketingId)
          cb(err, publicationId)
        });
      }

  ],
  function (err, publicationMarketingId) {
      if (err) {
        helpers.send_failure(res, helpers.http_code_for_error(err), err);
      } else {
        helpers.send_success(res, publicationMarketingId);
      }
  });

};

exports.publicationDelete = function (req, res) {
  var getp = req.query;

  async.waterfall([

    function (cb) {
      if (!getp.id) {
        cb(helpers.no_such_item());
        return;
      }
      cb();
    },

    // 2. delete Publication
    function (cb) {
      publication_data.delete_publications(null, null, 4, [getp.id], function (err) {
        cb(err)
      });
    },

    // 3. delete Publication Marketing
    function (cb) {
      admin_data.delete_publication_marketing(getp.id, function (err) {
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

// %%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%
// %%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%
// %%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%
// %%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%

exports.reports = function (req, res) {
  var getp = req.query;

  async.waterfall([
    // get ALL reports data (add filtering capabilities)
    function (cb) {
      user_settings_data.reports(0, null, function (err, reports) {
        cb(err, reports);
      });
    },
  ],
  function (err, reports) {
    if (err) {
      helpers.send_failure(res, 500, err);
    } else {
      helpers.send_success(res, reports);
    }
  });
}

// %%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%
// %%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%
// %%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%
// %%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%

exports.candidateFilterStatusPost = function (req, res) {
  var getp = req.query;

  admin_data.post_candidate_filter_status(req.params.positionId, getp.peopleId, req.body.status, function (err, positionId) {
    if (err) {
      helpers.send_failure(res, helpers.http_code_for_error(err), err);
    } else {
      helpers.send_success(res);
    }
  });
};

exports.candidateFilterNotePost = function (req, res) {
  var getp = req.query;

  admin_data.post_candidate_filter_note(req.params.positionId, getp.peopleId, req.body.note, function (err, positionId) {
    if (err) {
      helpers.send_failure(res, helpers.http_code_for_error(err), err);
    } else {
      helpers.send_success(res);
    }
  });
};

exports.candidatesFilterPost = function (req, res) {
  var getp = req.query;
  var mode = parseInt(getp.mode);

  admin_data.post_candidate_filter(req.params.positionId, mode, function (err, positionId) {
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

exports.data = function (req, res) {
  async.waterfall([
    // get ALL data requests
    function (cb) {
      admin_data.data_requests_list(function (err, requests) {
        cb(err, requests);
      });
    },
  ],
  function (err, requests) {
    if (err) {
      helpers.send_failure(res, 500, err);
    } else {
      helpers.send_success(res, requests);
    }
  });
}

// %%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%
// %%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%
// %%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%
// %%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%

exports.domains = function (req, res) {
  async.waterfall([
    // get ALL domains requests
    function (cb) {
      admin_data.domains_requests_list(function (err, requests) {
        cb(err, requests);
      });
    },
  ],
  function (err, requests) {
    if (err) {
      helpers.send_failure(res, 500, err);
    } else {
      helpers.send_success(res, requests);
    }
  });
}

// %%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%
// %%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%
// %%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%
// %%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%

exports.deals = function (req, res) {
  async.waterfall([
    function (cb) {
      admin_data.deals_list(function (err, deals_list) {
        console.log('deals_list',deals_list)
        cb(err, deals_list);
      });
    },
  ],
  function (err, deals_list) {
    if (err) {
      helpers.send_failure(res, 500, err);
    } else {
      helpers.send_success(res, deals_list);
    }
  });
}

// %%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%
// %%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%
// %%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%
// %%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%

exports.trends = function (req, res) {
  async.waterfall([
    // get ALL Podcasts Submit
    function (cb) {
      admin_data.trends_submit_list(function (err, submit_list) {
        cb(err, submit_list);
      });
    },
  ],
  function (err, submit_list) {
    if (err) {
      helpers.send_failure(res, 500, err);
    } else {
      helpers.send_success(res, submit_list);
    }
  });
}

// %%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%
// %%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%
// %%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%
// %%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%

exports.podcasts = function (req, res) {
  async.waterfall([
    // get ALL Podcasts Submit
    function (cb) {
      admin_data.podcasts_submit_list(function (err, submit_list) {
        cb(err, submit_list);
      });
    },
  ],
  function (err, submit_list) {
    if (err) {
      helpers.send_failure(res, 500, err);
    } else {
      helpers.send_success(res, submit_list);
    }
  });
}

// %%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%
// %%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%
// %%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%
// %%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%

exports.events = function (req, res) {
  async.waterfall([
    // get ALL Events Submit
    function (cb) {
      admin_data.events_submit_list(function (err, submit_list) {
        cb(err, submit_list);
      });
    },
  ],
  function (err, submit_list) {
    if (err) {
      helpers.send_failure(res, 500, err);
    } else {
      helpers.send_success(res, submit_list);
    }
  });
}

// %%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%
// %%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%
// %%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%
// %%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%

exports.apps = function (req, res) {
  async.waterfall([
    // get ALL Apps Submit
    function (cb) {
      admin_data.apps_submit_list(function (err, submit_list) {
        cb(err, submit_list);
      });
    },
  ],
  function (err, submit_list) {
    if (err) {
      helpers.send_failure(res, 500, err);
    } else {
      helpers.send_success(res, submit_list);
    }
  });
}

// %%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%
// %%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%
// %%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%
// %%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%

exports.mentors = function (req, res) {
  async.waterfall([
    // get ALL Apps Submit
    function (cb) {
      admin_data.mentors_list(function (err, mentors_list) {
        console.log('mentors_list',mentors_list)
        cb(err, mentors_list);
      });
    },
  ],
  function (err, mentors_list) {
    if (err) {
      helpers.send_failure(res, 500, err);
    } else {
      helpers.send_success(res, mentors_list);
    }
  });
}

// %%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%
// %%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%
// %%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%
// %%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%

exports.contacts = function (req, res) {
  async.waterfall([
    // get ALL contacts messages
    function (cb) {
      admin_data.contacts_messages_list(function (err, messages) {
        cb(err, messages);
      });
    },
  ],
  function (err, messages) {
    if (err) {
      helpers.send_failure(res, 500, err);
    } else {
      helpers.send_success(res, messages);
    }
  });
}

// %%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%
// %%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%
// %%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%
// %%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%

exports.loggings = function (req, res) {
  var getp = req.query;

  async.waterfall([
    // get ALL domains requests
    function (cb) {
      admin_data.loggings_list(function (err, loggings) {
        cb(err, loggings);
      });
    },
  ],
  function (err, loggings) {
    if (err) {
      helpers.send_failure(res, 500, err);
    } else {
      helpers.send_success(res, loggings);
    }
  });
}

// %%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%
// %%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%
// %%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%
// %%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%

exports.claims = function (req, res) {
  var getp = req.query;

  async.waterfall([
    // get ALL domains requests
    function (cb) {
      admin_data.claims_requests_list(function (err, usersIds) {
        cb(err, usersIds);
      });
    },
  ],
  function (err, usersIds: string[]) {
    if (err) {
      helpers.send_failure(res, 500, err);
    } else {
      helpers.send_success(res, usersIds);
    }
  });
}

// %%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%
// %%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%
// %%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%
// %%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%

exports.dealStatusPost = function (req, res) {
  var getp = req.query;
  var status = parseInt(getp.status);

  admin_data.post_deal_status(getp.id, status, req.body.date, function (err) {
    if (err) {
      helpers.send_failure(res, helpers.http_code_for_error(err), err);
    } else {
      helpers.send_success(res, null);
    }
  });
};

exports.dealEmailPost = function (req, res) {
  var getp = req.query;
  var type = parseInt(getp.type);

  // set Date in emails[] deal collection

  // emails.dealSealesEmail(status, userId, userName, userEmail, function (err) {
  //   callback(err)
  // });
  console.log("dealId",getp.id,"type",type)

  // if (err) {
  //   helpers.send_failure(res, helpers.http_code_for_error(err), err);
  // } else {
    helpers.send_success(res, null);
  // }
};

// %%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%
// %%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%
// %%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%
// %%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%

exports.mentorStatusPost = function (req, res) {
  var getp = req.query;
  var status = parseInt(getp.status);

  admin_data.post_mentor_status(getp.id, status, function (err) {
    if (err) {
      helpers.send_failure(res, helpers.http_code_for_error(err), err);
    } else {
      helpers.send_success(res, null);
    }
  });
};


exports.mentorEmailPost = function (req, res) {
  var getp = req.query;
  var type = parseInt(getp.type);

  // set Date in emails[] mentor collection

  // emails.mentorSalesEmail(status, userId, userName, userEmail, function (err) {
  //   callback(err)
  // });
  console.log("mentorId",getp.id,"type",type)

  // if (err) {
  //   helpers.send_failure(res, helpers.http_code_for_error(err), err);
  // } else {
    helpers.send_success(res, null);
  // }
};

// %%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%
// %%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%
// %%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%
// %%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%

exports.progressNotifiy = function (req, res) {
  var getp = req.query;

  var peopleMini: objectMini;
  var nextTask: number;

  async.waterfall([

    // 1. get peoples list
    function (cb) {
      admin_data.peoples_list(-1, 0, function (err, peoples) {
        cb(err);
        // cb(err, peoples);
      });
    },

    // 2. Send Progress Request Emails
    // function (peoples, cb) {
    //   async.eachSeries(peoples, function (people, next) {
    //     setTimeout(function () {
    //       peopleMini = {"_id": people._id, "name": people.name, "pic": people.pic}
    //       nextTask = indexOfSmallest(people.progressNotify, people.progress)
    //       if (nextTask==-1) {
    //         next()
    //       } else {
    //         emails.progressEmail(peopleMini, people.personalInfo.email, 1, nextTask, function (err) {
    //           admin_data.progessUpdate(people._id, 3, nextTask, function (err) {
    //             next(err)
    //           })
    //         });
    //       }
    //     }, 1000);
    //
    //   }, function (err) {
    //     cb(err)
    //   })
    // }

  ],
  function (err) {
    if (err) {
      helpers.send_failure(res, helpers.http_code_for_error(err), err);
    } else {
      helpers.send_success(res, null);
    }
  });
}

exports.progressNotifiyById = function (req, res) {
  var getp = req.query;

  var peopleMini: objectMini;
  var nextTask: number;

  async.waterfall([

    // 1. get peoples list
    function (cb) {
      admin_data.peoples_list_by_id(getp.id, function (err, peoples) {
        cb(err, peoples);
      });
    },

    // 2. Send Progress Request Email
    function (peoples, cb) {
      async.forEachOfLimit(peoples, 1, function (people, keyA, callback) {
        peopleMini = {"_id": people._id, "name": people.name, "pic": people.pic}
        nextTask = indexOfSmallest(people.progressNotify, people.progress)
        if (nextTask==-1) {
          callback()
        } else {
          emails.progressEmail(peopleMini, people.personalInfo.email, 1, nextTask, function (err) {
            admin_data.progessUpdate(people._id, 3, nextTask, function (err) {
              callback(err)
            })
          });
        }
      }, function (err) {
        cb(err)
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
}

function indexOfSmallest(score, flag) {
  var Len = 16;

  var flagPad = flag.concat(Array(Len+1-flag.length).fill(0)).map(r => r==null ? 0 : r);
  var scorePad = score ? score.concat(Array(Len+1-score.length).fill(0)).map(r => r==null ? 0 : r) : Array(16).fill(0);


  // flagPad[4]=1; ?????
  flagPad[5]=1;
  flagPad[8]=1;

  // console.log('flagPad',flagPad)
  // console.log('scorePad',scorePad)

  var lowest = 0;
  for (var i = 1; i <= Len+1; i++) {
    if ((scorePad[i]<scorePad[lowest] || flagPad[lowest]==1) && flagPad[i]==0) lowest = i;
  }
  // console.log('lowest',lowest)
  return (lowest==0 ? (flag[0] ? -1 : 0) : lowest);
}
