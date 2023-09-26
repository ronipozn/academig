var helpers = require('./helpers.ts');
var async = require("async");

var emails = require("../misc/emails.ts");

// var universities = require('./universities.ts');
// var departments = require('./departments.ts');
var groups_data = require('../data/groups.ts');
var peoples_data = require('../data/peoples.ts');
var privilege_data = require("../data/privileges.ts");
var shared_data = require("../data/shared.ts");
var news_data = require("../data/news.ts");

import { objectMini, groupComplex, complexName, Period } from '../models/shared.ts';

var ObjectID = require('mongodb').ObjectID;

exports.version = "0.1.0";

exports.newsByIds = function (req, res) {
  var getp = req.query;
  var mode = parseInt(getp.mode);

  async.waterfall([

    // 1. make sure Parent ID is valid
    function (cb) {
      if (
          (!ObjectID.isValid(getp.id) && (mode==0 || mode==100 || mode==1 || mode==101 || mode==2 || mode==102 || mode==5 || mode==7 || mode==107 || mode==8 || mode==108 || mode==9 || mode==109))
          ||
          (getp.id==null && (mode==6 || mode==106))
         ) {
        cb(helpers.no_such_item());
        return;
      }
      cb();
    },

    // 2. validate Privilages with conditions
    function (cb) {
      if (mode<=2 || mode>=6) {
        cb(null, null);
      } else if (!req.user) {
        cb(helpers.no_such_item());
      } else if (mode==3 || mode==4) {
        privilege_data.privilages(req.user.sub, null, 10, function (err, userId, flag) {
          cb(err, userId);
        })
      } else if (mode==5) {
        privilege_data.privilages(req.user.sub, getp.id, 3, function (err, userId, flag) {
          if (flag) cb(err, userId); else cb(helpers.invalid_privileges());
        })
      }
    },

    // 3. get News
    function (userId: string, cb) {
      const limit = (mode>=100) ? 3 : 10

      switch (mode) {
        case 0: case 100: // University News / Latest
          news_data.news_items(getp.id, null, getp.offset, limit, 'timeline', function (err, news) { // 'university'
            cb (err, news);
          });
          break;
        case 1: case 101: // Department News / Latest
          news_data.news_items(getp.id, null, getp.offset, limit, 'timeline', function (err, news) { // 'department'
            cb (err, news);
          });
          break;
        case 2: case 102: // Group News / Latest
          news_data.news_items(getp.id, null, getp.offset, limit, 'group', function (err, news) {
            cb (err, news);
          });
          break;
        case 3: // User Wall
          news_data.news_items(userId, null, getp.offset, limit, 'timeline', function (err, news) {
            // console.log("news",news)
            // cb(err, news.filter(r => (r.actor && r.actor._id!=userId) || r.actor==null ||  r.actor==undefined || r.actor._id=='academig'));
            cb (err, news);
          });
          break;
        case 4: // User Notifications
          news_data.notifications_items(userId, getp.offset, 'notification', function (err, notifications) {
            cb (err, notifications);
          });
          break;
        case 5: // Group Tools
          news_data.news_items(getp.id, null, getp.offset, limit, 'private', function (err, news) {
            cb (err, news);
          });
          break;
        case 6: case 106: // Profile News / Latest
          news_data.news_items(getp.id, null, getp.offset, limit, 'user', function (err, news) {
            cb (err, news);
          });
          break;
        case 7: case 107: // Podcasts / Latest
          news_data.news_items(getp.id, null, getp.offset, limit, 'podcast', function (err, news) {
            cb (err, news);
          });
          break;
        case 8: case 108: // Events / Latest
          news_data.news_items(getp.id, null, getp.offset, limit, 'event', function (err, news) {
            cb (err, news);
          });
          break;
        case 9: case 109: // Apps / Latest
          news_data.news_items(getp.id, null, getp.offset, limit, 'app', function (err, news) {
            cb (err, news);
          });
          break;
      }
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

exports.newsPut = function (req, res) {
  var getp = req.query;
  var news = req.body;

  var mode = parseInt(getp.mode);

  async.waterfall([

    // 1. make sure Parent ID, News Item Text are valid
    function (cb) {
      if (
          (mode!=3 && !ObjectID.isValid(getp.id) ||
          (mode==3 && !getp.id)) || !news.text ||
          mode<0 || mode>9
         ) {
        cb(helpers.no_such_item());
        return;
      }
      cb();
    },

    // 2. validate Privilages
    function (cb) {
      var privilageMode: number;

      switch (mode) {
        case 0: privilageMode = 0; break; // groups
        case 1: privilageMode = 40; break; // projects
        case 2: privilageMode = 50; break; // resources
        case 3: privilageMode = 10; break; // peoples
        case 4: privilageMode = 10; break; // department
        case 5: privilageMode = 10; break; // university
        case 7: privilageMode = 10; break; // podcast
        case 8: privilageMode = 10; break; // event
        case 9: privilageMode = 10; break; // app
      }

      privilege_data.privilages(req.user.sub, getp.id, privilageMode, function (err, userId, flag) {
        if (flag) cb(err, userId); else cb(helpers.invalid_privileges());
      })

    },

    // 2. put News
    function (userId: string, cb) {
      if (mode==0) {
        news_data.add_group_activity(userId, 20000, getp.id, getp.id, getp.id, null, news.text, null, news.pic, 3, function (err, newsId) {
          cb(err, userId, newsId)
        })
      } else {
        news_data.add_activity(mode, userId, 20000, getp.id, getp.id, getp.id, [], news.text, news.link, news.pic, false, function (err, newsId) {
          cb(err, userId, newsId)
        })
      }
    },

    // 3. update Progress
    function (userId: string, newsId: string, cb) {
      if (mode==0 || mode==3) {
        shared_data.post_progress((mode==3) ? userId : getp.id, (mode==3) ? 7 : 29, mode, function (err) {
          cb(err, newsId);
        })
      } else {
        cb(null, newsId);
      }
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
  var mode = parseInt(getp.mode);

  async.waterfall([

    // 1. make sure the Parent ID, Mode, News Mode are valid
    function (cb) {
      if ((mode!=3 && !ObjectID.isValid(getp.id)) || mode<0 || mode>5 ||
          !req.body._id || (!req.body.text && !req.body.pic)) {
        cb(helpers.no_such_item());
        return;
      }
      cb();
    },

    // 2. validate Privilages
    function (cb) {
      var privilageMode: number;

      switch (mode) {
        case 0: privilageMode = 0; break; // groups
        case 1: privilageMode = 40; break; // projects
        case 2: privilageMode = 50; break; // resources
        case 3: privilageMode = 10; break; // peoples
        case 4: privilageMode = 10; break; // department
        case 5: privilageMode = 10; break; // university
        case 7: privilageMode = 10; break; // podcast
        case 8: privilageMode = 10; break; // event
        case 9: privilageMode = 10; break; // app
      }

      privilege_data.privilages(req.user.sub, getp.id, privilageMode, function (err, userId, flag) {
        if (flag) cb(err); else cb(helpers.invalid_privileges());
      })

    },

    // 3. post News
    function (cb) {
      news_data.post_activity(req.body._id, req.body.text, req.body.pic, cb);
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

exports.newsDelete = function (req, res) {
  var getp = req.query;
  var mode = parseInt(getp.mode);

  async.waterfall([

    // 1. make sure Parent ID, News ID, News Mode are valid
    function (cb) {
      if ((mode!=3 && !ObjectID.isValid(getp.id)) || !getp.itemId || mode<0 || mode>5) {
        cb(helpers.no_such_item());
        return;
      }
      cb();
    },

    // 2. validate Privilages
    function (cb) {
      var privilageMode: number;

      switch (mode) {
        case 0: privilageMode = 0; break; // groups
        case 1: privilageMode = 40; break; // projects
        case 2: privilageMode = 50; break; // resources
        case 3: privilageMode = 10; break; // peoples
        case 4: privilageMode = 10; break; // department
        case 5: privilageMode = 10; break; // university
        case 7: privilageMode = 10; break; // podcast
        case 8: privilageMode = 10; break; // event
        case 9: privilageMode = 10; break; // app
      }

      privilege_data.privilages(req.user.sub, getp.id, privilageMode, function (err, userId, flag) {
        if (flag) cb(err, userId); else cb(helpers.invalid_privileges());
      })
    },

    // 3. delete News
    function (userId: string, cb) {
      news_data.delete_activity(getp.itemId, (mode==3) ? userId : getp.id, mode, cb);
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
