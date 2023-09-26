var helpers = require('./helpers.ts');
var async = require("async");

var contests_data = require("../data/contests.ts");

var emails = require("../misc/emails.ts");

import { objectMini, objectMiniEmail, groupComplex, complexName, Period } from '../models/shared.ts';

var ObjectID = require('mongodb').ObjectID;

exports.version = "0.1.0";

exports.contests = function (req, res) {
  contests_data.contests_list(function (err, contests) {
    if (err) {
      helpers.send_failure(res, 500, err);
      return;
    }
    helpers.send_success(res, contests);
  });
}

exports.contestPost = function (req, res) {
  var getp = req.query;

  contests_data.contestPost(req.body.config, function (err, contestId) {
    if (err) {
      helpers.send_failure(res, 500, err);
      return;
    }
    helpers.send_success(res, contestId);
  });
}

exports.contestAction = function (req, res) {
  var getp = req.query;
  var status = parseInt(getp.status);

  contests_data.contestAction(getp.id, status, function (err) {

    switch (status) {
      case 0: { // START - Challenge Announcement
        // Email all users
        // Instructions, Duration, Prizes
        break;
      }
      case 1: { // END - Challenge End (stop contest)
        // Email all participating labs members
        // Explain when Prizes will be anonunced
        break;
      }
      case 2: { // ARCHIVE
        break;
      }
    };

    if (err) {
      helpers.send_failure(res, 500, err);
      return;
    }
    helpers.send_success(res, null);
  });
}

exports.contestReminder = function (req, res) {
  // 1. Email (again) all users

  // Email participating labs members
  // 2. Deadline Reminder
  // 3. Suggestions for more points
  // 4. Encouragement
}

exports.newItem = function (req, res) {
  // New point item => email all lab members
}
