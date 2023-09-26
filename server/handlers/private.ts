var helpers = require('./helpers.ts');
var departments = require('./departments.ts');
var async = require("async");

var private_data = require("../data/private.ts");
var peoples_data = require("../data/peoples.ts");
var group_data = require("../data/groups.ts");
var privilege_data = require("../data/privileges.ts");
var shared_data = require("../data/shared.ts");

var university_data = require("../data/universities.ts");
var department_data = require("../data/departments.ts");

import { objectMini } from '../models/shared.ts';
import { privateNews } from '../models/private.ts';

var ObjectID = require('mongodb').ObjectID;

// ************** ************** **************
// ************** ************** **************
// **************** Group News ****************
// ************** ************** **************
// ************** ************** **************

exports.news = function (req, res) {
  var getp = req.query;

  async.waterfall([

    // 1. make sure Group ID is valid
    function (cb) {
      if (!ObjectID.isValid(getp.id)) {
        cb(helpers.no_such_item());
        return;
      }
      cb(null);
    },

    // 2. validate Privilages
    function (cb) {
      privilege_data.privilages(req.user.sub, getp.id, 3, function (err, userId, flag) {
        if (flag) cb(err); else cb(helpers.invalid_privileges());
      })
    },

    // 3. get News IDs
    function (cb) {
      group_data.group_items_ids("newsItems", getp.id, function (err, items) {
        cb(err, items.newsIds);
      })
    },

    // 4. get News
    function (newsIds: string[], cb) {
      private_data.news_list(newsIds, function (err, newses) {
        cb(err, newses);
      });
    },

    // 5. dress Actors
    function (newses: privateNews[], cb) {
      peoples_data.peoples_list(newses.map(r=>r.actor), null, null, 1, null, function (err, actors) {
        newses.forEach((news, index) => {
          news.actor=actors.filter(r => r._id==news.actor)[0];
        });
        cb(err,newses);
      });
    }

  ],
  function (err, newses: privateNews[]) {
    if (err) {
      helpers.send_failure(res, helpers.http_code_for_error(err), err);
    } else {
      helpers.send_success(res, newses);
    }
  });

};

exports.comments = function (req, res) {
  var getp = req.query;

  async.waterfall([

    // 1. make sure group ID, News ID is valid
    function (cb) {
      if (!ObjectID.isValid(getp.id) || !ObjectID.isValid(getp.itemId)) {
        cb(helpers.no_such_item());
        return;
      }
      cb(null);
    },

    // 2. validate Privilages
    function (cb) {
      privilege_data.privilages(req.user.sub, getp.id, 3, function (err, userId, flag) {
        if (flag) cb(err); else cb(helpers.invalid_privileges());
      })
    },

    // 3. get Comments
    function (cb) {
      private_data.comments_list(getp.itemId, function (err, item) {
        cb(err, item.comments);
      });
    },

    // 4. dress Actors
    function (comments: privateNews[], cb) {
      peoples_data.peoples_list(comments.map(r=>r.actor), null, null, 1, null, function (err, actors) {
        comments.forEach((news, index) => {
          news.actor=actors.filter(r => r._id==news.actor)[0];
        });
        cb(err,comments);
      });
    }

  ],
  function (err, comments: privateNews[]) {
    if (err) {
      helpers.send_failure(res, helpers.http_code_for_error(err), err);
    } else {
      helpers.send_success(res, comments);
    }
  });

};

exports.newsPut = function (req, res) {
  var getp = req.query;

  async.waterfall([

    // 1. make sure Group ID, News Data are valid
    function (cb) {
      if (!ObjectID.isValid(getp.id) || !req.body) {
        cb(helpers.no_such_item());
        return;
      }
      cb(null);
    },

    // 2. validate Privilages
    function (cb) {
      privilege_data.privilages(req.user.sub, getp.id, 3, function (err, userId, flag) {
        if (flag) cb(err); else cb(helpers.invalid_privileges());
      })
    },

    // 3. put News
    function (cb) {
      private_data.put_news(getp.id, req.body, function (err, newsId) {
        cb(err, newsId)
      });
    }

  ],
  function (err, newsId) {
    if (err) {
      helpers.send_failure(res, helpers.http_code_for_error(err), err);
    } else {
      helpers.send_success(res, newsId);
    }
  });

};

exports.newsPost = function (req, res) {
  var getp = req.query;

  async.waterfall([

    // 1. make sure Group ID, News ID, News Data are valid
    function (cb) {
      if (!ObjectID.isValid(getp.id) || !ObjectID.isValid(getp.itemId) || !req.body) {
        cb(helpers.no_such_item());
        return;
      }
      cb(null);
    },

    // 2. validate Privilages
    function (cb) {
      private_data.member_id_by_news_id(getp.itemId, function (err, actorId) {
        privilege_data.private_privilages(req.user.sub, getp.id, actorId, function (err, userId, flag) {
          if (flag) cb(err); else cb(helpers.invalid_privileges());
        })
      })
    },

    // 3. post News
    function (cb) {
      private_data.post_news(getp.itemId, req.body, cb);
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

exports.newsDelete = function (req, res) {
  var getp = req.query;

  async.waterfall([

    // 1. make sure Group ID, News ID are valid
    function (cb) {
      if (!ObjectID.isValid(getp.id) || !ObjectID.isValid(getp.itemId)) {
        cb(helpers.no_such_item());
        return;
      }
      cb(null);
    },

    // 2. validate Privilages
    function (cb) {
      private_data.member_id_by_news_id(getp.itemId, function (err, actorId) {
        privilege_data.private_privilages(req.user.sub, getp.id, actorId, function (err, userId, flag) {
          if (flag) cb(err); else cb(helpers.invalid_privileges());
        })
      })
    },

    // 3. delete News
    function (cb) {
      private_data.delete_news(getp.id, getp.itemId, cb);
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

exports.commentPut = function (req, res) {
  var getp = req.query;

  async.waterfall([

    // 1. make sure Group ID, News ID, News Data are valid
    function (cb) {
      if (!ObjectID.isValid(getp.id) || !ObjectID.isValid(getp.itemId) || !req.body) {
        cb(helpers.no_such_item());
        return;
      }
      cb(null);
    },

    // 2. validate Privilages
    function (cb) {
      privilege_data.privilages(req.user.sub, getp.id, 3, function (err, userId, flag) {
        if (flag && req.body.actorId==userId) cb(err, userId); else cb(helpers.invalid_privileges());
      })
    },

    // 3. put Comment
    function (userId: string, cb) {
      private_data.put_comment(getp.id, getp.itemId, req.body, function (err, newsId) {
        cb(err, newsId)
      });
    }

  ],
  function (err, newsId) {
    if (err) {
      helpers.send_failure(res, helpers.http_code_for_error(err), err);
    } else {
      helpers.send_success(res, newsId);
    }
  });

};

exports.commentPost = function (req, res) {
  var getp = req.query;

  async.waterfall([

    // 1. make sure Group ID, News ID, Comment ID, News Data are valid
    function (cb) {
      if (!ObjectID.isValid(getp.id) || !ObjectID.isValid(getp.itemId) || !ObjectID.isValid(getp.commentId) || !req.body) {
        cb(helpers.no_such_item());
        return;
      }
      cb(null);
    },

    // 2. validate Privilages
    function (cb) {
      private_data.comment_id_by_news_id(getp.itemId, getp.commentId, function (err, actorId) {
        privilege_data.private_privilages(req.user.sub, getp.id, actorId, function (err, userId, flag) {
          if (flag) cb(err); else cb(helpers.invalid_privileges());
        })
      })
    },

    // 3. update Comment
    function (cb) {
      private_data.post_comment(getp.commentId, getp.itemId, req.body, cb);
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

exports.commentDelete = function (req, res) {
  var getp = req.query;

  async.waterfall([

    // 1. make sure Group ID, News ID, Comment ID are valid
    function (cb) {
      if (!ObjectID.isValid(getp.id) || !ObjectID.isValid(getp.itemId) || !ObjectID.isValid(getp.commentId)) {
        cb(helpers.no_such_item());
        return;
      }
      cb(null);
    },

    // 2. validate Privilages
    function (cb) {
      private_data.comment_id_by_news_id(getp.itemId, getp.commentId, function (err, actorId) {
        privilege_data.private_privilages(req.user.sub, getp.id, actorId, function (err, userId, flag) {
          if (flag) cb(err); else cb(helpers.invalid_privileges());
        })
      })
    },

    // 3. delete Comment
    function (cb) {
      private_data.delete_comment(getp.commentId, getp.itemId, cb);
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

// ************** ************** **************
// ************** ************** **************
// ************** Group Meetings **************
// ************** ************** **************
// ************** ************** **************

exports.meetings = function (req, res) {
  var getp = req.query;
  var type = parseInt(getp.type);

  async.waterfall([

    // 1. make sure Group ID is valid
    function (cb) {
      if (!ObjectID.isValid(getp.id)) {
        cb(helpers.no_such_item());
        return;
      }
      cb(null);
    },

    // 2. validate Privilages
    function (cb) {
      if (!req.user) {
        cb(null, false);
      } else {
        privilege_data.privilages(req.user.sub, getp.id, 3, function (err, userId, flag) {
          // if (flag) cb(err, flag); else cb(helpers.invalid_privileges());
          cb(err, flag)
        })
      }
    },

    // 3. get Meetings
    function (flag: boolean, cb) {
      private_data.group_meetings(type, flag, getp.id, function (err, meetingsItems) {
        cb(err, meetingsItems)
      })
    }

  ],
  function (err, meetingsItems) {
    if (err) {
      helpers.send_failure(res, helpers.http_code_for_error(err), err);
    } else {
      helpers.send_success(res, meetingsItems);
    }
  });
};

exports.meetingsPut = function (req, res) {
  var getp = req.query;

  async.waterfall([

    // 1. make sure Group ID, Meetings Settings, Meetings List are valid
    function (cb) {
      if (!ObjectID.isValid(getp.id) || !req.body.settings || !req.body.meetings) {
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

    // 3. put Meetings Schedule
    function (userId: string, cb) {
      private_data.put_meetings(getp.id, userId, req.body.settings, req.body.meetings, function (err, meetingId) {
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

exports.meetingsDelete = function (req, res) {
  var getp = req.query;
  var meetingId = parseInt(getp.meetingId);

  async.waterfall([

    // 1. make sure Group ID and Meeting ID are valid
    function (cb) {
      if (!ObjectID.isValid(getp.id) || meetingId==null) {
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

    // 3. delete Meetings Schedule
    function (userId: string, cb) {
      private_data.delete_meetings(getp.id, userId, meetingId, cb);
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

exports.meetingPut = function (req, res) {
  var getp = req.query;

  async.waterfall([

    // 1. make sure Group ID, Meeting Data are valid
    function (cb) {
      if (!ObjectID.isValid(getp.id) || !req.body.meeting) {
        cb(helpers.no_such_item());
        return;
      }
      cb(null);
    },

    // 2. validate Privilages
    function (cb) {
      privilege_data.private_privilages(req.user.sub, getp.id, req.body.meeting.presenter._id, function (err, userId, flag) {
        if (flag) cb(err, userId); else cb(helpers.invalid_privileges());
      })
    },

    // 3. put Meeting
    function (userId: string, cb) {
      private_data.put_meeting_single(req.body.meeting, getp.id, userId, cb);
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

exports.meetingPost = function (req, res) {
  var getp = req.query;
  var type = parseInt(getp.type);
  var meetingId = parseInt(getp.meetingId);

  async.waterfall([

    // 1. make sure the Group ID, Meeting ID, Type are valid
    function (cb) {
      if (!ObjectID.isValid(getp.id) || meetingId==null || type==null) {
        cb(helpers.no_such_item());
        return;
      }
      cb(null);
    },

    // 2. validate Privilages
    function (cb) {
      private_data.member_id_by_meeting_id(getp.id, meetingId, 0, function (err, presenterId) {
        privilege_data.private_privilages(req.user.sub, getp.id, presenterId, function (err, userId, flag) {
          if (flag) cb(err, userId); else cb(helpers.invalid_privileges());
        })
      })
    },

    // 3. update Single Meeting
    function (userId: string, cb) {
      private_data.post_meeting_single(getp.id, userId, meetingId, type, cb);
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

exports.meetingDelete = function (req, res) {
  var getp = req.query;
  var type = parseInt(getp.type);
  var meetingId = parseInt(getp.meetingId);

  async.waterfall([

    // 1. make sure Group ID, Meeting ID, Type are valid
    function (cb) {
      if (!ObjectID.isValid(getp.id) || meetingId==null || type==null) {
        cb(helpers.no_such_item());
        return;
      }
      cb(null);
    },

    // 2. validate Privilages
    function (cb) {
      private_data.member_id_by_meeting_id(getp.id, meetingId, type, function (err, presenterId) {
        privilege_data.private_privilages(req.user.sub, getp.id, presenterId, function (err, userId, flag) {
          if (flag) cb(err, userId); else cb(helpers.invalid_privileges());
        })
      })
    },

    // 3. delete Single Meeting
    function (userId: string, cb) {
      private_data.delete_meeting_single(getp.id, userId, meetingId, type, cb);
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

exports.meetingSchedule = function () {
  private_data.meetingsScheduler();
};

// ************** ************** **************
// ************** ************** **************
// ************** Group Reports ***************
// ************** ************** **************
// ************** ************** **************

exports.reports = function (req, res) {
  var getp = req.query;

  async.waterfall([

    // 1. make sure Group ID is valid
    function (cb) {
      if (!ObjectID.isValid(getp.id)) {
        cb(helpers.no_such_item());
        return;
      }
      cb(null);
    },

    // 2. validate Privilages
    function (cb) {
      privilege_data.privilages(req.user.sub, getp.id, 3, function (err, userId, flag) {
        if (flag) cb(err); else cb(helpers.invalid_privileges());
      })
    },

    // 3. get Reports
    function (cb) {
      group_data.group_items_ids("reportsItems", getp.id, function (err, reportsItems) {
        cb(err, reportsItems)
      })
    }

  ],
  function (err, reportsItems) {
    if (err) {
      helpers.send_failure(res, helpers.http_code_for_error(err), err);
    } else {
      helpers.send_success(res, reportsItems);
    }
  });
};

exports.reportsPut = function (req, res) {
  var getp = req.query;

  async.waterfall([

    // 1. make sure group ID, Report Settings, Date are valid
    function (cb) {
      if (!ObjectID.isValid(getp.id) || !req.body.settings || !req.body.date) {
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

    // 3. put Reports Schedule
    function (userId: string, cb) {
      private_data.put_reports(userId, getp.id, req.body.settings, req.body.date, function (err, reportId) {
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

exports.reportsPost = function (req, res) {
  var getp = req.query;

  async.waterfall([

    // 1. make sure Group ID, Report Settings are valid
    function (cb) {
      if (!ObjectID.isValid(getp.id) || !req.body.settings) {
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

    // 3. update Future Reports Schedule
    function (userId: string, cb) {
      private_data.post_reports(getp.id, userId, req.body.settings, function (err, reportId) {
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

exports.reportsDelete = function (req, res) {
  var getp = req.query;

  async.waterfall([

    // make sure the Group ID is valid
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
        if (flag) cb(err, userId); else cb(helpers.invalid_privileges());
      })
    },

    // 3. delete Reports Schedule
    function (userId: string, cb) {
      private_data.delete_reports(getp.id, userId, cb);
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

exports.reportPost = function (req, res) {
  // GROUP ADMINS for Finalize, Cancel or Change current report
  var getp = req.query;
  var type = parseInt(getp.type);

  async.waterfall([

    // make sure Group ID, Report Data, Type are valid
    function (cb) {
      if (!ObjectID.isValid(getp.id) || !req.body.report || type==null) {
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

    // 3. update Current Report
    function (userId: string, cb) {
      private_data.post_report_single(req.body.report, getp.id, userId, type, cb);
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

exports.reportPut = function (req, res) {
  var getp = req.query;

  async.waterfall([

    // make sure Group ID, Title, File are valid
    function (cb) {
      if (!ObjectID.isValid(getp.id) || !req.body.title || !req.body.current || !req.body.next || !req.body.delay || !req.body.file) {
        cb(helpers.no_such_item());
        return;
      }
      cb(null);
    },

    // 2. validate Privilages
    function (cb) {
      privilege_data.privilages(req.user.sub, getp.id, 3, function (err, userId, flag) {
        if (flag) cb(err, userId); else cb(helpers.invalid_privileges());
      })
    },

    // 3. put Report Submit
    function (userId: string, cb) {
      private_data.put_report_submit(req.body.title, req.body.current, req.body.next, req.body.delay, req.body.file, getp.id, userId, function (err, itemId) {
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

exports.reportDelete = function (req, res) {
  var getp = req.query;
  var type = parseInt(getp.type);

  async.waterfall([

    // 1. make sure Group ID, Type are valid
    function (cb) {
      if (!ObjectID.isValid(getp.id) || type==null) {
        cb(helpers.no_such_item());
        return;
      }
      cb(null);
    },

    // 2. validate Privilages
    function (cb) {
      privilege_data.privilages(req.user.sub, getp.id, 3, function (err, userId, flag) {
        if (flag) cb(err, userId); else cb(helpers.invalid_privileges());
      })
    },

    // 3. update Current Report
    function (userId: string, cb) {
      private_data.delete_report_submit(getp.id, userId, type, cb);
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

exports.reportRemind = function (req, res) {
  var getp = req.query;

  async.waterfall([

    // 1. make sure Group ID, IDs list are valid
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
        if (flag) cb(err, userId); else cb(helpers.invalid_privileges());
      })
    },

    // 3. update Current Report
    function (userId: string, cb) {
      private_data.put_report_remind(req.body, userId, getp.id, cb)
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

exports.reportFinalize = function (req, res) {
  var getp = req.query;

  async.waterfall([

    // 1. make sure Group ID, Reports List are valid
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

    // 3. update Current Report
    function (cb) {
      private_data.put_report_finalize(req.body, getp.id, function (err, reportsIds) {
        cb (err, reportsIds);
      });
    }

  ],
  function (err, reportsIds) {
    if (err) {
      helpers.send_failure(res, helpers.http_code_for_error(err), err);
    } else {
      helpers.send_success(res, reportsIds);
    }
  });
};

exports.reportSchedule = function () {
  private_data.reportScheduler();
};

// ************** ************** **************
// ************** ************** **************
// *************** Personal Info **************
// ************** ************** **************
// ************** ************** **************

exports.personalInfo = function (req, res) {
  var getp = req.query;

  async.waterfall([

    // 1. make sure Parent ID, People ID is valid
    function (cb) {
      if (!ObjectID.isValid(getp.id) || !getp.peopleId) {
        cb(helpers.no_such_item());
        return;
      }
      cb(null);
    },

    // 2. validate Privilages
    function (cb) {
      privilege_data.privilages(req.user.sub, getp.id, 3, function (err, userId, flag) {
        if (flag) cb(err); else cb(helpers.invalid_privileges());
      })
    },

    // 2. retrieve People Personal Info
    function (cb) {
      peoples_data.people_info(getp.peopleId, "personalInfo", function (err, info) {
        cb (err, info);
      });
    }

  ],
  function (err, info) {
    if (err) {
      helpers.send_failure(res, helpers.http_code_for_error(err), err);
    } else {
      helpers.send_success(res, info.personalInfo);
    }
  });

};

exports.personalInfoPost = function (req, res) {
  var getp = req.query;
  var type = parseInt(getp.type);

  async.waterfall([

    // 1. make sure Personal Info Data, Info Type are valid
    function (cb) {
      if (!req.body || type==null) {
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

    // 3. post User Info
    function (userId: string, cb) {
      private_data.post_info(req.body, userId, type, function (err, kidsIds) {
        cb (err);
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
