var db = require('../db.ts'),
    async = require('async'),
    backhelp = require("./backend_helpers.ts");

var ObjectID = require('mongodb').ObjectID;

var groups = require("./groups.ts");
var peoples = require("./peoples.ts");

var projects = require("./projects.ts");
var fundings = require("./fundings.ts");
var positions = require("./positions.ts");
var resources = require("./resources.ts");
var teachings = require("./teachings.ts");
var galleries = require("./galleries.ts");
var faqs = require("./faqs.ts");
var media = require("./media.ts");

var emails = require("../misc/emails.ts");

exports.version = "0.1.0";

export function post_intelligence_notification(userId: string, groupId: string, itemId: string, ai_total: number, ai_mode: number, callback) {
  var collection: string;
  console.log('userId',userId,'ai_mode',ai_mode,'ai_total',ai_total,'groupId',groupId,'itemId',itemId)

  switch (ai_mode) {
    case 0: collection = "projects"; break;
    // case 1: collection = "publications"; break;
    case 2: collection = "fundings"; break;
    case 3: collection = "positions"; break;
    case 4: collection = "resources"; break;
    case 5: collection = "teachings"; break;
    case 6: collection = "events"; break;
    case 7: collection = "faq"; break;
    case 8: collection = "media"; break;
    case 9: collection = "media"; break;
    case 10: collection = "media"; break;
    case 11: collection = "contacts"; break;
    case 20: // topics
  }

  const ai_title = "popo kook";

  groups.get_group_link(groupId, function(err, linkItem) {
    var groupLink = linkItem.groupIndex.university.link + '/' + linkItem.groupIndex.department.link + '/' + linkItem.groupIndex.group.link;
    peoples.peoples_list(linkItem.peoplesItems.activesIds, linkItem._id, null, 5, true, function (err, peoples) {
      // Extract item info
      // Email types: AI Suggestion Invite, AI Suggestion Basic, AI Suggestion PRO+
      emails.intelligence(peoples[0].name, peoples[0].positions[0].email.address, groupLink,
                          linkItem.groupIndex.group.name, linkItem.groupIndex.university.name,
                          ai_total, ai_mode, ai_title,
                          function (err) {
       callback();
      })
    })
  })

  // originlURL
  // personalText
  // pics
}

export function post_intelligence_decision(userId: string, itemId: string, action: number, mode: number, callback) {
  var collection: string;

  switch (mode) {
    case 0: collection = "projects"; break;
    // case 1: collection = "publications"; break;
    case 2: collection = "fundings"; break;
    case 3: collection = "positions"; break;
    case 4: collection = "resources"; break;
    case 5: collection = "teachings"; break;
    case 6: collection = "events"; break;
    case 7: collection = "faq"; break;
    case 8: collection = "media"; break;
    case 9: collection = "media"; break;
    case 10: collection = "media"; break;
    case 11: collection = "contacts"; break;
  }

  db[collection].findOneAndUpdate(
     {_id: ObjectID(itemId)},
     { $set: { "ai": (action) ? 0 : -1 } },
     { safe: true },
     function(err, doc) {
       if (err) {
         throw err;
       } else if (doc) {
         if (action==1) { // accept
           console.log('doc.value',doc.value)

           var text: string;
           var peopleIds: string[];

           switch (mode) {
             case 0:
               peopleIds = doc.value.people.map(x => x._id);
               projects.push_news(userId, itemId, doc.value.groupId, doc.value.description, peopleIds, function (err) {
                 callback(err);
               })
               break;
             // // case 1: collection = "publications"; break;
             case 2:
               fundings.push_news(userId, itemId, doc.value.groupId, doc.value.description, function (err) {
                 callback(err)
               })
               break;
             case 3:
               positions.push_news(userId, itemId, doc.value.groupId, doc.value.description, doc.value.spotsAvailable, doc.value.stepsDates, function (err) {
                 callback(err)
               })
               break;
             case 4:
               peopleIds = doc.value.people.map(x => x._id);
               resources.push_news(userId, itemId, doc.value.groupId, doc.value.description, peopleIds, function (err) {
                 callback(err)
               })
               break;
             case 5:
               text =  doc.value.name + ': ' + doc.value.description;
               teachings.push_news(userId, itemId, doc.value.parentId, text, function (err) {
                 callback(err)
               })
               break;
             case 6:
               text =  doc.value.title + ': ' + doc.value.description;
               galleries.push_news(userId, itemId, doc.value.groupId, text, doc.value.pics[0].pic, function (err) {
                 callback(err)
               })
               break;
             case 7:
               faqs.push_news(userId, itemId, doc.value.groupId, doc.value.question, doc.value.answer, function (err) {
                 callback(err)
               })
               break;
             case 8:
               peopleIds = doc.value.people.map(x => x._id);
               media.push_news(userId, 1011, itemId, doc.value.groupId, peopleIds, doc.value.text, doc.value.link, function (err) {
                 callback(err)
               })
               break;
             case 9:
               peopleIds = doc.value.people.map(x => x._id);
               media.push_news(userId, 1012, itemId, doc.value.groupId, peopleIds, doc.value.text, doc.value.link, function (err) {
                 callback(err)
               })
               break;
             case 10:
               peopleIds = doc.value.people.map(x => x._id);
               media.push_news(userId, 1013, itemId, doc.value.groupId, peopleIds, doc.value.text, doc.value.link, function (err) {
                 callback(err)
               })
               break;
              default:
                callback();
           }

         } else if (action==0) { // reject
           callback(err);
         }
       }
     }
  )
}

export function post_intelligence_decision_topic(groupId: string, topicId: string, action: number, callback) {
  db.groups.updateOne(
    { _id: ObjectID(groupId), "topicsItems._id": ObjectID(topicId)},
    { $set: {"topicsItems.$.ai": (action) ? 0 : -1 } },
    { safe: true },
    callback()
  )
}
