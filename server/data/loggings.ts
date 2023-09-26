var db = require('../db.ts'),
    async = require('async'),
    backhelp = require("./backend_helpers.ts");

var emails = require("../misc/emails.ts");

var ObjectID = require('mongodb').ObjectID;

exports.version = "0.1.0";

export function put_logging(userId: string, type: number, id: string, message: string, callback) {
  db.logging.insertOne(
     {
       "userId": userId,
       "itemId": ObjectID(id),
       "date": new Date(),
       "type": type,
       "message": message,
     },
     { safe: true },
     callback()
  )
}
