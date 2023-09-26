exports.version = '0.1.0';

exports.error = function (code, message) {
    var e = new Error(message);
    // e.code = code;
    return e;
};

exports.send_success = function(res, data) {
    res.writeHead(200, {"Content-Type": "application/json"});
    var output = data;
    res.end(JSON.stringify(output));
    // var output = { error: null, data: data };
    // console.log(JSON.stringify(output))
    // res.end(JSON.stringify(output) + "\n");
}

exports.send_failure = function(res, server_code, err) {
    var code = (err.code) ? err.code : err.name;
    res.writeHead(server_code, { "Content-Type" : "application/json" });
    res.end(JSON.stringify({ error: code, message: err.message }) + "\n");
}

exports.invalid_resource = function() {
    return exports.error("invalid_resource", "the requested resource does not exist.");
}

exports.no_such_item = function() {
    return exports.error("no_such_item", "The specified item does not exist");
}

exports.invalid_privileges = function() {
    return exports.error("invalid_privileges", "User has insufficient privileges.");
}

exports.http_code_for_error = function (err) {
    switch (err.code) {
      case "no_such_item":
        return 403;
      case "invalid_resource":
        return 404;
      case "invalid_email":
        return 400;
    }
    return 503;
}

// function make_error(err, msg) {
//     var e = new Error(msg);
//     e.code = err;
//     return e;
// }
