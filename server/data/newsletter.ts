var db = require('../db.ts'),
    async = require('async'),
    backhelp = require("./backend_helpers.ts");

var fs = require('fs');
var path = require('path');
var moment = require('moment');

var misc = require("../misc/misc.ts");

var ObjectID = require('mongodb').ObjectID;

import { objectMini, complexName, groupComplex, Countries } from '../models/shared.ts';

var groups = require("./groups.ts");
var peoples = require("./peoples.ts");
var news = require("./news.ts");

var sendgrid = require("../misc/sendgrid.ts");
var emails = require("../misc/emails.ts");

const algoliasearch = require('algoliasearch');
const client = algoliasearch('TDKUK8VW4T', '5d17934a8722069c0ac47bd6b4ae4bda');

import UploadClient from '@uploadcare/upload-client'

const AWS = require('aws-sdk');

const ID = 'AKIAJDHY2ZWAUJD24HTA';
const SECRET = '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';
// const BUCKET_NAME = 'test-bucket';

const s3 = new AWS.S3({
    accessKeyId: ID,
    secretAccessKey: SECRET
});

exports.version = "0.1.0";

export function story_details(userId: string, year: number, month: number, day: number, topic: string, callback) {
  const m = { date: year + '/' + month + '/' + day, topic: topic };
  const p = { _id: 0,  date: 1, topic: 1, category: 1, pic: 1, author: 1, text: 1 };

  // inc Views
  db.stories.find(m).project(p).next(callback);
}

export function put_story(userMini: objectMini, data, callback) {
  async.waterfall([

    // 1. Upload Pic
    function (cb) {
      if (data.pic) {
        const uploadCarePublickey: string = process.env.PORT ? "db20eafbf3648a36d4d0" : "c367913a2486a422f3ab";
        const client = new UploadClient({ publicKey: uploadCarePublickey })
        const fileUpload = client.uploadFile(data.pic, null)
        fileUpload.then(
          file => {
            data.pic = 'https://ucarecdn.com/'+file.uuid+'/original';
            cb()
          }
        )
      } else {
        cb()
      }
    },

    // 2. Algolia
    function (cb) {
      const objectStory = {
        "date": moment().format('YYYY/MM/DD'),
        "topic": data.topic,
        "category": data.category,
        "pic": data.pic,
        "author": userMini,
        "views": 0
      }
      client.initIndex((process.env.PORT) ? 'stories': 'dev_stories').addObjects([objectStory], (err, content) => {
        cb(err);
      });
    },

    // 3. Text
    function (cb) {
      db.stories.insertOne(
        {
          "date": moment().format('YYYY/MM/DD'),
          "topic": data.topic,
          "category": data.category,
          "pic": data.pic,
          "author": userMini,
          "text": data.text
         },
         { safe: true },
         cb()
      )
    }

  ],
  function (err) {
    callback(err);
  });

}

export function put_daily(data, callback) {
  console.log('process.cwd()',process.cwd())
  console.log('__dirname',__dirname)
  // https://sendgrid.com/docs/API_Reference/Web_API_v3/Marketing_Campaigns/campaigns.html#Create-a-Campaign-POST
  // sendgrid.postCampaign(function (err) cb(err) })

  fs.readFile('academig_daily_template.html', 'utf8', function (err,template_data) {
    if (err) return console.log(err);
    var result = template_data.replace(new RegExp('newsletter_date', 'g'), moment().format('MMMM DD, YYYY'));

    async.waterfall([

      // 1. News
      function (cb) {
        console.log('NL1')
        var objectNews = [];
        data.news.forEach((news, index) => {
          objectNews.push({
            created_on: new Date(),
            topic: news.topic,
            link: news.link,
            pic: news.pic,
            date: news.date,
            website: news.website,
            source: news.source,
            author: {
              name: news.authorName,
              link: news.authorLink,
            },
            description: news.description,
            categories: news.categories ? news.categories.split(",") : null,
          });
          result = result.replace('news_topic_'+index, news.topic);
          result = result.replace('news_link_'+index, news.link);
          result = result.replace('news_category_'+index, news.categories ? news.categories.split(",")[0] : null);
          result = result.replace('news_description_'+index, news.description);
        })
        client.initIndex((process.env.PORT) ? 'news': 'dev_news').addObjects(objectNews, (err, content) => {
          cb(err);
        });
      },

      // 2. Searches and Lists
      function (cb) {
        console.log('NL2')
        var objectLists = [];
        data.lists.forEach((list, index) => {
          objectLists.push({
            "created_on": new Date(),
            "name": list.name,
            "params": 'https://www.academig.com/search/'+list.params,
            "type": list.type,
            "entries": list.entries
          });
          result = result.replace('list_name_'+index, list.name);
          result = result.replace('list_params_'+index, 'https://www.academig.com/search/'+list.params);
          result = result.replace('list_type_'+index, list.type);
          result = result.replace('list_entries_'+index, list.entries);
        })
        db.featured.insertMany(
          objectLists,
          { safe: true },
          cb()
        )
      },

      // 3. Trends
      function (cb) {
        console.log('NL3')
        var objectTrends = [];
        data.trends.forEach((trend, index) => {
          objectTrends.push({
            created_on: new Date(),
            topic: trend.topic,
            pic: trend.pic,
            source: trend.source,
            types: trend.types,
            clips: trend.clips,
            description: trend.description,
            subs: trend.subs,
            categories: trend.categories
          });
          result = result.replace('trend_topic_'+index, trend.topic);
          result = result.replace(new RegExp('trend_clip_'+index, 'g'), trend.clips ? trend.clips.split(",")[0] : null);
          result = result.replace('trend_description_'+index, trend.description);
          result = result.replace('trend_pic_'+index, trend.pic);
        })
        client.initIndex((process.env.PORT) ? 'trends': 'dev_trends').addObjects(objectTrends, (err, content) => {
          cb(err);
        });
      },

      // 4. Labs
      function (cb) {
        console.log('NL4')
        data.labs.forEach((lab, index) => {
          result = result.replace('lab_link_'+index, lab.link);
          result = result.replace('lab_name_'+index, lab.lab);
          result = result.replace('discipline_name_'+index, lab.discipline);
          result = result.replace('university_name_'+index, lab.university);
          result = result.replace('lab_country_'+index, lab.country);
        })
        cb(err);
      },

      // 5. Apps
      function (cb) {
        console.log('NL5')
        data.apps.forEach((app, index) => {
          result = result.replace('app_company_'+index, app.companyName);
          result = result.replace('app_name_'+index, app.appName);
          result = result.replace('app_link_'+index, misc.NFD(app.appName));
          // result = result.replace('app_link_'+index, app.link);
          result = result.replace('app_category_'+index, app.category);
          result = result.replace('app_description_'+index, app.description);
        })
        cb(err);
      },

      // 6. Podcasts
      function (cb) {
        console.log('NL6')
        data.podcasts.forEach((podcast, index) => {
          result = result.replace('podcast_name_'+index, podcast.podcastName);
          result = result.replace('podcast_link_'+index, misc.NFD(podcast.podcastName));
          result = result.replace('podcast_episode_name_'+index, podcast.episodeName);
          result = result.replace('podcast_episode_link_'+index, podcast.episodeLink);
          result = result.replace('podcast_category_'+index, podcast.category);
          result = result.replace('podcast_description_'+index, podcast.description);
        })
        cb(err);
      },

      // 7. Events
      function (cb) {
        console.log('NL7')
        var objectEvents = [];
        data.events.forEach((event, index) => {
          result = result.replace('event_name_'+index, event.name);
          result = result.replace('event_link_'+index, misc.NFD(event.name));
          // result = result.replace('event_link_'+index, event.link);
          result = result.replace('event_category_'+index, event.category);
          result = result.replace('event_startDate_'+index, event.startDate);
          result = result.replace('event_endDate_'+index, event.endDate);
        })
        client.initIndex((process.env.PORT) ? 'events': 'dev_events').addObjects(objectEvents, (err, content) => {
          cb(err);
        });
      },

      // 8. Quote
      function (cb) {
        console.log('NL8')
        var objectQuotes = [];
        data.quotes.forEach((quote, index) => {
          objectQuotes.push({
            quote: quote.quote,
            author: {
              name: quote.authorName,
              pic: quote.authorPic
            },
            tags: quote.tags,
            // year: quote.year
          });
          result = result.replace('quote_'+index, quote.quote);
          result = result.replace('quote_author_name_'+index, quote.authorName);
          result = result.replace('quote_author_pic_'+index, quote.authorPic);
        })
        client.initIndex((process.env.PORT) ? 'quotes': 'dev_quotes').addObjects(objectQuotes, (err, content) => {
          cb(err);
        });
      },

      // 9. Create Campaign HTML
      function (cb) {
        console.log('NL9')
        // https://stackoverflow.com/questions/1144783/how-to-replace-all-occurrences-of-a-string
        const filename = 'academig_daily_'+ moment().format('YYYY MM DD').toLowerCase().split(' ').join('_') + '.html';
        const dailylink = moment().format('YYYY MM DD').split(' ').join('/')
        result = result.replace(new RegExp('dailylink', 'g'), dailylink);
        result = result.replace(new RegExp('title_0', 'g'), data.title);
        result = result.replace(new RegExp('sub_title_0', 'g'), data.sub_title);
        s3.putObject({
          Bucket: 'academig-daily',
          Key: filename,
          Body: result,
          ContentType: "application/html"},
          function (err,data) {
            console.log(JSON.stringify(err) + " " + JSON.stringify(data));
            cb(err)
          }
        );
        // console.log('process.cwd()',process.cwd(), __dirname',__dirname)
        // https://sendgrid.com/docs/API_Reference/Web_API_v3/Marketing_Campaigns/campaigns.html#Create-a-Campaign-POST: sendgrid.postCampaign(function (err) { cb(err) })
        // fs.writeFile(filename, result, 'utf8', function (err) {
        //   if (err) return console.log(err);
        //   const uploadCarePublickey: string = process.env.PORT ? "db20eafbf3648a36d4d0" : "c367913a2486a422f3ab";
        //   const client = new UploadClient({ publicKey: uploadCarePublickey })
        //   const fileUpload = client.uploadFile(__dirname + filename, null)
        //   fileUpload.then( file => { cb() })
        // });
      },

      // 10. Algolia Item
      function (cb) {
        console.log('NL10')
        const objectDaily = {
          "date": moment().format('YYYY/MM/DD'),
          "headline": data.title,
          "sub_headline": data.sub_title,
        }
        client.initIndex((process.env.PORT) ? 'daily': 'dev_daily').addObjects([objectDaily], (err, content) => {
          cb(err);
        });
      }

    ],
    function (err) {
      callback(err);
    });

  })
};

// const uploadFile = (fileName) => {
//     // Read content from the file
//     const fileContent = fs.readFileSync(fileName);
//
//     // Setting up S3 upload parameters
//     const params = {
//         Bucket: BUCKET_NAME,
//         Key: 'cat.jpg', // File name you want to save as in S3
//         Body: fileContent
//     };
//
//     // Uploading files to the bucket
//     s3.upload(params, function(err, data) {
//         if (err) {
//             throw err;
//         }
//         console.log(`File uploaded successfully. ${data.Location}`);
//     });
// };

// schedule function every few days (rand) (pintrest style)
// export function newsletter_emails(userId: string, callback) {
//   // 10. Send Emails
//   function (cb) {
//     // News Authors
//     // Labs Owners
//     // Apps Contact Us
//     // Podcasts Contact Us
//     // Events Contact Us
//     cb()
//   }
// }

export function recommended_labs(userId: string, callback) {
  // Headlines:
  // Hey, Rony! Don't miss out on these Labs… --- We found some fresh Pins for you -- See more Labs
  // We think you might like these Labs -
  // New ideas are ready for you --- This just in: 16 new Pins!	--- See what else is new (btn)

  // 1. fit user' discipline & keywords forEachOf
  // db.peoples.updateOne(
  //   { _id: people._id },
  //   { $push: {
  //       "recommended": {
  //         "_id": groupId,
  //         "groupIndex": groupIndex1,
  //         "interests": interests1,
  //         "background": background1
  //       },
  //       {
  //         "_id": groupId,
  //         "groupIndex": groupIndex2,
  //         "interests": interests2,
  //         "background": background2
  //       }
  //     }
  //   },
  //   { safe: true },
  //   callback()
  // )

  // 2. collage email (+notification)

};
