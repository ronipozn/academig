var helpers = require('./helpers.ts');

var emails = require("../misc/emails.ts");

exports.contactPut = (function (req, res) {
  var getp = req.query;
  var data = req.body;

  // console.log('getp.email',getp.email)
  // console.log('getp.name  ',getp.name)
  console.log('data.subject',data.subject)
  console.log('data.category',data.category)
  console.log('data.message',data.message)

  const msg = {
    // to: getp.email,
    to: "support@academig.com",
    from: "support@academig.com",
    subject: "Subject: " + data.subject,
    // text: data.subject,
    html: "From: " + getp.name + '<br>Category: ' + data.category + '<br><br> ' + data.message,
  };

  emails.send(msg, (err, result) => {
    if (err) {
      helpers.send_failure(res, helpers.http_code_for_error(err), err);
    } else {
      // console.log('res',res)
      helpers.send_success(res);
    }
  });

})
