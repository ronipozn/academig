var db = require('../db.ts'),
    async = require('async'),
    backhelp = require("./backend_helpers.ts");

var ObjectID = require('mongodb').ObjectID;

var universities = require("./universities.ts");
var departments = require("./departments.ts");
var groups = require("./groups.ts");
var peoples = require("./peoples.ts");
var news = require("./news.ts");
var invites = require("./invites.ts");

var projects = require("./projects.ts");
var resources = require("./resources.ts");
// var emails = require("../misc/emails.ts");

import {objectMini, Link, Rank, Quote, Affiliation, PublicInfo, SocialInfo} from '../models/shared.ts';

const algoliasearch = require('algoliasearch');
const client = algoliasearch('TDKUK8VW4T', '5d17934a8722069c0ac47bd6b4ae4bda');

exports.version = "0.1.0";

export function update_page_views(page: string, parentId: string, mode: number, userId: string, callback) {
  const collection: string = (mode==0) ? "groups" : "peoples";

  if (mode==1 && userId==parentId) {
    callback()
  } else {
    db[collection].updateOne(
       { _id: (mode==0) ? ObjectID(parentId) : parentId },
       { $inc: { ["views."+page]: 1 } },
       { safe: true },
       callback()
    )
  }
}

export function put_domain_request(parentId: string, mode: number, callback) {
  var collection: string;

  if (mode==0) {
    collection = "groups";
  } else if (mode==1) {
    collection = "peoples";
  }

  db[collection].updateOne(
     {_id: (mode==0) ? ObjectID(parentId) : parentId },
     { $set: { domain: 1 } },
     { safe: true },
     callback()
  )
};

export function post_twitter(feed: string, parentId: string, userId: string, mode: number, callback) {
  var collection: string;

  if (mode==0) {
    collection = "groups";
  } else if (mode==1) {
    collection = "peoples";
  } else if (mode==2) {
    collection = "departments";
  } else if (mode==3) {
    collection = "universities";
  } else if (mode==4) {
    collection = "trends";
  } else if (mode==5) {
    collection = "podcasts";
  } else if (mode==6) {
    collection = "events";
  } else if (mode==7) {
    collection = "apps";
  }

  db[collection].updateOne(
    { _id: (mode==1) ? userId : ObjectID(parentId) },
    { $set: { ["socialInfo.twitter"]: feed } },
    { safe: true },
    callback()
  );
};

export function post_stage(parentId: string, mode: number, stage: number, callback) {
  db[(mode==0) ? "universities" : "departments"].updateOne(
    { _id: ObjectID(parentId) },
    { $set: { "stage": stage ? 1 : 0} },
    { safe: true },
    callback()
  );
};

export function post_location(lat: number, lng: number, country: number, state: string, city: string, parentId: string, userId: string, mode: number, callback) {
  var setObj: any;
  var collection: string;

  if (mode==0) {
    collection = "peoples";
  } else if (mode==1) {
    collection = "groups";
  } else if (mode==2) {
    collection = "departments";
  } else if (mode==3) {
    collection = "universities";
  } else if (mode==4) {
    collection = "trends";
  } else if (mode==5) {
    collection = "podcasts";
  } else if (mode==6) {
    collection = "events";
  } else if (mode==7) {
    collection = "apps";
  }

  if (mode==0) {
    setObj = {
      "country": Number(country)
    }
  } else {
    setObj = {
      "location": [Number(lat), Number(lng)],
      "country": Number(country),
      "state": state ? state : null,
      "city": city ? city : null
    }
  }

  db[collection].findOneAndUpdate(
    { _id: (mode==0) ? parentId : ObjectID(parentId) },
    { $set: setObj },
    function(err, doc) {
      if (mode==1) {
        const companyFlag: number = (doc.value.onBehalf==4 || doc.value.onBehalf==5 || doc.value.onBehalf==7) ? 1 : 0;
        groups.post_group_location(Number(lat), Number(lng), Number(country), state, city, parentId, companyFlag, function (err) {
          callback(err)
        })
      } else if (mode==2) {
        departments.post_groups_location(Number(lat), Number(lng), Number(country), state, city, parentId, function (err) {
          callback(err)
        })
      } else {
        callback()
      }
    }
  );

};

export function post_title(title: string, itemId: string, mode: number, callback) {
  var key: string;
  var collection: string;

  if (mode==0) {
    collection = "projects"; key = "name";
  } else if (mode==1) {
    collection = "resources"; key = "name";
  // } else if (mode==2) {
  //   collection = "positions"; key = "title";
  }

  db[collection].updateOne(
     {_id: ObjectID(itemId)},
     { $set: { [key]: title } },
     { safe: true }
   ).then(function(item) {
     if (mode==0) {
       projects.post_project_name(itemId, 'name', title, function (err) {
         callback(err)
       })
     } else {
       resources.post_resource_name(itemId, title, function (err) {
         callback(err)
       })
     }
   });
};

export function post_public_info(info: PublicInfo, parentId: string, mode: number, callback) {
  var collection: string;

  if (mode==0) {
    collection = "groups";
  } else if (mode==1) {
    collection = "peoples";
  } else if (mode==2) {
    collection = "departments";
  } else if (mode==3) {
    collection = "universities";
  } else if (mode==4) {
    collection = "trends";
  } else if (mode==5) {
    collection = "podcasts";
  } else if (mode==6) {
    collection = "events";
  } else if (mode==7) {
    collection = "apps";
  }

  db[collection].updateOne(
     {_id: (mode==1) ? parentId : ObjectID(parentId)},
     { $set:
       {
        "publicInfo.address": info.address,
        "publicInfo.email": info.email,
        "publicInfo.phone": info.phone,
        "publicInfo.fax": info.fax,
        "publicInfo.website": info.website
       },
     },
     { safe: true },
     callback()
  )
}

export function post_social_info(info: SocialInfo, parentId: string, mode: number, callback) {
  var collection: string;

  if (mode==0) {
    collection = "groups";
  } else if (mode==1) {
    collection = "peoples";
  } else if (mode==2) {
    collection = "departments";
  } else if (mode==3) {
    collection = "universities";
  } else if (mode==4) {
    collection = "trends";
  } else if (mode==5) {
    collection = "podcasts";
  } else if (mode==6) {
    collection = "events";
  } else if (mode==7) {
    collection = "apps";
  }

  db[collection].updateOne(
     {_id: (mode==1) ? parentId : ObjectID(parentId)},
     { $set:
       {
        "socialInfo.linkedin": info.linkedin,
        "socialInfo.twitter": info.twitter,
        "socialInfo.scholar": info.scholar,
        "socialInfo.orcid": info.orcid,
        "socialInfo.github": info.github,
        "socialInfo.researchgate": info.researchgate,
        "socialInfo.facebook": info.facebook,
        "socialInfo.youtube": info.youtube,
        "socialInfo.pinterest": info.pinterest,
        "socialInfo.instagram": info.instagram
       },
     },
     { safe: true },
     callback()
   )
}

export function post_rank(rank: Rank, id: string, mode: number, callback) {
  if (mode==3) {
    db.universities.updateOne(
      { _id: ObjectID(id) },
      { $set:
        {
          ["rank.times"]: Number(rank.times),
          ["rank.shanghai"]: Number(rank.shanghai),
          ["rank.top"]: Number(rank.top),
          ["rank.usnews"]: Number(rank.usnews),
          ["rank.facebook"]: Number(rank.facebook),
          ["rank.twitter"]: Number(rank.twitter),
          ["rank.linkedin"]: Number(rank.linkedin),
          ["rank.instagram"]: Number(rank.instagram),
          ["rank.youtube"]: Number(rank.youtube)
        }
      },
      { safe: true },
      callback()
    );
  } else if (mode==1) {
    db.groups.updateOne(
      { _id: ObjectID(id) },
      { $set:
        {
          ["rank.facebook"]: Number(rank.facebook),
          ["rank.twitter"]: Number(rank.twitter),
          ["rank.linkedin"]: Number(rank.linkedin),
          ["rank.instagram"]: Number(rank.instagram),
          ["rank.youtube"]: Number(rank.youtube)
        }
      },
      { safe: true },
      callback()
    );
  }
};

export function post_mini(minis: objectMini[], itemId: string, userId: string, mode: number, type: number, callback) {

  var collection: string;
  var associatedKey: string;

  var key: string;
  var associatedCollection: string;

  var peopleFlag: boolean = false;

  if (mode==0) {

    collection = "projects";

    if (type==0) {
      key = "people";
      associatedCollection = "peoples";
      associatedKey = "projectsIds";
      peopleFlag = true;
    } else if (type==1) {
      key = "collaborations";
      associatedCollection = "collaborations";
      associatedKey = "projects";
    } else if (type==2) {
      key = "fundings";
      associatedCollection = "fundings";
      associatedKey = "projects";
    }

  } else if (mode==1) {

    collection = "resources";
    associatedKey = "resourcesIds";

    if (type==0) {
      key = "people";
      associatedCollection = "peoples";
      peopleFlag = true;
    } else if (type==1) {
      key = "projects";
      associatedCollection = "projects";
    }

  } else if (mode==3) {

    collection = "positions";
    key = "projects";

    associatedCollection = "projects";
    associatedKey = "positionsIds";

  } else if (mode==4) {

    collection = "fundings";
    key = "projects";

    associatedCollection = "projects";
    associatedKey = "fundings";

  } else if (mode==5) {

    collection = "media";
    associatedKey = "mediaIds";

    if (type==0) {
      key = "presentors";
      associatedCollection = "peoples";
      peopleFlag = true;
    } else if (type==1) {
      key = "authors";
      associatedCollection = "peoples";
      peopleFlag = true;
    } else if (type==2) {
      key = "projects";
      associatedCollection = "projects";
    }

  } else if (mode==6) {

    collection = "sponsors";
    key = "projects";

    associatedCollection = "projects";
    associatedKey = "sponsorsIds";

  } else if (mode>=7 && mode<=10) {

    collection = "publications";
    associatedKey = "publicationsIds";

    if (type==0) {
      key = "authors";
      associatedCollection = "peoples"
      peopleFlag = true;
    } else if (type==1) {
      key = "fundings";
      associatedCollection = "fundings";
      peopleFlag = true;
    // } else if (type==2) {
    //   key = "projects";
    }

  } else if (mode==11) {

    collection = "apps";
    key = "team";

    associatedCollection = "peoples"
    associatedKey = "appsIds";
    peopleFlag = true;
  }

  async.waterfall([

    // 1. validate data.
    function (cb) {
      // try {
      //     const reqFields: string[] = [ "name", "description" ];
      //     backhelp.verify(minis, reqFields);
      // } catch (e) {
      //     cb(e);
      //     return;
      // }
      cb(null, minis);
    },

    // 2. retrieve Current Minis and Item ObjectMini, Requests Channels for Resource People
    function (minis_data: objectMini[], cb) {
      if (mode==1 && type==0) {
        db[collection]
          .find({_id: ObjectID(itemId)})
          .project({ "_id": 0, "name": 1, "title": 1, "pic": 1, [key]: 1, "requests.channelId": 1})
        .next().then(function(item) {
          const itemMini: objectMini = {"_id": itemId, "name": (mode>=7 && mode<=10) ? item.title : item.name, "pic": item.pic};
          const channelsIds: string[] = (item.requests) ? item.requests.map(c => c.channelId) : null;
          cb(null, minis_data, item[key], itemMini, channelsIds)
        })
      } else {
        db[collection]
          .find({_id: ObjectID(itemId)})
          .project({ "_id": 0, "name": 1, "title": 1, "pic": 1, [key]: 1})
        .next().then(function(item) {
          const itemMini: objectMini = {"_id": itemId, "name": (mode>=7 && mode<=10) ? item.title : item.name, "pic": item.pic};
          cb(null, minis_data, item[key], itemMini, null)
        })
      }
    },

    // 3. update differences (EXIST users) + notifications
    // var new_minis_ids = new_minis.map(r => r._id);
    // var current_minis_ids = current_minis.map(r => r._id);
    // update_mini_differences(current_minis_ids.filter(r => r!=undefined).map(r => r.toString()), new_minis_ids.filter(r => r!=undefined).map(r => r.toString()), associatedCollection, associatedKey, itemMini, userId, mode, type, peopleFlag, function (err) {
    function (new_minis: objectMini[], current_minis: objectMini[], itemMini: objectMini, channelsIds: string[], cb) {
      const current_minis_ids = current_minis.map(r => r._id).filter(r => r!=undefined).map(r => r.toString());
      const new_minis_ids = new_minis.map(r => r._id).filter(r => r!=undefined).map(r => r.toString());

      update_mini_differences(current_minis_ids, new_minis_ids, associatedCollection, associatedKey, itemMini, userId, mode, type, peopleFlag, function (err) {
        if (mode==1 && type==0 && channelsIds && channelsIds.length>0) {
          update_channel_differences(current_minis_ids, new_minis_ids, channelsIds, function (err) {
            cb(err, new_minis)
          })
        } else {
          cb(err, new_minis)
        }
      })
    },

    // 4. update Minis
    function (new_minis: objectMini[], cb) {
      db[collection].updateOne(
        { _id: ObjectID(itemId) },
        { $set: { [key]: new_minis.map(r => {r._id = (peopleFlag ? r._id : ObjectID(r._id)); return r}) } },
        { safe: true },
        cb()
      )
    },

    // 5. email invites to non-users + create dummy users
    // function (new_minis: objectMini[], itemMini: objectMini, cb) {
    //   var new_non_user_minis: objectMini[] = [];
    //
    //   if (mode>=7 && mode<=10) new_non_user_minis = new_minis.filter(r => r._id==null); // Publications
    //
    //   if (new_non_user_minis[0]) {
    //     var people_data;
    //     peoples.people_email(userId, function (err, user) {
    //       async.forEachOf(new_minis, function (mini, key, callback) {
    //         if (mini.email && mini._id==null) {
    //           people_data = {"name": mini.name,
    //                          "pic": null,
    //                          "email": mini.email,
    //                          "publicationId": ObjectID(itemId)};
    //
    //           peoples.createPeopleDocument(1, 0, people_data, function (err, peopleId) {
    //             invites.push_non_user_invite(peopleId, mini.email, itemId, 4, function (err) {
    //               emails.itemInviteEmail(user.name, user.personalInfo.email, user.pic, itemMini.name, itemId, 2, mini.email, function (err) {
    //                 new_minis[key]._id=peopleId; // used for step 5,
    //                                              // the use of forEachOf with new_minis is important for [key].
    //                 callback(err)
    //               })
    //             })
    //           });
    //         } else {
    //           callback()
    //         }
    //       }, function (err) {
    //         cb(err, new_minis)
    //       })
    //     })
    //   } else {
    //     cb(null, new_minis)
    //   }
    //
    // },

  ],
  function (err) {
    if (err) {
      callback(err);
    } else {
      callback(err, err ? null : itemId);
    }
  });
};

export function post_collaboration_project_mini(minis: objectMini[], itemId: string, groupId: string, callback) {

  async.waterfall([

    // 1. validate data.
    function (cb) {
        // try {
        //     const reqFields: string[] = [ "name", "description" ];
        //     backhelp.verify(minis, reqFields);
        // } catch (e) {
        //     cb(e);
        //     return;
        // }
        cb(null, minis);
    },

    // 2. retrieve Current Minis and Item ObjectMini
    function (projects_data: objectMini[], cb) {
      db.collaborations
        .find({_id: ObjectID(itemId)})
        .project({ "_id": 0, "projects": 1, "groupsIds": 1})
      .next().then(function(itemCollaboration) {
        const collaboratedGroupId = ObjectID(itemCollaboration.groupsIds.filter(r => r!=ObjectID(groupId))[0]);
        db.groups
          .find({_id: ObjectID(collaboratedGroupId)})
          .project({ "_id": 0, "groupIndex": 1})
        .next().then(function(item) {
          var itemMini: objectMini = {"_id": itemId, "name": item.groupIndex.group.name, "pic": item.groupIndex.group.pic};
          cb(null, projects_data, itemCollaboration.projects, itemMini)
        })
      })
    },

    // 3. update Minis
    function (new_minis: objectMini[], current_minis: objectMini[], itemMini: objectMini, cb) {
      var new_minis_ids = new_minis.map(r => r._id);
      var current_minis_ids = current_minis.map(r => r._id);

      db.collaborations.updateOne(
         {_id: ObjectID(itemId)},
         { $set: { "projects": new_minis.map(r => {r._id = ObjectID(r._id); return r}) } },
         { safe: true },
         cb(null, current_minis_ids, new_minis_ids, itemMini)
      )
    },

    // 4. update differences + notifications
    function (current_minis_ids, new_minis_ids, itemMini: objectMini, cb) {
      update_mini_differences(current_minis_ids.map(r => r.toString()), new_minis_ids.map(r => r.toString()), "projects", "collaborations", itemMini, null, 6, 0, false, function (err) {
        cb(err)
      })
    }

  ],
  function (err) {
    if (err) {
      callback(err);
    } else {
      callback(err, err ? null : itemId);
    }
  });
};

export function update_mini_differences(current_minis_ids: string[], new_minis_ids: string[], collection: string, key: string, itemMini: objectMini, userId: string, mode: number, type: number, peopleFlag: boolean, callback) {
  const pushIds: string[] = difference(new_minis_ids,current_minis_ids)
  const pullIds: string[] = difference(current_minis_ids,new_minis_ids)

  // console.log('new_minis_ids',new_minis_ids)
  // console.log('current_minis_ids',current_minis_ids)

  // console.log('pushIds',pushIds)
  // console.log('pullIds',pullIds)
  // console.log('itemMini',itemMini)

  const miniFlag: boolean = (mode==0 && type>0) || mode==4;

  async.parallel({
      // 1. push new IDs to associated Collection
      push: function (cb) {
        if (pushIds && collection) {
          db[collection].updateMany(
             { _id: {$in: pushIds.map(id => peopleFlag ? id : ObjectID(id)) } },
             { $push: { [key]: miniFlag ? {"_id": ObjectID(itemMini._id), "name": itemMini.name, "pic": itemMini.pic} : ObjectID(itemMini._id) } },
             { multi: true, safe: true },
          ).then(function(item) {
            async.forEachOf(pushIds, function (pushId, key, callback) {
              if (userId==pushId || mode>1 || type!=0) {
                callback()
              } else {
                news.add_notification(userId, (mode==0) ? 9501 : 9001, itemMini._id, pushId, itemMini._id, [], null, null, null, function (err) {
                  callback()
                });
              }
            }, function (err) {
              cb()
              // cb(null, pullIds)
            })
          });
        } else {
          cb()
          // cb(null, pullIds)
        }
      },

      // 2. pull deleted IDs from associated Collection
      pull: function (cb) {
        if (pullIds && collection) {
          db[collection].updateMany(
             { _id: {$in: pullIds.map(id => peopleFlag ? id : ObjectID(id)) } },
             { $pull: { [key]: miniFlag ? {"_id": ObjectID(itemMini._id)} : ObjectID(itemMini._id) } },
             { multi: true, safe: true },
           ).then(function(item) {
             async.forEachOf(pullIds, function (pullId, key, callback) {
               if (mode>=7 && mode<=10) {
                 invites.pull_invite(pullId, itemMini._id, 4, function (err) {
                   db.peoples.deleteOne({ _id: pullId }, { safe: true }, callback());
                 });
               } else if (userId==pullId || mode>1 || type!=0) {
                 callback()
               } else {
                 news.add_notification(userId, (mode==0) ? 9502 : 9002, itemMini._id, pullId, itemMini._id, [], null, null, null, function (err) {
                   callback()
                 });
               }
             }, function (err) {
               cb()
             })
           });
        } else {
          cb()
        }
      }

  },
  function (err) {
    callback(err);
  });
}

export function update_channel_differences(current_minis_ids: string[], new_minis_ids: string[], channelsIds: string[], callback) {
  const pushIds: string[] = difference(new_minis_ids,current_minis_ids)
  const pullIds: string[] = difference(current_minis_ids,new_minis_ids)

  async.parallel({

    user_push: function (cb) {
      if (pushIds) {
        // async.forEachOf(pushIds, function (pushId, key, callback) {
        db.peoples.updateMany(
          { _id: { $in: pushIds } },
          { $push: { "channelsRequestsIds": {$each: channelsIds} } },
          { safe: true },
          cb()
          // callback()
        );
        // }, function (err) {
        //   cb()
        // })
      } else {
        cb()
      }
    },

    user_pull: function (cb) {
      if (pullIds) {
        // async.forEachOf(pullIds, function (pullId, key, callback) {
        db.peoples.updateMany(
          { _id: { $in: pullIds } },
          { $pull: { "channelsRequestsIds": {$in : channelsIds} } },
          { safe: true },
          cb()
          // callback()
        );
        // }, function (err) {
        //   cb()
        // })
      } else {
        cb()
      }
    },

    push_channels: function (cb) {
      if (pushIds) {
        async.forEachOf(pushIds, function (pushId, key, callback) {
          db.channels.updateMany(
            { _id: { $in: channelsIds } },
            { $push: { "users": {"_id": pushId, "unread": 0 } } },
            { safe: true },
            callback()
          );
        }, function (err) {
          cb()
        })
      } else {
        cb()
      }
    },

    pull_channels: function (cb) {
      if (pullIds) {
        async.forEachOf(pullIds, function (pullId, key, callback) {
          db.channels.updateMany(
            { _id: { $in: channelsIds } },
            { $pull: { "users": {"_id": pullId } } },
            { safe: true },
            callback()
          );
        }, function (err) {
          cb()
        })
      } else {
        cb()
      }
    }

  },
  function (err) {
    callback(err)
  });

}

function difference(a1, a2) {
  var result = [];
  for (var i = 0; i < a1.length; i++) {
    if (a2.indexOf(a1[i]) === -1) {
      result.push(a1[i]);
    }
  }
  return result;
}

export function post_tags(tags: string[], mode: number, itemId: string, callback) {
  var index: number;
  var key: string;
  var collection: string;
  var algoliaIndex;

  if (mode==0) {
    key = "homePageItems.intrests";
    collection = "groups";
    index = 3;
    algoliaIndex = client.initIndex((process.env.PORT) ? 'labs': 'dev_labs')
  } else if (mode==1) {
    key = "researchInterests";
    collection = "peoples";
    index = 1;
    algoliaIndex = client.initIndex((process.env.PORT) ? 'researchers': 'dev_researchers')
  } else if (mode==2) {
    key = "recreationalInterests";
    collection = "peoples";
  } else if (mode==3) {
    key = "tags";
    collection = "resources";
    algoliaIndex = client.initIndex((process.env.PORT) ? 'services': 'dev_services')
  // } else if (mode==4) {
  //   key = "tags";
  //   collection = "projects";
  } else if (mode==5) {
    key = "tags";
    collection = "positions";
  } else if (mode==6 || mode==7) {
    key = "tags";
    collection = "publications";
  } else if (mode==8) {
    key = "publicationsPageItems.names";
    collection = "groups";
  } else if (mode==9) {
    key = "names";
    collection = "peoples";
  }

  if (mode<=1) {
    db[collection].updateOne(
       { _id: (mode==1) ? itemId : ObjectID(itemId) },
       { $set: { [key]: tags, ["progress."+index]: tags.length ? 1 : 0 } },
       { safe: true }
    ).then(function() {
      algoliaIndex.partialUpdateObject({
        objectID: itemId,
        interests: tags,
      }, (err, content) => {
        callback(err)
      });
    })
  } else if (mode==3) {
    db[collection].updateOne(
       { _id: ObjectID(itemId) },
       { $set: { [key]: tags } },
       { safe: true }
    ).then(function() {
       algoliaIndex.partialUpdateObject({
         objectID: itemId,
         tags: tags,
       }, (err, content) => {
         callback(err)
       });
    })
  } else if (mode==5) {
    db[collection].findOneAndUpdate(
      { _id: ObjectID(itemId) },
      { $set: { [key]: tags } },
      { projection: { "groupId": 1 } },
      function(err, doc) {
        const parentId: string = doc.value.groupId;
        algoliaIndex.getObject(parentId, (err, content) => {
          const index = content.positions.findIndex(y => y._id == itemId);
          if (index>-1) {
            content.positions[index].tags = tags;
            algoliaIndex.partialUpdateObject({
              objectID: parentId,
              positions: content.positions
            }, (err, content) => {
              callback(err)
            });
          } else {
            callback()
          }
        });
      }
    );
  } else {
    db[collection].updateOne(
       { _id: (mode==2 || mode==9) ? itemId : ObjectID(itemId) },
       { $set: { [key]: tags } },
       { safe: true }
    ).then(function() {
      callback()
    })
  }
}

export function post_text(text: string, id: string, type: number, callback) {
  var index: number;
  var collection: string;
  var key: string;

  var algoliaIndex = client.initIndex((process.env.PORT) ? 'labs': 'dev_labs');

  if (type<100) {
    collection = "groups";
  } else if (type<200) {
    collection = "projects";
  } else if (type<300) {
    collection = "resources";
  } else if (type<400) {
    collection = "positions";
  } else if (type<500) {
    collection = "apps";
  }

  if (type==0) { // Group
      key = "homePageItems.background";
      index = 1;
  } else if (type==1) {
      key = "peoplesPageItems.visitUs";
  } else if (type==2) {
      key = "projectsPageItems.background";
      index = 8;
  } else if (type==3) {
      key = "resourcesPageItems.background";
      index = 6;
  } else if (type==4) {
      key = "collaborationsPageItems.collaborateWithUs";
      index = 12;
  } else if (type==5) {
      key = "positionsPageItems.whyJoin";
      index = 14;
  } else if (type==6) {
      key = "positionsPageItems.diversity";
      index = 15;
  } else if (type==100) {
      key = "goals";
  } else if (type==101) { // Project
      key = "description";
  } else if (type==200) { // Resource
      key = "description";
  } else if (type==300) { // Position
      key = "description";
  } else if (type==301) {
      key = "duties";
  } else if (type==302) {
      key = "schoolarship";
  } else if (type==303) {
      key = "expectations";
  } else if (type==304) {
      key = "requiredEducation";
  } else if (type==305) {
      key = "requiredExperience";
  } else if (type==400) {
      key = "description";
  };

  async.waterfall([

    // 1. update Text
    function (cb) {
      if (type>=100 || type==1) {
        db[collection].updateOne(
          { _id: ObjectID(id) },
          { $set: { [key]: text } },
          { safe: true },
          cb()
        )
      } else {
        db[collection].updateOne(
          { _id: ObjectID(id) },
          { $set: { [key]: text, ["progress."+index]: text ? 1 : 0 } },
          { safe: true },
          cb()
        )
      }
    },

    // 2. update Algolia
    function (cb) {
      if (type==0) {
        algoliaIndex.partialUpdateObject({
          objectID: id,
          background: text
        }, (err, content) => {
          cb(err)
        });
      } else if (type==101 || type==200 || type==300) {
        // TBD
        // algoliaIndex.partialUpdateObject({
        //   objectID: id,
        //   description: text,
        // }, (err, content) => {
          // cb(err)
          cb()
        // });
      } else {
        cb()
      }
    }
  ],
  function (err) {
    callback(err);
  });
}

export function post_affiliation(affiliation: Affiliation, id: string, mode: number, callback) {
  var key: string;
  var collection: string;

  if (mode==0) {
    universities.post_affiliation(affiliation, id, function (err) {
      callback()
    })
  } else if (mode==1) {
    departments.post_affiliation(affiliation, id, function (err) {
      callback()
    })
  } else if (mode==2) {
    groups.post_affiliation(affiliation, id, function (err) {
      callback()
    })
  };

}

export function post_quote(quote: Quote, parentId: string, mode: number, callback) {
  if (mode==0) {
    db.groups.updateOne(
       {_id: ObjectID(parentId)},
       { $set:
         {
           "homePageItems.quote.text": quote.text,
           "homePageItems.quote.name": quote.name,
           "homePageItems.quote.pic": quote.pic,
           "progress.2": quote.text ? 1 : 0
         },
       },
       { safe: true },
       callback()
    )
  } else {
    db.peoples.updateOne(
       {_id: parentId},
       { $set:
         {
           "quote.text": quote.text,
           "quote.name": quote.name,
           "quote.pic": quote.pic,
         },
       },
       { safe: true },
       callback()
    )
  }
}

export function put_link(link: Link, id: string, type: number, callback) {
  const collection: string = (type==0) ? "resources" : "mentors";
  link._id= ObjectID().toString();

  db[collection].updateOne(
     { _id: ObjectID(id) },
     { $push:
       {
         "links": {
           "_id": link._id,
           "name": link.name,
           "link": link.link,
           "description": link.description,
         }
       }
     },
     { safe: true },
     callback(null, link._id)
  )
}

export function post_link(link: Link, id: string, type: number, callback) {
  const collection: string = (type==0) ? "resources" : "mentors";

  db[collection].updateOne(
     { _id: ObjectID(id), "links._id": link._id },
     { $set:
       {
         "links.$.name": link.name,
         "links.$.link": link.link,
         "links.$.description": link.description,
       },
     },
     { safe: true },
     callback()
  )
}

export function delete_link(linkId: string, id: string, type: number, callback) {
  const collection: string = (type==0) ? "resources" : "mentors";

  db[collection].updateOne(
    { _id: ObjectID(id) },
    { $pull: { "links": {"_id": linkId } } },
    { multi: false, safe: true },
    callback()
  )
}

export function post_progress(id: string, num: number, mode: number, callback) {
  var collection: string;

  if (mode==0) {
    collection = "groups";
  } else if (mode==3) {
    collection = "peoples";
  };

  console.log('mode',mode,'collection',collection,'id',id,'num',num)

  if (mode==0 || mode==3) {
    db[collection].updateOne(
       { _id: (mode==3) ? id : ObjectID(id) },
       { $set: { ["progress."+num]: 1} },
       { safe: true },
       callback()
    )
  } else {
    callback()
  }
}

export function get_coauthors_ids(parentId: string, mode: number, userId: string, idFlag: boolean, callback) {
  var key: string;
  var idKey: string;
  var collection: string;
  var authorsMini, uAuthorsMini: objectMini[]

  if (mode==0) {
    key = "publicationsItems.publicationsIds";
    collection = "groups";
    idKey = "peoplesItems";
  } else if (mode==1) {
    key = "publicationsIds";
    idKey = "_id";
    collection = "peoples";
  }
  if (!parentId || !key) {

    callback(null, []);

  } else {
    db[collection]
      .find({"_id": (mode==0) ? ObjectID(parentId) : parentId})
      .project({[key]: 1, [idKey]: 1})
    .next().then(function(item) {
      if (item) {
        db.publications
          .find( { _id: {$in: (mode==0) ? item.publicationsItems.publicationsIds : item.publicationsIds }} )
          .project({"authors._id": 1, "authors.name": 1, "authors.pic": 1, _id: 0})
        .toArray().then(function(publications) {

          authorsMini = [].concat(...publications.map(r => r.authors))
          authorsMini = (idFlag) ? authorsMini.filter(r => r._id) : authorsMini.filter(r => (r._id==null || ObjectID.isValid(r._id)==true));
          uAuthorsMini = authorsMini.filter((author, index, self) =>
            index === self.findIndex((t) => (
              t._id === author._id && t.name === author.name
            ))
          )

          if (idFlag) {
            if (mode==0) {
              callback(null, uAuthorsMini.map(r=>r._id)); // FIX: filter out group members
            } else {
              callback(null, uAuthorsMini.filter(r=>r._id!=item._id).map(r=>r._id));
            }
          } else {
            callback(null, uAuthorsMini);
          }

        })
      } else {
        callback(null, []);
      }
    });

  }

}

// const uAuthorsMini: objectMini[] = Array.from(new Set(authorsMini));
// const uAuthorsMini: objectMini[] = removeDuplicates(authorsMini, "name");
// function removeDuplicates(myArr, prop) {
//     return myArr.filter((obj, pos, arr) => {
//         return arr.map(mapObj => mapObj[prop]).indexOf(obj[prop]) === pos;
//     });
// }

export function search_ids_by_ids(text: string, userId: string, mode: number, more: number, ids: string[], callback) {

  var key: string;
  var collection: string;

  if (mode==1) {
    key = "name";
    collection = "peoples";
  } else if (mode==2) {
    key = "title";
    collection = "publications";
  } else if (mode==3) {
    key = "name";
    collection = "resources";
  } else if (mode==4) {
    key = "name";
    collection = "projects";
  } else if (mode==5) {
    key = "titleName";
    collection = "positions";
  } else if (mode==6) {
    key = "name";
    collection = "teachings";
  }

  var reg = text ? (".*" + text + "*.") : null;

  var curFind = db[collection]
                .find(
                 {
                  "_id": { $in: ids},
                  [key]: { $regex: reg, $options: 'i' }
                 })
                .project({_id: 1})

  curFind.count(function (e, count) {
     curFind.skip(more*10).limit(10).toArray()
     .then(function(items)
     {
      const ids = items.map( function(id) { return id._id; })
      callback(null, ids, count)
     });
  });

};
