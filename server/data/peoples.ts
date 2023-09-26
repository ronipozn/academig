var db = require('../db.ts'),
    async = require('async'),
    backhelp = require("./backend_helpers.ts");

var ObjectID = require('mongodb').ObjectID;

const crypto = require('crypto');

var news = require("./news.ts");
var groups = require("./groups.ts");

var departments = require('./departments.ts');
var universities = require('./universities.ts');
var publications = require("./publications.ts");
var resources = require("./resources.ts");
var projects = require("./projects.ts");
var fundings = require("./fundings.ts");
var media = require("./media.ts");
var contacts = require("./contacts.ts");
var user_settings = require("./user_settings.ts");
var shared = require("./shared.ts");
var pics = require("./pics.ts");
var invites = require("./invites.ts");
var mentors = require("./mentors.ts");
var contests = require("./contests.ts");

var group_create_data = require("../data/groups_create.ts");

var publication_misc = require("../misc/publications.ts");

var emails = require("../misc/emails.ts");
var sendgrid = require("../misc/sendgrid.ts");
var misc = require("../misc/misc.ts");

import {complexName, objectMini, groupComplex, Countries} from '../models/shared.ts';

import {CreateProfile, CreatePosition} from '../models/peoples.ts';

const algoliasearch = require('algoliasearch');
const client = algoliasearch('TDKUK8VW4T', '5d17934a8722069c0ac47bd6b4ae4bda');
const algoliaIndex = (process.env.PORT) ? client.initIndex('researchers') : client.initIndex('dev_researchers');

if (process.env.PORT) {
  var stripe = require("stripe")("sk_live_cX9wuWcR9lIBXPhAh206GjKb");
} else {
  var stripe = require("stripe")("sk_test_7EVILWvlgJHlUNOh58DBJVe4");
}

var request = require("request");

var authOptions = { method: 'POST',
  url: 'https://academig.eu.auth0.com/oauth/token',
  headers: { 'content-type': 'application/json' },
  body: '{"client_id":"p066ko4QcsRV7k15zqIjf4KkXuUvSuMV","client_secret":"r4BvKSbzDO9_lNbT0YWnCQQKWbIKUIVks1g79rYEo6k_fVjrd3-ozCOKKLiN57Hw","audience":"https://academig.eu.auth0.com/api/v2/","grant_type":"client_credentials"}' };

import { Period } from '../models/shared.ts';

exports.version = "0.1.0";

// const PI = 3.14159265359;
// exports.area = radius => (radius ** 2) * PI;

exports.titlesTypes = titlesTypes;

export function titlesTypes(i: number): string {
  const titles = {
    100: "Full Professor",
    101: "Associate Professor",
    102: "Associate Professor",
    103: "Professor Emeritus",

    150: "Director",
    // 151: "Research Chair",
    152: "Technician",
    153: "Assistant",
    154: "Secretary",

    155: 'Senior Staff',
    156: 'Lab Manager',
    157: 'Research Assistant Professor',

    160: 'Assistant Researcher',

    201: "Postdoc",

    300: "M.Sc.",
    301: "Ph.D.",

    400: "B.A.Sc.",
    401: "B.Sc.",
    402: "B.A."
  };

  return titles[i];
}

export function create_people(data, callback) {
  async.waterfall([

    // 1. validate data.
    function (cb) {
      try {
        backhelp.verify(data, [ "oauth_id", "name", "email", "pic" ]);
      } catch (e) {
        cb(e); return;
      }
      cb(null, data);
    },

    // 2. create People document
    function (people_data, cb) {
      console.log('create People document')
      const data_clone = JSON.parse(JSON.stringify(people_data)); // clone object - it isn't polite to pollute people_data
      createPeopleDocument(0, people_data.email_verified ? 2 : 1, data_clone, function (err, people_id) {
        cb(err, people_id)
      });
    }

  ],
  function (err, people_id) {
    console.log('people_id',people_id)
    if (err) {
      callback(err);
    } else {
      callback(err, err ? null : people_id);
    }
  });
};

export function delete_people(userId: string, callback) {
  async.series({

    // 0. PI must delete all his groups before deleting himself
    enable: function (cb) {
      db.peoples
        .find({ _id: userId })
        .project({ "positions": 1 })
      .next().then(function(item) {
        if (userId=="academig" || item.positions.filter(r => r.status==6).length>0) {
          console.log('PI must delete all his labs before deleting himself')
          cb(backhelp.restrict_delete())
        } else {
          cb()
        }
      })
    },

    // 1. delete People Items
    links: function (cb) {
      console.log('userId',userId)

      db.peoples
        .find({_id: userId})
        .project({
          "_id": 0,
          "pic": 1,
          "oauth_id": 1,
          "personalInfo.email": 1,
          "stripe_id": 1,
          "positions": 1,
          "publicationsIds": 1,
          "resourcesIds": 1,
          "projectsIds": 1,
          "fundingsIds": 1,
          "mediaIds": 1,
          "talksIds": 1,
          "postersIds": 1,
          "pressesIds": 1,
          "contactsIds": 1,
          "reportsIds": 1,
          "blockingIds": 1,
          "followings": 1,
        })
      .next().then(function(item) {

        async.parallel({

          positions: function (cb) {
            async.forEachOf(item.positions, function (position, key, callback) {
              groups.delete_member(userId, position.groupId, userId, 0, 0, true, function (err) {
                // FIX: Find out which contact IDs are in each Group ID (if at all)
                async.forEachOf(item.contactsIds, function (contactId, key, callback) {
                  contacts.delete_contact(2, contactId, position.groupId, function (err) {
                    callback(err)
                  });
                }, function (err) {
                  callback (err)
                })
              });
            }, function (err) {
              console.log('1')
              cb(err)
            })
          },

          publications: function (cb) {
            if (item.publicationsIds) {
              publications.delete_publications(userId, null, 3, item.publicationsIds, function (err) {
                console.log('2')
                cb()
              })
            } else {
              console.log('2')
              cb()
            }
          },

          resources: function (cb) {
            if (item.resourcesIds) {
              resources.delete_people(userId, item.resourcesIds, function (err) {
                console.log('3')
                cb(err)
              });
            } else {
              console.log('3')
              cb()
            }
          },

          projects: function (cb) {
            if (item.projectsIds) {
              projects.delete_people(userId, item.projectsIds, function (err) {
                console.log('4')
                cb(err)
              });
            } else {
              console.log('4')
              cb()
            }
          },

          fundings: function (cb) {
            if (item.fundingsIds) {
              fundings.delete_people(userId, item.fundingsIds, function (err) {
                console.log('5')
                cb(err)
              });
            } else {
              console.log('5')
              cb()
            }
          },

          media: function (cb) {
            if (item.mediaIds) {
              media.delete_people(userId, item.mediaIds, function (err) {
                console.log('6')
                cb(err)
              });
            } else {
              console.log('6')
              cb()
            }
          },

          talks: function (cb) {
            async.forEachOf(item.talksIds, function (talkId, key, callback) {
              media.delete_media(userId, talkId, 2, 0, function (err) {
                callback()
              });
            }, function (err) {
              console.log('7')
              cb (err)
            })
          },

          posters: function (cb) {
            async.forEachOf(item.postersIds, function (posterId, key, callback) {
              media.delete_media(userId, posterId, 2, 1, function (err) {
                callback()
              });
            }, function (err) {
              console.log('8')
              cb (err)
            })
          },

          presses: function (cb) {
            async.forEachOf(item.pressesIds, function (pressId, key, callback) {
              media.delete_media(userId, pressId, 2, 2, function (err) {
                callback()
              });
            }, function (err) {
              console.log('9')
              cb (err)
            })
          },

          reports: function (cb) {
            async.forEachOf(item.reportsIds, function (reportId, key, callback) {
              user_settings.pull_report(userId, reportId, function (err) {
                callback()
              });
            }, function (err) {
              console.log('10')
              cb (err)
            })
          },

          blockings: function (cb) {
            if (item.blockingIds) {
              delete_blocked_ids(userId, item.blockingIds, function (err) {
                console.log('11')
                cb(err)
              });
            } else {
              console.log('11')
              cb()
            }
          },

          publicationsFollowings: function (cb) {
            if (item.followings.publicationsIds) {
              delete_followed_ids("publications", userId, item.followings.publicationsIds, function (err) {
                console.log('12')
                cb(err)
              });
            } else {
              console.log('12')
              cb()
            }
          },

          resourcesFollowings: function (cb) {
            if (item.followings.resourcesIds) {
              delete_followed_ids("resources", userId, item.followings.resourcesIds, function (err) {
                console.log('13')
                cb(err)
              });
            } else {
              console.log('13')
              cb()
            }
          },

          projectsFollowings: function (cb) {
            if (item.followings.projectsIds) {
              delete_followed_ids("projects", userId, item.followings.projectsIds, function (err) {
                console.log('14')
                cb(err)
              });
            } else {
              console.log('14')
              cb()
            }
          },

          positionsFollowings: function (cb) {
            if (item.followings.positionsIds) {
              delete_followed_ids("positions", userId, item.followings.positionsIds, function (err) {
                console.log('15')
                cb(err)
              });
            } else {
              console.log('15')
              cb()
            }
          },

          groupsFollowings: function (cb) {
            if (item.followings.groupsIds) {
              delete_followed_ids("groups", userId, item.followings.groupsIds, function (err) {
                console.log('16')
                cb(err)
              });
            } else {
              console.log('16')
              cb()
            }
          },

          peoplesFollowings: function (cb) {
            if (item.followings.peoplesIds) {
              delete_followed_ids("peoples", userId, item.followings.peoplesIds, function (err) {
                console.log('17')
                cb(err)
              });
            } else {
              console.log('17')
              cb()
            }
          },

          pic: function (cb) {
            pics.delete_pic_direct(item.pic, function(err) {
              console.log('18')
              cb()
            })
          },

          oAuth: function (cb) {
            request(authOptions, function (error, response, body) {
              if (error) throw new Error(error);

              // console.log(body);

              var access_token = JSON.parse(body).access_token;

              var options = { method: 'DELETE',
                // url: 'https://academig.eu.auth0.com/api/v2/users/facebook|10156019273665967',
                url: 'https://academig.eu.auth0.com/api/v2/users/'+item.oauth_id,
                // qs: { q: 'email:"roni.pozner@gmail.com"', search_engine: 'v3' },
                headers: { authorization: 'Bearer ' + access_token } };

              request(options, function (error, response, body) {
                console.log('19')
                if (error) throw new Error(error);
                cb()
              });

            });
          },

          stripe: function (cb) {
            console.log('20')
            if (item.stripe_id) {
              stripe.customers.del(item.stripe_id, function(err, confirmation) {
                cb()
              });
            } else {
              cb()
            }
          },

          sendgrid: function (cb) {
            console.log('21', item.personalInfo.email)
            sendgrid.contactDelete(item.personalInfo.email, function (err) {
              cb(err)
            });
          }

        },
        function (err) {
          cb(err);
        });

      });
    },

    // 2. delete User Followers Links (+ Notification)
    followers: function (cb) {
      console.log('22')
      delete_followings_ids("peoples", "peoplesIds", userId, false, function (err) {
        cb(err)
      });
    },

    // 3. Send Goodbye Email
    // email: function (cb) {
    //   console.log('18')
    //   delete_followings_ids("peoples", "peoplesIds", userId, false, function (err) {
    //     cb(err)
    //   });
    // },

    // 4. delete People Item
    people: function (cb) {
      console.log('23')
      db.peoples.deleteOne({ _id: userId },
                           { safe: true },
                           cb());
    },

    // 5. remove User Algolia
    algolia: function (cb) {
      console.log('24')
      algoliaIndex.deleteObject(userId, (err, content) => {
        cb(err)
      });
    },

    // 6. remove User news
    news: function (cb) {
      console.log('25')
      news.remove_activity(userId, userId, 2, function (err) {
        cb(err);
      });
    }

  },
  function (err, results) {
    console.log('26')
    if (err) {
      callback(err);
    } else {
      callback(err, err ? null : results);
    }
  });

}

// MOVE
export function update_auth_metadata(userId: string, type: number, itemId: string, callback) {
  db.peoples
    .find({_id: userId})
    .project({"_id": 0, "oauth_id": 1})
  .next().then(function(item) {
    request(authOptions, function (error, response, body) {
      if (error) throw new Error(error);

      var access_token = JSON.parse(body).access_token;

      var options = { method: 'PATCH',
        url: 'https://academig.eu.auth0.com/api/v2/users/'+item.oauth_id,
        headers: { authorization: 'Bearer ' + access_token },
        body:
         { app_metadata: { privilages: type } },
        json: true };

      request(options, function (error, response, body) {
        if (error) throw new Error(error);
        callback()
      });

    });
  })
}

///////////////////////////////////
///////////////////////////////////
//////////// Positions ////////////
///////////////////////////////////
///////////////////////////////////

export function create_position(peopleId: string, channelId: string, data, existMemberFlag: boolean, type: number, callback) {
  var data_clone;
  var memberType: string

  if (type==0) {
    memberType = 'activesIds';
  } else if (type==1) {
    memberType = 'visitorsIds';
  } else if (type==2) {
    memberType = 'alumniIds';
  }

  async.waterfall([

    // 1. validate data
    function (cb) {
    //   try {
    //     backhelp.verify(data, [ "status", "date", "title", "location" ]);
    //   } catch (e) {
    //     cb(e);
    //     return;
    //   }
      cb(null, data);
    },

    // 2. push to People positions / push to GroupsRelations
    function (position_data, cb) {
      data_clone = JSON.parse(JSON.stringify(position_data));
      data_clone.groupId = ObjectID(data_clone.groupId);
      data_clone._id = ObjectID();

      if (existMemberFlag) {
        db.peoples
          .find({ _id: peopleId })
          .project({ _id: 0, "positions": 1 })
        .next().then(function(item) {
          db.peoples.updateOne(
            { _id: peopleId },
            { $push: {
               "positions": {
                  $each: [{
                    "mode": item.positions[0].mode,
                    "status": item.positions[0].status,
                    "period": data_clone.period,
                    'titles': data_clone.titles,
                    "email": item.positions[0].email,
                    "groupId": ObjectID(data_clone.groupId),
                    "degree": data_clone.degree,
                    "_id": data_clone._id
                  }],
                  $position: 0
               }
            },
            }, function(err, res) {
              cb(err, data_clone.groupId, data_clone._id)
            }
          );
        })
      } else { // part of creating a new Group Member
        db.peoples.updateOne(
          { _id: peopleId },
          { $push: {
              "positions": data_clone,
              "channelsGroupsIds": channelId,
              ["groupsRelations."+memberType]: data_clone.groupId
            }
          }, function(err, res) {
            cb(err, data_clone.groupId, data_clone._id)
          }
        );
      }
    },

    // 3. News
    function (groupId: string, positionId: string, cb) {
      if (existMemberFlag) {
        news.add_group_activity(peopleId, 5100, groupId, groupId, groupId, [], data_clone.titles[0], null, null, 3, function (err) {
          cb(err, positionId)
        })
      } else {
        cb(null, positionId)
      }
    },

    // 4. Algolia
    function (positionId, cb) {
      console.log('Algolia_peopleId',peopleId)
      if (ObjectID.isValid(peopleId)) {
        cb(null, positionId)
      } else {
        people_algolia_positions(peopleId, function (err) {
          cb(err, positionId)
        })
      }
    }

  ],
  function (err, positionId) {
    if (err) {
      callback(err);
    } else {
      callback(err, err ? null : positionId);
    }
  });
};

export function update_position(people_data, groupId: string, type: number, callback) {
  var memberType: string;

  if (type==0) {
    memberType = 'activesIds';
  } else if (type==1) {
    memberType = 'visitorsIds';
  } else if (type==2) {
    memberType = 'alumniIds';
  }

  async.series({

    // 1. update Position Data
    position: function (cb) {
      db.peoples.updateOne(
        {"_id": people_data._id, "positions._id": ObjectID(people_data.positionId) },
        { $set: {
                 "positions.$.titles" : people_data.titles,
                 "positions.$.period" : people_data.period,
                 "positions.$.degree" : people_data.degree
                }
        }, function(err, res) {
          if (err) throw err;
          cb()
        });
    },

    // 2. change Member Category (if needed)
    category: function (cb) {
      if (people_data.oldCategory==people_data.newCategory) {
        cb()
      } else {
        db.groups.updateOne(
           {_id: ObjectID(groupId)},
           {
             $inc: {
                    ['peoplesPageItems.' + memberType + "." + people_data.oldCategory] : -1,
                    ['peoplesPageItems.' + memberType + "." + people_data.newCategory] : 1
                   },
             $pull: { ['peoplesItems.' + memberType]: people_data._id }
           },
           { safe: true },
        ).then(function(item) {
          db.groups.updateOne(
            {_id: ObjectID(groupId)},
            {
              $push: {
                ['peoplesItems.' + memberType]: {
                  $each: [people_data._id],
                  $position: people_data.index
                }
              }
            },
            { safe: true },
            cb()
        )});
      }
    },

    // 3. Algolia
    algolia: function (cb) {
      people_algolia_positions(people_data._id, function (err) {
        cb(err)
      })
    }

  },
  function (err) {
    callback(err);
  });

}

export function update_dummy_position(people_data, callback) {
  async.waterfall([

    // 1. delete PDF (flag)
    function (cb) {
      if (people_data.titles[0]==300 || people_data.titles[0]==301 || people_data.titles[0]==303) {
        db.peoples
          .find({ "_id": people_data._id, "positions._id": ObjectID(people_data.positionId) })
          .project({ _id: 0, "positions.$": 1 })
        .next().then(function(item) {
          if (item.positions[0].degree) {
            const currentFile = item.positions[0].degree.file;
            if (currentFile == people_data.degree.file) {
              cb()
            } else {
              pics.delete_pic_direct(currentFile, cb)
            }
          } else {
            cb()
          }
        })
      } else {
        cb()
      }
    },

    function (cb) {
      db.peoples.updateOne(
      { "_id": people_data._id, "positions._id": ObjectID(people_data.positionId) },
      { $set: {
               "positions.$.titles" : people_data.titles,
               "positions.$.period" : people_data.period,
               "positions.$.degree" : people_data.degree,
               "positions.$.status" : (people_data.period.mode==1) ? 9 : 8
              }
      }, function(err, res) {
        if (err) throw err;
        callback()
      });
    }

  ],
  function (err) {
    callback(err);
  });

}

export function delete_position(userId: string, peopleId: string, positionId: string, groupId: string, mode: number, end: Date, callback) {
  // This function is called only when there is more than one position for this user
  var title: string

  async.waterfall([

    // 1. retrive title
    function (cb) {
      db.peoples
        .find({ _id: peopleId })
        .project({ "positions": { $elemMatch: { "_id": ObjectID(positionId) } } })
      .next().then(function(item) {
        title = item.positions[0].titles[0];
        cb()
      })
    },

    // 2. update People position document + push to Groups Relations
    function (cb) {
      if (mode==0) {
        db.peoples.updateOne(
          { _id: peopleId },
          { $pull: { "positions": {"_id": ObjectID(positionId) } } },
          function(err, res) {
            cb(err)
          }
        );
      } else if (mode==1) {
        db.peoples.updateOne(
          { _id: peopleId, "positions._id": ObjectID(positionId) },
          { $set: {
                   "positions.$.period.mode": 0,
                   "positions.$.period.end": end,
                  },
          }, function(err, res) {
            cb(err)
          }
        );
      }
    },

    // 3. Algolia
    function (cb) {
      people_algolia_positions(peopleId, function (err) {
        cb(err)
      })
    },

    // 4. notifications
    function (cb) {
      news.add_activity(0, peopleId, 5200, groupId, groupId, groupId, [], title, null, null, false, function (err) {
        groups.groupMembers(groupId, 3, function (err, actives) {
          async.forEachOf(actives.map(r => r._id), function (activeId, key, callback) {
            if (userId==activeId) {
              callback()
            } else {
              news.add_notification(peopleId, 5200, groupId, activeId, groupId, [], title, null, null, function (err) {
                callback()
              });
            }
          }, function (err) {
            cb(err)
          })
        })
      });
    }

  ],
  function (err, people_id) {
    if (err) {
      callback(err);
    } else {
      callback(err, err ? null : people_id);
    }
  });

};

export function people_typeahead_ids(term: string, objId: string, type: number, callback) {
  var negateIds: string[] = [];
  var collection: string;

  if (type<2) {

    collection = (type==1) ? "fundings" : "groups";
    db[collection]
      .find({ _id: ObjectID.isValid(objId) ? ObjectID(objId) : null })
      .project({ "peoplesItems": 1, "roles": 1, "_id": 0 })
    .next().then(function(items) {

      if (type==0 && items) {
        negateIds = items.peoplesItems.activesIds.concat(items.peoplesItems.alumniIds);
      } else if (type==1 && items) {
        negateIds = items.roles.map(r => r.member._id);
      }

      db.peoples
        // .find({_id: { $nin: negateIds}, name: { $regex: new RegExp(term), $options: 'i' }, "stage": 2})
        .find({_id: { $nin: negateIds}, name: { $regex: term, $options: 'i' }, "stage": 2})
        .project({_id: 1})
        .toArray().then(function(items) {
          const ids = items.map( function(id) { return id._id; })
          callback(null, ids)
        });
    })

  } else if (type==2) {

    db.peoples
      // .find({"_id": { $nin: [objId]}, "name": { $regex: new RegExp(term), $options: 'i' }, "stage": 2})
      .find({"_id": { $nin: [objId]}, "name": { $regex: term, $options: 'i' }, "stage": 2})
      .project({_id: 1})
      .toArray().then(function(items) {
        const ids = items.map( function(id) { return id._id; })
        callback(null, ids)
      });


  } else {

    db.peoples
      // .find({"name": { $regex: new RegExp(term), $options: 'i' }, "stage": 2 })
      .find({"name": { $regex: term, $options: 'i' }, "stage": 2 })
      .project({_id: 1})
      .toArray().then(function(items) {
        const ids = items.map( function(id) { return id._id; })
        callback(null, ids)
      });

  }

};

export function peoples_query_ids(terms: string[], callback) {
  db.peoples
    .find({"name": { $in: terms }, "stage": 2 })
    .project({_id: 1, name: 1, pic: 1})
    .toArray().then(function(items) {
      callback(null, items)
    });
}

function generateUserId(name: string, email: string, mode: number, callback) {

  if (mode==1) {

    callback(null, ObjectID().toString())

  } else {

    const nameTmp: string = (email=="support@academig.com") ? "academig" : name;
    const userId: string = nameTmp.replace(/[\W_]+/g," ").replace(/\./g,"_").replace(/\ /g,"_").toLowerCase();
    console.log("generateUserId")
    db.peoples
      // .find({"_id": { $regex: new RegExp(userId), $options: 'i' }})
      .find({"_id": { $regex: userId, $options: 'i' }})
      .project({"_id": 1})
    .toArray().then(function(items) {
      var indexes: number[] = items.map(r => r._id.match(/\d+$/)).filter(r => r!=null).map(r => parseInt(r[0]))
      var max = indexes[0] ? Math.max(...indexes) + 1 : ((items[0] || {})._id ? 1 : null);
      callback(null, max ? userId + "_" + max : userId)
    })

  }

}

export function createPeopleDocument(mode: number, stage: number, data, callback) {

  generateUserId(data.name, data.email, mode, function(err, userIdModified) {

    console.log('userIdModified',userIdModified)
    // console.log('data',data)

    db.peoples.insertOne(
       {
        "_id": userIdModified,
        "oauth_id": data.oauth_id,
        "stripe_id": null,
        "sub_id": null,
        "name": data.name,
        // "quantity": 0,
        "plan": 0, // 0 - Basic
                   // 1 - PRO
                   // 2 - PRO + Mentoring
        "stage": stage, // Private Email
                        // 0 - Invited (user not exist)
                        // 1 - Email not verified
                        // 2 - Email verified
        "pic": data.pic,
        "libraryPrivacy": 0,

        "quote": {
          "text": null,
          "name": null,
          "pic": null
        },

        "coverPic": "https://s3.amazonaws.com/academig/profileCoverDefault.jpeg",
        "date": new Date(),
        "progress": [data.pic ? 1 : 0, 0, 0, 0, 0, 0],

        "groupsRelations": {
          "activesIds": [],
          "alumniIds": [],
          "visitorsIds": []
        },

        "followings": {
          "publicationsIds": [],
          "peoplesIds": [],
          "resourcesIds": [],
          "projectsIds": [],
          "groupsIds": [],
          "positionsIds": [],
          // "podcastsIds": [],
          // "eventsIds": [],
          // "appsIds": [],
        },

        "followedIds": [], // Users Followings

        "notifications": [],
        "news": [],
        "calendar": [],

        "background": null,
        "meetClip": null,
        "researchInterests": [],
        "recreationalInterests": [],

        "invites": [],

        "positions": [],
        "jobs": [],
        "honors": [],
        "outreach": [],
        "services": [],
        "societies": [],
        "languages": [],

        "publicationsIds": data.publicationId ? [data.publicationId] : [], // used for Dummy Users before Pulled for Invites
        "publicationsSuggestionsIds": [],
        "publicationsRejectedIds": [],

        "talksIds": [],
        "postersIds": [],
        "pressesIds": [],

        "statusPositions": [],

        "resourcesIds": [],

        "profileProjectsIds": [],
        "projectsIds": [],

        "galleriesIds": [],

        "teachingsIds": [],

        "fundingsIds": [],

        "mediaIds": [],

        "contactsIds": [],

        "channelsIds": [],
        "channelsGroupsIds": [],

        "reportsIds": [],
        "blockingIds": [],
        "blockedIds": [],

        "reports": [],

        "personalInfo": {
          "phone": null,
          "email": (mode==0) ? data.email : data.email,
          // "email": (mode==0) ? data.email : null,
          "address": null,
          "birthday": null,
          "kids": [],
          "vacations": []
        },

        "publicInfo": {
          // "building": null,
          // "room": null,
          "address": null,
          "phone": null,
          "fax": null,
          "email": null,
          "website": null,
          // "hours": null,
          // "googleScholar": null,
        },

       },
       { w: 1, safe: true }, function(err, docsInserted) {
         callback(err, docsInserted.insertedId);
       }
     );

  });

}

export function create_hash(userId: string, groupId: string, callback) {
  // var hash=Math.floor((Math.random() * 100) + 54);
  crypto.randomBytes(256, (err, buf) => {
    if (err) throw err;
    // console.log(`${buf.length} bytes of random data: ${buf.toString('hex')}`);
    db.hash.insertOne(
       {
         "userId": userId,
         "groupId": ObjectID(groupId),
         "hash": buf.toString('hex'),
       },
       { safe: true },
       callback(null, buf.toString('hex'))
    )
  });
}

export function verify_hash(JWTuserId: string, hash: string, callback) {
  async.waterfall([

    // 1. get User ID associated with hash
    function (cb) {
      db.hash
        .find({"hash": hash})
        .project({_id: 1, userId: 1, groupId: 1})
      .next().then(function(item) {
        if (item) {
          cb(null, item._id, item.userId, item.groupId)
        } else {
          cb(null, null, null, null)
        }
      });
    },

    // 2. set Email Verified flag
    function (_id: string, userId: string, groupId: string, cb) {
      console.log('JWTuserId',JWTuserId)
      console.log('HASHuserId',userId)
      if (userId && JWTuserId==userId) {
        verify_institute_email(userId, groupId, function(err) {
          db.hash.deleteOne({ "_id": ObjectID(_id) },
                            { safe: true },
                            cb(err, groupId))
        });
      } else {
        console.log("email is not verified");
        cb(backhelp.invalid_email())
      }
    },

    // 3. retrieve Group link
    function (groupId: string, cb) {
      groups.get_group_link(groupId, function(err, item) {
        var groupLink = item.groupIndex.university.link + '/' + item.groupIndex.department.link + '/' + item.groupIndex.group.link;
        cb(err, groupLink)
      })
    }

  ],
  function (err, groupLink) {
    if (err) {
      callback(err);
    } else {
      console.log("email is verified");
      callback(null, groupLink);
    }
  });
}

export function toggle_wall(userId: string, index: number, state: number, callback) {
  db.peoples.updateOne(
    { _id: userId },
    { $set: { ["wall." + index]: state } },
    { safe: true },
    callback()
  );
}

export function get_followings_ids(mode: number, peopleId: string, type: number, callback) {
  if (!peopleId) {

    callback(null, []);

  } else {

    db.peoples
      .find({ _id: peopleId })
      .project({
        _id: 0, groupsRelations: 1, followings: 1, dealsIds: 1, requests: 1,
        blockedIds: 1, blockingIds: 1,
        resourcesIds: 1, projectsIds: 1, profileProjectsIds: 1,
        publicationsIds: 1, publicationsSuggestionsIds: 1, publicationsRejectedIds: 1,
        talksIds: 1, postersIds: 1, pressesIds: 1,
        fundingsIds: 1, teachingsIds: 1, galleriesIds: 1, outreachsIds: 1
      })
    .next().then(function(items) {
      switch (mode) {
        case 0: callback(null, items.followings.publicationsIds); break;
        case 1: callback(null, items.followings.resourcesIds); break;
        case 2: callback(null, items.followings.projectsIds); break;
        case 3: callback(null, items.followings.positionsIds); break;
        case 4: callback(null, items.followings.groupsIds); break;
        case 5:
          switch (type) {
            case 0: callback(null, items.groupsRelations.activesIds); break;
            case 1: callback(null, items.groupsRelations.alumniIds); break;
            case 2: callback(null, items.groupsRelations.visitorsIds); break;
          }; break;
        case 6: callback(null, items.projectsIds); break;
        case 7: callback(null, items.publicationsIds); break;
        case 8:
          switch (type) {
            case 0: callback(null, items.talksIds); break;
            case 1: callback(null, items.postersIds); break;
            case 2: callback(null, items.pressesIds); break;
          }; break;
        case 9: callback(null, items.followings.peoplesIds); break;
        case 10: callback(null, items.fundingsIds); break;
        case 11: callback(null, items.blockingIds); break;
        case 12: callback(null, items.blockedIds); break;
        case 13: callback(null, items.resourcesIds); break;
        case 14: callback(null, items.profileProjectsIds); break;
        // case 15: callback(null, items.profileResourcesIds); break; // DELETED
        case 16: callback(null, items.teachingsIds); break;
        case 17: callback(null, items.publicationsSuggestionsIds); break;
        case 18: callback(null, items.publicationsIds.concat(items.publicationsRejectedIds)); break;
        case 19: callback(null, items.galleriesIds); break;
        case 20: callback(null, items.publicationsRejectedIds); break;
        case 21: callback(null, items.outreachsIds); break;
        case 30: callback(null, items.requests); break;
        case 40: callback(null, items.followings.podcastsIds); break;
        case 50: callback(null, items.followings.eventsIds); break;
        case 60: callback(null, items.followings.appsIds); break;
        case 70: callback(null, items.mentorsIds); break;
        case 80: callback(null, items.dealsIds); break;
      }
    });
  }
}

// export function get_followings_ids(mode: number, peopleId: string, type: number, callback) {//
//   if (!peopleId) {
//
//     callback(null, []);
//
//   } else if (mode<=4 || mode==9 || mode>=30) {
//
//     db.peoples
//       .find({_id: peopleId})
//       .project({followings: 1, dealsIds: 1, requests: 1, _id: 0})
//     .next().then(function(items) {
//       switch (mode) {
//         case 0: callback(null, items.followings.publicationsIds); break;
//         case 1: callback(null, items.followings.resourcesIds); break;
//         case 2: callback(null, items.followings.projectsIds); break;
//         case 3: callback(null, items.followings.positionsIds); break;
//         case 4: callback(null, items.followings.groupsIds); break;
//         case 9: callback(null, items.followings.peoplesIds); break;
//         case 30: callback(null, items.requests); break;
//         case 40: callback(null, items.followings.podcastsIds); break;
//         case 50: callback(null, items.followings.eventsIds); break;
//         case 60: callback(null, items.followings.appsIds); break;
//         case 70: callback(null, items.mentorsIds); break;
//         case 80: callback(null, items.dealsIds); break;
//       }
//     });
//
//   } else if (mode==5) {
//
//     db.peoples
//       .find({"_id": peopleId})
//       .project({followings: 1, groupsRelations: 1, _id: 0})
//     .next().then(function(items) {
//       switch (type) {
//         case 0: callback(null, items.groupsRelations.activesIds); break;
//         case 1: callback(null, items.groupsRelations.alumniIds); break;
//         case 2: callback(null, items.groupsRelations.visitorsIds); break;
//       };
//     });
//
//   } else { // Profile Items
//
//     db.peoples
//       .find({_id: peopleId})
//       .project({_id: 0, blockedIds: 1, blockingIds: 1,
//                 resourcesIds: 1, projectsIds: 1, profileProjectsIds: 1,
//                 publicationsIds: 1, publicationsSuggestionsIds: 1, publicationsRejectedIds: 1,
//                 talksIds: 1, postersIds: 1, pressesIds: 1, fundingsIds: 1, teachingsIds: 1, galleriesIds: 1, outreachsIds: 1})
//     .next().then(function(items) {
//       switch (mode) {
//         case 6: callback(null, items.projectsIds); break;
//         case 7: callback(null, items.publicationsIds); break;
//         case 8:
//           switch (type) {
//             case 0: callback(null, items.talksIds); break;
//             case 1: callback(null, items.postersIds); break;
//             case 2: callback(null, items.pressesIds); break;
//           }; break;
//         case 10: callback(null, items.fundingsIds); break;
//         case 11: callback(null, items.blockingIds); break;
//         case 12: callback(null, items.blockedIds); break;
//
//         case 13: callback(null, items.resourcesIds); break;
//         case 14: callback(null, items.profileProjectsIds); break;
//         // case 15: callback(null, items.profileResourcesIds); break; // DELETED
//         case 16: callback(null, items.teachingsIds); break;
//         case 17: callback(null, items.publicationsSuggestionsIds); break;
//         case 18: callback(null, items.publicationsIds.concat(items.publicationsRejectedIds)); break;
//         case 19: callback(null, items.galleriesIds); break;
//         case 20: callback(null, items.publicationsRejectedIds); break;
//         case 21: callback(null, items.outreachsIds); break;
//        }
//     });
//
//   }
// }

export function get_library_ids(userId: string, peopleId: string, callback) {
  const f = (userId==peopleId) ? {"_id": peopleId} : {"_id": peopleId, "$or": [ { "libraryPrivacy": 0 }, { "libraryPrivacy": {$exists: false} } ]};

  db.peoples
    .find(f)
    .project({library: 1, _id: 0})
  .next().then(function(items) {
    callback(null, items ? items.library : []);
  })
}

export function get_compare_ids(peopleId: string, callback) {
  db.peoples
    .find({"_id": peopleId})
    .project({_id: 0, compareIds: 1, "followings.groupsIds": 1})
  .next().then(function(items) {
    callback(null, items.compareIds, items.followings.groupsIds);
  });
}

export function get_suggestions_ids(userId: string, callback) {
  get_followings_ids(9, userId, null, function (err, idsFollowing) {
    db.peoples.aggregate([
     // { $match: { _id: { $nin: [idsFollowing.concat(userId)] }, stage: 2 } },
     { $match: { stage: 2 } },
     { $sample: { size: 10 } },
     { $project: { _id: 1 } },
    ]).toArray().then(function(items) {
      // https://stackoverflow.com/questions/34901593/how-to-filter-an-array-from-all-elements-of-another-array
      const filterIds: string[] = idsFollowing.concat(userId);
      const filteredIds = items.map( r => r._id).filter(e => filterIds.indexOf(e) < 0).slice(0,3);
      callback(null, filteredIds)
    });
  })
}

export function set_library_folder(peopleId: string, itemId: string, folderObj: any, callback) {
  if (folderObj.folder=='read' || folderObj.folder=='current' || folderObj.folder=='want') { //  ||

    const libraryPeoplesPull = Object.assign(
      (folderObj.folder!='current') ? {["library.current"] : ObjectID(itemId)} : {},
      (folderObj.folder!='want') ? {["library.want"] : ObjectID(itemId)} : {}
    )

    let libraryPublicationsPull = [];
    if (folderObj.folder!='current') libraryPublicationsPull.push("current");
    if (folderObj.folder!='want') libraryPublicationsPull.push("want");

    var publicationObj;

    if (folderObj.folder=='read') {
      publicationObj = {
        "_id": ObjectID(),
        "folder": folderObj.folder,
        "end": folderObj.end,
        "summary": folderObj.summary,
        "privacy": folderObj.privacy,
        "rating": folderObj.rating,
        "recommend": folderObj.recommend,
        "recommended": folderObj.recommended,
        "feed": folderObj.feed,
        "date": new Date()
      }
    } else {
      publicationObj = {
        "folder": folderObj.folder,
        "date": new Date()
      }
    }

    console.log('libraryPeoplesPull',libraryPeoplesPull)
    console.log('libraryPublicationsPull',libraryPublicationsPull)

    db.peoples.updateOne(
      { _id: peopleId },
      {
        $pull: libraryPeoplesPull,
        $push: { ["library." + folderObj.folder]: ObjectID(itemId) }
      },
      { safe: true }
    ).then(function(item) {
      db.publications.updateOne(
        { _id: ObjectID(itemId) },
        { $pull: { ["folders." + peopleId]: { "folder": { $in: libraryPublicationsPull } } } },
        { safe: true },
      )
    }).then(function(item) {
      db.publications.updateOne(
        { _id: ObjectID(itemId) },
        { $push: { ["folders." + peopleId]: publicationObj } },
        { safe: true },
      )
    }).then(function(item) {
      news_library_folder(true, peopleId, itemId, folderObj.folder, function (err) {
        callback(err, (folderObj.folder=='read') ? publicationObj._id : null)
      })
    });

  } else {

    console.log("folderObj",folderObj)
    console.log("itemId",itemId)

    db.peoples.updateOne(
      { _id: peopleId },
      { $push: { ["library." + folderObj.folder]: ObjectID(itemId) } },
      { safe: true }
    ).then(function(item) {
      db.publications.updateOne(
        { _id: ObjectID(itemId) },
        { $push: { ["folders." + peopleId]: {"folder": folderObj.folder, "date": new Date()} } },
        { safe: true }
      )
    }).then(function(item) {
      news_library_folder(true, peopleId, itemId, folderObj.folder, function (err) {
        callback(err, null)
      })
    });

  }
}

export function post_read_folder(peopleId: string, itemId: string, folderObj: any, callback) {
  const publicationObj = {
    "_id": ObjectID(folderObj._id),
    "folder": folderObj.folder,
    "date": folderObj.date,
    "end": folderObj.end,
    "summary": folderObj.summary,
    "privacy": folderObj.privacy,
    "rating": folderObj.rating,
    "recommend": folderObj.recommend,
    "recommended": folderObj.recommended,
    "feed": folderObj.feed,
  }

  db.publications.updateOne(
    { _id: ObjectID(itemId), ["folders." + peopleId + '._id']: ObjectID(folderObj._id) },
    { $set: { ["folders." + peopleId + ".$"]: publicationObj } },
    { safe: true }
  ).then(function(item) {
    if (folderObj.feed) {
      news_library_folder(true, peopleId, itemId, folderObj.folder, function (err) {
        callback(err)
      })
    } else {
      callback()
    }
  });
}

export function pull_library_folder(peopleId: string, itemId: string, folder: string, callback) {
  console.log('pull_library_folder',itemId, folder);
  db.peoples.updateOne(
    { _id: peopleId},
    { $pull: { ["library." + folder]: ObjectID(itemId) } },
    { safe: true }
  ).then(function(item) {
    db.publications.updateOne(
       { _id: ObjectID(itemId)},
       { $pull: { ["folders." + peopleId]: {"folder": folder} } },
       { safe: true }
    )
  }).then(function(item) {
    news_library_folder(false, peopleId, itemId, folder, function (err) {
      callback(err)
    })
  });
}

export function pull_read_folder(peopleId: string, itemId: string, folderId: string, callback) {
  console.log('pull_read_folder',itemId, folderId);
  db.peoples.updateOne(
    { _id: peopleId},
    { $pull: { ["library.read"]: ObjectID(itemId) } },
    { safe: true }
  ).then(function(item) {
    db.publications.updateOne(
       { _id: ObjectID(itemId)},
       { $pull: { ["folders." + peopleId]: {"_id": ObjectID(folderId)} } },
       { safe: true }
    )
  }).then(function(item) {
    // news_library_folder(false, peopleId, itemId, folder, function (err) {
      // callback(err)
      callback()
    // })
  });
}

export function unset_library_folder(peopleId: string, folder: string, callback) {
  console.log('unset_library_folder', peopleId, folder);
  db.peoples.updateOne(
    { _id: peopleId},
    { $unset: { ["library." + folder]: "" } },
    callback()
  );
}

export function toggle_challenge(putFlag: boolean, peopleId: string, goal: number, callback) {
  db.peoples.updateOne(
    { _id: peopleId },
    { $set: { ["challenge." + "2020"]: ((putFlag==true) ? goal : 0) } },
    { safe: true }
  ).then(function(item) {
    // news_library_folder(false, peopleId, itemId, folder, function (err) {
    //   callback(err)
    // })
    callback()
  });
}

export function news_library_folder(putFlag: boolean, peopleId: string, itemId: string, folder: string, callback) {
  console.log('news_library_folder',putFlag,peopleId,itemId,folder)
  if (putFlag==true) {
    // news.follow_feed(itemId, peopleId, 0, 0, function (err) { // mode==0
      news.add_activity(3, peopleId, 6001, itemId, peopleId, itemId, [], folder, null, null, false, function (err) {
        // news.add_notification(peopleId, feedIndex, itemId, peopleId, itemId, [], folder, null, null, function (err) {
          callback(err)
        // })
      });
    // });
  } else {
    news.follow_feed(itemId, peopleId, 0, 1, function (err) { // mode==0
      callback(err)
    });
  }
}

export function toggle_followings_ids(putFlag: boolean, mode: number, peopleId: string, type: number, itemId: string, callback) {
  var key: string;
  var collection: string;
  var feedIndex: number;

  if (!peopleId) {
    // this can probably be deleted
    callback(backhelp.error("id_error", "People ID is not valid"));

  } else {

    switch (mode) {
      case 0: {
               key = "followings.publicationsIds";
               collection = "publications";
               feedIndex=6001;
               break;
              }
      case 1: {
               key = "followings.resourcesIds";
               collection = "resources";
               feedIndex=6002;
               break;
              }
      case 2: {
               key = "followings.projectsIds";
               collection = "projects";
               feedIndex=6003;
               break;
              }
      case 3: {
               key = "followings.positionsIds";
               collection = "positions";
               feedIndex=6004;
               break;
              }
      case 4: {
               key = "followings.groupsIds";
               collection = "groups";
               feedIndex=6000;
               break;
              }
      case 5: { // DELETE?
               collection = "groups";
               switch (type) {
                  case 0: key = "groupsRelations.activesIds"; break;
                  case 1: key = "groupsRelations.alumniIds"; break;
                  case 2: key = "groupsRelations.visitorsIds"; break;
               };
               break;
              }
      case 6: {
               key = "followings.podcastsIds";
               collection = "podcasts";
               feedIndex=6005;
               break;
              }
      case 7: {
               key = "followings.eventsIds";
               collection = "events";
               feedIndex=6006;
               break;
              }
      case 8: {
               key = "followings.appsIds";
               collection = "apps";
               feedIndex=6007;
               break;
              }
      case 9: {
               key = "followings.peoplesIds";
               collection = "peoples";
               feedIndex=6020;
               break;
              }
    }

    if (putFlag==true) {

      if (mode==9) {
        db.peoples.updateOne(
           { _id: peopleId },
           // { $push: { [key]: itemId } },
           { $addToSet: { [key]: itemId } },
           { safe: true }
        ).then(function(item) {
          db[collection].updateOne(
             {_id: itemId },
             // { $push: { "followedIds": peopleId } },
             { $addToSet: { "followedIds": peopleId } },
             { safe: true },
        )}).then(function(item) {
          news.follow_feed(itemId, peopleId, mode, 0, function (err) {
            news.add_activity(3, peopleId, feedIndex, itemId, itemId, itemId, [], null, null, null, false, function (err) {
              news.add_notification(peopleId, feedIndex, itemId, itemId, itemId, [], null, null, null, function (err) {
                callback(err)
              })
            });
          });
        });
      } else {
        db.peoples.updateOne(
           { _id: peopleId },
           // { $push: { [key]: ObjectID(itemId) } },
           { $addToSet: { [key]: ObjectID(itemId) } },
           { safe: true }
        ).then(function(item) {
          if (mode==3) {
            db.positions.updateOne(
               { _id: ObjectID(itemId) }, // "apply.id": peopleId
               // { $set: { "apply.$.status": 1 } },
               { $push: { "apply":
                  {
                   "id": peopleId,
                   "mode": 0,
                   "status": 1,
                  }
                }
               },
               { safe: true }
            )
          } else {
            db[collection].updateOne(
               { _id: ObjectID(itemId) },
               // { $push: { "followedIds": peopleId } },
               { $addToSet: { "followedIds": peopleId } },
               { safe: true }
            )
          }
        }).then(function(item) {
          news.follow_feed(itemId, peopleId, mode, 0, function (err) {
            db[collection]
              .find({_id: ObjectID(itemId)})
              .project({ "groupId": 1, "_id": 0})
            .next().then(function(item) {
              if (ObjectID.isValid(item.groupId)) {
                news.add_group_activity(peopleId, feedIndex, itemId, (mode==4) ? itemId : item.groupId, itemId, [], null, null, null, 3, function (err) {
                  callback(err)
                })
              } else {
                callback();
              };
            });
          });
        });
      }

    } else {

      db.peoples.updateOne(
        {_id: peopleId},
        { $pull: { [key]: (mode==9) ? itemId : ObjectID(itemId) } },
        { safe: true }
      ).then(function(item) {
        if (mode==3) {
          db.positions.updateOne(
             { _id: ObjectID(itemId), "apply.id": peopleId },
             { $set: { "apply.$.status": 0 } },
             { safe: true }
          )
        } else {
          db[collection].updateOne(
             {_id: (mode==9) ? itemId : ObjectID(itemId)},
             { $pull: { "followedIds": (peopleId) } },
             { safe: true }
          )
        }
      }).then(function(item) {
        news.follow_feed(itemId, peopleId, mode, 1, function (err) {
           callback(err, itemId)
        });
      });

    }

  }
}

export function toggle_blocking_ids(putFlag: boolean, userId: string, peopleId: string, callback) {
  if (putFlag==true) {
    db.peoples.updateOne(
       { "_id": userId },
       { $push: { "blockingIds": peopleId } },
       { safe: true }
    ).then(function(item) {
      db.peoples.updateOne(
         { "_id": peopleId },
         { $push: { "blockedIds": userId } },
         { safe: true },
         callback()
    )});
  } else {
    db.peoples.updateOne(
      { "_id": userId},
      { $pull: { "blockingIds": peopleId } },
      { safe: true }
    ).then(function(item) {
      db.peoples.updateOne(
         { "_id": peopleId},
         { $pull: { "blockedIds": userId } },
         { safe: true },
         callback()
    )});
  }
}

export function toggle_compare_ids(putFlag: boolean, userId: string, itemId: string, callback) {
  if (putFlag==true) {
    db.peoples.updateOne(
       { "_id": userId, "$or": [
                                { "compareIds": {$size: 0} },
                                { "compareIds": {$size: 1} },
                                { "compareIds": {$size: 2} },
                                { "compareIds": {$size: 3} },
                                { "compareIds": {$size: 4} },
                                { "compareIds": {$exists: false} },
                               ]
       },
       { $push: { "compareIds": ObjectID(itemId) } },
       { safe: true },
       callback()
    );
  } else {
    db.peoples.updateOne(
      { "_id": userId},
      { $pull: { "compareIds": ObjectID(itemId) } },
      { safe: true },
      callback()
    );
  }
}

export function delete_followings_ids(collection: string, key: string, itemId: string, mode: boolean, callback) {
  db[collection]
    .find({_id: mode ? ObjectID(itemId) : itemId})
    .project({ followedIds: 1, _id: 0})
  .next().then(function(item) {
    if (item && item.followedIds) {
      db.peoples.updateMany(
         {_id: {$in: item.followedIds}},
         { $pull: { ["followings." + key]: mode ? ObjectID(itemId) : itemId } },
         { multi: true, safe: true },
         callback()
      )
    } else {
      callback()
    }
  });
}

export function delete_followed_ids(collection: string, userId: string, itemsIds, callback) {
  db[collection].updateMany(
     {_id: {$in: itemsIds}},
     { $pull: { "followedIds": userId } },
     { multi: true, safe: true },
     callback()
  )
  // )}).then(function(item) {
  //   news.follow_feed(itemId, peopleId, mode, 1, function (err) {
  //      callback(err, itemId)
  //   });
  // });
}

export function delete_blocked_ids(userId: string, itemsIds, callback) {
  db.peoples.updateMany(
     {_id: {$in: itemsIds}},
     { $pull: { "blockedIds": userId } },
     { multi: true, safe: true },
     callback()
  )
}

export function get_item_followed_ids(itemId: string, type: number, callback) {
  var collection: string;

  if (((type==9 && !itemId) || (type<9 && !ObjectID.isValid(itemId)))) {

    callback(null, []);

  } else {

    switch (type) {
      case 0: collection = "publications"; break;
      case 1: collection = "resources"; break;
      case 2: collection = "projects"; break;
      case 3: collection = "positions"; break;
      case 4: collection = "groups"; break;
      case 9: collection = "peoples"; break;
    }

    db[collection]
      .find({ _id: (type==9) ? itemId : ObjectID(itemId) })
      .project({ "followedIds": 1, "_id": 0 })
    .next().then(function(item) {
      callback(null, item.followedIds)
    })
  }
}

export function get_followings(peopleId: string, callback) {
  db.peoples
    .find({"_id": peopleId})
    .project({followings: 1, _id: 0})
  .next().then(function(items) {
    callback(null, items.followings);
  });
}

export function people_plan(peopleId: string, callback) {
  var m = { "$match" : { "_id" : peopleId } };
  var f = { "$project" : { "plan": 1 } };

  db.peoples.aggregate( [ m, f ] ).next(callback);
}

export function people_email(peopleId: string, callback) {
  var m = { "$match" : { "_id" : peopleId } };
  var f = { "$project" : { "stage": 1, "name": 1, "pic": 1, "personalInfo.email": 1 } };

  db.peoples.aggregate( [ m, f ] ).next(callback);
}

export function peoples_emails(peoplesIds: string[], callback) {
  var m = { "$match" : { "_id" : { "$in" : peoplesIds } } };
  var f = { "$project" : { "_id": 0, "stage": 1, "name": 1, "pic": 1, "personalInfo.email": 1 } };

  db.peoples.aggregate( [ m, f ] ).toArray(callback);
}

export function people_names(peopleId: string, callback) {
  var m = { "$match" : { "_id" : peopleId } };
  var f = { "$project" : { "name": 1, "names": 1 } };

  db.peoples.aggregate( [ m, f ] ).next(callback);
}

export function peoples_list(peoplesIds: string[], groupId: string, followingsIds: string[], mini: number, adminFlag: boolean, callback) {
  // http://www.kamsky.org/stupid-tricks-with-mongodb/using-34-aggregation-to-return-documents-in-same-order-as-in-expression
  var m = { "$match" : {
                        $and: [
                               { "_id" : { "$in" : peoplesIds } },
                               (groupId==null) ? {} : {"positions.groupId": ObjectID(groupId)},
                               (mini==2) ? {"positions.mode": 2} : {}, // 2 == Accepted position
                              ]
                       }
          };
  var a = { "$addFields" : { "__order" : { "$indexOfArray" : [ peoplesIds, "$_id" ] } } };
  var s = { "$sort" : { "__order" : 1 } };

  var f;

  if (mini==0) { // Following

    f = ({ "$project" : {
          _id: 1, name: 1, pic: 1,
          quote: 1,
          positions: 1,
          stage: { $gt: [ "$stage", 0 ] },
          followedSize: { $size: "$followedIds" },
          library: 1,
          // currentId: { $arrayElemAt: [ "$library.current", -1 ] },
          // currentSize: { $size: "$library.current" },
          publicationsSize: { $size: "$publicationsIds" },
          views: "$views.total",
          // co-authors
          // latest_publication
        }})
    // progress: 1,

  } else if (mini==1) { // Query Object Mini

    f = ({ "$project" : { _id: 1, name: 1, pic: 1 } })

  } else if (mini==2 || mini==6) { // 2: Add Position, Add Role, ...
                                   // 6: Compare, Update Algolia
    f = ({ "$project" : {
                         _id: 1, name: 1, pic: 1,
                         positions: { $filter: { input: "$positions", as: "position", cond: { $eq: [ "$$position.groupId", ObjectID(groupId) ] } } }
                        }
        })

  } else if (mini==3 || mini==4) { // Group People Page, ...

    if (adminFlag) {
      f = ({ "$project" : {
                           _id: 1, name: 1, pic: 1, progress: 1, stage: { $gt: [ "$stage", 0 ] }, email: "$personalInfo.email",
                           positions: { $filter: { input: "$positions", as: "position", cond: { $eq: [ "$$position.groupId", ObjectID(groupId) ] } } }
                          }
          })
    } else {
      f = ({ "$project" : {
                           _id: 1, name: 1, pic: 1,
                           positions: { $filter: { input: "$positions", as: "position", cond: { $eq: [ "$$position.groupId", ObjectID(groupId) ] } } }
                          }
          })
    }



  } else if (mini==5) { // People Admin, Group Markeitng, Delete Member
                        // (serverside Group function) + Other Places

    f = ({ "$project" : {
                         _id: 1, name: 1, pic: 1, stage: 1, "personalInfo.email": 1,
                         positions: { $filter: { input: "$positions", as: "position", cond: { $eq: [ "$$position.groupId", ObjectID(groupId) ] } } }
                        }
        })

  }

  if (followingsIds && (mini==0 || mini==3)) {

    db.peoples.aggregate( [ m, a, s, f ] ).map(
     function(u) {
       u.followStatus = followingsIds.toString().includes(u._id.toString());
       return u;
     }
    ).toArray(callback);

  } else {

    db.peoples.aggregate( [ m, a, s, f ] ).toArray(callback);

  }

  // This one doesn't keep the Original order:
  // db.peoples.find({
  //     _id: {
  //         $in: peoplesIds.map( function(id) { return id })
  //     }
  // },{
  //    _id: 1, name: 1, pic: 1, progress: 1,
  //    publicInfo: 1, positions: 1, visits: 1,
  //   }).toArray(callback);

  // console.log('peoplesIds: ',peoplesIds.map( function(id) { return id }))
}

export function peoples_list_department(peoplesIds: string[], groupsIds: string[], followingsIds: string[], callback) {
  var m = { "$match" : {
                        $and: [
                               { "_id" : { "$in" : peoplesIds } },
                               // { "positions.titles.0" : { "$in" : [303] } },
                               { "positions.groupId" : { "$in" : groupsIds } },
                               // { "positions.mode": 2 }, // 2 == Accepted position
                              ]
                       }
          };

  var a = { "$addFields" : { "__order" : { "$indexOfArray" : [ peoplesIds, "$_id" ] } } };

  var s = { "$sort" : { "__order" : 1 } };

  var f = ({ "$project" : {
                       _id: 1, name: 1, pic: 1, stage: 1,
                       positions: {
                               $filter: {
                                  input: "$positions",
                                  as: "position",
                                  cond: { $in: [ "$$position.groupId", groupsIds ] }
                                  // cond: { $eq: [ "$$position.groupId", groupsIds ] }
                               }
                              }
                      }
          })

  if (followingsIds) {

    db.peoples.aggregate( [ m, a, s, f ] ).map(
     function(u) {
       u.followStatus = followingsIds.toString().includes(u._id.toString());
       return u;
     }
    ).toArray(callback);

  } else {

    db.peoples.aggregate( [ m, a, s, f ] ).toArray(callback);

  }
}

export function people_actives(_id: string, mode: boolean = true, statusLte: number, callback) {

  const key = mode ? "_id" : "oauth_id";

  async.waterfall([

    // 1. get active Positions list
    function (cb) {
      db.peoples.aggregate([
        {$match: {[key]: _id}},
        // {$match: {[key]: field}},
        {$project: {
                    _id: 1,
                    name: 1,
                    pic: 1,
                    coverPic: 1,
                    stage: 1,
                    progress: 1,
                    quantity: 1,
                    plan: 1,
                    domain: 1,
                    channels: 1,
                    compareIds: 1,
                    followings: 1,
                    library: 1,
                    wall: 1,
                    challenge: "$challenge.2020",
                    search: { $size: { "$ifNull": [ "$search", [] ] } },
                    "invites.groupId": 1,
                    "invites.publicationId": 1,
                    "invites.mode": 1,
                    positions: {
                                $filter: {
                                  input: "$positions",
                                  as: "position",
                                  cond: {
                                    $and: [
                                      { $gte: [ "$$position.status", 4 ] },
                                      { $lte: [ "$$position.status", statusLte ] }
                                      // { $lte: [ "$$position.status", 9 ] }
                                    ]
                                  }
                                }
                               }
        }}
      ]).next(cb);
    },

    // 2. dress Positions Groups
    function (people, cb) {
      if (people) {
        if (people.library) {
          people.folders = [];
          // for (let [key, value] of Object.entries(people.library)) {
          for (let key of Object.keys(people.library)) {
            people.folders.push({
              "folder": key,
              "count": people.library[key].length
              // "count": Array(value).length
            })
          }
          delete people.library;
        }
        if (people.positions && people.positions[0]) {
          var groupdsIds = people.positions.map(r => r.groupId);
          contests.contestGroupsList(groupdsIds, function (err, contest) {
            // console.log('contest',contest)
            people.contest = contest;
            const contestDetails = contest ? { title: contest.title, deadline: contest.deadline, amount: contest.amount, prizes: contest.prizes, pics: contest.pics } : null;
            groups.groups_list(groupdsIds, null, null, null, null, 2, true, function (err, items) {
              people.positions.forEach(function(position) {
                position.contest = contest ? (contest.groupsIds.find(id => id.toString() == position.groupId.toString()) ? contestDetails : null) : null;
                const item = items.find(item => item._id.toString() == position.groupId.toString());
                position.group = item ? item.groupIndex : null;
                position.coverPic = item ? item.pic : null;
                delete position.groupId;
              })
              cb(err,people);
            });
          });
        } else {
          contests.contestDetails(function (err, contest) {
            people.contest = contest;
            cb(err, people)
          })
        }
      } else {
        cb(null, null)
      }
    },

    // 3. dress Invites Groups
    function (people, cb) {
      var groupItem;

      if (people && people.invites && people.invites[0]) {
        var groupdsIds = people.invites.filter(r => r.mode<4).map(r => r.groupId);
        groups.groups_list(groupdsIds, null, null, null, null, 2, true, function (err, items) {
          people.invites.forEach(function(invite) {
            if (invite.mode<4) {
              groupItem = items.find(item => item._id.toString() == invite.groupId.toString());
              invite.group= groupItem ? groupItem.groupIndex : null;
              delete invite.groupId;
            }
          })
          // people.invites = people.invites.map(r => r.group);
          cb(err,people);
        });
      } else {
        cb(null, people)
      }
    },

    // 4. dress Invites Publications + Update Publication
    function (people, cb) {
      var publicationItem;

      if (people && people.invites && people.invites[0]) {
        var publicationsIds = people.invites.filter(r => r.mode==4).map(r => r.publicationId);

        publications.publications_list(publicationsIds, null, null, 0, 0, false, function (err, items) {
          people.invites.forEach(function(invite) {
            if (invite.mode==4) {
              publicationItem = items.find(item => item._id.toString() == invite.publicationId.toString());
              invite.publication = publicationItem ? publicationItem : null;
              delete invite.publicationId;
            }
          })
          cb(err,people);
        });
      } else {
        cb(null, people)
      }
    },

    // 5. Global Challenge Stats
    // db.peoples
    //   .find(
    //     { $or: [ { "challenge": { $exists: true } }, { "library": { $exists: true } } ] }
    //   )
    //   .project({_id: 1, name: 1, challenge: 1, library: 1})
    //   .toArray(callback);

  ],
  function (err, people) {
    if (err) {
      callback(err);
    } else {
      callback(null, people);
    }
  });
}

export function people_group_relations(peopleId: string, callback) {

  db.peoples.find({ $and:[ { "_id": peopleId }
                    // { "positions.groupId" : { "$in" : groupsIds } }
                  ]})
                  .project({_id: 0, positions: 1, visits: 1}).next(callback);
}

export function people_profile(peopleId: string, adminFlag: boolean, callback) {
  const m = { _id: peopleId };

  const p = {
              _id: 1, name: 1, pic: 1, coverPic: 1, background: 1, quote: 1, stage: 1,
              meetClip: 1, researchInterests: 1, recreationalInterests: 1, // progress: 1,
              // jobs: 1, fundings: 1, teachings: 1,
              positions: 1, outreach: 1, services: 1, societies: 1, languages: 1, honors: 1,
              twitter: 1, views: 1,
              library: 1,
              counts: {
                publications: { $size: "$publicationsIds" },
                resources: { $size: "$resourcesIds" },
                profileProjects: { $size: "$profileProjectsIds" },
                projects: { $size: "$projectsIds" },
              },
            }

  db.peoples.aggregate(
   [
    { "$match" : m },
    { "$project": p }
   ]
  ).next(callback);
}

export function people_profile_basic(peopleId: string, followingsIds: string[], blockingsIds: string[], groupId: string, adminFlag: boolean, callback) {
  const m = { _id: peopleId };

  const p = {
             _id: 1, name: 1, pic: 1, plan: 1, stage: 1,
             // domain: 1,
             publicInfo: 1, socialInfo: 1, coverPic: 1,
             marketing: 1, email: "$personalInfo.email",
             positions: 1, progress: 1, names: 1,
             interests: "$researchInterests", background: 1,
             flag: { $ne: [ "$oauth_id", null ] }
             // {
             //  $filter: {
             //   input: "$positions",
             //   as: "position",
             //   cond: { $eq: [ "$$position.groupId", ObjectID(groupId) ] }
             //  }
             // }
            }

  // if (!adminFlag) p['positions']=1;

  if (followingsIds || blockingsIds) {

    db.peoples.aggregate(
    [
     { "$match" : m },
     { "$project": p }
    ]
    ).map(
     function(u) {
       if (followingsIds) u.followStatus = followingsIds.toString().includes(u._id.toString());
       if (blockingsIds) u.blockStatus = blockingsIds.toString().includes(u._id.toString());
       return u;
     }
    ).next(callback);

  } else {

    db.peoples.aggregate(
     [
      { "$match" : m },
      { "$project": p }
     ]
    ).next(callback);

  }

}

export function people_news_updtes(peopleId: string, callback) {
  db.peoples.find({ "_id": peopleId}).project({_id: 1, name: 1, pic: 1, positions: 1, country: 1}).next(callback);
}

export function people_info(peopleId: string, type: string, callback) {
   db.peoples.find({ "_id": peopleId}).project({[type]: 1, _id: 0}).next(callback);
}

export function post_user_name(name: string, userId: string, callback) {
  db.peoples.updateOne(
     { _id: userId},
     { $set: { "name": name } },
     { safe: true },
  ).then(function(item) {
    post_people_mini(userId, name, null, 0, function (err) {
      callback(err)
    })
  })
}

export function post_people_mini(peopleId: string, name: string, pic: string, mode: number, callback) {
  const key = (mode==0) ? "name" : "pic";

  async.waterfall([
    // update People Name / Pic in associated items
    function (cb) {
      db.peoples
        .find({_id: peopleId})
        .project({ "_id": 0,
                   "name": 1,
                   "pic": 1,
                   "personalInfo.email": 1,
                   "publicationsIds": 1,
                   "resourcesIds": 1,
                   "profileProjectsIds": 1,
                   "projectsIds": 1,
                   "fundingsIds": 1,
                   "mediaIds": 1,
                   "contactsIds": 1,
                   "positions": 1})
      .next().then(function(item) {

        async.parallel({

          algolia: function (cb) {
            algoliaIndex.partialUpdateObject({
              objectID: peopleId,
              name: (mode==0) ? name : item.name,
              pic: (mode==0) ? item.pic : pic
            }, (err, content) => {
             cb(err)
            });
          },

          sendgrid: function (cb) {
            const names = item.name.split(/[ .]+/);
            const firstName = capitalizeFirstLetter(names.shift());
            const lastName = capitalizeFirstLetter(names.shift() || "");
            sendgrid.contactUpdateName(item.personalInfo.email, firstName, lastName, function (err) {
              cb(err);
            });
          },

          publications: function (cb) {
            if (item.publicationsIds) {
              db.publications.updateMany(
                 {_id: {$in: item.publicationsIds.map(r => ObjectID(r))}, "authors._id": peopleId},
                 { $set: {["authors.$."+key]: (mode==0) ? name : pic } },
                 { multi: true, safe: true },
                 cb()
              )
            } else {
              cb()
            }
          },

          projects: function (cb) {
            if (item.projectsIds || item.profileProjectsIds) {
              db.projects.updateMany(
                 {_id: {$in: item.projectsIds.concat(item.profileProjectsIds).map(r => ObjectID(r))}, "people._id": peopleId},
                 { $set: {["people.$."+key]: (mode==0) ? name : pic } },
                 { multi: true, safe: true },
                 cb()
              )
            } else {
              cb()
            }
          },

          fundings: function (cb) {
            if (item.fundingsIds) {
              db.fundings.updateMany(
                 {_id: {$in: item.fundingsIds.map(r => ObjectID(r))}, "roles.member._id": peopleId},
                 { $set: {["roles.$.member."+key]: (mode==0) ? name : pic } },
                 { multi: true, safe: true },
                 cb()
              )
            } else {
              cb()
            }
          },

          media: function (cb) {
            if (item.mediaIds) {
              db.media.updateMany(
                 {_id: {$in: item.mediaIds.map(r => ObjectID(r))}, "presentors._id": peopleId},
                 { $set: {["presentors.$."+key]: (mode==0) ? name : pic } },
                 { multi: true, safe: true },
                 cb()
              )
            } else {
              cb()
            }
          },

          contacts: function (cb) {
            if (item.contactsIds) {
              db.contacts.updateMany(
                 {_id: {$in: item.contactsIds.map(r => ObjectID(r))} },
                 { $set: {["member."+key]: (mode==0) ? name : pic } },
                 { multi: true, safe: true },
                 cb()
              )
            } else {
              cb()
            }
          },

          groups: function (cb) {
            if (item.positions) {
              db.groups.updateMany(
                 {_id: {$in: item.positions.map(r => ObjectID(r.groupId))},
                  $or: [
                    {"futureMeetingsItems.settings.participants._id": peopleId},
                    {"futureMeetingsItems.meetings.presenter._id": peopleId},
                    {"pastMeetingsItems.meetings.presenter._id": peopleId},
                    {"reportsItems.settings.whoSubmit._id": peopleId},
                    {"reportsItems.settings.whoSee._id": peopleId},
                    {"reportsItems.currentReport.whoSubmit._id": peopleId},
                    {"reportsItems.currentReport.whoSee._id": peopleId}
                  ],
                 },
                 { $set:
                   {
                     ["futureMeetingsItems.settings.participants.$[]."+key]: (mode==0) ? name : pic,
                     ["futureMeetingsItems.meetings.$[].presenter."+key]: (mode==0) ? name : pic,
                     ["pastMeetingsItems.meetings.$[].presenter."+key]: (mode==0) ? name : pic,
                     ["reportsItems.settings.whoSee.$[]."+key]: (mode==0) ? name : pic,
                     ["reportsItems.settings.whoSubmit.$[]."+key]: (mode==0) ? name : pic,
                     ["reportsItems.currentReport.whoSee.$[]."+key]: (mode==0) ? name : pic,
                     ["reportsItems.currentReport.whoSubmit.$[]."+key]: (mode==0) ? name : pic,
                   }
                 },
                 { multi: true, safe: true },
                 cb()
              )
            } else {
              cb()
            }
          },

        },

        function (err) {
          cb(err)
        });

      })
    }
  ],
  function (err) {
    callback(err);
  });
};

export function people_reports(peopleId: string, groupId: string, callback) {
  db.peoples.aggregate([
      {$match: {"_id": peopleId}},
      {$project: {
          _id: 0,
          reports: {
                    $filter: {
                       input: "$reports",
                       as: "report",
                       cond: { $eq: [ "$$report.groupId", ObjectID(groupId) ] }
                    }
                   }
      }}
  ]).next().then(function(items) {
     callback(null, items.reports);
  });
}

export function delete_private_report(itemId: string, userId: string, callback) {
  db.peoples.updateOne(
    { _id: (userId) },
    { $pull: { "reports": { "_id": ObjectID(itemId) } } },
    { multi: false, safe: true },
    callback()
  )
}

export function put_table(data, mode: number, userId: string, callback) {
  data._id= ObjectID().toString();

  const data_clone = JSON.parse(JSON.stringify(data));
  var key: string;
  var progressNum: number;

  switch(mode) {
     case 0: key="positions"; progressNum = 3; break;
     case 1: key="positions"; progressNum = 3; break;
     case 2: key="honors"; break;
     // case 3: key="jobs"; break;
     case 3: key="positions"; break;
     case 4: key="outreach"; break;
     case 5: key="teachings"; break;
     case 6: key="services"; break;
     case 7: key="societies"; break;
     case 8: key="languages"; break;
     case 9: key="fundings"; progressNum = 10; break;
     default: console.log("Invalid mode");
  }

  if (mode==0 || mode==1 || mode==9) {
    db.peoples.updateOne(
      {_id: userId},
      {
        $push: { [key]: data_clone },
        $set: { ["progress." + progressNum]: 1 }
      },
      function(err, res) {
        if (err) throw err;
        callback(null, data._id)
      });
  } else {
    db.peoples.updateOne(
      {_id: userId},
      { $push: { [key]: data_clone } },
      function(err, res) {
        if (err) throw err;
        callback(null, data._id)
      });
  }
}

export function put_share(data, mode: number, userId: string, callback) {
  const data_clone = JSON.parse(JSON.stringify(data));

  async.forEachOf(data_clone.ids, function (peopleId, key, callback) {
    news.add_notification(userId, 13000+mode, data_clone.itemId, peopleId, peopleId, [], null, null, null, function (err, newsId) {
      callback()
    });
  }, function (err, results) {
    if (err) {
      callback(err);
    } else {
      callback(null);
    }
  })
}

export function post_table(data, mode: number, userId: string, callback) {

  const data_clone = JSON.parse(JSON.stringify(data));
  var key: string;
  var fields;

  switch(mode) {
     // case 0: {
     //   key="positions";
     //   break;
     // } case 1: {
     //   key="positions";
     //   break;
     // }
     case 2: {
       key="honors";
       fields = {
                 "honors.$.name": data_clone.name,
                 "honors.$.period": data_clone.period
                };
       break;
     // } case 3: {
       // key="jobs";
       // fields = {
       //           "jobs.$.name": data_clone.name,
       //           "jobs.$.period": data_clone.period,
       //           "jobs.$.title": data_clone.title,
       //           "jobs.$.description": data_clone.description,
       //          };
       // break;
     } case 4: {
       key="outreach";
       fields = {
                 "outreach.$.name": data_clone.name,
                 "outreach.$.period": data_clone.period,
                 "outreach.$.role": data_clone.role
                };
       break;
     } case 5: {
       key="teachings";
       fields = {
                 "teachings.$.name": data_clone.name,
                 "teachings.$.period": data_clone.period,
                 "teachings.$.id": data_clone.id,
                 "teachings.$.role": data_clone.role,
                 "teachings.$.university": data_clone.university,
                };
       break;
     } case 6: {
       key="services";
       fields = {
                 "services.$.name": data_clone.name,
                 "services.$.period": data_clone.period,
                 "services.$.journal": data_clone.journal,
                 "services.$.role": data_clone.role
                };
       break;
     } case 7: {
       key="societies";
       fields = {
                 "societies.$.name": data_clone.name,
                };
       break;
     } case 8: {
       key="languages";
       fields = {
                 "languages.$.name": data_clone.name,
                 "languages.$.level": data_clone.level
                };
       break;
     } case 9: {
       key="fundings";
       fields = {
                 "fundings.$.name": data_clone.name,
                 "fundings.$.period": data_clone.period,
                 "fundings.$.pic": null,
                 "fundings.$.link": data_clone.link,
                 "fundings.$.abbr": data_clone.abbr,
                 "fundings.$.officalId": data_clone.officalId,
                 "fundings.$.description": data_clone.description,
                };
       break;
     } default: console.log("Invalid mode");
  }

  db.peoples.updateOne(
     {_id: (userId), [key + "._id"]: data_clone._id },
     { $set: fields },
     { safe: true },
     callback
  )

}

export function delete_table(mode: number, itemId: string, userId: string, callback) {
  var key: string;

  switch(mode) {
     case 0: key="positions"; break;
     case 1: key="positions"; break;
     case 2: key="honors"; break;
     // case 3: key="jobs"; break;
     case 3: key="positions"; break;
     case 4: key="outreach"; break;
     case 5: key="teachings"; break;
     case 6: key="services"; break;
     case 7: key="societies"; break;
     case 8: key="languages"; break;
     case 9: key="fundings"; break;
     default: console.log("Invalid mode");
  }

  db.peoples.updateOne(
    {_id: (userId)},
    { $pull: { [key]: {"_id": itemId } } },
    { multi: false, safe: true },
    callback()
  )

}

export function tasks_personal_email_verified(userId: string, callback) {
  async.waterfall([

    // 1. update Email Stage
    function (cb) {
      console.log('1. Update Email Stage')
      db.peoples.updateOne(
        { "_id": userId },
        { $set: { "stage": 2 } },
        { safe: true },
        cb()
      )
    },

    // 2. add: user feed news
    // function (cb) {
    //   news.add_activity(3, userId, 1050, userId, userId, userId, [], null, null, null, function (err) {
    //     cb(err)
    //   });
    // },

    // 2. pull Invites => delete Original
    function (cb) {
      console.log('2. Pull Invites')
      invites.retrieve_non_user_invite(userId, function (err) {
        cb(err);
      })
    },

    // 3. retrieve Email
    function (cb) {
      console.log('3. Retrieve Email')
      people_email(userId, function (err, user) {
        // emails.welcomeEmail(user.name, user.personalInfo.email, function (err) {
          cb(err, user.personalInfo.email, user.name, user.pic);
        // })
      })
    },

    // 4. create Algolia
    function (email: string, name: string, pic: string, cb) {
      const object = [{
        objectID: userId,
        _id: userId,
        created_on: new Date(),
        name: name,
        pic: pic,
        positions: [],
        quote: null,
        views: 0,
        followedSize: 0,
        publicationsSize: 0,
        currentSize: 0,
        country: null
      }];

      algoliaIndex.addObjects(object, (err, content) => {
        cb(err, email, name);
      });
    },

    // 5. SendGrid: create contact + add to lists
    function (email: string, name: string, cb) {
      console.log('5. Create SendGrid Contact')
      const names = name.split(/[ .]+/);
      const firstName = capitalizeFirstLetter(names.shift());
      const lastName = capitalizeFirstLetter(names.shift() || "");
      sendgrid.contactAdd(email, firstName, lastName, [], function (err) {
        cb(err, email);
      });
    },

    // 6. create Stripe Account: Create only when upgrading to PRO
    function (email: string, cb) {
      console.log('6. Create Stripe Account')
      stripe.customers.create({"email": email}).then(function(customer) {
        db.peoples.updateOne(
          { _id: userId},
          { $set: { "stripe_id": customer.id } },
          function(err, res) {
            cb(err)
          }
        );
      });
    },

    // 7. push "Take Academig Tour" Notification
    function (cb) {
      console.log('7. Tour Notification')
      news.add_notification("Academig", 15000, userId, userId, null, [], null, null, null, function (err) {
        cb (err)
      })
    },

  ],
  function (err) {
    callback(err);
  });
}

// https://stackoverflow.com/questions/1026069/how-do-i-make-the-first-letter-of-a-string-uppercase-in-javascript
function capitalizeFirstLetter(string) {
  return string.charAt(0).toUpperCase() + string.slice(1);
}

export function verify_institute_email(userId: string, groupId: string, callback) {
  db.peoples.updateOne(
    { "_id": userId, "positions.groupId": ObjectID(groupId) },
    { $set: { "positions.$.email.stage": 2 }
    }, function(err, res) {
      callback(err)
    });
}

export function update_institute_email(userId: string, groupId: string, email: string, callback) {
  db.peoples.updateOne(
    { "_id": userId, "positions.groupId": ObjectID(groupId) },
    { $set:
      {
        "positions.$.email.address": email,
        "positions.$.email.updated": new Date(),
        "positions.$.email.stage": 0,
      },
    }, function(err, res) {
      callback(err)
    });
}

export function put_contact_message(userId: string, toId: string, mode: number, callback) {
  console.log('userId',userId)
  db.peoples.updateOne(
    { "_id": userId },
    { $push:
      {
        "messages": {
          "toId": (mode==0) ? ObjectID(toId) : toId,
          "mode": mode,
          "date": new Date()
        }
      },
    },
    callback()
  );
}

export function user_stripe_id(userId: string, callback) {
  db.peoples
    .find({_id: userId})
    .project({_id: 0, stripe_id: 1})
  .next().then(function(item) {
    callback(null,item.stripe_id)
  })
}

export function user_plan_status(userId: string, callback) {
  var sub;
  var customer_plan;
  var planName;

  db.peoples
    .find({_id: userId})
    .project({_id: 0, stripe_id: 1})
  .next().then(function(item) {
    // console.log('item',item)
    if (item.stripe_id) {
      stripe.customers.retrieve(item.stripe_id, function(err, customer) {
        // console.log('source',customer.sources.data)
        // console.log('subscriptions',customer.subscriptions.data)
        sub = customer.subscriptions ? customer.subscriptions.data[0] : null;

        customer_plan = sub ? { "status": sub.status,
                                "trial_end": sub.trial_end,
                                "trial_start": sub.trial_start,
                                "plan": (process.env.PORT) ? ((sub.plan.id=="plan_FEkfxvASc3fxnL" || sub.plan.id=="plan_FEkgayuUC0K5g3") ? 1 : 0)
                                                           : ((sub.plan.id=="plan_FDW4rRATIUJwx3" || sub.plan.id=="plan_FDW4RZ2S8HJ1LT") ? 1 : 0)
                              }
                            : null;

        callback(err, customer_plan)
      });
    } else {
      callback(null)
    }
  });
}

export function create_people_profile(host, userId: string, data: CreateProfile, callback) {
  const countries = Countries;

  const sub_pics: string[] =
    ['Arts', 'History', 'Literature', 'Philosophy', 'Theology',
     'Anthropology', 'Archaeology', 'Economics', 'Human', 'Law', 'Political', 'Psychology', 'Sociology',
     'Biology', 'Chemi stry', 'Earth', 'Space', 'Physics',
     'Computer', 'Mathematics', 'Statistics',
     'Chemical', 'Civil', 'Educational', 'Electrical', 'Materials', 'Mechanical', 'Systems', 'Medicine']

  async.waterfall([

    // 1. update SendGrid First+Last names
    function (cb) {
      console.log('Personal_1')
      people_email(userId, function (err, user) {
        sendgrid.contactUpdateName(user.personalInfo.email, data.firstName, data.lastName, function (err) {
          cb(err, user.personalInfo.email, data.firstName, data.lastName);
        });
      })
    },

    // 2. create Mentor Document (Flag)
    function (email: string, firstName: string, lastName: string, cb) {
      console.log('Personal_2')
      if (Number(data.mentorStatus)) {
        mentors.put_mentor(userId, email, firstName, lastName, function (err, mentorId) {
          cb(err, mentorId)
        })
      } else {
        cb(null, null)
      }
    },

    // 3A. update Personal Profile
    function (mentorId: string, cb) {
      console.log('Personal_3A')
      db.peoples.updateOne(
         {_id: userId },
         { $set: {
           // 0 - Profile Picture
           ["progress.1"]: data.interests ? 1 : 0, // Interests
           ["progress.2"]: data.background ? 1 : 0, // About Me
           ["progress.3"]: 1, // Positions and Education
           ["progress.4"]: 1, // Cover Picture
           ["progress.5"]: 1, // Progress Flag
           "name": data.firstName + ' ' + data.lastName,
           "country": Number(data.country_id),
           "pic": data.pic,
           "coverPic": data.cover ? data.cover : 'https://s3.amazonaws.com/academig/coverPics/big/' + sub_pics[data.theme]+'_'+data.themeIndex + '.jpeg',
           "researchInterests": data.interests,
           "background": data.background,
           "names": data.names,
           "theme": data.theme,
           "themeIndex": data.themeIndex,
           "mentorId": ObjectID(mentorId),
           "challenge.2020": Number(data.challengeGoal),
           "followings.groupsIds": data.groupsIds ? data.groupsIds.map(i => ObjectID(i)) : []
          }
         },
         { safe: true },
         cb()
      )
    },

    // 3B. update Algolia
    function (cb) {
      console.log('Personal_3B')
      algoliaIndex.partialUpdateObject({
        objectID: userId,
        name: data.firstName + ' ' + data.lastName,
        pic: data.pic,
        quote: null,
        country: data.country_id ? countries[countries.findIndex(y => y.id == data.country_id)].name : null,
        interests: data.interests,
        background: data.background,
      }, (err, content) => {
        cb()
      });
    },

    //
    // 4. update Group Followings
    function (cb) {
      console.log('Personal_4',data.groupsIds)
      if (data.groupsIds && data.groupsIds.length>0) {
        news.follow_groups_feeds(data.groupsIds, userId, function (err) {
          cb(err)
        })
      } else {
        cb()
      }
    },

    // 5. create Lab Profile
    function (cb) {
      console.log('Personal_5')
      if (data.university && data.department && data.group) {
        const groupBuild: any = {
          'buildMode': data.buildMode,
          'privacy': 1,
          'members': data.members,
          'currentWebsite': data.currentWebsite,
          'buildPro': data.buildPro,
          'interview': data.interview,
          'papersKit': data.papersKitStatus,
          'group_size': data.group_size,
          'establishDate': data.establishDate,
          'topic': data.topic,
          'group': data.group,
          'department': data.department,
          'university': data.university
        };
        group_create_data.create_group(groupBuild, host, userId, function (err, items) {
          cb(err)
        });
      } else {
        cb()
      }

    },

    // 6. Retrieve User Suggestions
    function (cb) {
      cb()
      // console.log('Personal_6')
      // if (data.university=="company") {
      //   cb()
      // } else {
      //   publication_misc.retrieveSuggestions(1, userId, function (err) {
      //     cb(err)
      //   });
      // }
    },

  ],
  function (err) {
    callback(err);
  });
}

export function put_profile_skip(userId: string, callback) {
  db.peoples.updateOne(
    {_id: userId },
    { $set: { ["progress.5"]: 1 } },
    { safe: true },
    callback()
  )
}

export function create_dummy_position(userId: string, position: CreatePosition, callback) {
  // DATA:
  // university_name
  // department_name
  // group_name
  // position
  // period

  console.log('CreatePosition',position)

  var groupComplex: groupComplex;
  var positionId: string;

  var university: complexName;
  var universityExternalLink: string = "";
  var universityDescription: string = "";

  var department: complexName;
  var departmentExternalLink: string = "";
  var departmentDescription: string = "";

  var country: Number;
  var state: string;
  var city: string;
  var location: string[];

  var createMode: number = 0; // 0 - Create Group
                              //     Create Department
                              //     Create University
                              //     Push new Department into new University
                              //     Push new Group into new Department
                              // 1 - Create Group
                              //     Create Department
                              //     Push new Department inside existing University
                              //     Push new Group into new Department
                              // 2 - Create Group
                              //     Push new Group into exisintg Department

  async.waterfall([

    // 1. check University Existence.
    function (cb) {
      console.log('Position_1')

      universities.university_id(position.groupComplex.university.name, 0, function (err, universityId) {
        if (universityId) {

          createMode++;
          universities.university_details(universityId, 0, function (err, university_data) {
            university=university_data;
            universityExternalLink=university_data.externalLink;
            universityDescription=university_data.description;
            cb(err)
          });

        } else {

          university = {"_id": null,
                        "name": position.groupComplex.university.name,
                        "link": misc.NFD(position.groupComplex.university.name),
                        "pic": null};
          cb()

        }
      });
    },

    // 2. check Department Existence.
    function (cb) {
      console.log('Position_2')

      departments.department_id(position.groupComplex.university.name, position.groupComplex.department.name, 0, function (err, departmentId) {
        if (departmentId) {

          createMode++;
          departments.departments_list([departmentId], 0, function (err, department_data) {

            department=department_data[0].departmentIndex.department;

            departmentExternalLink=department_data[0].externalLink;
            departmentDescription=department_data[0].description;

            country = department_data[0].country;
            state = department_data[0].state;
            city = department_data[0].city;
            location = department_data[0].location;

            cb(err)
          });

        } else {

          department = {"_id": null,
                        "name": position.groupComplex.department.name,
                        "link": misc.NFD(position.groupComplex.department.name),
                        "pic": null}
          cb()
        }

      });
    },

    // 3. Add Dummy Group and Positions
    function (cb) {
      console.log('Position_3')

      groupComplex = {
        'group': {"_id": null, "name": position.groupComplex.group.name, "pic": null, "link": null}, // take only name and not link
        'department': department,
        'university': university
      };

      const dummy_obj = {
                         "titles": (university.name=="company") ? position.titles : [Number(position.titles[0])],
                         "group": groupComplex,
                         "period": position.period
                        }

      groups.create_dummy_member(dummy_obj, userId, function (err, positionArr) {
        positionId = positionArr[1];
        cb(err, positionArr[0])
      });

    },

    // 4. create/update Department document
    function (group_id: string, cb) {
      console.log('Position_4')

      const department_data = {"groupId": group_id,
                               "department": position.groupComplex.department.name,
                               "university": position.groupComplex.university.name};

      departments.createDepartment(department_data, createMode, function (err, department_id) {
        cb(err, group_id, department_id)
      });

    },

    // 5. create/update University document
    function (group_id: string, department_id: string, cb) {
      console.log('Position_5')

      const university_data = {"departmentId": department_id,
                               "department": position.groupComplex.department.name,
                               "unit": null,
                               "universityId": university._id,
                               "university": position.groupComplex.university.name,
                               "externalLink": universityExternalLink,
                               "description": universityDescription};

      universities.createUniversity(university_data, createMode, function (err, university_id) {
        cb(err, group_id, department_id, university_id)
      });

    },

    // 6. create Academig ID in UniversityQuery document (conditional)
    function (group_id: string, department_id: string, university_id: string, cb) {
      console.log('Position_6')

      universities.universities_query(position.groupComplex.university.name, 1, function (err, university) {
        console.log("universities_query",university)
        universities.university_activate(university[0]._id, university_id, position.groupComplex.university.name, function (err) {
          cb(err, group_id, department_id, university_id)
        });
      })
    },

    // 7. update groupIndex IDs
    function (group_id: string, department_id: string, university_id: string, cb) {
      console.log('Position_7')

      groupComplex.group._id = group_id;

      db.groups.updateOne(
        {_id: ObjectID(group_id)},
        { $set:
          {
            "groupIndex.group._id": ObjectID(group_id),
            "groupIndex.department._id": ObjectID(department_id),
            "groupIndex.university._id": ObjectID(university_id),
          },
        }, function(err, res) {
          cb(err, department_id, university_id)
        });
    },

    // 8. update departmentIndex IDs
    function (department_id: string, university_id: string, cb) {
      console.log('Position_8')

      db.departments.updateOne(
        {_id: ObjectID(department_id)},
        { $set:
          {
            "departmentIndex.department._id": ObjectID(department_id),
            "departmentIndex.university._id": ObjectID(university_id)
          },
        }, function(err, res) {
          // cb(err, department_id)
          cb(err)
        });
    },

  ],
  function (err) {
    callback(err, positionId, groupComplex);
  });
}

export function generate_people_position(mode: number,
                                         status: number,
                                         period: Period,
                                         title: string,
                                         instituteEmail: string,
                                         emailStage: number,
                                         group_id: string,
                                         department_id: string,
                                         university_id: string): any {

  const people_position_data ={"mode": mode,
                               "status": status,
                               "period": period,
                               "titles": [title],
                               "email": {
                                         "address": instituteEmail,
                                         "updated": new Date(),
                                         "stage": emailStage
                                        },
                               "groupId": ObjectID(group_id)
                              };

  return people_position_data
}

function people_algolia_positions(peopleId: string, callback) {
  db.peoples
    .find({ _id: peopleId })
    .project({ "positions": 1 })
  .next().then(function(item) {
    groups.groups_list(item.positions.map(g=>g.groupId), null, null, null, null, 2, true, function (err, items) {
      item.positions.forEach(function(position) {
        const item = items.find(item => item._id.toString() == position.groupId.toString());
        position.group = item ? item.groupIndex : null;
        delete position.groupId;
        delete position.email;
        delete position.mode;
        delete position.status;
        delete position._id;
      })
      algoliaIndex.partialUpdateObject({
        objectID: peopleId,
        positions: item.positions
      }, (err, content) => {
        callback(err)
      })
    });
  })
}

function people_positions(peopleId: string, callback) {
  db.peoples
    .find({ _id: peopleId })
    .project({ "positions": 1 })
  .next().then(function(item) {
    callback(null,item.positions)
  })
}

function invalid_people_name() {
    return backhelp.error("invalid_people_name", "People names can have letters, #s, _ and, -");
}
