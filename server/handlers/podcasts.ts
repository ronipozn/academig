var helpers = require('./helpers.ts');
var async = require("async");

var podcast_data = require("../data/podcasts.ts");
var people_data = require("../data/peoples.ts");
var privilege_data = require("../data/privileges.ts");

var ObjectID = require('mongodb').ObjectID;

exports.version = "0.1.0";

exports.podcastsByIds = function (req, res) {
  // var getp = req.query;
  async.waterfall([
    // 1. validate Privilages
    function (cb) {
      privilege_data.privilages(req.user.sub, null, 10, function (err, userId, flag) {
        if (flag) cb(err, userId); else cb(helpers.invalid_privileges());
      })
    },

    // 2. get followings IDs
    function (userId: string, cb) {
      people_data.get_followings_ids(40, userId, null, function (err, followingsIds) {
        cb(err, followingsIds);
      });
    },

    // 3. Podcasts List
    function (followingsIds, cb) {
      podcast_data.podcasts_list(followingsIds, followingsIds, function (err, podcasts) {
        cb(err, podcasts)
      })
    }

  ],
  function (err, podcasts) {
    if (err) {
      helpers.send_failure(res, helpers.http_code_for_error(err), err);
    } else {
      helpers.send_success(res, podcasts);
    }
  });
}

exports.podcastDataByURL = function (req, res) {
  var getp = req.params;

  async.waterfall([

    // 1. get Podcast ID
    function (cb) {
      console.log('POD1')
      podcast_data.podcast_id(getp.podcast, function (err, podcastId) {
        if (podcastId==null) {
          cb("No such podcast", null);
        } else {
          cb(null, podcastId);
        }
      });
    },

    // 2. get user ID (Flag)
    function (podcastId: string, cb) {
      console.log('POD2')
      if (!req.user) {
        cb(null, null, podcastId);
      } else {
        privilege_data.privilages(req.user.sub, null, 10, function (err, userId, flag) {
          cb(null, userId, podcastId);
        })
      }
    },

    // 3. get followings IDs
    function (userId: string, podcastId: string, cb) {
      console.log('POD3')
      people_data.get_followings_ids(40, userId, null, function (err, followingsIds) {
        cb(err, podcastId, followingsIds);
      });
    },

    // 4. get Podcast details
    function (podcastId: string, followingsIds: string[], cb) {
      console.log('POD4')
      podcast_data.podcast_details(podcastId, followingsIds, function (err, podcast) {
        cb(err, podcast);
        // cb(err, podcastId, podcast);
      });
    },

    // 5. get Counters
    // function (podcastId: string, podcast, cb) { }

  ],
  function (err, podcast) {
    console.log('POD5')
    if (err) {
      helpers.send_failure(res, helpers.http_code_for_error(err), err);
    } else {
      helpers.send_success(res, podcast);
    }
  });
}

exports.podcastHomePage = function (req, res) {
  var getp = req.query;

  if (!ObjectID.isValid(getp.id)) {
    helpers.send_success(res, []);
    return;
  }

  podcast_data.podcast_home_items(getp.id, function (err, page_items) {
    if (err) {
      helpers.send_failure(res, 500, err);
      return;
    }
    helpers.send_success(res, page_items);
  });
};

exports.podcastDelete = function (req, res) {
  var getp = req.query;

  async.waterfall([

    // make sure Podcast ID is valid
    function (cb) {
      if (!ObjectID.isValid(getp.id)) {
        cb(helpers.no_such_item());
        return;
      }
      cb();
    },

    // delete Podcast
    function (cb) {
      podcast_data.delete_podcast(getp.id, cb);
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
      podcast_data.put_submit_podcast(userId, req.body, function (err) {
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
