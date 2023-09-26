var db = require('../db.ts'),
    async = require('async'),
    backhelp = require("./backend_helpers.ts");

var ObjectID = require('mongodb').ObjectID;

var request = require("request");

var peoples = require("./peoples.ts");
var projects = require("./projects.ts");
var resources = require("./resources.ts");

import {objectMini} from '../models/shared.ts';

const algoliasearch = require('algoliasearch');
const client = algoliasearch('TDKUK8VW4T', '5d17934a8722069c0ac47bd6b4ae4bda');

export function put_showcase(items: objectMini[], mode: number, objId: string, callback) {
  var key: string;
  var collection: string;

  if (mode==0) {
    key = "showcases";
    collection = "projects";
  } else if (mode==1) {
    key = "gallery";
    collection = "resources";
  } else if (mode==2) {
    key = "pics";
    collection = "events";
  } else if (mode==3) {
    key = "pics";
    collection = "events";
  } else if (mode==4) {
    key = "pics";
    collection = "departments";
  } else if (mode==5) {
    key = "pics";
    collection = "universities";
  } else if (mode==6) {
    key = "figures";
    collection = "publications";
  };

  items.forEach(
    function(item,index) {
      items[index]._id = ObjectID();
    }
  )

  db[collection].updateOne(
     {_id: ObjectID(objId)},
     { $push: { [key]: { $each: items } } },
     { safe: true },
     callback(null,items.map(r => r._id))
  )
}

export function post_showcase(item: objectMini, mode: number, objId: string, callback) {
  var key: string;
  var collection: string;

  if (mode==0) {
    key = "showcases";
    collection = "projects";
  } else if (mode==1) {
    key = "gallery";
    collection = "resources";
  } else if (mode==2) {
    key = "pics";
    collection = "events";
  } else if (mode==3) {
    key = "pics";
    collection = "events";
  } else if (mode==4) {
    key = "pics";
    collection = "departments";
  } else if (mode==5) {
    key = "pics";
    collection = "universities";
  } else if (mode==6) {
    key = "figures";
    collection = "publications";
  };

  db[collection].updateOne(
     {_id: ObjectID(objId), [key + "._id"]: ObjectID(item._id) },
     { $set: {
         [key + ".$.pic"]: item.pic,
         [key + ".$.name"]: item.name,
       }
     },
     { safe: true },
     callback()
  )
}

export function delete_showcase(objId: string, itemId: string, mode: number, callback) {
  var key: string;
  var collection: string;

  // console.log('aaaa',objId,itemId,mode)

  if (mode==0) {
    key = "showcases";
    collection = "projects";
  } else if (mode==1) {
    key = "gallery";
    collection = "resources";
  } else if (mode==2) {
    key = "pics";
    collection = "events";
  } else if (mode==3) {
    key = "pics";
    collection = "events";
  } else if (mode==4) {
    key = "pics";
    collection = "departments";
  } else if (mode==5) {
    key = "pics";
    collection = "universities";
  } else if (mode==6) {
    key = "figures";
    collection = "publications";
  };

  db[collection]
    .find({_id: ObjectID(objId), [key + "._id"]: ObjectID(itemId) })
    .project({ [key + ".$.pic"]: 1 })
  .next().then(function(item) {
    var pic = item[key][0].pic;
    var groupFlag = pic.slice(-6).substring(0,3);

    if (groupFlag=="nth") {
      get_group_files_info(pic, function(err, uuid) {
        delete_pic_direct_trimmed(uuid, function(err) {
          db[collection].updateOne(
            {_id: ObjectID(objId)},
            { $pull: { [key]: {"_id": ObjectID(itemId) } } },
            { safe: true },
            callback()
          );
        })
      })
    } else {
      delete_pic_direct(pic, function(err) {
        db[collection].updateOne(
          {_id: ObjectID(objId)},
          { $pull: { [key]: {"_id": ObjectID(itemId) } } },
          { safe: true },
          callback()
        );
      })
    }
  })
};

export function post_pics(pic: string, mode: number, itemId: string, callback) {
  var index: number;
  var key: string;
  var collection: string;

  if (mode==0) {
    key = "pic";
    collection = "peoples";
    index=0;
  } else if (mode==1) {
    key = "homePageItems.pic";
    collection = "groups";
    index=0;
  } else if (mode==2) {
    key = "coverPic";
    collection = "peoples";
    index=4;
  } else if (mode==3) {
    key = "pic";
    collection = "projects";
  } else if (mode==4) {
    key = "pic";
    collection = "resources";
  };

  delete_pic(collection, key, itemId, pic, (mode==0 || mode==2), function(err) {
    if (mode==3 || mode==4) {
      db[collection].updateOne(
        { _id: ObjectID(itemId) },
        { $set: { "pic": pic } },
        { safe: true }
      ).then(function() {
        if (mode==3) {
          projects.post_project_name_pic(itemId, 'pic', pic, function (err) {
            callback(err)
          })
        } else if (mode==4) {
          resources.post_resource_pic(itemId, pic, function (err) {
            callback(err)
          })
        }
      })
    } else {
      db[collection].findOneAndUpdate(
        { _id: (mode==1) ? ObjectID(itemId) : itemId },
        { $set: { [key]: pic, ["progress."+index]: pic ? 1 : 0 } },
        function(err, doc) {
          if (mode==0) { // people pic
            peoples.post_people_mini(itemId, null, pic, 1, function (err) {
              callback(err)
            })
          } else if (mode==1) { // group pic
            const algoliaIndex = (doc.value.onBehalf==4 || doc.value.onBehalf==5 || doc.value.onBehalf==7) ? client.initIndex((process.env.PORT) ? 'companies': 'dev_companies') : client.initIndex((process.env.PORT) ? 'labs': 'dev_labs');
            if (doc.value.stage>=2) {
              algoliaIndex.partialUpdateObject({
                objectID: itemId,
                pic: pic
              }, (err, content) => callback(err));
            } else {
              callback()
            }
          } else {
            callback()
          }
        }
      )
    }
  })
}

export function post_textpic(text: string, pic: string, caption: string, mode: number, itemId: string, topicId: string, callback) {
  var index: number;
  var textKey: string;
  var picKey: string;
  var captionKey: string;
  var collection: string;

  if (mode==0) {
    textKey = "background";
    picKey = "backgroundPic";
    captionKey = "backgroundCaption";
    collection = "projects";
  } else if (mode==1) { // algolia
    textKey = "background";
    picKey = "meetClip";
    collection = "peoples";
    index = 2;
  } else if (mode==2) {
    textKey = "contactsPageItems.findUs";
    picKey = "contactsPageItems.findUsPic";
    captionKey = "contactsPageItems.findUsCaption";
    collection = "groups";
    index = 21;
  } else if (mode==3) {
    textKey = "background";
    picKey = "backgroundPic";
    captionKey = "backgroundCaption";
    collection = "resources";
  } else if (mode==4) {
    textKey = "contactsPageItems.findUs";
    picKey = "contactsPageItems.findUsPic";
    captionKey = "contactsPageItems.findUsCaption";
    collection = "departments";
  } else if (mode==5) {
    textKey = "contactsPageItems.findUs";
    picKey = "contactsPageItems.findUsPic";
    captionKey = "contactsPageItems.findUsCaption";
    collection = "universities";
  } else if (mode==6) {
    textKey = "layMan.text";
    picKey = "layMan.pic";
    captionKey = "layMan.caption";
    collection = "groups";
    index = 9; //
  } else if (mode>=7 && mode<=11) {
    textKey = "abstract";
    picKey = "abstractPic";
    collection = "publications";
  } else if (mode==12) { // algolia
    textKey = "description";
    picKey = "descriptionPic";
    captionKey = "descriptionCaption";
    collection = "resources";
  } else if (mode==13) {  // Group Research Topic
    textKey = "background.text";
    picKey = "background.pic";
    captionKey = "background.caption";
    collection = "groups";
    index = 9; //
  } else if (mode==14) {  // Deal background
    collection = "apps";
    textKey = "deal.background.text";
    picKey = "deal.background.pic";
    captionKey = "deal.background.caption";
  } else if (mode==15) {  // Deal clip
    collection = "apps";
    textKey = "deal.clip.text";
    picKey = "deal.clip.pic";
    captionKey = "deal.clip.caption";
  } else if (mode>=16 && mode<=19) {  // Deal blocks
    collection = "apps";
    textKey = "deal.blocks."+(mode-16)+".text";
    picKey = "deal.blocks."+(mode-16)+".pic";
    captionKey = "deal.blocks."+(mode-16)+".caption";
  } else if (mode===20) {  // Mentor introduction
    collection = "mentors";
    textKey = "introduction";
    picKey = "clip";
  }

  // db.groups.updateOne(
  //   { _id: ObjectID(parentId), "topicsItems.name": itemId},
  //    { $set: {"topicsItems.$.background": text } },
  //    { safe: true },
  //    callback()
  // )

  async.waterfall([

    // 1. update Text + Pic
    function (cb) {
      delete_pic(collection, picKey, itemId, pic, (mode==1), function(err) {
        if (mode==6 || mode==13) {
          db[collection].updateOne(
             { _id: ObjectID(itemId), "topicsItems.link": topicId },
             { $set: {
                 ["topicsItems.$."+textKey]: text,
                 ["topicsItems.$."+picKey]: pic,
                 ["topicsItems.$."+captionKey]: caption,
                 ["progress."+index]: (text || pic) ? 1 : 0
               }
             },
             { safe: true },
             cb()
          )
        } else if (mode==1 || mode==2) {
          db[collection].updateOne(
             { _id: (mode==1) ? itemId : ObjectID(itemId) },
             { $set: {
                 [textKey]: text,
                 [picKey]: pic,
                 [captionKey]: caption,
                 ["progress."+index]: (text || pic) ? 1 : 0
               }
             },
             { safe: true },
             cb()
          )
        } else {
          db[collection].updateOne(
             { _id: ObjectID(itemId) },
             { $set: {
                 [textKey]: text,
                 [picKey]: pic,
                 [captionKey]: caption
               }
             },
             { safe: true },
             cb()
          )
        }
      })
    },

    // 2. update Algolia
    function (cb) {
      if (mode==1) {
        client.initIndex((process.env.PORT) ? 'researchers': 'dev_researchers').partialUpdateObject({
          objectID: itemId,
          background: text
        }, (err, content) => {
          cb(err)
        });
      } else if (mode==12) {
        client.initIndex((process.env.PORT) ? 'resources': 'dev_resources').partialUpdateObject({
          objectID: itemId,
          description: text,
        }, (err, content) => {
          cb(err)
        });
      } else {
        cb()
      }
    }

  ],
  function (err) {
    callback(err);
  });

}

///////////////////////////////////
///////////////////////////////////
///////////////////////////////////

export function get_group_files_info(group: string, callback) {
  var uploadCarePublickey: string = process.env.PORT ? "db20eafbf3648a36d4d0" : "c367913a2486a422f3ab";

  var fileIndex = group.slice(-2).substring(0,1);
  var uuid: string;

  var headers = {
      'Content-Type': 'application/json; charset=utf-8',
      'Accept': 'application/json'
  };

  if (group) {
    var options = {
        url: 'https://upload.uploadcare.com/group/info/?pub_key='+uploadCarePublickey+'&group_id=' + group.substring(21,59),
        method: 'GET',
        headers: headers,
    };
    request(options, function (error, response, body) {
      if (error) throw new Error(error);
      uuid = JSON.parse(body).files[fileIndex].uuid
      callback(error, uuid)
    });
  } else {
    callback()
  }
}

export function delete_pic_gallery(group: string, callback) {
  var uploadCarePublickey: string = process.env.PORT ? "db20eafbf3648a36d4d0" : "c367913a2486a422f3ab";

  var headers = {
      'Content-Type': 'application/json; charset=utf-8',
      'Accept': 'application/json'
  };

  if (group) {
    var options = {
        url: 'https://upload.uploadcare.com/group/info/?pub_key='+uploadCarePublickey+'&group_id=' + group.substring(21,59),
        method: 'GET',
        headers: headers,
    };
    request(options, function (error, response, body) {
      if (error) throw new Error(error);
      async.forEachOf(JSON.parse(body).files, function (file, key, cb) {
        delete_pic_direct_trimmed(file.uuid, function(err) {
          cb(err)
        })
      }, function (err) {
        callback(err)
      })
    });
  } else {
    callback()
  }
}

export function delete_pic(collection: string, key: string, itemId: string, newPic: string, mode: boolean, callback) {
  var currentPic;

  db[collection]
    .find({_id: (mode==true) ? itemId : ObjectID(itemId)})
    .project({ [key]: 1 })
   .next().then(function(item) {
     currentPic = nestedKeyResolve(key,item);
     if (currentPic && currentPic!=newPic) {
       delete_pic_direct(currentPic, function(err) {
         callback()
       })
     } else {
       callback()
     }
   })
}

export function delete_pic_direct(pic: string, callback) {
  var uploadCarePublickey: string = process.env.PORT ? "db20eafbf3648a36d4d0" : "c367913a2486a422f3ab";
  var uploadCarePrivatekey: string = process.env.PORT ? "2175c2ed0a31e3deea55" : "f672d6cafcff61eef8ce";

  if (pic) {
    var options = { method: 'DELETE',
      url: 'https://api.uploadcare.com/files/' + pic.substring(21,57) + '/',
      headers: { authorization: 'Uploadcare.Simple ' + uploadCarePublickey + ':' + uploadCarePrivatekey } };

    request(options, function (error, response, body) {
      if (error) throw new Error(error);
      callback()
    });
  } else {
    callback()
  }
}

function delete_pic_direct_trimmed(pic: string, callback) {
  var uploadCarePublickey: string = process.env.PORT ? "db20eafbf3648a36d4d0" : "c367913a2486a422f3ab";
  var uploadCarePrivatekey: string = process.env.PORT ? "2175c2ed0a31e3deea55" : "f672d6cafcff61eef8ce";

  if (pic) {
    var options = { method: 'DELETE',
      url: 'https://api.uploadcare.com/files/' + pic + '/',
      headers: { authorization: 'Uploadcare.Simple ' + uploadCarePublickey + ':' + uploadCarePrivatekey } };

    request(options, function (error, response, body) {
      if (error) throw new Error(error);
      callback()
    });
  } else {
    callback()
  }
}

function upload_pic_direct(pic: string, callback) {
  var uploadCarePublickey: string = process.env.PORT ? "db20eafbf3648a36d4d0" : "c367913a2486a422f3ab";
  var uploadCarePrivatekey: string = process.env.PORT ? "2175c2ed0a31e3deea55" : "f672d6cafcff61eef8ce";

  if (pic) {
    var options = { method: 'PUT',
      url: 'https://api.uploadcare.com/base/' + pic + '/',
      headers: { authorization: 'Uploadcare.Simple ' + uploadCarePublickey + ':' + uploadCarePrivatekey } };

    request(options, function (error, response, body) {
      if (error) throw new Error(error);
      callback()
    });
  } else {
    callback()
  }
}

// https://stackoverflow.com/questions/6491463/accessing-nested-javascript-objects-with-string-key
function nestedKeyResolve(path, obj=self, separator='.') {
    var properties = Array.isArray(path) ? path : path.split(separator)
    return properties.reduce((prev, curr) => prev && prev[curr], obj)
}
