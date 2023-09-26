var db = require('../db.ts'),
    async = require('async'),
    backhelp = require("./backend_helpers.ts");

const algoliasearch = require('algoliasearch');
const client = algoliasearch('TDKUK8VW4T', '5d17934a8722069c0ac47bd6b4ae4bda');

var pics = require("./pics.ts");

var emails = require("../misc/emails.ts");
var misc = require("../misc/misc.ts");

import {Event, SubmitEvent} from '../models/events.ts';

var ObjectID = require('mongodb').ObjectID;

exports.version = "0.1.0";

export function event_id(link: string, callback) {
  db.events
    .find({"link": link})
    .project({_id: 1, stage: 1})
    .next().then(function(item) {
      callback(null, (item) ? item._id : null)
      // callback(null, (item && item.stage==1) ? item._id : null)
    });
}

export function event_details(eventId: string, followingsIds: string[], callback) {
  const m = { "$match" : {"_id" : ObjectID(eventId) } };
  const f = { "$project" : { _id: 1, name: 1, link: 1, pic: 1, publicInfo: 1, socialInfo: 1, location: 1, country: 1, state: 1, city: 1, team: 1 } };

  if (followingsIds) {
    db.events.aggregate( [ m, f ] ).map(
     function(u) {
       u.followStatus = followingsIds.toString().includes(u._id.toString());
       return u;
     }
    ).next(callback);
  } else {
    db.events.aggregate( [ m, f ] ).next(callback);
  }
}

export function events_list(eventsIds: string[], followingsIds: string[], callback) {
  var m = { "$match" : {"_id" : { "$in" : eventsIds } } };
  var a = { "$addFields" : { "__order" : { "$indexOfArray" : [ eventsIds, "$_id" ] } } };
  var s = { "$sort" : { "__order" : 1 } };
  var f = ({ "$project" : { _id: 1, name: 1, link: 1, pic: 1, type: 1, description: 1, categories: 1, website: 1, start: 1, end: 1, language: 1, price: 1, location: 1 } });

  if (followingsIds) {
    db.events.aggregate( [ m, a, s, f ] ).map(
     function(u) {
       u.followStatus = followingsIds.toString().includes(u._id.toString());
       return u;
     }
    ).toArray(callback);
  } else {
    db.events.aggregate( [ m, a, s, f ] ).toArray(callback);
  }
}

export function event_home_items(eventId: string, callback) {
  db.events
    .find({ _id: ObjectID(eventId) })
    .project({
      _id: 0,
      description: 1,
      fields: 1,
      categories: 1,

      type: 1,
      website: 1,
      start: 1,
      end: 1,
      language: 1,
      register: 1,
      price: 1
    })
    .next().then(function(items) {
      callback(null, items)
    });
}

export function put_event(event: Event, callback) {
  var data_clone;

  var key: string;
  var collection: string;

  async.waterfall([

    // 1. create Event document
    function (cb) {
      data_clone = JSON.parse(JSON.stringify(event));
      createEventDocument(data_clone, function (err, eventId) {
        cb(err, eventId)
      });
    },

    // 2. create Event algolia
    function (eventId, cb) {
      const object = [{
        objectID: eventId,
        name: event.name,
        link: misc.NFD(event.name),
        pic: event.pic,
        description: event.description,
        // fields: event.fields,
        categories: event.categories,
        type: event.type,
        website: event.website,
        start: event.start,
        end: event.end,
        language: event.language,
        register: event.register,
        price: event.price,
        // country: event.country,
        // state: event.state ? event.state : null,
        // city: event.city ? event.city : null,
        // _geoloc: (event.location && event.location[0]) ? { lat: event.location[0], lng: event.location[1] } : { lat: '', lng: '' }
      }];

      client.initIndex((process.env.PORT) ? 'events': 'dev_events').addObjects(object, (err, content) => {
        cb(err);
      });
    }

  ],
  function (err, eventId) {
    callback(err, err ? null : eventId);
  });

}

// export function post_event(event: Event, callback) {
//
// }
// Organizers
// Speakers
// Sponsors
// Exhibitors

export function delete_event(eventId: string,callback) {
  async.series({

    // 1. delete Pic
    pic: function (cb) {
      db.events
        .find({_id: ObjectID(eventId)})
        .project({ "_id": 0, "pic": 1})
      .next().then(function(item) {
        pics.delete_pic_gallery(item.pic, function(err) {
          cb(err)
        })
      })
    },

    // 2. delete Event
    event: function (cb) {
      db.events.deleteOne(
        { _id: ObjectID(eventId) },
        { safe: true },
        cb()
      );
    },

    // 3. delete from Algolia
    algolia: function (cb) {
      client.initIndex((process.env.PORT ? 'events' : 'dev_events')).deleteObject(eventId, (err, content) => {
        cb(err)
      });
    }

  },
  function (err, results) {
    callback(err);
  });
}

function createEventDocument(data, callback) {
  db.events.insertOne(
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
      "start": data.start,
      "end": data.end,
      "language": data.language,
      "register": data.register,
      // "price": data.price,

      "team": []
    },
    { w: 1, safe: true }, function(err, docsInserted) {
      callback(null, docsInserted.insertedId);
    }
  );
}

export function put_submit_event(userId: string, submitEvent: SubmitEvent, callback) {
  var data_clone;

  async.waterfall([

    // 1. validate data.
    function (cb) {
      try {
        const reqFields: string[] = ["eventName", "eventURL"];
        backhelp.verify(submitEvent, reqFields);
      } catch (e) {
        cb(e);
        return;
      }
      cb(null, submitEvent);
    },

    // 2. create Submit Event document
    function (submit_event_data, cb) {
      data_clone = JSON.parse(JSON.stringify(submit_event_data));
      createSubmitEventDocument(data_clone, function (err, eventId) {
        cb(err, eventId);
      });
    },

    // 3. send Submit Events emails
    function (eventId, cb) {
      emails.submitEvent(data_clone, eventId, function (err) {
        cb(err)
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

function createSubmitEventDocument(data: SubmitEvent, callback) {
  db.events.insertOne(
    {
      "submit": {
        "eventName": data.eventName,
        "eventURL": data.eventURL,
        "eventMarkets": data.eventMarkets,
        "eventType": data.eventType,
        "eventDescription": data.eventDescription,
        "eventBenefits": data.eventBenefits,

        "companyName": data.companyName,
        // "support": data.support

        "email": data.email,
        "twitter": data.twitter,
        "firstName": data.firstName,
        "lastName": data.lastName,
        "role": data.role,

        "goal": data.goal,
        "goalMain": data.goalMain,
        "goalType": data.goalType,
        "priceFull": data.priceFull,

        "referred": data.referred,
        "comments": data.comments,
      }
    },
    { w: 1, safe: true }, function(err, docsInserted) {
      callback(null, docsInserted.insertedId);
    }
  );
}
