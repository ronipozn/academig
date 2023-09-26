var db = require('../db.ts'),
    async = require('async'),
    backhelp = require("./backend_helpers.ts");

var ObjectID = require('mongodb').ObjectID;

var publications = require("./publications.ts");
var groups = require("./groups.ts");
var peoples = require("./peoples.ts");
var shared = require("./shared.ts");
var news = require("./news.ts");

var emails = require("../misc/emails.ts");

import {objectMini, objectMiniEmail} from '../models/shared.ts';

exports.version = "0.1.0";

// function push(...arg) {
//     array.push(['number','value','context','content'].reduce((a,b,i)=> {
//         if (arg[i] !== null) a[b]=arg[i]; return a;
//     }, {}))
// }

export function post_colleague(message: string, email: string, userId: string, callback) {

  var collection: string;
  var key: string;

  async.waterfall([

    // 1. Email colleague invite
    function (cb) {
      peoples.people_email(userId, function (err, user) {
        emails.colleagueInviteEmail(userId, user.name, user.personalInfo.email, user.pic, email, message, function (err) {
          cb(err)
        })
      })
    },

    // 2. update Invite Colleague Collection
    // function (name: string, email: string, cb) {
      // db[collection].updateOne(
      //    { _id: ObjectID(itemId), [key + ".name"]: name },
      //    {
      //      $set: { [key + ".$.email"]: email },
      //      $push: { [key + ".$.dates"]: new Date() }
      //    },
      //    { safe: true },
      //    cb()
      // )
    // }

  ],
  function (err) {
    callback(err);
  });
};

export function post_suggest(authorSuggest: objectMiniEmail, itemId: string, userId: string, mode: number, callback) {

  var collection: string;
  var key: string;

  collection = "publications";
  key = "authors";

  async.waterfall([

    // 1. validate data.
    function (cb) {
      try {
          const reqFields: string[] = [ "name" ];
          backhelp.verify(authorSuggest, reqFields);
      } catch (e) {
          cb(e);
          return;
      }
      cb(null, authorSuggest);
    },

    // 2. retrieve Item ObjectMini
    function (authorSuggest: objectMiniEmail, cb) {
      db[collection]
        .find({_id: ObjectID(itemId)})
        .project({ "_id": 0, "title": 1, "pic": 1, [key]: 1})
      .next().then(function(item) {
        cb(null, authorSuggest, item.title, item[key])
      })
    },

    // 3. email suggestion to author(s)
    function (authorSuggest: objectMiniEmail, itemName: string, authors: objectMini[], cb) {
      async.forEachOf(authors, function (author, key, callback) {
        if (author._id) {
          peoples.people_email(author._id, function (err, people) {
            emails.itemSuggestEmail(author._id, author.name, people.personalInfo.email, author.pic, itemName, itemId, authorSuggest.name, null, authorSuggest.message, function (err) {
              callback(err)
            })
          })
        } else {
          callback()
        }
      }, function (err) {
        cb(err)
      })
    },

  ],
  function (err) {
      if (err) {
        callback(err);
      } else {
        callback(err, null);
      }
  });
};

export function post_invite(author: objectMiniEmail, itemId: string, userId: string, mode: number, callback) {

  var collection: string;
  var key: string;

  if (mode>=7 && mode<=11) {
    collection = "publications";
    key = "authors";
  }

  async.waterfall([

    // 1. validate data.
    function (cb) {
      try {
        const reqFields: string[] = [ "name", "email" ];
        backhelp.verify(author, reqFields);
      } catch (e) {
        cb(e);
        return;
      }
      cb();
    },

    // 2. update Collection && retrieve Item ObjectMini
    function (cb) {
      db[collection].findOneAndUpdate(
        { _id: ObjectID(itemId), [key]: { $elemMatch: { "name": author.name, $or: [ {"dates.2": {$exists: false}}, {"email": null} ] } } },
        { $set: { [key + ".$.email"]: author.email }, $push: { [key + ".$.dates"]: new Date() } },
        { projection: { [key] : {"$elemMatch": { "name": author.name } }, "_id": 0, "name": 1, "title": 1, "pic": 1 } },
        function(err, item) {
          console.log('err',err)
          console.log('item',item)
          if (item && item.value) {
            var dates = item.value.authors[0].dates;
            var itemMini: objectMini = {"_id": itemId, "name": (mode>=7 && mode<=11) ? item.value.title : item.value.name, "pic": item.value.pic};
            cb(err, author, itemMini, dates ? dates.length : 0)
          } else {
            cb(err, author, null, -1)
          }
        }
      )
    },

    // 3. create dummy user (Flag)
    function (author: objectMiniEmail, itemMini: objectMini, datesLength: number, cb) {
      if (datesLength==0) {
        const author_data = {"name": author.name, "pic": null, "email": author.email, "publicationId": ObjectID(itemId)};
        peoples.createPeopleDocument(1, 0, author_data, function (err, authorId) {
          push_non_user_invite(authorId, author.email, itemMini._id, 4, function (err) {
            cb(err, authorId, author, itemMini, datesLength)
          })
        });
      } else {
        cb(null, author._id, author, itemMini, datesLength)
      }
    },

    // 4. update collection
    function (authorId: string, author: objectMiniEmail, itemMini: objectMini, datesLength: number, cb) {
      if (datesLength==0) {
        db[collection].updateOne(
          { _id: ObjectID(itemId), [key + ".name"]: author.name },
          { $set: { [key + ".$._id"]: ObjectID(authorId) } },
          { safe: true },
          cb(null, authorId, author, itemMini, datesLength)
        )
      } else {
        cb(null, authorId, author, itemMini, datesLength)
      }
    },

    // 5. email invite
    function (authorId: string, author: objectMiniEmail, itemMini: objectMini, datesLength: number, cb) {
      if (datesLength>=0 && datesLength<=2) {
        peoples.people_email(userId, function (err, user) {
          // console.log('user',user)
          emails.itemInviteEmail(userId,
                                 user.name,
                                 user.personalInfo.email,
                                 user.pic,
                                 itemMini.name,
                                 itemMini._id,
                                 2,
                                 authorId,
                                 author.name,
                                 author.email,
                                 author.message,
                                 datesLength,
                                 function (err) {
            cb(err, authorId)
          })
        })
      } else {
        cb(null, authorId)
      }
    }

  ],
  function (err, authorId: string) {
    if (err) {
      callback(err);
    } else {
      callback(err, authorId);
    }
  });
};

export function push_non_user_invite(dummyId: string, email: string, item_id: string, mode: number, callback) {
  // mode - 0: group PI
  //        1: group member active
  //        2: group member visitor
  //        3: group member alumni
  //        4: profile publication
  db.invites
    .find({"_id": email})
    .project({"_id": 1})
  .next().then(function(item) {
    if (item) {

      db.invites.updateOne(
         { _id: email },
         { $push: { "invites": {
                                "groupId": (mode<4) ? ObjectID(item_id) : null,
                                "publicationId": (mode==4) ? ObjectID(item_id) : null,
                                "dummyId": dummyId,
                                "mode": mode
                               }
                  }
         },
         { safe: true },
         callback(null)
      )

    } else {

      db.invites.insertOne(
         { "_id": email,
           "invites": [{
                        "groupId": (mode<4) ? ObjectID(item_id) : null,
                        "publicationId": (mode==4) ? ObjectID(item_id) : null,
                        "dummyId": dummyId,
                        "mode": mode
                      }]
         },
         { safe: true },
         callback(null)
      )

    }
  })
}

export function pull_invite(people_id: string, item_id: string, mode: number, callback) {
  db.peoples
    .find({"_id": people_id})
    .project({"personalInfo": 1})
  .next().then(function(peopleItem) {
    if (peopleItem) {
      db.invites.updateOne(
         { _id: peopleItem.personalInfo.email },
         { $pull: { "invites": {
                                "groupId": (mode<4) ? ObjectID(item_id) : null, // groups.ts Line: $pull: { "invites" } (416)
                                "publicationId": (mode==4) ? ObjectID(item_id) : null,
                               }
                  }
         },
         { safe: true },
         callback()
      )
    } else {
      callback()
    }
  })
}

export function pull_invites_by_mode(userId: string, mode: number, callback) {
  // MODE:
  // groupId: <4
  // publications: 4
  // projects: ?
  // resources: ?
  // fundings: ?
  // collaborations: ?

  db.peoples.updateOne(
     { _id: userId },
     { $pull: { "invites": { "mode": mode } } },
     { safe: true },
     callback()
  )
}

export function retrieve_non_user_invite(people_id: string, callback) {
  var email: string;

  db.peoples
    .find({"_id": people_id})
    .project({"_id": 0, "name": 1, "pic": 1, "personalInfo": 1})
  .next().then(function(peopleItem) {
    email = peopleItem.personalInfo.email;

    db.invites
      .find( { "_id": { $regex: '^' + email + '$', '$options': 'i' } } )
      .project({"_id": 0, "invites": 1})
    .next().then(function(item) {

      async.series({

        publications: function (cb) {
          console.log('I0')
          if (item) {
            const mini: objectMini = {"_id": people_id, "name": peopleItem.name, "pic": peopleItem.pic};
            async.forEachOf(item.invites, function (invite, key, callback) {
              if (invite.publicationId) {
                publications.post_publication_author(invite.publicationId, email, mini, function (err) {
                  callback(err)
                })
              } else {
                callback()
              }
            }, function (err) {
              cb(err)
            })
          } else {
            cb()
          }
        },

        peoples: function (cb) {
          console.log('I1')
          if (item) {
            async.forEachOf(item.invites, function (invite, key, callback) {

              db.peoples
                .find({"_id": invite.dummyId})
                .project({
                  "_id": 0, "coverPic": 1, "quote": 1, "background": 1, "meetClip": 1,
                  "groupsRelations": 1, "channelsGroupsIds": 1,
                  "positions": 1, "jobs": 1, "honors": 1, "outreach": 1,
                  "services": 1, "societies": 1, "languages": 1,
                  "publicationsIds": 1,  "profileProjectsIds": 1,
                  "galleriesIds": 1, "teachingsIds": 1, "fundingsIds": 1, "contactsIds": 1,
                  "talksIds": 1, "postersIds": 1, "pressesIds": 1,
                })
              .next().then(function(dummyItem) {
                if (dummyItem) {

                  // console.log('dummyItem',dummyItem)

                  const push = Object.assign(
                    (dummyItem.groupsRelations.activesIds[0]!=null) ? {"groupsRelations.activesIds": dummyItem.groupsRelations.activesIds[0]} : {},
                    (dummyItem.groupsRelations.alumniIds[0]!=null) ? {"groupsRelations.alumniIds": dummyItem.groupsRelations.alumniIds[0]} : {},
                    (dummyItem.groupsRelations.visitorsIds[0]!=null) ? {"groupsRelations.visitorsIds": dummyItem.groupsRelations.visitorsIds[0]} : {},
                    (dummyItem.channelsGroupsIds[0]!=null) ? {"channelsGroupsIds": dummyItem.channelsGroupsIds[0]} : {}
                  )

                  const addToSet = Object.assign(
                    (dummyItem.positions && dummyItem.positions[0]!=null) ? { "positions": { $each: dummyItem.positions } } : {},
                    (dummyItem.jobs && dummyItem.jobs[0]!=null) ?  { "jobs": { $each: dummyItem.jobs } } : {},
                    (dummyItem.honors && dummyItem.honors[0]!=null) ? { "honors": { $each: dummyItem.honors } } : {},
                    (dummyItem.outreach && dummyItem.outreach[0]!=null) ? { "outreach": { $each: dummyItem.outreach } } : {},
                    (dummyItem.services && dummyItem.services[0]!=null) ? { "services": { $each: dummyItem.services } } : {},
                    (dummyItem.languages && dummyItem.languages[0]!=null) ? { "languages": { $each: dummyItem.languages } } : {},
                    // (dummyItem.publicationsIds && dummyItem.publicationsIds[0]!=null) ? { "publicationsIds": { $each: dummyItem.publicationsIds } } : {},
                    (dummyItem.publicationsIds && dummyItem.publicationsIds[0]!=null) ? { "publicationsSuggestionsIds": { $each: dummyItem.publicationsIds } } : {},
                    (dummyItem.profileProjectsIds && dummyItem.profileProjectsIds[0]!=null) ? { "profileProjectsIds": { $each: dummyItem.profileProjectsIds } } : {},
                    (dummyItem.galleriesIds && dummyItem.galleriesIds[0]!=null) ? { "galleriesIds": { $each: dummyItem.galleriesIds } } : {},
                    (dummyItem.teachingsIds && dummyItem.teachingsIds[0]!=null) ? { "teachingsIds": { $each: dummyItem.teachingsIds } } : {},
                    (dummyItem.fundingsIds && dummyItem.fundingsIds[0]!=null) ? { "fundingsIds": { $each: dummyItem.fundingsIds } } : {},
                    (dummyItem.contactsIds && dummyItem.contactsIds[0]!=null) ? { "contactsIds": { $each: dummyItem.contactsIds } } : {},
                    (dummyItem.talksIds && dummyItem.talksIds[0]!=null) ? { "talksIds": { $each: dummyItem.talksIds } } : {},
                    (dummyItem.postersIds && dummyItem.postersIds[0]!=null) ? { "postersIds": { $each: dummyItem.postersIds } } : {},
                    (dummyItem.pressesIds && dummyItem.pressesIds[0]!=null) ? { "pressesIds": { $each: dummyItem.pressesIds } } : {}
                  )

                  var p;

                  // https://stackoverflow.com/questions/679915/how-do-i-test-for-an-empty-javascript-object
                  // object Empty
                  var pFlag = Object.keys(push).length === 0 && push.constructor === Object;
                  var aFlag = Object.keys(addToSet).length === 0 && addToSet.constructor === Object;

                  if (!pFlag && !aFlag) {
                    p = { $push: push, $addToSet: addToSet }
                  } else if (!pFlag) {
                    p = { $push: push  }
                  } else if (!aFlag) {
                    p = { $addToSet: addToSet }
                  } else {
                    p = { }
                  }

                  // console.log('pFlag',pFlag)
                  // console.log('aFlag',aFlag)
                  // console.log('push',push)
                  // console.log('addToSet',addToSet)
                  console.log('p',p)

                  db.peoples.updateOne(
                     { "_id": people_id },
                     p,
                     // coverPic
                     // quote
                     // background
                     // meetClip
                     { safe: true }
                   ).then(function(item) {
                     db.peoples.deleteOne({ "_id": invite.dummyId }, { safe: true }, callback());
                   })
                 } else {
                   db.peoples.deleteOne({ "_id": invite.dummyId }, { safe: true }, callback());
                 }
              })
            }, function (err) {
              cb(err)
            })
          } else {
            cb()
          }
        },

        groups: function (cb) {
          console.log('I2')
          var memberType: string;

          if (item) {
            async.forEachOf(item.invites, function (invite, key, callback) {
              db.groups
                .find({"_id": ObjectID(invite.groupId)})
                .project({"_id": 0, "onBehalf": 1, "peoplesItems.activesIds": 1})
              .next().then(function(groupItem) {

                if (groupItem==null) {

                  callback()

                // Invite Member to Group
                } else {
                // if (groupItem.onBehalf==0 || groupItem.onBehalf==1 || groupItem.onBehalf==3 || groupItem.onBehalf==4) {

                  memberType = (invite.mode==0 || invite.mode==1) ? 'activesIds' : ((invite.mode==2) ? 'visitorsIds' : 'alumniIds');

                  db.groups.updateOne(
                     { "_id": ObjectID(invite.groupId), ["peoplesItems."+memberType]: invite.dummyId },
                     { $set: { ["peoplesItems."+memberType+".$"]: people_id } },
                     { safe: true }
                  ).then(function(item) {
                    news.follow_many(invite.groupId, people_id, function (err) {
                      callback()
                    })
                  })

                // Group Marketing
                // } else if (groupItem.onBehalf==2) {
                //
                //   // groups.delete_member(null, invite.groupId, groupItem.peoplesItems.activesIds[1], 0, 0, false, function (err) {
                //     db.groups.updateOne(
                //        { "_id": ObjectID(invite.groupId) },
                //        { $set: { "peoplesItems.activesIds.0": people_id } },
                //        { safe: true },
                //        callback()
                //     )
                //   // });
                //   // "onBehalf": 3
                //
                // } else {
                  // callback()
                }

             })
            }, function (err) {
              cb(err)
            })
          } else {
            cb()
          }
        },

        invites: function (cb) {
          console.log('I3')
          if (item) {
            db.peoples.updateOne(
               { "_id": people_id },
               { $set: { "invites": item.invites } },
               { safe: true }
            ).then(function(item) {
              db.invites.deleteOne({ "_id": email }, { safe: true }, cb());
            })
          } else {
            cb()
          }
        }

      },
      function (err, results) {
        console.log('inviteResults',results)
        if (err) {
          callback(err);
        } else {
          callback(err, err ? null : results);
        }
      })

    });

  })

}
