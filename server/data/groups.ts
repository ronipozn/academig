var db = require('../db.ts'),
    async = require('async'),
    backhelp = require("./backend_helpers.ts");

var ObjectID = require('mongodb').ObjectID;

var departments = require('./departments.ts');
var universities = require('./universities.ts');
var peoples = require("./peoples.ts");
var contacts = require("./contacts.ts");
var shared = require("./shared.ts");
var admin = require("./admin.ts");
var news = require("./news.ts");
var messages = require("./messages.ts");
var invites = require("./invites.ts");
var pics = require("./pics.ts");

var publications = require("./publications.ts");
var fundings = require("./fundings.ts");

var emails = require("../misc/emails.ts");

const algoliasearch = require('algoliasearch');
const client = algoliasearch('TDKUK8VW4T', '5d17934a8722069c0ac47bd6b4ae4bda');

import { complexName, Affiliation, Countries } from '../models/shared.ts';

exports.version = "0.1.0";

///////////////////////////////////
///////////////////////////////////
///////////// Member //////////////
///////////////////////////////////
///////////////////////////////////

export function create_member(user_data, actorId: string, groupId: string, type: number, adminFlag: boolean, callback) {
    var groupLink;

    // console.log('actorId',actorId)
    // console.log('groupId',groupId)
    // console.log('user_data.groupId',user_data.groupId)

    async.waterfall([

      // 1. validate data
      function (cb) {
        try {
          if (type==1) {
            backhelp.verify(user_data, [ "name", "status", "period", "groupId" ]);
          } else {
            backhelp.verify(user_data, [ "name", "status", "titles", "period", "groupId" ]);
          }
        } catch (e) {
          cb(e);
          return
        }
        cb(null);
      },

      // 2. Request to Join / Create "Invited User document" (Flag) - user_id: Target, the new member user ID
      function (cb) {
        if (user_data._id) { // Existing user
          cb(null, user_data._id)
        } else { // Invited user
          peoples.createPeopleDocument(1, 0, user_data, function (err, user_id) {
            cb(err, user_id)
          });
        }
      },

      // 3. push User ID to group
      function (user_id: string, cb) {
        var memberType: string;
        var titleType: number;

        if (type==0) {
          memberType = 'activesIds';
          titleType = Math.floor(user_data.titles[0]/100);
        } else if (type==1) {
          memberType = 'visitorsIds';
          titleType = 0;
        } else if (type==2) {
          memberType = 'alumniIds';
          titleType = Math.floor(user_data.titles[0]/100)-1;
        }

        db.groups
          // .find({_id: ObjectID(groupId)})
          .find({_id: ObjectID(user_data.groupId)})
          .project({_id: 0, buildMode: 1, ['peoplesPageItems.' + memberType]: 1})
        .next().then(function(items) {

          var counterPointer: number[];
          if (type==0) {
            counterPointer = counterPointerFunc(items.peoplesPageItems.activesIds);
          } else if (type==1) {
            counterPointer = counterPointerFunc(items.peoplesPageItems.visitorsIds);
          } else if (type==2) {
            counterPointer = counterPointerFunc(items.peoplesPageItems.alumniIds);
          }

          var insertIndex = counterPointer[titleType+1];

          db.groups.findOneAndUpdate(
             { _id: ObjectID(user_data.groupId) },
             {
               $inc: { ['peoplesPageItems.' + memberType + "." + titleType] : 1, "membersCount" : 1 },
               $push: { ['peoplesItems.' + memberType]: { $each: [ user_id ], $position: insertIndex } },
               $set: { "progress.4": 1 }
             },
             { safe: true },
             function(err, doc) {
               if (err) {
                 throw err;
               } else if (doc) {

                 if (items.buildMode==4 || items.buildMode==5 || items.buildMode==7) {
                   var algoliaIndex = client.initIndex((process.env.PORT) ? 'companies': 'dev_companies');
                 } else {
                   var algoliaIndex = client.initIndex((process.env.PORT) ? 'labs': 'dev_labs');
                 }

                 algoliaIndex.getObject(user_data.groupId, (err, content) => {
                   if (content==undefined) {
                     cb(null, user_id)
                   } else {
                     const object = {
                       _id: user_id,
                       name: user_data.name,
                       pic: user_data.pic,
                     };
                     content.peoples.push(object);
                     algoliaIndex.partialUpdateObject({
                       objectID: user_data.groupId,
                       // membersCount: doc.value.membersCount+1,
                       peoples: content.peoples
                     }, (err, content) => {
                       cb(err, user_id)
                     });
                   }
                 });
               }
             }
          )
        })
      },

      // 4. push User ID to Group Channel
      function (user_id: string, cb) {
        db.groups
          .find({ _id: ObjectID(user_data.groupId) })
          .project({ _id: 0, channelId: 1})
        .next().then(function(item) {
          messages.put_member(item.channelId, user_data._id, function (err) {
            cb(null, user_id, item.channelId)
          });
        });
      },

      // 6. push Member Invite (Flag)
      function (user_id: string, channelId: string, cb) {
        console.log('6',user_data.email)
        if (user_data._id || user_data.email==null) { // Existing user or Email==null
          cb(null, user_id, channelId)
        } else { // Invite user
          invites.push_non_user_invite(user_id, user_data.email, user_data.groupId, 1+type, function (err) {
            cb(err, user_id, channelId)
          });
        }
      },

      // 7. create User Position
      function (user_id: string, channelId: string, cb) {
        const people_position_data = {"_id": ObjectID(),
                                      "status": user_data.status,
                                      "mode": user_data.mode,
                                      "period": {"start": user_data.period.start,
                                                 "end": user_data.period.end,
                                                 "mode": user_data.period.mode},
                                      "titles": user_data.titles,
                                      "groupId": user_data.groupId,
                                      "text": user_data.text,
                                      "degree": user_data.degree
                                     };

        // actorId
        peoples.create_position(user_id, channelId, people_position_data, false, type, function (err, id) {
          cb(err, user_id)
        });
      },

      // 8. push Notification
      function (user_id: string, cb) {

        var groupLink: string;
        var groupIndex;

        groups_list([ObjectID(user_data.groupId)], null, null, null, null, 2, true, function (err, items) {
          groupIndex = items[0].groupIndex;
          groupLink = groupIndex.university.link + '/' + groupIndex.department.link + '/' + groupIndex.group.link + '/people/';
          if (user_data.mode==4) { // user requests to join group

            groupMembers(user_data.groupId, 4, function (err, admins) {
              async.forEachOf(admins.map(r => r._id), function (adminId, key, callback) {
                peoples.people_email(user_data._id, function (err, user) {
                  peoples.people_email(adminId, function (err, admin) {
                    emails.joinGroupEmail(groupIndex.group.name,
                                          groupLink,
                                          peoples.titlesTypes(user_data.titles),
                                          user.name,
                                          user_data.mode,
                                          admin.personalInfo.email,
                                          null,
                                          null,
                                          true,
                                          function (err) {
                      news.add_notification(user_data._id, (type==0) ? 4000 : 4100, user_data.groupId, adminId, user_data.groupId, [], user_data.titles, null, null, function (err) {
                        callback(err)
                      });
                    });
                  });
                });
              }, function (err) {
                cb(err, user_id);
              });
            });

          } else if (user_data.mode==0) { // Super Admin Invites User

            if (user_data._id) { // Existing User

              peoples.people_email(user_data._id, function (err, user) {
                emails.joinGroupEmail(groupIndex.group.name,
                                      groupLink,
                                      peoples.titlesTypes(user_data.titles),
                                      user.name,
                                      user_data.mode,
                                      user.personalInfo.email,
                                      null,
                                      null,
                                      true,
                                      function (err) {
                  news.add_notification(actorId, (type==0) ? 4500 : 4600, user_data.groupId, user_data._id, user_data.groupId, [], user_data.titles, groupLink, null, function (err, newsId) {
                    cb(err, user_id)
                  });
                });
              });

            } else if (user_data.email) { // Non-Exist User

              peoples.people_email(actorId, function (err, actor) {
                // if (actorId=="academig") {
                if (adminFlag) {
                  emails.memberMarketingInvite(user_data.name,
                                               user_data.email,
                                               (items && items[0].marketing) ? items[0].marketing.url : null,
                                               (items && items[0].marketing) ? items[0].marketing.pics : null,
                                               groupLink,
                                               groupIndex.group.name,
                                               groupIndex.university.name,
                                               function (err) {
                    cb(err, user_id)
                  })
                } else {
                  emails.joinGroupEmail(groupIndex.group.name,
                                        groupLink,
                                        peoples.titlesTypes(user_data.titles),
                                        actor.name,
                                        user_data.mode,
                                        user_data.email,
                                        actor.pic,
                                        actor._id,
                                        false,
                                        function (err) {
                    cb(err, user_id)
                  })
                }
              })

            } else { // Non-Exist User + No Email

              cb(err, user_id)

            }

          };

        })
      }

  ],
  function (err, user_id: string) {
    if (err) {
      callback(err);
    } else {
      callback(err, user_id);
    }
  });
};

export function create_dummy_member(user_data, userId: string, callback) {

  async.waterfall([

    // 1. validate data
    function (cb) {
      try {
        backhelp.verify(user_data, [ "titles", "group", "period"]);
      } catch (e) {
        cb(e);
        return
      }
      cb(null);
    },

    // 2. create Dummy Group
    function (cb) {
      db.groups.insertOne(
        { "groupIndex": user_data.group },
        { w: 1, safe: true }, function(err, docInserted) {
          db.groups.updateOne(
            { _id: ObjectID(docInserted.insertedId) },
            { $set: { "groupIndex.group._id": ObjectID(docInserted.insertedId) }
            }, function(err, res) {
              cb(err, docInserted.insertedId)
            });
        }
      );
    },

    // 3. create Dummy User Position
    function (groupId: string, cb) {
      var positionId = ObjectID();
      db.peoples.updateOne(
        { _id: userId },
        { $push:
          {
            "positions": {
              "_id": positionId,
              "status": (user_data.period.mode) ? 9 : 8,
              "mode": user_data.mode,
              "period": user_data.period,
              "titles": user_data.titles,
              "groupId": groupId,
              "text": user_data.text,
              "degree": user_data.degree
            }
          },
        }, function(err, res) {
          cb(err, positionId, groupId)
        }
      );
    }

  ],
  function (err, positionId: string, groupId: string) {
    if (err) {
      callback(err);
    } else {
      callback(err, [groupId, positionId]);
    }
  });
};

export function update_member(people_data, userId: string, groupId: string, type: number, mode: number, groupSuperAdminFlag: boolean, adminFlag: boolean, callback) {

  async.series({
    // 1. update Member Data
    member: function (cb) {

      if (mode==0) { // Update Privilege and Text
        if (groupSuperAdminFlag) {
          db.peoples.updateMany( // update all positions in the same group
            {"_id": people_data._id },
            { $set: {"positions.$[elem].text" : people_data.text,
                     "positions.$[elem].status" : people_data.privilage}
            },
            { multi: true, arrayFilters: [ { "elem.groupId": { $eq: ObjectID(groupId) } } ] },
            // cb()
          ).then(function() {
            if (people_data.pic) {
              db.peoples.updateOne(
                { _id: people_data._id, stage: 0 },
                { $set: { "pic": people_data.pic } },
                cb()
              )
            } else {
              cb()
            }
          })
        } else {
          db.peoples.updateMany( // update all positions in the same group
            { "_id": people_data._id },
            { $set: {"positions.$[elem].text" : people_data.text } },
            { multi: true, arrayFilters: [ { "elem.groupId": { $eq: ObjectID(groupId) } } ] },
            cb()
          )
        }

      } else if (mode==4) { // Update Email + Invite

        update_member_email(people_data.text, people_data._id, userId, groupId, type, adminFlag, function (err) {
          cb(err)
        })

      } else if (mode==1) { // Resend Request (User) / Resend Invite (Admin)
        var groupLink: string;
        var groupIndex;

        groups_list([ObjectID(groupId)], null, null, null, null, 2, true, function (err, items) {
          groupIndex = items[0].groupIndex;
          // groupLink = "https://www.academig.com/#/" + groupIndex.university.link + '/' + groupIndex.department.link + '/' + groupIndex.group.link + '/people/';
          groupLink = groupIndex.university.link + '/' + groupIndex.department.link + '/' + groupIndex.group.link + '/people/';
          peoples.peoples_list([people_data._id, userId], groupId, null, 5, true, function (err, people) {

            if (people_data._id==userId) {

              console.log('Resend Request')
              groupMembers(groupId, 4, function (err, admins) {
                async.forEachOf(admins.map(r => r._id), function (adminId, key, callback) {
                  peoples.people_email(adminId, function (err, admin) {
                    emails.joinGroupEmail(groupIndex.group.name,
                                          groupLink,
                                          peoples.titlesTypes(people[0].positions[0].titles[0]),
                                          people[0].name,
                                          people[0].positions[0].mode,
                                          admin.personalInfo.email,
                                          null,
                                          null,
                                          true,
                                          function (err) {
                      news.add_notification(people_data._id, (type==0) ? 4000 : 4100, groupId, adminId, groupId, [], people[0].positions[0].titles[0], null, null, function (err) {
                        callback(err)
                      });
                    });
                  });
                }, function (err) {
                  cb(err)
                });
              });

            } else {

              console.log('Resend Invite'); // currentWebsite
              // if (userId=="academig") {
              if (adminFlag) {
                emails.memberMarketingInvite(people[0].name,
                                             people[0].personalInfo.email,
                                             items[0].marketing.url,
                                             items[0].marketing.pics,
                                             groupLink,
                                             groupIndex.group.name,
                                             groupIndex.university.name,
                                             function (err) {
                  cb(err)
                })
              } else {
                emails.joinGroupEmail(groupIndex.group.name,
                                      groupLink,
                                      peoples.titlesTypes(people[0].positions[0].titles[0]),
                                      people[1].name,
                                      people[0].positions[0].mode,
                                      people[0].personalInfo.email,
                                      people[1].pic,
                                      userId,
                                      (people[0].stage==0) ? false : true,
                                      function (err) {
                  news.add_notification(userId, (type==0) ? 4500 : 4600, groupId, people[0]._id, groupId, [], people[0].positions[0].titles[0], groupLink, null, function (err, newsId) {
                    cb(err)
                  });
                });
              }

            };

          });
        });

      } else if (mode==3) { // Accept Invite (User) / Accept Request (Admin)

        db.peoples.updateOne(
           { "_id": people_data._id, "positions.groupId": ObjectID(groupId) },
           {
             $set: { "positions.$.mode" : 2 },
             $pull: { "invites": { "groupId": ObjectID(groupId) } }
           },
           { safe: true }
        ).then(function(item) {
          peoples.peoples_list([people_data._id], groupId, null, 3, true, function (err, people) {
            // pull unfollow before joining group to remove from Group Netwroks Followed List
            peoples.toggle_followings_ids(false, 4, people_data._id, 0, groupId, function (err, itemId) {
              news.follow_many(groupId, people_data._id, function (err) {
                news.add_activity(0, people_data._id, 5400, groupId, groupId, groupId, [], people[0].positions[0].titles[0], null, null, false, function (err) {
                  if (userId==people_data._id) { // User accepts invite
                    groupMembers(groupId, 3, function (err, peoples) {
                      async.forEachOf(peoples.map(r => r._id), function (activeId, key, callback) {
                        if (activeId==userId) {
                          callback()
                        } else {
                          news.add_notification(userId, (peoples[key].status==4) ? 5400 : ((type==0) ? 4503 : 4603), groupId, activeId, groupId, [], people[0].positions[0].titles[0], null, null, function (err) {
                            callback()
                          });
                        }
                      }, function (err) {
                        cb(err);
                      })
                    })
                  } else { // Super Admin accepts request
                    db.groups.updateOne(
                       { "_id": ObjectID(groupId) },
                       { $set: { "onInvite": 1 } },
                       { safe: true }
                    ).then(function(item) {
                      groupMembers(groupId, 3, function (err, peoples) {
                        async.forEachOf(peoples.map(r => r._id), function (activeId, key, callback) {
                          if (activeId==userId) {
                            callback()
                          } else {
                            news.add_notification(userId, (userId==people_data._id) ? 5400 : ((type==0) ? 4503 : 4603), groupId, activeId, groupId, [], people[0].positions[0].titles[0], null, null, function (err) {
                              callback()
                            });
                          }
                        }, function (err) {
                          cb(err);
                        })
                      })
                    })
                  }
                })
              })
            })
          })
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
  });

}

function update_member_email(email: string, memberId: string, actorId: string, groupId: string, type: number, adminFlag: boolean, callback) {

  async.waterfall([

    // 1. update Member Email
    function (cb) {
      db.peoples.updateOne(
        {_id: memberId},
        { $set: { "personalInfo.email": email } },
        cb()
      )
    },

    // 2. push Member Invite (Flag)
    function (cb) {
      invites.push_non_user_invite(memberId, email, groupId, 1+type, function (err) {
        cb(err)
      });
    },

    // 3. retrieve Member Data
    function (cb) {
      peoples.peoples_list([memberId], groupId, null, 5, true, function (err, peoples) {
        var people = peoples[0];
        cb(err , people.name, people.positions[0].titles[0])
      });
    },

    // 4. push Notification
    function (name: string, title: string, cb) {
      var groupLink: string;
      var groupIndex;

      groups_list([ObjectID(groupId)], null, null, null, null, 2, true, function (err, items) {
        groupIndex = items[0].groupIndex;
        groupLink = groupIndex.university.link + '/' + groupIndex.department.link + '/' + groupIndex.group.link + '/people/';

        peoples.people_email(actorId, function (err, actor) {
          console.log('actorId',actorId)

          // if (actorId=="academig") {
          if (adminFlag) {
            emails.memberMarketingInvite(name,
                                        email,
                                        items[0].marketing.url,
                                        items[0].marketing.pics,
                                        groupLink,
                                        groupIndex.group.name,
                                        groupIndex.university.name,
                                        function (err) {
              cb(err)
            })
          } else {
            emails.joinGroupEmail(groupIndex.group.name,
                                  groupLink,
                                  peoples.titlesTypes(title),
                                  actor.name,
                                  0,
                                  email,
                                  actor.pic,
                                  actor._id,
                                  false,
                                  function (err) {
              cb(err)
            })
          }
        })

      })
    }

  ],
  function (err) {
    callback(err);
  });
};


export function delete_member(userId: string, groupId: string, peopleId: string, category: number, type: number, emailFlag: boolean, callback) {

  peoples.peoples_list([peopleId], groupId, null, 5, true, function (err, peoples) {
    if (err) throw err;
    var people = peoples[0];

    if (people) {
      if (people.positions[0].status==8 || people.positions[0].status==9) {
        delete_dummy_member(userId,
                            groupId,
                            callback) // dummy position (group+people)
      } else {
        delete_real_member(userId,
                           groupId,
                           peopleId,
                           people.positions[0].titles[0],
                           people.name,
                           people.personalInfo.email,
                           people.stage,
                           people.positions[0].mode,
                           category,
                           type,
                           emailFlag,
                           callback)
      }

    } else {
      callback();
    }

  })
}

function delete_real_member(userId: string,
                            groupId: string,
                            peopleId: string,
                            peopleTitle: number,
                            peopleName: string,
                            peopleEmail: string,
                            stage: number,
                            mode: number,
                            category: number,
                            type: number,
                            emailFlag: boolean,
                            callback) {

  var memberType: string;

  if (type==0) {
    memberType = 'activesIds';
  } else if (type==1) {
    memberType = 'visitorsIds';
  } else if (type==2) {
    memberType = 'alumniIds';
  }

  async.waterfall([

      // 1. pull User ID from Group Channel
      function (cb) {
        if (stage==0) {
            cb(null, null)
        } else {
          db.groups
            .find({ _id: ObjectID(groupId) })
            .project({ _id: 0, channelId: 1})
          .next().then(function(item) {
            messages.delete_member(item.channelId, peopleId, function (err) {
              cb(err, item.channelId)
            });
          });
        }
      },

      // 2. delete Member Document (If Not Exist) / delete Position (If Exist)
      function (channelId: string, cb) {

        if (stage==0) { // Invited User

          db.invites.updateOne(
            { "invites.dummyId": peopleId },
            { $pull: { "invites": { "groupId": ObjectID(groupId) } },
            }, function(err, res) {
              db.peoples.deleteOne(
                { _id: peopleId },
                { safe: true },
                cb(null)
              );
            });

        } else { // Existing User

          db.peoples.updateOne(
            { _id: peopleId },
            {
              $pull: {
                "positions": { "groupId": ObjectID(groupId) },
                "invites": { "groupId": ObjectID(groupId) },
                "channelsGroupsIds": ObjectID(channelId),
                ['groupsRelations.' + memberType]: ObjectID(groupId)
              }
            }, function(err, res) {
              if (err) throw err;
              cb(null)
            });

        };

      },

      // 3. delete Member from Category
      function (cb) {
        db.groups.findOneAndUpdate(
          { _id: ObjectID(groupId)},
          {
            $inc: { ['peoplesPageItems.' + memberType + "." + category] : -1, "membersCount" : -1 },
            $pull: { ['peoplesItems.' + memberType]: peopleId } ,
          },
          { multi: false, safe: true },
          function(err, doc) {
            if (err) {
              throw err;
            } else if (doc) {

              if (doc.value.buildMode==4 || doc.value.buildMode==5 || doc.value.buildMode==7) {
                var algoliaIndex = client.initIndex((process.env.PORT) ? 'companies': 'dev_companies');
              } else {
                var algoliaIndex = client.initIndex((process.env.PORT) ? 'labs': 'dev_labs');
              }

              algoliaIndex.getObject(groupId, (err, content) => {
                if (content==undefined) {
                  cb()
                } else {
                  if (content && content.peoples) {
                    const peoples = content.peoples.filter(r => r._id!=peopleId);
                    algoliaIndex.partialUpdateObject({
                      objectID: groupId,
                      // membersCount: doc.value.membersCount-1,
                      peoples: peoples
                    }, (err, content) => {
                      cb(err)
                    });
                  } else {
                    cb()
                  }
                }
              });

            }
          }
        )
      },

      // 4. pull out or delete associated items
      function (cb) {
        pull_from_items(groupId, peopleId, 1, function (err, item) {
          cb(err)
        })
      },

      // 5. Group Name
      function (cb) {
        if (!emailFlag) {
            cb(null, null)
        } else {
          groups_list([ObjectID(groupId)], null, null, null, null, 2, true, function (err, item) {
            cb(err, item[0].groupIndex.group.name)
          })
        }
      },

      // 6. Push Notification & Send Emails
      function (groupName: string, cb) {
        if (!emailFlag || !peopleEmail) {

          cb()

        } else if (stage==0) { // Invited User

          if (userId==peopleId) { // User Declined Invite
            cb()
          } else { // Super Admin Cancel Invite
            peoples.people_email(userId, function (err, admin) {
              emails.deleteMemberEmail(admin.name,
                                       groupName,
                                       peopleEmail,
                                       1,
                                       function (err) {
                cb(err);
              })
            })
          }

        } else { // Existing User

          if (mode==0) { // Admin sent invitation

            if (userId==peopleId) { // User Declined Invite
              groupMembers(groupId, 4, function (err, admins) {
                async.forEachOf(admins.map(r => r._id), function (adminId, key, callback) {
                  news.add_notification(userId, (type==0) ? 4504 : 4604, groupId, adminId, groupId, [], null, null, null, function (err) {
                    peoples.people_email(adminId, function (err, admin) {
                      emails.deleteMemberEmail(admin.name,
                                               groupName,
                                               admin.personalInfo.email,
                                               0,
                                               function (err) {
                        callback(err)
                      })
                    })
                  });
                }, function (err) {
                  cb(err);
                })
              })
            } else { // Super Admin Cancel Invite
              news.add_notification(userId, (type==0) ? 4501 : 4601, groupId, peopleId, groupId, [], null, null, null, function (err) {
                emails.deleteMemberEmail(peopleName,
                                         groupName,
                                         peopleEmail,
                                         1,
                                         function (err) {
                  cb(err);
                })
              });
            }

          } else if (mode==4) { // User sent request

            if (userId==peopleId) {  // user canceled request
              groupMembers(groupId, 4, function (err, admins) {
                async.forEachOf(admins.map(r => r._id), function (adminId, key, callback) {
                  news.add_notification(userId, (type==0) ? 4001 : 4101, groupId, adminId, groupId, [], null, null, null, function (err) {
                    peoples.people_email(adminId, function (err, admin) {
                      emails.deleteMemberEmail(admin.name,
                                               groupName,
                                               admin.personalInfo.email,
                                               2,
                                               function (err) {
                        callback(err)
                      })
                    })
                  });
                }, function (err) {
                  cb(err);
                })
              })
            } else { // super admin declined request
              news.add_notification(userId, (type==0) ? 4003 : 4103, groupId, peopleId, groupId, [], null, null, null, function (err) {
                emails.deleteMemberEmail(peopleName,
                                         groupName,
                                         peopleEmail,
                                         3,
                                         function (err) {
                  cb(err);
                })
              });
            }

          } else if (mode==2) { // delete member
            news.add_activity(0, peopleId, 5300, groupId, groupId, groupId, [], peopleTitle, null, null, false, function (err) {
              emails.deleteMemberEmail(peopleName,
                                       groupName,
                                       peopleEmail,
                                       4,
                                       function (err) {

                groupMembers(groupId, 3, function (err, actives) {

                  // push peopleID seperately because this member is not part of actives anymore.
                  if (peopleId!=userId) actives.push({"_id": peopleId});

                  async.forEachOf(actives.map(r => r._id), function (activeId, key, callback) {
                    if (userId==activeId) {
                        callback()
                    } else {
                      news.add_notification(peopleId, 5300, groupId, activeId, groupId, [], null, null, null, function (err) {
                        callback()
                      });
                    }
                  }, function (err) {
                    cb(err);
                  })
                })
              })
            })
          }

        }
      },

      // 7. Unfollow Group
      function (cb) {
        if (stage==0) {
            cb(null)
        } else {
          news.follow_feed(groupId, peopleId, 4, 1, function (err) {
            cb(err)
          })
        }
      }

  ],
  function (err) {
    callback(err);
  });

}

function delete_dummy_member(userId: string, groupId: string, callback) {

  async.waterfall([

    // 1. delete Dummy User Position PDF
    function (cb) {
      db.peoples
        .find({ "_id": userId })
        .project({ "positions": { $elemMatch: { "groupId": ObjectID(groupId) } } })
      .next().then(function(item) {
        var file = item.positions[0].degree ? item.positions[0].degree.file : null;
        if (file && item.positions[0].titles[0]>=200) {
          pics.delete_pic_direct(file, cb)
        } else {
          cb()
        }
      })
    },

    // 2. pull Group ID from Department
    function (cb) {
      groups_list([ObjectID(groupId)], null, null, null, null, 2, true, function (err, items) {
        const groupIndex = items[0].groupIndex;
        db.departments.updateOne(
           { _id: ObjectID(groupIndex.department._id) },
           { $pull: { "groupsItems": ObjectID(groupId) } },
           { safe: true },
           cb()
        )
      })
    },

    // 3. delete Dummy Group
    function (cb) {
      db.groups.deleteOne(
        { _id: ObjectID(groupId) },
        { safe: true },
        cb()
      );
    },

    // 4. delete Dummy User Position
    function (cb) {
      db.peoples.updateOne(
        { _id: userId },
        { $pull: { "positions": { "groupId": ObjectID(groupId) } }
        }, function(err, res) {
          cb(err)
        });
    }

  ],
  function (err) {
    callback(err);
  });

}


export function delete_and_move_member(userId: string, groupId: string, peopleId: string, category: number, insert: number, type: number, end: Date, callback) {
  var fromType: string;
  var toType: string;
  var pullKey: string;
  var pushKey: string;
  var cFrom: number;
  var cTo: number;

  var userTitle: number;

  if (type==0) {
    fromType = 'activesIds';
    toType = 'alumniIds';
    pullKey = "groupsRelations.activesIds"
    pushKey = "groupsRelations.alumniIds"
    cFrom = category;
    cTo= category-1;
  } else if (type==1) {
    fromType = 'visitorsIds';
  } else if (type==2) {
    fromType = 'alumniIds';
    toType = 'activesIds';
    pullKey = "groupsRelations.alumniIds"
    pushKey = "groupsRelations.activesIds"
    cFrom = category;
    cTo= category+1;
  }

  async.series({

      // 1. delete Member from Group Category
      links: function (cb) {
        db.groups.updateOne(
          { _id: ObjectID(groupId)},
          {
            $inc: {
                   // (category-1): PI Category doesn't exist in Alumni
                   ['peoplesPageItems.' + fromType + "." + cFrom] : -1,
                   ['peoplesPageItems.' + toType + "." + cTo] : 1
                  },
            $pull: { ['peoplesItems.' + fromType]: peopleId } ,
            $push: {
                    ['peoplesItems.' + toType]: {
                      $each: [ peopleId ],
                      $position: insert
                    }
            }
          },
          { multi: false, safe: true },
          cb(null, peopleId)
        )
      },

      // 2. move groupID between Active < -- > Alumni
      member: function (cb) {
        db.peoples.updateOne(
          { _id: peopleId },
          { $pull: { [pullKey]: ObjectID(groupId) },
            $push: {
               [pushKey]: {
                  $each: [ ObjectID(groupId) ],
                  $position: 0
               }
            },
          }, function(err, res) {
            if (err) throw err;
            cb()
          });
      },

      // 3. retrieve title
      title: function (cb) {
        db.peoples
          .find({ _id: peopleId })
          .project({ "positions": { $elemMatch: { "groupId": ObjectID(groupId) } } })
        .next().then(function(item) {
          userTitle = item.positions[0].titles[0];
          cb()
        })
      },

      // 4. update Position to reflect Active or Alumni
      position: function (cb) {
        if (type==0) {
          // note: only 1 Active position exists before moving from Active -> Alumni
          db.peoples.updateOne(
            { _id: peopleId, "positions.groupId": ObjectID(groupId), "positions.period.mode": 1},
            {
              $set: {
                "positions.$.period.end": end,
                "positions.$.period.mode": 0,
              },
            }, function(err, res) {
              db.peoples.updateMany( // update all positions in the same group
                { "_id": peopleId, "positions.groupId": ObjectID(groupId), "positions.status": { $lt: 6 } },
                { $set: { "positions.$[].status" : 2} },
                { safe: true },
                cb(err)
              )
            });

        } else if (type==1) {
          cb()

        } else if (type==2) {
          db.peoples.updateMany( // update all positions in the same group
            { "_id": peopleId, "positions.groupId": ObjectID(groupId), "positions.status": { $lt: 6 } },
            { $set: { "positions.$[].status" : 4} },
            { safe: true },
            cb()
          )
        }
      },

      // 5. pull from Items if moving to Alumni (Conditional)
      items: function (cb) {
        if (type==0) { // active => alumni
          pull_from_items(groupId, peopleId, 0, function (err, item) {
            cb()
          })
        } else {
          cb()
        }
      },

      // 6. notifications
      notifications: function (cb) {
        news.add_activity(0, peopleId, (type==2) ? 5101 : 5201, groupId, groupId, groupId, [], userTitle, null, null, false, function (err) {
          groupMembers(groupId, 3, function (err, actives) {

            // push peopleID seperately because this member is not part of actives anymore.
            if (peopleId!=userId) actives.push({"_id": peopleId});

            async.forEachOf(actives.map(r => r._id), function (activeId, key, callback) {
              if (activeId==userId) {
                callback()
              } else {
                news.add_notification(peopleId, (type==2) ? 5101 : 5201, groupId, activeId, groupId, [], userTitle, null, null, function (err) {
                  callback()
                });
              }
            }, function (err) {
              cb(err)
            })

          })
        });
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

function pull_from_items(groupId: string, peopleId: string, mode: number, callback) {
  // mode==0 active => alumni
  // mode==1 delete from group

  db.groups
    .find({_id: ObjectID(groupId)})
    .project({ "_id": 0, "contactsItems": 1,"resourcesItems": 1, "projectsItems": 1, "mediaItems": 1,
      "reports": 1, "futureMeetingsItems": 1,
      "news": 1})
  .next().then(function(item) {

    async.parallel({

        // 1. delete from Contacts
        contacts: function (cb) {
          if (item.contactsItems.contactsIds) {

            db.contacts
              .find({"_id": {$in: item.contactsItems.contactsIds}, "member._id": peopleId})
              .project({_id: 1})
            .toArray().then(function(items) {
              async.forEachOf(items.map(r => r._id), function (contactId, key, callback) {
                contacts.delete_contact(2, contactId, groupId, function (err) {
                  callback(err)
                })
              }, function (err)  {
                cb(err);
              });
            });
          } else {
            cb()
          }
        },

        // 2. delete from upcoming reports + settings
        reports: function (cb) {
          db.groups
            .find({"_id": ObjectID(groupId)})
            .project({"reportsItems": 1}).
          toArray().then(function(item) {
            if (item.reportsItems) {
              db.groups.updateOne(
                 {_id: ObjectID(groupId)},
                 { $pull:
                   {
                     "reportsItems.settings.whoSubmit": {"_id": (peopleId)},
                     "reportsItems.settings.whoSee": {"_id": (peopleId)},
                     "reportsItems.currentReport.whoSubmit": {"_id": (peopleId)},
                     "reportsItems.currentReport.whoSee": {"_id": (peopleId)},
                   }
                 },
                 { multi: true, safe: true },
                 cb()
              )
            } else {
              cb()
            }
          })
        },

        // 2. delete from upcoming meetings + settings
        meetings: function (cb) {
          db.groups
            .find({"_id": ObjectID(groupId)})
            .project({"futureMeetingsItems": 1})
          .toArray().then(function(item) {
            if (item.futureMeetingsItems) {
              if (mode==1) {
                db.groups.updateOne(
                   {_id: ObjectID(groupId)},
                   { $pull: {
                       "futureMeetingsItems.settings.participants": {"_id": (peopleId)},
                       "futureMeetingsItems.meetings": {"presenter._id": (peopleId)},
                       "pastMeetingsItems.meetings": {"presenter._id": (peopleId)},
                     }
                   },
                   { multi: true, safe: true },
                   cb()
                )
              } else {
                db.groups.updateMany(
                   {_id: ObjectID(groupId)},
                   { $pull:
                     {
                       "futureMeetingsItems.settings.participants": {"_id": (peopleId)},
                       "futureMeetingsItems.meetings": {"presenter._id": (peopleId)},
                     }
                   },
                   { multi: true, safe: true },
                   cb()
                )
              }
            } else {
              cb()
            }
          })
        },

        // 4. delete from Resources
        resources: function (cb) {
          if (item.resourcesItems.resourcesIds && mode==1) {
            db.resources.updateMany(
               { _id: {$in: item.resourcesItems.resourcesIds}},
               { $pull: { "people": {"_id": peopleId} } },
               { multi: true, safe: true },
               cb()
            )
          } else {
            cb()
          }
        },

        // 5. delete from Projects
        projects: function (cb) {
          if ((item.projectsItems.currentProjectsIds || item.projectsItems.pastProjectsIds) && mode==1) {
            db.projects.updateMany(
               { _id: {$in: item.projectsItems.currentProjectsIds.concat(item.projectsItems.pastProjectsIds)}},
               { $pull: { "people": {"_id": peopleId} } },
               { multi: true, safe: true },
               cb()
            )
          } else {
            cb()
          }
        },

        // 6. delete from Media
        media: function (cb) {
          if ((item.mediaItems.talksIds || item.mediaItems.postersIds || item.mediaItems.pressesIds) && mode==1) {
            db.media.updateMany(
               {_id: {$in: item.mediaItems.talksIds.concat(item.mediaItems.postersIds).concat(item.mediaItems.pressesIds)}},
               { $pull: { "presentors": {"_id": peopleId} } },
               { multi: true, safe: true },
               cb()
            )
          } else {
            cb()
          }
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

  })

}

///////////////////////////////////
///////////////////////////////////
///////////////////////////////////
///////////////////////////////////

export function group_typeahead_ids(term: string, existGroupsIds: string[], callback) {
  db.groups
    .find({_id: { $nin: existGroupsIds.map(id => ObjectID(id)) }, stage: 2 })
    .project({_id: 1})
    .toArray().then(function(items) {
      const ids = items.map( function(id) { return id._id; })
      callback(null, ids)
    });
};

export function items_order(objId: string, itemId: string, obj: number, mode: number, type: number, drag: number, drop: number, callback) {

  var key: string;
  var collection: string;

  if (obj==0) {
    collection = "groups";

    switch (mode) {
      case 0: // sponsors
        switch (type) {
          case 0: key = "sponsorsItems.industries"; break;
          case 1: key = "sponsorsItems.governments"; break;
        }; break;
      case 1: key = "resourcesItems.resourcesIds"; break; // resources
      case 2: // projects
        switch (type) {
          case 0: key = "projectsItems.currentProjectsIds"; break;
          case 1: key = "projectsItems.pastProjectsIds"; break;
        }; break;
      case 3: key = "positionsItems.positionsIds"; break; // positions
      case 4: // fundings
        switch (type) {
          case 0: key = "fundingsItems.currentFundingsIds"; break;
          case 1: key = "fundingsItems.pastFundingsIds"; break;
        }; break;
      case 5:
        switch (type) {
          case 0: key="peoplesItems.activesIds"; break; // actives
          case 1: key="peoplesItems.visitorsIds"; break; // visitors
          case 2: key="peoplesItems.alumniIds"; break; // alumni
        }; break;
      case 6: key="contactsItems.contactsIds"; break; // contacts
      case 7: key="faqPageItems.faqs"; break; // questions
      case 8: // media
        switch (type) {
          case 0: key="mediaItems.talksIds"; break; // talks
          case 1: key="mediaItems.postersIds"; break; // posters
          case 2: key="mediaItems.pressesIds"; break; // press
        }; break;
    }

  } else if (obj==1) {
    collection = "projects";

    switch (mode) {
      case 7: key="faqsIds"; break;
    }

  } else if (obj==2) {
    collection = "resources";

    switch (mode) {
      case 7: key="faqsIds"; break;
    }

  }

  db[collection].updateOne(
     {_id: ObjectID(objId)},
     { $pull: { [key]: ObjectID(itemId) } },
     { safe: true },
  ).then(function(item) {
    db[collection].updateOne(
       {_id: ObjectID(objId)},
       {
         $push: {
            [key]: {
               $each: [ ObjectID(itemId) ],
               $position: drop
            }
         }
       },
       { safe: true },
    callback(null, itemId)
  )});

};

export function items_projects_order(objId: string, topicId: string, itemId: string, type: number, drag: number, drop: number, callback) {
  var key: string;

  if (type==0) {
    key = "topicsItems.$.currentProjectsIds";
  } else {
    key = "topicsItems.$.pastProjectsIds";
  }

  db.groups.updateOne(
     {_id: ObjectID(objId), "topicsItems.link": topicId },
     { $pull: { [key]: ObjectID(itemId) } },
     { safe: true },
  ).then(function(item) {
    db.groups.updateOne(
       {_id: ObjectID(objId), "topicsItems.link": topicId },
       {
         $push: {
            [key]: {
               $each: [ ObjectID(itemId) ],
               $position: drop
            }
         }
       },
       { safe: true },
    callback(null, itemId)
  )});

};

export function items_topics_order(objId: string, itemId: string, drag: number, drop: number, callback) {

  db.groups.findOneAndUpdate(
     { "_id": ObjectID(objId) },
     { $pull: { 'topicsItems': {_id: ObjectID(itemId)} } },
     { projection: { "_id": 0, "topicsItems" : 1 } }
  )
  .then(function(item) {
    if (item) {
      var pulled = item.value.topicsItems.filter(r=>r._id==itemId)[0];

      pulled._id = ObjectID(pulled._id);
      db.groups.updateOne(
         {_id: ObjectID(objId)},
         {
           $push: {
              "topicsItems": {
                 $each: [ pulled ],
                 $position: drop
              }
           }
         },
         { safe: true },
         callback(null, itemId)
       )
    } else {
      callback(null, itemId)
    }
  })

};

export function get_group_id(university: string, department: string, group: string, mode: number, callback) {
 var key = (mode==1) ? "link" : "name";

 db.groups
  .find({
    $and: [
            { ["groupIndex.group."+key]: group},
            { ["groupIndex.department."+key]: department},
            { ["groupIndex.university."+key]: university},
          ]}
  )
  .project({_id: 1, privacy: 1})
  .next().then(function(item) {
    if (item) {
      callback(null, item._id, item.privacy)
    } else {
      callback(null, null, null)
    }
  });
}

// export function get_group_link_tmp(groupId: string, callback) {
//   db.groups
//     .find({_id: ObjectID(groupId)})
//     .project({_id: 0, groupIndex: 1})
//   .next().then(function(item) {
//     callback(null, item.groupIndex)
//   })
// }

export function get_group_link(groupId: string, callback) {
  db.groups
    .find({ _id: ObjectID(groupId) })
    .project({
      _id: 1,
      groupIndex: 1,
      onBehalf: 1,
      "homePageItems.background": 1,
      "homePageItems.intrests": 1,
      "homePageItems.pic": 1,
      "peoplesItems.activesIds": 1,
      "peoplesItems.alumniIds": 1
    })
  .next().then(function(item) {
    callback(null, item)
  });
}

export function get_group_marketing(groupId: string, callback) {
  db.groups
    .find({ _id: ObjectID(groupId) })
    .project({
      _id: 1,
      groupIndex: 1,
      onBehalf: 1,
      homePageItems: 1,
      socialInfo: 1,
      publicInfo: 1,
      "peoplesItems.activesIds": 1,
      "peoplesItems.alumniIds": 1
    })
  .next().then(function(item) {
    callback(null, item)
  });
}

export function get_group_algolia(groupId: string, callback) {
  var countries = Countries;

  db.groups
    .find({ _id: ObjectID(groupId) })
    .project({ _id: 1, stage: 1, groupIndex: 1, state: 1, city: 1, country: 1, location: 1})
  .next().then(function(item) {
    item.country = item.country ? countries[countries.findIndex(y => y.id == item.country)].name : null;
    callback(null, item)
  });
}

export function get_group_exist(universityId: string, departmentId: string, group: string, callback) {
  db.groups
    .find({
      $and: [
              { "groupIndex.group.name": group },
              { "groupIndex.department._id": ObjectID(departmentId)},
              { "groupIndex.university._id": ObjectID(universityId)},
            ]}
    )
    .project({_id: 1})
    .next().then(function(item) {
      callback(null, item ? item._id : null)
    });
}

export function groups_list(groupsIds: string[], followingsIds: string[], followingsAdminIds: string[], relations, collaborations, mini: number, adminFlag: boolean, callback) {
  var relation;

  var m = (adminFlag) ?
          { "$match" : { "_id" : { "$in" : groupsIds } } }
          :
          { "$match" : { "_id" : { "$in" : groupsIds }, "stage": 2 } };

  var a = { "$addFields" : { "__order" : { "$indexOfArray" : [ groupsIds, "$_id" ] } } };

  var s = { "$sort" : { "__order" : 1 } };

  var f, p;

  if (mini==2) {

    f = { "$project" : {
                        _id: 1, stage: 1, groupIndex: 1, pic: "$homePageItems.pic",
                        affiliations: "$homePageItems.affiliations", country: 1, state: 1,
                        city: 1, location: 1, marketing: 1
                       }
        };

  } else if (mini==5) {

    f = { "$project" : {
                        _id: 1, groupIndex: 1, pic: "$homePageItems.pic",
                        country: 1, state: 1, city: 1, location: 1
                       }
        };

  } else if (mini==1 || mini==3) {

    var p1 = (mini==1) ? {"_id": 1, "name": '$groupIndex.group.name', "link": '$groupIndex.group.link', "pic": '$groupIndex.group.pic'} :
                         {"_id": 1, "name": '$groupIndex.group.name', "pic": '$groupIndex.group.pic'};

    f = { "$project" : p1 },
        { "$unwind" : '$name' },
        { "$unwind" : '$name' },
        { "$unwind" : '$pic' },
        { "$unwind" : '$pic' };

  } else if (mini==0) {

    p = {
         _id: 1, onBehalf: 1, onInvite: 1, welcome: 1, stage: 1,
         dates: 1, groupIndex: 1, membersCount: 1, unit: 1,
         topics: "$topicsItems", publicInfo: 1, socialInfo: 1,
         pic: "$homePageItems.pic", piNames: "$publicationsPageItems.names",
         country: 1, state: 1, city: 1, location: 1,
         // extScore: 1, intScore: 1, plan: 1, domain: 1, progress: 1, marketing: 1
        };

    f = { "$project" : p };

  } else if (mini==4) {

    p = {
         _id: 1, onBehalf: 1, buildPro: 1, onInvite: 1, welcome: 1, stage: 1,
         dates: 1, groupIndex: 1, membersCount: 1, unit: 1,
         topics: "$topicsItems", publicInfo: 1, socialInfo: 1,
         pic: "$homePageItems.pic", piNames: "$publicationsPageItems.names",
         country: 1, state: 1, city: 1, location: 1,
         interests: "$homePageItems.intrests", background: "$homePageItems.background",
         extScore: 1, intScore: 1, plan: 1, domain: 1, progress: 1, marketing: 1,
         seminarsPrivacy: "$futureMeetingsItems.privacy",
         kitPrivacy: "$papersKit.privacy"
        };

    f = { "$project" : p };

  }

  if (mini==1 || mini==2) {

    db.groups.aggregate( [ m, a, s, f ] ).toArray(callback);

  } else if (collaborations) { // collaborations

    var counter: number=0

    if (mini==3) {

      db.groups.aggregate( [ m, a, s, f ] ).map(
         function(u) {
           // u.collaboration = collaborations[counter];
           u._id = collaborations[counter]._id;
           counter+=1;
           return u;
         }
      ).toArray(callback);

    } else {

      db.groups.aggregate( [ m, a, s, f ] ).map(
         function(u) {
           u.followStatus = followingsIds ? followingsIds.toString().includes(u._id.toString()) : null;
           u.followAdminStatus = followingsAdminIds ? followingsAdminIds.map(r => r.toString().includes(u._id.toString())) : null;

           relation = relations ? relations.positions.filter(r => isGroup(r, u._id.toString()))[0] : null;
           u.relation = relation ? {
                                    "status": relation.status,
                                    "mode": relation.mode,
                                    "text": relation.titles,
                                    "period": relation.period,
                                    "email_stage": relation.email ? relation.email.stage : 0
                                   } :
                                   {
                                    "status": 0,
                                    "mode": null,
                                    "text": null,
                                    "period": null,
                                    "email_stage": 0
                                   };
           u.collaboration = collaborations[counter];
           counter+=1;
           return u;
         }
      ).toArray(callback);

    }

  } else {

    db.groups.aggregate( [ m, a, s, f ] ).map(
     function(u) {

       u.followStatus = followingsIds ? followingsIds.toString().includes(u._id.toString()) : null;
       u.followAdminStatus = followingsAdminIds ? followingsAdminIds.map(r => r.toString().includes(u._id.toString())) : null;

       relation = relations ? relations.positions.filter(r => isGroup(r, u._id.toString()))[0] : null;
       u.relation = relation ? {
                                "status": relation.status,
                                "mode": relation.mode,
                                "text": relation.titles,
                                "period": relation.period,
                                "email_stage": relation.email ? relation.email.stage : 0
                               } :
                               {
                                "status": 0,
                                "mode": null,
                                "text": null,
                                "period": null,
                                "email_stage": 0
                               };
       u.collaboration = null;
       return u;
     }
    ).toArray(callback);

  };

}

function isGroup(item, id) {
  if (item==null || item.groupId==null) {
    return false
  }

  if (item.groupId == id) {
    return true;   // Found it
  }
  return false;   // Not found
}

export function toggle_followings_ids(put: boolean, mode: number, actorId: string, firstGroupId: string, secondGroupId: string, newsFlag: boolean, callback) {

  // switch (mode) {
  //   case 0: key = "networkItems.followingIds"; break;
  //   case 1: key = "networkItems.followersIds"; break;
  // }

  if (!firstGroupId || firstGroupId=='undefined' || !secondGroupId || secondGroupId=='undefined') {

    callback();

  } else {

    var progress: number = 0;
    var progressIndex: number = 0;
    var key: string;

    db.groups
      .find({_id: ObjectID(firstGroupId)})
      .project({_id: 0, "networkItems.followingIds": 1, "networkItems.followersIds": 1})
    .next().then(function(item) {

      switch (mode) {
        case 0:
          key = "followingIds";
          progressIndex = 23;
          if (item.networkItems.followingIds.length>=4) progress = 1;
          break;
        case 1:
          key = "followersIds";
          progressIndex = 28;
          if (item.networkItems.followersIds.length>=4) progress = 1;
          break;
      }

      if (put==true) {
        db.groups.updateOne(
          {_id: ObjectID(firstGroupId)},
          {
            $push: { ["networkItems." + key]: ObjectID(secondGroupId) },
            $set: { ["progress." + progressIndex]: progress}
          },
          { multi: false, safe: true },
        ).then(function(item) {
          if (newsFlag) {
            news.add_group_activity(actorId, (mode==0) ? 6100 : 6101, firstGroupId, secondGroupId, secondGroupId, [], null, null, null, 3, function (err) {
              callback(err)
            })
          } else {
            callback()
          }
        });
      } else {
        db.groups.updateOne(
          {_id: ObjectID(firstGroupId)},
          {
            $pull: { ["networkItems." + key]: ObjectID(secondGroupId) },
            $set: { ["progress." + progressIndex]: progress}
          },
          { multi: false, safe: true },
        ).then(function(item) {
          if (newsFlag) {
            news.add_group_activity(actorId, (mode==0) ? 6102 : 6103, firstGroupId, secondGroupId, secondGroupId, [], null, null, null, 3, function (err) {
              callback(err)
            })
          } else {
            callback()
          }
        });
      }
    })
  }

}

export function get_admin_followings_ids(groupsIds: string[], callback) {
  db.groups
    // .find({ $and:[ { "_id": { $in: groupsIds } } ]})
    .find({ "_id": { $in: groupsIds } })
    .project({_id: 0, "networkItems.followingIds": 1})
    .map(u => (u.networkItems || {}).followingIds)
    .toArray(callback);
}

export function group_page_items(page: string, groupId: string, callback) {
  db.groups
  .find(ObjectID(groupId))
  .project({[page]: 1, _id: 0})
  .next().then(function(items) {
    callback(null, items[page])
  });
}

export function group_contact_items(groupId: string, callback) {
  db.groups
  .find(ObjectID(groupId))
  .project({"contactsPageItems": 1, country: 1, state: 1, city: 1, location: 1, _id: 0})
  .next().then(function(item) {

    const contact = Object.assign(
      item.contactsPageItems,
      {
       country: item.country,
       state: item.state,
       city: item.city,
       location: item.location
      }
    )

    callback(null, contact)
  });
}

export function group_home_items(groupId: string, callback) {

  async.waterfall([

    function (cb) {
      db.groups.aggregate(
       [
          { "$match" : { "_id" : ObjectID(groupId) } },
          {
             $project: {
              _id: 0, homePageItems: 1, views: 1, topicsItems: 1,
              counts: {
                publications: { $size: "$publicationsItems.publicationsIds" },
                resources: { $size: "$resourcesItems.resourcesIds" },
                // currentProjects: { $size: "$projectsItems.currentProjectsIds" },
                // pastProjects: { $size: "$projectsItems.pastProjectsIds" },
              },
              "publicationsItems.publicationsIds": 1,
              "fundingsItems.currentFundingsIds": 1,
              "groupIndex.university._id": 1
             }
          }
       ]
     ).next().then(function(item) {
       if (item && item.topicsItems) {
         var currentProjectsIds = item.topicsItems.map(r => r.currentProjectsIds)
         var pastProjectsIds = item.topicsItems.map(r => r.pastProjectsIds)
         item.counts.currentProjects = [].concat(...currentProjectsIds).length;
         item.counts.pastProjects = [].concat(...pastProjectsIds).length;
       }
       const objectMerge = Object.assign(
         Object.assign(
           item.homePageItems,
           {"publicationsIds": item.publicationsItems.publicationsIds},
           {"fundingsIds": item.fundingsItems.currentFundingsIds},
           {"views": item.views},
           {"universityId": item.groupIndex.university._id}
         ),
         {"counts": item.counts},
       )
       // console.log('objectMerge',objectMerge)
       cb(null, objectMerge)
     });

   },

   function (object, cb) {
     publications.publications_list(object.publicationsIds, null, null, 4, 0, false, function (err, publications) {
       // group.citationsTotal = publications.map(r => r.citationsCount).reduce((a, b) => a + b, 0);
       object.journals = Array.from(new Set(publications.map(r => r.journal)));
       delete object.publicationsIds;
       cb(err, object)
     });
   },

   function (object, cb) {
     fundings.fundings_list(object.fundingsIds, 1, 0, function (err, fundings) {
       object.fundings = fundings;
       delete object.fundingsIds;
       cb(err, object)
     });
   },

   function (object, cb) {
     universities.universities_rank([object.universityId], function (err, objRank) {
       object.rank = objRank[0].rank
       delete object.universityId;
       cb(err, object)
     });
   }

 ],
 function (err, object) {
   // console.log('object',object)
   callback(err, object);
 });

}

export function group_items_ids(page: string, groupId: string, callback) {
  db.groups
    .find(ObjectID(groupId))
    .project({[page]: 1, _id: 0})
  .next().then(function(items) {
    callback(null, items[page])
  });
}

export function group_double_items_ids(page_1: string, page_2: string, groupId: string, callback) {
  db.groups
  .find(ObjectID(groupId))
  .project({[page_1]: 1, [page_2]: 1})
  .next().then(function(items) {
    callback(null, items ? items[page_1] : null, items ? items[page_2] : null)
  });
}

export function group_topics_ids(link: string, groupId: string, callback) {
  db.groups
    .find({_id: ObjectID(groupId), ["topicsItems.link"]: link})
    .project({ "_id": 0, "topicsItems.$": 1 } )
  .next().then(function(items) {
    callback(null, items.topicsItems[0])
  });
}
export function groups_items_ids(page: string, groupsIds: string[], callback) {
  db.groups
  .find({_id: { $in : groupsIds}})
  .project({[page]: 1, _id: 0})
  .toArray().then(function(items) {
    callback(null, items ? items.filter(f => f[page]!=undefined).map(r => r[page]) : null)
  });
}

export function groups_double_items_ids(page_1: string, page_2: string, groupsIds: string[], callback) {
  db.groups
  .find({_id: { $in : groupsIds}})
  .project({[page_1]: 1, [page_2]: 1})
  .next().then(function(items) {
    callback(null, items ? items[page_1] : null, items ? items[page_2] : null)
  });
}

export function groups_multi_items_ids(groupsIds: string[], callback) {

  db.groups.aggregate(
    [
     { "$match" : { "_id" : { "$in" : groupsIds } } },
     {
        $project: {
          _id: 0,
          topicsItems: 1,
          peoples: { $cond: { if: { $isArray: "$peoplesItems.activesIds" }, then: { $size: "$peoplesItems.activesIds" }, else: 0} },
          publications: { $cond: { if: { $isArray: "$publicationsItems.publicationsIds" }, then: { $size: "$publicationsItems.publicationsIds" }, else: 0} },
          resources: { $cond: { if: { $isArray: "$resourcesItems.resourcesIds" }, then: { $size: "$resourcesItems.resourcesIds" }, else: 0} },
          teachingsC: { $cond: { if: { $isArray: "$teachingsItems.currentTeachingsIds" }, then: { $size: "$teachingsItems.currentTeachingsIds" }, else: 0} },
          teachingsP: { $cond: { if: { $isArray: "$teachingsItems.pastTeachingsIds" }, then: { $size: "$teachingsItems.pastTeachingsIds" }, else: 0} },
          positions: { $cond: { if: { $isArray: "$positionsItems.positionsIds" }, then: { $size: "$positionsItems.positionsIds" }, else: 0} },
          media1: { $cond: { if: { $isArray: "$mediaItems.talksIds" }, then: { $size: "$mediaItems.talksIds" }, else: 0} },
          media2: { $cond: { if: { $isArray: "$mediaItems.postersIds" }, then: { $size: "$mediaItems.postersIds" }, else: 0} },
          media3: { $cond: { if: { $isArray: "$mediaItems.pressesIds" }, then: { $size: "$mediaItems.pressesIds" }, else: 0} },
          galleries: { $cond: { if: { $isArray: "$eventsItems.eventsIds" }, then: { $size: "$eventsItems.eventsIds" }, else: 0} }
          // peoples: { $cond: { if: { $isArray: "$peoplesItems.activesIds" }, then: { $size: "$peoplesItems.activesIds" }, else: "NA"} },
          // publications: { $cond: { if: { $isArray: "$publicationsItems.publicationsIds" }, then: { $size: "$publicationsItems.publicationsIds" }, else: "NA"} },
          // resources: { $cond: { if: { $isArray: "$resourcesItems.resourcesIds" }, then: { $size: "$resourcesItems.resourcesIds" }, else: "NA"} },
          // teachingsC: { $cond: { if: { $isArray: "$teachingsItems.currentTeachingsIds" }, then: { $size: "$teachingsItems.currentTeachingsIds" }, else: "NA"} },
          // teachingsP: { $cond: { if: { $isArray: "$teachingsItems.pastTeachingsIds" }, then: { $size: "$teachingsItems.pastTeachingsIds" }, else: "NA"} },
          // positions: { $cond: { if: { $isArray: "$positionsItems.positionsIds" }, then: { $size: "$positionsItems.positionsIds" }, else: "NA"} },
          // media1: { $cond: { if: { $isArray: "$mediaItems.talksIds" }, then: { $size: "$mediaItems.talksIds" }, else: "NA"} },
          // media2: { $cond: { if: { $isArray: "$mediaItems.postersIds" }, then: { $size: "$mediaItems.postersIds" }, else: "NA"} },
          // media3: { $cond: { if: { $isArray: "$mediaItems.pressesIds" }, then: { $size: "$mediaItems.pressesIds" }, else: "NA"} },
          // galleries: { $cond: { if: { $isArray: "$eventsItems.eventsIds" }, then: { $size: "$eventsItems.eventsIds" }, else: "NA"} },
          // "eventsItems.eventsIds": 1})
        }
     }
    ]
  ).next().then(function(item) {

    if (item && item.topicsItems) {
      var currentProjectsIds = item.topicsItems.map(r => r.currentProjectsIds);
      var pastProjectsIds = item.topicsItems.map(r => r.pastProjectsIds);
      item.projectsC = [].concat(...currentProjectsIds).length;
      item.projectsP = [].concat(...pastProjectsIds).length;
    }

    callback(null, item ? [groupsIds.length,
                           item.peoples,
                           item.publications,
                           item.resources,
                           item.projectsC + item.projectsP,
                           item.teachingsC + item.teachingsP,
                           item.positions,
                           item.media1 + item.media2 + item.media3,
                           item.galleries] :
                           [0, 0, 0, 0, 0, 0, 0, 0, 0]
            )
  });

}

export function post_group_mini(text: string, pic: string, groupId: string, callback) {
  db.groups.findOneAndUpdate(
    { "_id": ObjectID(groupId) },
    { "$set":
      {
        // ADD Name field???
        "groupIndex.group.name": text,
        "groupIndex.group.link": text.replace(/ /g,"_").toLowerCase(),
        "groupIndex.group.pic": pic,
      }
    },
    { returnNewDocument : true },
    function(err, doc) {
      if (err) {
        throw err;
      } else if (doc) {

        const groupIndex = {
          group: {
            _id: groupId,
            name: text,
            link: text.replace(/ /g,"_").toLowerCase(),
            pic: pic
          },
          department: doc.value.groupIndex.department,
          university: doc.value.groupIndex.university
        }

        const companyFlag: boolean = doc.value.buildMode==4 || doc.value.buildMode==5 || doc.value.buildMode==7;

        post_group_algolia(groupIndex, companyFlag, function (err) {
          post_items_algolia(groupIndex, doc.value.resourcesItems.resourcesIds, function (err) {
            callback(err);
          });
        })

      }
    }
  );
}

export function post_group_algolia(groupIndex, companyFlag: boolean, callback) {
  const algoliaIndex = companyFlag ?
    client.initIndex((process.env.PORT) ? 'companies': 'dev_companies') :
    client.initIndex((process.env.PORT) ? 'labs': 'dev_labs');

  algoliaIndex.getObject(groupIndex.group._id, (err, content) => {
    if (content && content.objectID) {
      algoliaIndex.partialUpdateObject({
        objectID: groupIndex.group._id,
        name: groupIndex.group.name,
        groupIndex: groupIndex,
      }, (err, content) => {
        callback(err)
      });
    } else {
      callback(err)
    }
  });
}

export function post_items_algolia(groupIndex, resourcesIds: string[], callback) {
  var objectResources = [];

  (resourcesIds || []).forEach((resourceId, index) => {
    objectResources.push({
      objectID: resourceId,
      groupIndex: groupIndex
    });
  });

  client.initIndex((process.env.PORT) ? 'services': 'dev_services').partialUpdateObjects(objectResources, (err, content) => {
    callback(err);
  });
}

export function post_group_location(lat: number, lng: number, country: number, state: string, city: string, groupId: string, companyFlag: number, callback) {
  const countries = Countries;
  const countryName: string = countries[countries.findIndex(y => y.id == country)].name;
  const locObj = {lat: lat, lng: lng};

  const objectGroup = [{
    objectID: groupId,
    country: countryName,
    state: state,
    city: city,
    _geoloc: locObj
  }];

  const algoliaIndex = companyFlag ?
    client.initIndex((process.env.PORT) ? 'companies': 'dev_companies') :
    client.initIndex((process.env.PORT) ? 'labs': 'dev_labs');

  algoliaIndex.partialUpdateObjects(objectGroup, (err, content) => {
    callback(err);
  });
}

export function put_affiliation(affiliation: Affiliation, groupId: string, callback) {
  affiliation._id= ObjectID();

  db.groups.updateOne(
     {_id: ObjectID(groupId)},
     { $push: { "homePageItems.affiliations": affiliation } },
     { safe: true },
     callback(null, affiliation._id)
  )
}

export function post_affiliation(affiliation: Affiliation, groupId: string, callback) {
  async.waterfall([

    // 1. Delete Asset
    function (cb) {
      db.groups
        .find({ _id: ObjectID(groupId), "homePageItems.affiliations._id": ObjectID(affiliation._id) })
        .project({ _id: 0, "homePageItems.affiliations.$": 1 })
      .next().then(function(item) {
        pics.delete_pic_direct(item.homePageItems.affiliations[0].pic, function(err) {
          cb(err)
        })
      });
    },

    // 2. Update Affiliation
    function (cb) {
      db.groups.updateOne(
         {_id: ObjectID(groupId), "homePageItems.affiliations._id": ObjectID(affiliation._id) },
         { $set:
           {
             "homePageItems.affiliations.$.title": affiliation.title,
             "homePageItems.affiliations.$.description": affiliation.description,
             "homePageItems.affiliations.$.source": affiliation.source,
             "homePageItems.affiliations.$.externalLink": affiliation.externalLink,
             "homePageItems.affiliations.$.pic": affiliation.pic,
           },
         },
         { safe: true },
         cb()
      )
    }

  ],
  function (err) {
    callback(err);
  });
}

export function delete_affiliation(_id: string, groupId: string, callback) {
  async.waterfall([

    // 1. Delete Asset
    function (cb) {
      db.groups
        .find({ _id: ObjectID(groupId), "homePageItems.affiliations._id": ObjectID(_id) })
        .project({ _id: 0, "homePageItems.affiliations.$": 1 })
      .next().then(function(item) {
        pics.delete_pic_direct(item.homePageItems.affiliations[0].pic, function(err) {
          cb(err)
        })
      });
    },

    function (cb) {
      db.groups.updateOne(
        {_id: ObjectID(groupId)},
        { $pull: { "homePageItems.affiliations": {"_id": ObjectID(_id) } } },
        { multi: false, safe: true },
        callback()
      )
    }

  ],
  function (err) {
    // 2. convert errors to something we like.
    if (err) {
      callback(err);
    } else {
      callback(err, null);
    }
  });
}

export function groupMembers(groupId: string, status: number, callback) {
  async.waterfall([

    // get actives IDs
    function (cb) {
      group_items_ids("peoplesItems", groupId, function (err, items) {
        cb(null, items.activesIds.concat(items.alumniIds));
      })
    },

    // get people positions details
    function (ids, cb) {
      if (ids==null) cb(helpers.no_such_item());
      peoples.peoples_list(ids, groupId, null, 5, true, function (err, peoples) {
        // const peoplesIds=peoples.filter(r => r.positions[0].status>type).map(r => r._id);
        const peoplesFilter=peoples.filter(r => r.positions[0].status>status).filter(r => r.personalInfo.email);
        cb(err, peoplesFilter);
      });
    }

  ],
  function (err, peoplesFilter) {
    callback(err, peoplesFilter);
  });
}

export function groupMembersRaw(groupId: string, status: number, callback) {
  async.waterfall([

    // get actives IDs
    function (cb) {
      group_items_ids("peoplesItems", groupId, function (err, items) {
        cb(null, items.activesIds.concat(items.alumniIds));
      })
    },

    // get people positions details
    function (ids, cb) {
      if (ids==null) cb(helpers.no_such_item());
      peoples.peoples_list(ids, groupId, null, 5, true, function (err, peoples) {
        const peoplesFilter=peoples.filter(r => r.positions[0].status>status);
        cb(err, peoplesFilter);
      });
    }

  ],
  function (err, peoplesFilter) {
    callback(err, peoplesFilter);
  });
}

export function group_stripe_id(groupId: string, callback) {
  db.groups
    .find({_id: ObjectID(groupId)})
    .project({_id: 0, stripe_id: 1, groupIndex: 1, "publicInfo.email": 1})
  .next().then(function(item) {
    callback(null, item.stripe_id, item.groupIndex, item.publicInfo.email)
  })
}

export function group_notify_details(stripeId: string, callback) {
  db.groups
    .find({stripe_id: stripeId})
    .project({_id: 0, groupIndex: 1, country: 1, state: 1, city: 1, location: 1, stage: 1, "peoplesItems.activesIds": 1, "buildPro": 1, "interview.status": 1, "club.status": 1  })
  .next().then(function(item) {
    callback(null, item.groupIndex, item.country, item.state, item.city, item.location, item.stage, item.peoplesItems.activesIds[0], item.buildPro, item.interview.status, item.club.status)
  })
}


function counterPointerFunc(r: number[]): number[] {
  var counterPointer: number [] = [0]

  r.forEach((item, index) => {
    counterPointer[index+1]=counterPointer[index]+item;
  });

  return counterPointer
}

function invalid_group_name() {
    return backhelp.error("invalid_group_name",
                          "Group names can have letters, #s, _ and, -");
}
