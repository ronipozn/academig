var db = require('../db.ts'),
    async = require('async'),
    backhelp = require("./backend_helpers.ts");

const algoliasearch = require('algoliasearch');
const client = algoliasearch('TDKUK8VW4T', '5d17934a8722069c0ac47bd6b4ae4bda');

var pics = require("./pics.ts");

var emails = require("../misc/emails.ts");
var misc = require("../misc/misc.ts");

import {Podcast, SubmitPodcast} from '../models/podcasts.ts';

var ObjectID = require('mongodb').ObjectID;

exports.version = "0.1.0";

export function podcast_id(link: string, callback) {
  db.podcasts
    .find({"link": link})
    .project({_id: 1, stage: 1})
    .next().then(function(item) {
      callback(null, (item) ? item._id : null)
      // callback(null, (item && item.stage==1) ? item._id : null)
    });
}

export function podcast_details(podcastId: string, followingsIds: string[], callback) {
  const m = { "$match" : {"_id" : ObjectID(podcastId) } };
  const f = { "$project" : { _id: 1, name: 1, link: 1, pic: 1, publicInfo: 1, socialInfo: 1, location: 1, country: 1, state: 1, city: 1, team: 1  } };

  if (followingsIds) {
    db.podcasts.aggregate( [ m, f ] ).map(
     function(u) {
       u.followStatus = followingsIds.toString().includes(u._id.toString());
       return u;
     }
    ).next(callback);
  } else {
    db.podcasts.aggregate( [ m, f ] ).next(callback);
  }
}

export function podcasts_list(podcastsIds: string[], followingsIds: string[], callback) {
  var m = { "$match" : {"_id" : { "$in" : podcastsIds } } };
  var a = { "$addFields" : { "__order" : { "$indexOfArray" : [ podcastsIds, "$_id" ] } } };
  var s = { "$sort" : { "__order" : 1 } };
  var f = ({ "$project" : { _id: 1, name: 1, link: 1, pic: 1, type: 1, website: 1, categories: 1, release: 1, total: 1, description: 1, location: 1 } });

  if (followingsIds) {
    db.podcasts.aggregate( [ m, a, s, f ] ).map(
     function(u) {
       u.followStatus = followingsIds.toString().includes(u._id.toString());
       return u;
     }
    ).toArray(callback);
  } else {
    db.podcasts.aggregate( [ m, a, s, f ] ).toArray(callback);
  }
}

export function podcast_home_items(podcastId: string, callback) {
  async.waterfall([
    function (cb) {
      db.podcasts
        .find({ _id: ObjectID(podcastId) })
        .project({
          _id: 0,
          description: 1,
          fields: 1,
          categories: 1,

          type: 1,
          website: 1,
          release: 1,
          total: 1,
          language: 1,
          latest: 1
        })
        .next().then(function(items) {
          cb(null, items)
        });
    },
    // deal
 ],
 function (err, items) {
   callback(err, items);
 });
}

export function put_podcast(podcast: Podcast, callback) {
  var data_clone;

  var key: string;
  var collection: string;

  async.waterfall([

    // 1. create Podcast document
    function (cb) {
      console.log('podcast',podcast)
      data_clone = JSON.parse(JSON.stringify(podcast));
      createPodcastDocument(data_clone, function (err, podcastId) {
        cb(err, podcastId)
      });
    },

    // 2. create Podcast algolia
    function (podcastId, cb) {
      const object = [{
        objectID: podcastId,
        name: podcast.name,
        link: misc.NFD(podcast.name),
        pic: podcast.pic,
        description: podcast.description,
        // fields: app.fields,
        categories: podcast.categories,
        type: podcast.type,
        website: podcast.website,
        release: podcast.release, // establish
        total: podcast.total, // num_of_episodes
        language: podcast.language,
        latest: podcast.latest
      }];

      client.initIndex((process.env.PORT) ? 'podcasts': 'dev_podcasts').addObjects(object, (err, content) => {
        cb(err);
      });
    }

  ],
  function (err, podcastId) {
    callback(err, err ? null : podcastId);
  });

}

// export function post_podcast(podcast: Podcast, callback) {
//
// }
// Team
// Guests

export function delete_podcast(podcastId: string,callback) {
  async.series({

    // 1. delete Pic
    pic: function (cb) {
      db.podcasts
        .find({_id: ObjectID(podcastId)})
        .project({ "_id": 0, "pic": 1})
      .next().then(function(item) {
        pics.delete_pic_gallery(item.pic, function(err) {
          cb(err)
        })
      })
    },

    // 2. delete Podcast
    podcast: function (cb) {
      db.podcasts.deleteOne(
        { _id: ObjectID(podcastId) },
        { safe: true },
        cb()
      );
    },

    // 3. delete from Algolia
    algolia: function (cb) {
      client.initIndex((process.env.PORT ? 'podcasts' : 'dev_podcasts')).deleteObject(podcastId, (err, content) => {
        cb(err)
      });
    }

  },
  function (err, results) {
    callback(err);
  });
}

function createPodcastDocument(data, callback) {
  db.podcasts.insertOne(
    {
      "name": data.name,
      "link": misc.NFD(data.name),
      "pic": data.pic,
      "description": data.description,
      // "description_long": data.description_long,
      // "fields": data.fields,
      "categories": data.categories,

      "type": data.type,
      "website": data.website,
      "release": data.release,
      "total": data.data,
      "language": data.language,
      "latest": data.latest,

      "team": []
    },
    { w: 1, safe: true }, function(err, docsInserted) {
      callback(null, docsInserted.insertedId);
    }
  );
}

// "deal": {
//   "type": data.type,
//   "status": data.status,
//   "reduced_price": data.reduced_price,
//   "start_date": data.startDate,
//   "end_date": data.endDate,
//   "webinar_date": data.webinarDate,
//   // planTotal: number;
//   // terms: string[];
//   // features: string[];
//   // plans: string[];
// }

export function put_submit_podcast(userId: string, submitPodcast: SubmitPodcast, callback) {
  var data_clone;

  async.waterfall([

    // 1. validate data.
    function (cb) {
      try {
        const reqFields: string[] = ["podcastName", "podcastURL"];
        backhelp.verify(submitPodcast, reqFields);
      } catch (e) {
        cb(e);
        return;
      }
      cb(null, submitPodcast);
    },

    // 2. create Submit Podcast document
    function (submit_podcast_data, cb) {
      data_clone = JSON.parse(JSON.stringify(submit_podcast_data));
      createSubmitPodcastDocument(data_clone, function (err, podcastId) {
        cb(err, podcastId);
      });
    },

    // 3. send Submit Podcast emails
    function (podcastId, cb) {
      emails.submitPodcast(data_clone, podcastId, function (err) {
        cb()
      });
    }

  ],
  function (err) {
    if (err) {
      callback(err);
    } else {
      callback(err, null);
    }
  });

}

function createSubmitPodcastDocument(data: SubmitPodcast, callback) {
  db.podcasts.insertOne(
    {
      "submit": {
        "podcastName": data.podcastName,
        "podcastURL": data.podcastURL,
        "podcastMarkets": data.podcastMarkets,
        "podcastType": data.podcastType,
        "podcastDescription": data.podcastDescription,
        "podcastBenefits": data.podcastBenefits,
        "podcastYear": data.podcastYear,
        "podcastUsers": data.podcastUsers,

        "email": data.email,
        "twitter": data.twitter,
        "firstName": data.firstName,
        "lastName": data.lastName,
        "role": data.role,

        "goal": data.goal,

        "referred": data.referred,
      }
    },
    { w: 1, safe: true }, function(err, docsInserted) {
      callback(null, docsInserted.insertedId);
    }
  );
}
