var db = require('../db.ts'),
    async = require('async'),
    backhelp = require("./backend_helpers.ts");

var ObjectID = require('mongodb').ObjectID;

var peoples = require("./peoples.ts");
var groups = require("./groups.ts");
var news = require("./news.ts");
var shared = require("./shared.ts");
var pics = require("./pics.ts");

var emails = require("../misc/emails.ts");

import {objectMini, groupComplex} from '../models/shared.ts';
import {fundingRole} from '../models/fundings.ts';

exports.version = "0.1.0";

var roleType: string[] = ['none', 'PI', 'Coordinator', 'Speaker'];

export function put_funding(groupId: string, userId: string, type: number, adminFlag: boolean, data, callback) {
    var data_clone;
    var typeName: string;

    if (type==0) {
      typeName = "fundingsItems.currentFundingsIds";
    } else if (type==1) {
      typeName = "fundingsItems.pastFundingsIds";
    }

    async.waterfall([
        // 1. validate data.
        function (cb) {
          try {
            const reqFields: string[] = [ "name", "abbr", "link", "description" ];
              backhelp.verify(data, reqFields);
          } catch (e) {
              cb(e);
              return;
          }
          cb(null, data);
        },

        // 2. set Roles status
        // function (funding_data, cb) {
        //   data_clone = JSON.parse(JSON.stringify(funding_data));
        //   async.forEachOf(data_clone.roles, function (role, key, callback) {
        //     data_clone.roles[key].status = role.status;
        //     callback();
        //   }, function (err) {
        //     cb(err, data_clone);
        //   });
        // },

        // 2. create Funding document
        function (funding_data, cb) {
          data_clone = JSON.parse(JSON.stringify(funding_data));

          createFundingDocument(data_clone, groupId, adminFlag, function (err, fundingId) {
            cb(null, fundingId, data_clone)
          });
        },

        // 3. insert Funding ID to Group
        function (fundingId, data_clone, cb) {
          db.groups.updateOne(
             {_id: ObjectID(groupId)},
             {
               $push: { [typeName]: fundingId },
               $set: { "progress.13": 1}
             },
             { safe: true },
             cb(null, fundingId, data_clone)
          )
        },

        // 4A. Group Name
        function (fundingId, data_clone, cb) {
          var fundingLink: string;

          groups.groups_list([ObjectID(groupId)], null, null, null, null, 2, true, function (err, item) {
            fundingLink = "https://www.academig.com/#/" + item[0].groupIndex.university.link + '/' + item[0].groupIndex.department.link + '/' + item[0].groupIndex.group.link + '/projects/fundings/';
            cb(err, fundingId, data_clone, item[0].groupIndex.group.name, fundingLink)
          })
        },

        // 4B. invite People
        function (fundingId, data_clone, groupName, fundingLink, cb) {
          async.forEachOf(data_clone.roles, function (role, key, callback) {
            db.peoples.updateOne(
               {_id: role.member._id},
               { $push: { "fundingsIds": ObjectID(fundingId) } },
               { safe: true },
             ).then(function(item) {
               if (userId==role.member._id) {
                 callback()
               } else {
                 news.add_notification(userId, 11000, groupId, role.member._id, groupId, [], null, null, null, function (err) {
                   peoples.people_email(role.member._id, function (err, user) {
                     // emails.itemInviteEmail(data_clone.name, fundingLink, groupName, roleType[role.type], user.name, 0, user.personalInfo.email, function (err) {
                       callback(err)
                     // })
                   })
                 });
               }
             })
          }, function (err) {
            var itemMini: objectMini = {"_id": fundingId, "name": data_clone.name, "pic": data_clone.pic};
            cb(err, itemMini);
          });
        },

        // 5. insert Funding ID to Projects Fundings List
        function (itemMini: objectMini, cb) {
          if (data_clone.projects) {
            db.projects.updateMany(
               {_id: {$in: data_clone.projects.map(r => ObjectID(r._id))}},
               { $push: { "fundings": itemMini } },
               { multi: true, safe: true },
               cb(null, itemMini._id)
            )
          } else {
            cb(null, itemMini._id)
          }
        },

        // 6. push News
        function (fundingId, cb) {
          if (adminFlag && data_clone.ai) {
            cb(null, fundingId)
          } else {
            push_news(userId, fundingId, groupId, data_clone.description, function (err) {
              cb(err, fundingId)
            })
          }
        }

    ],
    function (err, fundingId) {
        if (err) {
          callback(err);
        } else {
          callback(err, err ? null : fundingId);
        }
    });
};

export function push_news(userId: string, fundingId: string, groupId: string, description: string, callback) {
  news.add_activity(0, userId, 1006, fundingId, groupId, fundingId, [], description, null, null, false, function (err) {
    groups.groupMembers(groupId, 3, function (err, actives) {
      async.forEachOf(actives.map(r => r._id), function (activeId, key, cb) {
        if (activeId==userId) {
          cb()
        } else {
          news.add_notification(userId, 1006, groupId, activeId, groupId, [], description, null, null, function (err) {
            cb()
          });
        }
      }, function (err) {
        callback(err)
      })
    })
  })
}

export function post_funding(fundingId: string, data, callback) {

  async.waterfall([

      // 1. validate data.
      function (cb) {
          try {
              const reqFields: string[] = [ "name", "abbr", "link", "description" ];
              backhelp.verify(data, reqFields);
          } catch (e) {
              cb(e);
              return;
          }
          cb(null, data);
      },

      // 2. update Project List
      // function (funding_data, cb) {
      //   const data_clone = JSON.parse(JSON.stringify(funding_data)); // clone object
      //
      //   shared.post_mini(data_clone.projects, fundingId, null, 4, null, function (err, newsId) {
      //     cb(err, data_clone)
      //   });
      // },

      // 3. update Funding document
      function (funding_data, cb) {
        const data_clone = JSON.parse(JSON.stringify(funding_data)); // clone object

        pics.delete_pic("fundings", "pic", fundingId, funding_data.pic, false, function(err) {
          db.fundings.updateOne(
             {_id: ObjectID(fundingId)},
             { $set:
               {
                 "name": funding_data.name,
                 "pic": funding_data.pic,

                 "officalId": funding_data.officalId,
                 "abbr": funding_data.abbr,
                 "link": funding_data.link,
                 "description": funding_data.description,
                 "periods": funding_data.periods,
                 "totalAmounts": funding_data.totalAmounts,
                 // "roles": funding_data.roles,
                 // "projects": funding_data.projects.map(r => {r._id = ObjectID(r._id); return r})
                 "projects": [],
               },
             },
             { safe: true },
             cb(null, fundingId)
          );
        })
      },

      // 4. update Funding document
      // function (funding_data, cb) {
      //   db.fundings.find(
      //     {_id: ObjectID(fundingId)},
      //     { "_id": 0, "projects": 1}
      //   ).next().then(function(item) {
      //     if (item.projects) {
      //       db.projects.updateMany(
      //          {_id: {$in: item.projects.map(r => ObjectID(r._id))}, "fundings._id": ObjectID(fundingId)},
      //          { $set: {
      //                   "fundings.$.name": funding_data.name,
      //                   "fundings.$.pic": funding_data.pic
      //                  },
      //          },
      //          { multi: true, safe: true },
      //          cb(null, fundingId)
      //       )
      //     } else {
      //       cb(null, fundingId)
      //     }
      //   })
      // }

  ],
  function (err, fundingId) {
      // 4. convert errors to something we like.
      if (err) {
        callback(err);
      } else {
        callback(err, err ? null : fundingId);
      }
  });
};

export function delete_funding(groupId: string, fundingId: string, type: number, callback) {
  var typeName: string;

  if (type==0) {
    typeName = "fundingsItems.currentFundingsIds";
  } else if (type==1) {
    typeName = "fundingsItems.pastFundingsIds";
  }

  async.waterfall([

    // 1. delete Funding Link from Group
    function (cb) {
      var progress: number = 1;

      db.groups
        .find({_id: ObjectID(groupId)})
        .project({_id: 0, "fundingsItems.currentFundingsIds": 1, "fundingsItems.pastFundingsIds": 1})
      .next().then(function(item) {
        if (
            (type==0 && item.fundingsItems.currentFundingsIds.length==1 && item.fundingsItems.pastFundingsIds.length==0)
            ||
            (type==1 && item.fundingsItems.currentFundingsIds.length==0 && item.fundingsItems.pastFundingsIds.length==1)
        ) {
          progress = 0;
        }

        db.groups.updateOne(
           {_id: ObjectID(groupId)},
           {
             $set: { "progress.13": progress },
             $pull: { [typeName]: ObjectID(fundingId) },
           },
           { multi: false, safe: true },
           cb()
        )
      });
    },

    // 2. delete Group Link from Funding
    function (cb) {
      db.fundings.updateOne(
        { _id: ObjectID(fundingId)},
        { $pull: { "groupsIds": ObjectID(groupId) } },
        { multi: false, safe: true },
        cb()
      )
    },

    // 3. Funding delete criteria
    function (cb) {
      db.fundings
        .find({_id: ObjectID(fundingId)})
        .project({_id: 0, roles: 1, groupsIds: 1})
        .next().then(function(items) {
          cb(null, items.groupsIds.length==1)
        })
    },

    // 4. delete Funding People, Projects Links (+ Notification)
    function (flag: boolean, cb) {

      db.fundings
        .find({_id: ObjectID(fundingId)})
        .project({_id: 0, pic: 1, roles: 1, projects: 1})
      .next().then(function(item) {

        async.parallel({

          roles: function (cb) {
            if (item.roles && flag) {
              db.peoples.updateMany(
                 {_id: {$in: item.roles.map(r => r.member._id)}},
                 // {_id: {$in: item.roles.map(r => ObjectID(r.member._id))}},
                 { $pull: { "fundingsIds": ObjectID(fundingId) } },
                 { multi: true, safe: true },
                 cb()
              )
              // async.forEachOf(item.roles, function (role, key, callback) {
                // send notifications
              // }, function (err) {
                // cb(err, fundingId);
              // });

            } else {
              cb()
            }
          },

          projects: function (cb) {
            if (item.projects && flag) {
              db.projects.updateMany(
                 {_id: {$in: item.projects.map(r => ObjectID(r._id))}},
                 { $pull: { "fundings": {"_id": ObjectID(fundingId)} } },
                 { multi: true, safe: true },
                 cb()
              )
            } else {
              cb()
            }
          },

          pic: function (cb) {
            pics.delete_pic_direct(item.pic, function(err) {
              cb()
            })
          },

        },

        function (err) {
          cb(err, flag);
        });

      })
    },

    // 5. delete Funding Item
    function (flag: boolean, cb) {
      if (flag) {
        db.fundings.deleteOne({ _id: ObjectID(fundingId) },
                              { safe: true },
                              cb());
      } else {
        cb();
      }
    },

    // 6. delete Funding News
    function (cb) {
      news.remove_activity(groupId, fundingId, 0, function (err, newsId) {
        cb();
      });
    }

  ],
  function (err) {
    callback(err);
  });

}

export function delete_people(userId: string, ids: string[], callback) {
  db.fundings.updateOne(
    { _id: {$in: ids} },
    { $pull: { "roles": {"member._id": userId } } },
    { multi: false, safe: true },
    callback()
  )
}

function createFundingDocument(data, groupId: string, adminFlag: boolean, callback) {

  db.fundings.insertOne(
    {
      "name": data.name,
      "pic": data.pic,
      "created_on": new Date(),
      "groupsIds": [ObjectID(groupId)],

      "ai": (adminFlag && data.ai) ? 1 : 0,

      "officalId": data.officalId,
      "abbr": data.abbr,
      "link": data.link,
      "description": data.description,
      "periods": data.periods,
      "totalAmounts": data.totalAmounts,
      "roles": data.roles,
      // "roles": data.roles.map(r => {r.member._id = ObjectID(r.member._id); return r}),
      // "projects": data.projects.map(r => {r._id = ObjectID(r._id); return r})
      "projects": []
    },
    { w: 1, safe: true }, function(err, docsInserted) {
      callback(null, docsInserted.insertedId);
    }
  );

}

export function fundings_search_ids(text, search_in, search_sort, callback) {
// export function group_search_ids(sort_field, sort_desc, skip, count, callback) {
    // var sort = {};
    // sort[sort_field] = sort_desc ? -1 : 1;
    // db.groups.find({},{ _id: 1})
    //     // .sort(sort)
    //     // .limit(count)
    //     // .skip(skip)
    //     .toArray(callback);

    db.fundings
      .find({})
      .project({_id: 1})
    .toArray().then(function(items) {
      const ids = items.map( function(id) { return id._id; })
      callback(null, ids)
    });
};

export function fundings_list(fundingsIds: string[], mini: number, aiStatus: number, callback) {
  var m = { "$match" : {"_id" : { "$in" : fundingsIds }, "ai": (aiStatus==1) ? 1 : {$in: [null, 0]} } };
  var a = { "$addFields" : { "__order" : { "$indexOfArray" : [ fundingsIds, "$_id" ] } } };
  var s = { "$sort" : { "__order" : 1 } };

  var f = (mini) ? ({ "$project" : {
                                    _id: 1, name: 1, pic: 1
                                   }
                   }) :
                   ({ "$project" : {
                                    _id: 1, name: 1, pic: 1, projects: 1, groupsIds: 1,
                                    officalId: 1, abbr: 1, link: 1, description: 1,
                                    periods: 1, totalAmounts: 1, roles: 1,
                                   }
                   });

  db.fundings.aggregate( [ m, a, s, f ] ).toArray(callback);

}

export function profile_fundings(peopleId: string, callback) {
  db.peoples
    .find({ _id: peopleId })
    .project({ _id: 0, fundings: 1 })
    .next(callback)
}

// %%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%
// %%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%
// %%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%
// %%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%

export function put_funding_roles(fundingId: string, groupId: string, userId: string, roles: fundingRole[], callback) {
    var roles_clone;

    async.waterfall([
        // 1. validate data.
        function (cb) {
            try {
              // const reqFields: string[] = [ "member", "type", "status", "description" ];
              const reqFields: string[] = [ "member", "type", "status" ];
                roles.forEach(function(role) { backhelp.verify(role, reqFields) })
            } catch (e) {
                cb(e);
                return;
            }
            cb(null, roles);
        },

        // 2. insert new Role to Funding
        function (roles, cb) {
          roles_clone = JSON.parse(JSON.stringify(roles));

          db.fundings.updateOne(
             {_id: ObjectID(fundingId)},
             { $push: { "roles": { $each: roles_clone } } },
             { safe: true },
             cb(null, roles_clone)
          )
        },

        // 3A. Group Name
        function (roles_clone, cb) {
          var fundingLink: string;

          groups.groups_list([ObjectID(groupId)], null, null, null, null, 2, true, function (err, item) {
            fundingLink = "https://www.academig.com/#/" + item[0].groupIndex.university.link + '/' + item[0].groupIndex.department.link + '/' + item[0].groupIndex.group.link + '/projects/fundings/';
            cb(err, roles_clone, item[0].groupIndex.group.name, fundingLink)
          })
        },

        // 3B. invite People
        function (roles_clone, groupName, fundingLink, cb) {
          async.forEachOf(roles_clone, function (role, key, callback) {
            db.peoples.updateOne(
               {_id: role.member._id},
               { $push: { "fundingsIds": ObjectID(fundingId) } },
               { safe: true },
            ).then(function(item) {
              if (userId==role.member._id) {
                callback()
              } else {
                news.add_notification(userId, 11000, groupId, role.member._id, groupId, [], null, null, null, function (err) {
                 peoples.people_email(role.member._id, function (err, user) {
                   // emails.itemInviteEmail(roles_clone.name, fundingLink, groupName, roleType[role.type], user.name, 0, user.personalInfo.email, function (err) {
                     callback(err)
                   // })
                 })
                });
              }
            })
          }, function (err) {
            cb(err, fundingId);
          });
        }
    ],
    function (err, fundingId) {
        // 5. convert errors to something we like.
        if (err) {
          callback(err);
        } else {
          callback(err, err ? null : fundingId);
        }
    });
};

export function post_funding_role(fundingId: string, roleId: string, type: number, description: string, callback) {
  async.waterfall([

      // 1. update Funding Role
      function (cb) {
        db.fundings.updateOne(
           {_id: ObjectID(fundingId), "roles.member._id": roleId},
           { $set:
             {
               "roles.$.type": type,
               "roles.$.status": 2,
               "roles.$.description": description,
             },
           },
           { safe: true },
           cb()
        );
      },

      // 2. get Funding first Group and Roles
      function (cb) {
        db.fundings
          .find({_id: ObjectID(fundingId)})
          .project({_id: 0, "groupsIds": {$slice: [0,1]}, "roles.member._id": 1})
        .next().then(function(item) {
          cb(null,item.groupsIds[0],item.roles.map(r => r.member._id))
        })
      },

      // 3. send Notification
      function (groupId, peoplesIds, cb) {
        async.forEachOf(peoplesIds, function (peopleId, key, callback) {
          if (roleId==peopleId) {
            callback()
          } else {
            news.add_notification(roleId, 11001, groupId, peopleId, groupId, [], null, null, null, function (err) {
               // peoples.people_email(role.member._id, function (err, user) {
                 // emails.itemInviteEmail(roles_clone.name, fundingLink, groupName, roleType[role.type], user.name, 0, user.personalInfo.email, function (err) {
                   callback(err)
                 // })
               // })
            });
          }
        }, function (err) {
          cb(err);
        });
      }

  ],
  function (err) {
      // 3. convert errors to something we like.
      if (err) {
        callback(err);
      } else {
        callback(err, null);
      }
  });
};

export function delete_funding_role(fundingId: string, roleId: string, type: number, callback) {
  async.parallel({

      // 1. delete Funding Role
      role: function (cb) {
        db.fundings.updateOne(
          { _id: ObjectID(fundingId)},
          { $pull: { "roles": {"member._id": roleId } } },
          { multi: false, safe: true },
          cb()
        )
      },

      // 2. delete People Role Link (+ Notification)
      people: function (cb) {
        db.peoples.updateOne(
          { _id: roleId},
          { $pull: {"fundingsIds": ObjectID(fundingId) } },
          { multi: false, safe: true },
          cb()
        )
      },

      // 3. send Notification
      notification: function (cb) {
        if (type==0) { // Decline Invite
          db.fundings
            .find({_id: ObjectID(fundingId)})
            .project({_id: 0, "groupsIds": {$slice: [0,1]}, "roles.member._id": 1})
          .next().then(function(item) {
            async.forEachOf(item.roles.map(r => r.member._id), function (peopleId, key, callback) {
              if (roleId==peopleId) {
                callback()
              } else {
                news.add_notification(roleId, 11002, item.groupsIds[0], peopleId, item.groupsIds[0], [], null, null, null, function (err) {
                 // peoples.people_email(role.member._id, function (err, user) {
                   // emails.itemInviteEmail(roles_clone.name, fundingLink, groupName, roleType[role.type], user.name, 0, user.personalInfo.email, function (err) {
                     callback(err)
                   // })
                 // })
                });
              }
            }, function (err) {
              cb(err);
            });
          })
        } else { // Delete Role
          cb()
        }
      }

  },
  function (err, results) {
      // 4. convert errors to something we like.
      if (err) {
        callback(err);
      } else {
        callback(err, err ? null : results);
      }
  });

}

// %%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%
// %%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%
// %%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%
// %%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%

export function put_funding_group(fundingId: string, groupId: string, callback) {
    var roles_clone;

    async.waterfall([

      // 1. get GroupComplex object
      // function (cb) {
      //   groups.groups_list([ObjectID(groupId)], null, null, null, null, 2, false, function (err, group) {
      //     cb(err,group[0].groupIndex);
      //   });
      // },

      // 2. insert Group Object to Funding
      // function (group, cb) {
      function (cb) {
        db.fundings.updateOne(
           {_id: ObjectID(fundingId)},
           { $push: { "groupsIds": ObjectID(groupId) } },
           { safe: true },
           cb(null, roles_clone)
        )
      },

      // 3. insert FundingID to Group
      function (group, cb) {
        db.groups.updateOne(
           {_id: ObjectID(groupId)},
           { $push: { "fundingsItems.currentFundingsIds": ObjectID(fundingId) } },
           { safe: true },
           cb(null, roles_clone)
        )
      },

      // 4. push News
      // function (fundingId, cb) {
      //   const peoplesIds: string[] = data_clone.roles.map(x => x.member._id);
      //
      //   news.add_activity(0, groupId, 1006, fundingId, groupId, fundingId, peoplesIds, data_clone.description, null, null, function (err, newsId) {
      //     cb (null, fundingId)
      //   });
      // },

    ],
    function (err) {
      callback(err);
    });
};

export function delete_funding_group(fundingId: string, groupId: string, callback) {

  async.parallel({

      // 1. pull GroupID from Funding
      funding: function (cb) {
        db.fundings.updateOne(
          { _id: ObjectID(fundingId)},
          { $pull: { "groupsIds": ObjectID(groupId) } },
          { multi: false, safe: true },
          cb()
        )
      },

      // 2. pull FundingID from Group
      group: function (cb) {
        db.groups.updateOne(
          { _id: ObjectID(groupId)},
          { $pull: {
                    "fundingsItems.currentFundingsIds": ObjectID(fundingId),
                    "fundingsItems.pastFundingsIds": ObjectID(fundingId),
                   }
          },
          { multi: false, safe: true },
          cb()
        )
      },

      // 2. delete News
      // news: function (cb) {
      //   news.remove_activity(groupId, fundingId, 0, function (err, newsId) {
      //     cb();
      //   });
      // },

  },
  function (err) {
      callback(err);
  });

}

// %%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%
// %%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%
// %%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%
// %%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%

function invalid_funding_name() {
    return backhelp.error("invalid_funding_name",
                          "Funding names can have letters, #s, _ and, -");
}
