var db = require('../db.ts'),
    async = require('async'),
    backhelp = require("./backend_helpers.ts");

var ObjectID = require('mongodb').ObjectID;

var groups = require("./groups.ts");
var peoples = require("./peoples.ts");
var shared = require("./shared.ts");
var news = require("./news.ts");
var shared = require("./shared.ts");

import {Sponsor} from '../models/collaborations.ts';
import {objectMini} from '../models/shared.ts';

exports.version = "0.1.0";

export function put_collaboration(groupId: string, userId: string, type: number, adminFlag: boolean, data, callback) {
    var data_clone;
    var typeName: string;

    if (type==0) {
      typeName = "collaborationsItems.currentIds";
    } else if (type==1) {
      typeName = "collaborationsItems.pastIds";
    }

    async.waterfall([
        // 1. validate data.
        function (cb) {
            try {
                const reqFields: string[] = [ "groupsIds", "period" ];
                backhelp.verify(data, reqFields);
            } catch (e) {
                cb(e);
                return;
            }
            cb(null, data);
        },

        // 2. create Collaboration document
        function (collaboration_data, cb) {
          data_clone = JSON.parse(JSON.stringify(collaboration_data));

          createCollaborationDocument(data_clone, adminFlag, function (err, collaborationId) {
            cb(null, collaborationId, data_clone.groupsIds[1])
          });
        },

        // 3. insert Collaboration ID to Group
        function (collaborationId: string, collaboratedGroupId: string, cb) {
          db.groups.updateOne(
             {_id: ObjectID(groupId)},
             {
               $push: { [typeName]: collaborationId },
               $set: { "progress.11": 1}
             },
             { safe: true },
             cb(null, collaborationId, collaboratedGroupId)
          );
        },

        // 4. insert Collaboration ID to Approval List of Collaborated Group
        function (collaborationId: string, collaboratedGroupId: string, cb) {

          // console.log('collaboratedGroup',collaboratedGroupId)
          if (ObjectID.isValid(collaboratedGroupId)) {
            db.groups.updateOne(
               {_id: ObjectID(collaboratedGroupId)},
               { $push: { "collaborationsItems.approveIds": collaborationId } },
               { safe: true },
               cb(null, collaborationId, collaboratedGroupId)
            )
          } else {
            cb(null, collaborationId, collaboratedGroupId)
          };
        },

        // 4. retrieve group Mini
        function (collaborationId: string, collaboratedGroupId: string, cb) {
          groups.groups_list([ObjectID(collaboratedGroupId)], null, null, null, null, 2, false, function (err, item) {
            var itemMini: objectMini = {"_id": ObjectID(collaborationId), "name": item[0].groupIndex.group.name, "pic": item[0].groupIndex.group.pic};
            // cb(err, itemMini, collaboratedGroupId)
            cb(err, itemMini._id, collaboratedGroupId)
          });
        },

        // 5. insert Collaboration ID to Projects Collaborations List
        // function (itemMini: objectMini, collaboratedGroupId: string, cb) {
        //   if (data_clone.projects) {
        //     db.projects.updateMany(
        //        {_id: {$in: data_clone.projects.map(r => ObjectID(r._id))}},
        //        { $push: { "collaborations": itemMini } },
        //        { multi: true, safe: true },
        //        cb(null, itemMini._id, collaboratedGroupId)
        //     )
        //   } else {
        //     cb(null, itemMini._id, collaboratedGroupId)
        //   }
        // },

        // 6. Notification: invited Group Admins
        function (collaborationId: string, collaboratedGroupId: string, cb) {
          groups.groupMembers(collaboratedGroupId, 4, function (err, admins) {
            async.forEachOf(admins.map(r => r._id), function (adminId, key, callback) {
              news.add_notification(userId, 10000, collaboratedGroupId, adminId, collaboratedGroupId, [], null, null, null, function (err) {
                callback()
              });
            }, function (err) {
              cb (err, collaborationId)
            })
          })
        },

    ],
    function (err, collaborationId: string) {
        // 7. convert errors to something we like.
        if (err) {
          callback(err);
        } else {
          callback(err, err ? null : collaborationId);
        }
    });
};

export function post_collaboration(collaborationId: string, groupId: string, data, callback) {

  async.waterfall([

      // 1. validate data.
      function (cb) {
          try {
              const reqFields: string[] = [ "period" ];
              backhelp.verify(data, reqFields);
          } catch (e) {
              cb(e);
              return;
          }
          cb(null, data);
      },

      // 2. update Project List
      // function (collaboration_data, cb) {
      //   shared.post_collaboration_project_mini(collaboration_data.projects, collaborationId, groupId, function (err, newsId) {
      //     cb(err, collaboration_data)
      //   });
      // },

      // 3. update Collaboration document
      function (collaboration_data, cb) {
        db.collaborations.updateOne(
           {_id: ObjectID(collaborationId)},
           { $set:
             {
               "period": collaboration_data.period,
               // "projects": collaboration_data.projects,
               "projects": [],
               "text": collaboration_data.text,
             },
           },
           { safe: true },
           cb(null, collaborationId)
        );

      },

  ],
  function (err, collaborationId) {
      // 4. convert errors to something we like.
      if (err) {
        callback(err);
      } else {
        callback(err, err ? null : collaborationId);
      }
  });
};

export function delete_collaboration(groupId: string, userId: string, collaborationId: string, type: number, mode: number, callback) {
  var typeNameRequest: string;
  var typeNameInvited: string;

  if (type==0) {
    typeNameRequest = "collaborationsItems.currentIds";
    typeNameInvited = "collaborationsItems.currentIds";
  } else if (type==1) {
    typeNameRequest = "collaborationsItems.pastIds";
    typeNameInvited = "collaborationsItems.pastIds";
  } else if (type==2) {
    typeNameRequest = "collaborationsItems.approveIds";
    typeNameInvited = "collaborationsItems.pastIds";
  } else if (type==3) {
    typeNameRequest = "collaborationsItems.approveIds";
    typeNameInvited = "collaborationsItems.currentIds";
  };

  async.waterfall([

      // 1. delete Other Group Link
      function (cb) {
        db.collaborations
          .find({_id: ObjectID(collaborationId)})
          .project({_id: 0, "groupsIds": 1})
        .next().then(function(item) {
          // choose the groupID of the "other" Group
          const collaboratedGroupId = ObjectID(item.groupsIds.filter(r => r!=ObjectID(groupId))[0]);
          db.groups.updateOne(
            { _id: ObjectID(collaboratedGroupId) },
            { $pull: {[typeNameInvited]: ObjectID(collaborationId)} },
            { multi: false, safe: true },
            cb(null, collaboratedGroupId)
          )
        });
      },

      // 2. delete Group Link
      function (collaboratedGroupId: string, cb) {
        db.groups.updateOne(
          { _id: ObjectID(groupId) },
          { $pull: { [typeNameRequest]: ObjectID(collaborationId) } },
          { multi: false, safe: true },
          cb(null, collaboratedGroupId)
        )
      },

      // 3. delete Collaboration Projects Links
      function (collaboratedGroupId: string, cb) {
        db.collaborations
          .find({_id: ObjectID(collaborationId)})
          .project({"projects": 1})
        .next().then(function(item) {
          if (item.projects) {
            db.projects.updateMany(
               {_id: {$in: item.projects.map(r => ObjectID(r._id))}},
               { $pull: { "collaborations": {"_id": ObjectID(collaborationId)} } },
               { multi: true, safe: true },
               cb(null, collaboratedGroupId)
            )
          } else {
            cb(null, collaboratedGroupId)
          }
        })
      },

      // 4. delete Collaboration Item
      function (collaboratedGroupId: string, cb) {
        db.collaborations.deleteOne({ _id: ObjectID(collaborationId) },
                              { safe: true },
                              cb(null, collaboratedGroupId));
      },

      // 5. push notification
      function (collaboratedGroupId: string, cb) {
        async.parallel({

          group: function (callback) {
            news.add_activity(0, userId, 1104, collaborationId, groupId, collaborationId, [], null, null, null, false, function (err) {
              groups.groupMembers(groupId, (mode==1) ? 10 : 3, function (err, actives) {
                async.forEachOf(actives.map(r => r._id), function (activeId, key, callback) {
                  if (activeId==userId) {
                    callback()
                  } else {
                    news.add_notification(userId, 1104, groupId, activeId, groupId, [], null, null, null, function (err) {
                      callback()
                    });
                  }
                }, function (err) {
                  callback(err)
                })
              })
            })
          },

          collaboratedGroup: function (callback) {
            news.add_activity(0, userId, 1104, collaborationId, collaboratedGroupId, collaborationId, [], null, null, null, false, function (err) {
              groups.groupMembers(collaboratedGroupId, (mode==1) ? 4 : 3, function (err, actives) {
                async.forEachOf(actives.map(r => r._id), function (activeId, key, callback) {
                  news.add_notification(userId, (mode==1) ? 10002 : 1104, collaboratedGroupId, activeId, collaboratedGroupId, [], null, null, null, function (err) {
                    callback()
                  });
                }, function (err) {
                  callback(err)
                })
              })
            })
          }

        },
        function (err) {
          cb(err);
        });

      },

      // 6. delete Collaboration News (if Approved? Exist?)
      function (cb) {
        news.remove_activity(groupId, collaborationId, 0, function (err, newsId) {
          cb();
        });
      },

  ],
  function (err) {
    if (err) {
      callback(err);
    } else {
      callback(err, null);
    }
  });

}

export function approve_collaboration(groupId: string, userId: string, collaborationId: string, callback) {
  var pushTo: string;

  async.waterfall([

    // 1. move Group link
    function (cb) {
      db.collaborations
        .find({_id: ObjectID(collaborationId)})
        .project({_id: 0, "period": 1, "groupsIds": 1})
      .next().then(function(item) {

        pushTo = (item.period.mode==2) ? "collaborationsItems.currentIds" : "collaborationsItems.pastIds";

        db.groups.updateOne(
          { _id: ObjectID(groupId)},
          {
            $pull: {"collaborationsItems.approveIds": ObjectID(collaborationId)},
            $push: {[pushTo]: ObjectID(collaborationId)},
            $set: { "progress.11": 1}
          },
          { multi: false, safe: true },
          cb(null, item.groupsIds[0]) // group[0] is the Group the initiated the collaboration
        )
      });
    },

    // 2. update Collaboration mode
    function (collaboratedGroupId: string, cb) {
      db.collaborations.updateOne(
        {_id: ObjectID(collaborationId)},
        {
          $set: { "status" : 2}
        }, function(err, res) {
          if (err) throw err;
          cb(null, collaboratedGroupId)
        });
    },

    // 3. retrieve Collaboration description
    function (collaboratedGroupId: string, cb) {
      db.collaborations
        .find({_id: ObjectID(collaborationId)})
        .project({ "_id": 0, "text": 1})
      .next().then(function(item) {
        cb(null, collaboratedGroupId, item.text)
      })
    },

    // 3. push news
    function (collaboratedGroupId: string, text: string, cb) {
      async.parallel({

        group: function (callback) {
          news.add_activity(0, userId, 1004, collaboratedGroupId, groupId, collaborationId, [], text, null, null, false, function (err) {
            groups.groupMembers(groupId, 3, function (err, actives) {
              async.forEachOf(actives.map(r => r._id), function (activeId, key, callback) {
                if (activeId==userId) {
                  callback()
                } else {
                  news.add_notification(userId, (actives[key].status>=6) ? 10001 : 1004, groupId, activeId, groupId, [], text, null, null, function (err) {
                    callback()
                  });
                }
              }, function (err) {
                callback(err)
              })
            })
          })
        },

        collaboratedGroup: function (callback) {
          news.add_activity(0, userId, 1004, groupId, collaboratedGroupId, collaborationId, [], text, null, null, false, function (err) {
            groups.groupMembers(collaboratedGroupId, 3, function (err, admins) {
              async.forEachOf(admins.map(r => r._id), function (adminId, key, callback) {
                news.add_notification(userId, (admins[key].status>=6) ? 10001 : 1004, collaboratedGroupId, adminId, collaboratedGroupId, [], text, null, null, function (err) {
                  callback()
                });
              }, function (err) {
                callback(err)
              })
            })
          })
        }

      },
      function (err) {
          callback(err, err ? null : collaborationId);
      });

    },

  ],
  function (err, results) {
      // 5. convert errors to something we like.
      if (err) {
        callback(err);
      } else {
        callback(err, err ? null : results);
      }
  });

}

export function end_collaboration(groupId: string, userId: string, collaborationId: string, callback) {
  var pushTo: string;

  async.series({

    // 1. move Group link
    group: function (cb) {
      db.groups.updateOne(
        { _id: ObjectID(groupId)},
        {
          $pull: {"collaborationsItems.currentIds": ObjectID(collaborationId)},
          $push: {"collaborationsItems.pastIds": ObjectID(collaborationId)},
        },
        { multi: false, safe: true },
        cb()
      )
    },

    // 2. move Other Group link
    other: function (cb) {
      db.collaborations
        .find({_id: ObjectID(collaborationId)})
        .project({_id: 0, "groupsIds": 1})
      .next().then(function(item) {
        // choose the groupID of the "other" Group
        const collaboratorGroupId = ObjectID(item.groupsIds.filter(r => r!=ObjectID(groupId))[0]);

        db.groups.updateOne(
          { _id: ObjectID(collaboratorGroupId)},
          {
            $pull: {"collaborationsItems.currentIds": ObjectID(collaborationId)},
            $push: {"collaborationsItems.pastIds": ObjectID(collaborationId)},
          },
          { multi: false, safe: true },
          cb()
        )
      });
    },

    // 3. update Collaboration end date
    collaboration: function (cb) {
      db.collaborations.updateOne(
        {_id: ObjectID(collaborationId)},
        {
          $set: {
                 "period.mode" : 0,
                 "period.end" : new Date(),
                }
        }, function(err, res) {
          if (err) throw err;
          cb()
        });
    },

  },
  function (err, results) {
      // 3. convert errors to something we like.
      if (err) {
        callback(err);
      } else {
        callback(err, err ? null : results);
      }
  });

}

export function collaboration_search_ids(text, search_in, search_sort, callback) {
// export function group_search_ids(sort_field, sort_desc, skip, count, callback) {
    // var sort = {};
    // sort[sort_field] = sort_desc ? -1 : 1;
    // db.groups.find({},{ _id: 1})
    //     // .sort(sort)
    //     // .limit(count)
    //     // .skip(skip)
    //     .toArray(callback);

    db.collaborations
      .find({})
      .project({_id: 1})
    .toArray().then(function(items) {
      const ids = items.map( function(id) { return id._id; })
      callback(null, ids)
    });
};

function createCollaborationDocument(data, adminFlag: boolean, callback) {

  db.collaborations.insertOne(
    {
      "created_on": new Date(),
      "ai": (adminFlag && data.ai) ? 1 : 0,
      "status": 0,
      "groupsIds": data.groupsIds,
      "period": data.period,
      // "projects": data.projects.map(r => {r._id = ObjectID(r._id); return r}),
      "projects": [],
      "text": data.text
    },
    { w: 1, safe: true }, function(err, docsInserted) {
      callback(null, docsInserted.insertedId);
    }
  );

}

export function collaborations_list(collaborationsIds, mini, callback) {

  var m = { "$match" : {"_id" : { "$in" : collaborationsIds } } };
  var a = { "$addFields" : { "__order" : { "$indexOfArray" : [ collaborationsIds, "$_id" ] } } };
  var s = { "$sort" : { "__order" : 1 } };

  var f = (mini) ? ({ "$project" : {
                                    _id: 1, groupsIds: 1}
                   }) :
                   ({ "$project" : {
                                    _id: 1, status: 1, groupsIds: 1,
                                    period: 1, projects: 1, text: 1
                                   }
                   });

  db.collaborations.aggregate( [ m, a, s, f ] ).toArray(callback);

}

// .map(r => new Collaboration(r.status, r.groupsIds, r.period, r.projects, r.text));

export function put_sponsor(groupId: string, type: number, sponsor: Sponsor, callback) {
  var sponsorType;
  var data_clone;

  if (type==0) {
    sponsorType = 'industries';
  } else if (type==1) {
    sponsorType = 'governments';
  }

  async.waterfall([
      // 1. validate data.
      function (cb) {
          try {
              const reqFields: string[] = [ "name", "link" ];
              backhelp.verify(sponsor, reqFields);
          } catch (e) {
              cb(e);
              return;
          }
          cb(null, sponsor);
      },

      // 2. create Sponsor document
      function (sponsor_data, cb) {
        data_clone = JSON.parse(JSON.stringify(sponsor_data));

        createSponsorDocument(data_clone, function (err, sponsorId) {
          cb(null, sponsorId)
        });
      },

      // 3. insert Sponsor ID to Group
      function (sponsorId, cb) {
        db.groups.updateOne(
           {_id: ObjectID(groupId)},
           { $push: { ['sponsorsItems.' + sponsorType]: sponsorId } },
           { safe: true },
           cb(null, sponsorId)
        )
      },

      // 4. insert Sponsor ID to Projects Sponsor List
      function (sponsorId, cb) {
        if (data_clone.projects) {
          db.projects.updateMany(
             {_id: {$in: data_clone.projects.map(r => ObjectID(r._id))}},
             { $push: { "sponsorsIds": ObjectID(sponsorId) } },
             { multi: true, safe: true },
             cb(null, sponsorId)
          )
        } else {
          cb(null, sponsorId)
        }
      },

  ],
  function (err, sponsorId) {
      // 4. convert errors to something we like.
      if (err) {
        callback(err);
      } else {
        callback(err, err ? null : sponsorId);
      }
  });

}

export function post_sponsor(sponsorId: string, sponsor: Sponsor, callback) {

  async.waterfall([

      // 1. validate data.
      function (cb) {
          try {
              const reqFields: string[] = [ "name" ];
              backhelp.verify(sponsor, reqFields);
          } catch (e) {
              cb(e);
              return;
          }
          cb(null, sponsor);
      },

      // 3. update Media Projects
      function (sponsor_data, cb) {
        shared.post_mini(sponsor_data.projects, sponsorId, null, 6, null, function (err, newsId) {
          cb(err, sponsor_data)
        });
      },

      // 4. update Sponsor document
      function (sponsor_data, cb) {
        db.sponsors.updateOne(
           {_id: ObjectID(sponsorId)},
           { $set:
             {
               "name": sponsor_data.name,
               "link": sponsor_data.link,
               "period": sponsor_data.period,
               "projects": sponsor_data.projects,
             },
           },
           { safe: true },
           cb(null)
        );

      },

  ],
  function (err) {
      // 3. convert errors to something we like.
      if (err) {
        callback(err);
      } else {
        callback(err, err ? null : sponsorId);
      }
  });
};

export function delete_sponsor(groupId: string, sponsorId: string, type: number, callback) {
  var sponsorType;

  if (type==0) {
    sponsorType = 'industries';
  } else if (type==1) {
    sponsorType = 'governments';
  }

  async.parallel({

      // 1. delete Project Group Links
      links: function (cb) {
        db.groups.updateOne(
          { _id: ObjectID(groupId)},
          { $pull: { ['sponsorsItems.' + sponsorType]: {"_id": sponsorId } } },
          { multi: false, safe: true },
          cb()
        )

      },

      // 2. delete Sponsor Project Links
      items: function (cb) {
        db.sponsors
          .find({_id: ObjectID(sponsorId)})
          .project({"projects": 1})
        .next().then(function(item) {

          async.parallel({

            projects: function (cb) {
              if (item.projects) {
                db.projects.updateMany(
                   {_id: {$in: item.projects.map(r => ObjectID(r._id))}},
                   { $pull: { "sponsorsIds": ObjectID(sponsorId) } },
                   { multi: true, safe: true },
                   cb()
                )
              } else {
                cb()
              }
            },

          },

          function (err, results) {
            cb(err)
          });

        })
      },


      // 3. delete Sponsor Item
      sponsor: function (cb) {
        db.sponsors.deleteOne({ _id: ObjectID(sponsorId) },
                              { safe: true },
                              cb());
      },

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

function createSponsorDocument(data, callback) {

  db.sponsors.insertOne(
    {
      "name": data.name,
      "link": data.link,
      "created_on": new Date(),

      "period": data.period,
      "projects": data.projects.map(r => {r._id = ObjectID(r._id); return r}),
    },
    { w: 1, safe: true }, function(err, docsInserted) {
      callback(null, docsInserted.insertedId);
    }
  );

}

export function sponsors_list(sponsorsIds, callback) {

  var m = { "$match" : {"_id" : { "$in" : sponsorsIds } } };
  var a = { "$addFields" : { "__order" : { "$indexOfArray" : [ sponsorsIds, "$_id" ] } } };
  var s = { "$sort" : { "__order" : 1 } };

  var f = ({ "$project" : {
                           _id: 1, name: 1, link: 1,
                           period: 1, projects: 1
                          }
          });

  db.sponsors.aggregate( [ m, a, s, f ] ).toArray(callback);

}

function invalid_collaboration_name() {
    return backhelp.error("invalid_project_name",
                          "Project names can have letters, #s, _ and, -");
}
