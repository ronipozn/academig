var { MongoClient } = require("mongodb");
var async = require("async");

// var MongoClient = require('mongodb').MongoClient,

var uri;

if (process.env.PORT) {
  // var local = require('../mlab.config.json');
  uri = "mongodb+srv://heroku_m6cwnlp2:qcwXndZdNAgfolyF@cluster-m6cwnlp2.vwb3q.mongodb.net/heroku_m6cwnlp2?retryWrites=true&w=majority";
} else {
  // var local = require('../local.config.json');
  uri =  "mongodb://localhost:27017/academig";
}

var MongoC = new MongoClient(uri);

// private
var db;

module.exports.init = init;

async function init(callback) {
  try {
    console.log("\n** 1. Open db");
    await MongoC.connect();
    if (process.env.PORT) {
      console.log('db_production')
      db = MongoC.db('heroku_m6cwnlp2');
    } else {
      console.log('db_local')
      db = MongoC.db('academig');
    }
  } finally {
    init_collections((err, results) => {
      console.log('err',err)
      callback()
    });
    // await MongoC.close();
  }
}

// Initialisation: open the database
function init_collections(callback) {
  async.waterfall([
    // 2. create collection for admin panel. If it already exist, then we are good.
    function (cb) {
      console.log("** 2. Create admin collection.");
      db.collection("admin", cb);
    },

    // 3. create collection for universities. If it already exist, then we are good.
    function (admin_coll, cb) {
      exports.admin = admin_coll;
      console.log("** 3. Create universities collection.");
      db.collection("universities", cb);
    },

    // 4. create collection for departments. If it already exist, then we are good.
    function (universities_coll, cb) {
      exports.universities = universities_coll;
      console.log("** 4. Create departments collection.");
      db.collection("departments", cb);
    },

    // 5. create collection for groups. If it already exist, then we are good.
    function (departments_coll, cb) {
      exports.departments = departments_coll;
      console.log("** 5. Create groups collection.");
      db.collection("groups", cb);
    },

    // 6. create collection for peoples. If it already exist, then we are good.
    function (groups_coll, cb) {
      exports.groups = groups_coll;
      console.log("** 6. Create peoples collection.");
      db.collection("peoples", cb);
    },

    // 7. create collection for media. If it already exist, then we are good.
    function (peoples_coll, cb) {
      exports.peoples = peoples_coll;
      console.log("** 7. Create media collection.");
      db.collection("media", cb);
    },

    // 8. create collection for projects. If it already exist, then we are good.
    function (media_coll, cb) {
      exports.media = media_coll;
      console.log("** 8. Create projects collection.");
      db.collection("projects", cb);
    },

    // 9. create collection for publications. If it already exist, then we are good.
    function (projects_coll, cb) {
      exports.projects = projects_coll;
      console.log("** 9. Create publications collection.");
      db.collection("publications", cb);
    },

    // 10. create collection for resources. If it already exist, then we are good.
    function (publications_coll, cb) {
      exports.publications = publications_coll;
      console.log("** 10. Create resources collection.");
      db.collection("resources", cb);
    },

    // 11. create collection for positions. If it already exist, then we are good.
    function (resources_coll, cb) {
      exports.resources = resources_coll;
      console.log("** 11. Create positions collection.");
      db.collection("positions", cb);
    },

    // 12. create collection for teachings. If it already exist, then we are good.
    function (positions_coll, cb) {
      exports.positions = positions_coll;
      console.log("** 12. Create teachings collection.");
      db.collection("teachings", cb);
    },

    // 12. create collection for news. If it already exist, then we are good.
    function (teachings_coll, cb) {
      exports.teachings = teachings_coll;
      console.log("** 12. Create news collection.");
      db.collection("news", cb);
    },

    // 13. create collection for contacts. If it already exist, then we are good.
    function (news_coll, cb) {
      exports.news = news_coll;
      console.log("** 13. Create contacts collection.");
      db.collection("contacts", cb);
    },

    // 14. create collection for collaborations. If it already exist, then we are good.
    function (contacts_coll, cb) {
      exports.contacts = contacts_coll;
      console.log("** 14. Create collaborations collection.");
      db.collection("collaborations", cb);
    },

    // 15. create collection for fundings. If it already exist, then we are good.
    function (collaborations_coll, cb) {
      exports.collaborations = collaborations_coll;
      console.log("** 15. Create fundings collection.");
      db.collection("fundings", cb);
    },

    // 16. create collection for FAQ. If it already exist, then we are good.
    function (fundings_coll, cb) {
      exports.fundings = fundings_coll;
      console.log("** 16. Create Questions collection.");
      db.collection("faq", cb);
    },

    // 17. create collection for Affiliation. If it already exist, then we are good.
    function (faq_coll, cb) {
      exports.faq = faq_coll;
      console.log("** 17. Create Affiliations collection.");
      db.collection("affiliations", cb);
    },

    // 17. create collection for Sponsors. If it already exist, then we are good.
    function (affiliations_coll, cb) {
      exports.affiliations = affiliations_coll;
      console.log("** 18. Create Sponsors collection.");
      db.collection("sponsors", cb);
    },

    // 18. create collection for reports. If it already exist, then we are good.
    function (sponsors_coll, cb) {
      exports.sponsors = sponsors_coll;
      console.log("** 19. Create reports collection.");
      db.collection("reports", cb);
    },

    // 19. create collection for channels. If it already exist, then we are good.
    function (reports_coll, cb) {
      exports.reports = reports_coll;
      console.log("** 20. Create channels collection.");
      db.collection("channels", cb);
    },

    // 20. create collection for galleries. If it already exist, then we are good.
    function (channels_coll, cb) {
      exports.channels = channels_coll;
      console.log("** 21. Create gallery collection.");
      db.collection("events", cb);
    },

    // 21. create collection for global univerisities list. If it already exist, then we are good.
    function (events_coll, cb) {
      exports.events = events_coll;
      console.log("** 22. Create global univerisities list collection.");
      db.collection("universities_query", cb);
    },

    // 22. create collection for hash list. If it already exist, then we are good.
    function (universities_query_coll, cb) {
      exports.universities_query = universities_query_coll;
      console.log("** 23. Create hash collection.");
      db.collection("hash", cb);
    },

    // 23. create collection for invites list. If it already exist, then we are good.
    function (hash_coll, cb) {
      exports.hash = hash_coll;
      console.log("** 24. Create invites collection.");
      db.collection("invites", cb);
    },

    // 24. create collection for claims list. If it already exist, then we are good.
    function (invites_coll, cb) {
      exports.invites = invites_coll;
      console.log("** 24. Create claims collection.");
      db.collection("claims", cb);
    },

    // 25. create collection for publication marketing list. If it already exist, then we are good.
    function (claims_coll, cb) {
      exports.claims = claims_coll;
      console.log("** 25. Create publications marketing collection.");
      db.collection("publications_marketing", cb);
    },

    // 26. create collection for contests list. If it already exist, then we are good.
    function (publications_marketing_coll, cb) {
      exports.publications_marketing = publications_marketing_coll;
      console.log("** 26. Create contests collection.");
      db.collection("contests", cb);
    },

    // 27. create collection for schedules list. If it already exist, then we are good.
    function (contests_coll, cb) {
      exports.contests = contests_coll;
      console.log("** 27. Create schedules collection.");
      db.collection("schedules", cb);
    },

    // 28. create collection for outreachs. If it already exist, then we are good.
    function (schedules_coll, cb) {
      exports.schedules = schedules_coll;
      console.log("** 28. Create outreachs collection.");
      db.collection("outreachs", cb);
    },

    // 29. create collection for logging. If it already exist, then we are good.
    function (outreach_coll, cb) {
      exports.outreachs = outreach_coll;
      console.log("** 29. Create logging collection.");
      db.collection("logging", cb);
    },

    // 30. create collection for apps. If it already exist, then we are good.
    function (logging_coll, cb) {
      exports.logging = logging_coll;
      console.log("** 30. Create apps collection.");
      db.collection("apps", cb);
    },

    // 31. create collection for podcasts. If it already exist, then we are good.
    function (apps_coll, cb) {
      exports.apps = apps_coll;
      console.log("** 31. Create podcasts collection.");
      db.collection("podcasts", cb);
    },

    // 31. create collection for trends. If it already exist, then we are good.
    function (podcasts_coll, cb) {
      exports.podcasts = podcasts_coll;
      console.log("** 32. Create trends collection.");
      db.collection("trends", cb);
    },

    // 32. create collection for events. If it already exist, then we are good.
    function (trends_coll, cb) {
      exports.trends = trends_coll;
      console.log("** 33. Create events collection.");
      db.collection("events", cb);
    },

    // 33. create collection for courses. If it already exist, then we are good.
    function (events_coll, cb) {
      exports.events = events_coll;
      console.log("** 34. Create courses collection.");
      db.collection("courses", cb);
    },

    // 35. create collection for courses. If it already exist, then we are good.
    function (courses_coll, cb) {
      exports.courses = courses_coll;
      console.log("** 34. Create journals collection.");
      db.collection("journals", cb);
    },

    // 32. create collection for featured search and lists. If it already exist, then we are good.
    function (journals_coll, cb) {
      exports.journals =journals_coll;
      console.log("** 35. Create featured collection.");
      db.collection("featured", cb);
    },

    // 36. create collection for stories. If it already exist, then we are good.
    function (featured_coll, cb) {
      exports.featured = featured_coll;
      console.log("** 36. Create stories collection.");
      db.collection("stories", cb);
    },

    // 37. create collection for mentors. If it already exist, then we are good.
    function (stories_coll, cb) {
      exports.featured = stories_coll;
      console.log("** 36. Create mentors collection.");
      db.collection("mentors", cb);
    },

    function (mentors_coll, cb) {
      exports.mentors = mentors_coll;
      cb(null);
    }

  ], callback);
};

exports.universities = null;
exports.departments = null;
exports.groups = null;
exports.projects = null;
exports.peoples = null;
exports.mentors = null;

exports.media = null;
exports.projects = null;
exports.publications = null;
exports.resources = null;
exports.teachings = null;
exports.positions = null;
exports.news = null;
exports.contacts = null;
exports.collaborations = null;
exports.fundings = null;
exports.faq = null;
exports.affiliations = null;
exports.sponsors = null;
exports.reports = null;
exports.channels = null;
exports.events = null;
exports.universities_query = null;
exports.hash = null;
exports.invites = null;
exports.claims = null;
exports.outreachs = null;

exports.featured = null;

exports.trends = null;
exports.podcasts = null;
exports.events = null;
exports.apps = null;
exports.courses = null;
exports.journals = null;

exports.schedules = null;
exports.publications_marketing = null;
exports.contests = null;
exports.logging = null;
exports.stories = null;
