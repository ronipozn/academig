var db = require('../db.ts'),
    async = require('async'),
    backhelp = require("./backend_helpers.ts");

var ObjectID = require('mongodb').ObjectID;

var groups = require("./groups.ts");
var projects = require("./projects.ts");
var peoples = require("./peoples.ts");
var news = require("./news.ts");
var messages = require("./messages.ts");
var shared = require("./shared.ts");
var pics = require("./pics.ts");

var emails = require("../misc/emails.ts");

import { Expertise, Availability, OnGoing } from '../models/mentors.ts';
import { objectMini } from '../models/shared.ts';
import { Message } from '../models/messages.ts';

if (process.env.PORT) {
  var stripe = require("stripe")("sk_live_cX9wuWcR9lIBXPhAh206GjKb");
} else {
  var stripe = require("stripe")("sk_test_7EVILWvlgJHlUNOh58DBJVe4");
}

import {Mentor, SubmitMentor} from '../models/mentors.ts';

const algoliasearch = require('algoliasearch');
const client = algoliasearch('TDKUK8VW4T', '5d17934a8722069c0ac47bd6b4ae4bda');

const algoliaIndex = (process.env.PORT) ? client.initIndex('mentors') : client.initIndex('dev_mentors');

let serviceTypes = {
                    10: 'Analysis Service',
                    20: 'Mathematical Models',
                    30: 'Forecasting and Prediction',
                    40: 'Biostatistics',
                    50: 'Clinical Trials',
                    60: 'Scientific Consulting',
                    70: 'Medical Devices',
                    80: 'Clinical Research Development',
                    90: 'Food Science',
                    100: 'Food Technology',
                    110: 'Scientific Law',
                    120: 'Biotechnology',
                    130: 'Robotics',
                    140: 'Artificial Intelligence',
                    150: 'Synthesis Service',
                    160: 'Measurements Service',
                    170: 'Lab Equipment',
                    180: 'Calibration Service',
                    190: 'Lab Supply',
                    200: 'Software',
                    210: 'Simulation',
                    220: 'Prototyping',
                    230: 'Business Service',
                    240: 'Management Service',
                    250: 'Labeling Service',
                    260: 'Training Service',
                    270: 'Scientific Writing',
                    280: 'Visual Communication',
                    290: 'Scientific Editing',
                    300: 'Facilities'
                  };

exports.version = "0.1.0";

/////////////////////////////////////
/////////////////////////////////////
/////////////////////////////////////
/////////////////////////////////////

export function mentors_list(mentorsIds: string[], userId: string, adminFlag: boolean, callback) {
  var m = { "$match" : { "_id" : { "$in" : mentorsIds } } };
  var a = { "$addFields" : { "__order" : { "$indexOfArray" : [ mentorsIds, "$_id" ] } } };
  var s = { "$sort" : { "__order" : 1 } };
  var f = {
            "$project" : {
              _id: 1, name: 1, pic: 1, description: 1,
              // views: 1
              // sessions: {
              //         $filter: {
              //            input: "$sessions",
              //            as: "session",
              //            cond: { $eq: [ "$$session.userId", userId ] }
              //         }
            }
          }

  db.mentors.aggregate( [ m, a, s, f ] ).toArray(callback);
}

export function mentor_details(mentorId: string, adminFlag: boolean, userId: string, callback) {
  const m = {
              "$match" : {
                "userId" : mentorId,
                // "payment": (adminFlag==true) ? {$in: [false, true]} : {$in: [true]},
                "status": (adminFlag==true) ? {$in: [0, 1, 2, 3, 4, 5]} : {$in: [3]},
                  // 0: Invite Requestd
                  // 1: Form Submitted
                  // 2. Approved
                  // 3: Active
                  // 4: On Hold
                  // 5. Declined
                  // 6: Deleted
              }
            };

  const f = {
             "$project" : {
                           // standout: 1, payment: 1,
                           created_on: 1, status: 1,
                           expertises: 1, toolkits: 1,
                           introduction: 1, clip: 1,
                           links: 1, faqsIds: 1,
                           availability: 1,
                           ongoing: 1,
                           // sessions: {
                           //            $filter: {
                           //              input: "$sessions",
                           //              as: "session",
                           //              cond: { $eq: [ "$$session.userId", userId ] }
                           //            }
                           //           }
             }
            };

  db.mentors.aggregate( [ m, f ] ).next(callback);
}

/////////////////////////////////////
/////////////////////////////////////
/////////////// Submit //////////////
/////////////////////////////////////
/////////////////////////////////////

export function put_submit_mentor(userId: string, submitMentor: SubmitMentor, callback) {
  var data_clone;

  async.waterfall([

    // 1. validate data.
    function (cb) {
      try {
        console.log('submitMentor',submitMentor)
        const reqFields: string[] = ["first_name", "last_name"];
        backhelp.verify(submitMentor, reqFields);
      } catch (e) {
        cb(e);
        return;
      }
      cb(null, submitMentor);
    },

    // 2. create Submit App document
    function (submit_mentor_data, cb) {
      data_clone = JSON.parse(JSON.stringify(submit_mentor_data));
      if (userId) {
        updateSubmitMentorDocument(userId, data_clone, function (err, mentorSubmitId) {
          cb(err, mentorSubmitId)
        });
      } else {
        createSubmitMentorDocument(data_clone, function (err, mentorSubmitId) {
          cb(err, mentorSubmitId)
        });
      }
    },

    // 3. send Submit Mentor email
    function (mentorSubmitId, cb) {
      emails.submitMentor(data_clone, mentorSubmitId, function (err) {
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

function updateSubmitMentorDocument(userId, data: SubmitMentor, callback) {
  db.mentors.findOneAndUpdate(
    { "userId": userId, "status": { $lte: 1 } },
    { $set:
      {
        "status": 1,
        "submit": {
          "first_name": data.first_name,
          "last_name": data.last_name,
          "linkedin": data.linkedin,
          "position": data.position,
          "experience": data.experience,
          "charging": data.charging,
          "charing_importance": data.charing_importance,
          "pitch": data.pitch,
          "price_hour": data.price_hour,
          "charging_terms":data.charging_terms,
          "background_terms": data.background_terms,

          "academic_writing": data.background_terms,

          'hours': data.background_terms,
          'past_mentoring': data.background_terms,
          'communication_tool': data.background_terms,
          'description': data.background_terms,
          'mindset': data.background_terms,
          'desired_topic': data.background_terms,
          'out_of_the_box': data.background_terms,
          'content': data.background_terms,

          // standout: data.standout,
          "feedback": data.feedback
        }
      }
    },
    { projection: { "_id": 1 } }
  ).then(function(item) {
    console.log('item',item)
    callback(null, item.value._id)
  })
}


function createSubmitMentorDocument(data: SubmitMentor, callback) {
  db.mentors.insertOne(
    {
      "status": 1,
      "submit": {
        "first_name": data.first_name,
        "last_name": data.last_name,
        "linkedin": data.linkedin,
        "position": data.position,
        "experience": data.experience,
        "charging": data.charging,
        "charing_importance": data.charing_importance,
        "pitch": data.pitch,
        "price_hour": data.price_hour,
        "charging_terms":data.charging_terms,
        "background_terms": data.background_terms,

        "academic_writing": data.background_terms,

        'hours': data.background_terms,
        'past_mentoring': data.background_terms,
        'communication_tool': data.background_terms,
        'description': data.background_terms,
        'mindset': data.background_terms,
        'desired_topic': data.background_terms,
        'out_of_the_box': data.background_terms,
        'content': data.background_terms,

        // standout: data.standout,
        "feedback": data.feedback,
      }
    },
    { w: 1, safe: true }, function(err, docsInserted) {
      callback(null, docsInserted.insertedId);
    }
  );
}

/////////////////////////////////////
/////////////////////////////////////
////////////// Create ///////////////
/////////////////////////////////////
/////////////////////////////////////

export function put_mentor(userId: string, email: string, firstName: string, lastName: string, callback) {
  async.waterfall([

    // "created_on": new Date()
    // "pin": (data.standout==3) ? 1 : 0

    // 1. create Mentor Document (Flag)
    function (cb) {
      console.log('put_mentor_1')
      db.mentors.insertOne(
       {
        "userId": userId,
        "status": 0, // Invite Requestd
        "emails": [],

        "introduction": null,
        "clip": null,
        "expertises": [],
        "toolkits": [],
        "links": [],
        "faqsIds": [],

        // availability:
        // "price": data.price // priceObj
        // "time": data.time
        // "days": data.days
        // "communication_tools": "communication_tools"

        // "coaching": data.coaching

        // "sessions": data.sessions
        // "reviews": [],
        // "rating": data.rating
       },
       { w: 1, safe: true }, function(err, docsInserted) {
         cb(err, docsInserted.insertedId);
       }
     );
    },

    // 2. update Personal Profile
    function (mentorId: string, cb) {
      console.log('put_mentor_2')
      db.peoples.updateOne(
        {_id: userId },
        { $set: { "mentorId": ObjectID(mentorId) } },
        { safe: true },
        cb(null, mentorId)
      )
    },

    // 3. send Mentor application (Flag)
    function (mentorId: string, cb) {
      console.log('put_mentor_3')
      emails.mentorInviteEmail(userId, firstName+lastName, email, mentorId, function (err) {
        cb(err, mentorId);
      })
    }

  ],
  function (err, mentorId) {
    if (err) {
      callback(err);
    } else {
      callback(err, mentorId);
    }
  });
}

/////////////////////////////////////
/////////////////////////////////////
////////////// Update ///////////////
/////////////////////////////////////
/////////////////////////////////////

export function post_mentor(mentorId: string, mode: number, callback) {
  async.waterfall([

    // 1. Put on hold = 0 / Deleted = 2:
    //    Update Sessions Mode (Request / Can't Request + Algolia)
    function (cb) {
      db.mentors.updateOne(
         {_id: ObjectID(mentorId)},
         { $set: { "mode": mode } },
         { multi: false, safe: true },
       ).then(function() {
         algoliaIndex.partialUpdateObject({
           objectID: mentorId,
           mode: mode
         }, (err, content) => {
           cb(err, mentorId)
         });
       })
    }

    // 2. push Notification
    // function (mentorId: string, cb) {
      // mentor_notify(userId, null, positionId, 0, mode, function (err) {
        // cb(err, mentorId)
      // })
    // }

  ],
  function (err, mentorId: string) {
    if (err) {
      callback(err);
    } else {
      callback(err, err ? null : mentorId);
    }
  });
};

export function post_availability(availabilityObj: Availability, itemId: string, callback) {
  db.mentors.findOneAndUpdate(
    { _id: ObjectID(itemId) },
    { $set:
      {
        "availability": availabilityObj ? {
          'price': availabilityObj.price,
          'durations': availabilityObj.durations,
          'times': availabilityObj.times,
          'days': availabilityObj.days,
          'tools': availabilityObj.tools,
          'availability': availabilityObj.availability,
        } : null,
      }
    },
    function(err, doc) {
      algoliaIndex.partialUpdateObject({
        objectID: itemId,
        availability: availabilityObj
      }, (err, content) => {
        callback()
      });
    }
  )
};

export function put_expertise(expertise: Expertise, mentorId: string, type: number, callback) {
  const expertiseType: string = (type==0) ? "expertises" : "toolkits";
  expertise._id= ObjectID().toString();

  db.mentors.updateOne(
     {_id: ObjectID(mentorId)},
     { $push:
       {
         [expertiseType]: {
           "_id": expertise._id,
           "name": expertise.name,
           "years": expertise.years,
           "description": expertise.description,
         }
       }
     },
     { safe: true },
     callback(null, expertise._id)
  )
}

export function post_expertise(expertise: Expertise, mentorId: string, type: number, callback) {
  const expertiseType: string = (type==0) ? "expertises" : "toolkits";
  db.mentors.updateOne(
     { _id: ObjectID(mentorId), [expertiseType+"._id"]: expertise._id },
     { $set:
       {
         [expertiseType+".$.name"]: expertise.name,
         [expertiseType+".$.years"]: expertise.years,
         [expertiseType+".$.description"]: expertise.description,
       },
     },
     { safe: true },
     callback()
  )
}

export function delete_expertise(id: string, mentorId: string, type: number, callback) {
  const expertiseType: string = (type==0) ? "expertises" : "toolkits";

  db.mentors.updateOne(
    {_id: ObjectID(mentorId)},
    { $pull: { [expertiseType]: {"_id": id } } },
    { multi: false, safe: true },
    callback()
  )
}

/////////////////////////////////////
/////////////////////////////////////
///////// Ongoing Coaching //////////
/////////////////////////////////////
/////////////////////////////////////

export function post_ongoing(ongoingObj: OnGoing, itemId: string, callback) {
  db.mentors.findOneAndUpdate(
    { _id: ObjectID(itemId) },
    { $set:
      {
        "ongoing": ongoingObj ? {
          'price': ongoingObj.price,
          'hours': ongoingObj.hours,
          'details': ongoingObj.details,
        } : null,
      }
    },
    function(err, doc) {
      algoliaIndex.partialUpdateObject({
        objectID: itemId,
        ongoing: ongoingObj
      }, (err, content) => {
        callback()
      });
    }
  )
}

// Create Stripe On-Going Coaching Product + Price (3% Comission)
// function (name: string, price: number, cb) {
//   payments.create_product(name, function (err, product) {
//     // console.log('product',product)
//     payments.create_pricing(product.id, price, function (err, pricing) {
//       // console.log('pricing',pricing)
//       db.mentors.updateOne(
//         { userId: userId },
//         { $set: {
//             "stripe": {
//               "productId": product.id,
//               "pricingId": pricing.id
//             }
//           }
//         },
//         { safe: true },
//         cb()
//       )
//     })
//   })
// },

// Archive stripe product if exit from ongoing coaching

////////////////////////////////////
////////////////////////////////////
///////////// Sessions /////////////
////////////////////////////////////
////////////////////////////////////

export function post_session(text: string, userId: string, mentorId: string, callback) {
  async.waterfall([

    function (cb) {
      db.mentors
        .find({_id: ObjectID(mentorId) })
        .project({ people: 1 })
      .next().then(function(item) {
        cb(null, item.people.map(r => r._id))
      })
    },

    // 2. check channel existent
    function (peopleIds: string[], cb) {
      db.channels.findOne(
        { "users._id": { $all: peopleIds }, "mode": 2, parentId: ObjectID(mentorId)  }
      ).then(function(item) {
        // console.log('item',item)
        cb(null, (item==null) ? peopleIds : null, (item==null) ? null : item._id );
      })
    },

    function (peopleIds: string[], existChannelId: string, cb) {
      if (peopleIds) {
        messages.createChannelDocument([userId].concat(peopleIds), ObjectID(mentorId), 2, function (err, channelId) {
          const message: Message = {
            _id: null,
            type: 0,
            userId: userId,
            text: text,
            file: null,
            date: new Date()
          }
          messages.put_message(message, channelId, userId, null, [], 0, function(err) {
            cb(err, peopleIds, channelId)
          })
        });
      } else {
        cb(null, null, existChannelId)
      }
    },

    function (peopleIds: string[], channelId: string, cb) {

      if (peopleIds) {

        async.parallel({

          mentor: function (callback) {
            db.mentors.updateOne(
               { _id: ObjectID(mentorId) },
               { $push:
                 {
                   "sessions": {
                     "userId": userId,
                     "channelId": ObjectID(channelId),
                     "date": new Date(),
                   },
                 },
               },
               { safe: true },
               callback()
            );
          },

          people_sessions: function (callback) {
            db.peoples.updateOne(
               { _id: userId },
               {
                $push: {
                   "sessions": {
                      $each: [ ObjectID(mentorId) ],
                      $position: 0
                   },
                   "channelsSessionsIds": {
                      $each: [ ObjectID(channelId) ],
                      $position: 0
                   }
                }
               },
               // { $push:
               //   {
               //     "sessions": ObjectID(mentorId),
               //     "channelsSessionsIds": ObjectID(channelId),
               //   },
               // },
               { safe: true },
               callback()
            );
          },

          people_admins: function (callback) {
            console.log('peopleIds',peopleIds)
            db.peoples.updateMany(
               {_id: {$in: peopleIds}},
               {
                $push: {
                   "channelsSessionsIds": {
                      $each: [ ObjectID(channelId) ],
                      $position: 0
                   }
                }
               },
               { multi: true, safe: true },
               callback()
            )
          }

        },
        function (err) {
          cb(err, channelId);
        });

      } else {

        cb(null, channelId)

      }
    }

  ],
  function (err, channelId) {
    if (err) {
      callback(err);
    } else {
      callback(err, err ? null : channelId);
    }
  });
}

export function channel_items(mentorId, callback) {
  db.mentors
    .find({_id: ObjectID(mentorId)})
    .project({ "sessions": 1 })
  .next().then(function(item) {
    callback(null, item.sessions.map(r => r.channelId))
  })
}

function invalid_mentor_name() {
    return backhelp.error("invalid_mentor_name", "Group names can have letters, #s, _ and, -");
}
