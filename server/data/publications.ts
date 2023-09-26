var db = require('../db.ts'),
    async = require('async'),
    backhelp = require("./backend_helpers.ts");

var ObjectID = require('mongodb').ObjectID;

var groups = require("./groups.ts");
var peoples = require("./peoples.ts");
var news = require("./news.ts");
var shared = require("./shared.ts");
var invites = require("./invites.ts");
var pics = require("./pics.ts");

import {objectMini, objectMiniEmail} from '../models/shared.ts';
import {JournalObj} from '../models/publications.ts';

exports.version = "0.1.0";

export function put_publication(userId: string, mode: number, adminFlag: boolean, data, callback) {
  var data_clone;
  var collection: string;
  var key, keySuggest: string;
  var publicationKey: string;
  var progress: number;

  // let libraryFolders: Folder;
  let libraryFolders: any;

  switch (mode) {
    case 0: {
      collection = "groups";
      key = "publicationsItems.publicationsIds";
      keySuggest = "publicationsItems.suggestionsIds";
      publicationKey = "groupsIds";
      progress = 5;
      break;
    }
    case 1: {
      collection = "projects";
      key = "publicationsIds";
      publicationKey = "projectsIds";
      break;
    }
    case 2: {
      collection = "resources";
      key = "publicationsIds";
      publicationKey = "resourcesIds";
      break;
    }
    case 3: {
      collection = "peoples";
      key = "publicationsIds";
      keySuggest = "publicationsSuggestionsIds";
      break;
    }
    case 4: {
      // Admin Marketing
      break;
    }
    case 5: {
      collection = "groups";
      key = "publicationsItems.suggestionsIds";
      publicationKey = "groupsIds";
      break;
    }
    case 6: {
      collection = "peoples";
      key = "publicationsSuggestionsIds";
      publicationKey = "groupsIds";
      break;
    }
    case 7: {
    }
    case 8: {
      collection = "peoples";
      key = "library";
      break;
    }
    case 9: { // papers kit (Beginners)
      collection = "groups";
      key = "papersKit.beginnersIds";
      progress = 30;
      break;
    }
    case 10: { // papers kit (Intermediate)
      collection = "groups";
      key = "papersKit.intermediateIds";
      progress = 30;
      break;
    }
    case 11: { // papers kit (Advanced)
      collection = "groups";
      key = "papersKit.advancedIds";
      progress = 30;
      break;
    }
  };

  async.waterfall([

    // 1. validate data.
    function (cb) {
      try {
        const reqFields: string[] = ["title", "date", "type"];
        backhelp.verify(data, reqFields);
      } catch (e) {
        cb(e);
        return;
      }
      cb(null, data);
    },

    // 2. create Publication document or push to existing Publication (Flag)
    function (publication_data, cb) {
      data_clone = JSON.parse(JSON.stringify(publication_data));

      db.publications
        .find({"doi": data_clone.doi})
        .project({"_id": 1})
      .next().then(function(item) {
        if (item) {
          // mode==8 ||
          if (mode==3 || mode==6 || mode==9 || mode==10 || mode==11) {
            cb(null, item._id, true)
          } else if (mode==8) {
            const folders_array = data_clone.folders ? (data_clone.folders.map(folder => ({"_id": ObjectID() ,"folder": folder, "date": new Date()}))) : [];
            libraryFolders = folders_array;
            db.publications.updateOne(
              { _id: ObjectID(item._id) },
              { $push: { ["folders." + userId]: {$each: folders_array } } },
              { safe: true },
              cb(null, item._id, true)
            )
          } else {
            db.publications.updateOne(
              { _id: ObjectID(item._id)},
              { $addToSet: { [publicationKey]: ObjectID(data_clone.parentId) } },
              { safe: true },
              cb(null, item._id, true)
            )
          }
        } else {
          createPublicationDocument(data_clone, mode, userId, adminFlag, function (err, publicationId, folders_array) {
            libraryFolders = folders_array;
            cb(err, publicationId, false)
          });
        }
      })
    },

    // 3A. insert Journal, update Average in Algolia
    function (publicationId: string, doiFlag: boolean, cb) {
      // year: string
      if (mode==0) {
        // switch getObject to MongoDB
        // algoliaIndex.getObject(data_clone.parentId, (err, content) => {
        //   const existFlag: boolean = content.journals.findIndex(journal => journal==data_clone.journal)>-1;
        //   if (existFlag) {
            cb(null, publicationId, doiFlag)
        //   } else {
        //     algoliaIndex.partialUpdateObject({
        //       objectID: data_clone.parentId,
        //       journals: content.journals.push(data_clone.journal)
        //     }, (err, content) => {
        //       cb(err, publicationId, doiFlag)
        //     });
        //   }
        // });
      } else {
        cb(null, publicationId, doiFlag)
      }
    },

    // 3B. insert Publication ID to Collection (Group, People, Library, Project, Resource)
    function (publicationId: string, doiFlag: boolean, cb) {
      if (mode==0 || (mode>=9 && mode<=11)) {
        db.groups.updateOne(
           { _id: ObjectID(data_clone.parentId) },
           {
             $push: { [key]: ObjectID(publicationId) },
             $set: { ["progress."+progress]: 1}
           },
           { safe: true },
           cb(null, publicationId, doiFlag)
        )
      } else if (mode<=2) {
        db[collection].updateOne(
           { _id: ObjectID(data_clone.parentId) },
           { $push: { [key]: ObjectID(publicationId) } },
           { safe: true },
           cb(null, publicationId, doiFlag)
        )
      } else if (mode==8) {
        const folder_obj = data_clone.folders.reduce((prev, curr) => {
          prev["library."+curr] = ObjectID(publicationId);
          return prev;
        }, {});

        db[collection].updateOne(
          { _id: userId },
          { $push: folder_obj },
          { safe: true },
          cb(null, publicationId, doiFlag)
        )
      } else {
        cb(null, publicationId, doiFlag)
      }
    },

    // 4. insert Publication ID to (EXISTING) Peoples (Authors + User) Collection
    function (publicationId: string, doiFlag: boolean, cb) {
      if (mode<4) {
        var authorsIds: string[] = data_clone.authors.filter(r => r._id!=null).map(r => r._id);
        if (mode==3) authorsIds = authorsIds.concat(userId);
        const uAuthorsIds: string[] = Array.from(new Set(authorsIds));

        if (uAuthorsIds) {
          db.peoples.updateMany(
             { _id: {$in: uAuthorsIds}},
             {
               $addToSet: { "publicationsIds": ObjectID(publicationId) },
               $set: { "progress.6": 1}
             },
             { multi: true, safe: true },
             cb(null, publicationId, doiFlag)
          )
        } else {
          cb(null, publicationId, doiFlag)
        }
      } else {
        cb(null, publicationId, doiFlag)
      }

      // Promise.all(data_clone.authors.map(function(author) {
      //     db.peoples.updateOne(
      //        {_id: ObjectID(author._id)},
      //        { $push: { "projectsIds": projectId } },
      //        { safe: true },
      //     )
      // })).then(function(results) {
      //   cb(null, projectId)
      // })
    },

    // 5. delete Suggestion with same ID if exist
    function (publicationId: string, doiFlag: boolean, cb) {
      if (mode==0 || mode==3) {
        db[collection].updateOne(
           {_id: (mode==0) ? ObjectID(data_clone.parentId) : userId},
           { $pull: { [keySuggest]: ObjectID(publicationId) } },
           { safe: true },
           cb(null, publicationId)
        )
      } else {
        cb(null, publicationId)
      }
    },

    // 6. push News
    function (publicationId: string, cb) {
      const peoplesIds: string[] = data_clone.authors.map(x => x._id);

      if ((mode==0 || (mode>=9 && mode<=11)) && !adminFlag) {
        news.add_group_activity(userId, (mode==0) ? 1001 : 16501, publicationId, data_clone.parentId, publicationId, peoplesIds, data_clone.title, null, data_clone.abstractPic, 3, function (err) {
          cb(err, publicationId)
        })
      } else if ((mode==3 || mode==8) && !adminFlag) {
        // news.add_activity(3, userId, (mode==3) ? 1001 : 6001, publicationId, userId, publicationId, peoplesIds, data_clone.title, null, data_clone.abstractPic, false, function (err) {
        news.add_activity(3, userId, (mode==3) ? 1001 : 6001, publicationId, null, null, peoplesIds, data_clone.title, null, data_clone.abstractPic, false, function (err) {
          cb(err, publicationId)
        })
      } else {
        cb(null, publicationId)
      }
    },

    // 7. invite Authors
    function (publicationId: string, cb) {
      const authors: objectMiniEmail = data_clone.authors.filter(r => r.email).filter(r=>!ObjectID.isValid(r._id));
      async.forEachOf(authors, function (author, key, cbFor) {
        invites.post_invite(author, publicationId, userId, 7, function (err) {
          cbFor(err)
        });
      }, function (err) {
        cb(err, publicationId)
      })

      // async.eachSeries(authors, function (author, next) { }, function (err) {
      //   cb(err)
      // })
    }

  ],
  function (err, publicationId: string) {
    if (err) {
      callback(err);
    } else {
      if (mode==8) {
        callback(err, err ? null : {"_id": publicationId, "folders": libraryFolders});
      } else {
        callback(err, err ? null : publicationId);
      }
      // callback(err, err ? null : publicationId);
    }
  });
};

export function delete_publications(itemId: string, userId: string, mode: number, publicationIds: string[], callback) {
  const ids = publicationIds.map(id => ObjectID(id));

  var collection: string;
  var key: string;
  var publicationKey: string;

  switch (mode) {
    case 0: {
      collection = "groups";
      key = "publicationsItems.publicationsIds";
      publicationKey = "groupsIds";
      break;
    }
    case 1: {
      collection = "projects";
      key = "publicationsIds";
      publicationKey = "projectsIds";
      break;
    }
    case 2: {
      collection = "resources";
      key = "publicationsIds";
      publicationKey = "resourcesIds";
      break;
    }
    case 3: {
      collection = "peoples";
      key = "publicationsIds";
      publicationKey = "profilesIds";
      break;
    }
    case 4: {
      // Admin Marketing
      break;
    }
    case 7: {
      collection = "peoples";
      key = "library";
      break;
    }
    case 8: { // papers kit (Beginners)
      collection = "groups";
      key = "papersKit.beginnersIds";
      break;
    }
    case 9: { // papers kit (Intermediate)
      collection = "groups";
      key = "papersKit.intermediateIds";
      break;
    }
    case 10: { // papers kit (Advanced)
      collection = "groups";
      key = "papersKit.advancedIds";
      break;
    }
  };

  async.waterfall([

    // 1. delete Publication Parent Link
    function (cb) {
      if (mode==0) {

        var progress: number = 1;
        db.groups.aggregate([
            { "$match": { '_id': ObjectID(itemId)}},
            { "$project": {'_id': 0, 'publicationsItems.publicationsIds': 1 }}
        ]).next().then(function(item) {
          if (item.publicationsItems.publicationsIds.length==1) progress = 0;
          db.groups.updateOne(
            { _id: ObjectID(itemId) },
            {
              $set: { "progress.5": progress },
              $pull: { [key]: { $in: ids } }
            },
            { multi: true, safe: true },
           cb())
        });

      } else if (mode<=3 || (mode>=8 && mode<=10)) {

        db[collection].updateOne(
          { _id: (mode==3) ? itemId : ObjectID(itemId) },
          { $pull: { [key]: { $in: ids } } },
          { multi: true, safe: true },
          cb()
        )

      } else if (mode==7) {

        var foldersArr = [];
        async.forEachOf(ids, function (id, index, callback) {
          // console.log('itemId',itemId)
          db.publications.findOneAndUpdate(
            { _id: ObjectID(id) },
            // { $pull: { ["folders." + itemId]: 1 } },
            // { $unset: { ["folders." + itemId]: "" } },
            { $unset: { ["folders." + userId]: "" } },
            { projection: { "folders" : 1 } },
            // { "new": true },
            function(err, doc) {
              // console.log('doc.value',doc.value)
              if (err) return callback(err);
              const foldersObj = doc.value.folders[userId];
              if (foldersObj) foldersObj.map(r=>(foldersArr.push({"folder": r.folder, "ids": [id]})))
              return callback(null);
            }
          );
        }, function (err) {
          // https://stackoverflow.com/questions/33850412/merge-javascript-objects-in-array-with-same-key
          // https://stackoverflow.com/questions/53993994/how-to-do-multiple-find-one-and-update-on-multiple-collections-efficiently-at
          var foldersMerge = [];
          // console.log('foldersArr',foldersArr)
          foldersArr.forEach(function(item) {
            var existing = foldersMerge.filter(function(v, i) {
              return v.folder == item.folder;
            });
            if (existing.length) {
              var existingIndex = foldersMerge.indexOf(existing[0]);
              foldersMerge[existingIndex].ids = foldersMerge[existingIndex].ids.concat(item.ids);
            } else {
              if (typeof item.ids == 'string') item.value = [item.ids];
              foldersMerge.push(item);
            }
          });
          var objects = {};
          foldersMerge.forEach((folderMerge, index) => {
            objects["library." + folderMerge.folder] = { $in: folderMerge.ids };
          })
          // console.log('objects',objects)
          // console.log('itemId',itemId,userId)

          if (Object.keys(objects).length===0 && objects.constructor===Object) {
            console.log('foldersMergeEmpty')
            cb()
          } else {
            console.log('foldersMergeNonEmpty')
            db.peoples.updateOne(
              { _id: itemId },
              { $pull: objects },
              { safe: true },
              cb()
            )
          }
        })

      } else {
        cb()
      }

    },

    // 2. Pull Author, Group, Project, Resource
    function (cb) {
      if (mode==4 || mode==7 || mode==8) {
        cb()
      } else {
        db.publications.updateMany(
          {_id: { $in: ids } },
          { $pull: (mode==3) ? { "authors": { "_id": itemId }, [publicationKey]: itemId } : { [publicationKey]: ObjectID(itemId) } },
          { multi: true, safe: true },
          function(err, res) {
            cb(err)
          }
        )
      }
    },

    // 4. Delete item if Single Author & No Associated Groups/Projects/Resources
    //    (Notify co-authors, group members)
    function (cb) {
      if (mode==7 || mode==8) {
        cb(null, null)
      } else {
        async.forEachOf(ids, function (id, key, callback) {
          db.publications
            .find({_id: id})
            .project({"followedIds": 1, "authors": 1, "abstractPic": 1, "pdf": 1, "groupsIds": 1, "projectsIds": 1, "resourcesIds": 1})
          .next().then(function(item) {
            if (item &&
                item.authors.filter(r => r._id!=null).filter(r => r.email==null).length==0 &&
                item.authors.filter(r => r.email!=null).length==0 &&
                item.groupsIds.length==0 &&
                item.projectsIds.length==0 &&
                item.resourcesIds.length==0) {
              async.parallel({
                pics: function (cb) { // delete Assets
                  pics.delete_pic_direct(item.abstractPic, function(err) {
                    pics.delete_pic_direct(item.pdf, function(err) {
                      cb(err)
                    })
                  })
                },
                followers: function (cb) { // delete Followers Links (+ Notifiy)
                  peoples.delete_followings_ids("publications", "publicationsIds", id, true, function (err) {
                    cb(err)
                  });
                },
                news: function (cb) { // delete Publication News
                  if (mode==4) {
                    cb()
                  } else {
                    news.remove_activity(itemId, id, 0, function (err) {
                      cb(err);
                    });
                  }
                },
                dummy: function (cb) { // pull Invites + delete Dummy user
                  async.forEachOf(item.authors, function (author, key, callback) {
                    if (author.email) {
                      invites.pull_invite(author._id, id, 4, function (err) {
                        db.peoples.deleteOne({ _id: author._id }, { safe: true }, callback());
                      });
                    } else {
                      callback()
                    }
                  }, function (err) {
                    cb(err)
                  })
                },
                publication: function (cb) { // delete Publication Item
                  db.publications.deleteOne({ _id: id }, { safe: true }, cb());
                }
              },
              function (err, results) {
                if (err) {
                  callback(err)
                } else {
                  callback(err, err ? null : results)
                }
              });
            } else {
              callback()
            }

          })
        }, function (err) {
          cb(err, null)
        })
      }
    }

  ],
  function (err, results) {
    if (err) {
      callback(err);
    } else {
      callback(err, err ? null : results);
    }
  });

}

// db.publications.findOneAndUpdate(
//     { _id: ObjectID(ids[0]) },
//     { $pull: { ["folders." + userId]: 1 } },
//     { projection: { "folders" : 1 } },
//     // { "new": true },
//     function(err, doc) {
//       const foldersObj = doc.value.folders[userId];
//       if (foldersObj) {
//         var objects = {};
//         foldersObj.forEach((folderObj, index) => {
//           objects["library." + folderObj.folder] = { $in: [ ids[0] ]};
//         })
//         console.log('objects',objects)
//         db.peoples.updateOne(
//           { _id: itemId },
//           // { $pullAll: { "library": { $in: ids } } },
//           { $pull: objects },
//           { safe: true },
//           cb()
//         )
//       } else {
//         cb(err)
//       }
//     }
// );

function createPublicationDocument(data, mode: number, userId: string, adminFlag: boolean, callback) {
  const folders_array = data.folders ? (data.folders.map(folder => ({"_id": ObjectID() ,"folder": folder, "date": new Date()}))) : [];
  // (data.folders.map(folder => ({"_id": ObjectID() ,"folder": folder, "date": new Date()}))).concat({"_id": ObjectID() ,"folder": null, "date": new Date()}) :
  console.log("data.folders",data.folders)
  console.log("folders_array",folders_array)

  db.publications.insertOne(
    {
      "type": data.type,
      "title": data.title,

      "ai": (adminFlag && data.ai) ? 1 : 0,

      "groupsIds": (mode==0 || mode==5) ? [ObjectID(data.parentId)] : [],
      "projectsIds": (mode==1) ? [ObjectID(data.parentId)] : [],
      "resourcesIds": (mode==2) ? [ObjectID(data.parentId)] : [],
      "profilesIds": (mode==3 || mode==6) ? [data.parentId] : [],

      "created_on": new Date(),
      "views": [0,0,0,0,0],
      "downloads": [0,0,0,0,0],
      "followedIds": [],

      "citations": null,
      "date": data.date,
      "authors": data.authors,
      "publisher": data.publisher,
      "url": data.url,
      "tags": data.tags,
      "doi": data.doi,
      "projects": data.projects,
      "fundings": data.fundings,

      "abstract": data.abstract,
      "abstractPic": data.abstractPic,

      "pdfMode": data.pdfMode,
      "pdf": data.pdf,

      "journal": data.journal ? data.journal : {"name": null, "issn": []},
      "abbr": data.abbr,
      "volume": data.volume,
      "issue": data.issue,
      "pages": data.pages,
      "edition": data.edition,

      "referencesCount": data.referencesCount,
      "citationsCount": data.citationsCount,

      "folders": (mode==8) ? { [userId]: folders_array } : {}
    },
    { w: 1, safe: true }, function(err, docsInserted) {
      callback(null, docsInserted.insertedId, (mode==8) ? folders_array : null);
    }
  );

}

export function publications_doi_list(publicationsIds: string[], callback) {

  var m = { "$match" : {"_id" : { "$in" : publicationsIds } } };
  var f = ({ "$project" : {_id: 1, name: "$title", doi: 1} });

  db.publications.aggregate( [ m, f ] ).toArray(callback);

}

export function publications_list(publicationsIds: string[], peopleId: string, userId: string, mini: number, aiStatus: number, meFlag: boolean, callback) {
  // mini 0 - item
  //      1 - mini
  //      2 - limit
  //      3 - news
  //      4 - compare

  var m, f, s, sort;
  // var limit = (mini==2) ? 2 : 0;
  var limit = (mini==2) ? 0 : 0;
  // var limit = (mini==2 || mini==4) ? 3 : 0;

  if (mini==2) sort={ date: -1 }; else sort={};

  if (mini==5) {

    m = { "$match" : {"_id" : { "$in" : publicationsIds } } };
    f = { "$project" : { _id: 1, name: "$title", "authors._id": 1, "authors.name": 1, "authors.pic": 1, "abstractPic": 1 } };

    db.publications.aggregate( [ m, f ] ).toArray(callback);

  } else if (mini==3) {

    m = { "$match" : {"_id" : { "$in" : publicationsIds } } };
    f = { "$project" : { _id: 1, name: "$title", "authors._id": 1, "authors.name": 1, "authors.pic": 1 } };

    db.publications.aggregate( [ m, f ] ).toArray(callback);

  } else if (mini==4) {

    m = { "$match" : {"_id" : { "$in" : publicationsIds }, "ai": (aiStatus==1) ? 1 : {$in: [null, 0]} } };
    s = { "$sort" : { citationsCount: -1 } };
    f = { "$project" : { _id: 1, citationsCount: 1, date: 1, title: 1, journal: "$journal.name" } };

    db.publications.aggregate( [ m, s, f ] ).toArray(callback);

  } else if (mini==1) {

    m = { "$match" : {"_id" : { "$in" : publicationsIds }, "ai": (aiStatus==1) ? 1 : {$in: [null, 0]} } };
    f = { "$project" : { _id: 1, name: "$title" } };

    db.publications.aggregate( [ m, f ] ).toArray(callback);

  } else if (peopleId) {

    db.publications
      .find({_id: { $in: publicationsIds } })
      .project({ _id: 1, type: 1, title: 1, views: 1, pdf: 1, doi: 1,
                 // groupsIds: 1, projectsIds: 1, resourcesIds: 1,
                 // profilesIds: 1,
                 citations: 1, date: 1, abstract: 1, abstractPic: 1, citationsCount: 1,
                 "authors._id": 1, "authors.name": 1, "authors.pic": 1, tags: 1,
                 "journal.name": 1, volume: 1, issue: 1, edition: 1, pages: 1,
                 ["folders."+peopleId]: 1,
                 ["folders."+userId]: 1,
              })
      .sort(sort)
      .limit(limit)
      .map(
           function(u) {
             if (u.folders) {
               u.userFolders = u.folders[userId];
               if (meFlag) {
                 u.folders = u.folders[peopleId];
               } else {
                 u.folders = u.folders[peopleId];
                 u.folders.forEach(function(v) { delete v.privacy } )
               }
             }
             return u;
          })
      .toArray(callback);

  } else {

    db.publications
      .find({_id: {$in: publicationsIds}})
      .project({ _id: 1, type: 1, title: 1, views: 1, pdf: 1, doi: 1,
                 groupsIds: 1, projectsIds: 1, resourcesIds: 1,
                 // profilesIds: 1,
                 citations: 1, date: 1, abstract: 1, abstractPic: 1, citationsCount: 1,
                 "authors._id": 1, "authors.name": 1, "authors.pic": 1, tags: 1,
                 "journal.name": 1, volume: 1, issue: 1, edition: 1, pages: 1,
                 ["folders."+userId]: 1,
               })
      .sort(sort)
      .limit(limit)
      .map(
           function(u) {
             if (u.folders) {
               u.userFolders = u.folders[userId];
             }
             return u;
          })
      .toArray(callback);

  }

}

export function publication_details(publicationIds: string[], followingsIds: string[], callback) {

  const m = { _id: ObjectID(publicationIds) };

  const p = { _id: 1, type: 1, title: 1, views: 1,
              groupsIds: 1, projectsIds: 1, resourcesIds: 1,
              authors: 1,
              // profilesIds: 1,
              citations: 1, date: 1, publisher: 1, abstract: 1, abstractPic: 1, url: 1,
              figures: 1, tags: 1, doi: 1, fundings: 1,
              pdf: 1,
              projects: 1,
              journal: 1, abbr: 1, volume: 1, issue: 1, pages: 1, edition: 1,
              referencesCount: 1, citationsCount: 1,
              folders: 1
            };

  if (followingsIds) {

    db.publications.find(m).project(p).map(
     function(u) {
       u.followStatus = followingsIds.toString().includes(u._id.toString());
       return u;
     }
    ).next(callback);

  } else {

    db.publications.find(m).project(p).next(callback);

  }

}

export function post_publication_author(itemId: string, email: string, mini: objectMini, callback) {
  // console.log('mini',mini)
  db.publications.updateOne(
    { _id: ObjectID(itemId), "authors.email": email},
    { $set:
      {
        "authors.$._id": mini._id,
        "authors.$.pic": mini.pic,
      }
    },
    { safe: true },
    callback()
  )
}

function post_publication_author_id(itemId: string, email: string, id: string, callback) {
  // console.log('itemId',itemId)
  // console.log('mini',mini)
  db.publications.updateOne(
    { _id: ObjectID(itemId), "authors.email": email},
    { $set: { "authors.$._id": id } },
    { safe: true },
    callback()
  )
}

export function post_publication_field(data, itemId: string, type: number, callback) {
  var key: string;

  switch(type) {
     case 0: key = "title"; break;
     case 1: key = "date"; break;
     case 2: key = "volume"; break;
     case 3: key = "issue"; break;
     case 4: key = "edition"; break;
     case 5: key = "pages"; break;
     case 6: key = "publisher"; break;
     // case 7: key = "abstract"; break;
     // case 8: key = "doi"; break;
     case 9: key = "pdf"; break;
     default: console.log("Invalid mode");
  }

  async.waterfall([
      // 1. validate data.
      // function (cb) {
      //     try {
      //         const reqFields: string[] = [ "text" ];
      //         console.log('dataaa',data)
      //         backhelp.verify(data, reqFields);
      //     } catch (e) {
      //         cb(e);
      //         return;
      //     }
      //     cb(null, data);
      // },

      // 2. update Field
      // function (data, cb) {
      function (cb) {
        db.publications.updateOne(
           {_id: ObjectID(itemId)},
           { $set: { [key]: data.text } },
           { safe: true },
           cb(null, itemId)
        );
      },

      function (itemId: string, cb) {
        if (type==9) {
          pics.delete_pic("publications", "pdf", itemId, data.text, false, function(err) {
            cb(null, itemId)
          })
        } else {
          cb(null, itemId)
        }
      }

  ],
  function (err, publicationId) {
      // 3. convert errors to something we like.
      if (err) {
        callback(err);
      } else {
        callback(err, err ? null : publicationId);
      }
  });
};

// export function post_journal_field(name:string, issn: string[], itemId: string, callback) {
export function post_journal_field(obj: JournalObj, itemId: string, callback) {
  async.waterfall([
    // 1. update Field
    function (cb) {
      db.publications.updateOne(
         {_id: ObjectID(itemId)},
         { $set:
           {
             "journal.name": obj.journal.name,
             "journal.issn": obj.journal.issn,
             "issue": obj.issue,
             "pages": obj.pages,
             "publisher": obj.publisher,
             "volume": obj.volume
           },
         },
         { safe: true },
         cb()
      );
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

export function post_doi_field(url: string, doi: string, itemId: string, callback) {
  var key: string;

  async.waterfall([
      // 1. update Field
      function (cb) {
      //   db.publications.updateOne(
      //      {_id: ObjectID(itemId)},
      //      { $set:
      //        {
      //          "url": url,
      //          "doi": doi,
      //        },
      //      },
      //      { safe: true },
      //      cb(null, itemId)
      //   );
      cb(null, itemId)
      },
  ],
  function (err, publicationId) {
      // 2. convert errors to something we like.
      if (err) {
        callback(err);
      } else {
        callback(err, err ? null : publicationId);
      }
  });
};

export function publications_dois(dois, callback) {
  db.publications
    .find({"doi": {$in: dois} })
    .project({"_id": 1, "doi": 1, "authors": 1, "abstract": 1, "abstractPic": 1})
    .toArray(callback);
};

export function publications_analytics(publicationsIds, callback) {
  db.publications
    .find({ _id: {$in: publicationsIds} })
    .project({ _id: 1, type: 1, title: 1, views: 1, downloads: 1, citations: 1 })
    .toArray(callback);
}

export function post_suggestions(publicationsIds: string[], parentId: string, mode: number, callback) {
  var collection: string;
  var key: string;

  if (mode==0) {
    collection = "groups";
    key = "publicationsItems.suggestionsIds"
  } else if (mode==1) {
    collection = "peoples";
    key = "publicationsSuggestionsIds"
  }

  db[collection].updateOne(
     {_id: (mode==0) ? ObjectID(parentId) : parentId },
     { $set: { [key]: publicationsIds } },
     { safe: true },
     callback()
  );
};

export function post_suggestion_decision(parentId: string, publicationId: string, action: number, mode: number, callback) {
  var collection: string;
  var keyPush0, keyPush1, keyPull: string;

  if (mode==0) {
    collection = "groups";
    keyPull = "publicationsItems.suggestionsIds"
    keyPush0 = "publicationsItems.publicationsIds"
    keyPush1 = "publicationsItems.rejectedIds"
  } else if (mode==1) {
    collection = "peoples";
    keyPull = "publicationsSuggestionsIds"
    keyPush0 = "publicationsIds"
    keyPush1 = "publicationsRejectedIds"
  }

  var p;

  if (action==0) { // accept
    p = { $pull: { [keyPull]: ObjectID(publicationId) }, $push: { [keyPush0]: ObjectID(publicationId) } };
  } else if (action==1) { // reject
    p = { $pull: { [keyPull]: ObjectID(publicationId) }, $push: { [keyPush1]: ObjectID(publicationId) } };
  }

  db[collection].updateOne(
     { _id: (mode==0) ? ObjectID(parentId) : parentId },
     p,
     { safe: true },
     callback()
  );
};

export function post_suggestion_news(userId: string, parentId: string, mode: number, publicationId: string, callback) {
  db.publications
    .find({_id: ObjectID(publicationId)})
    .project({authors: 1, abstract: 1, abstractPic: 1, pdf: 1 }) // journal, date, tags
  .next().then(function(item) {
    const peoplesIds: string[] = item.authors.map(x => x._id);

    if (mode==0) {
      news.add_group_activity(userId, 1001, publicationId, parentId, publicationId, peoplesIds, item.abstract, item.pdf, item.abstractPic, 3, function (err) {
        callback(err, publicationId)
      })
    } else if (mode==1) {
      news.add_activity(3, userId, 1001, publicationId, userId, publicationId, peoplesIds, item.description, null, null, false, function (err) {
        callback(err, publicationId)
      })
    } else {
      callback(null, publicationId)
    }
  });
}

export function reset_author(authorId: string, publicationId: string, callback) {
  db.publications.updateOne(
    {_id: ObjectID(publicationId), "authors._id": authorId },
    { $set: { "authors.$._id": null, "authors.$.pic": null, "authors.$.email": null, "authors.$.dates": null } },
    { safe: true },
    callback()
  )
}

export function put_claim(itemId: string, userId: string, mode: number, name: string, message: string, callback) {
  db.claims.insertOne(
     {
       "itemId": ObjectID(itemId),
       "userId": userId,
       "name": name,
       "message": message,
       "mode": mode
     },
     { safe: true },
     callback()
  )
};

function invalid_publication_name() {
    return backhelp.error("invalid_publication_name",
                          "Group names can have letters, #s, _ and, -");
}
