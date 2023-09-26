var db = require("../db.ts"),
  async = require("async"),
  backhelp = require("./backend_helpers.ts");

var ObjectID = require("mongodb").ObjectID;

var groups = require("./groups.ts");
var projects = require("./projects.ts");
var peoples = require("./peoples.ts");
var news = require("./news.ts");
var messages = require("./messages.ts");
var shared = require("./shared.ts");
var pics = require("./pics.ts");

var emails = require("../misc/emails.ts");

import { Price } from "../models/resources.ts";
import { objectMini, groupComplex } from "../models/shared.ts";
import { Message } from "../models/messages.ts";

var stripe = require("stripe")("ENV_STRIPE");

const algoliasearch = require("algoliasearch");
const client = algoliasearch("TDKUK8VW4T", "5d17934a8722069c0ac47bd6b4ae4bda");

const algoliaIndex = process.env.PORT
  ? client.initIndex("services")
  : client.initIndex("dev_services");

let serviceTypes = {
  10: "Analysis Service",
  20: "Mathematical Models",
  30: "Forecasting and Prediction",
  40: "Biostatistics",
  50: "Clinical Trials",
  60: "Scientific Consulting",
  70: "Medical Devices",
  80: "Clinical Research Development",
  90: "Food Science",
  100: "Food Technology",
  110: "Scientific Law",
  120: "Biotechnology",
  130: "Robotics",
  140: "Artificial Intelligence",
  150: "Synthesis Service",
  160: "Measurements Service",
  170: "Lab Equipment",
  180: "Calibration Service",
  190: "Lab Supply",
  200: "Software",
  210: "Simulation",
  220: "Prototyping",
  230: "Business Service",
  240: "Management Service",
  250: "Labeling Service",
  260: "Training Service",
  270: "Scientific Writing",
  280: "Visual Communication",
  290: "Scientific Editing",
  300: "Facilities",
};

exports.version = "0.1.0";

// change Category (if needed)
// function (resource_data, cb) {
//   if (resource_data.oldCategory==resource_data.newCategory) {
//     cb(null, resource_data._id)
//   } else {
//     db.groups.updateOne(
//        {_id: ObjectID(groupId)},
//        {
//          $inc: {
//                 ['resourcesPageItems.categories.' + resource_data.oldCategory + '.countIds'] : -1,
//                 ['resourcesPageItems.categories.' + resource_data.newCategory + '.countIds'] : 1,
//                },
//          $pull: { ['resourcesItems.resourcesIds']: ObjectID(resource_data._id) } ,
//          $push: {
//                   "resourcesItems.resourcesIds": {
//                     $each: [ObjectID(resource_data._id)],
//                     $position: 0
//                   }
//                 }
//        },
//        { safe: true },
//        cb(null, resource_data._id)
//     )
//   }
// }

export function put_resource(
  userId: string,
  data,
  insertIndex: number,
  adminFlag: boolean,
  callback
) {
  var data_clone;

  async.waterfall(
    [
      // 1. validate data.
      function (cb) {
        // console.log('data',data)
        try {
          const reqFields: string[] = ["name", "categoryId"];
          backhelp.verify(data, reqFields);
        } catch (e) {
          cb(e);
          return;
        }
        cb(null, data);
      },

      // 2. create Resource document
      // function (peopleProfile: objectMini[], resource_data, cb) {
      function (resource_data, cb) {
        data_clone = JSON.parse(JSON.stringify(resource_data));
        // createResourceDocument(data_clone, peopleProfile, adminFlag, function (err, resourceId) {
        createResourceDocument(
          data_clone,
          adminFlag,
          function (err, resourceId) {
            cb(err, resource_data.categoryId, resourceId);
          }
        );
      },

      // 3. insert Resource ID to Group + modify Category counter / to Profile
      function (categoryId, resourceId, cb) {
        db.groups.updateOne(
          { _id: ObjectID(data_clone.groupId) },
          {
            // $inc: { ['resourcesPageItems.categories.' + categoryId + '.countIds'] : 1 },
            $inc: { ["resourcesPageItems.categories." + 0 + ".countIds"]: 1 },
            $set: { "progress.7": 1 },
            $push: { "resourcesItems.resourcesIds": resourceId },
            // $push: {
            // "resourcesItems.resourcesIds": {
            // $each: [ resourceId ],
            // $position: insertIndex
            //     $position: 0
            //   }
            // }
          },
          { safe: true },
          cb(null, resourceId)
        );
      },

      // 4. insert Resource ID to Peoples Resources List
      function (resourceId, cb) {
        if (data_clone.people) {
          db.peoples.updateMany(
            { _id: { $in: data_clone.people.map((r) => r._id) } },
            { $push: { resourcesIds: ObjectID(resourceId) } },
            { multi: true, safe: true },
            cb(null, resourceId)
          );
        } else {
          cb(null, resourceId);
        }
      },

      // 5. insert Resource ID to Projects Resources List
      // function (resourceId, cb) {
      //   if (data_clone.projects) {
      //     db.projects.updateMany(
      //        {_id: {$in: data_clone.projects.map(r => ObjectID(r._id))}},
      //        { $push: { "resourcesIds": ObjectID(resourceId) } },
      //        { multi: true, safe: true },
      //        cb(null, resourceId)
      //     )
      //   } else {
      //     cb(null, resourceId)
      //   }
      // },

      // 5. push News
      function (resourceId, cb) {
        const peoplesIds: string[] = data_clone.people.map((x) => x._id);
        if (adminFlag && data_clone.ai) {
          cb(null, resourceId);
        } else {
          push_news(
            userId,
            resourceId,
            data_clone.groupId,
            data_clone.description,
            peoplesIds,
            function (err) {
              cb(err, resourceId);
            }
          );
        }
      },
    ],
    function (err, resourceId) {
      if (err) {
        callback(err);
      } else {
        callback(err, err ? null : resourceId);
      }
    }
  );
}

export function post_resource_notify(
  stripeId: string,
  subscriptionId: string,
  itemId: string,
  callback
) {
  console.log("post_resource_notify", stripeId);

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
            cb(
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
            );
          }
        );
      },

      // 2. get hash associated with User ID
      function (
        groupIndex: groupComplex,
        country: string,
        state: string,
        city: string,
        location: string[],
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
              country,
              state,
              city,
              location,
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
        country: string,
        state: string,
        city: string,
        location: string[],
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
              country,
              state,
              city,
              location,
              groupStage,
              userId,
              pro,
              interview,
              club
            );
          });
      },

      // 4. retrieve Resource data && set payment_flag=true
      function (
        userStage: number,
        userName: string,
        userEmail: string,
        hash: string,
        groupIndex: groupComplex,
        country: string,
        state: string,
        city: string,
        location: string[],
        groupStage: number,
        userId: string,
        pro: boolean,
        interview: boolean,
        club: boolean,
        cb
      ) {
        const groupId: string = groupIndex.group._id;

        db.resources.findOneAndUpdate(
          { _id: ObjectID(itemId), groupId: ObjectID(groupId) },
          { $set: { payment: true, subId: subscriptionId } },
          {
            projection: {
              created_on: 1,
              mode: 1,
              standout: 1,
              name: 1,
              pic: 1,
              categoryId: 1,
              description: 1,
              tags: 1,
              price: 1,
            },
          },
          function (err, doc) {
            const data = doc.value;
            // console.log('data',data)
            if (groupStage == 2) {
              // Lab is approved

              var object = {
                objectID: itemId,
                created_on: data.created_on,
                mode: 1, // 0: On Hold, 1: Active, 2: Expired
                standout: data.standout,

                name: data.name,
                pic: data.pic,

                categoryId: Number(data.categoryId),
                categoryName: serviceTypes[data.categoryId],

                description: data.description,
                tags: data.tags,

                price: data.price,
                rating: null,

                group: groupIndex,
                type: groupIndex.university.link == "company" ? 1 : 0,

                country: country,
                state: state,
                city: city,
                _geoloc:
                  location && location[0]
                    ? { lat: location[0], lng: location[1] }
                    : { lat: "", lng: "" },
              };
              if (data.standout == 2) object["pin"] = 1;
              algoliaIndex.addObjects([object], (err, content) => {
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
                  pro,
                  interview,
                  club
                );
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
            console.log("confirmServiceEmail");
          } else {
            // New Lab
            type = 1;
            console.log("verificationServiceEmail"); // emails.verificationJobEmail
          }
        } else {
          // User Not Exist
          type = 2;
          console.log("signupServiceEmail"); // emails.signupJobEmail
        }

        emails.confirmServiceEmail(
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

export function post_resource(
  userId: string,
  parentId: string,
  resourceId: string,
  mode: number,
  callback
) {
  async.waterfall(
    [
      // 1. Put on hold = 0 / Expired = 2:
      //    Update Resource Mode (Request / Can't Request + Algolia)
      function (cb) {
        console.log("post_resource", mode);
        db.resources
          .updateOne(
            { _id: ObjectID(resourceId) },
            { $set: { mode: mode } },
            { multi: false, safe: true }
          )
          .then(function () {
            algoliaIndex.partialUpdateObject(
              {
                objectID: resourceId,
                mode: mode,
              },
              (err, content) => {
                cb(err, resourceId);
              }
            );
          });
      },

      // 2. push Notification
      // function (resourceId: string, cb) {
      // resource_notify(userId, null, positionId, 0, mode, function (err) {
      // cb(err, resourceId)
      // })
      // }
    ],
    function (err, resourceId: string) {
      if (err) {
        callback(err);
      } else {
        callback(err, err ? null : resourceId);
      }
    }
  );
}

export function post_resource_name(resourceId: string, name: string, callback) {
  algoliaIndex.partialUpdateObject(
    {
      objectID: resourceId,
      name: name,
    },
    (err, content) => {
      callback();
    }
  );
}

export function post_resource_pic(resourceId: string, pic: string, callback) {
  algoliaIndex.partialUpdateObject(
    {
      objectID: resourceId,
      pic: pic,
    },
    (err, content) => {
      callback();
    }
  );
}

export function delete_resource(
  parentId: string,
  userId: string,
  resourceId: string,
  category: number,
  type: number,
  callback
) {
  async.series(
    {
      // 1. delete Resource from Group Category / Profile Links
      link: function (cb) {
        if (type == 2) {
          // Lab Profile Delete

          cb();
        } else {
          var progress: number = 1;

          db.groups
            .aggregate([
              { $match: { _id: ObjectID(parentId) } },
              { $project: { _id: 0, "resourcesItems.resourcesIds": 1 } },
            ])
            .next()
            .then(function (item) {
              if (item.resourcesItems.resourcesIds.length == 1) progress = 0;
              db.groups.updateOne(
                { _id: ObjectID(parentId) },
                {
                  // $inc: { ['resourcesPageItems.categories.' + category + '.countIds'] : -1 },
                  $inc: {
                    ["resourcesPageItems.categories." + 0 + ".countIds"]: -1,
                  },
                  $set: { "progress.7": progress },
                  $pull: {
                    ["resourcesItems.resourcesIds"]: ObjectID(resourceId),
                  },
                },
                { multi: false, safe: true },
                cb()
              );
            });
        }
      },

      // 2. delete Contact People, Projects, Questions, Publictions, Links (+ Notification)
      items: function (cb) {
        db.resources
          .find({ _id: ObjectID(resourceId) })
          .project({
            _id: 0,
            subId: 1,
            backgroundPic: 1,
            gallery: 1,
            people: 1,
            projects: 1,
            faqsIds: 1,
            publicationsIds: 1,
            followedIds: 1,
            manuals: 1,
            codes: 1,
            cads: 1,
            inventories: 1,
            equipments: 1,
            requests: 1,
          })
          .next()
          .then(function (item) {
            async.parallel(
              {
                delete_news: function (cb) {
                  if (type == 0) {
                    const peoplesIds: string[] = item.people.map((r) => r._id);
                    news.add_group_activity(
                      userId,
                      1102,
                      resourceId,
                      parentId,
                      resourceId,
                      peoplesIds,
                      null,
                      null,
                      null,
                      3,
                      function (err) {
                        cb(err);
                      }
                    );
                  } else {
                    cb();
                  }
                },

                people: function (cb) {
                  // if (item.people) {
                  if (item.people && Array.isArray(item.people)) {
                    db.peoples.updateMany(
                      { _id: { $in: item.people.map((r) => r._id) } },
                      { $pull: { resourcesIds: ObjectID(resourceId) } },
                      { multi: true, safe: true },
                      cb()
                    );
                  } else {
                    cb();
                  }
                },

                projects: function (cb) {
                  if (item.projects) {
                    db.projects.updateMany(
                      {
                        _id: { $in: item.projects.map((r) => ObjectID(r._id)) },
                      },
                      { $pull: { resourcesIds: ObjectID(resourceId) } },
                      { multi: true, safe: true },
                      cb()
                    );
                  } else {
                    cb();
                  }
                },

                faqs: function (cb) {
                  if (item.faqsIds) {
                    db.faq.deleteMany({ _id: { $in: item.faqsIds } }, cb());
                  } else {
                    cb();
                  }
                },

                publications: function (cb) {
                  if (item.publicationsIds) {
                    db.publications.deleteMany(
                      { _id: { $in: item.publicationsIds } },
                      cb()
                    );
                  } else {
                    cb();
                  }
                },

                pics: function (cb) {
                  pics.delete_pic_direct(item.backgroundPic, function (err) {
                    pics.delete_pic_gallery(
                      (item.gallery[0] || {}).pic,
                      function (err) {
                        cb(err);
                      }
                    );
                  });
                },

                manuals: function (cb) {
                  async.forEachOf(
                    item.manuals,
                    function (manual, key, cb) {
                      pics.delete_pic_gallery(manual.files, function (err) {
                        cb(err);
                      });
                    },
                    function (err) {
                      cb(err);
                    }
                  );
                },

                codes: function (cb) {
                  async.forEachOf(
                    item.codes,
                    function (code, key, cb) {
                      pics.delete_pic_gallery(code.files, function (err) {
                        cb(err);
                      });
                    },
                    function (err) {
                      cb(err);
                    }
                  );
                },

                cads: function (cb) {
                  async.forEachOf(
                    item.cads,
                    function (cad, key, cb) {
                      pics.delete_pic_gallery(cad.files, function (err) {
                        cb(err);
                      });
                    },
                    function (err) {
                      cb(err);
                    }
                  );
                },

                inventories: function (cb) {
                  async.forEachOf(
                    item.inventories,
                    function (inventory, key, cb) {
                      pics.delete_pic_direct(inventory.pic, function (err) {
                        pics.delete_pic_gallery(
                          inventory.files,
                          function (err) {
                            cb(err);
                          }
                        );
                      });
                    },
                    function (err) {
                      cb(err);
                    }
                  );
                },

                equipments: function (cb) {
                  async.forEachOf(
                    item.equipments,
                    function (equipment, key, cb) {
                      pics.delete_pic_direct(equipment.pic, function (err) {
                        pics.delete_pic_gallery(
                          equipment.files,
                          function (err) {
                            cb(err);
                          }
                        );
                      });
                    },
                    function (err) {
                      cb(err);
                    }
                  );
                },

                requests: function (cb) {
                  async.forEachOf(
                    item.requests,
                    function (request, key, cb) {
                      // FIX: pull "requests" only from request.userId
                      const ids: string[] = [request.userId].concat(
                        item.people.map((r) => r._id)
                      );
                      console.log("requestsIds", ids);
                      db.peoples.updateMany(
                        { _id: { $in: ids } },
                        {
                          $pull: {
                            requests: ObjectID(resourceId),
                            channelsRequestsIds: ObjectID(request.channelId),
                          },
                        },
                        function (err, res) {
                          db.channels.deleteOne(
                            { _id: ObjectID(request.channelId) },
                            { safe: true },
                            cb(err)
                          );
                        }
                      );
                    },
                    function (err) {
                      cb(err);
                    }
                  );
                },

                stripe: function (cb) {
                  stripe.subscriptions.del(
                    item.subId, // customer.subscriptions.data[0].id,
                    function (err, confirmation) {
                      console.log(
                        "delete_resource_subscription",
                        err,
                        confirmation
                      );
                      cb(err);
                    }
                  );
                },

                // stripe: function (cb) {
                //   if (item.stripe_id) {
                //     stripe.customers.retrieve(item.stripe_id, function(err, customer) {
                //       stripe.subscriptions.del(
                //        customer.subscriptions.data[0].id,
                //         function(err, confirmation) {
                //           cb(err)
                //           // cb(err, confirmation, planId)
                //         }
                //       );
                //     })
                //   } else {
                //     cb()
                //   }
                // },
              },

              function (err) {
                cb(err);
              }
            );
          });
      },

      // 4. delete Resource Followers Links (+ Notification)
      followers: function (cb) {
        peoples.delete_followings_ids(
          "resources",
          "resourcesIds",
          resourceId,
          true,
          function (err) {
            cb(err);
          }
        );
      },

      // 5. delete Resource Item
      resource: function (cb) {
        db.resources.deleteOne(
          { _id: ObjectID(resourceId) },
          { safe: true },
          cb()
        );
      },

      // 6. delete Resource Algolia
      algolia: function (cb) {
        algoliaIndex.deleteObject(resourceId.toString(), (err, content) => {
          cb(err);
        });
      },

      // 7. delete Resource News
      news: function (cb) {
        if (type == 1) {
          cb();
        } else {
          news.remove_activity(parentId, resourceId, 0, function (err) {
            cb();
          });
        }
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

export function resource_typeahead_ids(
  term: string,
  existResourcesIds: string[],
  callback
) {
  db.resources
    .find({ _id: { $nin: existResourcesIds.map((id) => ObjectID(id)) } })
    .project({ _id: 1 })
    .toArray()
    .then(function (items) {
      const ids = items.map(function (id) {
        return id._id;
      });
      callback(null, ids);
    });
}

export function delete_people(userId: string, ids: string[], callback) {
  db.resources.updateMany(
    { _id: { $in: ids } },
    { $pull: { people: { _id: userId } } },
    { multi: false, safe: true },
    callback()
  );
}

// function createResourceDocument(data, peopleProfile: objectMini[], adminFlag: boolean, callback) {
function createResourceDocument(data, adminFlag: boolean, callback) {
  const priceObj: Price = data.price
    ? {
        request: data.price.request,
        type: data.price.type,
        range: data.price.range,
        price: data.price.price,
        mode: data.price.mode,
        currency: data.price.currency,
        internalId: data.price.internalId,
      }
    : null;

  db.resources.insertOne(
    {
      name: data.name,
      pic: data.pic,
      categoryId: data.categoryId,

      ai: adminFlag && data.ai ? 1 : 0,
      subId: null,
      groupId: ObjectID(data.groupId),
      mode: 1, // 0: On Hol, 1: Actived, 2: Expired
      payment: false,
      how: data.how, // [0,2]
      direct: data.direct,
      standout: data.standout, // [0,3]
      pin: data.standout == 3 ? 1 : 0,
      feedback: data.feedback,

      created_on: new Date(),
      views: [0, 0, 0, 0, 0],
      downloads: [0, 0, 0, 0, 0],
      followedIds: [],

      people: data.people,
      projects: [],
      tags: data.tags,

      price: priceObj,

      // "background": null,
      // "backgroundPic": null,
      // "backgroundCaption": null,

      description: data.description,
      descriptionPic: null,
      descriptionCaption: null,

      termsMode: 0,
      termsMore: null,

      publicationsIds: [],
      gallery: [],
      links: [],
      faqsIds: [],
      manuals: [],
      codes: [],
      cads: [],
      inventories: [],
      equipments: [],
    },
    { w: 1, safe: true },
    function (err, docsInserted) {
      callback(err, docsInserted.insertedId);
    }
  );
}

export function resources_list(
  resourcesIds: string[],
  followingsIds: string[],
  userId: string,
  mini: number,
  aiStatus: number,
  adminFlag: boolean,
  callback
) {
  var m = {
    $match: {
      _id: { $in: resourcesIds },
      ai: aiStatus == 1 ? 1 : { $in: [null, 0] },
      payment: adminFlag == true ? { $in: [false, true] } : { $in: [true] },
      mode: adminFlag == true ? { $in: [0, 1, 2] } : { $in: [1] },
    },
  };
  var a = {
    $addFields: { __order: { $indexOfArray: [resourcesIds, "$_id"] } },
  };
  var s = { $sort: { __order: 1 } };

  var f;

  if (mini == 0) {
    f = { $project: { _id: 1, name: 1, pic: 1 } };
  } else if (mini == 1) {
    f = {
      $project: {
        _id: 1,
        name: 1,
        pic: 1,
        tags: 1,
        created_on: 1,
        mode: 1,
        payment: 1,
        standout: 1,
        description: 1,
        price: 1,
        groupId: 1,
        profileId: 1,
        views: 1,
        categoryId: 1,
      },
    };
  } else if (mini == 2) {
    f = {
      $project: {
        _id: 1,
        name: 1,
        pic: 1,
        created_on: 1,
        tags: 1,
        description: 1,
        price: 1,
        groupId: 1,
        profileId: 1,
        views: 1,
        categoryId: 1,
        requests: {
          $filter: {
            input: "$requests",
            as: "request",
            cond: { $eq: ["$$request.userId", userId] },
          },
        },
      },
    };
  } else if (mini == 3) {
    f = {
      $project: {
        _id: 1,
        name: 1,
        pic: 1,
        created_on: 1,
        tags: 1,
        description: 1,
        price: 1,
        groupId: 1,
        profileId: 1,
        views: 1,
        categoryId: 1,
        requests: 1,
      },
    };
  }

  if (followingsIds && (mini == 0 || mini == 1 || mini == 2)) {
    db.resources
      .aggregate([m, a, s, f])
      .map(function (u) {
        if (adminFlag == false) {
          delete u.payment;
          delete u.mode;
        }
        u.followStatus = followingsIds.toString().includes(u._id.toString());
        return u;
      })
      .toArray(callback);
  } else {
    db.resources.aggregate([m, a, s, f]).toArray(callback);
  }
}

export function resource_details(
  resourceId: string,
  followingsIds: string[],
  adminFlag: boolean,
  userId: string,
  callback
) {
  const m = {
    $match: {
      _id: ObjectID(resourceId),
      payment: adminFlag == true ? { $in: [false, true] } : { $in: [true] },
      mode: adminFlag == true ? { $in: [0, 1, 2] } : { $in: [1] },
    },
  };

  // const m = { _id: ObjectID(resourceId) };

  const f = {
    $project: {
      _id: 1,
      name: 1,
      pic: 1,
      categoryId: 1,
      payment: 1,
      mode: 1,
      groupId: 1,
      profileId: 1,
      standout: 1,
      how: 1,
      direct: 1,
      created_on: 1,
      views: 1,
      downloads: 1,
      followedIds: 1,
      people: 1,
      projects: 1,
      tags: 1,
      price: 1,
      description: 1,
      descriptionCaption: 1,
      descriptionPic: 1,
      termsMode: 1,
      termsMore: 1,
      publicationsIds: 1,
      gallery: 1,
      links: 1,
      faqsIds: 1,
      manuals: 1,
      codes: 1,
      cads: 1,
      inventories: 1,
      equipments: 1,
      requests: {
        $filter: {
          input: "$requests",
          as: "request",
          cond: { $eq: ["$$request.userId", userId] },
        },
      },
    },
  };

  if (followingsIds) {
    db.resources
      .aggregate([m, f])
      .map(function (u) {
        if (adminFlag == false) {
          delete u.payment;
        }
        u.followStatus = followingsIds.toString().includes(u._id.toString());
        return u;
      })
      .next(callback);
  } else {
    db.resources.aggregate([m, f]).next(callback);
  }
}

export function resources_analytics(resourcesIds, callback) {
  db.resources
    .find({ _id: { $in: resourcesIds } })
    .project({ _id: 1, name: 1, views: 1, downloads: 1 })
    .toArray(callback);
}

// var resource_items_ids =
export function resource_items_ids(mode, resourceId, callback) {
  var key: string;

  switch (mode) {
    case 0:
      key = "publicationsIds";
      break;
    case 1:
      key = "faqsIds";
      break;
    case 2:
      key = "people";
      break;
  }

  db.resources
    .find({ _id: ObjectID(resourceId) }, { [key]: 1, _id: 0 })
    .next(callback);
}

function push_news(
  userId: string,
  resourceId: string,
  groupId: string,
  description: string,
  peoplesIds: string[],
  callback
) {
  news.add_activity(
    0,
    userId,
    1002,
    resourceId,
    groupId,
    resourceId,
    peoplesIds,
    description,
    null,
    null,
    false,
    function (err) {
      groups.groupMembers(groupId, 3, function (err, peoples) {
        async.forEachOf(
          peoples.map((r) => r._id),
          function (activeId, key, cb) {
            if (userId == activeId) {
              cb();
            } else if (peoplesIds.indexOf(activeId.toString()) > -1) {
              news.add_notification(
                userId,
                9001,
                resourceId,
                activeId,
                groupId,
                peoplesIds,
                description,
                null,
                null,
                function (err) {
                  cb();
                }
              );
            } else {
              news.add_notification(
                userId,
                1002,
                resourceId,
                activeId,
                groupId,
                peoplesIds,
                description,
                null,
                null,
                function (err) {
                  cb();
                }
              );
            }
          },
          function (err) {
            callback(err);
          }
        );
      });
    }
  );
}

export function post_terms(
  termsMode: number,
  termsMore: string,
  itemId: string,
  callback
) {
  db.resources.updateOne(
    { _id: ObjectID(itemId) },
    {
      $set: {
        termsMode: termsMode,
        termsMore: termsMore ? termsMore : null,
      },
    },
    { safe: true },
    callback()
  );
}

export function post_price(priceObj: Price, itemId: string, callback) {
  db.resources.findOneAndUpdate(
    { _id: ObjectID(itemId) },
    {
      $set: {
        price: priceObj
          ? {
              request: priceObj.request,
              type: priceObj.type,
              range: priceObj.range,
              price: priceObj.price,
              mode: priceObj.mode,
              currency: priceObj.currency,
              internalId: priceObj.internalId,
            }
          : null,
      },
    },
    function (err, doc) {
      algoliaIndex.partialUpdateObject(
        {
          objectID: itemId,
          price: priceObj,
        },
        (err, content) => {
          callback();
        }
      );
    }
  );
}

export function post_request(
  text: string,
  userId: string,
  resourceId: string,
  callback
) {
  async.waterfall(
    [
      function (cb) {
        db.resources
          .find({ _id: ObjectID(resourceId) })
          .project({ people: 1 })
          .next()
          .then(function (item) {
            cb(
              null,
              item.people.map((r) => r._id)
            );
          });
      },

      // 2. check channel existent
      function (peopleIds: string[], cb) {
        db.channels
          .findOne({
            "users._id": { $all: peopleIds },
            mode: 2,
            parentId: ObjectID(resourceId),
          })
          .then(function (item) {
            // console.log('item',item)
            cb(
              null,
              item == null ? peopleIds : null,
              item == null ? null : item._id
            );
          });
      },

      function (peopleIds: string[], existChannelId: string, cb) {
        if (peopleIds) {
          messages.createChannelDocument(
            [userId].concat(peopleIds),
            ObjectID(resourceId),
            2,
            function (err, channelId) {
              const message: Message = {
                _id: null,
                type: 0,
                userId: userId,
                text: text,
                file: null,
                date: new Date(),
              };
              messages.put_message(
                message,
                channelId,
                userId,
                null,
                [],
                0,
                function (err) {
                  cb(err, peopleIds, channelId);
                }
              );
            }
          );
        } else {
          cb(null, null, existChannelId);
        }
      },

      function (peopleIds: string[], channelId: string, cb) {
        if (peopleIds) {
          async.parallel(
            {
              resource: function (callback) {
                db.resources.updateOne(
                  { _id: ObjectID(resourceId) },
                  {
                    $push: {
                      requests: {
                        userId: userId,
                        channelId: ObjectID(channelId),
                        date: new Date(),
                      },
                    },
                  },
                  { safe: true },
                  callback()
                );
              },

              people_request: function (callback) {
                db.peoples.updateOne(
                  { _id: userId },
                  {
                    $push: {
                      requests: {
                        $each: [ObjectID(resourceId)],
                        $position: 0,
                      },
                      channelsRequestsIds: {
                        $each: [ObjectID(channelId)],
                        $position: 0,
                      },
                    },
                  },
                  // { $push:
                  //   {
                  //     "requests": ObjectID(resourceId),
                  //     "channelsRequestsIds": ObjectID(channelId),
                  //   },
                  // },
                  { safe: true },
                  callback()
                );
              },

              people_admins: function (callback) {
                console.log("peopleIds", peopleIds);
                db.peoples.updateMany(
                  { _id: { $in: peopleIds } },
                  {
                    $push: {
                      channelsRequestsIds: {
                        $each: [ObjectID(channelId)],
                        $position: 0,
                      },
                    },
                  },
                  { multi: true, safe: true },
                  callback()
                );
              },
            },
            function (err) {
              cb(err, channelId);
            }
          );
        } else {
          cb(null, channelId);
        }
      },
    ],
    function (err, channelId) {
      if (err) {
        callback(err);
      } else {
        callback(err, err ? null : channelId);
      }
    }
  );
}

export function channel_items(resourceId, callback) {
  db.resources
    .find({ _id: ObjectID(resourceId) })
    .project({ requests: 1 })
    .next()
    .then(function (item) {
      callback(
        null,
        item.requests.map((r) => r.channelId)
      );
    });
}

export function put_table(data, mode: number, resourceId: string, callback) {
  data._id = ObjectID().toString();

  const data_clone = JSON.parse(JSON.stringify(data));
  var key: string;

  switch (mode) {
    case 0:
      key = "manuals";
      break;
    case 1:
      key = "codes";
      break;
    case 2:
      key = "cads";
      break;
    case 3:
      key = "inventories";
      break;
    case 4:
      key = "equipments";
      break;
    default:
      console.log("Invalid mode");
  }

  db.resources.updateOne(
    { _id: ObjectID(resourceId) },
    { $push: { [key]: data_clone } },
    function (err, res) {
      if (err) throw err;
      callback(null, data._id);
    }
  );
}

export function post_table(data, mode: number, resourceId: string, callback) {
  const data_clone = JSON.parse(JSON.stringify(data));
  var key: string;
  var fields;

  switch (mode) {
    case 0: {
      key = "manuals";
      fields = {
        "manuals.$.name": data_clone.name,
        "manuals.$.version": data_clone.version,
        "manuals.$.date": data_clone.date,
        "manuals.$.description": data_clone.description,
        "manuals.$.files": data_clone.files,
      };
      break;
    }
    case 1: {
      key = "codes";
      fields = {
        "codes.$.name": data_clone.name,
        "codes.$.version": data_clone.version,
        "codes.$.date": data_clone.date,
        "codes.$.description": data_clone.description,
        "codes.$.git": data_clone.git,
        "codes.$.files": data_clone.files,
      };
      break;
    }
    case 2: {
      key = "cads";
      fields = {
        "cads.$.name": data_clone.name,
        "cads.$.version": data_clone.version,
        "cads.$.date": data_clone.date,
        "cads.$.description": data_clone.description,
        "cads.$.files": data_clone.files,
      };
      break;
    }
    case 3: {
      key = "inventories";
      fields = {
        "inventories.$.pic": data_clone.pic,
        "inventories.$.name": data_clone.name,
        "inventories.$.description": data_clone.description,
        "inventories.$.vendor": data_clone.vendor,
        "inventories.$.model": data_clone.model,
        "inventories.$.price": data_clone.price,
        "inventories.$.quantity": data_clone.quantity,
        "inventories.$.link": data_clone.link,
        "inventories.$.files": data_clone.files,
      };
      break;
    }
    case 4: {
      key = "equipments";
      fields = {
        "equipments.$.pic": data_clone.pic,
        "equipments.$.name": data_clone.name,
        "equipments.$.description": data_clone.description,
        "equipments.$.manufacturer": data_clone.manufacturer,
        "equipments.$.model": data_clone.model,
        "equipments.$.link": data_clone.link,
        "equipments.$.files": data_clone.files,
      };
      break;
    }
    default:
      console.log("Invalid mode");
  }

  db.resources
    .find({ _id: ObjectID(resourceId), [key + "._id"]: data_clone._id })
    .project({ [key + ".$.pic"]: 1 })
    .next()
    .then(function (item) {
      var currentPic = item[key][0].pic;
      db.resources.updateOne(
        { _id: ObjectID(resourceId), [key + "._id"]: data_clone._id },
        { $set: fields },
        { safe: true },
        function (err, res) {
          if (data_clone.pic == currentPic) {
            callback();
          } else {
            pics.delete_pic_direct(currentPic, function (err) {
              callback();
            });
          }
        }
      );
      // pics.delete_pic_gallery(item[key][0].files, function(err) { })
    });
}

export function delete_table(
  mode: number,
  itemId: string,
  resourceId: string,
  callback
) {
  var key: string;

  switch (mode) {
    case 0:
      key = "manuals";
      break;
    case 1:
      key = "codes";
      break;
    case 2:
      key = "cads";
      break;
    case 3:
      key = "inventories";
      break;
    case 4:
      key = "equipments";
      break;
    default:
      console.log("Invalid mode");
  }

  db.resources
    .find({ _id: ObjectID(resourceId), [key + "._id"]: itemId })
    .project({ [key + ".$"]: 1 })
    .next()
    .then(function (item) {
      pics.delete_pic_direct(item[key][0].pic, function (err) {
        pics.delete_pic_gallery(item[key][0].files, function (err) {
          db.resources.updateOne(
            { _id: ObjectID(resourceId) },
            { $pull: { [key]: { _id: itemId } } },
            { multi: false, safe: true },
            callback()
          );
        });
      });
    });
}

function invalid_resource_name() {
  return backhelp.error(
    "invalid_resource_name",
    "Group names can have letters, #s, _ and, -"
  );
}
