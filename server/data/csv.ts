const https = require('https');

var db = require('../db.ts'),
    async = require('async'),
    backhelp = require("./backend_helpers.ts");

const csv = require('fast-csv');
const fs = require('fs');
const request = require("request");

var group_create = require("./groups_create.ts");
var department = require("./departments.ts");
var university = require("./universities.ts");

var trends = require("./trends.ts");
var podcasts = require("./podcasts.ts");
var events = require("./events.ts");
var apps = require("./apps.ts");

var publication = require("./publications.ts");
var schedules = require("./schedules.ts");

var admin = require("./admin.ts");
var shared = require("./shared.ts");
var misc = require("../misc/misc.ts");
var pics = require("./pics.ts");

import {CreateGroup} from '../models/groups.ts';
import {CreateDepartment} from '../models/university.ts';
import {Rank, Affiliation, PublicInfo, SocialInfo, objectMini, complexName} from '../models/shared.ts';
import {CreatePublication} from '../models/publications.ts';

import UploadClient from '@uploadcare/upload-client'

var ObjectID = require('mongodb').ObjectID;

export function get_csv(csvFile: string, callback) {
  console.log('csvFile',csvFile)
  if (csvFile) {
    request.get(csvFile).on('response', function (response) {
      var csvBody = '';
      var i = 0;
      response.on('data', function (chunk) {
          i++;
          csvBody += chunk;
          console.log('BODY Part: ' + i);
      });
      response.on('end', function () {
        console.log('end')
        callback(null, csvBody);
      });
    });
    // request.get(csvFile, function (error, response, body) {
    //   if (!error && response.statusCode == 200) {
    //     var csv = body;
    //     console.log('csv',csv)
    //     callback(error, body)
    //     // Continue with your processing here.
    //   }
    // });
    // fs.createReadStream(body.url)
    //   .pipe(csv.parse({ headers: true }))
    //   .on('error', error => console.error(error))
    //   .on('data', row => console.log(`ROW=${JSON.stringify(row)}`))
    //   .on('end', rowCount => { console.log(`Parsed ${rowCount} rows`); callback(); });
  } else {
    callback()
  }
}

///////////////////////////////////
///////////////////////////////////
////////// Universities //////////
///////////////////////////////////
///////////////////////////////////

export function parse_csv_universities_recipe(csvBody, callback) {
  csv.parseString(csvBody, { headers: true })
     .on('error', error => console.error(error))
     .on('data', row => {
       console.log('row',row)
     }
  )

 // 4ICU
 // english name, original name
 // acronym, motto, mottoEnglish, fundedYear
 // address (query)
 // gender, international students
 // student enrollment (number), academic staff (number)
 // control type, entity type, campus setting, academic calendar, religious affiliation
 // library, housing, sport facilities, study abroad
 // distance learning, online courses
 // website link, library link
 // social links
 // wikipedia link

 // WIKIPEDIA
 // Description (first 3 paragraphs)
 // Logo, Original Name, English Name
 // Motto, Motto English
 // Type, Established, Campus, Academic term
 // Location (Country, State, City), Coordinates
 // Administrative staff, Academic staff, Undergraduates (year), Postgraduates (year), Students (year), Doctoral students (year)
 // Languages

 // API Social Networks
 // Social links => social numbers

 // Excels / Scraping Ranks Sites:
 // Ranks:
}

export function parse_csv_universities(csvBody, callback) {
  // var createUniversities: createUniversity[] = [];
  var createUniversities: any[] = [];
  var infos: PublicInfo[] = [];
  var socials: SocialInfo[] = [];
  var ranks: Rank[] = [];

  var extras: any[] = [];
  var locations: any[] = [];

  var i: number = 0;

  csv.parseString(csvBody, { headers: true })
     .on('error', error => console.error(error))
     .on('data', row => {

       // console.log('row',row)

       createUniversities[i] = {
         university: row.university,
         link: row.link,
         pic: row.pic,
         description: row.description,
         source: row.source,
         website: row.website
       }

       extras[i] = {
         name_original: row.name_original,
         establish: Number(row.establish),
         students_number: row.students_number,
         staff_number: row.staff_number,
         motto: row.motto,
         control_type: row.control_type,
         entity_type: row.entity_type,
         setting: row.setting,
         find_us: row.find_us,
         religious: row.religious,
         calendar: row.calendar,
         admission_rate: row.admission_rate,
         admission_office: row.admission_office,
         libraray_facilities: row.libraray_facilities,
         housing_facilities: row.housing_facilities,
         sports_facilities: row.sports_facilities,
         undergraduate_tutition: row.undergraduate_tutition,
         postgraduate_tutition: row.postgraduate_tutition
       }

       infos[i] = {
         address: row.address,
         email: row.email,
         phone: row.phone,
         fax: row.fax,
         website: row.website
       }

       socials[i] = {
         linkedin: row.linkedin,
         twitter: row.twitter,
         scholar: row.scholar,
         orcid: row.orcid,
         github: row.github,
         researchgate: row.researchgate,
         facebook: row.facebook,
         youtube: row.youtube,
         pinterest: row.pinterest,
         instagram: row.instagram
       }

       ranks[i] = Object.assign(
         (row.times_rank) ? {"times": row.times_rank} : {},
         (row.shanghai_rank) ? {"shanghai": row.shanghai_rank} : {},
         (row.topuniversities_rank) ? {"top": row.topuniversities_rank} : {},
         (row.worldreport_rank) ? {"usnews": row.worldreport_rank} : {},
         (row.facebook_number) ? {"facebook": row.facebook_number} : {},
         (row.twitter_number) ? {"twitter": row.twitter_number} : {},
         (row.linkedin_number) ? {"linkedin": row.linkedin_number} : {},
         (row.instagram_number) ? {"instagram": row.instagram_number} : {},
         (row.youtube_number) ? {"youtube": row.youtube_number} : {},
       )

       locations[i] = {
         country_code: row.country_code,
         state: row.state,
         city: row.city,
         longitude: row.longitude,
         latitude: row.latitude
       }

       i++;

     })
     .on('end', rowCount => {
       // console.log(`Parsed ${rowCount} rows`)
       async.forEachOfSeries(createUniversities, function (createUniversity, key, forCb) {
         async.waterfall([

           // 0. createUniversity (check existent)
           function (cb) {
             console.log('U0')
             university.university_id(createUniversity.university, 0, function (err, exist_university_id) {
               if (exist_university_id) {
                 cb(err, exist_university_id)
               } else {
                 if (createUniversity.pic) {
                   const uploadCarePublickey: string = process.env.PORT ? "db20eafbf3648a36d4d0" : "c367913a2486a422f3ab";
                   const client = new UploadClient({ publicKey: uploadCarePublickey })
                   const fileUpload = client.uploadFile(createUniversity.pic, null)
                   fileUpload.then(
                     file => {
                       createUniversity.pic = 'https://ucarecdn.com/'+file.uuid+'/original';
                       // admin?
                       university.createUniversity(createUniversity, 0, function (err, university_id) {
                         cb(err, university_id)
                       })
                     }
                   )
                 } else {
                   // admin?
                   university.createUniversity(createUniversity, 0, function (err, university_id) {
                     cb(err, university_id)
                   })
                 }
               }
             })
           },

           // 1. Affiliation
           function (university_id: string, cb) {
             console.log('U1')
             const affiliation: Affiliation = {
               _id: university_id,
               title: createUniversity.university,
               abbr: misc.NFD(createUniversity.university),
               description: createUniversity.description,
               source: createUniversity.source,
               externalLink: createUniversity.website,
               pic: createUniversity.pic
             }
             university.post_affiliation(affiliation, university_id, function (err) {
               cb(err, university_id)
             })
           },

           // 2. Public Info
           function (university_id: string, cb) {
             console.log('U2')
             shared.post_public_info(infos[key], university_id, 3, function (err) {
               cb(err, university_id)
             })
           },

           // 3. Social Info
           function (university_id: string, cb) {
             console.log('U3')
             shared.post_social_info(socials[key], university_id, 3, function (err) {
               cb(err, university_id)
             })
           },

           // 4. Rank
           function (university_id: string, cb) {
             console.log('U4')
             shared.post_rank(ranks[key], university_id, 3, function (err) {
               cb(err, university_id)
             })
           },

           // 5. Location
           function (university_id: string, cb) {
             console.log('U5')
             shared.post_location(locations[key].latitude, locations[key].longitude, locations[key].country_code, locations[key].state, locations[key].city, university_id, null, 3, function (err) {
               cb(err, university_id)
             })
           },

           // 6. Showcase
           // function (university_id: string, cb) {
           //   console.log('U6')
           //   const showcase = null;
           //   pics.put_showcase(showcase, 5, university_id, function (err) {
           //     cb(err, university_id)
           //   });
           // },

           // 7. Find Us
           // POST /api/textpic.json

           // 8. Contact Us
           // PUT /api/contact.json

           // 9. Details
           function (university_id: string, cb) {
             console.log('U9')
             university.post_home_details(extras[key], university_id, function (err) {
               cb(err, university_id)
             });
           }

         ],
         function (err, university_id) {
           forCb()
         });
       }, function (err) {
         callback(err)
       })
     }
   );
}

///////////////////////////////////
///////////////////////////////////
/////////// Departments ///////////
///////////////////////////////////
///////////////////////////////////

export function parse_csv_departments(csvBody, universityObj: complexName, callback) {
  var createDepartments: CreateDepartment[] = [];
  var infos: PublicInfo[] = [];
  var socials: SocialInfo[] = [];
  var type: number[] = []

  var i: number = 0;

  csv.parseString(csvBody, { headers: true })
     .on('error', error => console.error(error))
     .on('data', row => {

       // console.log('row',row)

       type[i] = row.type, // 0: Department / 1: Program / 2: Center

       createDepartments[i] = {
         name: row.name,
         link: row.link,
         pic: row.pic,
         description: row.description,
         source: row.source,
         website: row.website,
       }

       infos[i] = {
         address: row.address,
         email: row.email,
         phone: row.phone,
         fax: row.fax,
         website: row.website
       }

       socials[i] = {
         linkedin: row.linkedin,
         twitter: row.twitter,
         scholar: row.scholar,
         orcid: row.orcid,
         github: row.github,
         researchgate: row.researchgate,
         facebook: row.facebook,
         youtube: row.youtube,
         pinterest: row.pinterest,
         instagram: row.instagram
       }

       i++;
     })
     .on('end', rowCount => {
       // console.log(`Parsed ${rowCount} rows`)
       async.forEachOfSeries(createDepartments, function (createDepartment, key, forCb) {
         async.waterfall([
           // 1. createDepartment (check existent)
           function (cb) {
             department.createDepartmentAdmin(createDepartment, universityObj, function (err, department_id) {
               cb(err, department_id)
             })
           },
           // 2. update University
           function (department_id: string, cb) {
             university.updateUniversityAdmin(createDepartment, universityObj._id, department_id, null, function (err) {
               cb(err, department_id)
             })
           },
           // 3. post_public_info
           function (department_id: string, cb) {
             shared.post_public_info(infos[key], department_id, 2, function (err) {
               cb(err, department_id)
             })
           },
           // 4. post_social_info
           function (department_id: string, cb) {
             shared.post_social_info(socials[key], department_id, 2, function (err) {
               cb(err, department_id)
             })
           },
           // 5. location.json
           function (department_id: string, cb) {
             shared.post_location(53, 53, 1, "New York", "Haifa", department_id, null, 2, function (err) {
               cb(err, department_id)
             })
           },
           // 6. showcase.json
           function (department_id: string, cb) {
             const pics = null;
             pics.put_showcase(pics, 4, department_id, function (err, picsIds) {
               cb(err, department_id)
             });
           },
           // admission / clips / establish
         ],
         function (err, department_id) {
           console.log('department_id',department_id, key)
           forCb()
         });
       }, function (err) {
         callback(err)
       })
     }
   );
}

///////////////////////////////////
///////////////////////////////////
/////////////// Labs //////////////
///////////////////////////////////
///////////////////////////////////

export function parse_csv_labs(csvBody, university: string, department: string, callback) {
  // var host=req.get('host');
  var groups: CreateGroup[] = [];
  var infos: PublicInfo[] = [];
  var socials: SocialInfo[] = [];
  var ranks: Rank[] = [];

  var i: number = 0;

  csv.parseString(csvBody, { headers: true })
   .on('error', error => console.error('csv_labs_error',error))
   .on('data', row => {

     if (row.email) {

       console.log("row.start",row.start)

       groups[i] = {
         buildMode: (university=='company') ? 7 : 6,
         firstInstituteEmail: null, // row.email,
         position: row.position,
         period: { start: null, end: null, mode: 0 },
         secondInstituteEmail: row.email,
         secondPosition: row.position,
         secondName: row.name,
         secondPic: null,
         secondStartDate: row.start,
         currentWebsite: null,
         allowSendEmails: null,
         university: university,
         department: department,
         unit: null,
         group: row.group,
         logo: null, // row.logo (FIX: upload)
         country_id: null,
         group_size: row.size ? Number(row.size) : null,
         topic: row.topic ? row.topic.split(",") : null,
         establishDate: row.establish,
         background: row.background,
         interests: row.interests ? row.interests.split(",") : null,
         names: row.names.split(","),
         theme: null,
         themeIndex: null,
         cover: null, // cover: "assets/img/covers/connections-academig-" + row.cover + ".jpg",
         privacy: 1
       }

       infos[i] = {
         address: row.address,
         email: row.email,
         phone: row.phone,
         fax: row.fax,
         website: row.website
       }

       socials[i] = {
         linkedin: row.linkedin,
         twitter: row.twitter,
         scholar: row.scholar,
         orcid: row.orcid,
         github: row.github,
         researchgate: row.researchgate,
         facebook: row.facebook,
         youtube: row.youtube,
         pinterest: row.pinterest,
         instagram: row.instagram,
       }

       ranks[i] = Object.assign(
         (row.facebook_number) ? {"facebook": row.facebook_number} : {},
         (row.twitter_number) ? {"twitter": row.twitter_number} : {},
         (row.linkedin_number) ? {"linkedin": row.linkedin_number} : {},
         (row.instagram_number) ? {"instagram": row.instagram_number} : {},
         (row.youtube_number) ? {"youtube": row.youtube_number} : {},
       )

       i++;
     }
   })
   .on('end', rowCount => {
     // console.log(`Parsed ${rowCount} rows`)
     // group_create.create_group(createGroup, host, userId, cb);
     async.forEachOfSeries(groups, function (group, key, cb) {
       group_create.create_group(group, null, "academig", function (err, group_id) {
         shared.post_public_info(infos[key], group_id, 0, function (err) {
           shared.post_social_info(socials[key], group_id, 0, function (err) {
             shared.post_rank(ranks[key], group_id, 1, function (err) {
               console.log('group_id',group_id, key)
               cb(err)
             })
           })
         })
       })
     }, function (err) {
       callback(err)
     })
   }
 );
}

///////////////////////////////////
///////////////////////////////////
////////////// Trends /////////////
///////////////////////////////////
///////////////////////////////////

export function parse_csv_trends(csvBody, callback) {
  var createTrends: any[] = [];
  var infos: PublicInfo[] = [];
  var socials: SocialInfo[] = [];
  var locations: any[] = [];

  var i: number = 0;

  csv.parseString(csvBody, { headers: true })
     .on('error', error => console.error(error))
     .on('data', row => {

       createTrends[i] = {
         name: row.name,
         pic: row.logo_link,

         description: row.description,
         categories: row.categories ? row.categories.split(",") : [],
         // description: row.description,
         // fields: row.fields,
         // sub_fields: row.sub_fields,

         clips: row.clips
       }
       i++;
     })
     .on('end', rowCount => {
       // console.log(`Parsed ${rowCount} rows`)
       async.forEachOfSeries(createTrends, function (createTrend, key, forCb) {
         async.waterfall([

           // 1. createTrend (check existent)
           function (cb) {
             apps.app_id(createTrend.name, function (err, exist_id) {
               if (exist_id) {
                 cb(err, exist_id)
               } else {
                 if (createTrend.pic) {
                   const uploadCarePublickey: string = process.env.PORT ? "db20eafbf3648a36d4d0" : "c367913a2486a422f3ab";
                   const client = new UploadClient({ publicKey: uploadCarePublickey })
                   const fileUpload = client.uploadFile(createTrend.pic, null)
                   fileUpload.then(
                     file => {
                       createTrend.pic = 'https://ucarecdn.com/'+file.uuid+'/original';
                       trends.put_trend(createTrend, function (err, id) {
                         cb(err, id)
                       })
                     }
                   )
                 } else {
                   trends.put_trend(createTrend, function (err, id) {
                     cb(err, id)
                   })
                 }
               }
             })
           }

         ],
         function (err, id) {
           forCb()
         });
       }, function (err) {
         callback(err)
       })
     }
   );
 }

///////////////////////////////////
///////////////////////////////////
///////////// Podcasts ////////////
///////////////////////////////////
///////////////////////////////////

export function parse_csv_podcasts(csvBody, callback) {
  var createPodcasts: any[] = [];
  var infos: PublicInfo[] = [];
  var socials: SocialInfo[] = [];
  var locations: any[] = [];

  var i: number = 0;

  csv.parseString(csvBody, { headers: true })
     .on('error', error => console.error(error))
     .on('data', row => {

       createPodcasts[i] = {
         name: row.name,
         pic: row.pic,

         // description_long: row.description_long,
         description: row.description,
         categories: row.categories ? row.categories.split(",") : [],

         type: row.type,
         website: row.website,
         release: row.release,
         total: row.total,
         language: row.language,
         // latest: r ow.latest,
       }

       infos[i] = {
         address: row.address,
         email: row.email,
         phone: row.phone,
         fax: row.fax,
         website: row.website
       }

       socials[i] = {
         linkedin: row.linkedin,
         twitter: row.twitter,
         scholar: row.scholar,
         orcid: row.orcid,
         github: row.github,
         researchgate: row.researchgate,
         facebook: row.facebook,
         youtube: row.youtube,
         pinterest: row.pinterest,
         instagram: row.instagram
       }

       locations[i] = {
         country_code: row.country_code,
         state: row.state,
         city: row.city,
         longitude: row.longitude,
         latitude: row.latitude
       }

       // social_impact
       i++;
     })
     .on('end', rowCount => {
       // console.log(`Parsed ${rowCount} rows`)
       async.forEachOfSeries(createPodcasts, function (createPodcast, key, forCb) {
         async.waterfall([

           // 1. createPodcast (check existent)
           function (cb) {
             console.log('PODCAST1')
             podcasts.podcast_id(misc.NFD(createPodcast.name), function (err, exist_id) {
               console.log('exist_id',exist_id)
               if (exist_id) {
                 cb(err, exist_id)
               } else {
                 if (createPodcast.pic) {
                   const uploadCarePublickey: string = process.env.PORT ? "db20eafbf3648a36d4d0" : "c367913a2486a422f3ab";
                   const client = new UploadClient({ publicKey: uploadCarePublickey })
                   const fileUpload = client.uploadFile(createPodcast.pic, null)
                   fileUpload.then(
                     file => {
                       createPodcast.pic = 'https://ucarecdn.com/'+file.uuid+'/original';
                       podcasts.put_podcast(createPodcast, function (err, id) {
                         cb(err, id)
                       })
                     }
                   )
                 } else {
                   podcasts.put_podcast(createPodcast, function (err, id) {
                     cb(err, id)
                   })
                 }
               }
             })
           },

           // 2. Public Info
           function (id: string, cb) {
             console.log('PODCAST2')
             shared.post_public_info(infos[key], id, 5, function (err) {
               cb(err, id)
             })
           },

           // 3. Social Info
           function (id: string, cb) {
             console.log('PODCAST3')
             shared.post_social_info(socials[key], id, 5, function (err) {
               cb(err, id)
             })
           },

           // 4. Location
           function (id: string, cb) {
             console.log('PODCAST4')
             shared.post_location(locations[key].latitude, locations[key].longitude, locations[key].country_code, locations[key].state, locations[key].city, id, null, 5, function (err) {
               cb(err, id)
             })
           }
         ],
         function (err, id) {
           forCb()
         });
       }, function (err) {
         callback(err)
       })
     }
   );
 }

///////////////////////////////////
///////////////////////////////////
////////////// Events /////////////
///////////////////////////////////
///////////////////////////////////

export function parse_csv_events(csvBody, callback) {
  var createEvents: any[] = [];
  var infos: PublicInfo[] = [];
  var socials: SocialInfo[] = [];
  var locations: any[] = [];

  var i: number = 0;

  csv.parseString(csvBody, { headers: true })
     .on('error', error => console.error(error))
     .on('data', row => {

       createEvents[i] = {
         name: row.name,
         pic: row.pic,

         description: row.description,
         categories: row.categories ? row.categories.split(",") : [],

         type: row.type,
         website: row.website,
         start: row.start,
         end: row.end,
         language: row.language,
         register: row.register,
         price: row.price
       }

       infos[i] = {
         address: row.address,
         email: row.email,
         phone: row.phone,
         fax: row.fax,
         website: row.website
       }

      socials[i] = {
        linkedin: row.linkedin,
        twitter: row.twitter,
        scholar: row.scholar,
        orcid: row.orcid,
        github: row.github,
        researchgate: row.researchgate,
        facebook: row.facebook,
        youtube: row.youtube,
        pinterest: row.pinterest,
        instagram: row.instagram
      }

      locations[i] = {
        country_code: row.country_code,
        state: row.state,
        city: row.city,
        longitude: row.longitude,
        latitude: row.latitude
      }

      // social_impact
      i++;
     })
     .on('end', rowCount => {
       // console.log(`Parsed ${rowCount} rows`)
       async.forEachOfSeries(createEvents, function (createEvent, key, forCb) {
         async.waterfall([

           // 1. createEvent (check existent)
           function (cb) {
             console.log('EVENT1')
             events.event_id(misc.NFD(createEvent.name), function (err, exist_id) {
               if (exist_id) {
                 cb(err, exist_id)
               } else {
                 if (createEvent.pic) {
                   const uploadCarePublickey: string = process.env.PORT ? "db20eafbf3648a36d4d0" : "c367913a2486a422f3ab";
                   const client = new UploadClient({ publicKey: uploadCarePublickey })
                   const fileUpload = client.uploadFile(createEvent.pic, null)
                   fileUpload.then(
                     file => {
                       createEvent.pic = 'https://ucarecdn.com/'+file.uuid+'/original';
                       events.put_event(createEvent, function (err, id) {
                         cb(err, id)
                       })
                     }
                   )
                 } else {
                   events.put_event(createEvent, function (err, id) {
                     cb(err, id)
                   })
                 }
               }
             })
           },

           // 2. Public Info
           function (id: string, cb) {
             console.log('EVENT2')
             shared.post_public_info(infos[key], id, 6, function (err) {
               cb(err, id)
             })
           },

           // 3. Social Info
           function (id: string, cb) {
             console.log('EVENT3')
             shared.post_social_info(socials[key], id, 6, function (err) {
               cb(err, id)
             })
           },

           // 4. Location
           function (id: string, cb) {
             console.log('EVENT4')
             shared.post_location(locations[key].latitude, locations[key].longitude, locations[key].country_code, locations[key].state, locations[key].city, id, null, 6, function (err) {
               cb(err, id)
             })
           }

         ],
         function (err, id) {
           forCb()
         });
       }, function (err) {
         callback(err)
       })
     }
   );
 }

///////////////////////////////////
///////////////////////////////////
/////////////// Apps //////////////
///////////////////////////////////
///////////////////////////////////

export function parse_csv_apps(csvBody, callback) {
  var createApps: any[] = [];
  var infos: PublicInfo[] = [];
  var socials: SocialInfo[] = [];
  var locations: any[] = [];

  var i: number = 0;

  csv.parseString(csvBody, { headers: true })
     .on('error', error => console.error('error',error))
     .on('data', row => {
       // console.log("row",row)
       createApps[i] = {
         name: row.name,
         pic: row.pic,

         description: row.description,
         categories: row.categories ? row.categories.split(",") : [],

         type: row.type,
         website: row.website,
         release: row.release,
         company: row.company,
         price: row.price,
       }

       infos[i] = {
         address: row.address,
         email: row.email,
         phone: row.phone,
         fax: row.fax,
         website: row.website
       }

       socials[i] = {
         linkedin: row.linkedin,
         twitter: row.twitter,
         scholar: row.scholar,
         orcid: row.orcid,
         github: row.github,
         researchgate: row.researchgate,
         facebook: row.facebook,
         youtube: row.youtube,
         pinterest: row.pinterest,
         instagram: row.instagram
       }

       locations[i] = {
         country_code: row.country_code,
         state: row.state,
         city: row.city,
         longitude: row.longitude,
         latitude: row.latitude
       }

       // social_impact
       i++;
     })
     .on('end', rowCount => {
       // console.log(`Parsed ${rowCount} rows`)
       async.forEachOfSeries(createApps, function (createApp, key, forCb) {
         async.waterfall([

           // 1. createApp (check existent)
           function (cb) {
             console.log('APP1')
             apps.app_id(misc.NFD(createApp.name), function (err, exist_id) {
               console.log('exist_id',exist_id)
               if (exist_id) {
                 cb(err, exist_id)
               } else {
                 if (createApp.pic) {
                   const uploadCarePublickey: string = process.env.PORT ? "db20eafbf3648a36d4d0" : "c367913a2486a422f3ab";
                   const client = new UploadClient({ publicKey: uploadCarePublickey })
                   const fileUpload = client.uploadFile(createApp.pic, null)
                   fileUpload.then(
                     file => {
                       createApp.pic = 'https://ucarecdn.com/'+file.uuid+'/original';
                       apps.put_app(createApp, function (err, id) {
                         cb(err, id)
                       })
                     }
                   )
                 } else {
                   apps.put_app(createApp, function (err, id) {
                     cb(err, id)
                   })
                 }
               }
             })
           },

           // 2. Public Info
           function (id: string, cb) {
             console.log('APP2')
             shared.post_public_info(infos[key], id, 7, function (err) {
               cb(err, id)
             })
           },

           // 3. Social Info
           function (id: string, cb) {
             console.log('APP3')
             shared.post_social_info(socials[key], id, 7, function (err) {
               cb(err, id)
             })
           },

           // 4. Location
           function (id: string, cb) {
             console.log('APP4')
             shared.post_location(locations[key].latitude, locations[key].longitude, locations[key].country_code, locations[key].state, locations[key].city, id, null, 7, function (err) {
               cb(err, id)
             })
           }

         ],
         function (err, id) {
           forCb()
         });
       }, function (err) {
         callback(err)
       })
     }
   );
 }

///////////////////////////////////
///////////////////////////////////
////////////// Courses ////////////
///////////////////////////////////
///////////////////////////////////

///////////////////////////////////
///////////////////////////////////
///////////// Journals ////////////
///////////////////////////////////
///////////////////////////////////

///////////////////////////////////
///////////////////////////////////
/////////// Publications //////////
///////////////////////////////////
///////////////////////////////////

export function parse_csv_publication(csvBody, callback) {
  var i = 0;
  var title, abstractPic: string;
  // abstract
  var tags: string[] = [];
  var names: string[] = [];
  var emails: string[] = [];

  var errorFlag: boolean = false;

  csv.parseString(csvBody, { headers: true })
     .on('error', error => {
       console.error(error)
       callback(error)
     })
     .on('data', row => {
       // console.log('row',row)

       if (i==0) {
         title = row.propertyName1;
         // abstract = row.propertyName3;
         abstractPic = row.propertyName4;
       }

       if (row.propertyName2_link==null) {
         errorFlag = true;
       } else if (row.propertyName2_link.slice(0,17)=="https://orcid.org") { // Orcid (y/n)
         i++
       } else if (i%2==0) {
         names.push(row.propertyName2); // Name
       } else if (i%2==1) {
         emails.push(row.propertyName2_link.split("mailto:")[1]);  // Email
       }
       i++;

       if (row.propertyName3) { // Tags
         tags.push(row.propertyName3);
       }

       // upload figures

     })
     .on('end', rowCount => {
       // console.log('abstract',abstract)
       console.log('errorFlag',errorFlag)
       if (errorFlag) {
         callback(null, 4)
       } else {
         query_csv_publication(title, function (err, existFlag, publicationsObj) {
           // console.log('publicationsObj',publicationsObj)
           // console.log('existFlag',existFlag); console.log('title',title); console.log('publication.title',publication.title); console.log('publication',publication)
           if (existFlag==true) {
             callback(err, 0)
           } else if (publicationsObj==null) {
             callback(err, 3)
           } else if (publicationsObj.name && publicationsObj.title && publicationsObj.title[0]==title) {
             // console.log('publicationsObj',publicationsObj); console.log('names',names,'emails',emails,'tags',tags,'abstractPic',abstractPic);console.log('publication.author',publication.author.map(r=> r.given + ' ' + r.family))

             // https://github.com/uploadcare/uploadcare-upload-client
             if (abstractPic) {
               const uploadCarePublickey: string = process.env.PORT ? "db20eafbf3648a36d4d0" : "c367913a2486a422f3ab";
               // const uploadCarePrivatekey: string = process.env.PORT ? "2175c2ed0a31e3deea55" : "f672d6cafcff61eef8ce";
               const client = new UploadClient({ publicKey: uploadCarePublickey })
               const fileUpload = client.uploadFile(abstractPic, null)

               fileUpload.then(
                 file => {
                   const data: CreatePublication = generatePublication(publicationsObj, names, tags, 'https://ucarecdn.com/'+file.uuid+'/original'); // abstractPic
                   // FIX: check 11 vs 4? why 11?
                   // publication.put_publication(null, 11, true, data, function (err, publicationId) {
                   publication.put_publication(null, 11, true, data, function (err, publicationId) {
                     admin.put_publication_marketing("academig", publicationId, function (err, publicationMarketingId) {
                       schedules.push_authors(names, emails, publicationId, function (err) {
                         callback(err, 1)
                       })
                     })
                   });
                 }
               )

             } else {

               const data: CreatePublication = generatePublication(publicationsObj, names, tags, null);
               publication.put_publication(null, 11, true, data, function (err, publicationId) {
                 admin.put_publication_marketing("academig", publicationId, function (err, publicationMarketingId) {
                   schedules.push_authors(names, emails, publicationId, function (err) {
                     callback(err, 1)
                   })
                 })
               });

             }

           } else {
             callback(err, 2)
           }
         })
       }

     }
   );
}

export function parse_csv_publication_recipe(csvBody, callback) {
  var i: number;
  var title, abstractPic: string;
  var tags: string[] = [];
  var names: string[] = [];
  var emails: string[] = [];

  var publicationsCSV: any[] = [];

  var errorFlag: boolean = false;

  csv.parseString(csvBody, { headers: true })
     .on('error', error => {
       console.error(error)
       callback(error)
     })
     .on('data', row => {
       // console.log('row',row)

       if (row.propertyName1!='') {
         if (title) {
           publicationsCSV.push({
             'errorFlag': errorFlag,
             'title': title,
             'abstractPic': abstractPic,
             'names' : names,
             'emails': emails,
             'tags': tags
           })
           errorFlag = false; title = ''; abstractPic = ''
           names = []; emails = []; tags = [];
           i=0;
         } else {
           i=0;
         }
       }

       if (i==0) {
         title = row.propertyName1;
         abstractPic = row.propertyName4;
       }

       if (row.propertyName2_link==null) {
         errorFlag = true;
       } else if (row.propertyName2_link.slice(0,17)=="https://orcid.org") { // Orcid (y/n)
         i++
       } else if (i%2==0) {
         names.push(row.propertyName2); // Name
       } else if (i%2==1) {
         emails.push(row.propertyName2_link.split("mailto:")[1]);  // Email
       }
       i++;

       if (row.propertyName3) { // Tags
         tags.push(row.propertyName3);
       }

     })
     .on('end', rowCount => {
       // console.log('publicationsCSV',publicationsCSV)
       let statusArr: any[] = [];

       async.forEachOfSeries(publicationsCSV, function (publication, key, cb) {
         // console.log('publication',key,publication)
         build_publication(key, publication.errorFlag, publication.title, publication.abstractPic, publication.tags, publication.names, publication.emails, function (err, id) {
           // console.log('errId',id)
           statusArr.push({
             "title": publication.title,
             "id": id,
           })
           cb(err)
         })
       }, function (err) {
         callback(err, statusArr)
       })
     }
   );
}

function build_publication(i: number, errorFlag: boolean, title: string, abstractPic: string, tags: string[], names: string[], emails: string[], callback) {
  // console.log('errorFlag',errorFlag)
  if (errorFlag) {
    callback(null, 4)
  } else {
    query_csv_publication(title, function (err, existFlag, publicationsObj) {
      console.log('index',i, 'err',err, 'existFlag',existFlag)
      console.log('title',title);
      // console.log('publicationsObj',publicationsObj)
      // console.log('publication.name',publicationsObj.name);
      // console.log('publication.title',publicationsObj.title);
      if (existFlag==true) {
        callback(err, 0)
      } else if (publicationsObj==null) {
        callback(err, 3)
      } else if (publicationsObj.name && publicationsObj.title && publicationsObj.title[0]==title) {
        // console.log('publicationsObj',publicationsObj); console.log('names',names,'emails',emails,'tags',tags,'abstractPic',abstractPic);console.log('publication.author',publication.author.map(r=> r.given + ' ' + r.family))
        // https://github.com/uploadcare/uploadcare-upload-client
        console.log('abstractPic',abstractPic)
        if (abstractPic) {

          const uploadCarePublickey: string = process.env.PORT ? "db20eafbf3648a36d4d0" : "c367913a2486a422f3ab";
          // const uploadCarePrivatekey: string = process.env.PORT ? "2175c2ed0a31e3deea55" : "f672d6cafcff61eef8ce";
          const client = new UploadClient({ publicKey: uploadCarePublickey })
          const fileUpload = client.uploadFile(abstractPic, null)

          fileUpload.then(
            file => {
              const data: CreatePublication = generatePublication(publicationsObj, names, tags, 'https://ucarecdn.com/'+file.uuid+'/original'); // abstractPic
              // TBD: FIX: check 11 vs 4? why 11?
              publication.put_publication(null, 11, true, data, function (err, publicationId) {
                admin.put_publication_marketing("academig", publicationId, function (err, publicationMarketingId) {
                  schedules.push_authors(names, emails, publicationId, function (err) {
                    callback(err, 1)
                  })
                })
              });
            }
          ).catch(function(e) {
            console.error('catch',e.message); // "oh, no!"
            const data: CreatePublication = generatePublication(publicationsObj, names, tags, null);
            publication.put_publication(null, 11, true, data, function (err, publicationId) {
              admin.put_publication_marketing("academig", publicationId, function (err, publicationMarketingId) {
                schedules.push_authors(names, emails, publicationId, function (err) {
                  callback(err, 1)
                })
              })
            });
          })

        } else {

          const data: CreatePublication = generatePublication(publicationsObj, names, tags, null);
          publication.put_publication(null, 11, true, data, function (err, publicationId) {
            admin.put_publication_marketing("academig", publicationId, function (err, publicationMarketingId) {
              schedules.push_authors(names, emails, publicationId, function (err) {
                callback(err, 1)
              })
            })
          });

        }

      } else {
        callback(err, 2)
      }
    })
  }
}

function query_csv_publication(title: string, callback) {
  async.waterfall([

    function (cb) {
      https.get(`https://api.crossref.org/works?rows=1&query=` + title + `&mailto=roni.pozner@gmail.com`, (resp) => {
        let data = '';
        resp.on('data', (chunk) => { data += chunk; });
        resp.on('end', () => {
          try {
            if (JSON.parse(data).message.items) {
              var publicationsObj = JSON.parse(data).message.items.map(function(obj) {
                var rObj = obj;
                rObj['name'] = (obj && obj.title) ? obj.title[0] : null;
                return rObj;
              })
              cb(null, publicationsObj[0]);
            } else {
              cb(null, null)
            }
          } catch(e) {
            // cb(e, null);
            cb(null, null);
            return;
          }
        });
      }).on("error", (err) => {
        cb(err, null)
      });
    },

    function (publicationObj, cb) {
      var existIndex: number;
      if (publicationObj) {
        // console.log('publication.DOI',publication.DOI)
        publication.publications_dois([publicationObj.DOI], function (err, existPublication) {
          // console.log('existPublicationDOI',existPublication.length)
          if (existPublication.length>0) {
            cb(err, true, null);
          } else {
            cb(err, false, publicationObj);
          }
        })
      } else {
        cb(null, false, null);
      }
    }

  ],
  function (err, exist: boolean, publicationObj) {
    callback(err, exist, publicationObj)
  })
}

function generatePublication(publicationObj, names: string[], tags: string[], abstractPic: string) {
  var data: CreatePublication;

  var type: number;
  var authors: objectMini[] = [];
  var queryFilter: any;

  const dateArray: number[] = publicationObj.issued['date-parts'][0];

  switch (publicationObj.type) {
    case 'journal-article': { type = 0; break; }
    case 'posted-content': { type = 0; break; }

    case 'book': { type = 1; break; }
    case 'book-section': { type = 1; break; }
    case 'book-track': { type = 1; break; }
    case 'book-part': { type = 1; break; }
    case 'book-set': { type = 1; break; }
    case 'reference-book': { type = 1; break; }
    case 'book-series': { type = 1; break; }
    case 'edited-book': { type = 1; break; }

    case 'book-chapter': { type = 2; break; }

    case 'proceedings': { type = 3; break; }
    case 'proceedings-article': { type = 3; break; }

    case 'patent': { type = 4; break; } // fix

    case 'report': { type = 5; break; }

    default: { type = 0; } // Other FIX
  }

  // mini.addField({'_id': null, 'name': queryFilter ? queryFilter : {"name": author}, 'pic': null})

  var fullName: string;

  if (publicationObj.author) {
    publicationObj.author.forEach((author, index) => {
      // * FIX: Publications: Check existing authors
      // https://stackoverflow.com/questions/18719383/how-to-filter-an-array-object-by-checking-multiple-values
      // queryFilter = peoplesQuery.filter(
      //   r => {
      //     var s = r.name.split(' ');
      //     return (s[0]==author.given && s[1]==author.family) || (s[0]==author.family && s[1]==author.given) ||
      //     (s[0].charAt(0)==author.given && s[1]==author.family) || (s[0]==author.family && s[1].charAt(0)==author.given)
      //     // r.name==(author.given + ' ' + author.family)
      //   }
      // )[0];
      // authors.push({"_id": queryFilter ? queryFilter._id : null, "name": author.given + ' ' + author.family, "pic": queryFilter ? queryFilter.pic : null})
      if (author.given==null) {
        fullName = author.family;
        names.forEach((name, index) => {
          if (name.includes(author.family)) fullName = name;
        })
      } else {
        fullName = author.given + ' ' + author.family;
      }
      authors.push({"_id": null, "name": fullName, "pic": null})
    })
  }

  data = {
    'type': type,
    'title': publicationObj.title ? publicationObj.title[0] : "unknown",
    'parentId': null,
    // 'date': new Date(dateArray[0], dateArray[1], dateArray[2]),
    'date': new Date(dateArray[0], dateArray[1] ? dateArray[1] : 1, dateArray[2] ? dateArray[2] : 1),
    'authors': authors,
    'publisher': publicationObj.publisher,
    'abstract': publicationObj.abstract,
    'abstractPic': abstractPic,
    'url': publicationObj.URL,
    'tags': tags,
    // 'tags': publicationObj.tags ? publicationObj.tags : [],
    'doi': publicationObj.DOI,
    // "projects": event.projects,
    'fundings': publicationObj.fundings ? publicationObj.fundings : [],
    // 'pdf': null,

    'journal': {"name": publicationObj['container-title'] ? publicationObj['container-title'][0] : '', "issn": null},
    'abbr': publicationObj['short-container-title'] ? publicationObj['short-container-title'][0] : '',

    'volume': (type!=1 && type!=3) ? (publicationObj.volume ? publicationObj.volume : '') : '',
    'issue': (type==0) ? (publicationObj.issue ? publicationObj.issue : '') : '',
    'pages': (type!=5) ? (publicationObj.page ? publicationObj.page : '') : '',
    'edition': (type==1 || type==2) ? (publicationObj.edition ? publicationObj.edition : '') : '',

    'referencesCount': publicationObj["references-count"],
    'citationsCount': publicationObj["is-referenced-by-count"],

    'ai': null
  };

  return data;
}
