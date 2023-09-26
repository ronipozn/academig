var db = require("../db.ts"),
  async = require("async"),
  backhelp = require("./backend_helpers.ts");

var ObjectID = require("mongodb").ObjectID;

var groups = require("./groups.ts");
var peoples = require("./peoples.ts");
var news = require("./news.ts");

const algoliasearch = require("algoliasearch");
const client = algoliasearch("TDKUK8VW4T", "5d17934a8722069c0ac47bd6b4ae4bda");
const algoliaIndex = process.env.PORT
  ? client.initIndex("labs")
  : client.initIndex("dev_labs");

import { OpenPositionApply } from "../models/positions.ts";
import { groupComplex, objectMiniEmail } from "../models/shared.ts";

var emails = require("../misc/emails.ts");

var moment = require("moment");

var stripe = require("stripe")("ENV_STRIPE");

exports.version = "0.1.0";

export function put_position(
  userId: string,
  groupId: string,
  adminFlag: boolean,
  data,
  callback
) {
  var data_clone;

  async.waterfall(
    [
      function (cb) {
        try {
          const reqFields: string[] = ["title", "description"];
          backhelp.verify(data, reqFields);
        } catch (e) {
          cb(e);
          return;
        }
        cb(null, data);
      },

      // 1. extract group complex
      function (position_data, cb) {
        console.log("P1");
        groups.get_group_algolia(groupId, function (err, item) {
          cb(
            err,
            item.groupIndex,
            item.country,
            item.state,
            item.city,
            item.location,
            position_data
          );
        });
      },

      // 2B. create Position document
      function (
        group: groupComplex,
        country: string,
        state: string,
        city: string,
        location: number[],
        position_data,
        cb
      ) {
        console.log("P2");
        data_clone = JSON.parse(JSON.stringify(position_data));

        createPositionDocument(
          data_clone,
          groupId,
          group,
          country,
          state,
          city,
          location,
          adminFlag,
          function (err, positionId) {
            cb(null, positionId);
          }
        );
      },

      // 3. insert Position ID to Group
      function (positionId, cb) {
        console.log("P3");
        db.groups.updateOne(
          { _id: ObjectID(groupId) },
          {
            $push: { "positionsItems.positionsIds": positionId },
            $set: { "progress.16": 1 },
          },
          { safe: true },
          cb(null, positionId)
        );
      },

      // 4. insert Position ID to Projects Positions List
      function (positionId, cb) {
        console.log("P4");
        if (data_clone.projects) {
          db.projects.updateMany(
            { _id: { $in: data_clone.projects.map((r) => ObjectID(r._id)) } },
            { $push: { positionsIds: ObjectID(positionId) } },
            { multi: true, safe: true },
            cb(null, positionId)
          );
        } else {
          cb(null, positionId);
        }
      },

      // 5. push News
      function (positionId, cb) {
        console.log("P5");
        if (!userId || (adminFlag && data_clone.ai)) {
          cb(null, positionId);
        } else {
          push_news(
            userId,
            positionId,
            groupId,
            data_clone.description,
            data_clone.spotsAvailable,
            data_clone.stepsDates,
            function (err) {
              cb(err, positionId);
            }
          );
        }
      },
    ],
    function (err, positionId) {
      callback(err, err ? null : positionId);
    }
  );
}

export function post_position_notify(
  stripeId: string,
  subscriptionId: string,
  itemId: string,
  callback
) {
  console.log("post_position_notify", stripeId);

  async.waterfall(
    [
      // 1. retrieve Group data
      function (cb) {
        groups.group_notify_details(
          stripeId,
          function (
            err,
            groupIndex,
            country,
            state,
            city,
            location,
            stage,
            userId,
            pro,
            interview,
            club
          ) {
            cb(err, groupIndex, stage, userId, pro, interview, club);
          }
        );
      },

      // 2. get hash associated with User ID
      function (
        groupIndex: groupComplex,
        groupStage: number,
        userId: string,
        pro: boolean,
        interview: boolean,
        club: boolean,
        cb
      ) {
        db.hash
          .find({ userId: userId })
          .project({ hash: 1 })
          .next()
          .then(function (item) {
            cb(
              null,
              item ? item.hash : null,
              groupIndex,
              groupStage,
              userId,
              pro,
              interview,
              club
            );
          });
      },

      // 3. retrieve User Email, Name
      function (
        hash: string,
        groupIndex: groupComplex,
        groupStage: number,
        userId: string,
        pro: boolean,
        interview: boolean,
        club: boolean,
        cb
      ) {
        db.peoples
          .find({ _id: userId })
          .project({ stage: 1, name: 1, "personalInfo.email": 1 })
          .next()
          .then(function (item) {
            cb(
              null,
              item.stage,
              item.name,
              item.personalInfo.email,
              hash,
              groupIndex,
              groupStage,
              userId,
              pro,
              interview,
              club
            );
          });
      },

      // 4. retrieve Position data && set payment_flag=true
      function (
        userStage: number,
        userName: string,
        userEmail: string,
        hash: string,
        groupIndex: groupComplex,
        groupStage: number,
        userId: string,
        pro: boolean,
        interview: boolean,
        club: boolean,
        cb
      ) {
        const groupId: string = groupIndex.group._id;

        db.positions.findOneAndUpdate(
          { _id: ObjectID(itemId), groupId: ObjectID(groupId) },
          {
            $set: {
              payment: true,
              subId: subscriptionId,
            },
          },
          {
            projection: {
              created_on: 1,
              standout: 1,
              position: 1,
              title: 1,
              type: 1,
              description: 1,
              spotsAvailable: 1,
              contractLength: 1,
              contractLengthType: 1,
              stepsDates: 1,
              stepsEnables: 1,
              tags: 1,
              filter: 1,
            },
          },
          function (err, doc) {
            const data = doc.value;
            console.log("groupIndex", groupIndex);
            console.log("itemId", itemId);
            // console.log('data',data)

            if (groupStage == 2) {
              // Lab is approved
              algoliaIndex.getObject(groupId, (err, content) => {
                if (content) {
                  const stepsDates = data.stepsDates
                    ? data.stepsDates
                    : [null, null, null, null, null, null, null, null, null];
                  const stepsEnables = data.stepsEnables
                    ? data.stepsEnables
                    : [false, false];
                  const object = {
                    _id: itemId,
                    mode: 1, // 0: On Hold, 1: Active, 2: Expired
                    created_on: data.created_on,
                    standout: data.standout,
                    position: data.position,
                    positionName: peoples.titlesTypes(data.position),
                    title: data.title,
                    type: data.type,
                    description: data.description,
                    spotsAvailable: data.spotsAvailable,
                    contractLength: data.contractLength,
                    contractLengthType: data.contractLengthType,
                    stepsDates: stepsDates,
                    stepsEnables: stepsEnables,
                    tags: data.tags,
                    // grades, letters, referees
                  };
                  if (data.standout == 3) object["pin"] = 1;
                  if (content.positions) content.positions.push(object);
                  else content.positions = [object];
                  algoliaIndex.partialUpdateObject(
                    {
                      objectID: groupId,
                      positions: content.positions,
                    },
                    (err, content) => {
                      cb(
                        err,
                        userStage,
                        userName,
                        userEmail,
                        hash,
                        groupIndex,
                        groupStage,
                        userId,
                        data.standout,
                        data.filter,
                        pro,
                        interview,
                        club
                      );
                    }
                  );
                } else {
                  cb(
                    err,
                    userStage,
                    userName,
                    userEmail,
                    hash,
                    groupIndex,
                    groupStage,
                    userId,
                    data.standout,
                    data.filter,
                    pro,
                    interview,
                    club
                  );
                }
              });
            } else {
              cb(
                err,
                userStage,
                userName,
                userEmail,
                hash,
                groupIndex,
                groupStage,
                userId,
                data.standout,
                data.filter,
                pro,
                interview,
                club
              );
            }
          }
        );
      },

      // 5. send Email
      function (
        userStage: number,
        userName: string,
        userEmail: string,
        hash: string,
        groupIndex: groupComplex,
        groupStage: number,
        userId: string,
        standout: boolean,
        filter: boolean,
        pro: boolean,
        interview: boolean,
        club: boolean,
        cb
      ) {
        var host: string;
        var type: number;

        const groupName: string = groupIndex.group.name;
        const groupLink: string =
          groupIndex.university.link +
          "/" +
          groupIndex.department.link +
          "/" +
          groupIndex.group.link;

        if (userStage > 0) {
          // User Exist
          if (groupStage == 2) {
            // Lab Exist && Approved
            type = 0;
            console.log("confirmJobEmail");
          } else {
            // New Lab
            type = 1;
            console.log("verificationJobEmail"); // emails.verificationJobEmail
          }
        } else {
          // User Not Exist
          type = 2;
          console.log("signupJobEmail"); // emails.signupJobEmail
        }

        emails.confirmJobEmail(
          type,
          host,
          hash,
          itemId,
          groupLink,
          groupName,
          userEmail,
          userName,
          standout,
          type == 0 ? null : pro,
          filter,
          type == 0 ? null : interview,
          type == 0 ? null : club,
          function (err) {
            cb(err);
          }
        );
      },
    ],
    function (err) {
      callback(err);
    }
  );
}

export function post_position(
  userId: string,
  parentId: string,
  positionId: string,
  mode: number,
  callback
) {
  async.waterfall(
    [
      // Put on hold (before submission deadline)
      // 1. update Position Mode (Apply / Can't Apply + Algolia)
      function (cb) {
        db.positions
          .updateOne(
            { _id: ObjectID(positionId) },
            { $set: { mode: mode } },
            { multi: false, safe: true }
          )
          .then(function () {
            algoliaIndex.getObject(parentId, (err, content) => {
              const index = content
                ? content.positions.findIndex((y) => y._id == positionId)
                : -1;
              if (index > -1) {
                content.positions[index].mode = mode;
                algoliaIndex.partialUpdateObject(
                  {
                    objectID: parentId,
                    positions: content.positions,
                  },
                  (err, content) => {
                    cb(err, positionId);
                  }
                );
              } else {
                cb(null, positionId);
              }
            });
          });
      },

      // 2. push Notification
      function (positionId: string, cb) {
        application_notify(userId, null, positionId, 0, mode, function (err) {
          cb(err, positionId);
        });
      },
    ],
    function (err, positionId: string) {
      if (err) {
        callback(err);
      } else {
        callback(err, err ? null : positionId);
      }
    }
  );
}

export function post_general(
  parentId: string,
  positionId: string,
  data,
  callback
) {
  async.waterfall(
    [
      // 1. update Position document
      function (cb) {
        db.positions
          .updateOne(
            { _id: ObjectID(positionId) },
            {
              $set: {
                // "type": data.type,
                site: data.site,
                spotsAvailable: data.spotsAvailable,
                contractLength: data.contractLength,
                contractLengthType: data.contractLengthType,
                internalId: data.internalId,
                salary: data.salary,
                salaryCurrency: data.salaryCurrency,
              },
            },
            { multi: false, safe: true }
          )
          .then(function () {
            algoliaIndex.getObject(parentId, (err, content) => {
              const index = content.positions.findIndex(
                (y) => y._id == positionId
              );
              if (index > -1) {
                content.positions[index].spotsAvailable = data.spotsAvailable;
                content.positions[index].contractLength = data.contractLength;
                content.positions[index].contractLengthType =
                  data.contractLengthType;
                algoliaIndex.partialUpdateObject(
                  {
                    objectID: parentId,
                    positions: content.positions,
                  },
                  (err, content) => {
                    cb(err, positionId);
                  }
                );
              } else {
                cb(err, positionId);
              }
            });
          });
      },
    ],
    function (err, positionId) {
      if (err) {
        callback(err);
      } else {
        callback(err, err ? null : positionId);
      }
    }
  );
}

export function post_letters(positionId: string, data, callback) {
  async.waterfall(
    [
      // 1. update Position document
      function (cb) {
        db.positions.updateOne(
          { _id: ObjectID(positionId) },
          {
            $set: {
              lettersGuidelines: data.lettersGuidelines,
              lettersRequired: data.lettersRequired,
              gradesRequired: data.gradesRequired,
              numReferees: data.numReferees,
            },
          },
          { multi: false, safe: true },
          cb(null, positionId)
        );
      },
    ],
    function (err, positionId) {
      if (err) {
        callback(err);
      } else {
        callback(err, err ? null : positionId);
      }
    }
  );
}

export function post_deadlines(
  positionId: string,
  parentId: string,
  data,
  callback
) {
  async.waterfall(
    [
      // 1. update Position document
      function (cb) {
        db.positions
          .updateOne(
            { _id: ObjectID(positionId) },
            {
              $set: {
                stepsDates: data.stepsDates,
                stepsEnables: data.stepsEnables,
              },
            },
            { multi: false, safe: true }
          )
          .then(function () {
            algoliaIndex.getObject(parentId, (err, content) => {
              const index = content.positions.findIndex(
                (y) => y._id == positionId
              );
              if (index > -1) {
                content.positions[index].stepsDates = data.stepsDates;
                content.positions[index].stepsEnables = data.stepsEnables;
                algoliaIndex.partialUpdateObject(
                  {
                    objectID: parentId,
                    positions: content.positions,
                  },
                  (err, content) => {
                    cb(err, positionId);
                  }
                );
              } else {
                cb(err, positionId);
              }
            });
          });
      },
    ],
    function (err, positionId) {
      if (err) {
        callback(err);
      } else {
        callback(err, err ? null : positionId);
      }
    }
  );
}

export function delete_position(
  groupId: string,
  userId: string,
  positionId: string,
  callback
) {
  async.series(
    {
      // 1. notify candidates
      candidates: function (cb) {
        application_notify(userId, null, positionId, 0, 2, function (err) {
          cb(err);
        });
      },

      // 2. delete Position Group Link
      links: function (cb) {
        var progress: number = 1;
        db.groups
          .find({ _id: ObjectID(groupId) })
          .project({ _id: 0, "positionsItems.positionsIds": 1 })
          .next()
          .then(function (item) {
            if (item.positionsItems.positionsIds.length == 1) progress = 0;
            db.groups.updateOne(
              { _id: ObjectID(groupId) },
              {
                $pull: { "positionsItems.positionsIds": ObjectID(positionId) },
                $set: { "progress.16": progress },
              },
              { multi: false, safe: true },
              cb()
            );
          });
      },

      // 3. delete Position Projects (+ Notification) / remove Stripe subscription
      items: function (cb) {
        db.positions
          .find({ _id: ObjectID(positionId) })
          .project({ projects: 1, subId: 1, followedIds: 1 }) // "planId": 1,
          .next()
          .then(function (item) {
            async.parallel(
              {
                delete_news: function (cb) {
                  news.add_group_activity(
                    userId,
                    1105,
                    positionId,
                    groupId,
                    positionId,
                    [],
                    null,
                    null,
                    null,
                    3,
                    function (err) {
                      cb(err);
                    }
                  );
                },

                projects: function (cb) {
                  if (item.projects) {
                    db.projects.updateMany(
                      {
                        _id: { $in: item.projects.map((r) => ObjectID(r._id)) },
                      },
                      { $pull: { positionsIds: ObjectID(positionId) } },
                      { multi: true, safe: true },
                      cb()
                    );
                  } else {
                    cb();
                  }
                },

                stripe: function (cb) {
                  stripe.subscriptions.del(
                    item.subId, // customer.subscriptions.data[0].id,
                    function (err, confirmation) {
                      // console.log('delete_position_subscription',err,confirmation)
                      cb(err);
                    }
                  );
                },
              },

              function (err, results) {
                cb(err);
              }
            );
          });
      },

      // 4. delete Position Followers Links (+ Notification)
      followers: function (cb) {
        peoples.delete_followings_ids(
          "positions",
          "positionsIds",
          positionId,
          true,
          function (err, result) {
            cb(err, result);
          }
        );
      },

      // 5. delete Position Item
      position: function (cb) {
        db.positions.deleteOne(
          { _id: ObjectID(positionId) },
          { safe: true },
          cb()
        );
      },

      // 6. delete Position Algolia
      algolia: function (cb) {
        algoliaIndex.getObject(groupId, (err, content) => {
          if (content) {
            const positions = content.positions.filter(
              (r) => r._id != positionId
            );
            algoliaIndex.partialUpdateObject(
              {
                objectID: groupId,
                positions: positions,
              },
              (err, content) => {
                cb(err);
              }
            );
          } else {
            cb();
          }
        });
      },

      // 7. remove Position news
      news: function (cb) {
        news.remove_activity(groupId, positionId, 0, function (err) {
          cb(err);
        });
      },
    },
    function (err, results) {
      if (err) {
        callback(err);
      } else {
        callback(err, err ? null : results);
      }
    }
  );
}

function createPositionDocument(
  data,
  groupId: string,
  group: groupComplex,
  country: string,
  state: string,
  city: string,
  location: number[],
  adminFlag: boolean,
  callback
) {
  const stepsDates = data.stepsDates
    ? data.stepsDates
    : [null, null, null, null, null, null, null, null, null];
  const stepsEnables = data.stepsEnables ? data.stepsEnables : [false, false];

  db.positions.insertOne(
    {
      created_on: new Date(),
      ai: adminFlag && data.ai ? 1 : 0,
      subId: null,
      groupId: ObjectID(groupId),
      mode: 1, // 0: On Hold, 1: Active, 2: Expired
      payment: false,
      how: data.how, // [0,2]
      direct: data.direct,
      standout: data.standout, // [0,3]
      pin: data.standout == 3 ? 1 : 0,

      filter: data.filter,
      feedback: data.feedback,

      position: data.position,
      positionName: peoples.titlesTypes(data.position),

      title: data.title,
      type: data.type,

      contractLength: Number(data.contractLength),
      contractLengthType: Number(data.contractLengthType),
      spotsAvailable: Number(data.spotsAvailable),
      internalId: data.internalId,

      salary: null,
      salaryUnit: 0,

      tags: data.tags ? data.tags : [],
      projects: data.projects
        ? data.projects.map((r) => {
            r._id = ObjectID(r._id);
            return r;
          })
        : [],

      followedIds: [],

      apply: [],
      stats: [[]],

      gradesRequired: data.gradesRequired,
      lettersRequired: data.lettersRequired,
      lettersGuidelines: data.lettersGuidelines,
      numReferees: data.numReferees,

      stepsDates: stepsDates,
      stepsEnables: stepsEnables,

      description: data.description,
      duties: data.duties,
      scholarship: data.scholarship,
      expectations: data.expectations,
      requiredEducation: data.requiredEducation,
      requiredExperience: data.requiredExperience,
    },
    { w: 1, safe: true },
    function (err, docsInserted) {
      callback(err, docsInserted.insertedId);
    }
  );
}

export function positions_list(
  positionsIds: string[],
  userId: string,
  mini: number,
  aiStatus: number,
  adminFlag: boolean,
  callback
) {
  console.log("adminFlag", adminFlag);
  var m = {
    $match: {
      _id: { $in: positionsIds },
      ai: aiStatus == 1 ? 1 : { $in: [null, 0] },
      payment: adminFlag == true ? { $in: [false, true] } : { $in: [true] },
      mode: adminFlag == true ? { $in: [0, 1, 2] } : { $in: [1] },
    },
  };
  var a = {
    $addFields: { __order: { $indexOfArray: [positionsIds, "$_id"] } },
  };
  var s = { $sort: { __order: 1 } };

  var f;

  if (mini == 0) {
    f = {
      $project: {
        _id: 1,
        views: 1,
        groupId: 1,
        created_on: 1,
        mode: 1,
        payment: 1,
        standout: 1,
        title: 1,
        type: 1,
        position: 1,
        internalId: 1,
        description: 1,
        spotsAvailable: 1,
        note: 1,
        stepsDates: 1,
        stepsEnables: 1,
        gradesRequired: 1,
        lettersRequired: 1,
        lettersGuidelines: 1,
        numReferees: 1,
        apply: {
          $filter: {
            input: "$apply",
            as: "apply",
            cond: { $eq: ["$$apply.id", userId] },
          },
        },
      },
    };
  } else if (mini == 1) {
    f = { $project: { _id: 1, title: 1 } };
  } else if (mini == 2) {
    // Algolia object

    f = {
      $project: {
        _id: 1,
        mode: 1,
        standout: 1,
        position: 1,
        positionName: 1,
        title: 1,
        type: 1,
        description: 1,
        spotsAvailable: 1,
        created_on: 1,
        stepsDates: 1,
        stepsEnables: 1,
        contractLength: 1,
        contractLengthType: 1,
        tags: 1,
        // grades, letters, referees
      },
    };
  }

  db.positions
    .aggregate([m, a, s, f])
    .map(function (u) {
      if (adminFlag == false) {
        delete u.payment;
        delete u.mode;
      }
      if (u.apply && u.apply[0]) {
        // u.apply=u.apply[0];
        // u.apply.stage=null;
        u.apply[0].stage = null;
      }
      return u;
    })
    .toArray(callback);
}

export function position_details(
  positionId: string,
  adminFlag: boolean,
  userId: string,
  callback
) {
  var m = {
    $match: {
      _id: ObjectID(positionId),
      payment: adminFlag == true ? { $in: [false, true] } : { $in: [true] },
      mode: adminFlag == true ? { $in: [0, 1, 2] } : { $in: [1] },
    },
  };

  var p = {
    _id: 1,
    groupId: 1,
    mode: 1,
    how: 1,
    direct: 1,
    position: 1,
    title: 1,
    type: 1,
    site: 1,
    style: 1,
    tags: 1,
    projects: 1,
    created_on: 1,
    views: 1,
    standout: 1,
    contractLength: 1,
    contractLengthType: 1,
    spotsAvailable: 1,
    salary: 1,
    salaryCurrency: 1,
    internalId: 1,
    payment: 1,
    // hours: 1,
    stepsDates: 1,
    stepsEnables: 1,
    gradesRequired: 1,
    lettersRequired: 1,
    lettersGuidelines: 1,
    numReferees: 1,
    description: 1,
    duties: 1,
    scholarship: 1,
    expectations: 1,
    requiredEducation: 1,
    requiredExperience: 1,
    apply: {
      $filter: {
        input: "$apply",
        as: "apply",
        cond: { $eq: ["$$apply.id", userId] },
      },
    },
  };

  if (adminFlag) p["filter"] = 1;

  var f = { $project: p };

  db.positions
    .aggregate([m, f])
    .map(function (u) {
      if (adminFlag == false) {
        delete u.payment;
      }
      if (u.apply && u.apply[0]) {
        // u.apply=u.apply[0];
        // u.apply.stage=null;
        u.apply[0].stage = null;
      }
      return u;
    })
    .next(callback);
}

// https://stackoverflow.com/questions/13964155/get-javascript-object-from-array-of-objects-by-value-of-property
// const filterValue = (obj, key, value)=> obj.find(v => v[key] === value);

export function positions_analytics(positionsIds: string[], callback) {
  db.positions
    .find({ _id: { $in: positionsIds } })
    .project({ _id: 1, title: 1, views: 1, applied: 1 })
    .toArray(callback);
}

// %%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%
// %%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%
// %%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%
// %%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%

export function position_stats(positionId: string, callback) {
  var m = { $match: { _id: ObjectID(positionId) } };
  var f = { $project: { stats: 1 } };

  db.positions
    .aggregate([m, f])
    .next()
    .then(function (item) {
      callback(null, item.stats);
    });
}

// %%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%
// %%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%
// %%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%
// %%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%

export function position_proposals(positionId: string, callback) {
  var m = { $match: { _id: ObjectID(positionId) } };

  var f = {
    $project: {
      apply: {
        $filter: {
          input: "$apply",
          as: "apply",
          cond: { $gt: ["$$apply.status", 9] },
        },
      },
    },
  };

  db.positions
    .aggregate([m, f])
    .next()
    .then(function (item) {
      callback(null, item.apply);
    });
}

// %%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%
// %%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%
// %%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%
// %%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%

export function put_apply(
  userId: string,
  mode: number,
  positionId: string,
  data: OpenPositionApply,
  callback
) {
  var data_clone;

  async.waterfall(
    [
      // 1. validate data.
      // function (cb) {
      //   // try {
      //   //   const reqFields: string[] = ["grades", "letters", "referees"];
      //   //   backhelp.verify(data, reqFields);
      //   // } catch (e) {
      //   //   cb(e);
      //   //   return;
      //   // }
      //   cb();
      // },

      // 2. push Apply / Later to Position Document
      function (cb) {
        var m = { $match: { _id: ObjectID(positionId) } };
        var f = {
          $project: {
            _id: 1,
            filter: 1,
            stepsDates: 1,
            apply: {
              $filter: {
                input: "$apply",
                as: "apply",
                cond: { $eq: ["$$apply.id", userId] },
              },
            },
          },
        };
        db.positions
          .aggregate([m, f])
          .next()
          .then(function (item) {
            console.log("apply", item);
            // console.log('item.stepsDates[0]',item.stepsDates[0])
            // console.log('moment',moment().isAfter(item.stepsDates[0]))
            if (item.apply && item.apply[0]) {
              console.log("USER ALREADY APPLIED");
              cb(backhelp.invalid_apply());
            } else if (
              item.stepsDates[0] != null &&
              moment().isAfter(item.stepsDates[0])
            ) {
              console.log("APPLICATION DEADLINE");
              cb(backhelp.invalid_apply());
            } else {
              // const filter: number = item.filter ? 1 : 0;
              if (mode == 0) {
                // Academig Apply
                db.positions.updateOne(
                  { _id: ObjectID(positionId) },
                  {
                    $push: {
                      apply: {
                        id: userId,
                        mode: 0,
                        stage: 0,
                        status: item.filter ? 9 : 10,
                        grades: data.grades.map((r) => Number(r)),
                        letters: data.letters,
                        referees: data.referees,
                        date: [new Date()],
                      },
                    },
                  },
                  { safe: true },
                  cb(null, item.filter)
                );
              } else {
                // Email / URL Apply
                db.positions.updateOne(
                  { _id: ObjectID(positionId) },
                  {
                    $push: {
                      apply: {
                        id: userId,
                        mode: mode,
                        stage: 0,
                        status: item.filter ? 9 : 10,
                        date: [new Date()],
                      },
                    },
                  },
                  { safe: true },
                  cb(null, item.filter)
                );
              }
            }
          });
      },

      // 3. insert Position ID to Following (Apply / Later Status) in People Document
      function (filter: boolean, cb) {
        db.peoples.updateOne(
          { _id: userId },
          { $push: { "followings.positionsIds": ObjectID(positionId) } },
          { safe: true },
          cb(null, filter)
        );
      },

      // 4. push Notification
      function (filter: boolean, cb) {
        console.log("filter", filter);
        if (filter == true) {
          cb();
        } else {
          application_notify(userId, null, positionId, 2, 0, function (err) {
            cb(err);
          });
        }
      },
    ],
    function (err) {
      callback(err);
    }
  );
}

export function post_apply(
  userId: string,
  positionId: string,
  mode: number,
  data: OpenPositionApply,
  callback
) {
  var data_clone;

  async.waterfall(
    [
      // 1. validate data.
      function (cb) {
        cb(null, data);
      },

      // 2. push Apply / Later to Position Document
      function (apply_data, cb) {
        if (mode == 2) {
          data_clone = JSON.parse(JSON.stringify(apply_data));
          db.positions.updateOne(
            { _id: ObjectID(positionId), "apply.id": userId },
            {
              $set: {
                "apply.$.grades": data_clone.grades.map((r) => Number(r)),
                "apply.$.letters": data_clone.letters,
                "apply.$.referees": data_clone.referees,
              },
              $push: {
                "apply.$.date": new Date(),
              },
            },
            { safe: true },
            cb()
          );
        } else if (mode == 3) {
          db.positions.updateOne(
            { _id: ObjectID(positionId), "apply.id": userId },
            { $inc: { "apply.$.status": 100 } },
            { safe: true },
            cb()
          );
        }
      },

      // 3. push Notification
      function (cb) {
        application_notify(userId, null, positionId, 2, mode, function (err) {
          cb();
        });
      },
    ],
    function (err) {
      callback(err);
    }
  );
}

export function post_candidate_note(
  positionId: string,
  peopleId: string,
  note: string,
  callback
) {
  db.positions.updateOne(
    { _id: ObjectID(positionId), "apply.id": peopleId },
    { $set: { "apply.$.note": note } },
    { safe: true },
    callback()
  );
}

export function post_candidate_stage(
  userId: string,
  positionId: string,
  peopleId: string,
  newStage: number,
  callback
) {
  async.waterfall(
    [
      // 1. post Candiate Stage
      function (cb) {
        db.positions.findOneAndUpdate(
          { _id: ObjectID(positionId), "apply.id": peopleId },
          { $set: { "apply.$.stage": newStage } },
          { projection: { stepsDates: 1, "apply.$": 1 } },
          function (err, doc) {
            cb(
              err,
              doc.value.apply[0].stage,
              doc.value.apply[0].status,
              doc.value.stepsDates[7]
            );
          }
        );
      },

      // 2. post Candiate Status (flag: Final Descision Date)
      function (currentStage: number, status: number, finishDate: string, cb) {
        // console.log('finishDate',finishDate, 'currentStage',currentStage, 'newStage',newStage, 'status',status)
        // if (!finishDate) {
        //   const newStatus = (newStage*100) + status.toString().substring(1);
        //   console.log('newStatus',newStatus)
        //   db.positions.updateOne(
        //     { _id: ObjectID(positionId), "apply.id": peopleId },
        //     { $set: {"apply.$.status": Number(newStatus) } },
        //     { safe: true },
        cb();
        //   )
        // }
      },

      // 3. push Notification
      function (cb) {
        application_notify(
          userId,
          peopleId,
          positionId,
          1,
          newStage,
          function (err) {
            cb(err);
          }
        );
      },
    ],
    function (err) {
      callback(err);
    }
  );
}

function push_news(
  userId: string,
  positionId: string,
  groupId: string,
  description: string,
  spotsAvailable: number,
  stepsDates,
  callback
) {
  if (stepsDates) {
    var text = spotsAvailable + " spots available.";
    text += stepsDates[0]
      ? " Application submission deadline is " + stepsDates[0] + "."
      : "";
    text += stepsDates[6] ? " Start date is " + stepsDates[8] + "." : "";
  } else {
    text = "";
  }

  news.add_group_activity(
    userId,
    1005,
    positionId,
    groupId,
    positionId,
    [],
    description,
    text,
    null,
    3,
    function (err) {
      callback(err);
    }
  );
}

function application_notify(
  userId: string,
  peopleId: string,
  positionId: string,
  type: number,
  mode: number,
  callback
) {
  console.log("type", type, "mode", mode, "positionId", positionId);
  // type 0: Notify all candidates
  // type 1: Notify candidate
  // type 2: Notify admins

  async.waterfall(
    [
      // 1. retrieve Position Data + Apply Data (flag)
      function (cb) {
        var candidatesIds: string[] = null;
        const p =
          type == 0
            ? { _id: 0, groupId: 1, title: 1, positionName: 1, "apply.id": 1 }
            : { _id: 0, groupId: 1, title: 1, positionName: 1 };
        db.positions
          .find({ _id: ObjectID(positionId) })
          .project(p)
          .next()
          .then(function (item) {
            if (type == 0 && item.apply)
              candidatesIds = item.apply.map((r) => r.id);
            cb(
              null,
              item.groupId,
              item.title,
              item.positionName,
              candidatesIds
            );
          });
      },

      // 2. retrieve groupIndex, IDs of all admins
      function (
        groupId: string,
        positionTitle: string,
        positionName: string,
        candidatesIds: string[],
        cb
      ) {
        if (type == 1) {
          cb(null, positionTitle, positionName, candidatesIds, null, null);
        } else {
          groups.get_group_link(groupId, function (err, item) {
            cb(
              err,
              positionTitle,
              positionName,
              candidatesIds,
              item.groupIndex,
              item.peoplesItems.activesIds
            );
          });
        }
      },

      // 3. retrieve users objects
      function (
        positionTitle: string,
        positionName: string,
        candidatesIds: string[],
        groupIndex: groupComplex,
        activesIds: string[],
        cb
      ) {
        var usersIds: string[];

        if (type == 0) {
          // retrieve users of all candidates
          usersIds = candidatesIds;
        } else if (type == 1) {
          // retrieve user of peopleId (candidate)
          usersIds = [peopleId];
        } else if (type == 2) {
          // retrieve user of userId (candidate)
          usersIds = activesIds.concat(userId);
        }

        // console.log('usersIds',usersIds)

        const m = { $match: { $and: [{ _id: { $in: usersIds } }] } };
        const a = {
          $addFields: { __order: { $indexOfArray: [usersIds, "$_id"] } },
        };
        const s = { $sort: { __order: 1 } };
        const f = {
          $project: {
            _id: 1,
            name: 1,
            pic: 1,
            stage: 1,
            "personalInfo.email": 1,
            positions: {
              $filter: {
                input: "$positions",
                as: "position",
                cond: {
                  $eq: ["$$position.groupId", ObjectID(groupIndex.group._id)],
                },
              },
            },
          },
        };

        db.peoples
          .aggregate([m, a, s, f])
          .toArray()
          .then(function (users) {
            var toEmails: string[];
            if (type == 2) {
              users = users.filter(
                (r) =>
                  r._id == userId ||
                  (r.positions[0] && r.positions[0].status > 4)
              );
              toEmails = users.slice(0, -1).map((r) => r.personalInfo.email);
            } else {
              toEmails = users.map((r) => r.personalInfo.email);
            }
            cb(
              null,
              positionTitle,
              positionName,
              candidatesIds,
              groupIndex,
              users,
              toEmails
            );
          });
      },

      // 4. send Email
      function (
        positionTitle: string,
        positionName: string,
        candidatesIds: string[],
        groupIndex: groupComplex,
        users: objectMiniEmail[],
        toEmails: string[],
        cb
      ) {
        var msg, subject: string;
        // console.log('users',users)

        switch (type) {
          case 0: // Notify all candidates
            subject = "Your Job Application: " + positionTitle;
            switch (mode) {
              case 0: // On Hold XXX
                msg = "Job posting is now on hold";
                break;
              case 1: // Resume XXX
                msg = "Job posting is resumed";
                break;
              case 2: // Cancel XXX
                msg = "Job posting canceled";
                break;
              case 3: // Submission date
                msg = "Submission deadline is today";
                break;
              case 4: // Decision date
                msg = "Decision date is today";
                break;
              case 5: // Start date
                msg = "Start date is today";
                break;
            }
            break;
          case 1: // Notify candidate
            subject = "Your Job Application: " + positionTitle;
            switch (mode) {
              case 0: // Shortlist XXX
                msg =
                  "Congratulations, your application have been shortlisted.";
                break;
              case 1: // Waitlist XXX
                msg = "Your application have been moved to the waitlist.";
                break;
              case 2: // Archived XXX
                msg = "Your application was declined.";
                break;
            }
            break;
          case 2: // Notify admins
            subject = positionTitle + ": " + positionName;
            switch (mode) {
              case 0: // Candidate apply XXX
                msg = "New application: " + users[users.length - 1].name;
                break;
              case 2: // Candidate post application XXX
                msg = null;
                break;
              case 3: // Candidate withdraw XXX
                msg = "Application withdraw " + users[users.length - 1].name;
                break;
            }
            break;
        }
        if (toEmails.length > 0) {
          emails.applicationJobEmail(
            subject,
            groupIndex.group.link,
            groupIndex.group.name,
            positionId,
            positionTitle,
            positionName,
            msg,
            users,
            toEmails,
            function (err) {
              cb(err);
            }
          );
        } else {
          cb();
        }
      },
    ],
    function (err) {
      callback(err);
    }
  );
}

function invalid_position_name() {
  return backhelp.error(
    "invalid_position_name",
    "Project names can have letters, #s, _ and, -"
  );
}
