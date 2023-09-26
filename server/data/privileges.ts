var db = require('../db.ts'),
    async = require('async'),
    backhelp = require("./backend_helpers.ts");

var ObjectID = require('mongodb').ObjectID;

export function privilages(oauthId: string, parentId: string, mode: number, callback) {
  // mode:
  // 0 - Group: Admin, Super Admin, OnBehalf
  // 3 - Group: All Members

  // 10 - User
  // 11 - Mentoring

  // 20 - Funding: Member or Group Owner
  // 21 - Funding: Member

  // 30 - Collaboration: Member

  // 40 - Project: Member

  // 50 - Resource: Member

  // 60 - Message

  // 70 - Publication: Author

  // 80 - Position

  // 90 - Item

  var key: string;
  var collection: string;

  // 4 - Group: Super Admin + Admin + Associated Member (DEPRECATED)
  // if (mode==0 || mode==3 || mode==4) {

  if (mode==0 || mode==3) { // Group Admins or Everyone
    // console.log('mode',mode)
    // console.log('parentId',parentId)
    if (ObjectID.isValid(parentId)) {
      group_privilages(oauthId, parentId, mode, function (err, userId, flag) {
        callback(err, userId, flag)
      })
    } else {
      callback(null, null, false)
    }

  } else if (mode==10) { // User

    db.peoples.find({ "oauth_id": oauthId }).project({ _id: 1 }).next(function(err, item) {
      callback(err, item ? item._id.toString() : null, true)
    })

  } else if (mode==11) { // Mentoring

    db.peoples.find({ "oauth_id": oauthId }).project({ mentorId: 1 }).next(function(err, item) {
      callback(err, item ? item.mentorId.toString() : null, item ? true : false)
    })

  } else if (mode==30) { // Collaboration

    db.collaborations.find({ "_id": ObjectID(parentId) }).project({ _id: 0, groupsIds: 1 }).next(function(err, collaborationsItem) {
      if (collaborationsItem) {
        db.peoples.aggregate([
          { $match: { "oauth_id": oauthId }},
          { $project: {_id: 1, positions: {$filter: { input: "$positions", as: "position", cond: { $in: [ "$$position.groupId", collaborationsItem.groupsIds.map(r => ObjectID(r)) ] } } } } }
        ]).next(function(err, peoplesItem) {
          if (peoplesItem) {
            var statusFlag = false;
            peoplesItem.positions.forEach(function(position) {
              statusFlag = ((position || {}).status>=5 || statusFlag==true) ? true : false
            })
            callback(err, peoplesItem._id.toString(), statusFlag)
          } else {
            callback(err, null, false)
          }
        })
      } else {
        callback(err, null, false)
      }
    })

  } else if (mode==50) { // Resource

    db.resources.find({ "_id": ObjectID(parentId) }).project({ _id: 0, groupId: 1 }).next(function(err, resourceItem) {
      // console.log('resourceItem',resourceItem)
      if (resourceItem) {
        db.peoples.aggregate([
          { $match: { "oauth_id": oauthId }},
          { $project: {_id: 1, positions: {$filter: { input: "$positions", as: "position", cond: { $in: [ "$$position.groupId", [resourceItem.groupId] ] } } } } }
        ]).next(function(err, peopleItem) {
          // console.log('peopleItem',peopleItem)
          if (peopleItem) {
            var statusFlag = false;
            peopleItem.positions.forEach(function(position) {
              statusFlag = ((position || {}).status>=5 || statusFlag==true) ? true : false
            })
            callback(err, peopleItem._id.toString(), statusFlag)
          } else {
            callback(err, null, false)
          }
        })
      } else {
        callback(err, null, false)
      }
    })

  } else if (mode==60) { // Channels

    db.peoples.find({ "oauth_id": oauthId,
                      $or: [
                            { "channelsIds": { $elemMatch: { $eq: ObjectID(parentId) } } },
                            { "channelsGroupsIds": { $elemMatch: { $eq: ObjectID(parentId) } } },
                            { "channelsRequestsIds": { $elemMatch: { $eq: ObjectID(parentId) } } },
                           ]
                    })
                    .project({ _id: 1 } ).next(function(err, user) {
      if (user) {
        callback(err, user._id.toString(), true)
      } else {
        callback(err, null, false)
      }
    })

  } else if (mode==70) { // Publications

    db.peoples.find({ "oauth_id": oauthId }).project({ _id: 1 }).next(function(err, user) {
      db.publications.find({ "_id": ObjectID(parentId), "authors._id": user._id }).project({ "_id": 1 }).next(function(err, item) {
        if (item) {
          callback(err, user._id, true)
        } else {
          callback(err, null, false)
        }
      })
    })

  } else if (mode==80) { // Position

    db.positions.find({ "_id": ObjectID(parentId) }).project({ _id: 0, groupId: 1 }).next(function(err, positionItem) {
      // console.log('positionItem',positionItem)
      if (positionItem) {
        db.peoples.aggregate([
          { $match: { "oauth_id": oauthId }},
          { $project: {_id: 1, positions: {$filter: { input: "$positions", as: "position", cond: { $in: [ "$$position.groupId", [positionItem.groupId] ] } } } } }
        ]).next(function(err, peopleItem) {
          // console.log('peopleItem',peopleItem)
          if (peopleItem) {
            var statusFlag = false;
            peopleItem.positions.forEach(function(position) {
              statusFlag = ((position || {}).status>=5 || statusFlag==true) ? true : false
            })
            callback(err, peopleItem._id.toString(), statusFlag)
          } else {
            callback(err, null, false)
          }
        })
      } else {
        callback(err, null, false)
      }
    })

  } else if (mode==90) { // Item

    db.peoples.find({ "oauth_id": oauthId }).project({ _id: 1 }).next(function(err, user) {
      db.apps.find({ "_id": ObjectID(parentId), "team._id": user._id }).project({ "_id": 1 }).next(function(err, item) {
        if (item) {
          callback(err, user._id, true)
        } else {
          callback(err, null, false)
        }
      })
    })

  } else { // Else

    var keyProfile: string;

    if (mode==20) {
      key = "fundingsIds";
      keyProfile = "";
      collection="fundings";
    } else if (mode==40) {
      key = "projectsIds";
      keyProfile = "profileProjectsIds";
      collection="projects";
    }

    db.peoples.find({ "oauth_id": oauthId,
                      $or: [
                        { [key]: { $elemMatch: { $eq: ObjectID(parentId) } } },
                        { [keyProfile]: { $elemMatch: { $eq: ObjectID(parentId) } } }
                      ],
                    })
                    .project({ _id: 1 }).next(function(err, user) {

      if (user) {
        callback(err, user._id, true)
        // callback(err, user._id.toString(), true)
      } else {
        db[collection].find({ "_id": ObjectID(parentId) }).project({ "groupId": 1 }).next(function(err, item) {
          if (item) {
            group_privilages(oauthId, item.groupId, 0, function (err, userId, flag) {
              callback(err, userId, flag)
            })
          } else {
            callback(err, null, false)
          }
        })
      }

    })

  }

}

function group_privilages(oauthId: string, parentId: string, mode: number, callback) {
  db.peoples.aggregate([
    { $match: { "oauth_id": oauthId }},
    { $project: {_id: 1, positions: {$filter: { input: "$positions", as: "position", cond: { $eq: [ "$$position.groupId", ObjectID(parentId) ] } } } } }
  ]).next(function(err, item) {
    if (item) {
      var statusFlag = false;
      item.positions.forEach(function(position) {
        statusFlag = ((position || {}).status>=(mode==0 ? 5 : 4) || statusFlag==true) ? true : false
      })
      callback(err, item._id.toString(), statusFlag)
      // callback(err, item._id.toString(), ((item.positions[0] || {}).status>=(mode==0 ? 5 : 4)) ? true : false)
    } else {
      callback(err, null, false)
    }
  })
}

export function private_privilages(oauthId: string, parentId: string, peopleId: string, callback) {
  // Admins or User ID == People ID
  db.peoples.aggregate([
    { $match: { "oauth_id": oauthId }},
    { $project: {_id: 1, positions: {$filter: { input: "$positions", as: "position", cond: { $eq: [ "$$position.groupId", ObjectID(parentId) ] } } } } }
  ]).next(function(err, item) {
    if (item) {
      var statusFlag = false;

      item.positions.forEach(function(position) {
        statusFlag = ((position || {}).status>=5 || statusFlag==true) ? true : false;
      })

      if (statusFlag==false) {
        statusFlag = (item._id.toString()==peopleId);
      }

      callback(err, item._id.toString(), statusFlag)
    } else {
      callback(err, null, false)
    }
  })
}

export function offline_build_privilages(userId: string, parentId: string, callback) {
  db.groups.find({
    // "peoplesItems.activesIds.0": userId,
    "peoplesItems.activesIds": userId, // can be PI or OnBehalf
    "welcome": 1,
    "onBehalf": { $in: [8, 9] }
  }).project({_id: 1}).next(function(err, item) {
    console.log('PP2_Privilages',item)
    callback(err, item ? true : false)
  })
}
