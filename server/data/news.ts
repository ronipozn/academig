var db = require('../db.ts'),
    async = require('async'),
    stream = require('getstream'),
    backhelp = require("./backend_helpers.ts");

var ObjectID = require('mongodb').ObjectID;

var emails = require("../misc/emails.ts");

var peoples = require("./peoples.ts");
var groups = require("./groups.ts");
var publications = require("./publications.ts");
var resources = require("./resources.ts");
var projects = require("./projects.ts");
var positions = require("./positions.ts");
var teachings = require("./teachings.ts");
var collaborations = require("./collaborations.ts");
var fundings = require("./fundings.ts");
var faqs = require("./faqs.ts");
var media = require("./media.ts");

var trends = require("./trends.ts");
var podcasts = require("./podcasts.ts");
var events = require("./events.ts");
var apps = require("./apps.ts");

var server = require('../../server.ts');

import { objectMini } from '../models/shared.ts';
import {Countries} from '../models/shared.ts';

// if (!process.env.NODE_ENV || process.env.NODE_ENV === 'development') {
//    // dev code
// } else {
//    // production code
// }

if (process.env.PORT) {
  var client = stream.connect('3njpb9nj64v7', 'asvu8udev5q8s5edh8aatvmfbrnceecyyjfk6uy8ap33u3ahk8gg3kkk4zunqpgw', '33276');
} else {
  var client = stream.connect('64f8ncgpc5vv', 'zb5tmfz52g5624cmqksemdasgqg9h98xfyu69688hgaejqt6hr67q6by9wswjhyh', '36378');
}

exports.version = "0.1.0";

export function news_items(id, id_gt: string, offset: number, limit: number, feedType: string, callback) {
  async.waterfall([

    // 1. get News
    function (cb) {
      // feedType can be: timeline, group, department, university, publication, resource, project, teaching, position
      console.log('id',id, 'feedType',feedType)
      var timeline = client.feed(feedType, id);

      timeline.get({ limit: limit, offset: offset, id_gt: id_gt, reactions: { own: true, recent: true, counts: true } })
        .then(activitiesSuccess)
        .catch(activitiesError);

      function activitiesSuccess(successData) {
        // console.log('successData',successData)
        cb(null,successData)
      }

      function activitiesError(errorData) {
        console.log('errorData',errorData)
        cb(errorData,null)
      }
    },

    // 2. dress Names and Pics
    // item is String or Number? should be [] or division?
    function (items, cb) {
      async.forEachOf(items.results, function (item, key, callback) {
        async.parallel({
          actor: function (cb) {
            if (item.actor) {
              peoples.peoples_list([item.actor], null, null, 1, null, function (err, actor) {
                cb(err,actor[0]);
              });
            } else {
              cb();
            }
          },
          object: function (cb) {
            if (
                item.verb==1000 ||
                item.verb[0]==4 ||
                item.verb[0]==5 ||
                item.verb==6000 ||
                (item.verb[0]==6 && item.verb[1]==1)
               ) {
              groups.groups_list([ObjectID(item.object)], null, null, null, null, 2, true, function (err, object) {
                cb(err,object[0] ? object[0].groupIndex : {"_id": 0, "name": null, "pic": null});
              });
            // } else if (item.verb==13001) {
            //   peoples.peoples_list([ObjectID(item.object)], null, null, 1, null, function (err, object) {
            //     cb(err,object[0]);
            //   });
            } else if (item.verb==1001 || item.verb==6001) {
              publications.publications_list([ObjectID(item.object)], null, null, 3, 0, false, function (err, object) {
                cb(err,object[0]);
              });
            } else if (item.verb==1002 || item.verb==6002) {
              resources.resources_list([ObjectID(item.object)], null, null, 1, 0, false, function (err, object) {
                cb(err,object[0]);
              });
            } else if (item.verb==1003 || item.verb==6003) {
              projects.projects_list([ObjectID(item.object)], null, 1, 0, function (err, object) {
                cb(err,object[0]);
              });
            } else if (item.verb==1005 || item.verb==6004) {
              positions.positions_list([ObjectID(item.object)], id, 1, 0, false, function (err, object) {
                cb(err,object[0]);
              });
            // TBD 1050
            } else if (item.verb==1050 || item.verb==6020) {
              peoples.peoples_list([item.object], null, null, 1, null, function (err, object) {
                cb(err,object[0]);
              });
            } else if (item.verb==1004) {
              // collaborations.collaborations_list([ObjectID(item.object)], 1, function (err, object) {
              //   cb(err,object[0]);
              // });
              groups.groups_list([ObjectID(item.object)], null, null, null, null, 2, true, function (err, object) {
                cb(err,object[0] ? object[0].groupIndex : {"_id": 0, "name": null, "pic": null});
              });
            } else if (item.verb==1006) {
              fundings.fundings_list([ObjectID(item.object)], 1, 0, function (err, object) {
                cb(err,object[0]);
              });
            } else if (item.verb==1007) {
              cb(null,{"_id": null, "name": "Gallery", "pic": null}); // DO NOT DELETE
            } else if (item.verb==1008) {
              teachings.teachings_list([ObjectID(item.object)], 0, function (err, object) {
                cb(err,object[0]);
              });
            } else if (item.verb==1010) {
              cb(null,{"_id": null, "name": "groupQuestion", "pic": null}); // DO NOT DELETE
            } else if (item.verb==20000) {
              cb(null,{"_id": null, "name": "news", "pic": null}); // DO NOT DELETE
            } else if (item.verb==1011 || item.verb==1012 || item.verb==1013) {
              media.media_list([ObjectID(item.object)], null, 1, 0, function (err, object) {
                cb(err,object[0]);
              });
            } else {
              cb();
            }
          },
          target: function (cb) {
            if (item.target) {
              groups.groups_list([ObjectID.isValid(item.target) ? ObjectID(item.target) : item.target], null, null, null, null, 2, false, function (err, target) {
                cb(err,target[0]);
              });
            } else {
              cb();
            }
          },
          members: function (cb) {
            if (item.members) {
              peoples.peoples_list(item.members, null, null, 1, null, function (err, members) {
                cb(err,members);
              });
            } else {
              cb();
            }
          },
          commentors: function (cb) {
            if (item.latest_reactions && item.latest_reactions.comments) {
              peoples.peoples_list(item.latest_reactions.comments.map(r=>r.user_id), null, null, 1, null, function (err, commentors) {
                cb(err,commentors);
              });
            } else {
              cb();
            }
          }
        },
        function (err, results) {
          if (err) {
            callback(err);
          } else {
            // console.log('key',key,results)
            items.results[key].actor = results.actor;
            items.results[key].object = results.object;
            items.results[key].target = results.target ? results.target.groupIndex : null;
            items.results[key].members = results.members;
            items.results[key].commentors = results.commentors;
            callback();
          }
        });
      }, function (err) {
        // if (err) console.error(err.message);
        cb(err, items.results);
      });
    }

  ],
  // 3. callback
  function (err, items) {
    if (err) {
      callback(err);
    } else {
      callback(err, err ? null : items);
    }
  });
};

export function news_updates(id, id_gt: string, offset: number, limit: number, feedType: string, callback) {
  const countries = Countries;

  async.waterfall([

    // 1. get News
    function (cb) {
      client.feed(feedType, id).get({ limit: limit, offset: offset, id_gt: id_gt, reactions: { own: true, recent: true, counts: true } })
        .then(activitiesSuccess)
        .catch(activitiesError);

      function activitiesSuccess(successData) {
        cb(null,successData)
      }
      function activitiesError(errorData) {
        cb(errorData,null)
      }
    },

    // 2. dress Names and Pics (TBD: item is String or Number? should be [] or division?)
    function (items, cb) {
      async.forEachOf(items.results, function (item, key, callback) {
        let typeSplit, typeName, typeLink: string;
        let type: number;

        if (item.verb==1500) { // new items
          console.log('verb',item.verb)
          typeSplit = "app"; typeName = "App"; typeLink= "app"; type=2;
        } else {
          const typeSplit = item.origin.split(":")[0]; // 'user:roni_pozner' // items.results[key].origin.split(":")[0]
          switch (typeSplit) {
            case "user": typeName = "Researcher"; typeLink= "people"; type=0; break;
            // Mentor
            case "group": typeName = "Lab"; typeLink= ""; type=1; break;
            // Company
            case "trend": typeName = "Trend"; typeLink= "trend"; type=2; break;
            case "podcast": typeName = "Podcast"; typeLink= "podcast"; type=2; break;
            case "event": typeName = "Event"; typeLink= "event"; type=2; break;
            case "app": typeName = "App"; typeLink= "app"; type=2; break;
          };
        }

        console.log('typeSplit',typeSplit)
        console.log('item',item)

        async.parallel({
          actor: function (cb) {
            if (item.actor) {
              // peoples.peoples_list([item.actor], null, null, 1, null, function (err, actor) {
              peoples.people_news_updtes(item.actor, function (err, actor) {
                console.log('actor1')
                cb(err,actor);
              });
            } else {
              console.log('actor2')
              cb();
            }
          },
          object: function (cb) {
            if (item.verb==1000 || item.verb[0]==4 || item.verb[0]==5 || item.verb==6000 || (item.verb[0]==6 && item.verb[1]==1)) {
              groups.groups_list([ObjectID(item.object)], null, null, null, null, 2, true, function (err, object) {
                if (object && object[0]) {
                  object[0].item = "lab";
                  cb(err,object[0]);
                } else {
                  cb('Empty lab news');
                }
              });
            } else if (item.verb==1001 || item.verb==6001) {
              publications.publications_list([ObjectID(item.object)], null, null, 3, 0, false, function (err, object) {
                if (object && object[0]) {
                  object[0].item = "publication";
                  cb(err,object[0]);
                } else {
                  cb('Empty publication news');
                }
              });
            } else if (item.verb==1002 || item.verb==6002) {
              resources.resources_list([ObjectID(item.object)], null, null, 1, 0, false, function (err, object) {
                if (object && object[0]) {
                  object[0].item = "service";
                  cb(err,object[0]);
                } else {
                  cb('Empty service news');
                }
              });
            } else if (item.verb==1003 || item.verb==6003) {
              projects.projects_list([ObjectID(item.object)], null, 1, 0, function (err, object) {
                if (object && object[0]) {
                  object[0].item = "project";
                  cb(err,object[0]);
                } else {
                  cb('Empty project news');
                }
              });
            } else if (item.verb==1004) {
              groups.groups_list([ObjectID(item.object)], null, null, null, null, 2, true, function (err, object) {
                if (object && object[0]) {
                  object[0].item = "lab";
                  cb(err, object[0] ? object[0].groupIndex : {"_id": 0, "name": null, "pic": null});
                } else {
                  cb('Empty lab news');
                }
              });
            } else if (item.verb==1005 || item.verb==6004) {
              positions.positions_list([ObjectID(item.object)], id, 1, 0, false, function (err, object) {
                if (object && object[0]) {
                  object[0].item = "job";
                  cb(err,object[0]);
                } else {
                  cb('Empty job news');
                }
              });
            } else if (item.verb==1006) {
              fundings.fundings_list([ObjectID(item.object)], 1, 0, function (err, object) {
                if (object && object[0]) {
                  object[0].item = "funding";
                  cb(err,object[0]);
                } else {
                  cb('Empty funding news');
                }
              });
            } else if (item.verb==1007) {
              cb(null,{"_id": null, "name": "Gallery", "pic": null}); // DO NOT DELETE
            } else if (item.verb==1008) {
              teachings.teachings_list([ObjectID(item.object)], 0, function (err, object) {
                if (object && object[0]) {
                  object[0].item = "teaching";
                  cb(err,object[0]);
                } else {
                  cb('Empty teaching news');
                }
              });
            } else if (item.verb==1010) {
              cb(null,{"_id": null, "name": "question", "pic": null, "type": "question"}); // DO NOT DELETE
            } else if (item.verb==1011 || item.verb==1012 || item.verb==1013) {
              media.media_list([ObjectID(item.object)], null, 1, 0, function (err, object) {
                if (object && object[0]) {
                  switch (item.verb) {
                    case 1011: object[0].item = "talk"; break;
                    case 1012: object[0].item = "poster"; break;
                    case 1013: object[0].item = "press release"; break;
                  };
                  cb(err,object[0]);
                } else {
                  cb('Empty media news');
                }
              });
            } else if (item.verb==1050 || item.verb==6020) { // item.verb==13001
              peoples.peoples_list([item.object], null, null, 1, null, function (err, object) {
                if (object && object[0]) {
                  object[0].item = "researcher";
                  cb(err,object[0]);
                } else {
                  cb('Empty researcher news');
                }
              });
            } else if (item.verb==1500) { // item.verb==13001
              apps.apps_list([ObjectID(item.object)], null, function (err, object) {
                console.log('item.object:',item.object);
                console.log('app:',object);
                if (object && object[0]) {
                  cb(err,object[0]);
                } else {
                  cb();
                }
              });
            } else if (item.verb==20000) {
              cb(null, {"_id": null, "name": "news", "pic": null}); // DO NOT DELETE
            } else {
              console.log('object:')
              cb();
            }
          },
          target: function (cb) {
            // if (item.target) {
            //   switch (typeSplit) {
            //     // case "user": peoples.peoples_list(item.target, null, null, 1, null, function (err, target) { if (target && target[0]) cb(err,target[0]); else cb(); }); break;
            //     case "user": cb(); break;
            //     case "group": groups.groups_list([ObjectID(item.target)], null, null, null, null, 2, false, function (err, target) { if (target && target[0]) cb(err,target[0]); else cb(); }); break;
            //     case "trend": cb(); break;
            //     case "podcast": podcasts.podcasts_list([ObjectID(item.target)], null, function (err, target) { if (target && target[0]) cb(err,target[0]); else cb(); }); break;
            //     case "event": events.events_list([ObjectID(item.target)], null, function (err, target) { if (target && target[0]) cb(err,target[0]); else cb(); }); break;
            //     case "app": apps.apps_list([ObjectID(item.target)], null, function (err, target) { console.log('app:',target); if (target && target[0]) cb(err,target[0]); else cb(); }); break;
            //   };
            // } else {
              console.log('target:')
              cb();
            // }
          },
          // members: function (cb) {
          //   if (item.members) {
          //     peoples.peoples_list(item.members, null, null, 1, null, function (err, members) {
          //       if (members) cb(err,members); else cb('Empty members news');
          //     });
          //   } else {
          //     cb();
          //   }
          // },
          // commentors: function (cb) {
          //   if (item.latest_reactions && item.latest_reactions.comments) {
          //     peoples.peoples_list(item.latest_reactions.comments.map(r=>r.user_id), null, null, 1, null, function (err, commentors) {
          //       cb(err,commentors);
          //     });
          //   } else {
          //     cb();
          //   }
          // }
        },
        function (err, results) {
          // console.log(key,'pre',items.results[key],'post',results)
          if (err) {
            console.log('err',err)
            callback(err);
          } else {
            // pre.latest_reactions, pre.latest_reactions_extra, pre.own_reactions, pre.reaction_counts, post.commentors
            // post.members
            console.log('results',results)
            switch (type) {
              case 0:
                items.results[key] = {
                  id: items.results[key].id,
                  type: typeName,
                  link: results.actor.name,
                  _id: results.actor._id,
                  name: results.actor.name,
                  pic: results.actor.pic,
                  item: (results.object && results.object.item) ? capitalizeFirstLetter(results.object.item) : null,
                  title: (results.object && results.object.name) ? capitalizeFirstLetter(results.object.name) : null, // "Yahoo News",
                  // country: results.actor.country ? (results.actor.country + ' / ') : null,
                  country: results.actor.country ? (countries[countries.findIndex(y => y.id == results.actor.country)].name + ' / ') : null,
                  // state: (type==0) ? null : results.target.state,
                  // city: (type==0) ? null : results.target.city,
                  university: null,
                  department: null,
                  text: items.results[key].text ? items.results[key].text.toString().replace(/(<([^>]+)>)/gi, "") : null
                }
                break;
              case 1:
                items.results[key] = {
                  id: items.results[key].id,
                  type: typeName,
                  link: (results.target ? typeLink + '/' + results.target.link : null), // groupIndex.group.link,
                  _id: (results.target ? results.target._id : null), // groupIndex.group.link,
                  name: (results.target ? results.target.name : null), // groupIndex.group.name,
                  pic: (results.target ? results.target.pic : null), // groupIndex.group.pic,
                  item: (results.object && results.object.item) ? capitalizeFirstLetter(results.object.item) : null,
                  title: (results.object && results.object.name) ? capitalizeFirstLetter(results.object.name) : null, // "Yahoo News",
                  country: (results.target && results.target.country) ? (results.target.country + ' / ') : null,
                  // state: (type==0) ? null : results.target.state,
                  // city: (type==0) ? null : results.target.city,
                  university: (type==1) ? results.target.groupIndex.university.name + ' / ' : typeLink + ' / ',
                  department: (type==1) ? results.target.groupIndex.department.name : results.target.link,
                  text: items.results[key].text ? items.results[key].text.toString().replace(/(<([^>]+)>)/gi, "") : null
                }
                break;
              case 2:
                items.results[key] = {
                  id: items.results[key].id,
                  type: typeName,
                  link: results.object.name,
                  _id: results.object._id,
                  name: results.object.name,
                  pic: results.object.pic,
                  item: (results.object && results.object.item) ? capitalizeFirstLetter(results.object.item) : null,
                  title: (results.object && results.object.name) ? capitalizeFirstLetter(results.object.name) : null, // "Yahoo News",
                  // country: results.actor.country ? (results.actor.country + ' / ') : null,
                  // country: results.actor.country ? (countries[countries.findIndex(y => y.id == results.actor.country)].name + ' / ') : null,
                  // state: (type==0) ? null : results.target.state,
                  // city: (type==0) ? null : results.target.city,
                  university: null,
                  department: null,
                  text: items.results[key].text ? items.results[key].text.toString().replace(/(<([^>]+)>)/gi, "") : null
                }
                break;
            };

            // items.results[key] = {
            //   id: items.results[key].id,
            //   type: typeName,
            //   link: (type==0) ? results.actor.name : (results.target ? typeLink + '/' + results.target.link : null), // groupIndex.group.link,
            //   _id: (type==0) ? results.actor._id : (results.target ? results.target._id : null), // groupIndex.group.link,
            //   name: (type==0) ? results.actor.name : (results.target ? results.target.name : null), // groupIndex.group.name,
            //   pic: (type==0) ? results.actor.pic : (results.target ? results.target.pic : null), // groupIndex.group.pic,
            //   item: (results.object && results.object.item) ? capitalizeFirstLetter(results.object.item) : null,
            //   title: (results.object && results.object.name) ? capitalizeFirstLetter(results.object.name) : null, // "Yahoo News",
            //   country: (type==0) ? null : ((results.target && results.target.country) ? (results.target.country + ' / ') : null),
            //   // state: (type==0) ? null : results.target.state,
            //   // city: (type==0) ? null : results.target.city,
            //   university: (type==0) ?  null : ((type==1) ? results.target.groupIndex.university.name + ' / ' : typeLink + ' / '),
            //   department: (type==0) ?  null : ((type==1) ? results.target.groupIndex.department.name : results.target.link),
            //   text: items.results[key].text ? items.results[key].text.toString().replace(/(<([^>]+)>)/gi, "") : null
            // }
            callback();
          }
        });
      }, function (err) {
        // if (err) console.error(err.message);
        if (err) {
          console.error(err);
          cb(null, [{"id": items.results[0].id}]);
        } else {
          cb(null, items.results);
        }
      });
    }

  ],
  // 3. callback
  function (err, items) {
    if (err) {
      callback(err);
    } else {
      callback(err, err ? null : items);
    }
  });
};

export function notifications_items(id, offset: number, feedType: string, callback) {
  async.waterfall([

    // 1. get News
    function (cb) {
      // feedType can be: notifications
      var notification = client.feed(feedType, id);

      notification.get({ limit: 10, offset: offset, mark_seen: true})
      // notification.get({ limit: 5 })
        .then(activitiesSuccess)
        .catch(activitiesError);

      function activitiesSuccess(successData) {
        console.log("successData",successData.results[4])
        console.log("successData",successData.results.length)
        cb(null,successData)
      }

      function activitiesError(errorData) {
        console.log('errorData',errorData.error)
        cb(errorData,null)
      }
    },

    // 2. dress Names and Pics
    function (items, cb) {
      async.forEachOf(items.results, function (item, key, callback) {

        async.parallel({

          actor: function (cb) {
            if (item.activities[0].actor) {
              if (item.verb==16101 ||
                  item.verb==16102 ||
                  item.verb==16103 ||
                  item.verb==16202) {
                groups.groups_list([ObjectID(item.activities[0].actor)], null, null, null, null, 2, true, function (err, actor) {
                  cb(err,actor[0] ? actor[0].groupIndex : null);
                });
              } else {
                peoples.peoples_list([item.activities[0].actor], null, null, 1, null, function (err, actor) {
                  cb(err,actor[0]);
                });
              }
            } else {
              cb();
            }
          },

          object: function (cb) {
            // console.log('activities',item.activities[0])
            if (item.verb==1500 ||
                item.verb==3000 || item.verb[0]==4 || item.verb[0]==5 ||
                item.verb==6000 || (item.verb[0]==6 && item.verb[1]==1) ||
                item.verb==10000 || item.verb==10001 || item.verb==10002 ||
                item.verb==11000 || item.verb==11001 || item.verb==11002 ||
                item.verb==13000 || item.verb==13100 || item.verb==1004 || item.verb==1006 ||
                (item.verb[0]==1 && item.verb[1]==6) ||
                (item.verb[0]==1 && item.verb[1]==1)
               ) {
              groups.groups_list([ObjectID(item.activities[0].object)], null, null, null, null, 2, false, function (err, object) {
                cb(err,object[0] ? object[0].groupIndex : {"_id": 0, "name": null, "pic": null});
              });
            } else if (item.verb==3001) { // Admin: improve
            // } else if (item.verb==3001 || item.verb==3002) { // Admin: improve, delete
              groups.groups_list([ObjectID(item.activities[0].object)], null, null, null, null, 2, true, function (err, object) {
                cb(err,object[0] ? object[0].groupIndex : {"_id": 0, "name": null, "pic": null});
              });
            } else if (item.verb==13001 || item.verb==13101 || item.verb==6020) {
              peoples.peoples_list([item.activities[0].object], null, null, 1, null, function (err, object) {
                cb(err,object[0]);
              });
            } else if (item.verb==1001 || item.verb==13002 || item.verb==13102 || item.verb==6001) {
              publications.publications_list([ObjectID(item.activities[0].object)], null, null, 3, 0, false, function (err, object) {
                cb(err,object[0]);
              });
            } else if (item.verb==1002 || item.verb==13003 || item.verb==13103 || item.verb==6002 || (item.verb>=9000 && item.verb<9500)) {
              resources.resources_list([ObjectID(item.activities[0].object)], null, null, 1, 0, false, function (err, object) {
                cb(err,object[0]);
              });
            } else if (item.verb==1003 || item.verb==13004 || item.verb==13104 || item.verb==6003 || (item.verb>=9500 && item.verb<10000)) {
              projects.projects_list([ObjectID(item.activities[0].object)], null, 1, 0, function (err, object) {
                cb(err,object[0]);
              });
            } else if (item.verb==1005 || item.verb==13005 || item.verb==13105 || item.verb==6004) {
              positions.positions_list([ObjectID(item.activities[0].object)], id, 1, 0, false, function (err, object) {
                cb(err,object[0]);
              });
            } else if (item.verb==1010) {
              faqs.faq_list([ObjectID(item.activities[0].object)], 0, function (err, object) {
                cb(err,object[0]);
              });
            } else if (item.verb==1011 || item.verb==1012 || item.verb==1013) {
              media.media_list([ObjectID(item.activities[0].object)], null, 1, 0, function (err, object) {
                cb(err,object[0]);
              });
            } else if (item.verb[0]==1 && item.verb[1]==5) {
              cb(null, {"_id": 1, "name": null, "pic": null});
            } else if (item.verb==1200) {
              cb(null, {"_id": 1, "name": null, "pic": null});
            } else if (item.verb==3002) {
              cb(null, {"_id": 1, "name": null, "pic": null});

            // } else if (item.verb==1004) {
            //   collaborations.collaborations_list([ObjectID(item.activities[0].object)], 1, function (err, object) {
            //     cb(err,object[0]);
            //   });

            // } else if (item.verb==1006) {
            //   fundings.fundings_list([ObjectID(item.activities[0].object)], 1, 0, function (err, object) {
            //     cb(err,object[0]);
            //   });

            // teachings_list

            } else {
              cb();
            }
          },

          target: function (cb) {
            // if (item.verb[0]==1 && item.verb.length==4) {
            //   groups.groups_list([ObjectID(item.activities[0].target)], null, null, null, null, 2, false, function (err, target) {
            //     cb(err,target[0]);
            //   });
            // } else {
              cb();
            // }
          },

          members: function (cb) {
            // if (item.members) {
            //   peoples.peoples_list(item.members.map(id => ObjectID(id)), null, null, 1, null, function (err, members) {
            //     cb(err,members);
            //   });
            // } else {
              cb();
            // }
          }

        },
        function (err, results) {
          console.log('key',key)
          if (err) {
            console.log('err',err)
            callback(err);
          } else {
            items.results[key].actor = results.actor;
            items.results[key].object = results.object;
            items.results[key].target = results.target ? results.target : null;
            items.results[key].members = results.members;

            items.results[key].text = items.results[key].activities[0].text;
            items.results[key].link = items.results[key].activities[0].link;
            items.results[key].pic = items.results[key].activities[0].pic;

            delete items.results[key].activities;

            callback();
          }
        });
      }, function (err) {
        console.log('err',err)
        console.log('items',items)
        if (err) console.error(err.message);
        cb(err, items.results);
      });
    }
  ],
  function (err, items) {
    if (err) {
      callback(err);
    } else {
      callback(err, items);
    }
  });
};

///////////////////////////////////////////////////
///////////////////////////////////////////////////
///////////////////// FOLLOWS /////////////////////
///////////////////////////////////////////////////
///////////////////////////////////////////////////

export function follow_feed(objId: string, actorId: string, mode: number, type: number, callback) {
  const actor = client.feed(mode==100 ? 'notification' : 'timeline', actorId);

  var feedType: string;

  switch (mode) {
    case 0: feedType = 'publications'; break;
    case 1: feedType = 'resources'; break;
    case 2: feedType = 'projects'; break;
    case 3: feedType = 'positions'; break;
    case 4: feedType = 'group'; break;
    case 5: feedType = 'group'; break; // DELETE? // teaching
    case 6: feedType = 'podcast'; break;
    case 7: feedType = 'event'; break;
    case 8: feedType = 'app'; break;
    case 9: feedType = 'user'; break;
    // case 50: feedType = 'new_groups';break;
    // case 51: feedType = 'new_users'; break;
    case 100: feedType = 'private'; break
    case 200: feedType = 'department'; break;
    case 300: feedType = 'university'; break;
  };

  if (type==0) {
    console.log('follow',feedType,objId)
    actor.follow(feedType, objId).then(activitiesSuccess).catch(activitiesError);
  } else {
    console.log('unfollow',feedType,objId)
    actor.unfollow(feedType, objId).then(activitiesSuccess).catch(activitiesError);
  };

  function activitiesSuccess(successData) {
    callback(null)
  };

  function activitiesError(errorData) {
    console.log('errorData_follow_feed',errorData, errorData.error)
    callback(errorData,null)
  };
}

export function follow_many(objId: string, actorId: string, callback) {
  var follows = [
    {'source': 'timeline:'+actorId, 'target': 'group:'+objId},
    {'source': 'notification:'+actorId, 'target': 'private:'+objId}
  ];

  client.followMany(follows).then(activitiesSuccess).catch(activitiesError);

  function activitiesSuccess(successData) {
    callback(null)
  };

  function activitiesError(errorData) {
    callback(errorData,null)
  };
}

// export function follow_global_feeds(actorId: string, callback) {
  // var follows = [
    // {'source': 'timeline:'+actorId, 'target': 'new_groups:global'},
    // {'source': 'timeline:'+actorId, 'target': 'new_users:global'}
  // ];
  // client.followMany(follows).then(activitiesSuccess).catch(activitiesError);
  // client.unfollow(follows).then(activitiesSuccess).catch(activitiesError);
// }

export function follow_groups_feeds(objIds: string[], actorId: string, callback) {
  const objects = objIds.map(id => ({'source': 'timeline:'+actorId, 'target': 'group:'+id}));
  const follows = Object.assign(objects)
  client.followMany(follows).then(activitiesSuccess).catch(activitiesError);

  function activitiesSuccess(successData) {
    callback(null)
  };

  function activitiesError(errorData) {
    console.log('errorData',errorData.error)
    callback(errorData,null)
  };
}

///////////////////////////////////////////////////
///////////////////////////////////////////////////
//////////////////// ACTIVITIES ///////////////////
///////////////////////////////////////////////////
///////////////////////////////////////////////////

export function add_group_activity(actorId: string,
                                  verb: number,
                                  objectId: string,
                                  targetId: string,
                                  foreignId: string,
                                  membersIds: string[],
                                  text: string,
                                  link: string,
                                  pic: string,
                                  mode: number = 3,
                                  callback) {
  add_activity(0, actorId, verb, objectId, targetId, objectId, [], text, link, pic, false, function (err, newsId) {
    add_group_notifications(actorId, verb, objectId, targetId, foreignId, membersIds, text, link, pic, mode, function (err) {
      callback(err)
    })
  });
}

export function add_activity(mode: number,
                             actorId: string,
                             verb: number,
                             objectId: string,
                             targetId: string,
                             foreignId: string,
                             membersIds: string[],
                             text: string,
                             link: string,
                             pic: string,
                             toFlag: boolean = false,
                             callback) {
                              // shares
  var feedType: string;
  switch (mode) {
    case 0: feedType = 'group'; break;
    case 1: break; // projects
    case 2: break; // resources
    case 3: feedType = 'user'; break; // peoples
    case 4: feedType = 'department'; break;
    case 5: feedType = 'university'; break;
    case 7: feedType = 'podcast'; break;
    case 8: feedType = 'event'; break;
    case 9: feedType = 'app'; break;
  }

  // console.log('actorId',actorId)
  // console.log('objectId',objectId)
  // console.log('targetId',targetId)
  // console.log('feedType',feedType)

  var feed = client.feed(feedType, (mode==3) ? actorId : targetId);
  var to = [];
  var now = new Date();

  if (toFlag) {
    if (mode==0) {
      to.push("private:"+targetId); // TBD
    } else if (mode==3) {
      to.push("timeline:"+targetId);
    }
  }

  var activity = {"actor": actorId,
                  "verb": verb,
                  "object": objectId,
                  "target": targetId,
                  "time": now.toISOString(),
                  "foreign_id": foreignId,
                  "members": membersIds,
                  "text": text,
                  "link": link,
                  "pic": pic,
                  "to": to
                 };

  console.log('activity',activity)

  feed.addActivity(activity)
    .then(function(data) {
      callback(null, data.id)
    })
    .catch(function(reason) {
      console.log('reason',reason, reason.error)
      callback(reason.error, null)
    });
}

export function post_activity(activityId: string, text: string, pic: string, callback) {
  var activity = {id: activityId,
                  set: {
                    'text': text,
                    'pic': pic
                    // 'shares': {
                    //   'facebook': '...',
                    //   'twitter': '...'
                    // },
                  },
                  // unset: [
                  //   'daily_likes',
                  //   'popularity'
                  // ]
                 };

  client.activityPartialUpdate(activity)
    .then(function(data) {
      callback()
    })
    .catch(function(reason) {
      console.log('reason',reason.error)
      callback(reason.error)
    });
}

export function delete_activity(activityId: string, targetId: string, mode: number, callback) {
  var feed;

  switch (mode) {
    case 0: feed = client.feed('group', targetId); break;
    case 1: break; // projects
    case 2: break; // resources
    case 3: feed = client.feed('user', targetId); break;  break;
    case 4: feed = client.feed('department', targetId); break;  break;
    case 5: feed = client.feed('university', targetId); break;  break;
  }

  feed.removeActivity(activityId)
    .then(function(data) {
      callback()
    })
    .catch(function(reason) {
      console.log('reason',reason.error)
      callback(reason.error)
    });
}

export function remove_activity(targetId: string, foreignId: string, mode: number, callback) {
  var feedName: string;

  if (mode==0) {
    feedName = 'group';
  } else if (mode==1) {
    feedName = 'notification';
  } else if (mode==2) {
    feedName = 'user';
  };

  async.waterfall([
    // 1. remove activities
    function (cb) {
      var target = client.feed(feedName, targetId);

      target.removeActivity({foreignId: foreignId})
        .then(function(data) {
          cb ()
        })
        .catch(function(reason) {
          cb (reason.error, null)
        });
    }
  ],
  function (err, newsId) {
    if (err) {
      callback(err);
    } else {
      callback(err, err ? null : newsId);
    }
  });

}

///////////////////////////////////////////////////
///////////////////////////////////////////////////
////////////////// Notifications //////////////////
///////////////////////////////////////////////////
///////////////////////////////////////////////////

export function add_group_notifications(actorId: string,
                                        verb: number,
                                        objectId: string,
                                        targetId: string,
                                        foreignId: string,
                                        membersIds: string[],
                                        text: string,
                                        link: string,
                                        pic: string,
                                        mode: number = 3,
                                        callback) {

  async.waterfall([

    // 1. get Members Data
    function (cb) {
      groups.groupMembers(targetId, mode, function (err, peoples) {
        // peopleIds = membersIds.concat(followedIds).concat(actives.map(r => r._id)) // uniq(peopleIds);
        const peoplesIds = peoples.map(r => r._id);
        cb(err, peoplesIds);
      });
    },

    // 2. send Notifications
    function (peoplesIds: string[], cb) {
      async.forEachOf(peoplesIds, function (peopleId, key, callback) {
        if (peopleId==actorId) {
          callback()
        } else {
          add_notification(actorId, verb, objectId, peopleId, objectId, [], text, link, pic, function (err) {
            callback(err)
          });
        }
      }, function (err) {
        cb(err)
      })
    }

  ],
  function (err) {
    callback(err);
  });
}

// TBD: validate: verb==5400
export function add_notification(actorId: string,
                                 verb: number,
                                 objectId: string,
                                 targetId: string,
                                 foreignId: string,
                                 membersIds: string[],
                                 text: string,
                                 link: string,
                                 pic: string,
                                 callback) {

  var now = new Date();

  var activity = {"actor": actorId,
                  "verb": verb,
                  "object": objectId,
                  "target": targetId,
                  "time": now.toISOString(),
                  "foreign_id": foreignId,
                  "members": membersIds,
                  "text": text,
                  "link": link,
                  "pic": pic,
                 };

  async.waterfall([

    function (cb) {
      var userNotifications = client.feed('notification', targetId);

      userNotifications.addActivity(activity)
      .then(function(data) {
        cb (null, data.id)
      })
      .catch(function(reason) {
        console.log('reason',reason.error)
        cb (reason.error, null)
      });
    },

    function (newsId: string, cb) {
      var channel = 'private-notifications-'+targetId;
      server.notifications(channel, activity, function(err) {
        cb(err, newsId)
      });
    }

  ],
  function (err, newsId: string) {
    if (err) {
      callback(err);
    } else {
      callback(err, err ? null : newsId);
    }
  });
}

function capitalizeFirstLetter(string) {
  return string.charAt(0).toUpperCase() + string.slice(1);
}

function invalid_news_name() {
    return backhelp.error("invalid_news_name", "Names can have letters, #s, _ and, -");
}
