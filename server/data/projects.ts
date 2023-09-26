var db = require('../db.ts'),
    async = require('async'),
    backhelp = require("./backend_helpers.ts");

var ObjectID = require('mongodb').ObjectID;

var groups = require("./groups.ts");
var peoples = require("./peoples.ts");
var news = require("./news.ts");
var shared = require("./shared.ts");
var pics = require("./pics.ts");

const algoliasearch = require('algoliasearch');
const client = algoliasearch('TDKUK8VW4T', '5d17934a8722069c0ac47bd6b4ae4bda');
const algoliaIndex = (process.env.PORT) ? client.initIndex('labs') : client.initIndex('dev_labs');

import {objectMini, groupComplex} from '../models/shared.ts';

exports.version = "0.1.0";

export function put_project(userId: string, type: number, topicId: string, adminFlag: boolean, data, callback) {
    var data_clone;
    var mini: objectMini;

    async.waterfall([

      // 1. validate data.
      function (cb) {
        try {
          const reqFields: string[] = ["name", "description"];
          backhelp.verify(data, reqFields);
        } catch (e) {
          cb(e);
          return;
        }
        cb(null, data);
      },

      // 1A. extract user mini (for type==2)
      function (project_data, cb) {
        if (type==2) {
          peoples.peoples_list([userId], null, null, 1, null, function (err, peoples) {
            cb(err, peoples, project_data)
          });
        } else {
          cb(null, null, project_data);
        }
      },

      // 1B. extract group complex (for type<2)
      function (peoples: objectMini[], project_data, cb) {
        if (type<2) {
          groups.get_group_algolia(project_data.groupId, function (err, item) {
            cb(err, null, item.groupIndex, item.country, item.state, item.city, item.location, project_data)
          });
        } else {
          cb(null, peoples, null, null, null, null, null, project_data);
        }
      },

      // 2. create Project document
      function (peoples: objectMini[], group: groupComplex, country: string, state: string, city: string, location: number[], project_data, cb) {
        data_clone = JSON.parse(JSON.stringify(project_data));
        createProjectDocument(data_clone, peoples, group, country, state, city, location, type, adminFlag, function (err, projectId) {
          mini = {"_id": projectId, "name": data_clone.name, "pic": data_clone.pic}
          cb(err, projectId)
        });
      },

      // 3. insert Project ID to Group / Profile
      function (projectId, cb) {
        if (type==2) {
          db.peoples.updateOne(
             { _id: userId },
             {
               $push: { "profileProjectsIds": projectId },
               $set: { "progress.9": 1}
             },
             { safe: true },
             cb(null, projectId)
          )
        } else {
          const key = (type==0) ? "topicsItems.$.currentProjectsIds" : "topicsItems.$.pastProjectsIds";

          db.groups.updateOne(
             { _id: ObjectID(data_clone.groupId), "topicsItems.link": topicId },
             {
               $push: { [key]: projectId },
               $set: { "progress.10": 1 }
             },
             { safe: true },
             cb(null, projectId)
          )
        }
      },

      // 4. insert Project ID to Peoples Projects List
      function (projectId, cb) {
        if (data_clone.people && type<2) {
          db.peoples.updateMany(
             { _id: {$in: data_clone.people.map(r => r._id)} },
             { $push: { "projectsIds": ObjectID(projectId) } },
             { multi: true, safe: true },
             cb(null, projectId)
          )
        } else {
          cb(null, projectId)
        }

        // Promise.all(data_clone.people.map(function(people) {
        //     db.peoples.updateOne(
        //        {_id: ObjectID(people._id)},
        //        { $push: { "projectsIds": projectId } },
        //        { safe: true },
        //     )
        // })).then(function(results) {
        //   cb(null, projectId)
        // })
      },

      // 5. insert Project ID to Collaborations Projects List
      function (projectId, cb) {
        if (data_clone.collaborations[0] && type<2) {
          db.collaborations.updateMany(
             { _id: {$in: data_clone.collaborations.map(r => ObjectID(r._id))} },
             { $push: { "projects": mini } },
             { multi: true, safe: true },
             cb(null, projectId)
          )
        } else {
          cb(null, projectId)
        }
      },

      // 6. insert Project ID to Fundings Projects List
      function (projectId, cb) {
        if (data_clone.fundings[0] && type<2) {
          db.fundings.updateMany(
             { _id: {$in: data_clone.fundings.map(r => ObjectID(r._id))} },
             { $push: { "projects": mini } },
             { multi: true, safe: true },
             cb(null, projectId)
          )
        } else {
          cb(null, projectId)
        }
      },

      // 7. push News Notifications + Wall
      function (projectId, cb) {
        if (type<2) {
          if (adminFlag && data_clone.ai) {
            cb(null, projectId)
          } else {
            push_news(userId, projectId, data_clone.groupId, data_clone.description, data_clone.people.map(x => x._id), function (err) {
              cb(err, projectId)
            })
          }
        } else {
          // news.add_activity(3, userId, 1003, projectId, userId, projectId, [userId], data_clone.description, null, null, false, function (err) {
          news.add_activity(3, userId, 1003, projectId, null, null, null, data_clone.description, null, null, false, function (err) {
            cb(err, projectId)
          })
        }
      }

    ],
    function (err, projectId) {
      if (err) {
        callback(err);
      } else {
        callback(err, err ? null : projectId);
      }
    });
};

export function push_news(userId: string, projectId: string, groupId: string, description: string, peoplesIds: string[], callback) {
  // {{parentName}} {{userName}} added a new {{itemType}} {{itemTitle}}
  news.add_activity(0, userId, 1003, projectId, groupId, projectId, peoplesIds, description, null, null, false, function (err) {
    groups.groupMembers(groupId, 3, function (err, peoples) {
      async.forEachOf(peoples.map(r => r._id), function (activeId, key, cb) {
        if (userId==activeId) {
          cb()
        } else if (peoplesIds.indexOf(activeId.toString())>-1) {
          news.add_notification(userId, 9501, projectId, activeId, groupId, peoplesIds, description, null, null, function (err) {
            cb(err)
          });
        } else {
          news.add_notification(userId, 1003, projectId, activeId, groupId, peoplesIds, description, null, null, function (err) {
            cb(err)
          });
        }
      }, function (err) {
        callback(err)
      })
    })
  })
}

export function post_project(data, callback) {

  var projectId = data._id;

  async.waterfall([

    // 1. validate data.
    function (cb) {
      try {
        const reqFields: string[] = [ "name", "description" ];
        backhelp.verify(data, reqFields);
      } catch (e) {
        cb(e);
        return;
      }
      cb(null, data);
    },

    // 2. update Project document
    function (project_data, cb) {
      pics.delete_pic("projects", "pic", projectId, project_data.pic, false, function(err) {
        db.projects.findOneAndUpdate(
          { _id: ObjectID(projectId) },
          { $set:
            {
              "name": project_data.name,
              "pic": project_data.pic,
              "period": project_data.period,
              "description": project_data.description,
            }
          },
          function(err, doc) {
            if (doc.value.groupId) {
              algoliaIndex.getObject(doc.value.groupId, (err, content) => {
                if (content==undefined) {
                  cb(null, project_data)
                } else {
                  const index = content.projects.findIndex(y => y._id == projectId);
                  if (index>-1) {
                    content.projects[index].name = project_data.name;
                    content.projects[index].pic = project_data.pic;
                    content.projects[index].period = project_data.period;
                    content.projects[index].description = project_data.description;
                    algoliaIndex.partialUpdateObject({
                      objectID: doc.value.groupId,
                      projects: content.projects
                    }, (err, content) => {
                      cb(err, project_data)
                    });
                  } else {
                    cb(err, project_data)
                  }
                }
              });
            } else {
              cb(err, project_data)
            }
          }
        )
      })
    },

    // 3. update Project Name+Pic of associated items
    function (project_data, cb) {
      db.projects
        .find({_id: ObjectID(projectId)})
        .project({ "_id": 0, "collaborations": 1, "fundings": 1, "resourcesIds": 1, "mediaIds": 1, "positionsIds": 1, "sponsorsIds": 1})
      .next().then(function(item) {
        async.parallel({

          collaborations: function (cb) {
            if (item.collaborations) {
              db.collaborations.updateMany(
                {_id: {$in: item.collaborations.map(r => ObjectID(r._id))}, "projects._id": ObjectID(projectId)},
                { $set: {
                         "projects.$.name": project_data.name,
                         "projects.$.pic": project_data.pic
                        },
                },
                { multi: true, safe: true },
                cb()
              )
            } else {
              cb()
            }
          },

          fundings: function (cb) {
            if (item.fundings) {
              db.fundings.updateMany(
                {_id: {$in: item.fundings.map(r => ObjectID(r._id))}, "projects._id": ObjectID(projectId)},
                { $set: {
                         "projects.$.name": project_data.name,
                         "projects.$.pic": project_data.pic
                        },
                },
                { multi: true, safe: true },
                cb()
              )
            } else {
              cb()
            }
          },

          resources: function (cb) {
            if (item.resourcesIds) {
              db.resources.updateMany(
                {_id: {$in: item.resourcesIds.map(r => ObjectID(r))}, "projects._id": ObjectID(projectId)},
                { $set: {
                         "projects.$.name": project_data.name,
                         "projects.$.pic": project_data.pic
                        },
                },
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
                {_id: {$in: item.mediaIds.map(r => ObjectID(r))}, "projects._id": ObjectID(projectId)},
                { $set: {
                         "projects.$.name": project_data.name,
                         "projects.$.pic": project_data.pic
                        },
                },
                { multi: true, safe: true },
                cb()
              )
            } else {
              cb()
            }
          },

          positions: function (cb) {
            if (item.positionsIds) {
              db.positions.updateMany(
                {_id: {$in: item.positionsIds.map(r => ObjectID(r))}, "projects._id": ObjectID(projectId)},
                { $set: {
                         "projects.$.name": project_data.name,
                         "projects.$.pic": project_data.pic
                        },
                },
                { multi: true, safe: true },
                cb()
              )
            } else {
              cb()
            }
          },

          sponsors: function (cb) {
            if (item.sponsorsIds) {
              db.sponsors.updateMany(
                {_id: {$in: item.sponsorsIds.map(r => ObjectID(r))}, "projects._id": ObjectID(projectId)},
                { $set: {
                         "projects.$.name": project_data.name,
                         "projects.$.pic": project_data.pic
                        },
                },
                { multi: true, safe: true },
                cb()
              )
            } else {
              cb()
            }
          }

        },

        function (err) {
          cb(err, projectId)
        });

      })

    }
  ],
  function (err, projectId) {
    if (err) {
      callback(err);
    } else {
      callback(err, err ? null : projectId);
    }
  });
};

export function move_project(parentId: string, projectId: string, topicId: string, type: number, callback) {
  var from,to: string;

  if (type==0) {
    from = "topicsItems.$.currentProjectsIds";
    to = "topicsItems.$.pastProjectsIds";
  } else if (type==1) {
    from = "topicsItems.$.pastProjectsIds";
    to = "topicsItems.$.currentProjectsIds";
  }

  async.waterfall([

      // 1. move Project ID.
      function (cb) {
        db.groups.updateOne(
           {_id: ObjectID(parentId), "topicsItems.link": topicId},
           {
             $pull: { [from]: ObjectID(projectId) },
             $push: { [to]: ObjectID(projectId) }
           },
           { multi: false, safe: true },
           cb()
        );
      },

      // 2. set Period
      function (cb) {

        db.projects.updateOne(
           {_id: ObjectID(projectId)},
           { $set:
             {
               "period.end": (type==0) ? new Date() : null,
               "period.mode": (type==0) ? 0 : 2
             },
           },
           { multi: false, safe: true },
           cb(null, projectId)
        );

      }

  ],
  function (err, projectId) {
      // 3. convert errors to something we like.
      if (err) {
        callback(err);
      } else {
        callback(err, err ? null : projectId);
      }
  });

};

export function delete_project(parentId: string, userId: string, projectId: string, topicId: string, type: number, callback) {
  async.series({

      // 1. delete Project Group Links / Profile Links
      links: function (cb) {
        if (type==2) {

          db.peoples.updateOne(
             {_id: parentId},
             { $pull: { "profileProjectsIds": ObjectID(projectId) } },
             { safe: true },
             cb(null, projectId)
          )

        } else {

          // var progress: number = 1;

          // db.groups
          //   .find({_id: ObjectID(parentId)})
          //   .project({_id: 0, "projectsItems.currentProjectsIds": 1, "projectsItems.pastProjectsIds": 1})
          // .next().then(function(item) {

            // const key = (type==0) ? "projectsItems.currentProjectsIds" : "projectsItems.pastProjectsIds";
            const key = (type==0) ? "topicsItems.$.currentProjectsIds" : "topicsItems.$.pastProjectsIds";

          //
          //   if (
          //       (type==0 && item.projectsItems.currentProjectsIds.length==1 && item.projectsItems.pastProjectsIds.length==0)
          //       ||
          //       (type==1 && item.projectsItems.currentProjectsIds.length==0 && item.projectsItems.pastProjectsIds.length==1)
          //   ) {
          //     progress = 0;
          //   }

            db.groups.updateOne(
               {_id: ObjectID(parentId), "topicsItems.link": topicId},
               {
                 // $set: { "progress.10": progress },
                 $pull: { [key]: ObjectID(projectId) },
               },
               { multi: false, safe: true },
               cb()
            )
          // })
        };
      },

      // 2. delete Project Members, Collaborations, Fundings, Resources, Media, Questions, Publications (+ Notification)
      items: function (cb) {
        db.projects
          .find({_id: ObjectID(projectId)})
          .project({ "_id": 0, "pic": 1, "backgroundPic": 1, "showcases": 1, "people": 1, "collaborations": 1, "fundings": 1, "resourcesIds": 1,
            "talksIds": 1, "postersIds": 1, "pressesIds": 1, "mediaIds": 1, "positionsIds": 1, "sponsorsIds": 1,
            "faqsIds": 1, "publicationsIds": 1, "followedIds": 1})
        .next().then(function(item) {

          async.parallel({

            delete_news: function (cb) {
              if (type<2) {
                const peoplesIds: string[] = item.people.map(r => r._id);
                news.add_group_activity(userId, 1103, projectId, parentId, projectId, peoplesIds, null, null, null, 3, function (err) {
                  cb(err)
                })
              } else {
                cb()
              }
            },

            members: function (cb) {
              if (item.people) {
                db.peoples.updateMany(
                   {_id: {$in: item.people.map(r => r._id)}},
                   { $pull: { "projectsIds": ObjectID(projectId) } },
                   { multi: true, safe: true },
                   cb()
                )
              } else {
                cb()
              }
            },

            collaborations: function (cb) {
              if (item.collaborations) {
                db.collaborations.updateMany(
                   {_id: {$in: item.collaborations.map(r => ObjectID(r._id))}},
                   { $pull: { "projects": {"_id": ObjectID(projectId)} } },
                   { multi: true, safe: true },
                   cb()
                )
              } else {
                cb()
              }
            },

            fundings: function (cb) {
              if (item.fundings) {
                db.fundings.updateMany(
                   {_id: {$in: item.fundings.map(r => ObjectID(r._id))}},
                   { $pull: { "projects": {"_id": ObjectID(projectId)} } },
                   { multi: true, safe: true },
                   cb()
                )
              } else {
                cb()
              }
            },

            resources: function (cb) {
              if (item.resourcesIds) {
                db.resources.updateMany(
                   {_id: {$in: item.resourcesIds}},
                   { $pull: { "projects": {"_id": ObjectID(projectId)} } },
                   { multi: true, safe: true },
                   cb()
                )
              } else {
                cb()
              }
            },

            positions: function (cb) {
              if (item.positionsIds) {
                db.positions.updateMany(
                   {_id: {$in: item.positionsIds}},
                   { $pull: { "projects": {"_id": ObjectID(projectId)} } },
                   { multi: true, safe: true },
                   cb()
                )
              } else {
                cb()
              }
            },

            sponsors: function (cb) {
              if (item.sponsorsIds) {
                db.sponsors.updateMany(
                   {_id: {$in: item.sponsorsIds}},
                   { $pull: { "projects": {"_id": ObjectID(projectId)} } },
                   { multi: true, safe: true },
                   cb()
                )
              } else {
                cb()
              }
            },

            media_group: function (cb) {
              if (item.mediaIds) {
                db.media.updateMany(
                   {_id: {$in: item.mediaIds}},
                   { $pull: { "projects": {"_id": ObjectID(projectId)} } },
                   { multi: true, safe: true },
                   cb()
                )
              } else {
                cb()
              }
            },

            media_project: function (cb) {
              if (item.talksIds || item.postersIds || item.pressesIds) {
                db.media.deleteMany(
                   {_id: {$in: item.talksIds.concat(item.postersIds).concat(item.pressesIds)}},
                   cb()
                )
              } else {
                cb()
              }
            },

            faqs: function (cb) {
              if (item.faqsIds) {
                db.faq.deleteMany(
                   {_id: {$in: item.faqsIds}},
                   cb()
                )
              } else {
                cb()
              }
            },

            publications: function (cb) {
              if (item.publicationsIds) {
                db.publications.deleteMany(
                   {_id: {$in: item.publicationsIds}},
                   cb()
                )
              } else {
                cb()
              }
            },

            pics: function (cb) {
              pics.delete_pic_direct(item.pic, function(err) {
                pics.delete_pic_direct(item.backgroundPic, function(err) {
                  pics.delete_pic_gallery((item.showcases[0] || {}).pic, function(err) {
                    cb(err)
                  })
                })
              })
            }

          },

          function (err) {
            cb(err)
          });

        })

      },

      // 3. delete Project Followers Links (+ Notification)
      followers: function (cb) {
        peoples.delete_followings_ids("projects", "projectsIds", projectId, true, function (err) {
          cb(err)
        });
      },

      // 4. delete Project Item
      project: function (cb) {
        db.projects.deleteOne({ _id: ObjectID(projectId) },
                              { safe: true },
                              cb());
      },

      // 5. delete Project Algolia
      project_algolia: function (cb) {
        if (type==2) {
          cb()
        } else {
          algoliaIndex.getObject(parentId, (err, content) => {
            if (content==undefined) {
              cb(null)
            } else {
              const projects = content.projects.filter(r => r._id!=projectId);
              algoliaIndex.partialUpdateObject({
                objectID: parentId,
                projects: projects
              }, (err, content) => {
                cb(err)
              });
            }
          });
        }
      },

      // 6. remove Project news
      news: function (cb) {
        if (type==2) {
          cb()
        } else {
          news.remove_activity(parentId, projectId, 0, function (err) {
            cb(err);
          });
        }
      }

  },
  function (err, results) {
      // 6. convert errors to something we like.
      if (err) {
        callback(err);
      } else {
        callback(err, err ? null : results);
      }
  });

}
// Promise.all(items.people.map(function(item) {
//   db.peoples.updateOne(
//      {_id: ObjectID(item._id)},
//      { $pull: { "projectsIds": ObjectID(projectId) } },
//      { safe: true },
//   )
// })).then(function(results) {
//   cb()
// })

export function post_project_name_pic(projectId: string, type: string, name: string, callback) {

  async.waterfall([
    // update Project Name in associated items
    function (cb) {
      db.projects
        .find({_id: ObjectID(projectId)})
        .project({ "_id": 0, "collaborations": 1, "fundings": 1, "resourcesIds": 1, "mediaIds": 1, "positionsIds": 1, "sponsorsIds": 1})
      .next().then(function(item) {
        async.parallel({

          collaborations: function (cb) {
            if (item.collaborations) {
              db.collaborations.updateMany(
                 {_id: {$in: item.collaborations.map(r => ObjectID(r._id))}, "projects._id": ObjectID(projectId)},
                 { $set: {["projects.$." + type]: name } },
                 { multi: true, safe: true },
                 cb()
              )
            } else {
              cb()
            }
          },

          fundings: function (cb) {
            if (item.fundings) {
              db.fundings.updateMany(
                 {_id: {$in: item.fundings.map(r => ObjectID(r._id))}, "projects._id": ObjectID(projectId)},
                 { $set: {["projects.$." + type]: name } },
                 { multi: true, safe: true },
                 cb()
              )
            } else {
              cb()
            }
          },

          resources: function (cb) {
            if (item.resourcesIds) {
              db.resources.updateMany(
                 {_id: {$in: item.resourcesIds.map(r => ObjectID(r))}, "projects._id": ObjectID(projectId)},
                 { $set: {["projects.$." + type]: name } },
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
                 {_id: {$in: item.mediaIds.map(r => ObjectID(r))}, "projects._id": ObjectID(projectId)},
                 { $set: {["projects.$." + type]: name } },
                 { multi: true, safe: true },
                 cb()
              )
            } else {
              cb()
            }
          },

          positions: function (cb) {
            if (item.positionsIds) {
              db.positions.updateMany(
                 {_id: {$in: item.positionsIds.map(r => ObjectID(r))}, "projects._id": ObjectID(projectId)},
                 { $set: {["projects.$." + type]: name } },
                 { multi: true, safe: true },
                 cb()
              )
            } else {
              cb()
            }
          },

          sponsors: function (cb) {
            if (item.sponsorsIds) {
              db.sponsors.updateMany(
                 {_id: {$in: item.sponsorsIds.map(r => ObjectID(r))}, "projects._id": ObjectID(projectId)},
                 { $set: {["projects.$." + type]: name} },
                 { multi: true, safe: true },
                 cb()
              )
            } else {
              cb()
            }
          }

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

export function delete_people(userId: string, ids: string[], callback) {
  db.projects.updateMany(
    { _id: {$in: ids} },
    { $pull: { "people": {"_id": userId } } },
    { multi: false, safe: true },
    callback()
  )
}

function createProjectDocument(data, peoples: objectMini[], group: groupComplex, country: string, state: string, city: string, location: number[], type: number, adminFlag: boolean, callback) {
  db.projects.insertOne(
    {
      "name": data.name,
      "pic": data.pic,
      "description": data.description,

      "ai": (adminFlag && data.ai) ? 1 : 0,

      "groupId": (type<2) ? ObjectID(data.groupId) : null,
      "profileId": (type==2) ? peoples[0]._id : null,

      "period": data.period,
      "views": [0,0,0,0,0],
      "followedIds": [],
      // "followStatus": false,

      "background": null,
      "backgroundPic": null,
      "backgroundCaption": null,

      "goals": null,
      "people": (type==2) ? peoples : data.people,
      "collaborations": data.collaborations.map(r => {r._id = ObjectID(r._id); return r}),
      "fundings": data.fundings.map(r => {r._id = ObjectID(r._id); return r}),
      "showcases": [],
      "faqsIds": [],
      "publicationsIds": [],
      "talksIds": [],
      "postersIds": [],
      "pressesIds": [],
      "resourcesIds": [],
      "mediaIds": [],
      "positionsIds": [],
      "sponsorsIds": [],
    },
    { w: 1, safe: true }, function(err, docsInserted) {
      if (type<2 && data.ai==null) {
        algoliaIndex.getObject(data.groupId, (err, content) => {
          const object = {
            _id: docsInserted.insertedId,
            created_on: new Date(),
            name: data.name,
            pic: data.pic,
            description: data.description,
            period: data.period,
          };
          if (content==undefined) {
            callback(null, docsInserted.insertedId)
          } else {
            if (content && content.projects) content.projects.push(object); else content.projects=[object];
            algoliaIndex.partialUpdateObject({
              objectID: data.groupId,
              projects: content.projects
            }, (err, content) => {
              callback(err, docsInserted.insertedId)
            });
          }
        });
      } else {
        callback(err, docsInserted.insertedId)
      }
    }
  );

}

export function projects_list(projectsIds, followingsIds, mini: number, aiStatus: number, callback) {
  var m = { "$match" : {"_id" : { "$in" : projectsIds }, "ai": (aiStatus==1) ? 1 : {$in: [null, 0]} } };
  var a = { "$addFields" : { "__order" : { "$indexOfArray" : [ projectsIds, "$_id" ] } } };
  var s = { "$sort" : { "__order" : 1 } };

  var f = (mini) ? ({ "$project" : { _id: 1, name: 1, pic: 1 } }) : ({ "$project" : { _id: 1, name: 1, pic: 1, period: 1, description: 1, groupId: 1, profileId: 1, views: 1 } });

  if (followingsIds && mini==0) {

    db.projects.aggregate( [ m, a, s, f ] ).map(
     function(u) {
       u.followStatus = followingsIds.toString().includes(u._id.toString());
       return u;
     }
    ).toArray(callback);

  } else {

    db.projects.aggregate( [ m, a, s, f ] ).toArray(callback);

  }
}

export function project_details(projectId, followingsIds, callback) {

  const m = { _id: ObjectID(projectId) };

  const p = { _id: 1, name: 1, pic: 1, description: 1, groupId: 1,
              period: 1, views: 1,
              background: 1, backgroundPic: 1, backgroundCaption: 1,
              goals: 1, faqs: 1, collaborations: 1,
              people: 1, fundings: 1, showcases: 1
               // group: 1
            };

  if (followingsIds) {

    db.projects.find(m).project(p).map(
     function(u) {
       u.followStatus = followingsIds.toString().includes(u._id.toString());
       return u;
     }
    ).next(callback);

  } else {

    db.projects.find(m).project(p).next(callback);

  }

}

export function projects_analytics(projectsIds, callback) {
  db.projects
    .find({ "_id": {"$in": projectsIds} })
    .project({ _id: 1, name: 1, views: 1})
    .toArray(callback);
}

export function project_items_ids(mode, projectId, type, callback) {
  var key: string;

  switch (mode) {
    case 0: {key = "publicationsIds"; break;}
    case 1: {key = "resourcesIds"; break;}
    case 2:
      switch (type) {
        case 0: key = "talksIds"; break;
        case 1: key = "postersIds"; break;
        case 2: key = "pressesIds"; break;
      }; break;
    case 3: {key = "faqsIds"; break;}
    case 4: {key = "people"; break;}
    case 5: {key = "collaborations"; break;}
    case 6: {key = "fundings"; break;}
  }

  db.projects.find(
    {_id: ObjectID(projectId)},
    { [key]: 1, _id: 0}).next(callback);
}

export function update_resource_list(push: boolean, projectId: string, resourceId: string, callback) {

  // console.log('push',push,projectId,resourceId)

  if (push==true) {

    db.projects.updateOne(
       {_id: ObjectID(projectId)},
       { $push: { "resourcesIds": ObjectID(resourceId) } },
       { safe: true }
    ).then(function() {
      db.projects
        .find({_id: ObjectID(projectId)})
        .project({ "_id": 0, "name": 1, "pic": 1})
      .next().then(function(projectItem) {
        db.resources.updateOne(
          {_id: ObjectID(resourceId)},
          { $push: { "projects": {"_id": ObjectID(projectId), "name": projectItem.name, "pic": projectItem.pic } } },
          { safe: true },
          callback()
      )}
    )});

  } else {

    db.projects.updateOne(
      {_id: ObjectID(projectId)},
      { $pull: { "resourcesIds": ObjectID(resourceId) } },
      { safe: true },
    ).then(function() {
      db.resources.updateOne(
         {_id: ObjectID(resourceId)},
         { $pull: { "projects": {"_id": ObjectID(projectId)} } },
         { safe: true },
         callback
    )});

  }

}

export function put_topic(name: string, ai: number, itemId: string, adminFlag: boolean, callback) {

  async.waterfall([

    // 1. insert Topic
    function (cb) {
      const topicId = ObjectID();
      db.groups.updateOne(
         {_id: ObjectID(itemId)},
         { $push:
          { "topicsItems":
            { "_id": topicId,
              "name": name,
              "link": name.replace(/ /g,"_").toLowerCase(),
              "ai": (adminFlag && ai) ? 1 : 0,
              "background": { "text": null,
                          "pic": null,
                          "caption": null
                        },
              "layMan": { "text": null,
                          "pic": null,
                          "caption": null
                        },
              "currentProjectsIds": [],
              "pastProjectsIds": []
            }
          }
         },
         { safe: true },
         cb(null, topicId)
      )
    }

  ],
  function (err, topicId) {
    if (err) {
      callback(err);
    } else {
      callback(err, topicId);
    }
  });

}

export function post_topic(name: string, itemId: string, groupId: string, callback) {
  async.waterfall([

    // 1. update Topic name
    function (cb) {
      db.groups.updateOne(
         { _id: ObjectID(groupId), "topicsItems._id": ObjectID(itemId)},
         { $set:
           {
             "topicsItems.$.name": name,
             "topicsItems.$.link": name.replace(/ /g,"_").toLowerCase()
           }
         },
         { safe: true },
         cb()
      )
    }

  ],
  function (err) {
    callback(err);
  });
};

export function delete_topic(itemId: string, groupId: string, callback) {
  async.series({

    // 1. verify Topic is empty

    // 2. delete Topic
    member: function (cb) {
      db.groups.updateOne(
        { _id: ObjectID(groupId)},
        { $pull: { 'topicsItems': {_id: ObjectID(itemId)} } },
        { multi: false, safe: true },
        cb(null, itemId)
      )
    }

  },
  function (err, results) {
    callback(err);
  });

}

export function topic_details(groupId: string, link: string, callback) {
  db.groups
    .find({_id: ObjectID(groupId), ["topicsItems.link"]: link })
    .project({ "_id": 0, "topicsItems.$": 1 } )
    .next().then(function(items) {
      if (items.topicsItems) {

        const topicItem = {
                           "_id": items.topicsItems[0]._id,
                           "name": items.topicsItems[0].name,
                           "background": items.topicsItems[0].background,
                           "layMan": items.topicsItems[0].layMan,
                          }

        callback(null, topicItem)

      } else {
        callback(null, null)
      }
    });
}

function invalid_project_name() {
    return backhelp.error("invalid_project_name",
                          "Project names can have letters, #s, _ and, -");
}
