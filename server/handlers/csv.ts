var helpers = require('./helpers.ts');
var async = require("async");

var csv_data = require("../data/csv.ts");
var privilege_data = require("../data/privileges.ts");
var pics_data = require("../data/pics.ts");
var university_data = require("../data/universities.ts");

var ObjectID = require('mongodb').ObjectID;

exports.csvParse = function (req, res) {
  var getp = req.query;
  var mode = parseInt(getp.mode);

  async.waterfall([

    // 1. make sure () valid
    function (cb) {
      if (!req.body.file || (!req.body.id && mode==1) || (!req.body.university && mode==2) || (!req.body.department && mode==2) || mode==null) {
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

    // 3. read
    function (userId: string, cb) {
      csv_data.get_csv(req.body.file, function (err, csvBody) {
        // pics.delete_pic_direct(req.body.file, function(err) {
          cb(err, csvBody)
        // })
      });
    },

    // 4. parse CSV & Build
    function (csvBody, cb) {
      if (mode==0) { // Create UNIVERSITIES
        // csv_data.parse_csv_universities(csvBody, function (err) {
        csv_data.parse_csv_universities_recipe(csvBody, function (err) {
          cb(err, null)
        });
      } else if (mode==1) { // Create DEPARTMENTS
        university_data.university_details(ObjectID(req.body.id), 2, function (err, university) {
          csv_data.parse_csv_departments(csvBody, university, function (err) {
            cb(err, null)
          });
        });
      } else if (mode==2) { // Create LABS
        csv_data.parse_csv_labs(csvBody, req.body.university, req.body.department, function (err) {
          cb(err, null)
        });
      } else if (mode==3) { // Create PUBLICATION
        console.log("Create PUBLICATION")
        // csv_data.parse_csv_publication(csvBody, function (err, status) {
        csv_data.parse_csv_publication_recipe(csvBody, function (err, statusArr) {
          cb(err, statusArr)
        });
      } else if (mode==4) { // Create TRENDS
        csv_data.parse_csv_trends(csvBody, function (err, statusArr) {
          cb(err, statusArr)
        });
      } else if (mode==5) { // Create PODCASTS
        csv_data.parse_csv_podcasts(csvBody, function (err, statusArr) {
          cb(err, statusArr)
        });
      } else if (mode==6) { // Create EVENTS
        csv_data.parse_csv_events(csvBody, function (err, statusArr) {
          cb(err, statusArr)
        });
      } else if (mode==7) { // Create APPS
        csv_data.parse_csv_apps(csvBody, function (err, statusArr) {
          cb(err, statusArr)
        });
      } else if (mode==8) { // Create COURSES
        // csv_data.parse_csv_courses(csvBody, function (err, statusArr) {
        //   cb(err, statusArr)
        // });
      } else if (mode==9) { // Create JOURNALS
        // csv_data.parse_csv_journals(csvBody, function (err, statusArr) {
        //   cb(err, statusArr)
        // });
      }
    },

    // 5. delete CSV
    function (statusArr: any[], cb) {
      pics_data.delete_pic_direct(req.body.file, function (err) {
        cb(err, statusArr)
      });
    }

  ],
  function (err, statusArr: any[]) {
    if (err) {
      helpers.send_failure(res, helpers.http_code_for_error(err), err);
    } else {
      helpers.send_success(res, statusArr);
    }
  });
}
