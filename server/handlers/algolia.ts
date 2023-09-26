var helpers = require('./helpers.ts');
var async = require("async");

var algolia_data = require("../data/algolia.ts");

var group_data = require("../data/groups.ts");
var people_data = require("../data/peoples.ts");

var publication_data = require("../data/publications.ts");

import { objectMini, objectMiniEmail, groupComplex, complexName, Period } from '../models/shared.ts';

var ObjectID = require('mongodb').ObjectID;

exports.version = "0.1.0";

exports.postAlgolia = function (req, res) {
  var getp = req.query;

  async.waterfall([
    function (cb) {
      switch (parseInt(getp.type)) {
        // case 0: // Universities
        //   algolia_data.add_universities(function (err) {
        //     cb(err);
        //   });
        //   break;
        // case 1: // Departments
        // algolia_data.add_departments(function (err) {
        //   cb(err);
        // });
        //   break;
        case 2: // Labs
        algolia_data.add_labs(function (err) {
          cb(err);
        });
          break;
        case 3: // Researchers
          algolia_data.add_researchers(function (err) {
            cb(err);
          });
          break;
        // case 4: // Projects
        //   algolia_data.add_projects(function (err) {
        //     cb(err);
        //   });
        //   break;
        case 5: // Services
          algolia_data.add_services(function (err) {
            cb(err);
          });
          break;
        default:
          cb(null)
      }
    },
  ],
  function (err) {
    if (err) {
      helpers.send_failure(res, 500, err);
    } else {
      helpers.send_success(res);
    }
  });
}
