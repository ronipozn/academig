const https = require('https');

var async = require("async");

var publication_data = require("../data/publications.ts");
var group_data = require("../data/groups.ts");
var people_data = require("../data/peoples.ts");

import { CreatePublication} from '../models/publications.ts';
import { objectMini } from '../models/shared.ts';

exports.version = "0.1.0";

export function retrieveSuggestions(mode: number, parentId: string, callback) {

  async.waterfall([

    // 1. get Existing Publications, Name, Alternative Names
    function (cb) {
      switch (mode) {
        case 0: // Group
          group_data.group_double_items_ids("publicationsItems", "publicationsPageItems", parentId, function (err, items, pageItems) {
            group_data.groupMembers(parentId, 4, function (err, admins) {
              console.log("pageItems",pageItems)
              console.log("admins",admins)
              const piUser = admins.filter(r => r.positions[0].status==6);
              const names: string[] = (piUser) ? [piUser[0].name].concat(pageItems.names) : pageItems.names;
              cb(err, (items || {}).publicationsIds.concat((items || {}).rejectedIds), parentId, names)
            })
          });
          break;
        case 1: // Profile
          people_data.get_followings_ids(18, parentId, null, function (err, publicationsIds) {
            people_data.people_names(parentId, function (err, user) {
              const names = user.names ? [user.name].concat(user.names) : [user.name];
              cb(err, publicationsIds, parentId, Array.from(new Set(names)));
            })
          });
          break;
      }
    },

    // 2. get DOI List
    function (publicationsIds: string[], parentId: string, authorNames: string[], cb) {
      publication_data.publications_doi_list(publicationsIds, function (err, publicationsExists) {
        cb(err, publicationsExists.map(r => r.doi), parentId, authorNames)
      })
    },

    // 3. get Suggestions
    function (exist_dois: string[], parentId: string, authorNames: string[], cb) {
      var primaryNameArray: string[] = authorNames[0].replace(/\./g,' ').replace(/\_/g,' ').replace(/\-/g,' ').split(' ');
      primaryNameArray[0] = primaryNameArray[0][0];
      var primaryNameInitial = titleCase(primaryNameArray.join(' '))

      var totalPublications = [];
      // var s = "՞։՜asd;'\;['/\''сдфсдфявэ';щш;э'սդֆսդֆսդֆ«»խլխլ";
      async.forEachOf([primaryNameInitial].concat(authorNames), function (name, key, callback) {

        // console.log('name',name)
        var nameRet = name ? name.replace(/[^a-z0-9]/gmi, " ") : null;
        var nameReverse = nameRet ? nameRet.split(' ').reverse().join(' ') : null;
        // console.log('nameRet',nameRet, nameReverse)

        if (nameRet && nameRet.length>1) {
          crossrefQuery(nameRet, function (err, publications) {
            if (publications) {
              var publications = publications
                .filter(r => exist_dois[0] ? exist_dois.findIndex(x => x == r.DOI)==-1 : true)
                .filter(r => r.author.findIndex(x =>
                  ((x.given + ' ' + x.family).toLowerCase() == nameRet.toLowerCase()) ||
                  ((x.family + ' ' + x.given).toLowerCase() == nameReverse.toLowerCase())
                )>-1)

              totalPublications = totalPublications.concat(publications);
              callback()
            } else {
              callback()
            }
          });
        } else {
          callback()
        }

      }, function (err, results) {
        cb(err, totalPublications, parentId);
      })
    },

    // .map(function(obj) {
    //   var rObj = obj;
    //   console.log('obj',obj.title)
    //   rObj['name'] = obj ? obj.title[0] : null;
    //   return rObj;
    // })

    // 4. get Peoples objects for authors
    function (publications, parentId: string, cb) {
      if (publications) {
        var authors = publications.map(r => r.author)
        var flattenAuthors = [].concat(...authors).map(r => r.given + ' ' + r.family).filter(r=>r!=undefined)
        const uAuthors: string[] = Array.from(new Set(flattenAuthors));
        people_data.peoples_query_ids(uAuthors, function (err, peoplesQuery) {
          cb(err, publications, peoplesQuery, parentId);
        });
      } else {
        cb(null, null, null, parentId);
      }
    },

    // 5. put Publications
    function (publications, peoplesQuery: objectMini[], parentId: string, cb) {
      var publicationsIds: string[] = [];
      var data: CreatePublication;

      var dateArray: number[];
      var type: number;
      var authors: objectMini[];

      var queryFilter: any;

      if (publications) {

        async.forEachOf(publications, function (publication, key, callback) {

          // query.issued['date-parts'][0]
          dateArray = publication.issued['date-parts'][0];

          switch (publication.type) {
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

          authors = [];
          publication.author.forEach((author, index) => {

            // https://stackoverflow.com/questions/18719383/how-to-filter-an-array-object-by-checking-multiple-values
            queryFilter = peoplesQuery.filter(
              r => {
                var s = r.name.split(' ');
                return (s[0]==author.given && s[1]==author.family) || (s[0]==author.family && s[1]==author.given) ||
                (s[0].charAt(0)==author.given && s[1]==author.family) || (s[0]==author.family && s[1].charAt(0)==author.given)
                // r.name==(author.given + ' ' + author.family)
              }
            )[0];
            authors.push({"_id": queryFilter ? queryFilter._id : null, "name": author.given + ' ' + author.family, "pic": queryFilter ? queryFilter.pic : null})
            // authors.push(queryFilter ? queryFilter : {"_id": null, "name": author.given + ' ' + author.family, "pic": null})
          })

          data = {'type': type,
                  'title': publication.title ? publication.title[0] : "unknown",
                  'parentId': parentId,
                  // 'date': new Date(dateArray[0], dateArray[1], dateArray[2]),
                  'date': new Date(dateArray[0], dateArray[1] ? dateArray[1] : 1, dateArray[2] ? dateArray[2] : 1),
                  'authors': authors,
                  'publisher': publication.publisher,
                  'abstract': publication.abstract,
                  'abstractPic': null,
                  'url': publication.URL,
                  'tags': publication.tags ? publication.tags : [],
                  'doi': publication.DOI,
                  // "projects": event.projects,
                  'fundings': publication.fundings ? publication.fundings : [],
                  // 'pdf': null,

                  'journal': {"name": publication['container-title'] ? publication['container-title'][0] : '', "issn": null},
                  'abbr': publication['short-container-title'] ? publication['short-container-title'][0] : '',

                  'volume': (type!=1 && type!=3) ? (publication.volume ? publication.volume : '') : '',
                  'issue': (type==0) ? (publication.issue ? publication.issue : '') : '',
                  'pages': (type!=5) ? (publication.page ? publication.page : '') : '',
                  'edition': (type==1 || type==2) ? (publication.edition ? publication.edition : '') : '',

                  'referencesCount': publication["references-count"],
                  'citationsCount': publication["is-referenced-by-count"],

                  'ai': null
                 };

          publication_data.put_publication(null, (mode==0) ? 5 : 6, false, data, function (err, publicationId) {
            publicationsIds[key]=publicationId;
            callback(err)
          });

        }, function (err) {
          cb(err, publicationsIds, parentId)
        })

      } else {
        cb(null, null, null);
      }
    },

    // 6. add Publications Suggestions to Profiles
    function (publicationsIds: string[], parentId: string, cb) {
      publication_data.post_suggestions(publicationsIds, parentId, mode, function (err) {
        cb(err, publicationsIds)
      });
    }

    // 7. Email
    // Mode 0: User Originated / 1: AcademigAdmin Originated
    // Email: Most recent (1-3) & Number of pending

    // Email new users: 7 days after creation
    // Scheduler: Every 2.5 minutes

  ],
  function (err, publicationsIds) {
    callback(err, publicationsIds)
  })
}

export function titleCase(str) {
   var splitStr = str.toLowerCase().split(' ');
   for (var i = 0; i < splitStr.length; i++) {
       // You do not need to check if i is larger than splitStr length,
       // as your for does that for you. Assign it back to the array
       splitStr[i] = splitStr[i].charAt(0).toUpperCase() + splitStr[i].substring(1);
   }
   return splitStr.join(' ');
}

function crossrefQuery(name: string, cb) {

  https.get(`https://api.crossref.org/works?rows=500&query.author=` + name + `&mailto=roni.pozner@gmail.com`, (resp) => {
    let data = '';

    // A chunk of data has been recieved.
    resp.on('data', (chunk) => {
      data += chunk;
    });

    // The whole response has been received. Print out the result.
    resp.on('end', () => {
      try{
        var publications = JSON.parse(data).message.items;
        cb(null, publications);
      } catch(e) {
        cb(e);
        return;
      }
      // var publications = JSON.parse(data).message.items;
      // cb(null, publications);
    });

  }).on("error", (err) => {
    cb(err, null, null) // console.log("Error: " + err.message);
  });
}
