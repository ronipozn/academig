var db = require('../db.ts'),
    async = require('async'),
    backhelp = require("./backend_helpers.ts");

var group_create_data = require("../data/groups_create.ts");
var department_data = require("../data/departments.ts");
var university_data = require("../data/universities.ts");
var shared_data = require("../data/shared.ts");

import {CreateGroup} from '../models/groups.ts';

var ObjectID = require('mongodb').ObjectID;

export function contests_list(callback) {
  db.contests.find().project().toArray(callback);
}

export function contestPost(config: any, callback) {
  async.waterfall([

    // 1. validate data.
    function (cb) {
      console.log('config',config)
      try {
        const reqFields: string[] = [ "title", "deadline", "amount", "prizes", "pics" ];
        backhelp.verify(config, reqFields);
      } catch (e) {
        cb(e);
        return;
      }
      cb(null, config);
    },

    // 2. post current Contest document
    function (config_data, cb) {
      if (ObjectID.isValid(config_data._id)) {
        db.contests.updateOne(
          { _id: ObjectID(config_data._id) },
          { $set: {
              "title": config_data.title,
              "deadline": config_data.deadline,
              "amount": config_data.amount,
              "prizes": config_data.prizes,
              "pics": config_data.pics,
            }
          },
          { safe: true },
          cb(null, config_data._id)
        );
      } else {
        db.contests.insertOne(
          {
            "title": config_data.title,
            "deadline": config_data.deadline,
            "amount": config_data.amount,
            "prizes": config_data.prizes,
            "pics": config_data.pics,
            "status": 0 // 0 - created
                        // 1 - started
                        // 2 - ended
                        // 3 - archive
          },
          { w: 1, safe: true }, function(err, docsInserted) {
            cb(null, docsInserted.insertedId);
          }
        );
      }
    }

  ],
  function (err, contestId) {
    if (err) {
      callback(err);
    } else {
      callback(err, err ? null : contestId);
    }
  });
};

export function contestAction(contestId: string, status: number, callback) {
  if (status==1 || status==2 || status==3) { // START or END or ARCHIVE
    db.contests.updateOne(
      { _id: ObjectID(contestId) },
      { $set: { "status": status } },
      { safe: true },
      callback()
    );
  } else {
    callback()
  }
};

export function contestAdd(groupId: string, callback) {
  db.contests.updateOne(
    { status: 1 },
    { $push: { "groupsIds": ObjectID(groupId) } },
    { safe: true },
    callback()
  );
};

export function contestFlag(groupId: string, callback) {
  db.contests.find({ status: 1, groupsIds: groupId })
             .project({ title: 1, deadline: 1, amount: 1, prizes: 1, pics: 1 })
             .next(callback);
};

export function contestDetails(callback) {
  db.contests.find({ status: 1 })
             .project({ title: 1, deadline: 1, amount: 1, prizes: 1, pics: 1 })
             .next(callback);
};

export function contestGroupsList(groupsIds: string, callback) {
  db.contests.find({ status: 1, groupsIds: { $in: groupsIds } })
             .project( { "groupsIds.$": 1, title: 1, deadline: 1, amount: 1, prizes: 1, pics: 1 } )
             .next(callback);
};
